/**
 * ResolveX Model Context Protocol (MCP) Server
 * Standard JSON-RPC 2.0 implementation exposing tools, resources, subscriptions,
 * sampling, and prompt templates for Customer Support Agent execution.
 */

class MCPServer {
  constructor(db, ragEngine) {
    this.db = db;
    this.ragEngine = ragEngine;
    this.serverInfo = {
      name: "ResolveX-CustomerSupport-MCPServer",
      version: "2.0.0",
      protocolVersion: "2024-11-05"
    };

    this.subscriptions = new Set();
    this.tools = this.initializeTools();
    this.resources = this.initializeResources();
    this.prompts = this.initializePrompts();
    this.onLogCallback = null;
  }

  /**
   * Registers callback for live JSON-RPC protocol inspection
   */
  setLogger(callback) {
    this.onLogCallback = callback;
  }

  logProtocol(direction, method, data) {
    if (this.onLogCallback) {
      this.onLogCallback({
        timestamp: new Date().toISOString(),
        direction, // 'REQUEST' | 'RESPONSE' | 'NOTIFICATION'
        method,
        data
      });
    }
  }

  /**
   * Defines 12 standard MCP Tools with JSON Schema parameters
   */
  initializeTools() {
    return [
      {
        name: "search_knowledge_base",
        description: "Queries the RAG Knowledge Base via Hybrid BM25+Vector RRF for policies, technical FAQs, and guides.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query or keywords" },
            topK: { type: "integer", description: "Top passages to retrieve (default: 3)" },
            categoryFilter: { type: "string", description: "Optional category filter (Shipping, Returns, Technical, Billing, Security, Warranty)" }
          },
          required: ["query"]
        }
      },
      {
        name: "get_order_details",
        description: "Retrieves order status, line items, carrier tracking number, and delivery date by Order ID.",
        inputSchema: {
          type: "object",
          properties: {
            orderId: { type: "string", description: "Order reference ID (e.g. ORD-8921)" }
          },
          required: ["orderId"]
        }
      },
      {
        name: "process_refund_request",
        description: "Evaluates return policy rules and authorizes a full or partial refund for an order.",
        inputSchema: {
          type: "object",
          properties: {
            orderId: { type: "string", description: "Order ID to refund" },
            reason: { type: "string", description: "Reason for return" },
            customerName: { type: "string", description: "Name of customer requesting refund" }
          },
          required: ["orderId", "reason"]
        }
      },
      {
        name: "create_support_ticket",
        description: "Escalates an unresolved issue to human customer support tier by creating a priority ticket.",
        inputSchema: {
          type: "object",
          properties: {
            customerName: { type: "string", description: "Customer name" },
            subject: { type: "string", description: "Brief issue summary header" },
            category: { type: "string", description: "Category (Technical, Billing, Shipping, Warranty, Field Service)" },
            priority: { type: "string", enum: ["Low", "Medium", "High", "Urgent"], description: "Urgency priority level" },
            details: { type: "string", description: "Detailed conversation summary and customer problem" }
          },
          required: ["customerName", "subject", "category", "details"]
        }
      },
      {
        name: "check_product_warranty",
        description: "Checks product warranty coverage, expiration date, and Care+ status by hardware Serial Number.",
        inputSchema: {
          type: "object",
          properties: {
            serialNumber: { type: "string", description: "Product serial number (e.g. WN-99812)" }
          },
          required: ["serialNumber"]
        }
      },
      {
        name: "update_customer_profile",
        description: "Updates customer delivery address, phone number, or tier in the database.",
        inputSchema: {
          type: "object",
          properties: {
            customerId: { type: "string", description: "Customer ID (e.g. CUST-101)" },
            newAddress: { type: "string", description: "Updated delivery address" },
            newPhone: { type: "string", description: "Updated phone number" }
          },
          required: ["customerId"]
        }
      },
      {
        name: "cancel_order",
        description: "Cancels an unfulfilled processing order for a 100% full refund.",
        inputSchema: {
          type: "object",
          properties: {
            orderId: { type: "string", description: "Order ID to cancel (e.g. ORD-3309)" },
            reason: { type: "string", description: "Reason for cancellation" }
          },
          required: ["orderId"]
        }
      },
      {
        name: "generate_api_key",
        description: "Provisions a new developer API access key for enterprise integration.",
        inputSchema: {
          type: "object",
          properties: {
            customerId: { type: "string", description: "Customer ID" },
            keyName: { type: "string", description: "Label for the API Key (e.g. Production Gateway)" }
          },
          required: ["customerId", "keyName"]
        }
      },
      {
        name: "lookup_shipping_rate",
        description: "Calculates express and standard shipping courier rates for destination countries.",
        inputSchema: {
          type: "object",
          properties: {
            countryCode: { type: "string", description: "2-letter country code (US, CA, EU, JP, UK)" }
          },
          required: ["countryCode"]
        }
      },
      {
        name: "schedule_field_technician",
        description: "Books an on-site hardware technician dispatch appointment for installation or repair.",
        inputSchema: {
          type: "object",
          properties: {
            customerId: { type: "string", description: "Customer ID" },
            preferredDate: { type: "string", description: "Requested date (YYYY-MM-DD)" },
            issueDescription: { type: "string", description: "Hardware issue description" }
          },
          required: ["customerId", "preferredDate", "issueDescription"]
        }
      },
      {
        name: "fetch_system_health",
        description: "Queries real-time infrastructure cluster status, uptime, node latency, and operational health.",
        inputSchema: {
          type: "object",
          properties: {
            includeRegions: { type: "boolean", description: "Whether to return regional latency pings" }
          }
        }
      },
      {
        name: "export_customer_data",
        description: "Generates a complete GDPR / CCPA compliance data export archive for a customer account.",
        inputSchema: {
          type: "object",
          properties: {
            customerId: { type: "string", description: "Customer ID to export data for" }
          },
          required: ["customerId"]
        }
      }
    ];
  }

  /**
   * Initializes 5 accessible MCP Resources
   */
  initializeResources() {
    return [
      {
        uri: "resource://docs/return_policy",
        name: "30-Day Official Return Policy Document",
        description: "Full text of legal 30-day warranty and return policy",
        mimeType: "text/markdown"
      },
      {
        uri: "resource://docs/shipping_faq",
        name: "Global Shipping FAQ & Transit Times",
        description: "Courier transit standards and international shipping regulations",
        mimeType: "text/markdown"
      },
      {
        uri: "resource://system/health_status",
        name: "Live System Cluster Operational Status",
        description: "Real-time infrastructure health, node latency, and uptime SLA metrics",
        mimeType: "application/json"
      },
      {
        uri: "resource://policies/enterprise_sla",
        name: "Enterprise 99.9% SLA & Uptime Guarantee Policy",
        description: "SLA terms, credit compensation schedules, and priority response response commitments",
        mimeType: "text/markdown"
      },
      {
        uri: "resource://security/compliance_audit",
        name: "SOC2 Type II & GDPR Security Compliance Matrix",
        description: "Security architecture, encryption standards, and privacy audit certificates",
        mimeType: "application/json"
      }
    ];
  }

  /**
   * Initializes 4 System Prompt Templates
   */
  initializePrompts() {
    return [
      {
        name: "system_support_persona",
        description: "Enterprise Customer Support Persona prompt with guardrails and tool call instructions",
        arguments: [{ name: "customerName", description: "Name of customer currently chatting" }]
      },
      {
        name: "incident_escalation_prompt",
        description: "Standardized Tier-2 Support Ticket Escalation format prompt",
        arguments: [{ name: "ticketId", description: "Support ticket ID" }]
      },
      {
        name: "gdpr_data_request_prompt",
        description: "Compliance response template for GDPR/CCPA data export requests",
        arguments: [{ name: "customerId", description: "Target Customer ID" }]
      },
      {
        name: "billing_dispute_resolution_prompt",
        description: "Empathetic invoice dispute and refund decision prompt template",
        arguments: [{ name: "orderId", description: "Disputed Order ID" }]
      }
    ];
  }

  /**
   * Handles incoming JSON-RPC 2.0 requests
   */
  async handleRequest(request) {
    this.logProtocol("REQUEST", request.method, request);

    let response = {
      jsonrpc: "2.0",
      id: request.id
    };

    try {
      switch (request.method) {
        case "initialize":
          response.result = {
            protocolVersion: this.serverInfo.protocolVersion,
            capabilities: {
              tools: { listChanged: true },
              resources: { subscribe: true, listChanged: true },
              prompts: { listChanged: true },
              logging: {}
            },
            serverInfo: this.serverInfo
          };
          break;

        case "tools/list":
          response.result = { tools: this.tools };
          break;

        case "tools/call":
          const toolResult = await this.executeToolCall(request.params.name, request.params.arguments);
          response.result = toolResult;
          break;

        case "resources/list":
          response.result = { resources: this.resources };
          break;

        case "resources/read":
          response.result = this.executeResourceRead(request.params.uri);
          break;

        case "resources/subscribe":
          this.subscriptions.add(request.params.uri);
          response.result = { subscribed: true, uri: request.params.uri };
          this.logProtocol("NOTIFICATION", "notifications/resources/updated", { uri: request.params.uri, status: "Subscribed to live stream" });
          break;

        case "resources/unsubscribe":
          this.subscriptions.delete(request.params.uri);
          response.result = { subscribed: false, uri: request.params.uri };
          break;

        case "prompts/list":
          response.result = { prompts: this.prompts };
          break;

        case "prompts/get":
          response.result = this.executePromptGet(request.params.name, request.params.arguments);
          break;

        default:
          response.error = {
            code: -32601,
            message: `Method not found: ${request.method}`
          };
      }
    } catch (err) {
      response.error = {
        code: -32603,
        message: `Internal execution error: ${err.message}`
      };
    }

    this.logProtocol("RESPONSE", request.method, response);
    return response;
  }

  /**
   * Tool Execution Router for all 12 MCP tools
   */
  async executeToolCall(toolName, args = {}) {
    switch (toolName) {
      case "search_knowledge_base": {
        const ragResult = this.ragEngine.buildRAGContext(args.query, args.topK || 3, { categoryFilter: args.categoryFilter || "ALL" });
        return {
          content: [{ type: "text", text: JSON.stringify(ragResult, null, 2) }],
          isError: false,
          meta: { matchesCount: ragResult.matches.length, citations: ragResult.citations, metrics: ragResult.metrics }
        };
      }

      case "get_order_details": {
        const order = this.db.orders.find((o) => o.id.toLowerCase() === args.orderId.trim().toLowerCase());
        if (!order) {
          return { content: [{ type: "text", text: `Order '${args.orderId}' not found.` }], isError: true };
        }
        return { content: [{ type: "text", text: JSON.stringify(order, null, 2) }], isError: false, data: order };
      }

      case "process_refund_request": {
        const order = this.db.orders.find((o) => o.id.toLowerCase() === args.orderId.trim().toLowerCase());
        if (!order) {
          return { content: [{ type: "text", text: `Order '${args.orderId}' not found for refund.` }], isError: true };
        }
        const orderDate = new Date(order.date);
        const daysDiff = (new Date() - orderDate) / (1000 * 60 * 60 * 24);
        const eligible = daysDiff <= 30 && order.status !== "Refunded";

        const refundRecord = {
          refundId: `RFD-${Math.floor(100000 + Math.random() * 900000)}`,
          orderId: order.id,
          customerName: args.customerName || order.customerName,
          amount: order.totalAmount,
          reason: args.reason,
          status: eligible ? "Approved" : (order.status === "Refunded" ? "Already Refunded" : "Pending Supervisor Review"),
          message: eligible
            ? `Refund of $${order.totalAmount} authorized via MCP Policy Server. Funds expected in 3-5 days.`
            : (order.status === "Refunded" ? "Order was previously refunded." : `Order is outside 30-day return window (${Math.round(daysDiff)} days). Submitted for supervisor review.`)
        };

        if (eligible) order.status = "Refunded";
        return { content: [{ type: "text", text: JSON.stringify(refundRecord, null, 2) }], isError: false, data: refundRecord };
      }

      case "create_support_ticket": {
        const newTicket = {
          id: `TCK-${Math.floor(9000 + Math.random() * 999)}`,
          customerId: "CUST-GUEST",
          customerName: args.customerName,
          subject: args.subject,
          category: args.category || "General Support",
          priority: args.priority || "Medium",
          status: "Open",
          createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
          assignedAgent: "Human Tier-2 Support Specialist",
          lastMessage: args.details
        };
        this.db.tickets.unshift(newTicket);
        return { content: [{ type: "text", text: JSON.stringify(newTicket, null, 2) }], isError: false, data: newTicket };
      }

      case "check_product_warranty": {
        const item = this.db.warranties.find((w) => w.serialNumber.toLowerCase() === args.serialNumber.trim().toLowerCase());
        if (!item) {
          return { content: [{ type: "text", text: `No warranty record found for serial '${args.serialNumber}'.` }], isError: true };
        }
        return { content: [{ type: "text", text: JSON.stringify(item, null, 2) }], isError: false, data: item };
      }

      case "update_customer_profile": {
        const cust = this.db.customers.find((c) => c.id === args.customerId);
        if (!cust) return { content: [{ type: "text", text: `Customer ID '${args.customerId}' not found.` }], isError: true };
        if (args.newAddress) cust.address = args.newAddress;
        if (args.newPhone) cust.phone = args.newPhone;
        return { content: [{ type: "text", text: `Profile updated successfully: ${JSON.stringify(cust)}` }], isError: false, data: cust };
      }

      case "cancel_order": {
        const order = this.db.orders.find((o) => o.id.toLowerCase() === args.orderId.trim().toLowerCase());
        if (!order) return { content: [{ type: "text", text: `Order '${args.orderId}' not found.` }], isError: true };
        if (order.status === "In Transit" || order.status === "Delivered") {
          return { content: [{ type: "text", text: `Order '${order.id}' is already '${order.status}' and cannot be cancelled in flight. Please use standard returns.` }], isError: true };
        }
        order.status = "Cancelled";
        const cancelRecord = {
          orderId: order.id,
          status: "Cancelled",
          refundAmount: order.totalAmount,
          message: `Order ${order.id} has been cancelled. Full refund of $${order.totalAmount} issued.`
        };
        return { content: [{ type: "text", text: JSON.stringify(cancelRecord, null, 2) }], isError: false, data: cancelRecord };
      }

      case "generate_api_key": {
        const cust = this.db.customers.find((c) => c.id === args.customerId);
        const newKey = {
          keyId: `AK_${(cust ? cust.tier.slice(0, 3) : "PRO").toUpperCase()}_${Math.floor(100000 + Math.random() * 900000)}`,
          customerId: args.customerId,
          name: args.keyName || "Developer Key",
          secret: `rzx_live_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
          rateLimit: cust && cust.tier.includes("Enterprise") ? "Unlimited" : "10,000 req/hr",
          status: "Active"
        };
        this.db.apiKeys.push(newKey);
        return { content: [{ type: "text", text: JSON.stringify(newKey, null, 2) }], isError: false, data: newKey };
      }

      case "lookup_shipping_rate": {
        const code = (args.countryCode || "US").toUpperCase();
        const rate = this.db.shippingRates[code] || this.db.shippingRates["US"];
        return {
          content: [{ type: "text", text: JSON.stringify({ country: code, rates: rate }, null, 2) }],
          isError: false,
          data: { country: code, rates: rate }
        };
      }

      case "schedule_field_technician": {
        const dispatch = {
          dispatchId: `DISP-${Math.floor(1000 + Math.random() * 9000)}`,
          customerId: args.customerId,
          scheduledDate: args.preferredDate,
          status: "Confirmed",
          technician: "Alex Mercer (Senior IoT Field Specialist)",
          notes: args.issueDescription
        };
        return { content: [{ type: "text", text: JSON.stringify(dispatch, null, 2) }], isError: false, data: dispatch };
      }

      case "fetch_system_health": {
        return { content: [{ type: "text", text: JSON.stringify(this.db.systemHealth, null, 2) }], isError: false, data: this.db.systemHealth };
      }

      case "export_customer_data": {
        const cust = this.db.customers.find((c) => c.id === args.customerId);
        if (!cust) return { content: [{ type: "text", text: `Customer '${args.customerId}' not found for export.` }], isError: true };
        const custOrders = this.db.orders.filter((o) => o.customerId === args.customerId);
        const custTickets = this.db.tickets.filter((t) => t.customerId === args.customerId);

        const exportPayload = {
          compliance: "GDPR / CCPA Article 15 Data Access",
          exportedAt: new Date().toISOString(),
          customer: cust,
          orders: custOrders,
          tickets: custTickets
        };
        return { content: [{ type: "text", text: JSON.stringify(exportPayload, null, 2) }], isError: false, data: exportPayload };
      }

      default:
        throw new Error(`Tool '${toolName}' execution handler not implemented.`);
    }
  }

  /**
   * Resource Reader
   */
  executeResourceRead(uri) {
    if (uri === "resource://docs/return_policy") {
      return { contents: [{ uri, mimeType: "text/markdown", text: "# Official 30-Day Return & Guarantee Policy\n\nItems returned within 30 days are eligible for a 100% refund with $0 restocking fee for defective items." }] };
    }
    if (uri === "resource://docs/shipping_faq") {
      return { contents: [{ uri, mimeType: "text/markdown", text: "# Global Shipping & Transit Standards\n\nStandard domestic shipping takes 3-5 days; Express takes 1-2 days. International takes 5-10 days." }] };
    }
    if (uri === "resource://system/health_status") {
      return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify(this.db.systemHealth, null, 2) }] };
    }
    if (uri === "resource://policies/enterprise_sla") {
      return { contents: [{ uri, mimeType: "text/markdown", text: "# Enterprise SLA & 99.9% Uptime Policy\n\nEnterprise members receive 99.9% cloud availability and 15-minute response times." }] };
    }
    if (uri === "resource://security/compliance_audit") {
      return { contents: [{ uri, mimeType: "application/json", text: JSON.stringify({ auditStatus: "PASSED", certification: "SOC2 Type II", compliance: ["GDPR", "CCPA", "HIPAA"] }, null, 2) }] };
    }
    return { contents: [] };
  }

  /**
   * Prompt Template Resolver
   */
  executePromptGet(name, args = {}) {
    if (name === "system_support_persona") {
      return {
        description: "Enterprise Customer Support Persona",
        messages: [
          { role: "system", content: { type: "text", text: `You are ResolveX AI Support Agent serving customer ${args.customerName || "Valued User"}. Use RAG and MCP tools.` } }
        ]
      };
    }
    if (name === "incident_escalation_prompt") {
      return {
        description: "Tier-2 Ticket Escalation Template",
        messages: [
          { role: "user", content: { type: "text", text: `Escalate ticket ${args.ticketId}: Summarize customer issue, troubleshooting steps attempted, and priority.` } }
        ]
      };
    }
    if (name === "gdpr_data_request_prompt") {
      return {
        description: "GDPR Data Request Response Template",
        messages: [
          { role: "user", content: { type: "text", text: `Prepare GDPR Article 15 Data Export packet for Customer ID ${args.customerId || "CUST-101"}.` } }
        ]
      };
    }
    if (name === "billing_dispute_resolution_prompt") {
      return {
        description: "Billing Dispute Template",
        messages: [
          { role: "user", content: { type: "text", text: `Evaluate invoice dispute for Order ${args.orderId || "ORD-8921"} against 30-day return policy.` } }
        ]
      };
    }
    return { description: "Prompt template", messages: [] };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MCPServer };
}
