import { NextResponse } from 'next/server';
import { pool } from '@/lib/db';

export async function GET() {
    try {
        // Query to get all feeds and count their associated indicators
        const query = `
      SELECT
        tf.*,
        COUNT(ti.id) AS indicators
      FROM
        threat_feeds tf
      LEFT JOIN
        threat_indicators ti ON tf.id = ti.feed_id
      GROUP BY
        tf.id
      ORDER BY
        tf.name;
    `;
        const result = await pool.query(query);

        // Convert indicator count from BigInt to Number
        const feeds = result.rows.map(feed => ({
            ...feed,
            indicators: Number(feed.indicators),
        }));

        return NextResponse.json(feeds);
    } catch (error) {
        console.error('API Error fetching threat feeds:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
export async function POST(request) {
    try {
        const { name, description, type, source_url, confidence, update_interval_minutes } = await request.json();

        // Basic validation
        if (!name || !type) {
            return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
        }

        const query = `
      INSERT INTO threat_feeds (name, description, type, source_url, confidence, update_interval_minutes, status, health)
      VALUES ($1, $2, $3, $4, $5, $6, true, 'Healthy')
      RETURNING *;
    `;
        const values = [name, description, type, source_url, confidence || 75, update_interval_minutes || 60];

        const result = await pool.query(query, values);

        return NextResponse.json(result.rows[0], { status: 201 });
    } catch (error) {
        console.error('API Error creating threat feed:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
// POST for creating a new feed will go here later