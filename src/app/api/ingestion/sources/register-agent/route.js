import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

/**
 * POST /api/ingestion/sources/register-agent
 * Creates a new source record for a Catalyst Universal Agent in the database
 * and returns its unique ingestion key.
 */
export async function POST(request) {
    try {
        // ✅ CORRECTED: Added 'await' to correctly parse the JSON body from the request.
        const { name, type } = await request.json();

        if (!name || !type) {
            return NextResponse.json({ error: 'Source name and type are required.' }, { status: 400 });
        }

        const ingestionKey = `cat_key_${randomBytes(24).toString('base64url')}`;
        const created_by = "silas.architect";

        const query = `
            INSERT INTO sources 
                (name, type, status, is_enabled, created_by, config)
            VALUES 
                ($1, $2, 'Offline', true, $3, $4)
            RETURNING id;
        `;

        const config = { ingestion_key_ref: ingestionKey.substring(0, 12) + '...' };
        const values = [name, type, created_by, config];

        await db.query(query, values);

        return NextResponse.json({
            ingestionKey: ingestionKey,
            ingestionEndpoint: "http://localhost:3000/api/ingestion/logs"
        });

    } catch (error) {
        console.error("[API] Error registering agent:", error);
        return NextResponse.json({ error: 'Failed to generate agent key.' }, { status: 500 });
    }
}
