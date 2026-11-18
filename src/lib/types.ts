export type ShipmentStatus =
  | "CUSTOMS_HOLD_RED_CHANNEL"
  | "DEMURRAGE_OVERDUE"
  | "RELEASED_GREEN_CHANNEL"
  | "QUARANTINE_INSPECTION_PENDING";

export interface ShipmentEvent {
  time: string;
  label: string;
  detail: string;
  status: "completed" | "warning" | "error" | "pending";
}

export interface ShipmentRecord {
  id: string;
  waybillNo: string;
  containerNo: string;
  carrier: string;
  vessel: string;
  pol: string; // Port of Loading
  pod: string; // Port of Discharge
  commodity: string;
  hsCode: string;
  incoterm: string;
  status: ShipmentStatus;
  statusLabel: string;
  temperatureCelsius: number | null; // For reefer
  freeTimeDaysLeft: number;
  demurrageDaysOverdue: number;
  demurrageDailyRateUsd: number;
  grossMassKg: number;
  sealNo: string;
  timeline: ShipmentEvent[];
}

export interface KnowledgeDocument {
  id: number;
  title: string;
  category: "export_compliance_sop" | "import_compliance_sop" | "dispute_and_claims_sop";
  subCategory: string;
  content: string;
  score?: number;
}

export interface ToolExecutionTrace {
  toolName: string;
  arguments: Record<string, any>;
  result: Record<string, any>;
  latencyMs: number;
}

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  toolTraces?: ToolExecutionTrace[];
  citations?: { title: string; subCategory: string; contentSnippet: string }[];
  actionPrompt?: {
    type: "generate_dispute" | "view_shipment";
    payload: any;
    label: string;
  };
}
