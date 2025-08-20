CREATE TABLE playbooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    owner VARCHAR(255),
    tags TEXT[],
    trigger JSONB NOT NULL,
    actions JSONB NOT NULL,
    is_enabled BOOLEAN NOT NULL DEFAULT true,
    version INT NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Optional: Create a GIN index for faster searches within the trigger/actions JSON
CREATE INDEX idx_playbooks_trigger ON playbooks USING GIN(trigger);
CREATE INDEX idx_playbooks_actions ON playbooks USING GIN(actions);