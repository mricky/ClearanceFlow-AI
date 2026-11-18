-- ============================================================================
-- CLEARANCEFLOW AI: PRODUCTION SCHEMA PARTITIONING
-- Migration: 20260218_01_partitioned_shipments.sql
-- ============================================================================

-- 1. Tabel Utama Terpartisi Berdasarkan Rentang Tanggal (Quarterly Range)
CREATE TABLE IF NOT EXISTS shipments (
    id VARCHAR(50) NOT NULL,
    waybill_no VARCHAR(50) NOT NULL,
    container_no VARCHAR(20) NOT NULL,
    carrier VARCHAR(100) NOT NULL,
    vessel VARCHAR(100) NOT NULL,
    pol VARCHAR(50) NOT NULL,
    pod VARCHAR(50) NOT NULL,
    commodity VARCHAR(150) NOT NULL,
    hs_code VARCHAR(30) NOT NULL,
    incoterm VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL,
    temperature_celsius NUMERIC(5,2),
    free_time_days_left INT DEFAULT 5,
    demurrage_days_overdue INT DEFAULT 0,
    demurrage_daily_rate_usd NUMERIC(10,2) DEFAULT 150.00,
    gross_mass_kg INT NOT NULL,
    seal_no VARCHAR(50) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL,
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- 2. Partisi Kuartal 2026
CREATE TABLE IF NOT EXISTS shipments_2026_q1 PARTITION OF shipments
    FOR VALUES FROM ('2026-01-01 00:00:00+00') TO ('2026-04-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS shipments_2026_q2 PARTITION OF shipments
    FOR VALUES FROM ('2026-04-01 00:00:00+00') TO ('2026-07-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS shipments_2026_q3 PARTITION OF shipments
    FOR VALUES FROM ('2026-07-01 00:00:00+00') TO ('2026-10-01 00:00:00+00');

CREATE TABLE IF NOT EXISTS shipments_2026_q4 PARTITION OF shipments
    FOR VALUES FROM ('2026-10-01 00:00:00+00') TO ('2027-01-01 00:00:00+00');

-- 3. Catchment Default Partition (Safety Net)
CREATE TABLE IF NOT EXISTS shipments_default PARTITION OF shipments DEFAULT;

-- 4. Indeks Lokal Per Partisi (Zero-Locking)
CREATE INDEX IF NOT EXISTS idx_shipments_container ON shipments (container_no);
CREATE INDEX IF NOT EXISTS idx_shipments_status ON shipments (status);
CREATE INDEX IF NOT EXISTS idx_shipments_waybill ON shipments (waybill_no);
