import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
    try {
        const statsQuery = `
      SELECT
        (SELECT COUNT(*) FROM threat_feeds) AS "totalFeeds",
        (SELECT COUNT(*) FROM threat_feeds WHERE status = true) AS "enabledFeeds",
        (SELECT COUNT(*) FROM threat_feeds WHERE health = 'Error') AS "errorFeeds",
        (SELECT COUNT(*) FROM threat_indicators) AS "totalIndicators"
    `;

        const result = await pool.query(statsQuery);
        const stats = result.rows[0];

        // Convert BigInt to Number for JSON serialization
        for (const key in stats) {
            stats[key] = Number(stats[key]);
        }

        return NextResponse.json(stats);
    } catch (error) {
        console.error('API Error fetching threat intel stats:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}