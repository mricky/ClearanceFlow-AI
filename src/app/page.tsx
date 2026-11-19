"use client";

import React, { useState, useEffect } from "react";
import { Loader2, Database, Search, ShieldCheck, BookOpen } from "lucide-react";
import { Header } from "../components/Header";
import { ScenarioBar, DEMO_SCENARIOS, ScenarioItem } from "../components/ScenarioBar";
import { AuditInspector } from "../components/AuditInspector";
import { ArchitectureModal } from "../components/ArchitectureModal";
import { ContainerDetailModal } from "../components/ContainerDetailModal";
import { RegulatorySourcesModal } from "../components/RegulatorySourcesModal";
import { SAMPLE_SHIPMENTS } from "../lib/mockData";
import { ShipmentRecord, ToolExecutionTrace } from "../lib/types";
import { lookupShipment, calculateDemurrageRisk, generateDisputeDraft } from "../lib/mcpTools";
import { searchComplianceRAG } from "../lib/ragEngine";

interface VerdictState {
  statusType: "critical" | "warning" | "success" | "pending";
  statusTitle: string;
  summary: string;
  mandatoryDirectives: string[];
  citations: { title: string; subCategory: string; contentSnippet: string }[];
}

export default function Home() {
  const [hasAudited, setHasAudited] = useState<boolean>(false);
  const [selectedShipment, setSelectedShipment] = useState<ShipmentRecord>(SAMPLE_SHIPMENTS[0]);
  const [activeScenarioId, setActiveScenarioId] = useState<string>("");
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [isContainerModalOpen, setIsContainerModalOpen] = useState(false);
  const [isSourcesModalOpen, setIsSourcesModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<string>("");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [isLiveAI, setIsLiveAI] = useState<boolean>(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem("clearanceflow_theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("clearanceflow_theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Initial state: Clean welcome view before user runs audit
  const [toolTraces, setToolTraces] = useState<ToolExecutionTrace[]>([]);
  const [verdict, setVerdict] = useState<VerdictState | null>(null);
  const [disputeLetter, setDisputeLetter] = useState<string | null>(null);

  // Handle Scenario Switching
  const handleSelectScenario = (scenario: ScenarioItem) => {
    setHasAudited(true);
    setActiveScenarioId(scenario.id);
    setCurrentQuery(scenario.query);
    const matchingShipment = SAMPLE_SHIPMENTS.find((s) => s.containerNo === scenario.containerNo);
    if (matchingShipment) {
      setSelectedShipment(matchingShipment);
    }
    executeAudit(scenario.query, scenario.containerNo);
  };

  // Execute Agentic Audit Workflow (Live API with Graceful Client Fallback)
  const executeAudit = async (query: string, explicitContainer?: string) => {
    setHasAudited(true);
    // Pre-sync selected shipment immediately for snappy UI
    const targetIdentifier =
      explicitContainer ||
      query.match(/(?:MSKU|OCLU|CMAU|EGLV)[-\s]?\d{6,7}/i)?.[0] ||
      (query.includes("033") ? "MSKU-992104" : query.includes("089") ? "OCLU-883192" : query.includes("112") ? "CMAU-410291" : query.includes("145") ? "EGLV-771820" : null);

    if (targetIdentifier) {
      const match = SAMPLE_SHIPMENTS.find(
        (s) =>
          s.containerNo.toLowerCase().includes(targetIdentifier.toLowerCase()) ||
          s.id.toLowerCase().includes(targetIdentifier.toLowerCase()) ||
          s.waybillNo.toLowerCase().includes(targetIdentifier.toLowerCase())
      );
      if (match) {
        setSelectedShipment(match);
      }
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, explicitContainer }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.mode === "live_gemini") {
          setIsLiveAI(true);
          if (data.shipment) {
            const foundInMock = SAMPLE_SHIPMENTS.find((s) => s.id === data.shipment.id || s.containerNo === data.shipment.containerNo);
            setSelectedShipment(foundInMock || { ...SAMPLE_SHIPMENTS[0], ...data.shipment });
          }
          if (data.toolTraces) setToolTraces(data.toolTraces);
          if (data.verdict) setVerdict(data.verdict);
          setDisputeLetter(data.disputeLetter || null);
          setIsLoading(false);
          return;
        }
      }
    } catch (apiErr) {
      console.warn("Live API unreachable, using local engine fallback:", apiErr);
      setIsLiveAI(false);
    }

    // Client-side fallback
    setTimeout(() => {
      const traces: ToolExecutionTrace[] = [];

      const targetIdentifier =
        explicitContainer ||
        query.match(/(?:MSKU|OCLU|CMAU|EGLV)[-\s]?\d{6,7}/i)?.[0] ||
        (query.includes("033") ? "MSKU-992104" : query.includes("089") ? "OCLU-883192" : query.includes("112") ? "CMAU-410291" : query.includes("145") ? "EGLV-771820" : null) ||
        (query.trim().length <= 25 ? query.trim() : query.split(" ")[0]);

      const { shipment, trace: dbTrace } = lookupShipment(targetIdentifier);
      traces.push(dbTrace);

      if (shipment) {
        setSelectedShipment(shipment);
      }

      const { documents, trace: ragTrace } = searchComplianceRAG(
        `${query} ${shipment?.status || ""} ${shipment?.commodity || ""}`
      );
      traces.push(ragTrace);

      let letter: string | null = null;
      if (shipment && (shipment.demurrageDaysOverdue > 0 || query.toLowerCase().includes("demurrage") || query.toLowerCase().includes("denda"))) {
        const { trace: cTrace } = calculateDemurrageRisk(shipment.containerNo);
        traces.push(cTrace);

        if (shipment.status === "DEMURRAGE_OVERDUE" || query.toLowerCase().includes("sanggah") || query.toLowerCase().includes("dispute")) {
          const { draft, trace: dTrace } = generateDisputeDraft(
            shipment.id,
            "Terminal congestion and 36-hour physical inspection backlog at TPP Behandle beyond consignee commercial control."
          );
          traces.push(dTrace);
          letter = draft;
        }
      }

      const topDoc = documents[0];
      const secondDoc = documents[1];

      let statusType: "critical" | "warning" | "success" | "pending" = "pending";
      let statusTitle = "AUDIT COMPLETE";
      let summary = "";
      let directives: string[] = [];

      if (!shipment) {
        statusType = "warning";
        statusTitle = "DATA TIDAK DITEMUKAN / UNREGISTERED CARGO";
        summary = `Nomor kontainer atau B/L "${targetIdentifier}" tidak terdaftar dalam database manifest pabean aktif di Pelabuhan Tanjung Priok, Tanjung Perak, maupun Belawan. Tidak ada dokumen SPJM atau SPPB aktif untuk nomor ini.`;
        directives = [
          "Periksa kembali nomor peti kemas / B/L fisik yang tertera pada dokumen pengapalan.",
          "Pastikan format nomor kontainer sesuai standar internasional ISO 6346 (4 huruf kode pemilik + 7 digit angka, contoh: MSKU-992104).",
          "Gunakan salah satu dari 4 skenario simulasi cepat di atas untuk melihat alur audit kepabeanan yang terverifikasi.",
        ];
      } else if (shipment.status === "CUSTOMS_HOLD_RED_CHANNEL") {
        statusType = "critical";
        statusTitle = "CRITICAL: RED CHANNEL PENDING INSPECTION";
        summary = `Container ${shipment.containerNo} is flagged for mandatory physical inspection under CEISA 4.0 SPJM notice. Free time remaining is 2 days. Attendance is legally required within 72 hours.`;
        directives = [
          "Mobilize field customs representative to TPP Behandle Tanjung Priok.",
          "Prepare original BKIPM health certificate and authenticated B/L copy.",
          "Maintain reefer temperature log (-20.4°C verified by IoT sensor).",
        ];
      } else if (shipment.status === "DEMURRAGE_OVERDUE") {
        statusType = "warning";
        statusTitle = "PENALTY ACCRUAL: FORCE MAJEURE DISPUTE ELIGIBLE";
        summary = `Container ${shipment.containerNo} has accrued 4 days of demurrage ($600 total exposure at $150/day). Because delay was caused by official port congestion, an automated waiver dispute letter has been generated below.`;
        directives = [
          "Submit the generated Formal Dispute Letter to Ocean Carrier billing within 48h.",
          "Attach the official Port Authority Terminal Congestion Bulletin as Exhibit A.",
          "Request expedited gate-out authorization pending dispute review.",
        ];
      } else if (shipment.status === "RELEASED_GREEN_CHANNEL") {
        statusType = "success";
        statusTitle = "CLEARED: GREEN CHANNEL RELEASE (SPPB)";
        summary = `Container ${shipment.containerNo} has passed phytosanitary quarantine and CEISA automated green channel scrutiny. Customs release order (SPPB) is active.`;
        directives = [
          "Dispatch drayage truck for immediate terminal pickup.",
          "Present SPPB barcode at terminal gate-out scanner.",
          "Return empty container to carrier depot within 7 days of delivery.",
        ];
      } else {
        statusType = "warning";
        statusTitle = "HAZARDOUS CARGO: IMDG PLACARD & MSDS AUDIT";
        summary = `Container ${shipment.containerNo} contains IMO Class 8 corrosive chemicals. Requires full 16-section UN GHS MSDS and four-sided placard inspection.`;
        directives = [
          "Verify high-visibility waterproof IMO Class 8 placards (250mm x 250mm).",
          "Ensure multimodal Dangerous Goods Declaration is lodged with terminal safety control.",
        ];
      }

      setToolTraces(traces);
      setVerdict({
        statusType,
        statusTitle,
        summary,
        mandatoryDirectives: directives,
        citations: [
          {
            title: topDoc?.title || "Customs Standard Operating Procedure",
            subCategory: topDoc?.subCategory || "trade_compliance",
            contentSnippet: topDoc?.content.slice(0, 160) + "...",
          },
          ...(secondDoc
            ? [
                {
                  title: secondDoc.title,
                  subCategory: secondDoc.subCategory,
                  contentSnippet: secondDoc.content.slice(0, 160) + "...",
                },
              ]
            : []),
        ],
      });
      setDisputeLetter(letter);
      setIsLoading(false);
    }, 350);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      {/* Header */}
      <Header
        onOpenArchModal={() => setIsArchModalOpen(true)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        isLiveAI={isLiveAI}
      />

      {/* Sticky 1-Click Operational Scenario Bar */}
      <ScenarioBar
        activeScenarioId={activeScenarioId}
        onSelectScenario={handleSelectScenario}
        isLoading={isLoading}
      />

      {/* Main Workbench (Focused Single-Workspace Layout) */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-3 sm:p-4 lg:p-6 flex flex-col h-[calc(100vh-10.5rem)] min-h-[580px]">
        <AuditInspector
          query={currentQuery}
          onSearch={(q) => executeAudit(q)}
          isLoading={isLoading}
          toolTraces={toolTraces}
          verdict={verdict}
          disputeLetter={disputeLetter}
          onOpenContainerModal={() => setIsContainerModalOpen(true)}
          hasAudited={hasAudited}
          onSelectScenario={handleSelectScenario}
        />
      </main>

      {/* Centered Loading Progress Overlay (Prevents Double Clicks & Shows Live Verification Steps) */}
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl max-w-md w-full text-center space-y-4">
            {/* Animated Spinner Icon */}
            <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto text-slate-800 dark:text-cyan-400 shadow-xs">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Sedang Memeriksa Dokumen & Status Kargo...
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Memverifikasi data pelabuhan dan ketentuan resmi Bea Cukai CEISA
              </p>
            </div>

            {/* Stepper Checklist - Bahasa Operasional Logistik */}
            <div className="bg-slate-50 dark:bg-slate-950/70 rounded-xl p-3 border border-slate-200 dark:border-slate-800 text-left space-y-2 text-xs font-sans">
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                <Database className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400 shrink-0" />
                <span className="truncate">1. Memeriksa nomor kontainer & manifest pelabuhan...</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                <Search className="h-3.5 w-3.5 text-indigo-600 dark:text-blue-400 shrink-0" />
                <span className="truncate">2. Mencocokkan syarat izin ekspor-impor & karantina...</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-700 dark:text-slate-300">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">3. Menyiapkan instruksi kerja lapangan & surat resmi...</span>
              </div>
            </div>

            {/* Subtle Progress Bar */}
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-slate-900 dark:bg-cyan-500 rounded-full w-2/3 animate-pulse mx-auto"></div>
            </div>

            <p className="text-[11px] text-slate-400 font-sans">
              Mohon tunggu sebentar, proses pengecekan kargo sedang berjalan
            </p>
          </div>
        </div>
      )}

      {/* Container Telemetry & Physical Manifest Detail Modal */}
      <ContainerDetailModal
        isOpen={isContainerModalOpen}
        onClose={() => setIsContainerModalOpen(false)}
        selectedShipment={selectedShipment}
      />

      {/* Architecture & Engineering Specification Modal */}
      <ArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />

      {/* Regulatory Sources & Disclaimer Modal */}
      <RegulatorySourcesModal
        isOpen={isSourcesModalOpen}
        onClose={() => setIsSourcesModalOpen(false)}
      />

      {/* Clean Footer Disclaimer & Regulatory Sources Bar */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 py-3 px-4 sm:px-6 transition-colors">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-2 text-center sm:text-left">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400 shrink-0 hidden sm:inline-block"></span>
            <p className="text-[11px] leading-relaxed">
              <strong>Catatan Proyek:</strong> Eksplorasi portofolio teknologi (RAG & MCP) untuk otomasi kepabeanan logistik. Tidak terafiliasi dengan perusahaan atau instansi manapun.
            </p>
          </div>
          <button
            onClick={() => setIsSourcesModalOpen(true)}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-sans text-[11px] font-medium border border-slate-200 dark:border-slate-800 transition shrink-0"
            title="Lihat daftar dokumen hukum & SOP resmi yang diindeks"
          >
            <BookOpen className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
            <span>Sumber SOP & Regulasi</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
