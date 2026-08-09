/**
 * ResolveX Model Context Protocol (MCP) Server
 * Standard JSON-RPC 2.0 implementation exposing tools, resources, and prompts
 * for Customer Support Agent execution.
 */

class MCPServer {
  constructor(db, ragEngine) {
    this.db = db;
    this.ragEngine = ragEngine;
    this.serverInfo = {
      name: "ResolveX-CustomerSupport-MCPServer",
      version: "1.0.0",
      protocolVersion: "2024-11-05"
    };

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
        direction, // 'REQUEST' | 'RESPONSE' | 'SERVER_EVENT'
        method,
        data
      });
    }
  }

  /**
   * Defines standard MCP Tools with JSON Schema parameters
   */
  initializeTools() {
    return [
      {
        name: "search_knowledge_base",
        description: "Queries the RAG Knowledge Base for company policies, FAQs, shipping rules, and troubleshooting guides.",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query or customer question keywords" },
            topK: { type: "integer", description: "Number of top passage matches to retrieve (default: 3)" }
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
            reason: { type: "string", description: "Reason for return (e.g. defective, wrong size, changed mind)" },
            customerName: { type: "string", description: "Name of customer requesting refund" }
          },
          required: ["orderId", "reason"]
        }
      },
      {
        name: "create_support_ticket",
        description: "Escalates an unresolved or complex issue to human customer support tier by creating a ticket.",
        inputSchema: {
          type: "object",
          properties: {
            customerName: { type: "string", description: "Customer name" },
            subject: { type: "string", description: "Brief issue summary header" },
            category: { type: "string", description: "Category (Technical, Billing, Shipping, General)" },
            priority: { type: "string", enum: ["Low", "Medium", "High", "Urgent"], description: "Urgency priority level" },
            details: { type: "string", description: "Detailed summary of conversation and customer problem" }
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
        description: "Updates customer address, phone number, or contact preferences in system database.",
        inputSchema: {
          type: "object",
          properties: {
            customerId: { type: "string", description: "Customer ID (e.g. CUST-101)" },
            newAddress: { type: "string", description: "Updated delivery address" },
            newPhone: { type: "string", description: "Updated phone number" }
          },
          required: ["customerId"]
        }
      }
    ];
  }

  /**
   * Initializes accessible MCP Resources
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
      }
    ];
  }

  /**
   * Initializes pre-built System Prompts
   */
  initializePrompts() {
    return [
      {
        name: "system_support_persona",
        description: "Enterprise Customer Support Persona prompt with guardrails and tool call instructions",
        arguments: [
          { name: "customerName", description: "Name of customer currently chatting" }
        ]
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
              resources: { subscribe: true },
              prompts: { listChanged: true }
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

        case "prompts/list":
          response.result = { prompts: this.prompts };
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
        message: `Internal tool execution error: ${err.message}`
      };
    }

    this.logProtocol("RESPONSE", request.method, response);
    return response;
  }

  /**
   * Tool Execution Router
   */
  async executeToolCall(toolName, args = {}) {
    switch (toolName) {
      case "search_knowledge_base": {
        const ragResult = this.ragEngine.buildRAGContext(args.query, args.topK || 3);
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(ragResult, null, 2)
            }
          ],
          isError: false,
          meta: { matchesCount: ragResult.matches.length, citations: ragResult.citations }
        };
      }

      case "get_order_details": {
        const order = this.db.orders.find(
          (o) => o.id.toLowerCase() === args.orderId.trim().toLowerCase()
        );
        if (!order) {
          return {
            content: [{ type: "text", text: `Order '${args.orderId}' was not found in database.` }],
            isError: true
          };
        }
        return {
          content: [{ type: "text", text: JSON.stringify(order, null, 2) }],
          isError: false,
          data: order
        };
      }

      case "process_refund_request": {
        const order = this.db.orders.find(
          (o) => o.id.toLowerCase() === args.orderId.trim().toLowerCase()
        );

        if (!order) {
          return {
            content: [{ type: "text", text: `Order '${args.orderId}' not found for refund.` }],
            isError: true
          };
        }

        // Refund policy evaluation logic
        const orderDate = new Date(order.date);
        const daysDiff = (new Date() - orderDate) / (1000 * 60 * 60 * 24);
        const eligible = daysDiff <= 30;

        const refundRecord = {
          refundId: `RFD-${Math.floor(100000 + Math.random() * 900000)}`,
          orderId: order.id,
          customerName: args.customerName || order.customerName,
          amount: order.totalAmount,
          reason: args.reason,
          status: eligible ? "Approved" : "Pending Manual Review",
          message: eligible
            ? `Refund of $${order.totalAmount} approved. Funds will arrive in 3-5 business days.`
            : `Order is outside standard 30-day window (${Math.round(daysDiff)} days). Submitted for supervisor review.`
        };

        if (eligible) {
          order.status = "Refunded";
        }

        return {
          content: [{ type: "text", text: JSON.stringify(refundRecord, null, 2) }],
          isError: false,
          data: refundRecord
        };
      }

      case "create_support_ticket": {
        const newTicket = {
          id: `TCK-${Math.floor(9000 + Math.random() * 999)}`,
          customerId: "CUST-GUEST",
          customerName: args.customerName,
          subject: args.subject,
          category: args.category,
          priority: args.priority || "Medium",
          status: "Open",
          createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
          assignedAgent: "Human Tier-2 Support",
          lastMessage: args.details
        };

        this.db.tickets.unshift(newTicket);

        return {
          content: [{ type: "text", text: JSON.stringify(newTicket, null, 2) }],
          isError: false,
          data: newTicket
        };
      }

      case "check_product_warranty": {
        const item = this.db.warranties.find(
          (w) => w.serialNumber.toLowerCase() === args.serialNumber.trim().toLowerCase()
        );

        if (!item) {
          return {
            content: [{ type: "text", text: `No warranty record found for serial number '${args.serialNumber}'.` }],
            isError: true
          };
        }

        return {
          content: [{ type: "text", text: JSON.stringify(item, null, 2) }],
          isError: false,
          data: item
        };
      }

      case "update_customer_profile": {
        const cust = this.db.customers.find((c) => c.id === args.customerId);
        if (!cust) {
          return {
            content: [{ type: "text", text: `Customer ID '${args.customerId}' not found.` }],
            isError: true
          };
        }

        if (args.newAddress) cust.address = args.newAddress;
        if (args.newPhone) cust.phone = args.newPhone;

        return {
          content: [{ type: "text", text: `Successfully updated customer profile: ${JSON.stringify(cust)}` }],
          isError: false,
          data: cust
        };
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
      return {
        contents: [
          {
            uri,
            mimeType: "text/markdown",
            text: "# Official 30-Day Return & Guarantee Policy\n\nItems returned within 30 days are eligible for a 100% refund."
          }
        ]
      };
    }
    return { contents: [] };
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MCPServer };
}
