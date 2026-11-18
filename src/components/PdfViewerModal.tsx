"use client";

import React from "react";
import { X, Download, FileText } from "lucide-react";

interface PdfViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  pdfUrl: string | null;
  filename?: string;
  onDownload: () => void;
  containerNo?: string;
}

export function PdfViewerModal({
  isOpen,
  onClose,
  pdfUrl,
  filename = "Surat-Sanggahan-Demurrage.pdf",
  onDownload,
  containerNo,
}: PdfViewerModalProps) {
  if (!isOpen || !pdfUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-4xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        {/* Top Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/80">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-400 flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Pratinjau Dokumen PDF Resmi
                </h3>
                {containerNo && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {containerNo}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                Surat Sanggahan Demurrage & Permohonan Force Majeure (KUHD Pasal 517)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={onDownload}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-medium text-xs transition shadow-xs"
              title="Unduh file PDF ini ke komputer"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Unduh PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
              title="Tutup Pratinjau"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Embedded PDF Viewer */}
        <div className="flex-1 w-full bg-slate-100 dark:bg-slate-950 p-2 sm:p-3 relative">
          <iframe
            src={`${pdfUrl}#toolbar=1&navpanes=0`}
            title="Pratinjau Surat Sanggahan Demurrage"
            className="w-full h-full rounded-lg border border-slate-300 dark:border-slate-800 bg-white"
          />
        </div>

        {/* Bottom Bar with Actions */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 font-mono">
          <span>Format: Dokumen Hukum Standar A4 (210 x 297 mm)</span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-sans text-xs transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
