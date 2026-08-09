/**
 * ResolveX Core Customer Support Agent Engine
 * Manages reasoning loop, RAG search integration, MCP tool dispatching,
 * system prompt formatting, and multi-turn conversational state.
 */

class CustomerSupportAgent {
  constructor(mcpClient, ragEngine) {
    this.mcpClient = mcpClient;
    this.ragEngine = ragEngine;

    this.currentCustomer = {
      name: "Alex Rivera",
      id: "CUST-101",
      email: "alex.rivera@example.com",
      tier: "Pro Member"
    };

    this.systemPersona = `You are ResolveX AI Support Agent, an intelligent, polite, and efficient enterprise support assistant.
Your goal is to solve customer problems quickly using authoritative knowledge from the Knowledge Base (RAG) and performing real-world actions via standard Model Context Protocol (MCP) tools.

GUIDELINES:
1. Always cite authoritative source documents when answering policy or technical questions using format: [Doc <id>: "<title>"].
2. Use MCP tools whenever order status, refunds, tickets, or warranties are queried.
3. Maintain a warm, empathetic, and professional tone.
4. If a problem cannot be resolved or requires human supervisor action, offer to open a support ticket.`;

    this.chatHistory = [];
  }

  /**
   * Primary Entry Point: Process user input message
   */
  async processUserMessage(userText, activeContext = {}) {
    const userMessage = {
      role: "user",
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    this.chatHistory.push(userMessage);

    // Step 1: Detect intent and identify required MCP tool invocations
    const intentAnalysis = this.analyzeIntent(userText);
    const executedToolCalls = [];
    let ragResult = null;

    // Step 2: Perform RAG Knowledge Base search
    ragResult = this.ragEngine.buildRAGContext(userText, 3);

    if (ragResult.matches.length > 0) {
      // Record RAG invocation as MCP tool call
      const mcpRagRes = await this.mcpClient.callTool("search_knowledge_base", {
        query: userText,
        topK: 3
      });
      executedToolCalls.push({
        toolName: "search_knowledge_base",
        args: { query: userText },
        result: mcpRagRes
      });
    }

    // Step 3: Dispatch domain-specific MCP tool calls based on intent
    let actionData = null;

    if (intentAnalysis.intent === "ORDER_INQUIRY" && intentAnalysis.orderId) {
      const toolRes = await this.mcpClient.callTool("get_order_details", {
        orderId: intentAnalysis.orderId
      });
      executedToolCalls.push({
        toolName: "get_order_details",
        args: { orderId: intentAnalysis.orderId },
        result: toolRes
      });
      if (toolRes.result && !toolRes.result.isError) {
        actionData = { type: "ORDER_CARD", data: toolRes.result.data };
      }
    } else if (intentAnalysis.intent === "REFUND_REQUEST" && intentAnalysis.orderId) {
      const toolRes = await this.mcpClient.callTool("process_refund_request", {
        orderId: intentAnalysis.orderId,
        reason: userText,
        customerName: this.currentCustomer.name
      });
      executedToolCalls.push({
        toolName: "process_refund_request",
        args: { orderId: intentAnalysis.orderId, reason: userText },
        result: toolRes
      });
      if (toolRes.result) {
        actionData = { type: "REFUND_CARD", data: toolRes.result.data };
      }
    } else if (intentAnalysis.intent === "WARRANTY_CHECK" && intentAnalysis.serialNumber) {
      const toolRes = await this.mcpClient.callTool("check_product_warranty", {
        serialNumber: intentAnalysis.serialNumber
      });
      executedToolCalls.push({
        toolName: "check_product_warranty",
        args: { serialNumber: intentAnalysis.serialNumber },
        result: toolRes
      });
      if (toolRes.result && !toolRes.result.isError) {
        actionData = { type: "WARRANTY_CARD", data: toolRes.result.data };
      }
    } else if (intentAnalysis.intent === "ESCALATE_TICKET") {
      const toolRes = await this.mcpClient.callTool("create_support_ticket", {
        customerName: this.currentCustomer.name,
        subject: `Support Escalation: ${userText.slice(0, 40)}...`,
        category: "General Support",
        priority: "High",
        details: userText
      });
      executedToolCalls.push({
        toolName: "create_support_ticket",
        args: { customerName: this.currentCustomer.name, subject: "Support Escalation" },
        result: toolRes
      });
      if (toolRes.result && toolRes.result.data) {
        actionData = { type: "TICKET_CARD", data: toolRes.result.data };
      }
    }

    // Step 4: Synthesize dynamic response text
    const responseText = this.synthesizeResponse(
      userText,
      intentAnalysis,
      ragResult,
      executedToolCalls,
      actionData
    );

    const agentMessage = {
      role: "assistant",
      content: responseText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      toolCalls: executedToolCalls,
      citations: ragResult ? ragResult.citations : [],
      actionData: actionData,
      confidenceScore: this.calculateConfidence(ragResult, executedToolCalls)
    };

    this.chatHistory.push(agentMessage);
    return agentMessage;
  }

  /**
   * Intent parsing engine (Extracts order IDs, serials, refund triggers, ticket triggers)
   */
  analyzeIntent(text) {
    const lower = text.toLowerCase();

    // Regex for Order ID: e.g. ORD-8921, #8921, ORD8921
    const orderMatch = text.match(/ORD[-#]?\s?(\d{4})/i) || text.match(/#(\d{4})/);
    const serialMatch = text.match(/WN[-#]?\s?(\d{5})/i);

    let orderId = orderMatch ? (orderMatch[0].startsWith('ORD') ? orderMatch[0].toUpperCase().replace(/\s/g, '') : `ORD-${orderMatch[1]}`) : null;
    let serialNumber = serialMatch ? serialMatch[0].toUpperCase().replace(/\s/g, '') : null;

    if (lower.includes("refund") || lower.includes("return") || lower.includes("money back")) {
      return { intent: "REFUND_REQUEST", orderId: orderId || "ORD-8921" };
    }

    if (lower.includes("order") || lower.includes("shipping") || lower.includes("where is my") || lower.includes("track") || orderId) {
      return { intent: "ORDER_INQUIRY", orderId: orderId || "ORD-8921" };
    }

    if (lower.includes("warranty") || lower.includes("serial") || lower.includes("repair") || serialNumber) {
      return { intent: "WARRANTY_CHECK", serialNumber: serialNumber || "WN-99812" };
    }

    if (lower.includes("human") || lower.includes("escalate") || lower.includes("agent") || lower.includes("complaint") || lower.includes("ticket")) {
      return { intent: "ESCALATE_TICKET" };
    }

    if (lower.includes("troubleshoot") || lower.includes("reset") || lower.includes("bluetooth") || lower.includes("firmware") || lower.includes("how to")) {
      return { intent: "TECHNICAL_SUPPORT" };
    }

    return { intent: "GENERAL_FAQ" };
  }

  /**
   * Synthesizes final response text with rich citations and context
   */
  synthesizeResponse(userText, intent, ragResult, toolCalls, actionData) {
    let text = "";

    // 1. Order inquiry handling
    if (intent.intent === "ORDER_INQUIRY" && actionData && actionData.data) {
      const o = actionData.data;
      text = `Hello **${this.currentCustomer.name}**! I checked order **${o.id}** via our MCP Order Tool:\n\n`;
      text += `• **Status**: ${o.status}\n`;
      text += `• **Carrier**: ${o.carrier} (${o.trackingNumber})\n`;
      text += `• **Estimated Delivery**: ${o.estimatedDelivery}\n`;
      text += `• **Items**: ${o.items.map(i => i.name).join(", ")}\n\n`;
      text += `You can track the live movement using your tracking link above. Let me know if you need to update the delivery address!`;
      return text;
    }

    // 2. Refund request handling
    if (intent.intent === "REFUND_REQUEST" && actionData && actionData.data) {
      const r = actionData.data;
      text = `I have processed your return request for **${r.orderId}** through our MCP Policy Server:\n\n`;
      text += `• **Refund ID**: \`${r.refundId}\`\n`;
      text += `• **Decision**: **${r.status}**\n`;
      text += `• **Details**: ${r.message}\n\n`;
      if (ragResult.citations.length > 0) {
        text += `*According to ${ragResult.citations[0].ref}: Returns within 30 days are eligible for a 100% refund with $0 restocking fees.*`;
      }
      return text;
    }

    // 3. Warranty check handling
    if (intent.intent === "WARRANTY_CHECK" && actionData && actionData.data) {
      const w = actionData.data;
      text = `Here are the warranty details for serial number **${w.serialNumber}**:\n\n`;
      text += `• **Product**: ${w.productName}\n`;
      text += `• **Status**: **${w.status}** (Expires ${w.expiresAt})\n`;
      text += `• **Care+ Coverage**: ${w.carePlusCovered ? "✅ Covered (Includes Accidental Damage)" : "Standard Limited Manufacturer Warranty"}\n\n`;
      if (ragResult.citations.length > 0) {
        text += `*Reference: ${ragResult.citations[0].ref}*`;
      }
      return text;
    }

    // 4. Ticket escalation handling
    if (intent.intent === "ESCALATE_TICKET" && actionData && actionData.data) {
      const t = actionData.data;
      text = `I have opened a priority support ticket for you:\n\n`;
      text += `• **Ticket ID**: \`${t.id}\`\n`;
      text += `• **Priority**: **${t.priority}**\n`;
      text += `• **Assigned Team**: ${t.assignedAgent}\n\n`;
      text += `A specialist will review your history and follow up within 2 hours.`;
      return text;
    }

    // 5. RAG Knowledge Base grounded response
    if (ragResult && ragResult.citations.length > 0) {
      const topCitation = ragResult.citations[0];
      text = `Based on our official knowledge base (${topCitation.ref}):\n\n`;
      text += `${topCitation.excerpt}\n\n`;

      if (ragResult.citations.length > 1) {
        text += `*Additional Information (${ragResult.citations[1].ref}):*\n`;
        text += `${ragResult.citations[1].excerpt}\n\n`;
      }

      text += `Is there anything specific you would like me to assist you with regarding this?`;
      return text;
    }

    // Fallback response
    return `Thank you for reaching out to ResolveX Customer Support! I can assist you with tracking orders, processing returns, hardware warranties, or technical troubleshooting. How can I help you today?`;
  }

  /**
   * Calculates dynamic AI confidence rating (0 - 100%)
   */
  calculateConfidence(ragResult, toolCalls) {
    let score = 70;
    if (toolCalls.length > 0) score += 20;
    if (ragResult && ragResult.matches.length > 0) score += Math.round(ragResult.matches[0].score * 10);
    return Math.min(score, 99);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CustomerSupportAgent };
}
