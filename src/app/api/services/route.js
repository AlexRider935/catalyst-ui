import { db } from '@/lib/db'; // ✅ Correctly import the 'db' object
import { NextResponse } from 'next/server';

export async function GET(request) {
    try {
        // ✅ CORRECTED: Use db.query() to execute the SQL statement.
        const dbResult = await db.query('SELECT * FROM services ORDER BY name ASC');

        // --- DATA TRANSFORMATION ---
        const services = dbResult.rows.map(service => ({
            id: service.id,
            name: service.name,
            prefilter: service.prefilter_keyword,
            isActive: service.is_active,
            createdAt: service.created_at
        }));

        return NextResponse.json(services);

    } catch (error) {
        console.error('API GET /api/services Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const { name, prefilter_keyword } = await request.json();

        if (!name || !prefilter_keyword) {
            return NextResponse.json({ error: 'Name and prefilter keyword are required' }, { status: 400 });
        }

        // ✅ CORRECTED: Use db.query() here as well.
        const result = await db.query(
            'INSERT INTO services (name, prefilter_keyword) VALUES ($1, $2) RETURNING *',
            [name, prefilter_keyword]
        );

        const newService = result.rows[0];
        const responseService = {
            id: newService.id,
            name: newService.name,
            prefilter: newService.prefilter_keyword,
            isActive: newService.is_active,
            createdAt: newService.created_at
        };

        return NextResponse.json(responseService, { status: 201 });

    } catch (error) {
        console.error('API POST /api/services Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}