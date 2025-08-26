-- This SQL sets up the partitioned table for storing raw log events.

-- Create the partitioned "parent" table.
CREATE TABLE raw_events (
    id UUID DEFAULT uuid_generate_v4(),
    received_at TIMESTAMPTZ NOT NULL,
    hostname TEXT,
    data JSONB,
    -- ✅ CORRECTED: The PRIMARY KEY now includes the partition key 'received_at'.
    PRIMARY KEY (id, received_at)
) PARTITION BY RANGE (received_at);

-- Create an index on the partition key. This is CRUCIAL for performance.
CREATE INDEX idx_raw_events_received_at ON raw_events (received_at);

-- Manually create the first partition for today's data to get started.
-- The script in Step 3 will automate this going forward.
-- NOTE: You must update the date to the current date when you run this.
-- For today, Monday, August 25, 2025:
CREATE TABLE events_2025_08_25 PARTITION OF raw_events
FOR VALUES FROM ('2025-08-25 00:00:00Z') TO ('2025-08-26 00:00:00Z');

-- Grant usage to your application's database user if necessary
-- GRANT ALL ON TABLE raw_events TO your_app_user;
-- GRANT ALL ON TABLE events_2025_08_25 TO your_app_user;