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
  isLoading?: boolean;
}

export function ScenarioBar({ activeScenarioId, onSelectScenario, isLoading }: ScenarioBarProps) {
  const getThemeStyles = (theme: string, isActive: boolean) => {
    if (theme === "red") {
      return isActive
        ? "bg-red-50 border-red-300 text-red-950 shadow-xs dark:bg-red-950/60 dark:border-red-500 dark:text-white"
        : "bg-white border-slate-200 text-slate-700 hover:border-red-200 hover:bg-red-50/40 dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-300 dark:hover:border-red-500/40 dark:hover:bg-slate-900";
    }
    if (theme === "amber") {
      return isActive
        ? "bg-amber-50 border-amber-300 text-amber-950 shadow-xs dark:bg-amber-950/60 dark:border-amber-500 dark:text-white"
        : "bg-white border-slate-200 text-slate-700 hover:border-amber-200 hover:bg-amber-50/40 dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-300 dark:hover:border-amber-500/40 dark:hover:bg-slate-900";
    }
    if (theme === "emerald") {
      return isActive
        ? "bg-emerald-50 border-emerald-300 text-emerald-950 shadow-xs dark:bg-emerald-950/60 dark:border-emerald-500 dark:text-white"
        : "bg-white border-slate-200 text-slate-700 hover:border-emerald-200 hover:bg-emerald-50/40 dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-300 dark:hover:border-emerald-500/40 dark:hover:bg-slate-900";
    }
    return isActive
      ? "bg-indigo-50 border-indigo-300 text-indigo-950 shadow-xs dark:bg-purple-950/60 dark:border-purple-500 dark:text-white"
      : "bg-white border-slate-200 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50/40 dark:bg-slate-900/80 dark:border-slate-800 dark:text-slate-300 dark:hover:border-purple-500/40 dark:hover:bg-slate-900";
  };

  const getIcon = (theme: string) => {
    if (theme === "red") return <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400 shrink-0" />;
    if (theme === "amber") return <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />;
    if (theme === "emerald") return <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />;
    return <Flame className="h-4 w-4 text-indigo-600 dark:text-purple-400 shrink-0" />;
  };

  return (
    <div className="bg-white dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800/80 px-4 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5">
        <div className="flex items-center space-x-2 shrink-0">
          <div className="h-6 w-6 rounded bg-slate-100 border border-slate-200 dark:bg-cyan-500/10 dark:border-cyan-500/30 flex items-center justify-center">
            <Play className="h-3 w-3 text-slate-700 dark:text-cyan-400 fill-slate-700 dark:fill-cyan-400" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Operational Test Scenarios:
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">Select scenario to execute regulatory audit</p>
          </div>
        </div>

        {/* 4 Interactive Scenario Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 w-full md:w-auto flex-1 md:max-w-4xl md:ml-4">
          {DEMO_SCENARIOS.map((sc) => {
            const isActive = sc.id === activeScenarioId;
            return (
              <button
                key={sc.id}
                disabled={isLoading}
                onClick={() => onSelectScenario(sc)}
                className={`p-2 rounded-lg border text-left transition flex items-center space-x-2 ${
                  isLoading ? "opacity-60 cursor-not-allowed" : ""
                } ${getThemeStyles(sc.theme, isActive)}`}
              >
                {getIcon(sc.theme)}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold tracking-tight opacity-80 uppercase truncate">
                      {sc.badge}
                    </span>
                    {isActive && (
                      <span className="text-[9px] font-bold px-1 py-0.2 rounded bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-mono">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold truncate leading-tight mt-0.5">{sc.title}</p>
                  <p className="text-[10px] opacity-70 truncate font-mono mt-0.5">{sc.subtitle}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
