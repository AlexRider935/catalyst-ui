import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

/**
 * DELETE /api/ingestion/sources/[id]
 * Deletes a data source from the database.
 */
export async function DELETE(request, { params }) {
    const { id } = await params;

    if (!id) {
        return NextResponse.json({ error: 'Source ID is required.' }, { status: 400 });
    }

    try {
        const result = await db.query(
            'DELETE FROM sources WHERE id = $1 RETURNING name',
            [id]
        );

        if (result.rowCount === 0) {
            return NextResponse.json({ error: 'Source not found.' }, { status: 404 });
        }

        return NextResponse.json({ message: `Source "${result.rows[0].name}" deleted successfully.` });
    } catch (error) {
        console.error(`[API] Error deleting source ${id}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// NOTE: You can add PUT and GET handlers to this file later
// to manage individual sources (e.g., pausing/resuming or fetching details).
