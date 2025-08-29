import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const apiKey = request.headers.get('Authorization')?.split(' ')[1];
    if (!apiKey) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Read the vitals data from the agent's request body
    const vitals = await request.json();

    const client = await pool.connect();
    try {
        // This query now updates the status, last_seen, AND the new vitals columns
        const query = `
            UPDATE agents
            SET 
                last_seen_at = NOW(), 
                status = 'Online',
                ip_address = $2,
                os_name = $3,
                version = $4
            WHERE api_key = $1
            RETURNING id;
        `;

        const result = await client.query(query, [
            apiKey,
            vitals.ip_address,
            vitals.os_name,
            vitals.version
        ]);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Invalid API Key" }, { status: 403 });
        }

        return NextResponse.json({ status: 'ok' });

    } catch (error) {
        console.error("[HEARTBEAT_API_ERROR]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
        client.release();
    }
}