# ⚡ ResolveX — Autonomous AI Customer Support Platform (RAG + MCP v2)

![Version](https://img.shields.io/badge/version-1.1.0-blue.svg)
![Protocol](https://img.shields.io/badge/MCP-JSON--RPC%202.0-indigo.svg)
![RAG Engine](https://img.shields.io/badge/RAG-Hybrid%20RRF%20%2B%20HyDE-cyan.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

> **ResolveX** is an enterprise-grade, autonomous Customer Support AI Platform powered by **Hybrid Reciprocal Rank Fusion (RRF) Retrieval-Augmented Generation (RAG)** and the **Model Context Protocol (MCP v2)**. It delivers real-time order tracking, automated refunds, warranty checks, hardware technician dispatches, developer API key provisioning, and GDPR compliance data exports through standard JSON-RPC 2.0 tool calls.

---

## 🌟 Key Highlights & Features

### 1. 🔍 Advanced Hybrid RAG Knowledge Engine
- **Reciprocal Rank Fusion (Reranking)**: Combines BM25 lexical keyword scoring and TF-IDF Cosine vector similarity rank ($RRF(d) = \sum \frac{1}{k + r_m(d)}$ with $k=60$) for optimal context passage retrieval.
- **Multi-Query HyDE (Hypothetical Document Embeddings)**: Expands abstract user queries with domain-specific synsets to maximize recall.
- **Faceted Category Filtering**: Seamlessly filter searches across 6 Knowledge Base domains (*Shipping, Returns, Warranty, Security, Technical IoT, Billing & Enterprise SLAs*).
- **Live RAG Evaluation Metrics Scorecard**: Real-time evaluation calculating **Precision@K**, **Recall@K**, **MRR (Mean Reciprocal Rank)**, **Top Match RRF Score**, and **Context Relevance Score**.
- **20 Comprehensive Articles & 74 Semantic Chunks**: Indexed seed dataset covering warranty policies, firmware recovery, tariffs, 2FA security, and SLA uptime guarantees.

### 2. ⚡ Model Context Protocol (MCP v2) Server & Inspector
- **12 Standardized MCP Tools (JSON Schema)**:
  1. `search_knowledge_base`: Hybrid RAG search across knowledge base.
  2. `get_order_details`: Fetches order status, tracking, and carrier details.
  3. `process_refund_request`: Evaluates return policies and authorizes refunds.
  4. `create_support_ticket`: Escalates unresolved issues to human tier-2 support.
  5. `check_product_warranty`: Validates hardware warranty and Care+ coverage.
  6. `update_customer_profile`: Updates customer address and phone records.
  7. `cancel_order`: Cancels unfulfilled orders with automatic refund triggers.
  8. `generate_api_key`: Provisions developer API keys with rate-limiting scopes.
  9. `lookup_shipping_rate`: Calculates express and standard shipping courier costs.
  10. `schedule_field_technician`: Books on-site enterprise technician appointments.
  11. `fetch_system_health`: Reads real-time server cluster uptime and latency.
  12. `export_customer_data`: Generates GDPR / CCPA compliance data archives.
- **5 MCP Resources with Live Subscriptions**: Context documents and system health feeds with client subscription capabilities (`resources/subscribe` & `notifications/resources/updated`).
- **4 MCP System Prompt Templates**: Standardized prompt templates for persona definition, incident escalations, GDPR data requests, and billing dispute resolution (`prompts/get`).
- **Interactive Tool Execution Playground**: In-browser inspector to manually edit JSON-RPC parameters and test any MCP tool call in real time.

### 3. 💬 Autonomous Agent Reasoning & UI
- **Intent Analysis Engine**: Automatically parses user intents, order IDs (e.g. `ORD-8921`), serial numbers (e.g. `WN-99812`), and request categories.
- **Rich Interactive Action Cards**: Renders dynamic UI cards for order tracking, refund receipts, API keys, technician bookings, and system health status.
- **Customer Context Switcher**: Switch between **10 mock customer profiles** across Free, Pro Member, Enterprise, and VIP Concierge tiers.
- **Operations & Tickets Dashboard**: Real-time dashboard with search filters, 12 customer orders, and 10 support queue tickets.

---

## 🏗️ System Architecture & Workflow

```mermaid
flowchart TD
    User([Customer / Operator]) <--> UI[ResolveX Glassmorphism UI]
    UI <--> Agent[Customer Support Agent Core]
    
    subgraph RAG Engine
        Agent --> RAG[RAG Retrieval Engine]
        RAG --> Tokenizer[Tokenizer & HyDE Multi-Query Expander]
        Tokenizer --> BM25[BM25 Lexical Scorer]
        Tokenizer --> Vector[Cosine Vector Scorer]
        BM25 --> RRF[Reciprocal Rank Fusion - RRF Reranker]
        Vector --> RRF
        RRF --> Metrics[RAG Evaluation Scorecard Engine]
        RRF --> KB[(20 KB Articles / 74 Chunks)]
    end
    
    subgraph MCP Protocol Layer (JSON-RPC 2.0)
        Agent <--> Client[MCP Client Connector]
        Client <--> Server[MCP Protocol Server]
        Server <--> Tools[12 MCP Tools]
        Server <--> Resources[5 Resources & Subscriptions]
        Server <--> Prompts[4 Prompt Templates]
        Server <--> DB[(Mock Enterprise Database)]
    end
```

---

## 📁 Repository Structure

```
ResolveX/
├── README.md             # Project Documentation & Architecture Guide
├── index.html            # Main Single-Page Application (SPA) & UI Layout
├── styles.css            # Dark Glassmorphism CSS Design System
└── js/
    ├── agent/
    │   └── core.js       # Customer Support Agent reasoning loop & intent parser
    ├── data/
    │   ├── kb_data.js    # 20 Seed Knowledge Base articles & metadata
    │   └── mock_db.js    # 10 Customers, 12 Orders, 10 Warranties, 10 Tickets
    ├── mcp/
    │   ├── client.js     # MCP JSON-RPC 2.0 client & subscription connector
    │   └── server.js     # MCP Server exposing 12 tools, 5 resources, 4 prompts
    ├── rag/
    │   └── engine.js     # Hybrid BM25+Vector RRF search engine & metrics evaluator
    └── ui/
        └── app.js        # Master UI controller, event bindings & tab routers
```

---

## 🚀 Quick Start & Usage

No build tools or server dependencies required! **ResolveX** runs purely in any modern web browser.

### Option 1: Direct File Launch
1. Clone the repository:
   ```bash
   git clone https://github.com/suryansh1241/ResolveX.git
   cd ResolveX
   ```
2. Open `index.html` directly in your browser (Chrome, Edge, Firefox, Safari).

### Option 2: Local HTTP Server
Run a quick local web server:
```bash
npx serve .
# or using Python:
python -m http.server 8000
```
Navigate to `http://localhost:8000`.

---

## 🛠️ MCP Tools Directory

| Tool Name | Parameters | Description |
| :--- | :--- | :--- |
| `search_knowledge_base` | `query`, `topK`, `categoryFilter` | Queries hybrid RAG engine for authoritative policy/FAQ passages. |
| `get_order_details` | `orderId` | Retrieves order status, carrier tracking, items, and delivery date. |
| `process_refund_request` | `orderId`, `reason`, `customerName` | Evaluates 30-day return policy and authorizes instant refunds. |
| `create_support_ticket` | `customerName`, `subject`, `category`, `priority`, `details` | Opens a priority tier-2 support ticket. |
| `check_product_warranty` | `serialNumber` | Validates 2-year hardware warranty and Care+ coverage. |
| `update_customer_profile` | `customerId`, `newAddress`, `newPhone` | Updates customer profile records in database. |
| `cancel_order` | `orderId`, `reason` | Cancels unfulfilled processing orders for a 100% refund. |
| `generate_api_key` | `customerId`, `keyName` | Provisions developer API keys with rate-limiting scopes. |
| `lookup_shipping_rate` | `countryCode` | Calculates express and standard shipping courier rates. |
| `schedule_field_technician` | `customerId`, `preferredDate`, `issueDescription` | Books on-site enterprise hardware repair dispatch. |
| `fetch_system_health` | `includeRegions` | Reads real-time server cluster uptime and regional pings. |
| `export_customer_data` | `customerId` | Generates GDPR/CCPA compliance data export archive. |

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.
