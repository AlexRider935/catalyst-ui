import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * GET /api/datalake/saved-queries
 * Fetches all saved queries from the database.
 */
export async function GET(request) {
    try {
        const query = `
            SELECT id, name, description, query_string, created_at 
            FROM saved_queries 
            ORDER BY name ASC;
        `;
        const { rows } = await db.query(query);
        return NextResponse.json(rows);
    } catch (error) {
        console.error("[API] Error fetching saved queries:", error);
        return NextResponse.json({ error: 'Failed to fetch saved queries.' }, { status: 500 });
    }
}

/**
 * POST /api/datalake/saved-queries
 * Creates a new saved query.
 */
export async function POST(request) {
    try {
        const { name, description, query_string } = await request.json();

        // Basic validation
        if (!name || !query_string) {
            return NextResponse.json({ error: 'Query name and string are required.' }, { status: 400 });
        }

        // In a real app, you would get the user from the session
        const created_by = "silas.architect";

        const query = `
            INSERT INTO saved_queries (name, description, query_string, created_by)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, description, query_string, created_at;
        `;
        const values = [name, description, query_string, created_by];

        const { rows } = await db.query(query, values);

        return NextResponse.json(rows[0], { status: 201 });

    } catch (error) {
        console.error("[API] Error saving query:", error);
        // Handle potential unique constraint violation for query names
        if (error.code === '23505') {
            return NextResponse.json({ error: 'A query with this name already exists.' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to save query.' }, { status: 500 });
    }
}
