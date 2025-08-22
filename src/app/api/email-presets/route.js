import { db } from '@/lib/db'; // ✅ Correctly import the 'db' object
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const queryString = 'SELECT name, smtp_server, smtp_port, smtp_encryption FROM email_provider_presets ORDER BY name';

        // ✅ Correctly call the .query() method on the 'db' object
        const result = await db.query(queryString);

        // Transform snake_case from DB to camelCase for the client
        const presets = result.rows.map(row => ({
            name: row.name,
            server: row.smtp_server,
            port: row.smtp_port,
            encryption: row.smtp_encryption,
        }));

        return NextResponse.json(presets);

    } catch (error) {
        console.error('API Error fetching email presets:', error);
        return NextResponse.json({ error: 'Failed to fetch email provider presets.' }, { status: 500 });
    }
}