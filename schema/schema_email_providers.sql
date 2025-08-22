CREATE TABLE email_provider_presets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL UNIQUE,
    smtp_server VARCHAR(255) NOT NULL,
    smtp_port INT NOT NULL,
    smtp_encryption VARCHAR(10) NOT NULL, -- 'tls' or 'ssl'
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Example data to populate the table:
INSERT INTO email_provider_presets (name, smtp_server, smtp_port, smtp_encryption) VALUES
('Google Workspace / Gmail', 'smtp.gmail.com', 587, 'tls'),
('Microsoft 365 / Outlook', 'smtp.office365.com', 587, 'tls'),
('Zoho Mail', 'smtp.zoho.com', 587, 'tls');