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
  Package,
  Layers,
  X,
  Eye,
  DollarSign,
  Clock,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { ToolExecutionTrace } from "../lib/types";
import { PdfViewerModal } from "./PdfViewerModal";
import { DEMO_SCENARIOS, ScenarioItem } from "./ScenarioBar";

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
  } | null;
  disputeLetter: string | null;
  onOpenContainerModal?: () => void;
  hasAudited?: boolean;
  onSelectScenario?: (scenario: ScenarioItem) => void;
}

export function AuditInspector({
  query,
  onSearch,
  isLoading,
  toolTraces,
  verdict,
  disputeLetter,
  onOpenContainerModal,
  hasAudited = true,
  onSelectScenario,
}: AuditInspectorProps) {
  const [searchInput, setSearchInput] = useState(query);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"ops" | "dev">("ops");
  const [isFocused, setIsFocused] = useState(false);

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

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [pdfDocInstance, setPdfDocInstance] = useState<any>(null);

  const generatePdf = async () => {
    if (!disputeLetter) return null;
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = 210;
    const margin = 20;
    const contentWidth = pageWidth - margin * 2;
    let y = 22;

    // Header Banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(margin, y, contentWidth, 14, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255);
    doc.text("CLEARANCEFLOW AI — SISTEM KEPATUHAN PABEAN", margin + 4, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text("Surat Resmi Sanggahan & Permohonan Keringanan Demurrage Pelabuhan", margin + 4, y + 10.5);

    y += 22;

    // Body Text
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);

    const lines = disputeLetter.split("\n");

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (
        line.startsWith("FORMAL NOTICE") ||
        line.startsWith("1. LEGAL") ||
        line.startsWith("2. STATUTORY") ||
        line.startsWith("3. REQUESTED") ||
        line.startsWith("Date:") ||
        line.startsWith("To:") ||
        line.startsWith("Subject:")
      ) {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 23, 42);
        y += 1.5;
      } else {
        doc.setFont("helvetica", "normal");
        doc.setTextColor(51, 65, 85);
      }

      const splitLines = doc.splitTextToSize(line || " ", contentWidth);

      for (const subLine of splitLines) {
        if (y > 270) {
          doc.addPage();
          y = 20;
        }
        doc.text(subLine, margin, y);
        y += 5.2;
      }
    }

    // Footer
    const totalPages = doc.getNumberOfPages();
    for (let p = 1; p <= totalPages; p++) {
      doc.setPage(p);
      doc.setFont("helvetica", "italic");
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.line(margin, 282, pageWidth - margin, 282);
      doc.text(
        `Dokumen resmi dihasilkan oleh ClearanceFlow AI • Halaman ${p} dari ${totalPages}`,
        margin,
        287
      );
    }

    return doc;
  };

  const handleOpenPdfPreview = async () => {
    if (!disputeLetter) return;
    setIsDownloadingPdf(true);
    try {
      const doc = await generatePdf();
      if (!doc) return;
      setPdfDocInstance(doc);
      const blob = doc.output("blob");
      const url = URL.createObjectURL(blob);
      setPdfBlobUrl(url);
      setIsPdfModalOpen(true);
    } catch (err) {
      console.error("Gagal membuat pratinjau PDF:", err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleDownloadFromPreview = () => {
    if (pdfDocInstance) {
      pdfDocInstance.save(`Surat-Sanggahan-Demurrage-${Date.now().toString().slice(-4)}.pdf`);
    } else if (pdfBlobUrl) {
      const a = document.createElement("a");
      a.href = pdfBlobUrl;
      a.download = `Surat-Sanggahan-Demurrage-${Date.now().toString().slice(-4)}.pdf`;
      a.click();
    }
  };

  // Find traces
  const dbTrace = toolTraces.find((t) => t.toolName === "lookup_shipment");
  const ragTrace = toolTraces.find((t) => t.toolName === "search_compliance_knowledge");

  // Helper for human-readable logistics status
  const getLogisticsStatusLabel = (status?: string, found?: boolean) => {
    if (found === false) return "Data Kargo Tidak Terdaftar di Manifest CEISA 4.0";
    if (status === "CUSTOMS_HOLD_RED_CHANNEL") return "Jalur Merah (SPJM) • Wajib Hadir Fisik TPP Behandle";
    if (status === "DEMURRAGE_OVERDUE") return "Penalti Demurrage Berjalan • Sisa Free-Time Habis";
    if (status === "RELEASED_GREEN_CHANNEL") return "Jalur Hijau (SPPB) • Siap Tarik Truk Drayage";
    return "Verifikasi Karantina & Lartas Ekspor-Impor";
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs flex flex-col h-full transition-colors">
      {/* Top Command Bar (Inspection Search - Multiline Auto-Expand) */}
      <div className="p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/80 transition-all">
        <form onSubmit={handleFormSubmit} className="flex items-start space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 dark:text-cyan-400 pointer-events-none" />
            <textarea
              rows={isFocused || searchInput.length > 65 ? 2 : 1}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleFormSubmit(e);
                }
              }}
              placeholder="Cari nomor kontainer, B/L, atau kueri regulasi kepabeanan..."
              className="w-full pl-9 pr-7 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-slate-900 dark:focus:border-cyan-500 font-mono transition-all resize-none shadow-xs leading-relaxed"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput("")}
                className="absolute right-2 top-2.5 p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title="Hapus teks"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={isLoading || !searchInput.trim()}
            title="Eksekusi kueri pencarian atau audit regulasi kepabeanan"
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-cyan-600 dark:hover:bg-cyan-500 disabled:opacity-40 text-white font-medium text-xs transition flex items-center space-x-1.5 shrink-0 shadow-xs h-9"
          >
            <Play className="h-3.5 w-3.5 fill-white" />
            <span>Cari & Audit</span>
          </button>
        </form>
      </div>

      {/* Main Inspection Body */}
      <div className="p-4 space-y-3.5 overflow-y-auto flex-1 text-xs flex flex-col">
        {!hasAudited && !isLoading ? (
          <div className="py-6 px-3 sm:px-6 max-w-2xl mx-auto flex flex-col items-center justify-center text-center space-y-5 my-auto">
            {/* System Status Pill */}
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold shadow-xs">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>SISTEM SIAP OPERASIONAL • CEISA 4.0 INTEGRATED</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                Verifikasi Dokumen Pabean & Sanggahan Demurrage
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                ClearanceFlow AI mengintegrasikan pemeriksaan manifest pelabuhan, regulasi resmi CEISA (Jalur Merah/Kuning/Hijau), serta penerbitan otomatis surat sanggahan denda berdasar KUHD & PMK.
              </p>
            </div>

            {/* 3 Core Capabilities Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 w-full text-left">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
                <div className="flex items-center space-x-1.5 text-blue-700 dark:text-cyan-400 font-semibold text-xs">
                  <PackageCheck className="h-4 w-4 shrink-0" />
                  <span>Audit Kargo</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  Verifikasi nomor kontainer, SPJM behandle, dan SLA dwell time pelabuhan.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
                <div className="flex items-center space-x-1.5 text-indigo-700 dark:text-blue-400 font-semibold text-xs">
                  <Database className="h-4 w-4 shrink-0" />
                  <span>Hybrid RAG</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  Rujukan hukum PMK 190/2022, PER-16/BC, Barantin, dan regulasi B3 IMDG.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 shadow-2xs">
                <div className="flex items-center space-x-1.5 text-amber-700 dark:text-amber-400 font-semibold text-xs">
                  <FileText className="h-4 w-4 shrink-0" />
                  <span>PDF Sanggahan</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-snug">
                  Draf surat berkop A4 resmi pelabuhan dengan dasar hukum force majeure KUHD 517.
                </p>
              </div>
            </div>

            {/* Action Prompt with 1-Click Scenarios */}
            <div className="w-full pt-3 border-t border-slate-200 dark:border-slate-800/80 space-y-2.5">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
                <span className="font-semibold text-slate-700 dark:text-slate-300">PILIH SKENARIO UNTUK MEMULAI AUDIT:</span>
                <span className="text-[11px]">1-Klik Otomatis</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                {DEMO_SCENARIOS.map((sc) => (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => {
                      if (onSelectScenario) {
                        onSelectScenario(sc);
                      } else {
                        onSearch(sc.query);
                      }
                    }}
                    className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-600 bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition group flex flex-col justify-between shadow-2xs cursor-pointer text-left"
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {sc.badge}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-cyan-400 flex items-center space-x-0.5 transition">
                        <span>Jalankan</span>
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                    <p className="font-semibold text-xs text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition">
                      {sc.title}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                      {sc.subtitle}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-slate-400 dark:text-slate-500 font-sans">
              Atau ketik langsung nomor kontainer atau B/L kargo pada kolom pencarian di atas
            </p>
          </div>
        ) : (
          <>
            {/* Header Title with View Mode Toggle & Container Detail Modal Button */}
            <div className="flex flex-wrap items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800/80 gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="h-4 w-4 text-slate-700 dark:text-cyan-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              {viewMode === "ops" ? "Alur Verifikasi Operasional Kepabeanan" : "Agentic ReAct Tool Execution Trace"}
            </h3>
          </div>

          <div className="flex items-center space-x-2">
            {onOpenContainerModal && (
              <button
                type="button"
                onClick={onOpenContainerModal}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-cyan-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 font-sans text-xs font-semibold transition shadow-xs"
                title="Buka rincian telemetri IoT, suhu reefer, segel, dan riwayat pelabuhan kontainer"
              >
                <Package className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                <span>Lihat Detail Kontainer</span>
              </button>
            )}

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
                  {dbTrace?.result?.found ? (
                    <span className="text-[10px] font-sans font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                      Manifest Aktif
                    </span>
                  ) : (
                    <span className="text-[10px] font-sans font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      Tidak Terdaftar
                    </span>
                  )}
                </div>
                <p className="font-semibold text-slate-900 dark:text-white mt-1 text-xs">
                  {dbTrace?.result?.found
                    ? `Peti Kemas #${dbTrace.result.containerNo} (B/L: ${dbTrace.result.waybillNo || "WBL-2026"})`
                    : `Nomor Kargo "${dbTrace?.arguments?.identifier || "Input"}" Tidak Ditemukan`}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                  <strong>Status Pabean:</strong> {getLogisticsStatusLabel(dbTrace?.result?.status, dbTrace?.result?.found)}
                </p>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                  <strong>SLA Dwell Time:</strong>{" "}
                  {dbTrace?.result?.found ? (
                    <>
                      Sisa Free-Time Pelabuhan:{" "}
                      <span className="font-bold text-slate-900 dark:text-white">
                        {dbTrace?.result?.freeTimeDaysLeft ?? 2} Hari
                      </span>{" "}
                      {dbTrace?.result?.demurrageDaysOverdue > 0 && (
                        <span className="text-red-600 dark:text-red-400 font-bold">
                          ({dbTrace?.result?.demurrageDaysOverdue} Hari Denda Berjalan)
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-slate-500 dark:text-slate-400">Tidak ada dwell time (kargo belum terdaftar)</span>
                  )}
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-500">
                <span className="truncate">Pelabuhan: Tanjung Priok (IDJKT)</span>
                {dbTrace?.result?.found && onOpenContainerModal && (
                  <button
                    type="button"
                    onClick={onOpenContainerModal}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-sans text-[11px] font-semibold transition shadow-xs shrink-0"
                    title="Buka rincian sensor IoT, suhu reefer, segel, dan riwayat pelabuhan"
                  >
                    <Package className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                    <span>Lihat Detail Kontainer</span>
                  </button>
                )}
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
        {verdict && (
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
        )}

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
                  onClick={handleOpenPdfPreview}
                  disabled={isDownloadingPdf}
                  className="flex items-center space-x-1.5 px-3 py-1 rounded bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-medium text-[11px] font-sans border border-amber-600 transition shadow-xs"
                  title="Lihat pratinjau dokumen PDF resmi sebelum mengunduh"
                >
                  <Eye className="h-3.5 w-3.5" />
                  <span>{isDownloadingPdf ? "Memuat PDF..." : "Lihat & Unduh PDF"}</span>
                </button>
              </div>
            </div>

            {/* Financial Liability & Cost Recovery Guardrail (Owner ROI Showcase) */}
            <div className="p-3.5 rounded-lg bg-white dark:bg-slate-900 border border-amber-300 dark:border-amber-500/30 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-900 dark:text-white">
                  <DollarSign className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <span>Kalkulasi Liabilitas Finansial & Pemulihan Kas (ROI Guardrail)</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800">
                  Potensi Sanggahan: 94% Valid
                </span>
              </div>

              {/* 3 Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {/* 1: Current Overdue Accrual */}
                <div className="p-2.5 rounded-lg bg-red-50/70 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40">
                  <span className="text-[10px] font-mono font-medium text-red-700 dark:text-red-400 block">
                    Denda Berjalan Saat Ini
                  </span>
                  <p className="text-base font-mono font-bold text-red-700 dark:text-red-400 mt-0.5">
                    $600.00
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    4 hari x $150/hari (Tier-1)
                  </p>
                </div>

                {/* 2: Tier Escalation Countdown Timer */}
                <div className="p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40">
                  <span className="text-[10px] font-mono font-medium text-amber-800 dark:text-amber-400 flex items-center space-x-1">
                    <Clock className="h-3 w-3 text-amber-600" />
                    <span>Kenaikan Tarif Tier-2</span>
                  </span>
                  <p className="text-base font-mono font-bold text-amber-800 dark:text-amber-300 mt-0.5">
                    14 Jam Tersisa
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    Lonjakan denda: +$250/hari
                  </p>
                </div>

                {/* 3: Value Preserved / Recoverable */}
                <div className="p-2.5 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/40">
                  <span className="text-[10px] font-mono font-medium text-emerald-800 dark:text-emerald-400 flex items-center space-x-1">
                    <TrendingUp className="h-3 w-3 text-emerald-600" />
                    <span>Nilai Kas Dilindungi</span>
                  </span>
                  <p className="text-base font-mono font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
                    +$600.00
                  </p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    Dasar KUHD Pasal 517
                  </p>
                </div>
              </div>

              {/* Urgency Alert Note */}
              <div className="flex items-center space-x-2 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/60 p-2 rounded border border-slate-200 dark:border-slate-800">
                <AlertCircle className="h-3.5 w-3.5 text-amber-600 shrink-0" />
                <span>
                  <strong>Rekomendasi Finansial:</strong> Ajukan draf surat sanggahan PDF ke billing ocean carrier sebelum pukul 17:00 WIB agar denda dibekukan secara sah.
                </span>
              </div>
            </div>

            <pre className="p-3 rounded-lg bg-white dark:bg-black/70 border border-amber-200 dark:border-slate-800 text-[10px] font-mono text-slate-800 dark:text-slate-300 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-56 shadow-xs">
              {disputeLetter}
            </pre>
          </div>
        ) : dbTrace?.result?.found === false ? (
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white text-xs">Penerbitan Dokumen Ditangguhkan</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Tidak dapat menerbitkan draf sanggahan atau surat pengeluaran karena nomor kargo belum terdaftar di manifest pelabuhan.</p>
              </div>
            </div>
            <button
              onClick={() => onSearch(DEMO_SCENARIOS[0].query)}
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-200 text-xs font-mono border border-slate-200 dark:border-slate-800 transition shadow-xs font-medium cursor-pointer"
            >
              Uji Skenario 1 Demo
            </button>
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
          </>
        )}
      </div>

      {/* Official PDF Document Viewer Modal */}
      <PdfViewerModal
        isOpen={isPdfModalOpen}
        onClose={() => {
          setIsPdfModalOpen(false);
          if (pdfBlobUrl) {
            URL.revokeObjectURL(pdfBlobUrl);
            setPdfBlobUrl(null);
          }
        }}
        pdfUrl={pdfBlobUrl}
        onDownload={handleDownloadFromPreview}
        containerNo={dbTrace?.result?.containerNo}
      />
    </div>
  );
}
