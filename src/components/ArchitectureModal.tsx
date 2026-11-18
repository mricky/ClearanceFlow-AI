"use client";

import React from "react";
import { X, Database, Search, Cpu, ShieldAlert, CheckCircle2 } from "lucide-react";

interface ArchitectureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ArchitectureModal({ isOpen, onClose }: ArchitectureModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-100">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Database className="h-5 w-5 text-cyan-400" />
              <span>ClearanceFlow AI: Enterprise Architecture & Stack Specification</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Production Design Reference: High-Scale PostgreSQL + pgvector + Model Context Protocol
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 text-sm">
          {/* Pillar 1 */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80">
            <h3 className="font-semibold text-cyan-400 flex items-center space-x-2 mb-1.5">
              <CheckCircle2 className="h-4 w-4" />
              <span>1. High-Scale Range Partitioning (PostgreSQL 15+)</span>
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Shipment records are partitioned quarterly by <code className="text-cyan-300">created_at</code> (e.g.{" "}
              <code className="text-cyan-300">shipments_2026_q1</code>, <code className="text-cyan-300">q2</code>) with a default catchment partition.
              Compile-time <strong>Partition Pruning</strong> isolates queries to a single partition, bypassing 80% of disk I/O on 10M+ rows.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80">
            <h3 className="font-semibold text-blue-400 flex items-center space-x-2 mb-1.5">
              <Search className="h-4 w-4" />
              <span>2. AI Database Engineering & Hybrid Search (pgvector + GIN)</span>
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Statutory trade compliance documents are indexed simultaneously using:
            </p>
            <ul className="list-disc list-inside text-xs text-slate-400 mt-1.5 space-y-1">
              <li>
                <strong>Dense Semantic Vectors:</strong> 1,536-dimensional embeddings with{" "}
                <code className="text-blue-300">HNSW (m=16, ef_construction=64)</code> using Cosine Distance (<code className="text-blue-300">&lt;=&gt;</code>).
              </li>
              <li>
                <strong>Lexical Full-Text Search:</strong> PostgreSQL <code className="text-blue-300">tsvector</code> with GIN indexing for exact SKU & HS Codes.
              </li>
              <li>
                <strong>Reciprocal Rank Fusion (RRF):</strong> Merges rank scores via{" "}
                <code className="text-blue-300 font-mono">1.0/(60 + rank_lexical) + 1.0/(60 + rank_vector)</code> in a single SQL CTE.
              </li>
            </ul>
          </div>

          {/* Pillar 3 */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80">
            <h3 className="font-semibold text-emerald-400 flex items-center space-x-2 mb-1.5">
              <Cpu className="h-4 w-4" />
              <span>3. Model Context Protocol (MCP) Autonomous Tool Chaining</span>
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              The AI Copilot does not rely on single-shot hallucinations. It executes an autonomous 3-step reasoning chain:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-2 font-mono text-[11px]">
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                <span className="text-emerald-400 font-bold">Tool 1: lookup_shipment</span>
                <p className="text-slate-500 mt-1">Queries live container telemetry & customs clearance state.</p>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                <span className="text-cyan-400 font-bold">Tool 2: search_compliance</span>
                <p className="text-slate-500 mt-1">Hybrid RAG search against statutory customs regulations.</p>
              </div>
              <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                <span className="text-amber-400 font-bold">Tool 3: calculate_demurrage</span>
                <p className="text-slate-500 mt-1">Calculates financial exposure and drafts force majeure waivers.</p>
              </div>
            </div>
          </div>

          {/* Pillar 4 */}
          <div className="p-4 rounded-lg bg-slate-950 border border-slate-800/80">
            <h3 className="font-semibold text-amber-400 flex items-center space-x-2 mb-1.5">
              <ShieldAlert className="h-4 w-4" />
              <span>4. Zero-Downtime Migration & SRE Guardrails</span>
            </h3>
            <p className="text-slate-300 text-xs leading-relaxed">
              Database schema updates follow strict production SRE standards: <code className="text-amber-300">CREATE INDEX CONCURRENTLY</code>, 2-step Foreign Key validation (<code className="text-amber-300">NOT VALID</code> followed by background validation), and session-level <code className="text-amber-300">SET lock_timeout = &apos;2s&apos;</code> to prevent connection pool exhaustion.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
          >
            Close Specification
          </button>
        </div>
      </div>
    </div>
  );
}
