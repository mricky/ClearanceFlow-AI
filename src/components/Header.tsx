"use client";

import React from "react";
import { Ship, Database, Cpu, ShieldCheck, Github, Info } from "lucide-react";

interface HeaderProps {
  onOpenArchModal: () => void;
}

export function Header({ onOpenArchModal }: HeaderProps) {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Ship className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg text-white tracking-tight">ClearanceFlow</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-cyan-500/10 text-cyan-400 font-mono border border-cyan-500/30">
                AI COPILOT
              </span>
            </div>
            <p className="text-xs text-slate-400">Autonomous Freight Compliance & Customs Brokerage</p>
          </div>
        </div>

        {/* Live Architecture Status Badges */}
        <div className="hidden lg:flex items-center space-x-3 font-mono text-xs">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <Database className="h-3.5 w-3.5 text-cyan-400" />
            <span>PostgreSQL pgvector</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <Cpu className="h-3.5 w-3.5 text-blue-400" />
            <span>MCP Tool Chaining</span>
          </div>

          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>WCO & CEISA 4.0</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenArchModal}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-200 text-xs font-medium border border-slate-800 transition"
          >
            <Info className="h-3.5 w-3.5 text-cyan-400" />
            <span>Architecture & Specs</span>
          </button>

          <a
            href="https://github.com/mricky"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium shadow-sm transition"
          >
            <Github className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">GitHub Profile</span>
          </a>
        </div>
      </div>
    </header>
  );
}
