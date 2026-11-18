import { lookupShipment, calculateDemurrageRisk, generateDisputeDraft } from "./mcpTools";
import { searchComplianceRAG } from "./ragEngine";
import { ChatMessage, ToolExecutionTrace } from "./types";

export function processAgentQuery(query: string): ChatMessage {
  const traces: ToolExecutionTrace[] = [];
  const citations: { title: string; subCategory: string; contentSnippet: string }[] = [];
  const isIndonesian = /yang|apa|bagaimana|kenapa|tolong|cek|kontainer|jalur|merah|denda|ekspor|impor/i.test(query);

  let responseText = "";
  let actionPrompt: any = undefined;

  // 1. Identify shipment mentions
  const containerMatch = query.match(/(?:MSKU|OCLU|CMAU|EGLV)[-\s]?\d{6,7}/i);
  const shpMatch = query.match(/SHP[-\s]?\d{4}[-\s]?\d{2,3}/i) || query.match(/033|089|112|145/);
  const shipmentId = containerMatch ? containerMatch[0] : shpMatch ? shpMatch[0] : null;

  let shipmentData: any = null;

  // Step 1: Execute MCP Tool 1 if shipment mentioned
  if (shipmentId) {
    const { shipment, trace } = lookupShipment(shipmentId);
    traces.push(trace);
    shipmentData = shipment;
  }

  // Step 2: Execute RAG Engine Tool (Hybrid Search pgvector + GIN)
  const ragQuery = shipmentData
    ? `${query} ${shipmentData.status} ${shipmentData.commodity}`
    : query;
  const { documents, trace: ragTrace } = searchComplianceRAG(ragQuery);
  traces.push(ragTrace);

  documents.forEach((doc) => {
    citations.push({
      title: doc.title,
      subCategory: doc.subCategory,
      contentSnippet: doc.content.slice(0, 160) + "...",
    });
  });

  // Step 3: Execute Demurrage Calculation Tool if relevant
  let demurrageCalc: any = null;
  if (
    shipmentData &&
    (/demurrage|denda|detention|cost|biaya/i.test(query) ||
      shipmentData.status === "DEMURRAGE_OVERDUE" ||
      shipmentData.freeTimeDaysLeft <= 2)
  ) {
    const { calculation, trace } = calculateDemurrageRisk(shipmentData.containerNo);
    traces.push(trace);
    demurrageCalc = calculation;
  }

  // Step 4: Execute Dispute Draft Tool if user asked for dispute/sanggahan
  let disputeDraft: string | null = null;
  if (/dispute|sanggah|surat|draft|waiver/i.test(query) && shipmentData) {
    const ground =
      "Documented terminal yard congestion and TPS transport backlog causing 36-hour delay outside shipper control during mandatory Red Channel behandle inspection.";
    const { draft, trace } = generateDisputeDraft(shipmentData.id, ground);
    traces.push(trace);
    disputeDraft = draft;
  }

  // Synthesize intelligent response
  if (disputeDraft) {
    if (isIndonesian) {
      responseText = `Berikut draf resmi **Surat Sanggahan Denda Demurrage (Dispute Letter)** untuk kontainer **${shipmentData.containerNo}** berdasarkan klausul Force Majeure pelabuhan:\n\n\`\`\`text\n${disputeDraft}\n\`\`\`\n\n📌 **Rekomendasi Operasional:** Segera kirimkan surat ini ke bagian Billing/Claims pelayaran ${shipmentData.carrier} beserta Berita Acara Pelaksanaan Pemeriksaan Fisik dan Notifikasi Resmi Antrean Terminal.`;
    } else {
      responseText = `Generated formal **Notice of Demurrage Dispute** for container **${shipmentData.containerNo}** leveraging statutory force majeure grounds:\n\n\`\`\`text\n${disputeDraft}\n\`\`\`\n\n📌 **Next Steps:** Submit this letter directly to ${shipmentData.carrier} Billing Division along with the official terminal congestion notice and SPJM inspection slip.`;
    }
  } else if (shipmentData) {
    if (isIndonesian) {
      responseText = `Hasil audit sistem untuk kontainer **${shipmentData.containerNo}** (${shipmentData.waybillNo}):\n\n` +
        `• **Status Saat Ini:** \`${shipmentData.statusLabel}\`\n` +
        `• **Komoditas & Rute:** ${shipmentData.commodity} | ${shipmentData.pol} ➔ ${shipmentData.pod}\n` +
        (shipmentData.temperatureCelsius !== null
          ? `• **Telemetri Suhu Reefer:** ${shipmentData.temperatureCelsius}°C (Sesuai set-point GDP)\n`
          : "") +
        (demurrageCalc
          ? `• **Eksposur Finansial Demurrage:** Akumulasi: **$${demurrageCalc.accruedExposureUsd}** (Tarif: $${demurrageCalc.dailyTariffUsd}/hari, Sisa Free-Time: ${demurrageCalc.freeTimeDaysLeft} hari)\n`
          : "") +
        `\n⚖️ **Rujukan Regulasi Pabean (RAG Knowledge Base):**\n` +
        `Berdasarkan **${citations[0]?.title || "SOP Kepabeanan"}**, proses pemeriksaan fisik pabean wajib dihadiri dalam waktu maksimal 3x24 jam sejak SPJM terbit. Pastikan dokumen karantina dan izin edar telah terunggah di portal CEISA.`;

      if (shipmentData.demurrageDaysOverdue > 0) {
        actionPrompt = {
          type: "generate_dispute",
          label: "📝 Generate Draf Surat Sanggahan Denda (Force Majeure)",
          payload: shipmentData.id,
        };
      }
    } else {
      responseText = `Operational & Regulatory audit for container **${shipmentData.containerNo}** (${shipmentData.waybillNo}):\n\n` +
        `• **Operational Status:** \`${shipmentData.statusLabel}\`\n` +
        `• **Cargo & Route:** ${shipmentData.commodity} | ${shipmentData.pol} ➔ ${shipmentData.pod}\n` +
        (shipmentData.temperatureCelsius !== null
          ? `• **Reefer Cold Chain Telemetry:** ${shipmentData.temperatureCelsius}°C (GDP compliant)\n`
          : "") +
        (demurrageCalc
          ? `• **Demurrage Exposure:** Accrued: **$${demurrageCalc.accruedExposureUsd}** (Daily rate: $${demurrageCalc.dailyTariffUsd}/day, Free time left: ${demurrageCalc.freeTimeDaysLeft} days)\n`
          : "") +
        `\n⚖️ **Statutory Trade Compliance (RAG Knowledge Base):**\n` +
        `Pursuant to **${citations[0]?.title || "Customs Standard Operating Procedures"}**, physical inspection must be scheduled within 3 business days of the Red Channel notice. Ensure health and quarantine certificates are pre-cleared.`;

      if (shipmentData.demurrageDaysOverdue > 0) {
        actionPrompt = {
          type: "generate_dispute",
          label: "📝 Generate Formal Demurrage Waiver Letter",
          payload: shipmentData.id,
        };
      }
    }
  } else {
    // Pure RAG response
    const topDoc = documents[0];
    if (isIndonesian) {
      responseText = `Berdasarkan penelusuran **Hybrid Search (pgvector + GIN)** pada basis data regulasi pabean:\n\n` +
        `### ${topDoc.title}\n\n` +
        `${topDoc.content}\n\n` +
        `💡 *Aturan ini berlaku mengikat untuk seluruh perlintasan kepabeanan di pelabuhan laut internasional.*`;
    } else {
      responseText = `According to our **Hybrid Search (pgvector + GIN RRF)** statutory knowledge base:\n\n` +
        `### ${topDoc.title}\n\n` +
        `${topDoc.content}\n\n` +
        `💡 *This regulation is binding across all international maritime customs checkpoints.*`;
    }
  }

  return {
    id: `msg-${Date.now()}`,
    sender: "assistant",
    text: responseText,
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    toolTraces: traces,
    citations,
    actionPrompt,
  };
}
