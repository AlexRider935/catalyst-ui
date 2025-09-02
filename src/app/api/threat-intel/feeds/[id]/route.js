import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET(request, { params }) {
    const { id } = await params;
    try {
        const feedQuery = `SELECT * FROM threat_feeds WHERE id = $1`;
        const feedResult = await pool.query(feedQuery, [id]);

        if (feedResult.rowCount === 0) {
            return NextResponse.json({ error: 'Feed not found' }, { status: 404 });
        }

        const feed = feedResult.rows[0];

        // --- REAL DATA QUERY for Indicator Breakdown ---
        const indicatorsQuery = `
      SELECT type, COUNT(*) as count
      FROM threat_indicators
      WHERE feed_id = $1
      GROUP BY type;
    `;
        const indicatorsResult = await pool.query(indicatorsQuery, [id]);
        const totalIndicators = indicatorsResult.rows.reduce((sum, row) => sum + Number(row.count), 0);

        feed.indicator_types = indicatorsResult.rows.reduce((acc, row) => {
            acc[row.type] = totalIndicators > 0 ? (Number(row.count) / totalIndicators) : 0;
            return acc;
        }, {});


        // --- REAL DATA for Activity Log (from existing columns) ---
        feed.activity_log = [];
        if (feed.last_run_log) {
            // Assume last_run_log is an object like { status: 'Error', message: '...' }
            feed.activity_log.push({
                ...feed.last_run_log,
                time: new Date(feed.updated_at).toLocaleString()
            });
        }
        feed.activity_log.push({
            status: 'Info',
            message: 'Feed created.',
            time: new Date(feed.created_at).toLocaleString()
        });

        // --- NOTE on Recent Matches ---
        // This is a complex feature that requires correlating the 'threat_indicators' table
        // with your 'raw_events' table in real-time or via a background job.
        // For now, we return an empty array, which the UI will correctly handle.
        feed.recent_matches = [];

        return NextResponse.json(feed);
    } catch (error) {
        console.error(`API Error fetching feed ${id}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(request, { params }) {
    const { id } = params;
    try {
        const query = `DELETE FROM threat_feeds WHERE id = $1 RETURNING *;`;
        const result = await pool.query(query, [id]);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Feed not found' }, { status: 404 });
        }

        return NextResponse.json({ message: `Feed "${result.rows[0].name}" deleted successfully.` });
    } catch (error) {
        console.error(`API Error deleting feed ${id}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
// ... your existing PATCH function <follows></follows>