import { db } from '@/lib/db'; // ✅ Correctly imports the 'db' object
import { NextResponse } from 'next/server';

const encryptSecret = (secret) => Buffer.from(secret).toString('base64');

/**
 * GET handler to fetch a list of configured integrations.
 * ARCHITECT'S NOTE: Updated to include the 'is_enabled' field for the new UI toggle functionality.
 */
export async function GET(request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    try {
        // ✅ MODIFIED: Added 'is_enabled' to the SELECT statement.
        let query = 'SELECT id, name, type, status, is_enabled, configured_by, updated_at, last_healthy_at FROM integrations';
        const values = [];

        if (type) {
            query += ' WHERE type = $1';
            values.push(type);
        }
        query += ' ORDER BY created_at DESC';

        const result = await db.query(query, values);

        const integrations = result.rows.map(row => ({
            id: row.id,
            name: row.name,
            type: row.type,
            status: row.status,
            isEnabled: row.is_enabled, // ✅ MODIFIED: Added isEnabled to the response object.
            configuredBy: row.configured_by,
            updatedAt: row.updated_at,
            lastHealthyAt: row.last_healthy_at
        }));

        return NextResponse.json(integrations);

    } catch (error) {
        console.error('API Error fetching integrations:', error);
        return NextResponse.json({ error: 'Failed to fetch integrations.' }, { status: 500 });
    }
}

/**
 * POST handler to create a new integration.
 */
export async function POST(request) {
    try {
        const payload = await request.json();

        const { name, type, config } = payload;

        if (!name || !type || !config) {
            return NextResponse.json({ error: "Integration name, type, and config are required." }, { status: 400 });
        }

        if (type === "email") {
            if (config.apiKey) config.apiKey = encryptSecret(config.apiKey);
            if (config.smtpPass) config.smtpPass = encryptSecret(config.smtpPass);
        } else if (type === "webhook") {
            if (config.secret) config.secret = encryptSecret(config.secret);
        }

        const configured_by = "silas.architect";

        const query = `
          INSERT INTO integrations (name, type, config, is_enabled, configured_by)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id, name, type, is_enabled, status, configured_by, created_at;
        `;

        const values = [name, type, config, true, configured_by];

        const result = await db.query(query, values);

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        console.error("API Error creating integration:", error);
        return NextResponse.json({ error: "Failed to create integration." }, { status: 500 });
    }
}
