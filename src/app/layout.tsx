import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClearanceFlow AI | Cross-Border Customs Brokerage & Compliance Engine",
  description:
    "Autonomous cross-border customs brokerage and demurrage dispute engine powered by Gemini AI, Hybrid RAG (pgvector), and MCP Tool Chaining.",
  keywords: [
    "Customs AI",
    "CEISA 4.0",
    "Demurrage Dispute",
    "Supply Chain AI",
    "RAG",
    "Model Context Protocol",
    "Logistics Compliance",
  ],
  openGraph: {
    title: "ClearanceFlow AI | Customs Compliance & Demurrage Dispute Copilot",
    description:
      "Verifikasi status pabean CEISA 4.0 (SPJM/SPPB) dan otomasi pembuatan draf surat sanggahan demurrage berkop A4 resmi berdasar KUHD 517 & PMK 190/2022.",
    type: "website",
    locale: "id_ID",
    siteName: "ClearanceFlow AI",
  },
  twitter: {
    card: "summary_large_image",
    title: "ClearanceFlow AI | Customs Compliance & Demurrage Dispute Copilot",
    description:
      "Autonomous cross-border customs brokerage and demurrage dispute engine powered by Gemini AI and Hybrid RAG.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen selection:bg-slate-200 selection:text-slate-900 dark:selection:bg-cyan-500/20 dark:selection:text-cyan-300">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
