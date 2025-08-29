import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Simple query to get all agents from the database
        const result = await pool.query('SELECT * FROM agents ORDER BY created_at DESC');

        // The frontend expects a 'type' for categorization, so we'll add it here.
        const agentsWithType = result.rows.map(agent => ({
            ...agent,
            type: 'Catalyst Agent', // Assign a consistent type for grouping
            is_enabled: true, // Agents are always considered enabled in our new model
            events_per_second: 0 // Placeholder value
        }));

        return NextResponse.json(agentsWithType);
    } catch (error) {
        console.error("[GET_AGENTS_API]", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}