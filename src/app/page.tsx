"use client";

import React, { useState, useEffect } from "react";
import { Header } from "../components/Header";
import { ScenarioBar, DEMO_SCENARIOS, ScenarioItem } from "../components/ScenarioBar";
import { ShipmentCockpit } from "../components/ShipmentCockpit";
import { AuditInspector } from "../components/AuditInspector";
import { ArchitectureModal } from "../components/ArchitectureModal";
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
  const [selectedShipment, setSelectedShipment] = useState<ShipmentRecord>(SAMPLE_SHIPMENTS[0]);
  const [activeScenarioId, setActiveScenarioId] = useState<string>("sc-1");
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentQuery, setCurrentQuery] = useState<string>(DEMO_SCENARIOS[0].query);
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

  // Initial Scenario 1 (Red Channel Crisis) state
  const [toolTraces, setToolTraces] = useState<ToolExecutionTrace[]>([
    {
      toolName: "lookup_shipment",
      arguments: { identifier: "MSKU-992104" },
      result: {
        found: true,
        waybillNo: "WBL-2026-033",
        containerNo: "MSKU-992104",
        status: "CUSTOMS_HOLD_RED_CHANNEL",
        commodity: "Frozen Black Tiger Prawns (Export)",
        pol: "IDJKT (Tanjung Priok, Indonesia)",
        pod: "JPTYO (Tokyo Port, Japan)",
        freeTimeDaysLeft: 2,
        demurrageDaysOverdue: 0,
      },
      latencyMs: 1.8,
    },
    {
      toolName: "search_compliance_knowledge",
      arguments: { query: "SPJM Red Channel inspection frozen prawns CEISA", categoryFilter: "all" },
      result: {
        method: "Gemini 3072d Dense Vector + PostgreSQL Lexical (RRF)",
        kConstant: 60,
        retrievedCount: 3,
        topRankedArticle: "SOP Jalur Pelayanan Impor Bea Cukai: Jalur Hijau, Jalur Kuning, dan Jalur Merah (SPJM)",
        topRrfScore: 0.03279,
      },
      latencyMs: 2.4,
    },
  ]);

  const [verdict, setVerdict] = useState<VerdictState>({
    statusType: "critical" as const,
    statusTitle: "CRITICAL: RED CHANNEL PENDING INSPECTION",
    summary:
      "Container MSKU-992104 has received an official Surat Pemberitahuan Jalur Merah (SPJM) from CEISA 4.0. Because the cargo consists of perishable frozen crustaceans (-20.4°C), mandatory attendance at TPP Behandle must be fulfilled within the legal 3x24-hour window to avoid port congestion penalties.",
    mandatoryDirectives: [
      "Mobilize operational surveyor to TPP Behandle Tanjung Priok before the 48-hour deadline.",
      "Submit BKIPM Official Health Certificate and original Bill of Lading (WBL-2026-033).",
      "Verify continuous auxiliary power plug connection for reefer container at plug-station #42.",
    ],
    citations: [
      {
        title: "SOP Jalur Pelayanan Impor Bea Cukai: Jalur Hijau, Jalur Kuning, dan Jalur Merah (SPJM)",
        subCategory: "import_clearance",
        contentSnippet:
          "Proses pemeriksaan fisik wajib dihadiri importir/kuasanya dalam waktu 3x24 jam sejak SPJM terbit. Apabila tidak dihadiri, kontainer dapat dikenakan nota pembetulan atau penegakan hukum.",
      },
      {
        title: "SOP Ekspor Produk Perikanan & Makanan Beku via CEISA Bea Cukai",
        subCategory: "export_clearance",
        contentSnippet:
          "Pengiriman ekspor komoditas frozen seafood wajib melampirkan Health Certificate dari BKIPM serta verifikasi suhu reefer container minimal minus 20 derajat Celcius sebelum gate-in.",
      },
    ],
  });

  const [disputeLetter, setDisputeLetter] = useState<string | null>(null);

  // Handle Scenario Switching
  const handleSelectScenario = (scenario: ScenarioItem) => {
    setActiveScenarioId(scenario.id);
    setCurrentQuery(scenario.query);
    executeAudit(scenario.query, scenario.containerNo);
  };

  // Execute Agentic Audit Workflow (Live API with Graceful Client Fallback)
  const executeAudit = async (query: string, explicitContainer?: string) => {
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
        (query.includes("033") ? "MSKU-992104" : query.includes("089") ? "OCLU-883192" : query.includes("112") ? "CMAU-410291" : "EGLV-771820");

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

      if (shipment?.status === "CUSTOMS_HOLD_RED_CHANNEL") {
        statusType = "critical";
        statusTitle = "CRITICAL: RED CHANNEL PENDING INSPECTION";
        summary = `Container ${shipment.containerNo} is flagged for mandatory physical inspection under CEISA 4.0 SPJM notice. Free time remaining is 2 days. Attendance is legally required within 72 hours.`;
        directives = [
          "Mobilize field customs representative to TPP Behandle Tanjung Priok.",
          "Prepare original BKIPM health certificate and authenticated B/L copy.",
          "Maintain reefer temperature log (-20.4°C verified by IoT sensor).",
        ];
      } else if (shipment?.status === "DEMURRAGE_OVERDUE") {
        statusType = "warning";
        statusTitle = "PENALTY ACCRUAL: FORCE MAJEURE DISPUTE ELIGIBLE";
        summary = `Container ${shipment.containerNo} has accrued 4 days of demurrage ($600 total exposure at $150/day). Because delay was caused by official port congestion, an automated waiver dispute letter has been generated below.`;
        directives = [
          "Submit the generated Formal Dispute Letter to Ocean Carrier billing within 48h.",
          "Attach the official Port Authority Terminal Congestion Bulletin as Exhibit A.",
          "Request expedited gate-out authorization pending dispute review.",
        ];
      } else if (shipment?.status === "RELEASED_GREEN_CHANNEL") {
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
        summary = `Container ${shipment?.containerNo || targetIdentifier} contains IMO Class 8 corrosive chemicals. Requires full 16-section UN GHS MSDS and four-sided placard inspection.`;
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
      />

      {/* Main Workbench */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Side: Container Manifest & Physical Telemetry (5 cols) */}
        <section className="lg:col-span-5 h-[620px] lg:h-[calc(100vh-10.5rem)] min-h-[500px]">
          <ShipmentCockpit
            shipments={SAMPLE_SHIPMENTS}
            selectedShipment={selectedShipment}
            onSelectShipment={(s) => {
              setSelectedShipment(s);
              const q = `Audit container #${s.containerNo}`;
              setCurrentQuery(q);
              executeAudit(q, s.containerNo);
            }}
            onAskCopilot={(prompt) => {
              setCurrentQuery(prompt);
              executeAudit(prompt, selectedShipment.containerNo);
            }}
          />
        </section>

        {/* Right Side: Agentic Audit Inspector (7 cols) */}
        <section className="lg:col-span-7 h-[620px] lg:h-[calc(100vh-10.5rem)] min-h-[500px]">
          <AuditInspector
            query={currentQuery}
            onSearch={(q) => executeAudit(q)}
            isLoading={isLoading}
            toolTraces={toolTraces}
            verdict={verdict}
            disputeLetter={disputeLetter}
          />
        </section>
      </main>

      {/* Architecture & Engineering Specification Modal */}
      <ArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />
    </div>
  );
}
