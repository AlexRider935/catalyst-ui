CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- 'email', 'slack', 'webhook', etc.
    config JSONB NOT NULL, -- Sensitive fields within this JSON MUST be encrypted
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    status VARCHAR(50) NOT NULL DEFAULT 'Healthy', -- 'Healthy', 'Degraded', 'Error'
    configured_by VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_integrations_type ON integrations(type);
ALTER TABLE integrations ADD COLUMN last_healthy_at TIMESTAMPTZ;