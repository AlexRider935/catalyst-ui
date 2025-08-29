import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function POST(request) {
    const { registration_token, device_identifier } = await request.json();

    if (!registration_token || !device_identifier) {
        return NextResponse.json({ error: "Token and device identifier are required" }, { status: 400 });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Find the pre-registered agent by its token, ensuring it hasn't been used yet.
        const agentQuery = `
            SELECT id FROM agents 
            WHERE registration_token = $1 AND device_identifier IS NULL FOR UPDATE;
        `;
        const agentResult = await client.query(agentQuery, [registration_token]);

        if (agentResult.rows.length === 0) {
            await client.query('ROLLBACK');
            return NextResponse.json({ error: "Invalid or already used registration token." }, { status: 403 });
        }
        const agentId = agentResult.rows[0].id;

        // Check if another agent has already claimed this device identifier.
        const deviceCheck = await client.query('SELECT id FROM agents WHERE device_identifier = $1', [device_identifier]);
        if (deviceCheck.rows.length > 0) {
            await client.query('ROLLBACK');
            return NextResponse.json({ error: "This device has already been registered to another agent." }, { status: 409 });
        }

        // Generate the permanent API key and lock the record to the device.
        const permanentApiKey = `cat_perm_${randomBytes(32).toString('hex')}`;
        const updateQuery = `
            UPDATE agents
            SET api_key = $1, device_identifier = $2, status = 'Online', last_seen_at = NOW()
            WHERE id = $3;
        `;
        await client.query(updateQuery, [permanentApiKey, device_identifier, agentId]);

        await client.query('COMMIT');

        // --- UPDATED RESPONSE ---
        // We now return both the key and the agent's permanent ID to the agent.
        return NextResponse.json({ api_key: permanentApiKey, agent_id: agentId });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("[AGENT_REGISTER_API]", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}