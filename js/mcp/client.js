/**
 * ResolveX MCP Client Connector
 * Standard JSON-RPC 2.0 client for communicating with MCP Servers.
 */

class MCPClient {
  constructor(mcpServer) {
    this.server = mcpServer;
    this.requestIdCounter = 1;
    this.availableTools = [];
    this.isConnected = false;
    this.logs = [];
    this.onLogUpdate = null;
  }

  /**
   * Initializes MCP protocol session handshake
   */
  async connect() {
    const initRequest = {
      jsonrpc: "2.0",
      id: this.requestIdCounter++,
      method: "initialize",
      params: {
        protocolVersion: "2024-11-05",
        clientInfo: { name: "ResolveX-WebClient", version: "1.0.0" }
      }
    };

    const initRes = await this.server.handleRequest(initRequest);
    this.isConnected = !initRes.error;

    // Fetch tool directory
    await this.refreshTools();
    return this.isConnected;
  }

  /**
   * Discovers available tools from MCP server (`tools/list`)
   */
  async refreshTools() {
    const request = {
      jsonrpc: "2.0",
      id: this.requestIdCounter++,
      method: "tools/list"
    };

    const response = await this.server.handleRequest(request);
    if (response.result && response.result.tools) {
      this.availableTools = response.result.tools;
    }
    return this.availableTools;
  }

  /**
   * Calls a tool via standard MCP JSON-RPC message (`tools/call`)
   */
  async callTool(name, args = {}) {
    const request = {
      jsonrpc: "2.0",
      id: this.requestIdCounter++,
      method: "tools/call",
      params: {
        name,
        arguments: args
      }
    };

    const startTime = performance.now();
    const response = await this.server.handleRequest(request);
    const durationMs = Math.round(performance.now() - startTime);

    const logEntry = {
      id: request.id,
      timestamp: new Date().toLocaleTimeString(),
      toolName: name,
      arguments: args,
      response: response.result || response.error,
      durationMs,
      isError: !!response.error || (response.result && response.result.isError)
    };

    this.logs.unshift(logEntry);
    if (this.onLogUpdate) this.onLogUpdate(logEntry);

    return response;
  }

  /**
   * Reads a resource via MCP (`resources/read`)
   */
  async readResource(uri) {
    const request = {
      jsonrpc: "2.0",
      id: this.requestIdCounter++,
      method: "resources/read",
      params: { uri }
    };
    return await this.server.handleRequest(request);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MCPClient };
}
