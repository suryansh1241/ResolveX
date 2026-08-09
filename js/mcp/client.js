/**
 * ResolveX MCP Client Connector
 * Standard JSON-RPC 2.0 client for communicating with MCP Servers.
 */

class MCPClient {
  constructor(mcpServer) {
    this.server = mcpServer;
    this.requestIdCounter = 1;
    this.availableTools = [];
    this.availableResources = [];
    this.availablePrompts = [];
    this.subscriptions = new Set();
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
        clientInfo: { name: "ResolveX-WebClient", version: "2.0.0" }
      }
    };

    const initRes = await this.server.handleRequest(initRequest);
    this.isConnected = !initRes.error;

    // Discover tools, resources, and prompts
    await this.refreshTools();
    await this.refreshResources();
    await this.refreshPrompts();
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
   * Discovers available resources (`resources/list`)
   */
  async refreshResources() {
    const request = {
      jsonrpc: "2.0",
      id: this.requestIdCounter++,
      method: "resources/list"
    };

    const response = await this.server.handleRequest(request);
    if (response.result && response.result.resources) {
      this.availableResources = response.result.resources;
    }
    return this.availableResources;
  }

  /**
   * Discovers available prompts (`prompts/list`)
   */
  async refreshPrompts() {
    const request = {
      jsonrpc: "2.0",
      id: this.requestIdCounter++,
      method: "prompts/list"
    };

    const response = await this.server.handleRequest(request);
    if (response.result && response.result.prompts) {
      this.availablePrompts = response.result.prompts;
    }
    return this.availablePrompts;
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

  /**
   * Subscribes to a resource (`resources/subscribe`)
   */
  async subscribeResource(uri) {
    const request = {
      jsonrpc: "2.0",
      id: this.requestIdCounter++,
      method: "resources/subscribe",
      params: { uri }
    };
    const res = await this.server.handleRequest(request);
    if (res.result && res.result.subscribed) this.subscriptions.add(uri);
    return res;
  }

  /**
   * Gets a prompt template (`prompts/get`)
   */
  async getPrompt(name, args = {}) {
    const request = {
      jsonrpc: "2.0",
      id: this.requestIdCounter++,
      method: "prompts/get",
      params: { name, arguments: args }
    };
    return await this.server.handleRequest(request);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MCPClient };
}
