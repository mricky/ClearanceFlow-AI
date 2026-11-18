"use client";

import React, { useState } from "react";
import { ChatMessage } from "../lib/types";
import {
  Send,
  Sparkles,
  Bot,
  User,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Cpu,
  FileCheck,
  RefreshCw,
} from "lucide-react";

interface AgenticCopilotProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onSelectPromptChip: (text: string) => void;
}

export function AgenticCopilot({
  messages,
  onSendMessage,
  isLoading,
  onSelectPromptChip,
}: AgenticCopilotProps) {
  const [input, setInput] = useState("");
  const [expandedTraces, setExpandedTraces] = useState<Record<string, boolean>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    onSendMessage(input.trim());
    setInput("");
  };

  const toggleTrace = (id: string) => {
    setExpandedTraces((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const QUICK_PROMPTS = [
    {
      lang: "EN",
      label: "Audit Container #MSKU-992104 Red Channel Hold",
      text: "Check container #MSKU-992104: Why is it held under Red Channel and what statutory regulations apply?",
    },
    {
      lang: "ID",
      label: "Sanggahan Denda Demurrage #OCLU-883192",
      text: "Kontainer #OCLU-883192 terkena antrean behandle pelabuhan. Hitung denda demurrage dan buatkan draf surat sanggahannya!",
    },
    {
      lang: "EN",
      label: "SOLAS VGM Pre-Gate In Standards",
      text: "What are the mandatory SOLAS VGM certification requirements before maritime port gate-in?",
    },
    {
      lang: "ID",
      label: "Karantina & Fumigasi Palet Kayu ISPM #15",
      text: "Bagaimana regulasi fumigasi palet kayu ekspor ISPM 15 agar tidak dicekal di negara tujuan?",
    },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
      {/* Top Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-6 w-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide">
              Autonomous Trade Copilot
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">
              MCP Tool Chaining + pgvector Hybrid RAG
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Agent Ready</span>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="p-4 space-y-4 overflow-y-auto flex-1 text-xs">
        {messages.map((msg) => {
          const isAssistant = msg.sender === "assistant";
          return (
            <div
              key={msg.id}
              className={`flex space-x-2.5 ${isAssistant ? "items-start" : "items-start justify-end"}`}
            >
              {isAssistant && (
                <div className="h-7 w-7 rounded-lg bg-cyan-600/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="h-4 w-4" />
                </div>
              )}

              <div className={`max-w-[88%] space-y-2 ${isAssistant ? "" : "text-right"}`}>
                {/* Chat Bubble */}
                <div
                  className={`p-3.5 rounded-xl border text-left leading-relaxed ${
                    isAssistant
                      ? "bg-slate-950/80 border-slate-800 text-slate-200"
                      : "bg-cyan-600 border-cyan-500 text-white font-medium"
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                </div>

                {/* Visible MCP Tool Execution Traces */}
                {isAssistant && msg.toolTraces && msg.toolTraces.length > 0 && (
                  <div className="space-y-1.5 text-left">
                    <button
                      onClick={() => toggleTrace(msg.id)}
                      className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 transition"
                    >
                      <Cpu className="h-3 w-3" />
                      <span>
                        {msg.toolTraces.length} Agentic Tools Executed ({msg.toolTraces.reduce((acc, t) => acc + t.latencyMs, 0)}ms total)
                      </span>
                      {expandedTraces[msg.id] ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </button>

                    {expandedTraces[msg.id] && (
                      <div className="p-2.5 rounded-lg bg-black/60 border border-slate-800 font-mono text-[10px] space-y-2 animate-in fade-in duration-150">
                        {msg.toolTraces.map((trace, tIdx) => (
                          <div key={tIdx} className="border-b border-slate-800/80 pb-2 last:border-b-0 last:pb-0">
                            <div className="flex items-center justify-between text-slate-300">
                              <span className="text-emerald-400 font-semibold">{trace.toolName}()</span>
                              <span className="text-slate-500">{trace.latencyMs}ms</span>
                            </div>
                            <pre className="text-slate-400 mt-1 overflow-x-auto p-1.5 rounded bg-slate-950">
                              {JSON.stringify(trace.result, null, 2)}
                            </pre>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Citations / Regulatory References */}
                {isAssistant && msg.citations && msg.citations.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/70 text-left space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                      <FileCheck className="h-3 w-3 text-cyan-400" />
                      <span>Statutory RAG Reference:</span>
                    </span>
                    {msg.citations.map((cite, cIdx) => (
                      <div key={cIdx} className="text-[11px] text-slate-300 border-l-2 border-cyan-500/50 pl-2">
                        <p className="font-semibold text-cyan-300">{cite.title}</p>
                        <p className="text-slate-400 text-[10px] mt-0.5">{cite.contentSnippet}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Actionable Prompt Button */}
                {isAssistant && msg.actionPrompt && (
                  <div className="text-left pt-1">
                    <button
                      onClick={() =>
                        onSendMessage(
                          `Draft a formal dispute waiver letter for shipment #${msg.actionPrompt?.payload} under terminal force majeure grounds.`
                        )
                      }
                      className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold text-xs transition flex items-center space-x-1.5 shadow-sm"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>{msg.actionPrompt.label}</span>
                    </button>
                  </div>
                )}

                <span className="text-[9px] font-mono text-slate-500 block">
                  {msg.timestamp}
                </span>
              </div>

              {!isAssistant && (
                <div className="h-7 w-7 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center space-x-2 text-slate-400 text-xs">
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-cyan-400" />
            <span className="font-mono">Chaining MCP tools & querying pgvector...</span>
          </div>
        )}
      </div>

      {/* Quick-Prompt Testing Guidance Chips */}
      <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/40">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
          Interactive Testing Scenarios (Click to test):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {QUICK_PROMPTS.map((p, idx) => (
            <button
              key={idx}
              onClick={() => onSelectPromptChip(p.text)}
              className="px-2.5 py-1.5 rounded-md bg-slate-950 border border-slate-800 hover:border-cyan-500/50 text-slate-300 text-[11px] text-left truncate transition flex items-center space-x-1.5"
            >
              <span className="text-[9px] px-1 py-0.2 rounded bg-slate-800 text-cyan-400 font-mono font-bold">
                {p.lang}
              </span>
              <span className="truncate">{p.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800 bg-slate-950">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about shipment status, demurrage, or statutory trade rules..."
            className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-3.5 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white font-medium text-xs transition flex items-center space-x-1 shrink-0"
          >
            <span>Send</span>
            <Send className="h-3 w-3" />
          </button>
        </div>
      </form>
    </div>
  );
}
