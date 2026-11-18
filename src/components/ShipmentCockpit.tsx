"use client";

import React from "react";
import { ShipmentRecord } from "../lib/types";
import {
  Package,
  Anchor,
  Thermometer,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ShieldAlert,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface ShipmentCockpitProps {
  shipments: ShipmentRecord[];
  selectedShipment: ShipmentRecord;
  onSelectShipment: (shipment: ShipmentRecord) => void;
  onAskCopilot: (prompt: string) => void;
}

export function ShipmentCockpit({
  shipments,
  selectedShipment,
  onSelectShipment,
  onAskCopilot,
}: ShipmentCockpitProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CUSTOMS_HOLD_RED_CHANNEL":
        return {
          bg: "bg-red-500/10 text-red-400 border-red-500/30",
          icon: <ShieldAlert className="h-3.5 w-3.5" />,
          label: "RED CHANNEL HOLD (SPJM)",
        };
      case "DEMURRAGE_OVERDUE":
        return {
          bg: "bg-amber-500/10 text-amber-400 border-amber-500/30",
          icon: <AlertTriangle className="h-3.5 w-3.5" />,
          label: "DEMURRAGE OVERDUE ($600)",
        };
      case "RELEASED_GREEN_CHANNEL":
        return {
          bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
          icon: <CheckCircle2 className="h-3.5 w-3.5" />,
          label: "CUSTOMS RELEASED (SPPB)",
        };
      default:
        return {
          bg: "bg-blue-500/10 text-blue-400 border-blue-500/30",
          icon: <Clock className="h-3.5 w-3.5" />,
          label: "QUARANTINE REVIEW PENDING",
        };
    }
  };

  const badge = getStatusBadge(selectedShipment.status);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl flex flex-col h-full">
      {/* Top Cockpit Header & Shipment Selector Tabs */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/60">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Live Container Telemetry & Customs Manifest
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Partition: <span className="text-cyan-400">shipments_2026_q1</span>
          </span>
        </div>

        {/* Shipment Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          {shipments.map((s) => {
            const isSelected = s.id === selectedShipment.id;
            const isAlert = s.status === "CUSTOMS_HOLD_RED_CHANNEL" || s.status === "DEMURRAGE_OVERDUE";
            return (
              <button
                key={s.id}
                onClick={() => onSelectShipment(s)}
                className={`px-2.5 py-2 rounded-lg text-left transition border ${
                  isSelected
                    ? "bg-slate-800 border-cyan-500/60 text-white shadow-sm"
                    : "bg-slate-950/40 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold">{s.id}</span>
                  {isAlert && <span className="h-1.5 w-1.5 rounded-full bg-red-400 animate-ping"></span>}
                </div>
                <p className="text-[10px] truncate text-slate-400 mt-0.5">{s.containerNo}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        {/* Primary Status Banner */}
        <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md text-xs font-mono font-bold border ${badge.bg}`}>
                {badge.icon}
                <span>{badge.label}</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">B/L: {selectedShipment.waybillNo}</span>
            </div>
            <h3 className="text-sm font-semibold text-white mt-1.5">{selectedShipment.commodity}</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Carrier: <span className="text-slate-300">{selectedShipment.carrier}</span> ({selectedShipment.vessel})
            </p>
          </div>

          <button
            onClick={() =>
              onAskCopilot(
                `Check shipment #${selectedShipment.id} (${selectedShipment.containerNo}): What is its clearance status, risk factors, and mandatory regulations?`
              )
            }
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-medium border border-cyan-500/30 transition shrink-0"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Audit with Copilot</span>
          </button>
        </div>

        {/* 4 Critical Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Route */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 flex items-center space-x-1">
              <Anchor className="h-3 w-3 text-cyan-400" />
              <span>Trade Lane</span>
            </span>
            <div className="mt-1 text-xs font-mono text-slate-200">
              <p className="truncate">{selectedShipment.pol.split(" ")[0]}</p>
              <p className="text-slate-400 text-[10px] flex items-center space-x-1">
                <span>➔</span>
                <span className="truncate">{selectedShipment.pod.split(" ")[0]}</span>
              </p>
            </div>
          </div>

          {/* Demurrage Clock */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 flex items-center space-x-1">
              <Clock className="h-3 w-3 text-amber-400" />
              <span>Demurrage Clock</span>
            </span>
            <div className="mt-1">
              {selectedShipment.demurrageDaysOverdue > 0 ? (
                <p className="text-xs font-mono font-bold text-red-400">
                  {selectedShipment.demurrageDaysOverdue} Days Overdue
                </p>
              ) : (
                <p className="text-xs font-mono font-bold text-emerald-400">
                  {selectedShipment.freeTimeDaysLeft} Days Free Time Left
                </p>
              )}
              <p className="text-[10px] text-slate-500 font-mono">
                Tariff: ${selectedShipment.demurrageDailyRateUsd}/day
              </p>
            </div>
          </div>

          {/* Reefer / Sensor Telemetry */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 flex items-center space-x-1">
              <Thermometer className="h-3 w-3 text-blue-400" />
              <span>IoT Telemetry</span>
            </span>
            <div className="mt-1">
              {selectedShipment.temperatureCelsius !== null ? (
                <p className="text-xs font-mono font-bold text-cyan-300">
                  {selectedShipment.temperatureCelsius}°C (Reefer Active)
                </p>
              ) : (
                <p className="text-xs font-mono text-slate-400">Ambient Dry Container</p>
              )}
              <p className="text-[10px] text-slate-500 font-mono">
                Seal: {selectedShipment.sealNo}
              </p>
            </div>
          </div>

          {/* HS Code & Regulatory */}
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <span className="text-[11px] text-slate-400 flex items-center space-x-1">
              <FileText className="h-3 w-3 text-purple-400" />
              <span>Tariff & Mass</span>
            </span>
            <div className="mt-1">
              <p className="text-xs font-mono text-slate-200 truncate">
                HS: {selectedShipment.hsCode.split(" ")[0]}
              </p>
              <p className="text-[10px] text-slate-500 font-mono">
                VGM: {(selectedShipment.grossMassKg / 1000).toFixed(1)} MT (Verified)
              </p>
            </div>
          </div>
        </div>

        {/* Milestone Timeline */}
        <div className="p-3.5 rounded-lg bg-slate-950/40 border border-slate-800">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
            Operational Milestone Timeline & Checkpoint Logs
          </h4>
          <div className="space-y-3 relative before:absolute before:inset-0 before:left-2 before:w-0.5 before:bg-slate-800">
            {selectedShipment.timeline.map((event, idx) => {
              let dotColor = "bg-slate-600";
              if (event.status === "completed") dotColor = "bg-emerald-500 ring-4 ring-emerald-500/20";
              if (event.status === "warning") dotColor = "bg-amber-400 ring-4 ring-amber-400/20";
              if (event.status === "error") dotColor = "bg-red-400 ring-4 ring-red-400/20";

              return (
                <div key={idx} className="relative flex items-start space-x-3 text-xs pl-6">
                  <span className={`absolute left-1 top-1 h-2 w-2 rounded-full ${dotColor}`}></span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{event.label}</span>
                      <span className="text-[10px] font-mono text-slate-500">{event.time}</span>
                    </div>
                    <p className="text-slate-400 text-[11px] mt-0.5 leading-relaxed">{event.detail}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
