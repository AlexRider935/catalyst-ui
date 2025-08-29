import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

// --- Function to handle DELETING an agent ---
export async function DELETE(request, { params }) {
    const { id } = params; // The agent ID from the URL

    if (!id) {
        return NextResponse.json({ error: "Agent ID is required." }, { status: 400 });
    }

    try {
        const result = await pool.query('DELETE FROM agents WHERE id = $1 RETURNING id', [id]);

        if (result.rowCount === 0) {
            return NextResponse.json({ error: "Agent not found." }, { status: 404 });
        }

        return NextResponse.json({ message: "Agent deleted successfully." });

    } catch (error) {
        console.error(`[DELETE_AGENT_API]`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}