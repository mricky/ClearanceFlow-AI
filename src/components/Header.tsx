"use client";

import React from "react";
import { Ship, Database, Cpu, ShieldCheck, Github, Info, Sun, Moon, Zap } from "lucide-react";

interface HeaderProps {
  onOpenArchModal: () => void;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  isLiveAI?: boolean;
}

export function Header({ onOpenArchModal, theme, onToggleTheme, isLiveAI }: HeaderProps) {
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
              <span className="text-[11px] px-2 py-0.5 rounded font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                CUSTOMS OS
              </span>
              {isLiveAI && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded font-mono text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  <span>LIVE GEMINI MCP</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
              Cross-Border Freight Compliance & Customs Brokerage
            </p>
          </div>
        </div>

        {/* Live Architecture Status Badges */}
        <div className="hidden lg:flex items-center space-x-2.5 font-mono text-xs">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300">
            <Database className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
            <span>PostgreSQL pgvector</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300">
            <Cpu className="h-3.5 w-3.5 text-slate-600 dark:text-blue-400" />
            <span>MCP Tool Chaining</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>WCO & CEISA 4.0</span>
          </div>
        </div>

        {/* Action Buttons & Theme Switcher */}
        <div className="flex items-center space-x-2">
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

          <button
            onClick={onOpenArchModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-slate-300 text-xs font-medium transition shadow-xs"
          >
            <Info className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
            <span>Specs</span>
          </button>

          <a
            href="https://github.com/mricky"
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
