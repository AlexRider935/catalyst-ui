import { query } from '@/lib/db';

export async function GET(request) {
    try {
        const dbResult = await query('SELECT * FROM services ORDER BY name ASC');

        // --- DATA TRANSFORMATION ---
        // Map the snake_case database columns to camelCase object properties for the frontend.
        const services = dbResult.rows.map(service => ({
            id: service.id,
            name: service.name,
            prefilter: service.prefilter_keyword, // <-- The fix is here
            isActive: service.is_active,
            createdAt: service.created_at
        }));

        return new Response(JSON.stringify(services), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('API GET /api/services Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
            status: 500,
        });
    }
}

// Your POST function is correct, but for consistency, we'll update it as well.
export async function POST(request) {
    try {
        const { name, prefilter_keyword } = await request.json();

        if (!name || !prefilter_keyword) {
            return new Response(JSON.stringify({ error: 'Name and prefilter keyword are required' }), { status: 400 });
        }

        const result = await query(
            'INSERT INTO services (name, prefilter_keyword) VALUES ($1, $2) RETURNING *',
            [name, prefilter_keyword]
        );

        // Also transform the response here for consistency.
        const newService = result.rows[0];
        const responseService = {
            id: newService.id,
            name: newService.name,
            prefilter: newService.prefilter_keyword,
            isActive: newService.is_active,
            createdAt: newService.created_at
        };

        return new Response(JSON.stringify(responseService), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('API POST /api/services Error:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}