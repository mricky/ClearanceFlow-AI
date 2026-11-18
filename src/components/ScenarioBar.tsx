"use client";

import React from "react";
import { ShieldAlert, AlertTriangle, CheckCircle2, Flame, Play } from "lucide-react";

export interface ScenarioItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  containerNo: string;
  theme: "red" | "amber" | "emerald" | "purple";
  query: string;
}

export const DEMO_SCENARIOS: ScenarioItem[] = [
  {
    id: "sc-1",
    badge: "SCENARIO 1",
    title: "Red Channel Hold (SPJM)",
    subtitle: "Reefer Prawns #MSKU-992104",
    containerNo: "MSKU-992104",
    theme: "red",
    query: "Check container #MSKU-992104: Why is it held under Red Channel and what statutory regulations apply?",
  },
  {
    id: "sc-2",
    badge: "SCENARIO 2",
    title: "Demurrage Dispute ($600)",
    subtitle: "Heavy CNC Lathe #OCLU-883192",
    containerNo: "OCLU-883192",
    theme: "amber",
    query: "Kontainer #OCLU-883192 terkena antrean behandle pelabuhan. Hitung denda demurrage dan buatkan draf surat sanggahan force majeure!",
  },
  {
    id: "sc-3",
    badge: "SCENARIO 3",
    title: "Barantin Quarantine Release",
    subtitle: "Tropical Fruits #CMAU-410291",
    containerNo: "CMAU-410291",
    theme: "emerald",
    query: "Verify phytosanitary release and green channel status for perishable container #CMAU-410291.",
  },
  {
    id: "sc-4",
    badge: "SCENARIO 4",
    title: "IMO Dangerous Goods Audit",
    subtitle: "Corrosive Solvent #EGLV-771820",
    containerNo: "EGLV-771820",
    theme: "purple",
    query: "Audit hazardous material compliance and UN GHS MSDS requirements for container #EGLV-771820.",
  },
];

interface ScenarioBarProps {
  activeScenarioId: string;
  onSelectScenario: (scenario: ScenarioItem) => void;
}

export function ScenarioBar({ activeScenarioId, onSelectScenario }: ScenarioBarProps) {
  const getThemeStyles = (theme: string, isActive: boolean) => {
    if (theme === "red") {
      return isActive
        ? "bg-red-950/60 border-red-500 text-white shadow-lg shadow-red-500/10"
        : "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-red-500/40 hover:bg-slate-900";
    }
    if (theme === "amber") {
      return isActive
        ? "bg-amber-950/60 border-amber-500 text-white shadow-lg shadow-amber-500/10"
        : "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-amber-500/40 hover:bg-slate-900";
    }
    if (theme === "emerald") {
      return isActive
        ? "bg-emerald-950/60 border-emerald-500 text-white shadow-lg shadow-emerald-500/10"
        : "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-emerald-500/40 hover:bg-slate-900";
    }
    return isActive
      ? "bg-purple-950/60 border-purple-500 text-white shadow-lg shadow-purple-500/10"
      : "bg-slate-900/80 border-slate-800 text-slate-300 hover:border-purple-500/40 hover:bg-slate-900";
  };

  const getIcon = (theme: string) => {
    if (theme === "red") return <ShieldAlert className="h-4 w-4 text-red-400" />;
    if (theme === "amber") return <AlertTriangle className="h-4 w-4 text-amber-400" />;
    if (theme === "emerald") return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
    return <Flame className="h-4 w-4 text-purple-400" />;
  };

  return (
    <div className="bg-slate-950 border-b border-slate-800/80 px-4 py-2.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2 shrink-0">
          <div className="h-6 w-6 rounded bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Play className="h-3 w-3 text-cyan-400 fill-cyan-400" />
          </div>
          <div>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              1-Click Test Scenarios:
            </span>
            <p className="text-[10px] text-slate-400">Click any scenario to run live agent audit</p>
          </div>
        </div>

        {/* 4 Interactive Scenario Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 w-full md:w-auto flex-1 md:max-w-4xl">
          {DEMO_SCENARIOS.map((sc) => {
            const isActive = sc.id === activeScenarioId;
            return (
              <button
                key={sc.id}
                onClick={() => onSelectScenario(sc)}
                className={`p-2 rounded-lg border text-left transition flex items-center space-x-2.5 ${getThemeStyles(
                  sc.theme,
                  isActive
                )}`}
              >
                <div className="shrink-0">{getIcon(sc.theme)}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-black/40 text-slate-400">
                      {sc.badge}
                    </span>
                    {isActive && (
                      <span className="text-[9px] font-mono text-cyan-400 font-bold">ACTIVE</span>
                    )}
                  </div>
                  <p className="text-xs font-semibold truncate text-white mt-0.5">{sc.title}</p>
                  <p className="text-[10px] text-slate-400 truncate">{sc.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
