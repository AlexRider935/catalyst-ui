-- schema/reset_and_setup_agents.sql
-- This script first RESETS any partial setup and then CREATES the schema correctly.

-- ====================================================================
-- Section 1: Cleanup
-- Drop everything in reverse order to avoid dependency errors.
-- The IF EXISTS clause prevents errors if the objects don't exist.
-- ====================================================================

-- Drop the foreign key constraint from raw_events if it exists
ALTER TABLE raw_events DROP CONSTRAINT IF EXISTS fk_agent;

-- Drop the column from raw_events if it exists
ALTER TABLE raw_events DROP COLUMN IF EXISTS agent_id;

-- Drop the main agents table if it exists
-- CASCADE will also drop any indexes or other objects that depend on it.
DROP TABLE IF EXISTS agents CASCADE;

-- Finally, drop the custom type so we can recreate it correctly.
DROP TYPE IF EXISTS agent_status;


-- ====================================================================
-- Section 2: Setup
-- Now we run the original setup commands on a clean slate.
-- ====================================================================

-- Create the custom type with all required values.
CREATE TYPE agent_status AS ENUM ('Never Connected', 'Online', 'Offline');

-- Create the main agents table.
CREATE TABLE agents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255),
    registration_token TEXT UNIQUE,
    api_key TEXT UNIQUE,
    device_identifier TEXT UNIQUE,
    status agent_status NOT NULL DEFAULT 'Never Connected',
    last_seen_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add the agent_id column back to your raw_events table.
ALTER TABLE raw_events ADD COLUMN agent_id UUID;

-- Re-create the foreign key relationship.
ALTER TABLE raw_events
ADD CONSTRAINT fk_agent
FOREIGN KEY (agent_id)
REFERENCES agents(id)
ON DELETE SET NULL;

-- Create indexes for performance.
CREATE INDEX idx_agents_api_key ON agents(api_key);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_raw_events_agent_id ON raw_events(agent_id);

-- --- Script Complete ---