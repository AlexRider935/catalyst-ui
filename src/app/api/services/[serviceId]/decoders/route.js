import { query } from '@/lib/db';

// GET /api/services/[serviceId]/decoders
export async function GET(request, context) {
    const { serviceId } = await context.params; // ✅ await before using

    try {
        const decoders = await query(
            "SELECT * FROM decoders WHERE service_id = $1",
            [serviceId]
        );
        return Response.json({ success: true, decoders });
    } catch (err) {
        console.error("Error fetching decoders:", err);
        return Response.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// Your POST function should also be checked for consistency, though it's not the cause of this specific error.
export async function POST(request, { params }) {
    const { serviceId } = params;
    const { name, log_example, regex_pattern } = await request.json();

    if (!name || !log_example || !regex_pattern) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    try {
        const result = await query(
            'INSERT INTO decoders (service_id, name, log_example, regex_pattern) VALUES ($1, $2, $3, $4) RETURNING *;',
            [serviceId, name, log_example, regex_pattern]
        );

        // Ensure this also returns the new object directly.
        return new Response(JSON.stringify(result.rows[0]), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Failed to create decoder:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}