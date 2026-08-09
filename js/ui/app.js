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
  setupChatListeners();
  setupCustomerSelector();
  setupRAGWorkbench();

  // 3. Initial View Renders
  renderMCPToolsRegistry();
  renderDashboardTables();
  renderRAGSearchTest("return policy 30 days refund");
});

/* ==========================================================================
   NAVIGATION & TAB SWITCHER
   ========================================================================== */
function setupTabNavigation() {
  const tabButtons = document.querySelectorAll(".tab-btn");
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
      <span style="font-size: 12px; color: var(--text-accent);">ResolveX Agent processing via MCP & RAG...</span>
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

  // Update Sidebar Citations
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
        <div style="margin-top: 6px; font-size: 10px; color: var(--text-accent);">Match Score: ${(c.score * 100).toFixed(1)}%</div>
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

function renderMCPLogEntry(logData) {
  const container = document.getElementById("mcp-terminal-logs");
  if (!container) return;

  const logEl = document.createElement("div");
  const isErr = logData.direction === "RESPONSE" && logData.data.error;
  logEl.className = `log-entry ${isErr ? 'error' : ''}`;

  logEl.innerHTML = `
    <div>
      <span class="log-time">[${logData.timestamp}]</span>
      <strong style="color: ${logData.direction === 'REQUEST' ? '#38bdf8' : '#34d399'}">${logData.direction}</strong>
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

  const runSearch = () => {
    const q = input.value.trim();
    if (q) renderRAGSearchTest(q);
  };

  btn.addEventListener("click", runSearch);
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") runSearch();
  });
}

function renderRAGSearchTest(query) {
  const container = document.getElementById("rag-results-container");
  const results = ragEngine.search(query, 6, 0.05);

  if (results.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; color: var(--text-muted);">No passage matches found for '${escapeHTML(query)}'. Try relaxing search terms.</div>`;
    return;
  }

  let html = "";
  results.forEach((res) => {
    html += `
      <div class="chunk-card">
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <span style="font-weight: 700; font-family: var(--font-heading); color: var(--text-cyan);">${res.chunk.docTitle}</span>
          <span class="score-badge">${(res.score * 100).toFixed(1)}% Match</span>
        </div>
        <div style="font-size: 11px; color: var(--text-accent);">Category: ${res.chunk.category} • Chunk ID: ${res.chunk.id}</div>
        <div style="font-size: 13px; color: var(--text-main); line-height: 1.5; background: rgba(15, 23, 42, 0.4); padding: 12px; border-radius: var(--radius-sm);">
          "${escapeHTML(res.chunk.content)}"
        </div>
        <div style="font-size: 11px; color: var(--text-subtle);">
          Matched Tokens: ${res.matchedTerms.map(t => `<code style="color: #67e8f9;">${t}</code>`).join(", ")}
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
function renderDashboardTables() {
  // Orders Table
  const ordersTbody = document.getElementById("orders-table-body");
  let ordersHTML = "";
  mockDb.orders.forEach((o) => {
    ordersHTML += `
      <tr>
        <td><strong>${o.id}</strong></td>
        <td>${o.customerName}</td>
        <td>${o.date}</td>
        <td>$${o.totalAmount.toFixed(2)}</td>
        <td>${o.carrier}</td>
        <td><span class="status-tag in-transit">${o.status}</span></td>
      </tr>
    `;
  });
  ordersTbody.innerHTML = ordersHTML;

  // Tickets Table
  renderTicketsTable();
}

function renderTicketsTable() {
  const ticketsTbody = document.getElementById("tickets-table-body");
  let ticketsHTML = "";
  mockDb.tickets.forEach((t) => {
    ticketsHTML += `
      <tr>
        <td><strong>${t.id}</strong></td>
        <td>${t.customerName}</td>
        <td>${t.subject}</td>
        <td>${t.category}</td>
        <td><span style="color: ${t.priority === 'High' ? '#f43f5e' : '#fbbf24'}; font-weight: 600;">${t.priority}</span></td>
        <td><span class="status-tag ${t.status === 'Open' ? 'open' : 'resolved'}">${t.status}</span></td>
      </tr>
    `;
  });
  ticketsTbody.innerHTML = ticketsHTML;
}

function updateDashboardMetrics() {
  document.getElementById("metric-queries").textContent = supportAgent.chatHistory.filter(m => m.role === 'user').length + 14;
  document.getElementById("metric-mcp-calls").textContent = mcpClient.logs.length + 8;
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
