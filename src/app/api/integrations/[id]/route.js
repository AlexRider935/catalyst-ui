import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// NOTE: Add your decryption function here if needed
// const decryptSecret = (secret) => Buffer.from(secret, 'base64').toString('ascii');

/**
 * GET handler for a single integration by ID.
 */
export async function GET(request, { params }) {
    const { id } = params;
    try {
        const { rows } = await db.query('SELECT * FROM integrations WHERE id = $1', [id]);
        if (rows.length === 0) {
            return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
        }
        // SECURITY: Be cautious about returning the full config with secrets.
        // This example omits it for security, but you could return non-sensitive parts.
        const { config, ...integrationData } = rows[0];
        return NextResponse.json(integrationData);
    } catch (error) {
        console.error(`API Error fetching integration ${id}:`, error);
        return NextResponse.json({ error: 'Failed to fetch integration.' }, { status: 500 });
    }
}


/**
 * PUT handler to update an integration.
 * ARCHITECT'S NOTE: This handler is now dynamic. It only updates the fields
 * that are explicitly provided in the request body, resolving the
 * 'violates not-null constraint' error.
 */
export async function PUT(request, { params }) {
    const { id } = await params;
    const body = await request.json();

    const { name, config, is_enabled } = body;

    try {
        // First, fetch the current record to safely merge the config JSONB object
        const existingResult = await db.query('SELECT config FROM integrations WHERE id = $1', [id]);
        if (existingResult.rows.length === 0) {
            return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
        }

        const existingConfig = existingResult.rows[0].config || {};

        const updateFields = [];
        const values = [];
        let queryIndex = 1;

        // Conditionally add fields to the update query
        if (name !== undefined) {
            updateFields.push(`name = $${queryIndex++}`);
            values.push(name);
        }

        if (config !== undefined && Object.keys(config).length > 0) {
            // Merge new config values into the existing ones
            const newConfig = { ...existingConfig, ...config };
            updateFields.push(`config = $${queryIndex++}`);
            values.push(newConfig);
        }

        if (is_enabled !== undefined) {
            updateFields.push(`is_enabled = $${queryIndex++}`);
            values.push(is_enabled);
        }

        // If no fields were provided to update, return early.
        if (updateFields.length === 0) {
            return NextResponse.json({ message: "No fields to update." }, { status: 400 });
        }

        // Always update the 'updated_at' timestamp on any change
        updateFields.push('updated_at = NOW()');

        const updateQuery = `
            UPDATE integrations
            SET ${updateFields.join(', ')}
            WHERE id = $${queryIndex}
            RETURNING *;
        `;

        values.push(id);

        const { rows } = await db.query(updateQuery, values);

        return NextResponse.json(rows[0]);

    } catch (error) {
        console.error(`[API] Error updating integration ${id}:`, error);
        return NextResponse.json({ error: 'Failed to update integration.' }, { status: 500 });
    }
}


/**
 * DELETE handler to remove an integration.
 */
export async function DELETE(request, { params }) {
    const { id } = params;
    try {
        const result = await db.query('DELETE FROM integrations WHERE id = $1 RETURNING name', [id]);
        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Integration not found' }, { status: 404 });
        }
        return NextResponse.json({ message: `Integration "${result.rows[0].name}" disconnected successfully.` });
    } catch (error) {
        console.error(`API Error deleting integration ${id}:`, error);
        return NextResponse.json({ error: 'Failed to delete integration.' }, { status: 500 });
    }
}
