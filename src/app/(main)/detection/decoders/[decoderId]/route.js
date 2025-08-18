import { query } from '@/lib/db';

/**
 * Handles updating an existing decoder.
 * @param {Request} request The incoming request object.
 * @param {object} params The route parameters, containing decoderId.
 * @returns {Response} The JSON response.
 */
export async function PUT(request, { params }) {
    const { decoderId } = params;
    const { name, log_example, regex_pattern, is_active } = await request.json();

    // Basic validation
    if (!name || !log_example || !regex_pattern || is_active === undefined) {
        return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
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
            return new Response(JSON.stringify({ error: 'Decoder not found' }), { status: 404 });
        }

        return new Response(JSON.stringify(result.rows[0]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Failed to update decoder:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
        });
    }
}

/**
 * Handles deleting a specific decoder.
 * @param {Request} request The incoming request object.
 * @param {object} params The route parameters, containing decoderId.
 * @returns {Response} The JSON response.
 */
export async function DELETE(request, { params }) {
    const { decoderId } = params;

    try {
        const result = await query('DELETE FROM decoders WHERE id = $1', [decoderId]);

        // Check if any row was actually deleted.
        if (result.rowCount === 0) {
            return new Response(JSON.stringify({ error: 'Decoder not found' }), { status: 404 });
        }

        // A 204 No Content response is standard for a successful deletion.
        return new Response(null, { status: 204 });

    } catch (error) {
        console.error('Failed to delete decoder:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
        });
    }
}