-- ============================================================================
-- CLEARANCEFLOW AI: PGVECTOR HYBRID SEARCH & STATUTORY COMPLIANCE
-- Migration: 20260218_02_pgvector_compliance_rag.sql
-- ============================================================================

-- 1. Aktifkan Ekstensi pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Buat Tabel Knowledge Documents
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(250) NOT NULL,
    category VARCHAR(60) NOT NULL,
    sub_category VARCHAR(60) NOT NULL,
    content TEXT NOT NULL,
    tsv TSVECTOR GENERATED ALWAYS AS (to_tsvector('english', title || ' ' || category || ' ' || sub_category || ' ' || content)) STORED,
    embedding VECTOR(1536) NOT NULL
);

-- 3. HNSW Dense Graph Vector Index (Cosine Distance <=>)
CREATE INDEX IF NOT EXISTS idx_docs_hnsw_cosine 
ON knowledge_documents 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);

-- 4. GIN Lexical Full-Text Index
CREATE INDEX IF NOT EXISTS idx_docs_tsv_gin 
ON knowledge_documents 
USING gin (tsv);

-- 5. Stored Function: Hybrid Search dengan Reciprocal Rank Fusion (RRF)
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
