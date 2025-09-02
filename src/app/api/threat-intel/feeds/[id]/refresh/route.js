import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request, { params }) {
    const { id } = params;
    try {
        // First, get the feed's details, especially the source_url
        const { rows: feeds } = await pool.query(`SELECT * FROM threat_feeds WHERE id = $1`, [id]);
        if (feeds.length === 0) {
            return NextResponse.json({ error: 'Feed not found' }, { status: 404 });
        }
        const feed = feeds[0];

        // Immediately set status to 'Updating' to provide UI feedback
        await pool.query(`UPDATE threat_feeds SET health = 'Updating' WHERE id = $1`, [id]);

        // --- REAL DATA FETCHING LOGIC STARTS HERE ---

        // 1. Fetch indicators from the source URL
        const response = await fetch(feed.source_url);
        if (!response.ok) {
            throw new Error(`Failed to fetch from source: Server responded with status ${response.status}`);
        }

        const textData = await response.text();
        // 2. Parse the data: split by newline, trim whitespace, and filter out comments/empty lines
        const indicators = textData.split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('#'));

        if (indicators.length === 0) {
            throw new Error('Source returned no valid indicators.');
        }

        // 3. Insert new indicators into the database
        // ON CONFLICT DO NOTHING handles duplicates gracefully so we don't get errors
        let insertedCount = 0;
        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            for (const indicator of indicators) {
                // A more advanced version could try to detect 'ip', 'domain', 'hash'
                const indicatorType = 'ip'; // Assuming IP blocklist for now
                const result = await client.query(
                    `INSERT INTO threat_indicators (feed_id, value, type)
           VALUES ($1, $2, $3) ON CONFLICT (value, type) DO NOTHING`,
                    [feed.id, indicator, indicatorType]
                );
                insertedCount += result.rowCount;
            }
            await client.query('COMMIT');
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

        // 4. Update the feed's status to Healthy
        const logMessage = { status: "Success", message: `Manual refresh complete. Added ${insertedCount} new indicators.` };
        const finalResult = await pool.query(
            `UPDATE threat_feeds SET health = 'Healthy', last_updated_at = NOW(), last_run_log = $1 WHERE id = $2 RETURNING *;`,
            [JSON.stringify(logMessage), id]
        );

        return NextResponse.json(finalResult.rows[0]);

    } catch (error) {
        console.error(`API Error refreshing feed ${id}:`, error);
        // If anything fails, mark the feed as an error
        const errorLog = { status: "Error", message: error.message };
        await pool.query(`UPDATE threat_feeds SET health = 'Error', last_run_log = $1 WHERE id = $2`, [JSON.stringify(errorLog), id]);

        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}