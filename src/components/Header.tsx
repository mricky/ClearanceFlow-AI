"use client";

import React, { useState } from "react";
import {
  Ship,
  Database,
  Cpu,
  ShieldCheck,
  Github,
  Info,
  Sun,
  Moon,
  Zap,
  X,
  ExternalLink,
} from "lucide-react";

interface HeaderProps {
  onOpenArchModal: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  isLiveAI?: boolean;
}

export function Header({ onOpenArchModal, theme, onToggleTheme, isLiveAI }: HeaderProps) {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  return (
    <header className="border-b border-slate-200 bg-white/95 dark:border-slate-800 dark:bg-slate-950/90 backdrop-blur sticky top-0 z-40 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 rounded-lg bg-slate-900 dark:bg-slate-800 flex items-center justify-center text-white dark:text-slate-100 shadow-xs">
            <Ship className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
                ClearanceFlow
              </span>
              <span className="text-[11px] px-1.5 py-0.5 rounded font-mono font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-cyan-400 border border-slate-200 dark:border-slate-700">
                AI
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Sistem Kepatuhan Kepabeanan & Logistik Ekspor-Impor
            </p>
          </div>
        </div>

        {/* Clean Controls: Single System Info Popover + Theme Switcher + GitHub */}
        <div className="flex items-center space-x-2">
          {/* Informasi Sistem Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setIsInfoOpen(!isInfoOpen)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition shadow-xs ${
                isInfoOpen
                  ? "bg-slate-100 border-slate-300 dark:bg-slate-800 dark:border-slate-700 text-slate-900 dark:text-white"
                  : "bg-white hover:bg-slate-50 border-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800/80 dark:border-slate-800 text-slate-700 dark:text-slate-300"
              }`}
              title="Informasi Arsitektur & Status Sistem"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="hidden sm:inline">Informasi Sistem</span>
              <Info className="h-3.5 w-3.5 text-slate-400 dark:text-slate-500 ml-0.5" />
            </button>

            {/* Informative Floating Card */}
            {isInfoOpen && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setIsInfoOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-4 z-40 animate-in fade-in zoom-in-95 duration-150">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-slate-800">
                    <div className="flex items-center space-x-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                        Status Arsitektur Sistem
                      </h4>
                    </div>
                    <button
                      onClick={() => setIsInfoOpen(false)}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <div className="mt-3 space-y-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-start space-x-2.5">
                      <Zap className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-200">Google Gemini 3.5 Flash Lite</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Agentic AI Reasoning & Embedding 1536-dim</p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-start space-x-2.5">
                      <Database className="h-4 w-4 text-blue-600 dark:text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-200">PostgreSQL pgvector (Supabase)</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Partisi Kuartal 2026 Q1 & HNSW Indexing</p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-start space-x-2.5">
                      <Cpu className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-200">Model Context Protocol (MCP)</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">Tools: Manifest lookup, RAG, & denda demurrage</p>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 flex items-start space-x-2.5">
                      <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-slate-200">Standar Pabean CEISA 4.0 & WCO</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">SOP Jalur Merah (SPJM), Jalur Hijau (SPPB), & KUHD</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold flex items-center space-x-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                      <span>Layanan Berjalan Normal</span>
                    </span>
                    <button
                      onClick={() => {
                        setIsInfoOpen(false);
                        onOpenArchModal();
                      }}
                      className="text-xs font-semibold text-blue-600 dark:text-cyan-400 hover:underline flex items-center space-x-1"
                    >
                      <span>Spesifikasi Teknis</span>
                      <ExternalLink className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Light / Dark Mode Toggle */}
          <button
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 text-xs font-medium transition shadow-xs"
            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
          >
            {theme === "light" ? (
              <>
                <Moon className="h-3.5 w-3.5 text-slate-600" />
                <span className="hidden sm:inline">Dark</span>
              </>
            ) : (
              <>
                <Sun className="h-3.5 w-3.5 text-amber-400" />
                <span className="hidden sm:inline">Light</span>
              </>
            )}
          </button>

          {/* GitHub Repository Link */}
          <a
            href="https://github.com/mricky/ClearanceFlow-AI"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 text-xs font-medium transition shadow-xs"
          >
            <Github className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
}
