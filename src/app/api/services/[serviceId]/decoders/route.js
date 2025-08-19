import { query } from '@/lib/db';

// ✅ Helper function to map database columns to frontend properties
const transformDecoder = (decoder) => ({
    id: decoder.id,
    service_id: decoder.service_id,
    name: decoder.name,
    log_example: decoder.log_example,
    regex: decoder.regex_pattern, // Renames regex_pattern to regex
    isActive: decoder.is_active,
    createdAt: decoder.created_at,
});

// GET /api/services/[serviceId]/decoders
export async function GET(request, context) {
    const { serviceId } = await context.params; // ✅ await before destructuring

    try {
        const decoders = await query(
            "SELECT * FROM decoders WHERE service_id = $1 ORDER BY name ASC",
            [serviceId]
        );

        return Response.json(decoders.rows.map(transformDecoder));
    } catch (err) {
        console.error("Error fetching decoders:", err);
        return Response.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// POST /api/services/[serviceId]/decoders
export async function POST(request, context) {
    const { serviceId } = await context.params; // ✅ await here too
    const { name, log_example, regex_pattern } = await request.json();

    if (!name || !log_example || !regex_pattern) {
        return new Response(
            JSON.stringify({ error: "Missing required fields" }),
            { status: 400 }
        );
    }

    try {
        const result = await query(
            `INSERT INTO decoders (service_id, name, log_example, regex_pattern)
             VALUES ($1, $2, $3, $4)
             RETURNING *;`,
            [serviceId, name, log_example, regex_pattern]
        );

        const newDecoder = transformDecoder(result.rows[0]);

        return new Response(JSON.stringify(newDecoder), {
            status: 201,
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error("Failed to create decoder:", error);
        return new Response(
            JSON.stringify({ error: "Internal Server Error" }),
            { status: 500 }
        );
    }
}