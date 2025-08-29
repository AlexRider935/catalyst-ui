import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const apiKey = request.headers.get('Authorization')?.split(' ')[1];
    if (!apiKey) {
        return NextResponse.json({ error: 'Authorization key is required.' }, { status: 401 });
    }

    const events = await request.json();
    if (!Array.isArray(events) || events.length === 0) {
        return NextResponse.json({ error: 'Payload must be a non-empty array of events.' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // --- 1. AUTHENTICATE & UPDATE STATUS (HEARTBEAT) ---
        const agentUpdateQuery = `
            UPDATE agents
            SET last_seen_at = NOW(), status = 'Online', updated_at = NOW()
            WHERE api_key = $1
            RETURNING id;
        `;
        const agentResult = await client.query(agentUpdateQuery, [apiKey]);

        if (agentResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json({ error: 'Invalid API Key.' }, { status: 403 });
        }
        const agentId = agentResult.rows[0].id;

        // --- 2. INGEST LOGS ---
        const ingestQuery = `
            INSERT INTO raw_events (received_at, hostname, data, agent_id) 
            SELECT 
                NOW(), 
                (e->>'hostname')::text, 
                (e->'data')::jsonb, 
                $1 
            FROM unnest($2::jsonb[]) AS e;
        `;

        // THE FIX IS HERE: We pass the 'events' array directly without JSON.stringify().
        // The database driver will handle the formatting correctly.
        await client.query(ingestQuery, [agentId, events]);

        await client.query('COMMIT');

        return NextResponse.json({ message: 'Logs accepted.' }, { status: 202 });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("[API] Log Ingestion Error:", error);
        return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
    } finally {
        client.release();
    }
}