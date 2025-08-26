-- This SQL defines the 'sources' table with all required columns.
-- If you already have a 'sources' table, you may need to drop it first
-- or use ALTER TABLE to add the missing 'config' column.

-- DROP TABLE IF EXISTS sources; -- Optional: Use with caution

CREATE TYPE source_status AS ENUM ('Healthy', 'Degraded', 'Offline');

CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL,
    status source_status NOT NULL DEFAULT 'Offline',
    last_error TEXT,
    last_seen_at TIMESTAMPTZ,
    events_per_second INT DEFAULT 0,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    created_by VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- ✅ This is the column that was missing
    config JSONB
);

-- Index for efficient querying by status and type
CREATE INDEX idx_sources_status ON sources(status);
CREATE INDEX idx_sources_type ON sources(type);
