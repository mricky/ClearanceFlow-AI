import { SAMPLE_SHIPMENTS } from "./mockData";
import { ShipmentRecord, ToolExecutionTrace } from "./types";

export function lookupShipment(
  identifier: string
): { shipment: ShipmentRecord | null; trace: ToolExecutionTrace } {
  const start = performance.now();
  const cleaned = identifier.trim().toUpperCase();

  const found = SAMPLE_SHIPMENTS.find(
    (s) =>
      s.waybillNo.toUpperCase().includes(cleaned) ||
      s.containerNo.toUpperCase().includes(cleaned) ||
      s.id.toUpperCase().includes(cleaned)
  );

  const latencyMs = Math.round(performance.now() - start + 2); // Simulated sub-millisecond Postgres index scan

  return {
    shipment: found || null,
    trace: {
      toolName: "lookup_shipment",
      arguments: { identifier: cleaned },
      result: found
        ? {
            found: true,
            waybillNo: found.waybillNo,
            containerNo: found.containerNo,
            status: found.status,
            commodity: found.commodity,
            pol: found.pol,
            pod: found.pod,
            freeTimeDaysLeft: found.freeTimeDaysLeft,
            demurrageDaysOverdue: found.demurrageDaysOverdue,
          }
        : { found: false, error: "Shipment not found in partition Q1/Q2" },
      latencyMs,
    },
  };
}

export function calculateDemurrageRisk(
  containerNo: string
): { calculation: any; trace: ToolExecutionTrace } {
  const start = performance.now();
  const cleaned = containerNo.trim().toUpperCase();
  const shipment = SAMPLE_SHIPMENTS.find((s) => s.containerNo.toUpperCase().includes(cleaned));

  let calculation: any;
  if (!shipment) {
    calculation = { error: "Container not found" };
  } else {
    const isOverdue = shipment.demurrageDaysOverdue > 0;
    const totalExposureUsd = shipment.demurrageDaysOverdue * shipment.demurrageDailyRateUsd;
    const projected7DaysUsd = isOverdue
      ? (shipment.demurrageDaysOverdue + 7) * shipment.demurrageDailyRateUsd
      : Math.max(0, 7 - shipment.freeTimeDaysLeft) * shipment.demurrageDailyRateUsd;

    calculation = {
      containerNo: shipment.containerNo,
      carrier: shipment.carrier,
      dailyTariffUsd: shipment.demurrageDailyRateUsd,
      freeTimeDaysLeft: shipment.freeTimeDaysLeft,
      daysOverdue: shipment.demurrageDaysOverdue,
      accruedExposureUsd: totalExposureUsd,
      projected7DaysExposureUsd: projected7DaysUsd,
      eligibleForForceMajeureWaiver: shipment.status === "DEMURRAGE_OVERDUE",
    };
  }

  return {
    calculation,
    trace: {
      toolName: "calculate_demurrage_risk",
      arguments: { containerNo: cleaned },
      result: calculation,
      latencyMs: Math.round(performance.now() - start + 1),
    },
  };
}

export function generateDisputeDraft(
  shipmentId: string,
  legalGround: string
): { draft: string; trace: ToolExecutionTrace } {
  const start = performance.now();
  const shipment = SAMPLE_SHIPMENTS.find((s) => s.id === shipmentId || s.containerNo === shipmentId);

  const container = shipment ? shipment.containerNo : shipmentId;
  const waybill = shipment ? shipment.waybillNo : "WBL-2026-UNKNOWN";
  const carrier = shipment ? shipment.carrier : "Ocean Carrier Billing Dept";
  const overdueUsd = shipment ? shipment.demurrageDaysOverdue * shipment.demurrageDailyRateUsd : 600;

  const draft = `
FORMAL NOTICE OF DEMURRAGE DISPUTE & WAIVER REQUEST
Date: ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
To: ${carrier} — Demurrage & Detention Invoicing Division
Subject: Dispute of Demurrage Assessment on Container: ${container} (B/L: ${waybill})

Dear Claims and Invoicing Committee,

We write on behalf of the registered consignee to formally dispute and request a full waiver of the demurrage fees assessed in the amount of USD $${overdueUsd}.00 accrued against container ${container}.

1. LEGAL & FACTUAL GROUNDS:
${legalGround}

2. STATUTORY BASIS:
In accordance with WCO/FMC guidelines and Port Authority Circular on terminal operational disruptions, demurrage charges are non-punitive and cannot be assessed when the cargo holder is prevented from retrieval due to circumstances beyond reasonable commercial control (Force Majeure / Documented Terminal Congestion).

3. REQUESTED RELIEF:
We respectfully request that all demurrage clocks be frozen and fees accrued during the aforementioned disruption period be waived immediately to allow expedited gate-out.

Respectfully submitted,
ClearanceFlow AI Autonomous Trade Operations
Case Reference: CF-DISPUTE-${Date.now().toString().slice(-6)}
`.trim();

  return {
    draft,
    trace: {
      toolName: "generate_dispute_draft",
      arguments: { shipmentId, legalGround: legalGround.slice(0, 80) + "..." },
      result: { status: "DRAFT_GENERATED", characterCount: draft.length },
      latencyMs: Math.round(performance.now() - start + 4),
    },
  };
}
