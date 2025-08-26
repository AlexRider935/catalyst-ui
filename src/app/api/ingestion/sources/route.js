import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * GET /api/ingestion/sources
 * Fetches a list of all configured data sources.
 */
export async function GET(request) {
    try {
        // This query selects all the necessary fields for the Ingestion Studio UI.
        const query = `
            SELECT 
                id, 
                name, 
                type, 
                status, 
                last_error, 
                last_seen_at, 
                events_per_second, 
                is_enabled, 
                created_by, 
                updated_at,
                config
            FROM 
                sources 
            ORDER BY 
                name ASC;
        `;
        const { rows } = await db.query(query);
        return NextResponse.json(rows);
    } catch (error) {
        console.error("[API] Error fetching ingestion sources:", error);
        return NextResponse.json({ error: 'Failed to fetch ingestion sources.' }, { status: 500 });
    }
}

/**
 * POST /api/ingestion/sources
 * Creates a new data source.
 */
export async function POST(request) {
    try {
        const { name, type, config } = await request.json();

        if (!name || !type) {
            return NextResponse.json({ error: 'Source name and type are required.' }, { status: 400 });
        }

        const created_by = "silas.architect"; // In a real app, get from session

        const query = `
            INSERT INTO sources (name, type, config, created_by, status, is_enabled)
            VALUES ($1, $2, $3, $4, 'Offline', true)
            RETURNING *;
        `;
        const values = [name, type, config || {}, created_by];

        const { rows } = await db.query(query, values);

        return NextResponse.json(rows[0], { status: 201 });

    } catch (error) {
        console.error("[API] Error creating source:", error);
        return NextResponse.json({ error: 'Failed to create source.' }, { status: 500 });
    }
}
