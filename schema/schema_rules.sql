-- =================================================================
--  Table: rule_groups
--  Organizes rules into logical categories (e.g., "Compliance", "Threat Hunting").
-- =================================================================
CREATE TABLE rule_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =================================================================
--  Table: rules
--  Stores the core detection logic.
-- =================================================================
CREATE TABLE rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES rule_groups(id) ON DELETE CASCADE,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- The core detection logic, written in your query language (e.g., CQL).
    detection_logic TEXT NOT NULL,
    
    -- Severity level: Low, Medium, High, Critical.
    severity VARCHAR(50) NOT NULL,
    
    -- Controls if the rule is active in the engine.
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    version INT NOT NULL DEFAULT 1,
    last_modified_by VARCHAR(255),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for performance when fetching all rules for a group.
CREATE INDEX idx_rules_group_id ON rules(group_id);