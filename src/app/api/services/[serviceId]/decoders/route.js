import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

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
export async function GET(request, { params }) {
    const { serviceId } = await params;

    try {
        // ✅ CORRECTED: Use db.query() to execute the SQL statement.
        const result = await db.query(
            "SELECT * FROM decoders WHERE service_id = $1 ORDER BY name ASC",
            [serviceId]
        );

        const decoders = result.rows.map(transformDecoder);
        return NextResponse.json(decoders);

    } catch (err) {
        console.error("Error fetching decoders:", err);
        return NextResponse.json(
            { success: false, error: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// POST /api/services/[serviceId]/decoders
export async function POST(request, { params }) {
    const { serviceId } = params;
    const { name, log_example, regex_pattern } = await request.json();

    if (!name || !log_example || !regex_pattern) {
        return NextResponse.json(
            { error: "Missing required fields" },
            { status: 400 }
        );
    }

    try {
        // ✅ CORRECTED: Use db.query() here as well.
        const result = await db.query(
            `INSERT INTO decoders (service_id, name, log_example, regex_pattern)
             VALUES ($1, $2, $3, $4)
             RETURNING *;`,
            [serviceId, name, log_example, regex_pattern]
        );

        const newDecoder = transformDecoder(result.rows[0]);

        return NextResponse.json(newDecoder, { status: 201 });

    } catch (error) {
        console.error("Failed to create decoder:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
