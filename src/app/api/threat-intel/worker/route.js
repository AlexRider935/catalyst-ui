import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function POST(request) {
    // 1. Secure the endpoint
    const authToken = (request.headers.get('authorization') || '').split('Bearer ')[1];
    if (authToken !== process.env.CRON_SECRET) {
        return new Response('Unauthorized', { status: 401 });
    }

    console.log('Threat Intel Worker: Starting job...');
    try {
        // 2. Find feeds that are enabled and due for an update
        const { rows: feedsToUpdate } = await pool.query(`
      SELECT * FROM threat_feeds
      WHERE status = true AND (
        last_updated_at IS NULL OR 
        last_updated_at < NOW() - (update_interval_minutes * INTERVAL '1 minute')
      )
    `);

        if (feedsToUpdate.length === 0) {
            console.log('Threat Intel Worker: No feeds due for an update.');
            return NextResponse.json({ message: 'No feeds to update.' });
        }

        // 3. Loop through each feed and process it
        for (const feed of feedsToUpdate) {
            console.log(`Processing feed: ${feed.name}`);
            try {
                await pool.query(`UPDATE threat_feeds SET health = 'Updating' WHERE id = $1`, [feed.id]);

                // 4. Fetch indicators from the source URL
                const response = await fetch(feed.source_url);
                if (!response.ok) throw new Error(`Failed to fetch from source: ${response.statusText}`);

                const textData = await response.text();
                const indicators = textData.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('#'));

                // 5. Insert indicators into the database
                // ON CONFLICT DO NOTHING handles duplicates gracefully
                let insertedCount = 0;
                for (const indicator of indicators) {
                    const result = await pool.query(
                        `INSERT INTO threat_indicators (feed_id, value, type)
             VALUES ($1, $2, $3) ON CONFLICT (value, type) DO NOTHING`,
                        [feed.id, indicator, 'ip'] // Note: Type detection would need to be smarter
                    );
                    insertedCount += result.rowCount;
                }

                // 6. Update the feed's status to Healthy
                const logMessage = { status: "Success", message: `Successfully fetched and inserted ${insertedCount} new indicators.` };
                await pool.query(
                    `UPDATE threat_feeds SET health = 'Healthy', last_updated_at = NOW(), last_run_log = $1 WHERE id = $2`,
                    [JSON.stringify(logMessage), feed.id]
                );
                console.log(`Successfully processed feed: ${feed.name}`);

            } catch (feedError) {
                console.error(`Failed to process feed ${feed.name}:`, feedError);
                const errorLog = { status: "Error", message: feedError.message };
                await pool.query(`UPDATE threat_feeds SET health = 'Error', last_run_log = $1 WHERE id = $2`, [JSON.stringify(errorLog), feed.id]);
            }
        }

        return NextResponse.json({ message: `Successfully processed ${feedsToUpdate.length} feeds.` });

    } catch (error) {
        console.error('Threat Intel Worker: A critical error occurred:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}