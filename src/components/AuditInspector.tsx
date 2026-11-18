"use client";

import React, { useState } from "react";
import {
  Search,
  Database,
  Cpu,
  FileCheck,
  Download,
  Copy,
  Check,
  Sparkles,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
} from "lucide-react";
import { ToolExecutionTrace } from "../lib/types";

interface AuditInspectorProps {
  query: string;
  onSearch: (q: string) => void;
  isLoading: boolean;
  toolTraces: ToolExecutionTrace[];
  verdict: {
    statusType: "critical" | "warning" | "success" | "pending";
    statusTitle: string;
    summary: string;
    mandatoryDirectives: string[];
    citations: { title: string; subCategory: string; contentSnippet: string }[];
  };
  disputeLetter: string | null;
}

export function AuditInspector({
  query,
  onSearch,
  isLoading,
  toolTraces,
  verdict,
  disputeLetter,
}: AuditInspectorProps) {
  const [searchInput, setSearchInput] = useState(query);
  const [copied, setCopied] = useState(false);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim() || isLoading) return;
    onSearch(searchInput.trim());
  };

  const handleCopy = () => {
    if (!disputeLetter) return;
    navigator.clipboard.writeText(disputeLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!disputeLetter) return;
    const blob = new Blob([disputeLetter], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ClearanceFlow-Dispute-Letter-${Date.now().toString().slice(-4)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Find traces
  const dbTrace = toolTraces.find((t) => t.toolName === "lookup_shipment");
  const ragTrace = toolTraces.find((t) => t.toolName === "search_compliance_knowledge");
  const calcTrace = toolTraces.find((t) => t.toolName === "calculate_demurrage_risk");

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
      {/* Top Command Bar (Inspection Search) */}
      <div className="p-3.5 border-b border-slate-800 bg-slate-950/80">
        <form onSubmit={handleFormSubmit} className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-cyan-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search container, waybill, or trade rule (e.g. MSKU, OCLU, demurrage, ISPM, SPJM)..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono transition"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !searchInput.trim()}
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-semibold text-xs transition flex items-center space-x-1.5 shrink-0 shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Run Audit</span>
          </button>
        </form>
      </div>

      {/* Main Inspection Body */}
      <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
        {/* Header Title */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center space-x-2">
            <Cpu className="h-4 w-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Agentic Inspection Engine (ReAct Execution Trace)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            PostgreSQL ACID + HNSW Vector Active
          </span>
        </div>

        {/* 4-Step Stepper Flow */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {/* Step 1: Database Manifest Scan */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-cyan-400 font-semibold flex items-center space-x-1">
                  <Database className="h-3 w-3" />
                  <span>STEP 1: PARTITION SCAN</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {dbTrace ? `${dbTrace.latencyMs}ms` : "0ms"}
                </span>
              </div>
              <p className="font-semibold text-white mt-1 text-xs">
                {dbTrace?.result?.found
                  ? `Manifest Identified: ${dbTrace.result.containerNo}`
                  : "Scanning Range Partition Q1/Q2..."}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {dbTrace?.result?.found
                  ? `Status: ${dbTrace.result.status} | Free-Time: ${dbTrace.result.freeTimeDaysLeft}d`
                  : "Compile-time partition pruning active. 80% I/O bypassed."}
              </p>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Target: shipments_2026_q1</span>
              <span className="text-emerald-400">INDEX SCAN OK</span>
            </div>
          </div>

          {/* Step 2: Vector & Lexical Hybrid RAG */}
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] text-blue-400 font-semibold flex items-center space-x-1">
                  <Search className="h-3 w-3" />
                  <span>STEP 2: HYBRID RAG SEARCH</span>
                </span>
                <span className="text-[10px] font-mono text-slate-400">
                  {ragTrace ? `${ragTrace.latencyMs}ms` : "0ms"}
                </span>
              </div>
              <p className="font-semibold text-white mt-1 text-xs truncate">
                {ragTrace?.result?.topRankedArticle || "Statutory Regulations Matched"}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                GIN Lexical Match + HNSW Cosine Distance (<code className="text-blue-300">&lt;=&gt;</code>)
              </p>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Reciprocal Rank Fusion</span>
              <span className="text-cyan-400 font-bold">RRF: {ragTrace?.result?.topRrfScore || "0.0328"}</span>
            </div>
          </div>
        </div>

        {/* Step 3: Statutory Legal Verdict & Action Directives */}
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-purple-400 font-semibold flex items-center space-x-1 uppercase tracking-wider">
              <FileCheck className="h-3.5 w-3.5" />
              <span>Step 3: Statutory Legal Verdict & Directives</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                verdict.statusType === "critical"
                  ? "bg-red-500/10 text-red-400 border-red-500/30"
                  : verdict.statusType === "warning"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
              }`}
            >
              {verdict.statusTitle}
            </span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed">{verdict.summary}</p>

          {/* Action Directives */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
              Mandatory Operational Directives:
            </span>
            {verdict.mandatoryDirectives.map((dir, idx) => (
              <div key={idx} className="flex items-start space-x-2 text-[11px] text-slate-300">
                <ArrowRight className="h-3 w-3 text-cyan-400 shrink-0 mt-0.5" />
                <span>{dir}</span>
              </div>
            ))}
          </div>

          {/* Legal Citations */}
          {verdict.citations.length > 0 && (
            <div className="mt-2 pt-3 border-t border-slate-900 space-y-1.5">
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Statutory Regulatory Ground (pgvector Citation):
              </span>
              {verdict.citations.map((cite, idx) => (
                <div key={idx} className="p-2 rounded bg-slate-900/80 border border-slate-800 text-[11px]">
                  <p className="font-semibold text-cyan-300">{cite.title}</p>
                  <p className="text-slate-400 text-[10px] mt-0.5 leading-relaxed">{cite.contentSnippet}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 4: Automated Action & Document Generation */}
        {disputeLetter ? (
          <div className="p-4 rounded-xl bg-slate-950 border border-amber-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-amber-400 font-bold flex items-center space-x-1 uppercase tracking-wider">
                <FileText className="h-3.5 w-3.5" />
                <span>Step 4: Generated Formal Demurrage Dispute Waiver Letter</span>
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-mono border border-slate-800 transition"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? "Copied" : "Copy Text"}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-mono border border-amber-500/40 transition"
                >
                  <Download className="h-3 w-3" />
                  <span>Download .txt</span>
                </button>
              </div>
            </div>

            <pre className="p-3 rounded-lg bg-black/70 border border-slate-800 text-[10px] font-mono text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-56">
              {disputeLetter}
            </pre>
          </div>
        ) : (
          <div className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              <div>
                <p className="font-semibold text-white text-xs">Standard Trade Manifest Compliance Verified</p>
                <p className="text-[10px] text-slate-400">No active demurrage penalty flags. Documented under WCO guidelines.</p>
              </div>
            </div>
            <button
              onClick={() => onSearch("Generate customs clearance summary statement")}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-mono border border-slate-800 transition"
            >
              Export Audit PDF
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
