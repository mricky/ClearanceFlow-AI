import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ClearanceFlow AI | Autonomous Freight Compliance & Customs Copilot",
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
      <body className="bg-slate-950 text-slate-100 min-h-screen selection:bg-cyan-500/20 selection:text-cyan-300">
        {children}
      </body>
    </html>
  );
}
