-- It's best practice to enable the uuid-ossp extension to generate UUIDs.
-- Run this command once per database if you haven't already.
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =================================================================
--  Table: services
--  Stores the parent decoders, identified by a prefilter keyword.
-- =================================================================
CREATE TABLE services (
    -- The primary key, automatically generated as a version 4 UUID.
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- The human-readable name of the service (e.g., "Apache"). Must be unique.
    name VARCHAR(255) NOT NULL UNIQUE,
    
    -- The keyword used by the engine for the initial fast check (e.g., "HTTP").
    prefilter_keyword VARCHAR(255) NOT NULL,
    
    -- Controls whether this service and its children are processed by the engine.
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Audit timestamp using TIMESTAMPTZ for time zone safety.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =================================================================
--  Table: decoders
--  Stores the child decoders with specific regex patterns.
-- =================================================================
CREATE TABLE decoders (
    -- The primary key, automatically generated.
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- The foreign key linking this decoder to its parent service.
    -- ON DELETE CASCADE ensures that if a service is deleted, all its decoders are also deleted.
    service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    
    -- The human-readable name for the specific decoder (e.g., "apache_access_log").
    name VARCHAR(255) NOT NULL,
    
    -- A sample log that this decoder is designed to parse.
    log_example TEXT,
    
    -- The full regular expression used for parsing.
    regex_pattern TEXT NOT NULL,
    
    -- Controls whether this specific decoder is active.
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Audit timestamp.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =================================================================
--  Table: decoder_test_cases
--  Stores test cases for validating individual decoders.
-- =================================================================
CREATE TABLE decoder_test_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    decoder_id UUID NOT NULL REFERENCES decoders(id) ON DELETE CASCADE,
    
    -- The sample log line to test against.
    log_sample TEXT NOT NULL,
    
    -- If 'true', the test passes if the regex matches. If 'false', it passes if it does NOT match.
    should_match BOOLEAN NOT NULL DEFAULT true,
    
    -- For 'should_match: true' cases, this stores the exact JSON output we expect.
    -- Using JSONB is efficient for querying and validation.
    expected_output JSONB, 
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =================================================================
--  Indexing for Performance
-- =================================================================
CREATE INDEX idx_decoders_service_id ON decoders(service_id);
CREATE INDEX idx_test_cases_decoder_id ON decoder_test_cases(decoder_id);


-- =================================================================
--  Comments for Clarity
-- =================================================================
COMMENT ON TABLE services IS 'Stores parent decoders (services) for the log processing engine.';
COMMENT ON TABLE decoders IS 'Stores child decoders with specific regex, linked to a parent service.';
COMMENT ON TABLE decoder_test_cases IS 'Stores test cases for validating individual decoders.';
