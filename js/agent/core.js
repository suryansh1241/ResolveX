/**
 * ResolveX Core Customer Support Agent Engine
 * Manages reasoning loop, RAG hybrid search integration, MCP tool dispatching,
 * multi-turn conversational state, and action card synthesis.
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
Your goal is to solve customer problems quickly using authoritative knowledge from the Knowledge Base (RAG) and performing real-world actions via standard Model Context Protocol (MCP) tools.`;

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

    // Step 2: Perform RAG Hybrid Knowledge Base search
    ragResult = this.ragEngine.buildRAGContext(userText, 3, { mode: "HYBRID_RRF" });

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
    } else if (intentAnalysis.intent === "CANCEL_ORDER" && intentAnalysis.orderId) {
      const toolRes = await this.mcpClient.callTool("cancel_order", {
        orderId: intentAnalysis.orderId,
        reason: userText
      });
      executedToolCalls.push({
        toolName: "cancel_order",
        args: { orderId: intentAnalysis.orderId },
        result: toolRes
      });
      if (toolRes.result && !toolRes.result.isError) {
        actionData = { type: "CANCEL_CARD", data: toolRes.result.data };
      }
    } else if (intentAnalysis.intent === "GENERATE_API_KEY") {
      const toolRes = await this.mcpClient.callTool("generate_api_key", {
        customerId: this.currentCustomer.id,
        keyName: "Support Chat Gateway Key"
      });
      executedToolCalls.push({
        toolName: "generate_api_key",
        args: { customerId: this.currentCustomer.id },
        result: toolRes
      });
      if (toolRes.result && !toolRes.result.isError) {
        actionData = { type: "API_KEY_CARD", data: toolRes.result.data };
      }
    } else if (intentAnalysis.intent === "SHIPPING_RATES") {
      const toolRes = await this.mcpClient.callTool("lookup_shipping_rate", {
        countryCode: intentAnalysis.countryCode || "US"
      });
      executedToolCalls.push({
        toolName: "lookup_shipping_rate",
        args: { countryCode: intentAnalysis.countryCode || "US" },
        result: toolRes
      });
      if (toolRes.result && !toolRes.result.isError) {
        actionData = { type: "SHIPPING_RATE_CARD", data: toolRes.result.data };
      }
    } else if (intentAnalysis.intent === "FIELD_TECH") {
      const toolRes = await this.mcpClient.callTool("schedule_field_technician", {
        customerId: this.currentCustomer.id,
        preferredDate: "2026-08-12",
        issueDescription: userText
      });
      executedToolCalls.push({
        toolName: "schedule_field_technician",
        args: { customerId: this.currentCustomer.id, preferredDate: "2026-08-12" },
        result: toolRes
      });
      if (toolRes.result && !toolRes.result.isError) {
        actionData = { type: "TECH_CARD", data: toolRes.result.data };
      }
    } else if (intentAnalysis.intent === "SYSTEM_HEALTH") {
      const toolRes = await this.mcpClient.callTool("fetch_system_health", {
        includeRegions: true
      });
      executedToolCalls.push({
        toolName: "fetch_system_health",
        args: { includeRegions: true },
        result: toolRes
      });
      if (toolRes.result && !toolRes.result.isError) {
        actionData = { type: "HEALTH_CARD", data: toolRes.result.data };
      }
    } else if (intentAnalysis.intent === "DATA_EXPORT") {
      const toolRes = await this.mcpClient.callTool("export_customer_data", {
        customerId: this.currentCustomer.id
      });
      executedToolCalls.push({
        toolName: "export_customer_data",
        args: { customerId: this.currentCustomer.id },
        result: toolRes
      });
      if (toolRes.result && !toolRes.result.isError) {
        actionData = { type: "DATA_EXPORT_CARD", data: toolRes.result.data };
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
   * Intent parsing engine
   */
  analyzeIntent(text) {
    const lower = text.toLowerCase();

    // Regex for Order ID: e.g. ORD-8921, #8921, ORD8921
    const orderMatch = text.match(/ORD[-#]?\s?(\d{4})/i) || text.match(/#(\d{4})/);
    const serialMatch = text.match(/WN[-#]?\s?(\d{5})/i);

    let orderId = orderMatch ? (orderMatch[0].startsWith('ORD') ? orderMatch[0].toUpperCase().replace(/\s/g, '') : `ORD-${orderMatch[1]}`) : null;
    let serialNumber = serialMatch ? serialMatch[0].toUpperCase().replace(/\s/g, '') : null;

    if (lower.includes("cancel") && (lower.includes("order") || orderId)) {
      return { intent: "CANCEL_ORDER", orderId: orderId || "ORD-3309" };
    }

    if (lower.includes("api key") || lower.includes("developer token") || lower.includes("webhook key")) {
      return { intent: "GENERATE_API_KEY" };
    }

    if (lower.includes("shipping rate") || lower.includes("postage cost") || lower.includes("international rate")) {
      let countryCode = "US";
      if (lower.includes("japan") || lower.includes("jp")) countryCode = "JP";
      if (lower.includes("europe") || lower.includes("eu") || lower.includes("ireland")) countryCode = "EU";
      if (lower.includes("uk") || lower.includes("britain")) countryCode = "UK";
      if (lower.includes("canada") || lower.includes("ca")) countryCode = "CA";
      return { intent: "SHIPPING_RATES", countryCode };
    }

    if (lower.includes("technician") || lower.includes("on-site") || lower.includes("field service") || lower.includes("repair appointment")) {
      return { intent: "FIELD_TECH" };
    }

    if (lower.includes("system health") || lower.includes("cluster status") || lower.includes("uptime") || lower.includes("server status")) {
      return { intent: "SYSTEM_HEALTH" };
    }

    if (lower.includes("gdpr") || lower.includes("data export") || lower.includes("export my data") || lower.includes("privacy archive")) {
      return { intent: "DATA_EXPORT" };
    }

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
   * Synthesizes final response text
   */
  synthesizeResponse(userText, intent, ragResult, toolCalls, actionData) {
    let text = "";

    if (intent.intent === "CANCEL_ORDER" && actionData && actionData.data) {
      const c = actionData.data;
      text = `Order **${c.orderId}** has been cancelled via our MCP Order Protocol Server.\n\n`;
      text += `• **Status**: ${c.status}\n`;
      text += `• **Refund Issued**: $${c.refundAmount.toFixed(2)}\n`;
      text += `• **Notes**: ${c.message}\n`;
      return text;
    }

    if (intent.intent === "GENERATE_API_KEY" && actionData && actionData.data) {
      const k = actionData.data;
      text = `Provisioned a new Developer API Key for **${this.currentCustomer.name}**:\n\n`;
      text += `• **Key ID**: \`${k.keyId}\`\n`;
      text += `• **Key Label**: ${k.name}\n`;
      text += `• **Secret Token**: \`${k.secret}\`\n`;
      text += `• **Rate Limit**: ${k.rateLimit}\n\n`;
      text += `*Keep your secret token safe. Store it securely in your server environment variables.*`;
      return text;
    }

    if (intent.intent === "SHIPPING_RATES" && actionData && actionData.data) {
      const s = actionData.data;
      text = `Retrieved live shipping rates for country zone **${s.country}**:\n\n`;
      text += `• **Carrier**: ${s.rates.carrier}\n`;
      text += `• **Standard Shipping**: ${s.rates.standard === 0 ? "FREE (Orders $50+)" : `$${s.rates.standard.toFixed(2)}`}\n`;
      text += `• **Express Shipping**: $${s.rates.express.toFixed(2)}\n`;
      return text;
    }

    if (intent.intent === "FIELD_TECH" && actionData && actionData.data) {
      const d = actionData.data;
      text = `Scheduled On-Site Field Technician Visit:\n\n`;
      text += `• **Dispatch ID**: \`${d.dispatchId}\`\n`;
      text += `• **Scheduled Date**: **${d.scheduledDate}**\n`;
      text += `• **Assigned Tech**: ${d.technician}\n`;
      text += `• **Notes**: ${d.notes}\n`;
      return text;
    }

    if (intent.intent === "SYSTEM_HEALTH" && actionData && actionData.data) {
      const h = actionData.data;
      text = `Current ResolveX Infrastructure Status (**${h.status}**):\n\n`;
      text += `• **Cluster Uptime**: ${h.uptime}\n`;
      text += `• **Average Latency**: ${h.clusterLatencyMs}ms\n`;
      text += `• **Active Cluster Nodes**: ${h.activeNodes}\n`;
      text += `• **RAG Knowledge Engine**: ${h.ragEngineStatus}\n`;
      return text;
    }

    if (intent.intent === "DATA_EXPORT" && actionData && actionData.data) {
      const e = actionData.data;
      text = `Generated GDPR Compliance Data Export Archive for **${e.customer.name}** (${e.customer.id}):\n\n`;
      text += `• **Orders Archived**: ${e.orders.length}\n`;
      text += `• **Tickets Archived**: ${e.tickets.length}\n`;
      text += `• **Compliance Standard**: ${e.compliance}\n`;
      text += `• **Export Timestamp**: ${e.exportedAt}\n`;
      return text;
    }

    if (intent.intent === "ORDER_INQUIRY" && actionData && actionData.data) {
      const o = actionData.data;
      text = `Hello **${this.currentCustomer.name}**! I checked order **${o.id}** via our MCP Order Tool:\n\n`;
      text += `• **Status**: ${o.status}\n`;
      text += `• **Carrier**: ${o.carrier} (${o.trackingNumber})\n`;
      text += `• **Estimated Delivery**: ${o.estimatedDelivery}\n`;
      text += `• **Items**: ${o.items.map(i => i.name).join(", ")}\n\n`;
      text += `You can track the live movement using your tracking link above.`;
      return text;
    }

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

    if (intent.intent === "ESCALATE_TICKET" && actionData && actionData.data) {
      const t = actionData.data;
      text = `I have opened a priority support ticket for you:\n\n`;
      text += `• **Ticket ID**: \`${t.id}\`\n`;
      text += `• **Priority**: **${t.priority}**\n`;
      text += `• **Assigned Team**: ${t.assignedAgent}\n\n`;
      text += `A specialist will review your history and follow up within 2 hours.`;
      return text;
    }

    if (ragResult && ragResult.citations.length > 0) {
      const topCitation = ragResult.citations[0];
      text = `Based on our official knowledge base (${topCitation.ref}):\n\n`;
      text += `${topCitation.excerpt}\n\n`;

      if (ragResult.citations.length > 1) {
        text += `*Additional Context (${ragResult.citations[1].ref}):*\n`;
        text += `${ragResult.citations[1].excerpt}\n\n`;
      }

      text += `Is there anything specific you would like me to assist you with regarding this?`;
      return text;
    }

    return `Thank you for reaching out to ResolveX Customer Support! I can assist you with tracking orders, returns, API keys, technician dispatches, or technical troubleshooting. How can I help you today?`;
  }

  calculateConfidence(ragResult, toolCalls) {
    let score = 70;
    if (toolCalls.length > 0) score += 20;
    if (ragResult && ragResult.matches.length > 0) score += Math.round(ragResult.matches[0].score * 2);
    return Math.min(score, 99);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CustomerSupportAgent };
}
