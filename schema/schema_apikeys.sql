CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) NOT NULL UNIQUE, -- Stores a SHA-256 or bcrypt hash of the key
    key_prefix VARCHAR(10) NOT NULL, -- e.g., 'cat_sk_'
    scopes TEXT[] NOT NULL,
    user_id UUID NOT NULL, -- Foreign key to your users table
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    last_used_at TIMESTAMPTZ,
    last_used_from_ip INET -- Stores the last IP that used the key
);

CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);