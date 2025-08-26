import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

function parseSafeQuery(queryString) {
    const conditions = queryString.split(/ AND /i);
    const whereClauses = [];
    const values = [];
    let queryIndex = 1;

    conditions.forEach(condition => {
        const match = condition.match(/(.*?)\s*=\s*'(.*?)'/);
        if (match) {
            const field = match[1].trim().replace(/[^a-zA-Z0-9._-]/g, '');
            const value = match[2].trim();

            if (field === 'hostname') {
                whereClauses.push(`hostname = $${queryIndex++}`);
                values.push(value);
            } else {
                const fieldPath = field.split('.').join('->>');
                whereClauses.push(`data->>'${fieldPath}' = $${queryIndex++}`);
                values.push(value);
            }
        }
    });

    return {
        whereClause: whereClauses.length > 0 ? `AND ${whereClauses.join(' AND ')}` : "",
        values: values,
    };
}

export async function POST(request) {
    const startTime = Date.now();
    const body = await request.json();
    const { query: userQuery, timeRange = '24h' } = body;

    // In a real app, you'd get the user from the session/token
    const executed_by = "silas.architect";

    try {
        const intervalMap = { '24h': '1 day', '7d': '7 days', '30d': '30 days' };
        const interval = intervalMap[timeRange] || '1 day';

        const { whereClause, values } = parseSafeQuery(userQuery || "");

        const sql = `
            SELECT id, received_at, hostname, data 
            FROM raw_events
            WHERE received_at >= NOW() - $${values.length + 1}::interval
            ${whereClause}
            ORDER BY received_at DESC 
            LIMIT 500;
        `;

        const finalValues = [...values, interval];
        const { rows } = await db.query(sql, finalValues);

        // ✅ Log successful query to history
        const execution_time_ms = Date.now() - startTime;
        await db.query(
            `INSERT INTO query_history (query_string, executed_by, status, execution_time_ms) VALUES ($1, $2, 'Success', $3)`,
            [userQuery, executed_by, execution_time_ms]
        );

        return NextResponse.json(rows);

    } catch (error) {
        console.error("[API] Data Lake Query Error:", error);

        // ✅ Log failed query to history
        const execution_time_ms = Date.now() - startTime;
        await db.query(
            `INSERT INTO query_history (query_string, executed_by, status, execution_time_ms) VALUES ($1, $2, 'Failed', $3)`,
            [userQuery, executed_by, execution_time_ms]
        );

        return NextResponse.json({ error: 'Failed to execute query.' }, { status: 500 });
    }
}