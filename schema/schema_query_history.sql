
CREATE TABLE query_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    query_string TEXT NOT NULL,
    executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    executed_by VARCHAR(255),
    status VARCHAR(50) NOT NULL, -- 'Success', 'Failed'
    execution_time_ms INT
);

-- Index for quickly finding a user's query history
CREATE INDEX idx_query_history_executed_by ON query_history(executed_by);