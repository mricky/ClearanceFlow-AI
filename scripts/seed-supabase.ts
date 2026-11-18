import { GoogleGenerativeAI } from "@google/generative-ai";
import { SAMPLE_SHIPMENTS, KNOWLEDGE_DOCUMENTS } from "../src/lib/mockData";

const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_REF || "mhclyvsrnogzavzcwhxw";
const SUPABASE_PAT = process.env.SUPABASE_PAT || "";
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";

async function executeSql(sql: string) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_PAT}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`SQL Error (${res.status}): ${errorText}`);
  }

  return res.json();
}

async function waitForDatabase() {
  console.log("Checking Supabase project status...");
  for (let i = 0; i < 30; i++) {
    try {
      const res = await fetch(`https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}`, {
        headers: { Authorization: `Bearer ${SUPABASE_PAT}` },
      });
      const data = await res.json();
      console.log(`Status [attempt ${i + 1}]:`, data.status);

      if (data.status === "ACTIVE_HEALTHY" || data.status === "ACTIVE") {
        // Test query
        try {
          await executeSql("SELECT 1 as test;");
          console.log("Database connection confirmed healthy!");
          return true;
        } catch (qErr: any) {
          console.log("DB still starting up, waiting 5s...");
        }
      }
    } catch (e: any) {
      console.log("Waiting for network...", e.message);
    }
    await new Promise((r) => setTimeout(r, 6000));
  }
  throw new Error("Supabase database did not become active in time.");
}

async function main() {
  console.log("--- STARTING LIVE SUPABASE SEEDING ---");

  // 1. Wait for DB
  await waitForDatabase();

  // 2. DDL 1: Partitioned Shipments Table
  console.log("Running Migration 1: Partitioned Shipments...");
  const ddlShipments = `
    CREATE TABLE IF NOT EXISTS shipments (
        id VARCHAR(50) NOT NULL,
        waybill_no VARCHAR(50) NOT NULL,
        container_no VARCHAR(20) NOT NULL,
        carrier VARCHAR(255) NOT NULL,
        vessel VARCHAR(255) NOT NULL,
        pol VARCHAR(100) NOT NULL,
        pod VARCHAR(100) NOT NULL,
        commodity VARCHAR(255) NOT NULL,
        hs_code VARCHAR(100) NOT NULL,
        incoterm VARCHAR(50) NOT NULL,
        status VARCHAR(50) NOT NULL,
        temperature_celsius NUMERIC(5,2),
        free_time_days_left INT DEFAULT 5,
        demurrage_days_overdue INT DEFAULT 0,
        demurrage_daily_rate_usd NUMERIC(10,2) DEFAULT 150.00,
        gross_mass_kg INT NOT NULL,
        seal_no VARCHAR(50) NOT NULL,
        timeline JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMPTZ NOT NULL,
        PRIMARY KEY (id, created_at)
    ) PARTITION BY RANGE (created_at);

    CREATE TABLE IF NOT EXISTS shipments_2026_q1 PARTITION OF shipments
        FOR VALUES FROM ('2026-01-01 00:00:00+00') TO ('2026-04-01 00:00:00+00');

    CREATE TABLE IF NOT EXISTS shipments_2026_q2 PARTITION OF shipments
        FOR VALUES FROM ('2026-04-01 00:00:00+00') TO ('2026-07-01 00:00:00+00');

    CREATE TABLE IF NOT EXISTS shipments_2026_q3 PARTITION OF shipments
        FOR VALUES FROM ('2026-07-01 00:00:00+00') TO ('2026-10-01 00:00:00+00');

    CREATE TABLE IF NOT EXISTS shipments_2026_q4 PARTITION OF shipments
        FOR VALUES FROM ('2026-10-01 00:00:00+00') TO ('2027-01-01 00:00:00+00');

    CREATE TABLE IF NOT EXISTS shipments_default PARTITION OF shipments DEFAULT;

    CREATE INDEX IF NOT EXISTS idx_shipments_container ON shipments (container_no);
    CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments (status);
    CREATE INDEX IF NOT EXISTS idx_shipments_waybill ON shipments (waybill_no);
  `;
  await executeSql(ddlShipments);
  console.log("Partitioned Shipments schema created successfully!");

  // 3. DDL 2: pgvector & Hybrid RAG Knowledge Documents
  console.log("Running Migration 2: pgvector & RRF Functions...");
  const ddlKnowledge = `
    CREATE EXTENSION IF NOT EXISTS vector;

    CREATE TABLE IF NOT EXISTS knowledge_documents (
        id BIGSERIAL PRIMARY KEY,
        title VARCHAR(250) NOT NULL,
        category VARCHAR(60) NOT NULL,
        sub_category VARCHAR(60) NOT NULL,
        content TEXT NOT NULL,
        tsv TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || category || ' ' || sub_category || ' ' || content)) STORED,
        embedding VECTOR(1536) NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_docs_hnsw_cosine 
    ON knowledge_documents 
    USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

    CREATE INDEX IF NOT EXISTS idx_docs_tsv_gin 
    ON knowledge_documents 
    USING gin (tsv);

    CREATE OR REPLACE FUNCTION search_compliance_hybrid_rrf(
        query_text TEXT,
        query_vector VECTOR(1536),
        match_count INT DEFAULT 3
    )
    RETURNS TABLE (
        id BIGINT,
        title VARCHAR,
        category VARCHAR,
        sub_category VARCHAR,
        content TEXT,
        rrf_score NUMERIC
    ) AS $$
    WITH 
    lexical_search AS (
        SELECT 
            kd.id, 
            ROW_NUMBER() OVER (ORDER BY ts_rank_cd(kd.tsv, websearch_to_tsquery('english', query_text)) DESC) AS rank_lexical
        FROM knowledge_documents kd
        WHERE kd.tsv @@ websearch_to_tsquery('english', query_text)
        LIMIT 20
    ),
    vector_search AS (
        SELECT 
            kd.id, 
            ROW_NUMBER() OVER (ORDER BY kd.embedding <=> query_vector ASC) AS rank_vector
        FROM knowledge_documents kd
        ORDER BY kd.embedding <=> query_vector ASC
        LIMIT 20
    )
    SELECT 
        kd.id,
        kd.title,
        kd.category,
        kd.sub_category,
        kd.content,
        ROUND((COALESCE(1.0 / (60 + l.rank_lexical), 0.0) + COALESCE(1.0 / (60 + v.rank_vector), 0.0))::numeric, 5) AS rrf_score
    FROM knowledge_documents kd
    LEFT JOIN lexical_search l ON kd.id = l.id
    LEFT JOIN vector_search v ON kd.id = v.id
    WHERE l.id IS NOT NULL OR v.id IS NOT NULL
    ORDER BY rrf_score DESC
    LIMIT match_count;
    $$ LANGUAGE SQL STABLE;
  `;
  await executeSql(ddlKnowledge);
  console.log("pgvector & hybrid search functions created successfully!");

  // 4. Seed Shipments Data
  console.log("Seeding Shipments Table into quarterly partition...");
  for (const s of SAMPLE_SHIPMENTS) {
    const createdAt = "2026-02-16 10:00:00+00";
    const timelineJson = JSON.stringify(s.timeline).replace(/'/g, "''");
    const insertShipmentSql = `
      INSERT INTO shipments (
        id, waybill_no, container_no, carrier, vessel, pol, pod,
        commodity, hs_code, incoterm, status, temperature_celsius,
        free_time_days_left, demurrage_days_overdue, demurrage_daily_rate_usd,
        gross_mass_kg, seal_no, timeline, created_at
      ) VALUES (
        '${s.id}', '${s.waybillNo}', '${s.containerNo}', '${s.carrier.replace(/'/g, "''")}',
        '${s.vessel.replace(/'/g, "''")}', '${s.pol.replace(/'/g, "''")}', '${s.pod.replace(/'/g, "''")}',
        '${s.commodity.replace(/'/g, "''")}', '${s.hsCode}', '${s.incoterm}', '${s.status}',
        ${s.temperatureCelsius !== null ? s.temperatureCelsius : "NULL"},
        ${s.freeTimeDaysLeft}, ${s.demurrageDaysOverdue}, ${s.demurrageDailyRateUsd},
        ${s.grossMassKg}, '${s.sealNo}', '${timelineJson}'::jsonb, '${createdAt}'
      )
      ON CONFLICT (id, created_at) DO UPDATE SET
        status = EXCLUDED.status,
        demurrage_days_overdue = EXCLUDED.demurrage_days_overdue,
        free_time_days_left = EXCLUDED.free_time_days_left;
    `;
    await executeSql(insertShipmentSql);
  }
  console.log(`Successfully seeded ${SAMPLE_SHIPMENTS.length} shipments into shipments_2026_q1!`);

  // 5. Seed Knowledge Documents with Real Gemini Embeddings
  console.log("Generating Gemini Embeddings & Seeding Knowledge Documents...");
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

  for (const doc of KNOWLEDGE_DOCUMENTS) {
    const textToEmbed = `${doc.title} ${doc.category} ${doc.subCategory} ${doc.content}`;
    const embedRes = await embedModel.embedContent({
      content: { role: "user", parts: [{ text: textToEmbed }] },
      outputDimensionality: 1536,
    } as any);
    const vectorStr = `[${embedRes.embedding.values.join(",")}]`;

    const insertDocSql = `
      INSERT INTO knowledge_documents (title, category, sub_category, content, embedding)
      VALUES (
        '${doc.title.replace(/'/g, "''")}',
        '${doc.category}',
        '${doc.subCategory}',
        '${doc.content.replace(/'/g, "''")}',
        '${vectorStr}'
      );
    `;
    await executeSql(insertDocSql);
    console.log(`Embedded and inserted: "${doc.title.slice(0, 40)}..."`);
  }

  // 6. Verification
  console.log("Verifying Live Supabase Data...");
  const countShipments = await executeSql("SELECT COUNT(*) FROM shipments;");
  const countDocs = await executeSql("SELECT COUNT(*) FROM knowledge_documents;");
  console.log("Row counts in Supabase:");
  console.log("- shipments:", countShipments);
  console.log("- knowledge_documents:", countDocs);

  console.log("--- SEEDING COMPLETED SUCCESSFULLY ---");
}

main().catch((err) => {
  console.error("Fatal error during seeding:", err);
  process.exit(1);
});
