import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * GET /api/dashboards
 * Fetches a list of all dashboards.
 */
export async function GET(request) {
    try {
        const query = `
            SELECT id, name, description, created_at, updated_at 
            FROM dashboards 
            ORDER BY name ASC;
        `;
        const { rows } = await db.query(query);
        return NextResponse.json(rows);
    } catch (error) {
        console.error("[API] Error fetching dashboards:", error);
        return NextResponse.json({ error: 'Failed to fetch dashboards.' }, { status: 500 });
    }
}

/**
 * POST /api/dashboards
 * Creates a new, empty dashboard.
 */
export async function POST(request) {
    try {
        const { name, description } = await request.json();

        if (!name) {
            return NextResponse.json({ error: 'Dashboard name is required.' }, { status: 400 });
        }

        const created_by = "silas.architect"; // In a real app, get from session

        const query = `
            INSERT INTO dashboards (name, description, created_by)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;
        const values = [name, description, created_by];

        const { rows } = await db.query(query, values);

        return NextResponse.json(rows[0], { status: 201 });

    } catch (error) {
        console.error("[API] Error creating dashboard:", error);
        if (error.code === '23505') { // Unique constraint violation
            return NextResponse.json({ error: 'A dashboard with this name already exists.' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to create dashboard.' }, { status: 500 });
    }
}
