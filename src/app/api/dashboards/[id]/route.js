import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * GET /api/dashboards/[id]
 * Fetches a single dashboard and all of its associated widgets.
 */
export async function GET(request, { params }) {
    const { id } = await params;

    try {
        // Fetch dashboard details
        const dashboardQuery = 'SELECT * FROM dashboards WHERE id = $1;';
        const dashboardResult = await db.query(dashboardQuery, [id]);

        if (dashboardResult.rows.length === 0) {
            return NextResponse.json({ error: 'Dashboard not found.' }, { status: 404 });
        }
        const dashboard = dashboardResult.rows[0];

        // Fetch associated widgets
        const widgetsQuery = `
            SELECT 
                w.id,
                w.visualization_type,
                w.layout,
                sq.name as saved_query_name,
                sq.query_string
            FROM 
                dashboard_widgets w
            JOIN 
                saved_queries sq ON w.saved_query_id = sq.id
            WHERE 
                w.dashboard_id = $1;
        `;
        const widgetsResult = await db.query(widgetsQuery, [id]);

        dashboard.widgets = widgetsResult.rows;

        return NextResponse.json(dashboard);

    } catch (error) {
        console.error(`[API] Error fetching dashboard ${id}:`, error);
        return NextResponse.json({ error: 'Failed to fetch dashboard details.' }, { status: 500 });
    }
}

// NOTE: The POST (for adding widgets), PUT (for updating layout), and DELETE (for removing widgets)
// methods would be added to this file as the frontend requires them.
