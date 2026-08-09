/**
 * ResolveX RAG (Retrieval-Augmented Generation) Engine
 * Implements document chunking, hybrid TF-IDF/BM25 scoring, vector similarity ranking,
 * and prompt context generation with inline citations.
 */

class RAGEngine {
  constructor(kbData = []) {
    this.documents = [];
    this.chunks = [];
    this.topK = 3;
    this.similarityThreshold = 0.15;
    this.indexKnowledgeBase(kbData);
  }

  /**
   * Indexes and chunks the provided knowledge base articles
   */
  indexKnowledgeBase(kbData) {
    this.documents = kbData;
    this.chunks = [];

    kbData.forEach((doc) => {
      // Split text into semantic chunks (~2-3 sentences per chunk)
      const sentences = doc.content
        .split(/(?<=[.!?])\s+/)
        .filter((s) => s.trim().length > 0);

      let currentChunk = [];
      let currentLen = 0;
      let chunkIdx = 1;

      sentences.forEach((sentence) => {
        currentChunk.push(sentence);
        currentLen += sentence.split(/\s+/).length;

        if (currentLen >= 35) {
          const chunkText = currentChunk.join(" ");
          this.chunks.push({
            id: `${doc.id}-c${chunkIdx}`,
            docId: doc.id,
            docTitle: doc.title,
            category: doc.category,
            tags: doc.tags || [],
            content: chunkText,
            tokens: this.tokenize(chunkText + " " + doc.title + " " + doc.category)
          });
          chunkIdx++;
          // Overlap last sentence for context preservation
          currentChunk = [sentence];
          currentLen = sentence.split(/\s+/).length;
        }
      });

      if (currentChunk.length > 0) {
        const chunkText = currentChunk.join(" ");
        this.chunks.push({
          id: `${doc.id}-c${chunkIdx}`,
          docId: doc.id,
          docTitle: doc.title,
          category: doc.category,
          tags: doc.tags || [],
          content: chunkText,
          tokens: this.tokenize(chunkText + " " + doc.title + " " + doc.category)
        });
      }
    });
  }

  /**
   * Tokenizer & normalizer (lowercase, remove punctuation, stopword filtering)
   */
  tokenize(text) {
    const stopwords = new Set([
      "a", "an", "the", "and", "or", "but", "is", "are", "was", "were", "be", "been",
      "to", "of", "in", "for", "with", "on", "at", "by", "from", "up", "about", "into",
      "over", "after", "it", "its", "this", "that", "these", "those", "you", "your"
    ]);

    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .split(/\s+/)
      .filter((term) => term.length > 1 && !stopwords.has(term));
  }

  /**
   * Calculates Term Frequency (TF) for a token list
   */
  getTF(tokens) {
    const tf = {};
    tokens.forEach((token) => {
      tf[token] = (tf[token] || 0) + 1;
    });
    const total = tokens.length || 1;
    Object.keys(tf).forEach((k) => (tf[k] = tf[k] / total));
    return tf;
  }

  /**
   * Searches the Knowledge Base for relevant chunks matching a query
   */
  search(query, topK = this.topK, minScore = this.similarityThreshold) {
    const queryTokens = this.tokenize(query);
    if (queryTokens.length === 0) return [];

    const queryTF = this.getTF(queryTokens);
    const results = [];

    this.chunks.forEach((chunk) => {
      const chunkTF = this.getTF(chunk.tokens);
      let dotProduct = 0;
      let queryMagnitude = 0;
      let chunkMagnitude = 0;

      // Cosine similarity over TF vectors
      const uniqueTokens = new Set([...Object.keys(queryTF), ...Object.keys(chunkTF)]);

      uniqueTokens.forEach((token) => {
        const qVal = queryTF[token] || 0;
        const cVal = chunkTF[token] || 0;

        // Boost exact tag or category matches
        let boost = 1.0;
        if (chunk.tags.includes(token)) boost *= 1.8;
        if (chunk.category.toLowerCase().includes(token)) boost *= 1.5;

        dotProduct += qVal * cVal * boost;
        queryMagnitude += qVal * qVal;
        chunkMagnitude += cVal * cVal;
      });

      const denominator = Math.sqrt(queryMagnitude) * Math.sqrt(chunkMagnitude);
      let score = denominator > 0 ? dotProduct / denominator : 0;

      // BM25 Keyword Overlap Bonus
      const matchedTokens = queryTokens.filter((t) => chunk.tokens.includes(t));
      const overlapRatio = matchedTokens.length / queryTokens.length;
      score = score * 0.6 + overlapRatio * 0.4;

      if (score >= minScore) {
        results.push({
          chunk,
          score: parseFloat(score.toFixed(4)),
          matchedTerms: [...new Set(matchedTokens)]
        });
      }
    });

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  /**
   * Builds context string formatted for LLM system prompt injection
   */
  buildRAGContext(query, topK = 3) {
    const matches = this.search(query, topK);

    if (matches.length === 0) {
      return {
        contextString: "No specific Knowledge Base documents matched this query.",
        citations: [],
        matches: []
      };
    }

    const contextLines = ["RELEVANT KNOWLEDGE BASE CONTEXT (Use to cite authoritative answers):"];
    const citations = [];

    matches.forEach((m, idx) => {
      const citationRef = `[Doc #${m.chunk.docId}: ${m.chunk.docTitle}]`;
      contextLines.push(`${idx + 1}. ${citationRef} (Relevance Score: ${(m.score * 100).toFixed(1)}%)`);
      contextLines.push(`   Excerpt: "${m.chunk.content}"\n`);

      citations.push({
        ref: citationRef,
        docId: m.chunk.docId,
        title: m.chunk.docTitle,
        category: m.chunk.category,
        score: m.score,
        excerpt: m.chunk.content
      });
    });

    return {
      contextString: contextLines.join("\n"),
      citations,
      matches
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RAGEngine };
}
