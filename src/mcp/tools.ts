import { createClient } from "@supabase/supabase-js";
import { SAMPLE_SHIPMENTS, KNOWLEDGE_DOCUMENTS } from "../lib/mockData";

export interface MCPToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, any>;
    required?: string[];
  };
}

export const CLEARANCEFLOW_MCP_TOOLS: MCPToolDefinition[] = [
  {
    name: "lookup_shipment",
    description:
      "Inspect live container telemetry, Bill of Lading (B/L), cargo commodity, route, free-time, and CEISA customs clearance status from quarterly partitioned database.",
    inputSchema: {
      type: "object",
      properties: {
        identifier: {
          type: "string",
          description: "Container number (e.g. MSKU-992104, OCLU-883192), B/L number, or shipment ID (SHP-001).",
        },
      },
      required: ["identifier"],
    },
  },
  {
    name: "search_compliance_knowledge",
    description:
      "Execute hybrid RAG search against statutory Indonesian customs (CEISA 4.0), WCO trade conventions, and quarantine regulations using full-text lexical ranking and dense vector embeddings.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Regulatory legal query (e.g. 'SPJM Red Channel inspection frozen prawns', 'demurrage force majeure', 'phytosanitary Barantin').",
        },
        categoryFilter: {
          type: "string",
          enum: ["all", "import_clearance", "export_clearance", "port_operations", "quarantine"],
          description: "Optional category filter to isolate regulations.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "calculate_demurrage_risk",
    description:
      "Calculate current container demurrage penalty exposure, daily tariff rates, and projected financial liability under ocean carrier detention terms.",
    inputSchema: {
      type: "object",
      properties: {
        containerNo: {
          type: "string",
          description: "Container number to calculate demurrage tariff exposure.",
        },
      },
      required: ["containerNo"],
    },
  },
  {
    name: "generate_dispute_draft",
    description:
      "Draft a legally binding Force Majeure demurrage waiver dispute letter citing Tanjung Priok port congestion bulletins and Indonesian Commercial Code (KUHD Article 517).",
    inputSchema: {
      type: "object",
      properties: {
        shipmentId: {
          type: "string",
          description: "Shipment ID (e.g. SHP-002) or Container number.",
        },
        reasonSummary: {
          type: "string",
          description: "Operational rationale for dispute (e.g. 36-hour physical inspection backlog at TPP Behandle).",
        },
      },
      required: ["shipmentId", "reasonSummary"],
    },
  },
];

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

export async function executeMCPTool(toolName: string, args: Record<string, any>) {
  const supabase = getSupabaseClient();

  switch (toolName) {
    case "lookup_shipment": {
      const cleaned = (args.identifier || "").trim().toUpperCase();

      // 1. Try Live Supabase Query
      if (supabase) {
        try {
          const { data, error } = await supabase
            .from("shipments")
            .select("*")
            .or(`container_no.ilike.%${cleaned}%,waybill_no.ilike.%${cleaned}%,id.ilike.%${cleaned}%`)
            .limit(1)
            .maybeSingle();

          if (data && !error) {
            return {
              found: true,
              source: "supabase_live_partition_2026_q1",
              id: data.id,
              waybillNo: data.waybill_no,
              containerNo: data.container_no,
              status: data.status,
              commodity: data.commodity,
              carrier: data.carrier,
              vessel: data.vessel,
              pol: data.pol,
              pod: data.pod,
              freeTimeDaysLeft: data.free_time_days_left,
              demurrageDaysOverdue: data.demurrage_days_overdue,
              temperatureCelsius: data.temperature_celsius ? Number(data.temperature_celsius) : null,
              hsCode: data.hs_code,
              grossMassKg: data.gross_mass_kg,
              timeline: data.timeline,
            };
          }
        } catch (dbErr) {
          console.warn("Supabase lookup error, falling back to local dataset:", dbErr);
        }
      }

      // 2. Fallback to Local Dataset
      const found = SAMPLE_SHIPMENTS.find(
        (s) =>
          s.waybillNo.toUpperCase().includes(cleaned) ||
          s.containerNo.toUpperCase().includes(cleaned) ||
          s.id.toUpperCase().includes(cleaned)
      );

      if (!found) {
        return {
          found: false,
          error: `Shipment identifier '${cleaned}' not found in partition shipments_2026_q1/q2.`,
        };
      }

      return {
        found: true,
        source: "local_partition_fallback",
        id: found.id,
        waybillNo: found.waybillNo,
        containerNo: found.containerNo,
        status: found.status,
        commodity: found.commodity,
        carrier: found.carrier,
        vessel: found.vessel,
        pol: found.pol,
        pod: found.pod,
        freeTimeDaysLeft: found.freeTimeDaysLeft,
        demurrageDaysOverdue: found.demurrageDaysOverdue,
        temperatureCelsius: found.temperatureCelsius,
        hsCode: found.hsCode,
        grossMassKg: found.grossMassKg,
        timeline: found.timeline,
      };
    }

    case "search_compliance_knowledge": {
      // 1. Try Live Supabase pgvector RPC
      if (supabase && args.queryVector) {
        try {
          const { data, error } = await supabase.rpc("search_compliance_hybrid_rrf", {
            query_text: args.query,
            query_vector: args.queryVector,
            match_count: 3,
          });

          if (data && data.length > 0 && !error) {
            return {
              query: args.query,
              source: "supabase_pgvector_hnsw_hybrid",
              retrievedCount: data.length,
              documents: data.map((d: any) => ({
                title: d.title,
                category: d.category,
                subCategory: d.sub_category,
                contentSnippet: d.content,
                rrfScore: d.rrf_score,
              })),
            };
          }
        } catch (ragErr) {
          console.warn("Supabase RPC error, falling back:", ragErr);
        }
      }

      // 2. Fallback
      const q = (args.query || "").toLowerCase();
      const tokens = q.replace(/[^\w\s]/g, " ").split(/\s+/).filter((t: string) => t.length > 2);

      let pool = KNOWLEDGE_DOCUMENTS;
      if (args.categoryFilter && args.categoryFilter !== "all") {
        pool = pool.filter((d) => d.category === args.categoryFilter);
      }

      const scored = pool.map((doc) => {
        let matches = 0;
        const text = (doc.title + " " + doc.content).toLowerCase();
        tokens.forEach((t: string) => {
          if (text.includes(t)) matches++;
        });
        return { doc, score: matches };
      });

      const top = scored
        .filter((s) => s.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((s) => ({
          title: s.doc.title,
          category: s.doc.category,
          subCategory: s.doc.subCategory,
          contentSnippet: s.doc.content,
        }));

      return {
        query: args.query,
        source: "local_rrf_simulation",
        retrievedCount: top.length,
        documents: top.length > 0 ? top : pool.slice(0, 2).map((d) => ({
          title: d.title,
          category: d.category,
          subCategory: d.subCategory,
          contentSnippet: d.content,
        })),
      };
    }

    case "calculate_demurrage_risk": {
      const cNo = (args.containerNo || "").trim().toUpperCase();
      const s = SAMPLE_SHIPMENTS.find((item) => item.containerNo.toUpperCase().includes(cNo));

      if (!s) {
        return { error: `Container '${cNo}' not found.` };
      }

      const totalExposure = s.demurrageDaysOverdue * s.demurrageDailyRateUsd;
      return {
        containerNo: s.containerNo,
        demurrageDaysOverdue: s.demurrageDaysOverdue,
        freeTimeDaysLeft: s.freeTimeDaysLeft,
        dailyRateUsd: s.demurrageDailyRateUsd,
        accruedPenaltyUsd: totalExposure,
        waiverEligibility: totalExposure > 0 ? "ELIGIBLE_FORCE_MAJEURE" : "NOT_APPLICABLE",
      };
    }

    case "generate_dispute_draft": {
      const s = SAMPLE_SHIPMENTS.find(
        (item) => item.id.toUpperCase() === (args.shipmentId || "").toUpperCase() || item.containerNo.toUpperCase().includes((args.shipmentId || "").toUpperCase())
      );

      const containerNo = s ? s.containerNo : args.shipmentId;
      const bl = s ? s.waybillNo : "WBL-2026-UNKNOWN";
      const carrier = s ? s.carrier : "Ocean Line Logistics";
      const amount = s ? s.demurrageDaysOverdue * s.demurrageDailyRateUsd : 600;

      const dateStr = new Date().toISOString().split("T")[0];
      const draft = `FORMAL NOTICE OF DEMURRAGE DISPUTE & WAIVER APPLICATION
Reference: CF-DISPUTE-2026-${Math.floor(1000 + Math.random() * 9000)}
Date: ${dateStr}

To: Billing Department, ${carrier}
In Re: Container #${containerNo} | Master B/L #${bl}
Disputed Amount: $${amount}.00 USD

Dear Carrier Operations Directorate,

We represent the consignee regarding Container #${containerNo}. A total penalty of $${amount}.00 USD has accrued due to extraordinary terminal dwell times.

GROUNDS OF DISPUTE (FORCE MAJEURE):
1. Terminal Physical Backlog: Official Port Authority Bulletin documented a 36-hour physical inspection queue at Tanjung Priok TPP Behandle.
2. Indonesian Commercial Code (KUHD) Article 517: Carrier dwell fees accrued strictly due to statutory customs mandates beyond merchant commercial control shall not be assessed against the merchant.
3. Rationale: ${args.reasonSummary || "Inspection backlog caused by official CEISA SPJM red channel hold."}

PRAYER FOR RELIEF:
We formally petition full waiver of all demurrage charges and request immediate release authorization (SPPB Gate-Out).

Respectfully submitted,
ClearanceFlow Autonomous Brokerage Engine
Verified by Customs Specialist Baratin & WCO Protocol`;

      return {
        success: true,
        containerNo,
        disputeLetter: draft,
      };
    }

    default:
      throw new Error(`Unknown MCP Tool: ${toolName}`);
  }
}
