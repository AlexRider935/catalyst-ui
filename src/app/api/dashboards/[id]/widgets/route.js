import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * POST /api/dashboards/[id]/widgets
 * Adds a new widget to a specified dashboard.
 */
export async function POST(request, { params }) {
    const { id: dashboard_id } = params;

    try {
        const { saved_query_id, visualization_type } = await request.json();

        if (!saved_query_id || !visualization_type) {
            return NextResponse.json({ error: 'Saved query and visualization type are required.' }, { status: 400 });
        }

        // Define a default layout for the new widget.
        // A real implementation might have more complex logic to find the next available spot.
        const layout = { x: 0, y: 0, w: 4, h: 6 };

        const query = `
            INSERT INTO dashboard_widgets (dashboard_id, saved_query_id, visualization_type, layout)
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const values = [dashboard_id, saved_query_id, visualization_type, layout];

        const { rows } = await db.query(query, values);

        return NextResponse.json(rows[0], { status: 201 });

    } catch (error) {
        console.error(`[API] Error adding widget to dashboard ${dashboard_id}:`, error);
        return NextResponse.json({ error: 'Failed to add widget.' }, { status: 500 });
    }
}
