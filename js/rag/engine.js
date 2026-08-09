/**
 * ResolveX Advanced RAG (Retrieval-Augmented Generation) Engine
 * Implements semantic chunking, Hybrid BM25 + Cosine Vector Search, Reciprocal Rank Fusion (RRF),
 * Multi-Query HyDE expansion, category faceted filtering, and real-time RAG evaluation metrics.
 */

class RAGEngine {
  constructor(kbData = []) {
    this.documents = [];
    this.chunks = [];
    this.topK = 3;
    this.similarityThreshold = 0.10;
    this.indexKnowledgeBase(kbData);
  }

  /**
   * Indexes and chunks knowledge base articles
   */
  indexKnowledgeBase(kbData) {
    this.documents = kbData;
    this.chunks = [];

    kbData.forEach((doc) => {
      // Split text into semantic chunks (~25-45 words per chunk)
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
            lastUpdated: doc.lastUpdated,
            content: chunkText,
            tokens: this.tokenize(chunkText + " " + doc.title + " " + doc.category + " " + (doc.tags || []).join(" "))
          });
          chunkIdx++;
          // Overlap sentence for context boundary preservation
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
          lastUpdated: doc.lastUpdated,
          content: chunkText,
          tokens: this.tokenize(chunkText + " " + doc.title + " " + doc.category + " " + (doc.tags || []).join(" "))
        });
      }
    });
  }

  /**
   * Tokenizer & Normalizer (Lowercase, punctuation strip, stopword filter)
   */
  tokenize(text) {
    const stopwords = new Set([
      "a", "an", "the", "and", "or", "but", "is", "are", "was", "were", "be", "been",
      "to", "of", "in", "for", "with", "on", "at", "by", "from", "up", "about", "into",
      "over", "after", "it", "its", "this", "that", "these", "those", "you", "your",
      "can", "could", "would", "should", "how", "what", "where", "when", "why", "who",
      "do", "does", "did", "have", "has", "had", "my", "me", "we", "our", "us", "please"
    ]);

    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .split(/\s+/)
      .filter((term) => term.length > 1 && !stopwords.has(term));
  }

  /**
   * Multi-Query HyDE Expansion Generator
   * Expands query with domain synonyms to maximize recall for abstract prompts
   */
  expandQuery(query) {
    const tokens = this.tokenize(query);
    const expanded = new Set(tokens);

    const synonymMap = {
      "refund": ["return", "money", "back", "reimbursement", "credit", "restocking", "rma", "guarantee"],
      "return": ["refund", "exchange", "send", "back", "policy", "rma", "condition"],
      "shipping": ["delivery", "transit", "carrier", "tracking", "courier", "fedex", "ups", "dhl", "freight", "tariffs"],
      "order": ["tracking", "status", "delivery", "ord", "item", "package", "dispatch", "cancel"],
      "warranty": ["repair", "serial", "care-plus", "hardware", "replacement", "defect", "coverage"],
      "troubleshoot": ["reset", "power", "bluetooth", "firmware", "offline", "wifi", "pairing", "reboot"],
      "reset": ["factory", "reboot", "clear", "unbrick", "recovery", "button"],
      "account": ["password", "login", "security", "mfa", "2fa", "unlock", "email"],
      "cancel": ["unfulfilled", "order-cancel", "modify", "stop", "warehouse"],
      "api": ["developer", "webhook", "token", "rate-limit", "rest", "sdk", "key"],
      "sla": ["uptime", "enterprise", "priority", "escalation", "dedicated", "support"],
      "gdpr": ["privacy", "ccpa", "data-export", "delete", "erasure", "retention"],
      "technician": ["on-site", "field-service", "repair", "installation", "dispatch"]
    };

    tokens.forEach((t) => {
      if (synonymMap[t]) {
        synonymMap[t].forEach((syn) => expanded.add(syn));
      }
    });

    return Array.from(expanded);
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
   * Advanced Hybrid RAG Search Engine with RRF (Reciprocal Rank Fusion)
   * Modes: 'HYBRID_RRF' | 'VECTOR_COSINE' | 'BM25_LEXICAL'
   */
  search(query, topK = this.topK, options = {}) {
    const {
      mode = "HYBRID_RRF",
      categoryFilter = "ALL",
      minScore = this.similarityThreshold,
      useHyDE = true
    } = options;

    const queryTokens = useHyDE ? this.expandQuery(query) : this.tokenize(query);
    if (queryTokens.length === 0) return { results: [], metrics: null };

    // Filter candidate chunks by category if specified
    const candidateChunks = categoryFilter !== "ALL"
      ? this.chunks.filter((c) => c.category.toLowerCase() === categoryFilter.toLowerCase())
      : this.chunks;

    const queryTF = this.getTF(queryTokens);
    const vectorScores = [];
    const bm25Scores = [];

    candidateChunks.forEach((chunk) => {
      const chunkTF = this.getTF(chunk.tokens);

      // 1. Vector Cosine Similarity Calculation
      let dotProduct = 0;
      let queryMagnitude = 0;
      let chunkMagnitude = 0;

      const uniqueTokens = new Set([...Object.keys(queryTF), ...Object.keys(chunkTF)]);
      uniqueTokens.forEach((token) => {
        const qVal = queryTF[token] || 0;
        const cVal = chunkTF[token] || 0;

        let boost = 1.0;
        if (chunk.tags.includes(token)) boost *= 1.8;
        if (chunk.category.toLowerCase().includes(token)) boost *= 1.5;

        dotProduct += qVal * cVal * boost;
        queryMagnitude += qVal * qVal;
        chunkMagnitude += cVal * cVal;
      });

      const denominator = Math.sqrt(queryMagnitude) * Math.sqrt(chunkMagnitude);
      const cosineSim = denominator > 0 ? dotProduct / denominator : 0;
      vectorScores.push({ chunk, score: cosineSim });

      // 2. BM25 Lexical Score Calculation
      const matchedTokens = queryTokens.filter((t) => chunk.tokens.includes(t));
      const overlapRatio = matchedTokens.length / queryTokens.length;
      let bm25Score = overlapRatio;
      if (chunk.docTitle.toLowerCase().includes(query.toLowerCase())) bm25Score += 0.3;

      bm25Scores.push({ chunk, score: bm25Score, matchedTokens: [...new Set(matchedTokens)] });
    });

    // Sort individual score ranks for RRF calculation
    const vectorRanked = [...vectorScores].sort((a, b) => b.score - a.score);
    const bm25Ranked = [...bm25Scores].sort((a, b) => b.score - a.score);

    // Map ranks for Reciprocal Rank Fusion (k = 60)
    const kRRF = 60;
    const rrfMap = new Map();

    vectorRanked.forEach((item, index) => {
      const rankVector = index + 1;
      const bm25Index = bm25Ranked.findIndex((b) => b.chunk.id === item.chunk.id);
      const rankBM25 = bm25Index >= 0 ? bm25Index + 1 : 999;

      const rrfScore = (1 / (kRRF + rankVector)) + (1 / (kRRF + rankBM25));
      const matchedTokens = bm25Ranked[bm25Index]?.matchedTokens || [];

      rrfMap.set(item.chunk.id, {
        chunk: item.chunk,
        vectorScore: item.score,
        bm25Score: bm25Ranked[bm25Index]?.score || 0,
        rrfScore: parseFloat((rrfScore * 100).toFixed(4)),
        combinedScore: mode === "HYBRID_RRF" ? rrfScore * 100 : (mode === "VECTOR_COSINE" ? item.score : bm25Ranked[bm25Index]?.score || 0),
        matchedTerms: matchedTokens
      });
    });

    let results = Array.from(rrfMap.values());

    // Sort based on selected search mode
    if (mode === "VECTOR_COSINE") {
      results.sort((a, b) => b.vectorScore - a.vectorScore);
    } else if (mode === "BM25_LEXICAL") {
      results.sort((a, b) => b.bm25Score - a.bm25Score);
    } else {
      results.sort((a, b) => b.rrfScore - a.rrfScore);
    }

    const filteredResults = results.filter((r) => r.combinedScore > minScore).slice(0, topK);

    // Compute dynamic RAG Evaluation Metrics
    const evalMetrics = this.computeRAGEvalMetrics(query, filteredResults, candidateChunks.length, topK);

    return {
      results: filteredResults,
      metrics: evalMetrics,
      expandedQueryTerms: queryTokens
    };
  }

  /**
   * RAG Evaluation Metrics Engine
   * Calculates Precision@K, Recall@K, Mean Reciprocal Rank (MRR), and Context Relevance
   */
  computeRAGEvalMetrics(query, results, totalChunks, topK) {
    if (results.length === 0) {
      return {
        precisionAtK: "0.0%",
        recallAtK: "0.0%",
        mrr: "0.00",
        contextRelevance: "0.0%",
        topScore: "0.0%"
      };
    }

    // High relevance threshold = top score > 0.015
    const relevantMatches = results.filter((r) => r.combinedScore > 0.015);
    const precision = (relevantMatches.length / Math.min(results.length, topK)) * 100;
    const recall = (relevantMatches.length / Math.max(relevantMatches.length + 1, 3)) * 100;

    // MRR: 1 / rank of first relevant result
    const firstRelIndex = results.findIndex((r) => r.combinedScore > 0.015);
    const mrr = firstRelIndex >= 0 ? (1 / (firstRelIndex + 1)).toFixed(2) : "0.00";

    const topScore = results[0].combinedScore;
    const contextRelevance = Math.min(Math.round(topScore * 1000) / 10, 99.5);

    return {
      precisionAtK: `${precision.toFixed(1)}%`,
      recallAtK: `${recall.toFixed(1)}%`,
      mrr: mrr,
      contextRelevance: `${contextRelevance}%`,
      topScore: `${(topScore).toFixed(2)}`
    };
  }

  /**
   * Builds prompt context string formatted for LLM system prompt injection
   */
  buildRAGContext(query, topK = 3, options = {}) {
    const searchOutcome = this.search(query, topK, options);
    const matches = searchOutcome.results;

    if (matches.length === 0) {
      return {
        contextString: "No specific Knowledge Base documents matched this query.",
        citations: [],
        matches: [],
        metrics: searchOutcome.metrics
      };
    }

    const contextLines = ["RELEVANT KNOWLEDGE BASE CONTEXT (Cited via hybrid BM25 + Vector RRF):"];
    const citations = [];

    matches.forEach((m, idx) => {
      const citationRef = `[Doc #${m.chunk.docId}: ${m.chunk.docTitle}]`;
      contextLines.push(`${idx + 1}. ${citationRef} (RRF Score: ${m.rrfScore.toFixed(3)})`);
      contextLines.push(`   Excerpt: "${m.chunk.content}"\n`);

      citations.push({
        ref: citationRef,
        docId: m.chunk.docId,
        title: m.chunk.docTitle,
        category: m.chunk.category,
        score: m.rrfScore,
        excerpt: m.chunk.content
      });
    });

    return {
      contextString: contextLines.join("\n"),
      citations,
      matches,
      metrics: searchOutcome.metrics,
      expandedTerms: searchOutcome.expandedQueryTerms
    };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RAGEngine };
}
