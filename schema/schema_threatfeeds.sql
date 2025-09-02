-- Table to store the configuration for each threat intelligence feed
CREATE TABLE threat_feeds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50), -- e.g., 'OSINT', 'Commercial', 'Internal'
    source_url TEXT,
    status BOOLEAN NOT NULL DEFAULT false, -- Enabled/Disabled toggle
    health VARCHAR(50) NOT NULL DEFAULT 'Stale', -- e.g., 'Healthy', 'Stale', 'Error'
    confidence INT NOT NULL DEFAULT 75, -- 0-100
    update_interval_minutes INT DEFAULT 60,
    last_updated_at TIMESTAMPTZ,
    last_run_log JSONB, -- To store messages like "Updated successfully" or error details
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table to store the actual indicators from all feeds
CREATE TABLE threat_indicators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    -- When a feed is deleted, all its indicators are also deleted
    feed_id UUID NOT NULL REFERENCES threat_feeds(id) ON DELETE CASCADE,
    value TEXT NOT NULL,
    type VARCHAR(50), -- e.g., 'ip', 'domain', 'hash'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    -- Create an index for fast lookups on the indicator value
    UNIQUE(value, type)
);
CREATE INDEX idx_threat_indicators_value ON threat_indicators(value);