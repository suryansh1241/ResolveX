/**
 * ResolveX Master UI Controller
 * Binds DOM event listeners, handles tab switching, renders live chat,
 * displays MCP JSON-RPC protocol logs, runs RAG search tests, and updates dashboard tables.
 */

// Global Application Instances
let ragEngine = null;
let mcpServer = null;
let mcpClient = null;
let supportAgent = null;
let mockDb = null;

document.addEventListener("DOMContentLoaded", async () => {
  // 1. Initialize Datasets & Engines
  mockDb = JSON.parse(JSON.stringify(INITIAL_MOCK_DATABASE));
  ragEngine = new RAGEngine(INITIAL_KNOWLEDGE_BASE);
  mcpServer = new MCPServer(mockDb, ragEngine);
  mcpClient = new MCPClient(mcpServer);

  // Bind protocol logger for live inspector view
  mcpServer.setLogger((logData) => renderMCPLogEntry(logData));

  // Initialize MCP Connection
  await mcpClient.connect();

  // Instantiate Agent Core
  supportAgent = new CustomerSupportAgent(mcpClient, ragEngine);

  // 2. Setup Event Listeners & UI Components
  setupTabNavigation();
  setupMCPSubtabs();
  setupChatListeners();
  setupCustomerSelector();
  setupRAGWorkbench();
  setupMCPPlayground();
  setupDashboardSearch();

  // 3. Initial View Renders
  renderMCPToolsRegistry();
  renderMCPResources();
  renderMCPPrompts();
  renderDashboardTables();
  renderRAGSearchTest("return policy 30 days refund");
});

/* ==========================================================================
   NAVIGATION & TAB SWITCHER
   ========================================================================== */
function setupTabNavigation() {
  const tabButtons = document.querySelectorAll(".nav-tabs .tab-btn");
  const viewPanels = document.querySelectorAll(".view-panel");

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTabId = btn.getAttribute("data-tab");

      tabButtons.forEach((b) => b.classList.remove("active"));
      viewPanels.forEach((p) => p.classList.remove("active"));

      btn.classList.add("active");
      const targetPanel = document.getElementById(targetTabId);
      if (targetPanel) targetPanel.classList.add("active");
    });
  });
}

function setupMCPSubtabs() {
  const subBtns = document.querySelectorAll(".mcp-subtab-btn");
  const subPanels = document.querySelectorAll(".mcp-subpanel");

  subBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-mcp-target");

      subBtns.forEach((b) => b.classList.remove("active"));
      subPanels.forEach((p) => (p.style.display = "none"));

      btn.classList.add("active");
      const targetSubpanel = document.getElementById(targetId);
      if (targetSubpanel) targetSubpanel.style.display = "block";
    });
  });
}

/* ==========================================================================
   VIEW 1: LIVE SUPPORT CHAT LOGIC
   ========================================================================== */
function setupChatListeners() {
  const sendBtn = document.getElementById("chat-send-btn");
  const inputField = document.getElementById("chat-input-field");

  const handleSend = async () => {
    const text = inputField.value.trim();
    if (!text) return;

    inputField.value = "";
    await sendUserMessage(text);
  };

  sendBtn.addEventListener("click", handleSend);
  inputField.addEventListener("keydown", (e) => {
    if (e.key === "Enter") handleSend();
  });
}

async function sendUserMessage(text) {
  const messagesBox = document.getElementById("chat-messages-box");

  // Render User Message Bubble
  const userMsgEl = document.createElement("div");
  userMsgEl.className = "message-group user";
  userMsgEl.innerHTML = `
    <div class="message-bubble">${escapeHTML(text)}</div>
    <div class="message-meta"><span>${supportAgent.currentCustomer.name}</span> • <span>${getCurrentTime()}</span></div>
  `;
  messagesBox.appendChild(userMsgEl);
  scrollToBottom(messagesBox);

  // Render Typing Indicator
  const typingEl = document.createElement("div");
  typingEl.className = "message-group assistant";
  typingEl.id = "typing-indicator";
  typingEl.innerHTML = `
    <div class="message-bubble" style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 12px; color: var(--text-accent);">ResolveX Agent processing via MCP Tool Server & RAG Engine...</span>
    </div>
  `;
  messagesBox.appendChild(typingEl);
  scrollToBottom(messagesBox);

  // Process message through Support Agent Engine
  const agentResponse = await supportAgent.processUserMessage(text);

  // Remove typing indicator
  const indicator = document.getElementById("typing-indicator");
  if (indicator) indicator.remove();

  // Render Assistant Message Bubble
  const assistantMsgEl = document.createElement("div");
  assistantMsgEl.className = "message-group assistant";

  let toolBadgesHTML = "";
  if (agentResponse.toolCalls && agentResponse.toolCalls.length > 0) {
    agentResponse.toolCalls.forEach((tc) => {
      toolBadgesHTML += `<div class="tool-execution-badge">⚡ Executed MCP Tool: <strong>${tc.toolName}</strong>(${JSON.stringify(tc.args)})</div>`;
    });
  }

  let citationsHTML = "";
  if (agentResponse.citations && agentResponse.citations.length > 0) {
    citationsHTML = `<div style="margin-top: 8px;">`;
    agentResponse.citations.forEach((c) => {
      citationsHTML += `<span class="citation-pill" onclick="switchToRAGAndSearch('${escapeHTML(c.title)}')">📚 ${c.ref}</span>`;
    });
    citationsHTML += `</div>`;
  }

  let actionCardHTML = "";
  if (agentResponse.actionData) {
    actionCardHTML = renderActionCard(agentResponse.actionData);
  }

  assistantMsgEl.innerHTML = `
    <div class="message-bubble">
      ${toolBadgesHTML}
      <div>${formatMarkdown(agentResponse.content)}</div>
      ${actionCardHTML}
      ${citationsHTML}
    </div>
    <div class="message-meta">
      <span>ResolveX Agent</span> • <span>Confidence: ${agentResponse.confidenceScore}%</span> • <span>${agentResponse.timestamp}</span>
    </div>
  `;

  messagesBox.appendChild(assistantMsgEl);
  scrollToBottom(messagesBox);

  // Update Sidebar Citations & Dashboard Metrics
  updateSidebarCitations(agentResponse.citations);
  updateDashboardMetrics();
}

/**
 * Global Helper for Quick Prompt Chips
 */
window.sendQuickPrompt = function (promptText) {
  const inputField = document.getElementById("chat-input-field");
  inputField.value = promptText;
  sendUserMessage(promptText);
};

function renderActionCard(actionObj) {
  const { type, data } = actionObj;

  if (type === "ORDER_CARD") {
    return `
      <div class="chat-card">
        <div class="card-header">
          <span class="card-title">📦 Order Status Details (${data.id})</span>
          <span class="status-tag in-transit">${data.status}</span>
        </div>
        <div class="card-row"><span class="card-label">Customer:</span><span class="card-value">${data.customerName}</span></div>
        <div class="card-row"><span class="card-label">Carrier & Tracking:</span><span class="card-value">${data.carrier} (${data.trackingNumber})</span></div>
        <div class="card-row"><span class="card-label">Estimated Delivery:</span><span class="card-value">${data.estimatedDelivery}</span></div>
        <div class="card-row"><span class="card-label">Total Amount:</span><span class="card-value">$${data.totalAmount.toFixed(2)}</span></div>
      </div>
    `;
  }

  if (type === "CANCEL_CARD") {
    return `
      <div class="chat-card" style="border-color: rgba(244, 63, 94, 0.4)">
        <div class="card-header">
          <span class="card-title">🚫 Order Cancellation Record (${data.orderId})</span>
          <span class="status-tag cancelled">${data.status}</span>
        </div>
        <div class="card-row"><span class="card-label">Refund Amount:</span><span class="card-value">$${data.refundAmount.toFixed(2)}</span></div>
        <div style="font-size: 12px; color: var(--text-accent); margin-top: 6px;">${data.message}</div>
      </div>
    `;
  }

  if (type === "API_KEY_CARD") {
    return `
      <div class="chat-card" style="border-color: rgba(6, 182, 212, 0.4)">
        <div class="card-header">
          <span class="card-title">🔑 Developer API Key Provisioned</span>
          <span class="status-tag resolved">${data.status}</span>
        </div>
        <div class="card-row"><span class="card-label">Key ID:</span><span class="card-value">${data.keyId}</span></div>
        <div class="card-row"><span class="card-label">Key Secret:</span><span class="card-value" style="color: #67e8f9; font-family: var(--font-mono);">${data.secret}</span></div>
        <div class="card-row"><span class="card-label">Rate Limit:</span><span class="card-value">${data.rateLimit}</span></div>
      </div>
    `;
  }

  if (type === "SHIPPING_RATE_CARD") {
    return `
      <div class="chat-card">
        <div class="card-header">
          <span class="card-title">🚚 Courier Rates (${data.country})</span>
          <span class="status-tag in-transit">${data.rates.carrier}</span>
        </div>
        <div class="card-row"><span class="card-label">Standard Shipping:</span><span class="card-value">${data.rates.standard === 0 ? 'FREE' : '$' + data.rates.standard.toFixed(2)}</span></div>
        <div class="card-row"><span class="card-label">Express Shipping:</span><span class="card-value">$${data.rates.express.toFixed(2)}</span></div>
      </div>
    `;
  }

  if (type === "TECH_CARD") {
    return `
      <div class="chat-card" style="border-color: rgba(168, 85, 247, 0.4)">
        <div class="card-header">
          <span class="card-title">🔧 Field Technician Scheduled</span>
          <span class="status-tag open">${data.status}</span>
        </div>
        <div class="card-row"><span class="card-label">Dispatch ID:</span><span class="card-value">${data.dispatchId}</span></div>
        <div class="card-row"><span class="card-label">Scheduled Date:</span><span class="card-value">${data.scheduledDate}</span></div>
        <div class="card-row"><span class="card-label">Technician:</span><span class="card-value">${data.technician}</span></div>
      </div>
    `;
  }

  if (type === "HEALTH_CARD") {
    return `
      <div class="chat-card" style="border-color: rgba(16, 185, 129, 0.4)">
        <div class="card-header">
          <span class="card-title">⚡ Infrastructure Cluster Health</span>
          <span class="status-tag resolved">${data.status}</span>
        </div>
        <div class="card-row"><span class="card-label">Uptime SLA:</span><span class="card-value">${data.uptime}</span></div>
        <div class="card-row"><span class="card-label">Cluster Latency:</span><span class="card-value">${data.clusterLatencyMs}ms</span></div>
        <div class="card-row"><span class="card-label">Active Nodes:</span><span class="card-value">${data.activeNodes} Nodes</span></div>
      </div>
    `;
  }

  if (type === "DATA_EXPORT_CARD") {
    return `
      <div class="chat-card" style="border-color: rgba(59, 130, 246, 0.4)">
        <div class="card-header">
          <span class="card-title">📁 GDPR Data Access Packet</span>
          <span class="status-tag resolved">EXPORTED</span>
        </div>
        <div class="card-row"><span class="card-label">Customer ID:</span><span class="card-value">${data.customer.id}</span></div>
        <div class="card-row"><span class="card-label">Orders Archived:</span><span class="card-value">${data.orders.length}</span></div>
        <div class="card-row"><span class="card-label">Tickets Archived:</span><span class="card-value">${data.tickets.length}</span></div>
      </div>
    `;
  }

  if (type === "REFUND_CARD") {
    const isApproved = data.status === "Approved";
    return `
      <div class="chat-card" style="border-color: ${isApproved ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}">
        <div class="card-header">
          <span class="card-title">💸 Refund Request Record (${data.refundId})</span>
          <span class="status-tag ${isApproved ? 'resolved' : 'open'}">${data.status}</span>
        </div>
        <div class="card-row"><span class="card-label">Order ID:</span><span class="card-value">${data.orderId}</span></div>
        <div class="card-row"><span class="card-label">Refund Amount:</span><span class="card-value">$${data.amount.toFixed(2)}</span></div>
        <div class="card-row"><span class="card-label">Reason:</span><span class="card-value">${data.reason}</span></div>
        <div style="font-size: 12px; color: var(--text-accent); margin-top: 6px;">${data.message}</div>
      </div>
    `;
  }

  if (type === "TICKET_CARD") {
    return `
      <div class="chat-card" style="border-color: rgba(245, 158, 11, 0.4)">
        <div class="card-header">
          <span class="card-title">🎫 Created Support Ticket (${data.id})</span>
          <span class="status-tag open">${data.priority} Priority</span>
        </div>
        <div class="card-row"><span class="card-label">Customer:</span><span class="card-value">${data.customerName}</span></div>
        <div class="card-row"><span class="card-label">Category:</span><span class="card-value">${data.category}</span></div>
        <div class="card-row"><span class="card-label">Assigned Agent:</span><span class="card-value">${data.assignedAgent}</span></div>
      </div>
    `;
  }

  if (type === "WARRANTY_CARD") {
    return `
      <div class="chat-card">
        <div class="card-header">
          <span class="card-title">🛡️ Hardware Warranty Status</span>
          <span class="status-tag resolved">${data.status}</span>
        </div>
        <div class="card-row"><span class="card-label">Serial Number:</span><span class="card-value">${data.serialNumber}</span></div>
        <div class="card-row"><span class="card-label">Product Name:</span><span class="card-value">${data.productName}</span></div>
        <div class="card-row"><span class="card-label">Coverage Expires:</span><span class="card-value">${data.expiresAt}</span></div>
      </div>
    `;
  }

  return "";
}

function updateSidebarCitations(citations) {
  const box = document.getElementById("sidebar-citations-box");
  if (!citations || citations.length === 0) return;

  let html = "";
  citations.forEach((c) => {
    html += `
      <div style="padding: 10px; background: rgba(31, 41, 61, 0.6); border: 1px solid var(--border-glass); border-radius: var(--radius-sm);">
        <div style="font-weight: 600; color: var(--text-cyan); margin-bottom: 4px;">${c.ref}</div>
        <div style="font-size: 11px; color: var(--text-muted); line-height: 1.4;">${escapeHTML(c.excerpt)}</div>
        <div style="margin-top: 6px; font-size: 10px; color: var(--text-accent);">RRF Score: ${c.score.toFixed(3)}</div>
      </div>
    `;
  });
  box.innerHTML = html;
}

function setupCustomerSelector() {
  const select = document.getElementById("customer-select");
  select.addEventListener("change", (e) => {
    const custId = e.target.value;
    const cust = mockDb.customers.find((c) => c.id === custId);
    const order = mockDb.orders.find((o) => o.customerId === custId);

    if (cust) {
      supportAgent.currentCustomer = {
        name: cust.name,
        id: cust.id,
        email: cust.email,
        tier: cust.tier
      };

      document.getElementById("prof-name").textContent = cust.name;
      document.getElementById("prof-id").textContent = cust.id;
      document.getElementById("prof-tier").textContent = cust.tier;
      document.getElementById("prof-email").textContent = cust.email;
      document.getElementById("prof-order").textContent = order ? order.id : "None";
    }
  });
}

/* ==========================================================================
   VIEW 2: MCP PROTOCOL INSPECTOR LOGIC
   ========================================================================== */
function renderMCPToolsRegistry() {
  const container = document.getElementById("mcp-tools-container");
  if (!mcpClient.availableTools) return;

  let html = "";
  mcpClient.availableTools.forEach((tool) => {
    html += `
      <div class="tool-item-card">
        <div class="tool-name">🛠️ ${tool.name}</div>
        <div class="tool-desc">${tool.description}</div>
        <div style="font-size: 10px; font-family: var(--font-mono); color: var(--text-subtle);">
          Params: ${Object.keys(tool.inputSchema.properties).join(", ")}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  document.getElementById("mcp-tool-count").textContent = `${mcpClient.availableTools.length} Tools`;
}

function renderMCPResources() {
  const container = document.getElementById("mcp-resources-container");
  if (!container || !mcpClient.availableResources) return;

  let html = "";
  mcpClient.availableResources.forEach((res) => {
    const isSubbed = mcpClient.subscriptions.has(res.uri);
    html += `
      <div class="tool-item-card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div class="tool-name" style="color: #67e8f9;">📚 ${res.name}</div>
          <button onclick="toggleResourceSub('${res.uri}')" style="background: ${isSubbed ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)'}; color: ${isSubbed ? '#f43f5e' : '#34d399'}; border: none; padding: 4px 10px; border-radius: var(--radius-sm); font-size: 11px; cursor: pointer;">
            ${isSubbed ? 'Unsubscribe' : 'Subscribe'}
          </button>
        </div>
        <div class="tool-desc">${res.description}</div>
        <div style="font-size: 10px; font-family: var(--font-mono); color: var(--text-subtle);">URI: ${res.uri} • MIME: ${res.mimeType}</div>
      </div>
    `;
  });

  container.innerHTML = html;
}

window.toggleResourceSub = async function (uri) {
  if (mcpClient.subscriptions.has(uri)) {
    await mcpClient.server.handleRequest({ jsonrpc: "2.0", id: 99, method: "resources/unsubscribe", params: { uri } });
    mcpClient.subscriptions.delete(uri);
  } else {
    await mcpClient.subscribeResource(uri);
  }
  renderMCPResources();
};

function renderMCPPrompts() {
  const container = document.getElementById("mcp-prompts-container");
  if (!container || !mcpClient.availablePrompts) return;

  let html = "";
  mcpClient.availablePrompts.forEach((p) => {
    html += `
      <div class="tool-item-card">
        <div class="tool-name" style="color: #a5b4fc;">📝 Prompt: ${p.name}</div>
        <div class="tool-desc">${p.description}</div>
        <div style="font-size: 10px; font-family: var(--font-mono); color: var(--text-subtle);">Args: ${p.arguments.map(a => a.name).join(", ")}</div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function setupMCPPlayground() {
  const toolSelect = document.getElementById("pg-tool-select");
  const argsInput = document.getElementById("pg-args-input");
  const executeBtn = document.getElementById("pg-execute-btn");
  const outputPre = document.getElementById("pg-response-output");

  if (!toolSelect) return;

  // Populate options
  toolSelect.innerHTML = mcpClient.availableTools.map(t => `<option value="${t.name}">${t.name}</option>`).join("");

  const templates = {
    "search_knowledge_base": { query: "return policy 30 days", topK: 3 },
    "get_order_details": { orderId: "ORD-8921" },
    "process_refund_request": { orderId: "ORD-8921", reason: "defective unit" },
    "create_support_ticket": { customerName: "Alex Rivera", subject: "Device connectivity", category: "Technical Support", details: "Drops Wi-Fi" },
    "check_product_warranty": { serialNumber: "WN-99812" },
    "update_customer_profile": { customerId: "CUST-101", newAddress: "742 Evergreen Terr" },
    "cancel_order": { orderId: "ORD-3309", reason: "changed mind" },
    "generate_api_key": { customerId: "CUST-101", keyName: "Testing Key" },
    "lookup_shipping_rate": { countryCode: "JP" },
    "schedule_field_technician": { customerId: "CUST-101", preferredDate: "2026-08-15", issueDescription: "Security hub wall mounting" },
    "fetch_system_health": { includeRegions: true },
    "export_customer_data": { customerId: "CUST-101" }
  };

  const updateTemplate = () => {
    const selected = toolSelect.value;
    argsInput.value = JSON.stringify(templates[selected] || {}, null, 2);
  };

  toolSelect.addEventListener("change", updateTemplate);
  updateTemplate();

  executeBtn.addEventListener("click", async () => {
    const selectedTool = toolSelect.value;
    let parsedArgs = {};
    try {
      parsedArgs = JSON.parse(argsInput.value);
    } catch (e) {
      outputPre.textContent = `JSON Syntax Error in Arguments: ${e.message}`;
      return;
    }

    outputPre.textContent = "Executing JSON-RPC request against MCP Server...";
    const res = await mcpClient.callTool(selectedTool, parsedArgs);
    outputPre.textContent = JSON.stringify(res, null, 2);
  });
}

function renderMCPLogEntry(logData) {
  const container = document.getElementById("mcp-terminal-logs");
  if (!container) return;

  const logEl = document.createElement("div");
  const isErr = logData.direction === "RESPONSE" && logData.data && logData.data.error;
  logEl.className = `log-entry ${isErr ? 'error' : ''}`;

  logEl.innerHTML = `
    <div>
      <span class="log-time">[${logData.timestamp.slice(11, 19)}]</span>
      <strong style="color: ${logData.direction === 'REQUEST' ? '#38bdf8' : (logData.direction === 'NOTIFICATION' ? '#f43f5e' : '#34d399')}">${logData.direction}</strong>
      <span style="color: #a5b4fc;">Method: ${logData.method}</span>
    </div>
    <div class="log-json">${escapeHTML(JSON.stringify(logData.data, null, 2))}</div>
  `;

  container.appendChild(logEl);
  container.scrollTop = container.scrollHeight;
}

document.getElementById("clear-mcp-logs-btn").addEventListener("click", () => {
  document.getElementById("mcp-terminal-logs").innerHTML = `
    <div class="log-entry">
      <span class="log-time">[System]</span> Terminal logs cleared. Waiting for next MCP protocol event...
    </div>
  `;
});

/* ==========================================================================
   VIEW 3: RAG VECTOR SEARCH WORKBENCH
   ========================================================================== */
function setupRAGWorkbench() {
  const input = document.getElementById("rag-query-input");
  const btn = document.getElementById("rag-search-btn");
  const modeSelect = document.getElementById("rag-mode-select");
  const categorySelect = document.getElementById("rag-category-select");

  const runSearch = () => {
    const q = input.value.trim();
    if (q) renderRAGSearchTest(q);
  };

  btn.addEventListener("click", runSearch);
  modeSelect.addEventListener("change", runSearch);
  categorySelect.addEventListener("change", runSearch);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") runSearch();
  });
}

function renderRAGSearchTest(query) {
  const container = document.getElementById("rag-results-container");
  const mode = document.getElementById("rag-mode-select").value;
  const categoryFilter = document.getElementById("rag-category-select").value;

  const outcome = ragEngine.search(query, 6, { mode, categoryFilter, minScore: 0.001 });
  const results = outcome.results;
  const metrics = outcome.metrics;

  // Render Metrics Scorecard
  if (metrics) {
    document.getElementById("metric-p-k").textContent = metrics.precisionAtK;
    document.getElementById("metric-r-k").textContent = metrics.recallAtK;
    document.getElementById("metric-mrr").textContent = metrics.mrr;
    document.getElementById("metric-top-rrf").textContent = metrics.topScore;
    document.getElementById("metric-relevance").textContent = metrics.contextRelevance;
  }

  // Render HyDE Expanded Terms
  const expandedBox = document.getElementById("rag-expanded-terms");
  if (outcome.expandedQueryTerms) {
    expandedBox.innerHTML = `<span>HyDE Multi-Query Terms:</span> ` + outcome.expandedQueryTerms.map(t => `<span class="citation-pill" style="font-size: 10px;">${t}</span>`).join(" ");
  }

  document.getElementById("rag-results-count").textContent = `Showing ${results.length} matches`;

  if (results.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; color: var(--text-muted); padding: 20px;">No passage matches found for '${escapeHTML(query)}' under '${categoryFilter}' category. Try changing search terms or category filter.</div>`;
    return;
  }

  let html = "";
  results.forEach((res) => {
    html += `
      <div class="chunk-card">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-weight: 700; font-family: var(--font-heading); color: var(--text-cyan);">${res.chunk.docTitle}</span>
          <span class="score-badge">${res.combinedScore.toFixed(3)} RRF</span>
        </div>
        <div style="font-size: 11px; color: var(--text-accent);">Category: ${res.chunk.category} • Doc ID: ${res.chunk.docId} • Chunk: ${res.chunk.id}</div>
        <div style="font-size: 13px; color: var(--text-main); line-height: 1.5; background: rgba(15, 23, 42, 0.4); padding: 12px; border-radius: var(--radius-sm);">
          "${escapeHTML(res.chunk.content)}"
        </div>
        <div style="font-size: 11px; color: var(--text-subtle);">
          Matched Tokens: ${res.matchedTerms.map(t => `<code style="color: #67e8f9;">${t}</code>`).join(", ") || 'Semantic Cosine Match'}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

window.switchToRAGAndSearch = function (docTitle) {
  document.getElementById("nav-rag-btn").click();
  document.getElementById("rag-query-input").value = docTitle;
  renderRAGSearchTest(docTitle);
};

/* ==========================================================================
   VIEW 4: OPERATIONS DASHBOARD & TABLES
   ========================================================================== */
function setupDashboardSearch() {
  const input = document.getElementById("dash-search-input");
  if (!input) return;

  input.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase().trim();
    renderDashboardTables(q);
  });
}

function renderDashboardTables(filterQuery = "") {
  // Orders Table
  const ordersTbody = document.getElementById("orders-table-body");
  let ordersHTML = "";
  const filteredOrders = mockDb.orders.filter(o => 
    !filterQuery || o.id.toLowerCase().includes(filterQuery) || o.customerName.toLowerCase().includes(filterQuery) || o.carrier.toLowerCase().includes(filterQuery)
  );

  filteredOrders.forEach((o) => {
    let statusClass = "in-transit";
    if (o.status === "Delivered" || o.status === "Refunded") statusClass = "resolved";
    if (o.status === "Processing" || o.status === "On Hold") statusClass = "open";
    if (o.status === "Cancelled") statusClass = "cancelled";

    ordersHTML += `
      <tr>
        <td><strong>${o.id}</strong></td>
        <td>${o.customerName}</td>
        <td>${o.date}</td>
        <td>$${o.totalAmount.toFixed(2)}</td>
        <td>${o.carrier}</td>
        <td><span class="status-tag ${statusClass}">${o.status}</span></td>
      </tr>
    `;
  });
  ordersTbody.innerHTML = ordersHTML || `<tr><td colspan="6" style="color: var(--text-muted);">No orders matching search filter.</td></tr>`;

  // Tickets Table
  renderTicketsTable(filterQuery);
}

function renderTicketsTable(filterQuery = "") {
  const ticketsTbody = document.getElementById("tickets-table-body");
  let ticketsHTML = "";
  const filteredTickets = mockDb.tickets.filter(t => 
    !filterQuery || t.id.toLowerCase().includes(filterQuery) || t.customerName.toLowerCase().includes(filterQuery) || t.subject.toLowerCase().includes(filterQuery) || t.category.toLowerCase().includes(filterQuery)
  );

  filteredTickets.forEach((t) => {
    ticketsHTML += `
      <tr>
        <td><strong>${t.id}</strong></td>
        <td>${t.customerName}</td>
        <td>${t.subject}</td>
        <td>${t.category}</td>
        <td><span style="color: ${t.priority === 'High' || t.priority === 'Urgent' ? '#f43f5e' : '#fbbf24'}; font-weight: 600;">${t.priority}</span></td>
        <td><span class="status-tag ${t.status === 'Open' ? 'open' : (t.status === 'Resolved' ? 'resolved' : 'in-transit')}">${t.status}</span></td>
      </tr>
    `;
  });
  ticketsTbody.innerHTML = ticketsHTML || `<tr><td colspan="6" style="color: var(--text-muted);">No tickets matching search filter.</td></tr>`;
}

function updateDashboardMetrics() {
  document.getElementById("metric-kb-count").textContent = INITIAL_KNOWLEDGE_BASE.length;
  document.getElementById("metric-mcp-calls").textContent = mcpClient.availableTools.length;
  document.getElementById("metric-orders-count").textContent = mockDb.orders.length;
  document.getElementById("metric-tickets").textContent = mockDb.tickets.length;
  renderTicketsTable();
}

/* ==========================================================================
   UTILITY HELPERS
   ========================================================================== */
function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, (tag) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

function formatMarkdown(str) {
  return str
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="background: rgba(99,102,241,0.2); padding: 2px 6px; border-radius: 4px; font-family: var(--font-mono); font-size: 12px; color: #a5b4fc;">$1</code>')
    .replace(/\n/g, '<br>');
}

function getCurrentTime() {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function scrollToBottom(el) {
  el.scrollTop = el.scrollHeight;
}
