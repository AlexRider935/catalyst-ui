-- ==========================
-- 1. SOURCES TABLE
-- ==========================
CREATE TABLE sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,              -- display name of source
    type VARCHAR(50) NOT NULL,               -- e.g. 'agent', 'aws', 'syslog'
    status VARCHAR(20) DEFAULT 'disconnected', -- 'connected' | 'disconnected' | 'error'
    last_seen TIMESTAMP,
    created_at TIMESTAMP DEFAULT now()
);

-- ==========================
-- 2. AGENTS TABLE
-- ==========================
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id VARCHAR(255) UNIQUE NOT NULL,   -- permanent agent identity
    hostname VARCHAR(255),
    registered_at TIMESTAMP DEFAULT now(),
    last_seen TIMESTAMP,
    status VARCHAR(20) DEFAULT 'disconnected',
    token_id UUID,
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE
);

-- ==========================
-- 3. ENROLLMENT TOKENS TABLE
-- ==========================
CREATE TABLE enrollment_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token VARCHAR(64) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT now(),
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT false,
    used_by_agent UUID REFERENCES agents(id) ON DELETE SET NULL
);

-- ==========================
-- 4. RELATIONSHIPS / INDEXES
-- ==========================
ALTER TABLE agents
    ADD CONSTRAINT fk_token FOREIGN KEY (token_id) REFERENCES enrollment_tokens(id) ON DELETE SET NULL;

CREATE INDEX idx_sources_type ON sources(type);
CREATE INDEX idx_sources_status ON sources(status);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_enrollment_tokens_used ON enrollment_tokens(used);