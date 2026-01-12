// src/app/api/services/[serviceId]/route.js

import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function DELETE(req, { params }) {
    const { serviceId } = params;

    if (!serviceId) {
        return NextResponse.json({ error: 'Service ID is required' }, { status: 400 });
    }

    // Get a client from the pool to run a transaction
    const client = await pool.connect();

    try {
        // Start the transaction
        await client.query('BEGIN');

        // 1. Delete all decoders associated with the service
        await client.query('DELETE FROM decoders WHERE service_id = $1', [serviceId]);

        // 2. Delete the service itself
        const result = await client.query('DELETE FROM services WHERE id = $1 RETURNING *', [serviceId]);

        if (result.rowCount === 0) {
            // Log if the service was already gone, but don't treat it as an error
            console.log(`Service ${serviceId} not found, but proceeding as success.`);
        }

        // If both commands succeed, commit the transaction
        await client.query('COMMIT');

        return new Response(null, { status: 204 }); // 204 No Content for successful DELETE

    } catch (error) {
        // If any error occurs, roll back the transaction
        await client.query('ROLLBACK');

        console.error(`Failed to delete service ${serviceId}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });

    } finally {
        // ALWAYS release the client back to the pool
        client.release();
    }
}