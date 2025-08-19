import { query } from '@/lib/db';

export async function DELETE(req, { params }) {
    const { serviceId } = params;

    if (!serviceId) {
        return new Response(JSON.stringify({ error: 'Service ID is required' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        // Delete all decoders for this service
        await query('DELETE FROM decoders WHERE service_id = $1', [serviceId]);

        // Delete the service
        const result = await query('DELETE FROM services WHERE id = $1 RETURNING *', [serviceId]);

        if (result.rowCount === 0) {
            console.log(`Service ${serviceId} not found, treating as success.`);
        }

        return new Response(null, { status: 204 });
    } catch (error) {
        console.error(`Failed to delete service ${serviceId}:`, error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}