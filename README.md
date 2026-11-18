# 🚢 ClearanceFlow AI
> **Autonomous Cross-Border Freight Compliance & Customs Brokerage Copilot**  
> *Production-Grade Architecture Reference: PostgreSQL pgvector, Quarterly Range Partitioning, and Model Context Protocol (MCP) Multi-Tool Chaining.*

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15%2B%20%7C%20pgvector-336791?style=flat-square&logo=postgresql)](https://github.com/pgvector/pgvector)
[![MCP](https://img.shields.io/badge/Architecture-Model%20Context%20Protocol-00C7B7?style=flat-square)](https://modelcontextprotocol.io)
[![CI/CD Gatekeeper](https://github.com/mricky/ClearanceFlow-AI/actions/workflows/gatekeeper.yml/badge.svg)](https://github.com/mricky/ClearanceFlow-AI/actions/workflows/gatekeeper.yml)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

---

## 🧭 1. Executive Summary

In international maritime shipping and cross-border trade, **customs clearance delays and container hold-ups** (e.g. Red Channel physical inspections, phytosanitary quarantine holds) are the #1 source of operational friction and financial loss. Unresolved holds trigger punitive **Demurrage & Detention (D&D)** penalties accumulating thousands of dollars per day.

**ClearanceFlow AI** is an enterprise-grade reference platform designed to demonstrate how modern AI engineering bridges transactional operational data with statutory regulatory compliance:
1. **Live Operational Manifests:** Telemetry, Reefer temperatures, SOLAS VGM weights, and CEISA / WCO customs statuses partitioned quarterly across millions of records.
2. **Statutory Trade Compliance RAG:** Unified inside **PostgreSQL using `pgvector` and GIN**, executing **Hybrid Search (Reciprocal Rank Fusion - RRF)** against international maritime trade laws.
3. **Autonomous Agentic Chaining (MCP):** Connects live database lookups, financial exposure calculators, and legal force majeure dispute generators in a single reasoning loop.

---

## 🏛️ 2. Architectural Blueprint

```
                            ┌────────────────────────────────────────────────────────┐
                            │                 VERCEL EDGE (Next.js 15)               │
                            │   • Data-Dense Logistics Cockpit (Slate/Linear Theme)  │
                            │   • Autonomous Agent Reasoning & ReAct Loop            │
                            └──────────────────────────┬─────────────────────────────┘
                                                       │
                                   ┌───────────────────┴───────────────────┐
                                   │                                       │
                         [ Operational Tools ]                    [ Statutory RAG Tool ]
                                   │                                       │
                                   ▼                                       ▼
                       ┌───────────────────────┐               ┌───────────────────────┐
                       │   MCP TOOL CHAINING   │               │   HYBRID SEARCH RAG   │
                       │ • lookup_shipment()   │               │ • Dense Vector (HNSW) │
                       │ • calc_demurrage()    │               │ • Lexical BM25 (GIN)  │
                       │ • draft_dispute()     │               │ • Reciprocal Rank RRF │
                       └───────────┬───────────┘               └───────────┬───────────┘
                                   │                                       │
                                   └───────────────────┬───────────────────┘
                                                       │
                                                       ▼
                            ┌────────────────────────────────────────────────────────┐
                            │                  SUPABASE / POSTGRESQL                 │
                            │  • Range Partitioning (shipments_2026_q1..q4)          │
                            │  • pgvector Extension (HNSW m=16, ef_constr=64)        │
                            │  • GIN Index on tsvector ('simple' / 'english')        │
                            │  • Zero-Downtime Migration Standards                   │
                            └────────────────────────────────────────────────────────┘
```

---

## ⚡ 3. The 4 Engineering Pillars

### 1. High-Scale Range Partitioning (Partition Pruning)
Container tracking tables are partitioned quarterly by `created_at` (`shipments_2026_q1`, `q2`, `q3`, `q4`) with a safety catchment `shipments_default`.  
* **Benefit:** Compile-time **Partition Pruning** automatically skips 80% of data during range queries, keeping I/O latency under 2ms across 10M+ rows.

### 2. AI Database Engineering: Hybrid Search via Reciprocal Rank Fusion (RRF)
Rather than maintaining external vector databases (Pinecone/Milvus), semantic vectors (`vector(1536)`) and keyword vectors (`tsvector`) reside in the same PostgreSQL table:
$$\text{RRF Score} = \frac{1}{60 + \text{Rank}_{\text{lexical}}} + \frac{1}{60 + \text{Rank}_{\text{vector}}}$$
* **HNSW Index:** Multi-layer graph index configured with `m = 16, ef_construction = 64` using Cosine Distance (`<=>`).
* **GIN Index:** Lexical full-text inverted index for exact HS Codes, container serials, and acronyms (`SPJM`, `CEISA`, `VGM`).

### 3. Model Context Protocol (MCP) Autonomous Tool Chaining
When an operator asks a question, the copilot executes a deterministic multi-step ReAct sequence:
* **Step 1:** `lookup_shipment(identifier)` $\rightarrow$ Queries container status, demurrage free-time clock, and reefer temperature.
* **Step 2:** `search_compliance_knowledge(query)` $\rightarrow$ Retrieves binding statutory articles from `knowledge_documents`.
* **Step 3:** `calculate_demurrage_risk(container_no)` $\rightarrow$ Computes daily accrual and checks force majeure eligibility.
* **Step 4:** `generate_dispute_draft(shipment_id)` $\rightarrow$ Automatically drafts a formal legal waiver letter to the ocean carrier.

### 4. Zero-Downtime SRE Migration Standards
All database schema changes comply with zero-downtime rules:
* `CREATE INDEX CONCURRENTLY` to avoid write locks.
* Safe 2-step Foreign Key validation (`NOT VALID` followed by background `VALIDATE CONSTRAINT`).
* Mandatory session guardrail: `SET lock_timeout = '2s'` to prevent connection pool exhaustion.

---

## 🎮 4. Interactive Testing Scenarios (Bilingual Guidance)

Use the built-in quick-prompt chips or type directly into the copilot:

| Scenario | Language | Sample Query | Triggered Tools |
| :--- | :---: | :--- | :--- |
| **Customs Hold Audit** | 🇬🇧 EN | `"Check container #MSKU-992104: Why is it held under Red Channel and what statutory regulations apply?"` | `lookup_shipment` + RAG SOP SPJM |
| **Demurrage Dispute** | 🇮🇩 ID | `"Kontainer #OCLU-883192 terkena antrean behandle pelabuhan. Hitung denda demurrage dan buatkan draf surat sanggahannya!"` | `calculate_demurrage` + `generate_dispute_draft` |
| **Maritime Safety** | 🇬🇧 EN | `"What are the mandatory SOLAS VGM certification requirements before maritime port gate-in?"` | RAG SOLAS Chapter VI |
| **Quarantine & Phyto** | 🇮🇩 ID | `"Bagaimana regulasi fumigasi palet kayu ekspor ISPM 15 agar tidak dicekal di negara tujuan?"` | RAG ISPM #15 Heat Treatment |

---

## 🚀 5. Quick Start & Deployment

### Local Development:
```bash
git clone https://github.com/mricky/clearanceflow-ai.git
cd clearanceflow-ai

# Install dependencies
npm install

# Run development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the cockpit.

### Supabase Setup (Optional Live Connection):
Execute the migration scripts in sequential order inside the Supabase SQL Editor:
1. `supabase/migrations/20260218_01_partitioned_shipments.sql`
2. `supabase/migrations/20260218_02_pgvector_compliance_rag.sql`

Add credentials to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Vercel 1-Click Deployment:
Push to GitHub and import the repository directly into Vercel. Works out-of-the-box with zero build configuration!

---

## 👨‍💻 Author & Engineering Profile

**Mohamad Ricky Susanto**  
*Lead Systems Architect & Senior AI Platform Engineer (14+ Years Experience)*  
Specialized in Enterprise Distributed Systems, Database Concurrency, and Autonomous AI Platforms.

* **LinkedIn:** [linkedin.com/in/mohamad-ricky-1949b8ab](https://linkedin.com/in/mohamad-ricky-1949b8ab)  
* **GitHub:** [github.com/mricky](https://github.com/mricky)  
* **Email:** mricky.it@gmail.com
