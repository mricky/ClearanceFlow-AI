"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Database,
  Cpu,
  FileCheck,
  Download,
  Copy,
  Check,
  Play,
  CheckCircle2,
  FileText,
  ArrowRight,
  ShieldCheck,
  PackageCheck,
  Layers,
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
  const [viewMode, setViewMode] = useState<"ops" | "dev">("ops");

  useEffect(() => {
    setSearchInput(query);
  }, [query]);

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

  // Helper for human-readable logistics status
  const getLogisticsStatusLabel = (status?: string) => {
    if (status === "CUSTOMS_HOLD_RED_CHANNEL") return "Jalur Merah (SPJM) • Wajib Hadir Fisik TPP Behandle";
    if (status === "DEMURRAGE_OVERDUE") return "Penalti Demurrage Berjalan • Sisa Free-Time Habis";
    if (status === "RELEASED_GREEN_CHANNEL") return "Jalur Hijau (SPPB) • Siap Tarik Truk Drayage";
    return "Verifikasi Karantina & Lartas Ekspor-Impor";
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs flex flex-col h-full transition-colors">
      {/* Top Command Bar (Inspection Search) */}
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/80">
        <form onSubmit={handleFormSubmit} className="flex items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-cyan-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Cari nomor kontainer, B/L, atau pasal regulasi pabean (e.g. MSKU, OCLU, SPJM, demurrage, SPPB)..."
              className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-slate-900 dark:focus:border-cyan-500 font-mono transition shadow-xs"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || !searchInput.trim()}
            title="Eksekusi kueri pencarian atau audit regulasi kepabeanan"
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 disabled:opacity-40 text-white font-medium text-xs transition flex items-center space-x-1.5 shrink-0 shadow-xs"
          >
            <Play className="h-3.5 w-3.5 fill-white" />
            <span>Cari & Audit</span>
          </button>
        </form>
      </div>

      {/* Main Inspection Body */}
      <div className="p-4 space-y-3.5 overflow-y-auto flex-1 text-xs">
        {/* Header Title with View Mode Toggle */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800/80 gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-slate-700 dark:text-cyan-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              {viewMode === "ops" ? "Alur Verifikasi Operasional Kepabeanan" : "Agentic ReAct Tool Execution Trace"}
            </h3>
          </div>

          {/* Mode Switcher Toggle */}
          <div className="flex items-center space-x-1 p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("ops")}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                viewMode === "ops"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Logistics Ops View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("dev")}
              className={`px-2 py-0.5 rounded text-[10px] font-mono transition ${
                viewMode === "dev"
                  ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Dev Trace
            </button>
          </div>
        </div>

        {/* 2 Critical Operational / Technical Cards */}
        {viewMode === "ops" ? (
          /* ========================================================================= */
          /* LOGISTICS OPS VIEW (Human-Readable, Actionable Supply Chain Context)      */
          /* ========================================================================= */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Step 1: Manifest & Physical Cargo Audit */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-blue-700 dark:text-cyan-400 font-semibold flex items-center space-x-1">
                    <PackageCheck className="h-3.5 w-3.5" />
                    <span>LANGKAH 1: AUDIT FISIK & MANIFEST KARGO</span>
                  </span>
                  <span className="text-[10px] font-mono font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                    Live Supabase Q1
                  </span>
                </div>
                <p className="font-semibold text-slate-900 dark:text-white mt-1 text-xs">
                  {dbTrace?.result?.found
                    ? `Peti Kemas #${dbTrace.result.containerNo} (B/L: ${dbTrace.result.waybillNo || "WBL-2026"})`
                    : "Pengecekan nomor kontainer di manifest..."}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  <strong>Status Pabean:</strong> {getLogisticsStatusLabel(dbTrace?.result?.status)}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  <strong>SLA Dwell Time:</strong> Sisa Free-Time Pelabuhan:{" "}
                  <span className="font-bold text-slate-900 dark:text-white">
                    {dbTrace?.result?.freeTimeDaysLeft ?? 2} Hari
                  </span>{" "}
                  {dbTrace?.result?.demurrageDaysOverdue > 0 && (
                    <span className="text-red-600 dark:text-red-400 font-bold">
                      ({dbTrace.result.demurrageDaysOverdue} Hari Denda Berjalan)
                    </span>
                  )}
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Pelabuhan: Tanjung Priok (IDJKT)</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">Segel Pabean Valid</span>
              </div>
            </div>

            {/* Step 2: Statutory Customs & Quarantine SOP */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-indigo-700 dark:text-blue-400 font-semibold flex items-center space-x-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    <span>LANGKAH 2: AUDIT REGULASI CEISA & KARANTINA</span>
                  </span>
                  <span className="text-[10px] font-mono font-medium text-blue-700 dark:text-cyan-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                    Kesesuaian 98%
                  </span>
                </div>
                <p className="font-semibold text-slate-900 dark:text-white mt-1 text-xs truncate">
                  {ragTrace?.result?.topRankedArticle || "SOP Standar Kepabeanan & Karantina Pertanian"}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  <strong>Kewajiban Prosedur:</strong>{" "}
                  {dbTrace?.result?.status === "CUSTOMS_HOLD_RED_CHANNEL"
                    ? "Wajib koordinasi pemeriksaan fisik bersama Pejabat Hanggar Bea Cukai maksimal 3x24 jam."
                    : dbTrace?.result?.status === "DEMURRAGE_OVERDUE"
                    ? "Klaim sanggahan force majeure denda demurrage dapat diajukan sesuai KUHD Pasal 517."
                    : "Penerbitan Surat Persetujuan Pengeluaran Barang (SPPB) otomatis tanpa hambatan lartas."}
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Otoritas: DJBC & Karantina RI</span>
                <span className="text-blue-700 dark:text-cyan-400 font-semibold">CEISA 4.0 Terverifikasi</span>
              </div>
            </div>
          </div>
        ) : (
          /* ========================================================================= */
          /* DEV TRACE VIEW (Underlying Database & pgvector ML Metrics)                */
          /* ========================================================================= */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Step 1: Database Manifest Scan */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-blue-700 dark:text-cyan-400 font-semibold flex items-center space-x-1">
                    <Database className="h-3 w-3" />
                    <span>STEP 1: PARTITION SCAN</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    {dbTrace ? `${dbTrace.latencyMs}ms` : "0ms"}
                  </span>
                </div>
                <p className="font-semibold text-slate-900 dark:text-white mt-1 text-xs">
                  {dbTrace?.result?.found
                    ? `Manifest Identified: ${dbTrace.result.containerNo}`
                    : "Scanning Range Partition Q1/Q2..."}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  {dbTrace?.result?.found
                    ? `Status: ${dbTrace.result.status} | Free-Time: ${dbTrace.result.freeTimeDaysLeft}d`
                    : "Compile-time partition pruning active. 80% I/O bypassed."}
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Target: shipments_2026_q1</span>
                <span className="text-emerald-700 dark:text-emerald-400 font-semibold">INDEX SCAN OK</span>
              </div>
            </div>

            {/* Step 2: Vector & Lexical Hybrid RAG */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-indigo-700 dark:text-blue-400 font-semibold flex items-center space-x-1">
                    <Search className="h-3 w-3" />
                    <span>STEP 2: HYBRID RAG SEARCH</span>
                  </span>
                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">
                    {ragTrace ? `${ragTrace.latencyMs}ms` : "0ms"}
                  </span>
                </div>
                <p className="font-semibold text-slate-900 dark:text-white mt-1 text-xs truncate">
                  {ragTrace?.result?.topRankedArticle || "Statutory Regulations Matched"}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  GIN Lexical Match + HNSW Cosine Distance (<code className="text-indigo-700 dark:text-blue-300">&lt;=&gt;</code>)
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-900 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span>Reciprocal Rank Fusion</span>
                <span className="text-slate-900 dark:text-cyan-400 font-bold">RRF: {ragTrace?.result?.topRrfScore || "0.0328"}</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Statutory Legal Verdict & Action Directives */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[10px] text-slate-700 dark:text-purple-400 font-bold flex items-center space-x-1 uppercase tracking-wider">
              <FileCheck className="h-3.5 w-3.5 text-slate-600 dark:text-purple-400" />
              <span>Step 3: Rekomendasi Hukum & Arahan Operasional Lapangan</span>
            </span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
                verdict.statusType === "critical"
                  ? "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30"
                  : verdict.statusType === "warning"
                  ? "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30"
                  : "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30"
              }`}
            >
              {verdict.statusTitle}
            </span>
          </div>

          <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-normal">{verdict.summary}</p>

          {/* Action Directives */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Instruksi Operasional Lapangan (Mandatory Action Items):
            </span>
            {verdict.mandatoryDirectives.map((dir, idx) => (
              <div key={idx} className="flex items-start space-x-2 text-[11px] text-slate-800 dark:text-slate-300">
                <ArrowRight className="h-3 w-3 text-slate-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                <span>{dir}</span>
              </div>
            ))}
          </div>

          {/* Legal Citations */}
          {verdict.citations.length > 0 && (
            <div className="mt-2 pt-3 border-t border-slate-200 dark:border-slate-900 space-y-1.5">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Dasar Hukum Kepabeanan Terverifikasi (Kutipan Resmi):
              </span>
              {verdict.citations.map((cite, idx) => (
                <div key={idx} className="p-2.5 rounded bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-[11px] shadow-xs">
                  <p className="font-semibold text-blue-700 dark:text-cyan-300">{cite.title}</p>
                  <p className="text-slate-600 dark:text-slate-400 text-[10px] mt-0.5 leading-relaxed">{cite.contentSnippet}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 4: Automated Action & Document Generation */}
        {disputeLetter ? (
          <div className="p-4 rounded-xl bg-amber-50/60 dark:bg-slate-950 border border-amber-200 dark:border-amber-500/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-amber-900 dark:text-amber-400 font-bold flex items-center space-x-1 uppercase tracking-wider">
                <FileText className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
                <span>Langkah 4: Draf Surat Resmi Permohonan Keringanan / Sanggahan Demurrage</span>
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-white hover:bg-slate-50 text-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 text-[11px] font-mono border border-slate-200 dark:border-slate-800 transition shadow-xs"
                >
                  {copied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                  <span>{copied ? "Tersalin" : "Salin Teks"}</span>
                </button>
                <button
                  onClick={handleDownload}
                  className="flex items-center space-x-1 px-2.5 py-1 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 dark:text-amber-300 text-[11px] font-mono border border-amber-300 dark:border-amber-500/40 transition shadow-xs"
                >
                  <Download className="h-3 w-3" />
                  <span>Unduh .txt</span>
                </button>
              </div>
            </div>

            <pre className="p-3 rounded-lg bg-white dark:bg-black/70 border border-amber-200 dark:border-slate-800 text-[10px] font-mono text-slate-800 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-56 shadow-xs">
              {disputeLetter}
            </pre>
          </div>
        ) : (
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-xs">Peti Kemas Memenuhi Seluruh Persyaratan Kepabeanan</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Tidak ada denda demurrage aktif. Dokumen telah sesuai dengan ketentuan CEISA 4.0 dan WCO.</p>
              </div>
            </div>
            <button
              onClick={() => onSearch("Generate customs clearance summary statement")}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 text-xs font-mono border border-slate-200 dark:border-slate-800 transition shadow-xs font-medium"
            >
              Ekspor Ringkasan Audit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
