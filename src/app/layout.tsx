import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClearanceFlow | Cross-Border Customs Brokerage & Compliance Engine",
  description:
    "Enterprise cross-border trade compliance, container tracking, and customs brokerage copilot powered by PostgreSQL pgvector & MCP Tool Chaining.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 min-h-screen selection:bg-slate-200 selection:text-slate-900 dark:selection:bg-cyan-500/20 dark:selection:text-cyan-300">
        {children}
      </body>
    </html>
  );
}
