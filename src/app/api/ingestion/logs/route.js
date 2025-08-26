import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * POST /api/ingestion/logs
 * Receives a batch of log events from a Catalyst Universal Agent
 * and inserts them into the raw_events table.
 */
export async function POST(request) {
    try {
        // SECURITY: In a real application, you would validate the bearer token here
        // to authenticate the agent before processing any data.
        // const authorization = request.headers.get('authorization');
        // const token = authorization?.split(' ')[1];
        // if (!isValidToken(token)) {
        //     return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        // }

        const logBatch = await request.json();

        if (!Array.isArray(logBatch) || logBatch.length === 0) {
            return NextResponse.json({ error: 'Invalid log batch format.' }, { status: 400 });
        }

        // ✅ CORRECTED: Instead of managing a client and transaction manually,
        // we will loop and insert each event. This pattern works correctly with your db setup.
        for (const event of logBatch) {
            const query = `
                INSERT INTO raw_events (received_at, hostname, data)
                VALUES (to_timestamp($1), $2, $3);
            `;
            // The 'data' column will store the original log message and any other metadata.
            const eventData = { message: event.message };
            await db.query(query, [event.timestamp, event.hostname, eventData]);
        }

        return NextResponse.json({ status: 'ok', ingested: logBatch.length });

    } catch (error) {
        console.error("[API] Ingestion Error:", error);
        return NextResponse.json({ error: 'Failed to ingest logs.' }, { status: 500 });
    }
}
