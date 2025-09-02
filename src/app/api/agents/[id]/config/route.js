import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request, { params }) {
    const { id } = await params;
    try {
        const result = await pool.query('SELECT config FROM agents WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }
        return NextResponse.json(result.rows[0].config || {});
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    const { id } = await params;
    const newConfig = await request.json();
    try {
        const query = `UPDATE agents SET config = $1, updated_at = NOW() WHERE id = $2 RETURNING id, config;`;
        const result = await pool.query(query, [newConfig, id]);
        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Agent not found" }, { status: 404 });
        }
        return NextResponse.json(result.rows[0]);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}