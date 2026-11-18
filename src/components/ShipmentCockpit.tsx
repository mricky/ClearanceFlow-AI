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
  Search,
} from "lucide-react";

interface ShipmentCockpitProps {
  shipments: ShipmentRecord[];
  selectedShipment: ShipmentRecord;
  onSelectShipment: (shipment: ShipmentRecord) => void;
  onAskCopilot: (prompt: string) => void;
  isLoading?: boolean;
}

export function ShipmentCockpit({
  shipments,
  selectedShipment,
  onSelectShipment,
  onAskCopilot,
  isLoading,
}: ShipmentCockpitProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CUSTOMS_HOLD_RED_CHANNEL":
        return {
          bg: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30",
          icon: <ShieldAlert className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />,
          label: "RED CHANNEL HOLD (SPJM)",
        };
      case "DEMURRAGE_OVERDUE":
        return {
          bg: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
          icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />,
          label: "DEMURRAGE OVERDUE ($600)",
        };
      case "RELEASED_GREEN_CHANNEL":
        return {
          bg: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
          icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />,
          label: "CUSTOMS RELEASED (SPPB)",
        };
      default:
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
          icon: <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />,
          label: "QUARANTINE REVIEW PENDING",
        };
    }
  };

  const badge = getStatusBadge(selectedShipment.status);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs flex flex-col h-full transition-colors">
      {/* Top Cockpit Header & Shipment Selector Tabs */}
      <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-2">
            <Package className="h-4 w-4 text-slate-700 dark:text-cyan-400" />
            <h2 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Container Telemetry & Customs Manifest
            </h2>
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
            Partition: <span className="font-semibold text-slate-700 dark:text-cyan-400">shipments_2026_q1</span>
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
                disabled={isLoading}
                onClick={() => onSelectShipment(s)}
                className={`px-2.5 py-2 rounded-lg text-left transition border ${
                  isLoading ? "opacity-60 cursor-not-allowed" : ""
                } ${
                  isSelected
                    ? "bg-white dark:bg-slate-800 border-slate-900 dark:border-cyan-500 text-slate-900 dark:text-white shadow-xs font-semibold"
                    : "bg-slate-100/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold">{s.id}</span>
                  {isAlert && <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span>}
                </div>
                <p className="text-[10px] truncate text-slate-500 dark:text-slate-400 mt-0.5">{s.containerNo}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-4 space-y-3.5 overflow-y-auto flex-1">
        {/* Primary Status Banner */}
        <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
          <div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-md text-xs font-mono font-bold border ${badge.bg}`}>
                {badge.icon}
                <span>{badge.label}</span>
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">B/L: {selectedShipment.waybillNo}</span>
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mt-1.5">{selectedShipment.commodity}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Carrier: <span className="text-slate-800 dark:text-slate-300 font-medium">{selectedShipment.carrier}</span> ({selectedShipment.vessel})
            </p>
          </div>

          <button
            disabled={isLoading}
            title="Jalankan audit kepabeanan untuk kargo terpilih ini"
            onClick={() =>
              onAskCopilot(
                `Check shipment #${selectedShipment.id} (${selectedShipment.containerNo}): What is its clearance status, risk factors, and mandatory regulations?`
              )
            }
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 text-xs font-medium border border-transparent dark:border-slate-700 transition shrink-0 shadow-xs ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            <span>Inspeksi Kargo Ini</span>
          </button>
        </div>

        {/* 4 Critical Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Route */}
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center space-x-1">
              <Anchor className="h-3 w-3 text-slate-600 dark:text-cyan-400" />
              <span>Trade Lane</span>
            </span>
            <div className="mt-1 text-xs font-mono text-slate-900 dark:text-slate-200">
              <p className="truncate font-semibold">{selectedShipment.pol.split(" ")[0]}</p>
              <p className="text-slate-500 dark:text-slate-400 text-[10px] flex items-center space-x-1">
                <span>➔</span>
                <span className="truncate">{selectedShipment.pod.split(" ")[0]}</span>
              </p>
            </div>
          </div>

          {/* Demurrage Clock */}
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center space-x-1">
              <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
              <span>Demurrage Clock</span>
            </span>
            <div className="mt-1">
              {selectedShipment.demurrageDaysOverdue > 0 ? (
                <p className="text-xs font-mono font-bold text-red-600 dark:text-red-400">
                  {selectedShipment.demurrageDaysOverdue} Days Overdue
                </p>
              ) : (
                <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {selectedShipment.freeTimeDaysLeft} Days Free Left
                </p>
              )}
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                Tariff: ${selectedShipment.demurrageDailyRateUsd}/day
              </p>
            </div>
          </div>

          {/* Reefer / Sensor Telemetry */}
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center space-x-1">
              <Thermometer className="h-3 w-3 text-blue-600 dark:text-blue-400" />
              <span>IoT Telemetry</span>
            </span>
            <div className="mt-1">
              {selectedShipment.temperatureCelsius !== null ? (
                <p className="text-xs font-mono font-bold text-blue-700 dark:text-cyan-300">
                  {selectedShipment.temperatureCelsius}°C (Reefer Active)
                </p>
              ) : (
                <p className="text-xs font-mono text-slate-700 dark:text-slate-400">Ambient Dry Box</p>
              )}
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                Seal: {selectedShipment.sealNo}
              </p>
            </div>
          </div>

          {/* HS Code & Regulatory */}
          <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center space-x-1">
              <FileText className="h-3 w-3 text-slate-600 dark:text-purple-400" />
              <span>Tariff & Mass</span>
            </span>
            <div className="mt-1">
              <p className="text-xs font-mono font-semibold text-slate-900 dark:text-slate-200 truncate">
                HS: {selectedShipment.hsCode.split(" ")[0]}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                VGM: {(selectedShipment.grossMassKg / 1000).toFixed(1)} MT
              </p>
            </div>
          </div>
        </div>

        {/* Milestone Timeline */}
        <div className="p-3.5 rounded-lg bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
          <h4 className="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wider mb-3">
            Milestone Timeline & Checkpoint Logs
          </h4>
          <div className="space-y-3 relative before:absolute before:inset-0 before:left-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
            {selectedShipment.timeline.map((event, idx) => {
              let dotColor = "bg-slate-400 dark:bg-slate-600";
              if (event.status === "completed") dotColor = "bg-emerald-600 dark:bg-emerald-500";
              if (event.status === "warning") dotColor = "bg-amber-500 dark:bg-amber-400";
              if (event.status === "error") dotColor = "bg-red-500 dark:bg-red-400";

              return (
                <div key={idx} className="relative flex items-start space-x-3 text-xs pl-6">
                  <span className={`absolute left-1 top-1 h-2 w-2 rounded-full ${dotColor}`}></span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-900 dark:text-slate-200">{event.label}</span>
                      <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400">{event.time}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5 leading-relaxed">{event.detail}</p>
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
