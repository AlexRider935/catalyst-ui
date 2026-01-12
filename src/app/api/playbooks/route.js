// src/app/api/playbooks/route.js

import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';
import { z } from 'zod';

// --- 1. Define the Schema with Zod ---
// This schema defines the expected shape and types of the incoming request body.
const playbookSchema = z.object({
    name: z.string({ required_error: "Playbook name is required." }).min(1, "Playbook name cannot be empty."),
    description: z.string().nullable().default(null),
    owner: z.string().nullable().default(null),
    tags: z.array(z.string()).default([]),
    // We use z.any() for trigger and actions as their structure can be complex.
    // For even more safety, you could define their specific object shapes here too.
    trigger: z.object({}).passthrough({ message: "Trigger must be a valid object." }),
    actions: z.array(z.object({}).passthrough({ message: "Actions must be an array of objects." })).min(1, "At least one action is required."),
    isEnabled: z.boolean().default(true),
});


export async function POST(request) {
    try {
        const body = await request.json();

        // --- 2. Validate the request body against the schema ---
        const validationResult = playbookSchema.safeParse(body);

        if (!validationResult.success) {
            return NextResponse.json(
                {
                    error: 'Invalid input.',
                    // Format Zod's errors for a clear client response
                    details: validationResult.error.flatten().fieldErrors
                },
                { status: 400 }
            );
        }

        // Use the validated (and possibly defaulted) data from Zod
        const { name, description, owner, tags, trigger, actions, isEnabled } = validationResult.data;

        // --- 3. Execute the Database Query ---
        const query = `
            INSERT INTO playbooks (name, description, owner, tags, trigger, actions, is_enabled)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *;
        `;

        const values = [
            name,
            description,
            owner,
            tags,
            trigger,
            actions,
            isEnabled,
        ];

        // Using 'pool' for consistency with our project's db setup
        const result = await pool.query(query, values);
        const newPlaybook = result.rows[0];

        // --- 4. Transform DB response to camelCase for the client ---
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

        // Handle potential database errors (like unique constraint violation)
        if (error.code === '23505') { // PostgreSQL unique violation error code
            return NextResponse.json(
                { error: 'A playbook with this name already exists.' },
                { status: 409 } // 409 Conflict
            );
        }

        return NextResponse.json(
            { error: 'Failed to create playbook.', details: error.message },
            { status: 500 }
        );
    }
}