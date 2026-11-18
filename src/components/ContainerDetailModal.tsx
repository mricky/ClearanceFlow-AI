"use client";

import React from "react";
import { ShipmentRecord } from "../lib/types";
import {
  X,
  Package,
  Anchor,
  Thermometer,
  Clock,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ShieldAlert,
} from "lucide-react";

interface ContainerDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedShipment: ShipmentRecord;
}

export function ContainerDetailModal({
  isOpen,
  onClose,
  selectedShipment,
}: ContainerDetailModalProps) {
  if (!isOpen) return null;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CUSTOMS_HOLD_RED_CHANNEL":
        return {
          bg: "bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/30",
          icon: <ShieldAlert className="h-3.5 w-3.5 text-red-600 dark:text-red-400" />,
          label: "JALUR MERAH (SPJM BEHANDLE)",
        };
      case "DEMURRAGE_OVERDUE":
        return {
          bg: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/30",
          icon: <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />,
          label: "DENDA DEMURRAGE ($600)",
        };
      case "RELEASED_GREEN_CHANNEL":
        return {
          bg: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
          icon: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />,
          label: "JALUR HIJAU (SPPB TERBIT)",
        };
      default:
        return {
          bg: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/30",
          icon: <Clock className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />,
          label: "AUDIT B3 / KARANTINA PENDING",
        };
    }
  };

  const badge = getStatusBadge(selectedShipment.status);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-6 text-slate-900 dark:text-slate-100 transition-colors">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5 mb-4">
          <div className="flex items-center space-x-2.5">
            <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-blue-700 dark:text-cyan-400">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                  Rincian Kontainer #{selectedShipment.containerNo}
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                  {selectedShipment.id}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                Data Partisi: <span className="text-slate-700 dark:text-cyan-400 font-semibold">shipments_2026_q1</span> (Supabase Cloud Live)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4">
          {/* Primary Status Banner */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md text-xs font-mono font-bold border ${badge.bg}`}>
                  {badge.icon}
                  <span>{badge.label}</span>
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">B/L: {selectedShipment.waybillNo}</span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-1.5">{selectedShipment.commodity}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Shipping Line: <span className="text-slate-800 dark:text-slate-300 font-medium">{selectedShipment.carrier}</span> ({selectedShipment.vessel})
              </p>
            </div>
          </div>

          {/* 4 Critical Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Route */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center space-x-1">
                <Anchor className="h-3 w-3 text-slate-600 dark:text-cyan-400" />
                <span>Rute Pelayaran</span>
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
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center space-x-1">
                <Clock className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                <span>Dwell Time & Denda</span>
              </span>
              <div className="mt-1">
                {selectedShipment.demurrageDaysOverdue > 0 ? (
                  <p className="text-xs font-mono font-bold text-red-600 dark:text-red-400">
                    {selectedShipment.demurrageDaysOverdue} Hari Overdue
                  </p>
                ) : (
                  <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    Sisa {selectedShipment.freeTimeDaysLeft} Hari Free
                  </p>
                )}
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  Tarif: ${selectedShipment.demurrageDailyRateUsd}/hari
                </p>
              </div>
            </div>

            {/* Reefer / Sensor Telemetry */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center space-x-1">
                <Thermometer className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                <span>Sensor IoT & Suhu</span>
              </span>
              <div className="mt-1">
                {selectedShipment.temperatureCelsius !== null ? (
                  <p className="text-xs font-mono font-bold text-blue-700 dark:text-cyan-300">
                    {selectedShipment.temperatureCelsius}°C (Reefer Aktif)
                  </p>
                ) : (
                  <p className="text-xs font-mono text-slate-700 dark:text-slate-400">Dry Box (Ambient)</p>
                )}
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                  Segel: {selectedShipment.sealNo}
                </p>
              </div>
            </div>

            {/* HS Code & Regulatory */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium flex items-center space-x-1">
                <FileText className="h-3 w-3 text-slate-600 dark:text-purple-400" />
                <span>Klasifikasi & Berat</span>
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
          <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-900 dark:text-slate-300 uppercase tracking-wider mb-3">
              Log Riwayat Pelabuhan & Milestone Checkpoint
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

        {/* Modal Footer */}
        <div className="mt-5 pt-3.5 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition shadow-xs"
          >
            Tutup Rincian
          </button>
        </div>
      </div>
    </div>
  );
}
