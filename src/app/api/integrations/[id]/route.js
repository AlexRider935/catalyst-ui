// File: src/app/api/integrations/[id]/route.js

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// --- Database Connection Pool ---
const pool = new Pool({
    connectionString: process.env.POSTGRES_URL, // Example: postgres://user:pass@host:5432/dbname
});

/**
 * GET /api/integrations/[id]
 * Fetch a single integration by ID
 */
export async function GET(request, { params }) {
    const { id } = params;

    if (!id) {
        return NextResponse.json({ error: 'Integration ID is required.' }, { status: 400 });
    }

    const client = await pool.connect();

    try {
        const result = await client.query(
            'SELECT * FROM integrations WHERE id = $1',
            [id]
        );

        if (result.rows.length === 0) {
            return NextResponse.json({ error: 'Integration not found.' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0], { status: 200 });
    } catch (error) {
        console.error(`[API] Error fetching integration ${id}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}

/**
 * PUT /api/integrations/[id]
 * Update an existing integration
 */
export async function PUT(request, { params }) {
    const { id } = params;
    const body = await request.json();
    const { name, config, is_enabled } = body;

    if (!id) {
        return NextResponse.json({ error: 'Integration ID is required.' }, { status: 400 });
    }

    const client = await pool.connect();

    try {
        const result = await client.query(
            `UPDATE integrations
       SET name = $1, config = $2, is_enabled = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`,
            [name, config, is_enabled, id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Integration not found.' }, { status: 404 });
        }

        return NextResponse.json(result.rows[0], { status: 200 });
    } catch (error) {
        console.error(`[API] Error updating integration ${id}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}

/**
 * DELETE /api/integrations/[id]
 * Remove an integration from the database
 */
export async function DELETE(request, { params }) {
    const { id } = params;

    if (!id) {
        return NextResponse.json({ error: 'Integration ID is required.' }, { status: 400 });
    }

    const client = await pool.connect();

    try {
        const result = await client.query(
            'DELETE FROM integrations WHERE id = $1',
            [id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Integration not found.' }, { status: 404 });
        }

        console.log(`[DATABASE] Deleted integration ID: ${id}`);
        return NextResponse.json({ message: 'Integration disconnected successfully' }, { status: 200 });
    } catch (error) {
        console.error(`[API] Error deleting integration ${id}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}