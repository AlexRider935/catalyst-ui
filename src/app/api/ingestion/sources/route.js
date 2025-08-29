import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

// This single POST function handles creating ANY type of source.
export async function POST(request) {
    const { type, name, config } = await request.json();

    if (!type || !name) {
        return NextResponse.json({ error: "Source type and name are required." }, { status: 400 });
    }

    const client = await pool.connect();
    try {
        // --- Logic for Catalyst Agent ---
        if (type === 'catalyst-agent') {
            const token = config.registrationToken;
            if (!token) {
                return NextResponse.json({ error: "Registration token is missing for agent source." }, { status: 400 });
            }

            // Insert into the 'agents' table (our new model)
            const query = `
                INSERT INTO agents (name, registration_token, status)
                VALUES ($1, $2, 'Never Connected')
                RETURNING id, name;
            `;
            const result = await client.query(query, [name, token]);
            return NextResponse.json(result.rows[0]);
        }

        // --- Logic for Other Source Types (Example) ---
        // For other types, you might save to a different table or use the 'config' object.
        // This is a placeholder for your future source types.
        else {
            // Example: Saving to a generic 'sources' table
            // const query = `
            //     INSERT INTO sources (name, type, config)
            //     VALUES ($1, $2, $3)
            //     RETURNING id, name;
            // `;
            // const result = await client.query(query, [name, type, config]);
            // return NextResponse.json(result.rows[0]);

            // For now, return a success message for non-agent types
            return NextResponse.json({
                id: `mock-${randomBytes(8).toString('hex')}`,
                name: name,
                message: "Placeholder for non-agent source creation."
            });
        }

    } catch (error) {
        console.error("[CREATE_SOURCE_API]", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    } finally {
        client.release();
    }
}