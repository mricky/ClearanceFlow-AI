"use client";

import React from "react";
import { X, BookOpen, ShieldAlert, Scale, CheckCircle2, Building2, Globe2 } from "lucide-react";

interface RegulatorySourcesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RegulatorySourcesModal({ isOpen, onClose }: RegulatorySourcesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden transition-colors">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/80">
          <div className="flex items-center space-x-2.5">
            <div className="h-8 w-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-cyan-400 flex items-center justify-center">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Sumber Dokumen Regulasi & Disclaimer Riset
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Rujukan Dasar Hukum SOP Pabean yang Terindeks pada Database RAG
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Official Disclaimer Box */}
          <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-500/40 text-amber-950 dark:text-amber-200 space-y-1.5 leading-relaxed">
            <div className="flex items-center space-x-2 font-bold text-amber-900 dark:text-amber-300">
              <ShieldAlert className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Pernyataan Penafian Independensi Riset (Disclaimer)</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Aplikasi ini dikembangkan sebagai <strong>purwarupa riset teknologi independen</strong> untuk mendemonstrasikan implementasi <strong>Retrieval-Augmented Generation (RAG)</strong> berbasis PostgreSQL pgvector dan <strong>Model Context Protocol (MCP)</strong> pada sektor kepabeanan logistik maritim. Proyek ini <strong>tidak terafiliasi secara komersial dengan perusahaan freight forwarding, pelayaran, atau instansi kepabeanan manapun</strong>. Data kontainer adalah data simulasi studi kasus.
            </p>
          </div>

          <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px] font-mono pt-1">
            Dasar Hukum & Dokumen Resmi yang Digunakan Sebagai Knowledge Base:
          </h4>

          {/* 5 Regulatory Sources */}
          <div className="space-y-2.5">
            {/* 1. Kemenkeu & DJBC */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <Building2 className="h-3.5 w-3.5 text-blue-600 dark:text-cyan-400" />
                  <span>1. Direktorat Jenderal Bea dan Cukai (DJBC) - Kemenkeu RI</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-cyan-400">
                  Kepabeanan Impor
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                • <strong>PMK No. 190/PMK.04/2022</strong> tentang Pengeluaran Barang Impor Untuk Dipakai.<br />
                • <strong>PER-16/BC/2016 jo. CEISA 4.0</strong>: Standar Operasional Prosedur Jalur Merah (SPJM), pemeriksaan fisik TPP Behandle, dan penerbitan Surat Persetujuan Pengeluaran Barang (SPPB Jalur Hijau).
              </p>
            </div>

            {/* 2. KUHD & Otoritas Pelabuhan */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <Scale className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  <span>2. Kitab Undang-Undang Hukum Dagang (KUHD) & Otoritas Pelabuhan</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-400">
                  Hukum Demurrage
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                • <strong>KUHD Pasal 517</strong>: Pembebasan atau pembekuan klaim denda keterlambatan (demurrage) yang diakibatkan oleh keadaan memaksa di luar kendali komersial pemilik barang (*force majeure* / kongesti terminal).<br />
                • <strong>Surat Edaran Otoritas Pelabuhan Utama Tanjung Priok</strong> mengenai batas waktu *Free-Time* dan penanganan kemacetan pergerakan peti kemas di terminal.
              </p>
            </div>

            {/* 3. Barantin & BKIPM */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>3. Badan Karantina Indonesia (Barantin) / BKIPM</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-400">
                  Karantina & SPS
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                • <strong>UU No. 21 Tahun 2019</strong> tentang Karantina Hewan, Ikan, dan Tumbuhan.<br />
                • Ketentuan sertifikasi *Health Certificate* (HC) dan *Phytosanitary Certificate* melalui Indonesia National Single Window (INSW) untuk komoditas hasil laut & pertanian beku.
              </p>
            </div>

            {/* 4. Kementerian Perdagangan RI */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <Building2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  <span>4. Kementerian Perdagangan (Kemendag RI)</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-400">
                  Lartas Impor
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                • <strong>Permendag No. 36 Tahun 2023 jo. Permendag No. 8 Tahun 2024</strong>: Kebijakan dan Pengaturan Impor untuk pemenuhan dokumen Larangan dan Pembatasan (Lartas), Persetujuan Impor (PI), dan Laporan Surveyor (LS).
              </p>
            </div>

            {/* 5. Standar Maritim Internasional */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center space-x-1.5">
                  <Globe2 className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
                  <span>5. International Maritime Organization (IMO) & WCO</span>
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-400">
                  Standar Global
                </span>
              </div>
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-[11px]">
                • <strong>IMDG Code Amendemen 40-20</strong>: Ketentuan pengangkutan muatan berbahaya (B3 Kelas 8 Korosif), penempelan plakat tahan air 4 sisi, dan verifikasi dokumen 16-section UN GHS MSDS.<br />
                • <strong>SOLAS Convention</strong>: Verifikasi Berat Kotor Peti Kemas (Verified Gross Mass / VGM).
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50">
          <span className="font-mono text-[11px]">15 Dokumen Hukum Terindeks via pgvector HNSW</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-medium transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
