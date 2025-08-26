import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * GET /api/datalake/query-history
 * Fetches the most recent queries from the history table.
 */
export async function GET(request) {
    try {
        // In a real multi-user app, you would add a WHERE clause:
        // WHERE executed_by = 'current_user'
        const query = `
            SELECT 
                id, 
                query_string, 
                executed_at,
                status
            FROM 
                query_history 
            ORDER BY 
                executed_at DESC 
            LIMIT 50;
        `;

        const { rows } = await db.query(query);

        return NextResponse.json(rows);

    } catch (error) {
        console.error("[API] Error fetching query history:", error);
        return NextResponse.json({ error: 'Failed to fetch query history.' }, { status: 500 });
    }
}
