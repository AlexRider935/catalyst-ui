import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';

export async function POST(request) {
    const { name } = await request.json();
    if (!name) {
        return NextResponse.json({ error: "Agent name is required." }, { status: 400 });
    }

    try {
        const token = randomBytes(24).toString('hex');
        const query = `
            INSERT INTO agents (name, registration_token, status)
            VALUES ($1, $2, 'Never Connected')
            RETURNING id, name, registration_token;
        `;
        const result = await pool.query(query, [name, token]);

        // Return the pre-registered agent's data, including the token
        return NextResponse.json(result.rows[0]);

    } catch (error) {
        console.error("[PRE_REGISTER_AGENT_API]", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}