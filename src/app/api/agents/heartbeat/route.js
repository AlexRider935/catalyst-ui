// src/app/api/agents/heartbeat/route.js

import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request) {
    const token = request.headers.get('Authorization')?.split(' ')[1];
    if (!token) {
        return NextResponse.json({ error: "Unauthorized: Missing token" }, { status: 401 });
    }

    let vitals;
    try {
        // --- ROBUSTNESS IMPROVEMENT ---
        // We wrap request.json() in a try-catch block.
        // If the agent sends an empty body, this will fail, and we can
        // catch the error and return a helpful 400 Bad Request response
        // instead of crashing with a 500 Internal Server Error.
        vitals = await request.json();
    } catch (error) {
        // This catch block specifically handles JSON parsing errors
        if (error instanceof SyntaxError) {
            return NextResponse.json({ error: "Bad Request: Malformed or empty JSON body" }, { status: 400 });
        }
        // For any other unexpected errors during body parsing
        console.error("[HEARTBEAT_BODY_PARSE_ERROR]", error);
        return NextResponse.json({ error: "Internal Server Error while parsing request" }, { status: 500 });
    }

    // This check is good practice in case the body is valid JSON but empty (e.g., "{}")
    if (!vitals || Object.keys(vitals).length === 0) {
        return NextResponse.json({ error: "Bad Request: Missing vitals data in body" }, { status: 400 });
    }

    const client = await pool.connect();
    try {
        // Hash the incoming token to securely match it against the stored `token_hash`.
        const tokenHash = crypto.createHash('sha266').update(token).digest('hex');

        // This query updates status, last_seen, and merges the new vitals 
        // into the 'config' JSONB column for flexibility.
        const query = `
            UPDATE agents
            SET 
                last_seen_at = NOW(), 
                status = 'Online',
                config = config || $2::jsonb
            WHERE token_hash = $1
            RETURNING id; 
        `;

        const result = await client.query(query, [
            tokenHash,
            JSON.stringify(vitals)
        ]);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Forbidden: Invalid or unrecognized agent token" }, { status: 403 });
        }

        return NextResponse.json({ status: 'ok' });

    } catch (error) {
        console.error("[HEARTBEAT_API_ERROR]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    } finally {
        client.release();
    }
}