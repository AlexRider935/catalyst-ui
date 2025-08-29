import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    // --- THE FIX IS HERE ---
    // We now await the params object to resolve it.
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: "Agent ID is required." }, { status: 400 });
    }

    try {
        const query = `
            SELECT id, received_at, data 
            FROM raw_events 
            WHERE agent_id = $1 
            ORDER BY received_at DESC 
            LIMIT 20;
        `;
        const result = await pool.query(query, [id]);
        return NextResponse.json(result.rows);

    } catch (error) {
        console.error(`[GET_AGENT_EVENTS_API]`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}