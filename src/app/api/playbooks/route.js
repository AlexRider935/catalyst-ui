import { db } from '@/lib/db'; // Assuming your db connection setup is in lib/db.js
import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const playbookData = await request.json();

        // --- Basic Validation ---
        if (!playbookData.name || !playbookData.trigger || !playbookData.actions) {
            return NextResponse.json(
                { error: 'Missing required fields: name, trigger, and actions are required.' },
                { status: 400 }
            );
        }

        // --- Data Transformation (camelCase to snake_case for DB) ---
        // The 'pg' library handles JSON stringification automatically for JSONB columns.
        const {
            name,
            description,
            owner,
            tags,
            trigger,
            actions,
            isEnabled,
            changeJustification, // Note: We don't store this in this version, but it's good practice to log it elsewhere.
        } = playbookData;

        const query = `
      INSERT INTO playbooks (name, description, owner, tags, trigger, actions, is_enabled)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;

        const values = [
            name,
            description || null,
            owner || null,
            tags || [],
            trigger,
            actions,
            isEnabled,
        ];

        const result = await db.query(query, values);
        const newPlaybook = result.rows[0];

        // --- Data Transformation (snake_case from DB to camelCase for client) ---
        const responsePayload = {
            id: newPlaybook.id,
            name: newPlaybook.name,
            description: newPlaybook.description,
            owner: newPlaybook.owner,
            tags: newPlaybook.tags,
            trigger: newPlaybook.trigger,
            actions: newPlaybook.actions,
            isEnabled: newPlaybook.is_enabled,
            version: newPlaybook.version,
            createdAt: newPlaybook.created_at,
            updatedAt: newPlaybook.updated_at
        };

        return NextResponse.json(responsePayload, { status: 201 });

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: 'Failed to create playbook.', details: error.message },
            { status: 500 }
        );
    }
}