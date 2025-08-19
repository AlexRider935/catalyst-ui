import { query } from '@/lib/db';

// Helper function to map database columns to frontend properties
const transformDecoder = (decoder) => ({
    id: decoder.id,
    service_id: decoder.service_id,
    name: decoder.name,
    log_example: decoder.log_example,
    regex: decoder.regex_pattern,
    isActive: decoder.is_active,
    createdAt: decoder.created_at,
});

// Handles updating a specific decoder
export async function PUT(request, context) {
    const { decoderId } = await context.params; // ✅ await before using
    const { name, log_example, regex_pattern, is_active } = await request.json();

    if (!name || !regex_pattern) {
        return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    try {
        const updateQuery = `
          UPDATE decoders
          SET name = $1, log_example = $2, regex_pattern = $3, is_active = $4
          WHERE id = $5
          RETURNING *;
        `;
        const values = [name, log_example, regex_pattern, is_active, decoderId];
        const result = await query(updateQuery, values);

        if (result.rowCount === 0) {
            return Response.json({ error: 'Decoder not found' }, { status: 404 });
        }

        return Response.json(transformDecoder(result.rows[0]));
    } catch (error) {
        console.error('Failed to update decoder:', error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// Handles deleting a specific decoder
export async function DELETE(request, context) {
    const { decoderId } = await context.params; // ✅ await here too

    try {
        const result = await query('DELETE FROM decoders WHERE id = $1', [decoderId]);

        if (result.rowCount === 0) {
            return Response.json({ error: 'Decoder not found' }, { status: 404 });
        }

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error('Failed to delete decoder:', error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}