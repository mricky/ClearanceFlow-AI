"use client";

import React, { useState } from "react";
import { Header } from "../components/Header";
import { ShipmentCockpit } from "../components/ShipmentCockpit";
import { AgenticCopilot } from "../components/AgenticCopilot";
import { ArchitectureModal } from "../components/ArchitectureModal";
import { SAMPLE_SHIPMENTS } from "../lib/mockData";
import { ChatMessage, ShipmentRecord } from "../lib/types";
import { processAgentQuery } from "../lib/agentOrchestrator";

export default function Home() {
  const [selectedShipment, setSelectedShipment] = useState<ShipmentRecord>(SAMPLE_SHIPMENTS[0]);
  const [isArchModalOpen, setIsArchModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      sender: "assistant",
      text: "Welcome to **ClearanceFlow AI Copilot**.\n\nI am connected to your live partitioned container database and WCO/CEISA 4.0 statutory knowledge base. You can audit live container customs holds, calculate demurrage exposure, and draft legally sound waiver letters.\n\n*Click any testing scenario below or select a container from the cockpit to begin.*",
      timestamp: "Just now",
    },
  ]);

  const handleSendMessage = (text: string) => {
    // 1. Add user message
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // 2. Check if a specific shipment is referenced to sync cockpit
    const matchingShipment = SAMPLE_SHIPMENTS.find(
      (s) =>
        text.toUpperCase().includes(s.id.toUpperCase()) ||
        text.toUpperCase().includes(s.containerNo.toUpperCase()) ||
        text.includes("033") && s.id === "SHP-2026-033" ||
        text.includes("089") && s.id === "SHP-2026-089" ||
        text.includes("112") && s.id === "SHP-2026-112" ||
        text.includes("145") && s.id === "SHP-2026-145"
    );

    if (matchingShipment) {
      setSelectedShipment(matchingShipment);
    }

    // 3. Process autonomous agent reasoning
    setTimeout(() => {
      const response = processAgentQuery(text);
      setMessages((prev) => [...prev, response]);
      setIsLoading(false);
    }, 450); // Realistic snappy sub-second agent tool execution
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      {/* Top Header */}
      <Header onOpenArchModal={() => setIsArchModalOpen(true)} />

      {/* Main Split-Screen Cockpit & Copilot */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 lg:p-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Cockpit (7 cols) */}
        <section className="lg:col-span-7 h-[650px] lg:h-[calc(100vh-6.5rem)] min-h-[500px]">
          <ShipmentCockpit
            shipments={SAMPLE_SHIPMENTS}
            selectedShipment={selectedShipment}
            onSelectShipment={setSelectedShipment}
            onAskCopilot={(prompt) => handleSendMessage(prompt)}
          />
        </section>

        {/* Right Copilot (5 cols) */}
        <section className="lg:col-span-5 h-[650px] lg:h-[calc(100vh-6.5rem)] min-h-[500px]">
          <AgenticCopilot
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onSelectPromptChip={(prompt) => handleSendMessage(prompt)}
          />
        </section>
      </main>

      {/* Architecture & Engineering Specification Modal */}
      <ArchitectureModal
        isOpen={isArchModalOpen}
        onClose={() => setIsArchModalOpen(false)}
      />
    </div>
  );
}
