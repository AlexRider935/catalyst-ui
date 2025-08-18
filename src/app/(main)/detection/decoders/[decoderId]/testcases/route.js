import { query } from '@/lib/db';

// GET all test cases for a specific decoder
export async function GET(request, { params }) {
    const { decoderId } = params;
    try {
        const testCases = await query(
            'SELECT * FROM decoder_test_cases WHERE decoder_id = $1 ORDER BY created_at ASC',
            [decoderId]
        );
        return new Response(JSON.stringify(testCases.rows), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Failed to fetch test cases:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}

// POST a new test case for a specific decoder
export async function POST(request, { params }) {
    const { decoderId } = params;
    const { log_sample, should_match, expected_output } = await request.json();

    if (!log_sample) {
        return new Response(JSON.stringify({ error: 'log_sample is required' }), { status: 400 });
    }

    try {
        const result = await query(
            'INSERT INTO decoder_test_cases (decoder_id, log_sample, should_match, expected_output) VALUES ($1, $2, $3, $4) RETURNING *',
            [decoderId, log_sample, should_match, expected_output || null]
        );
        return new Response(JSON.stringify(result.rows[0]), {
            status: 201,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Failed to create test case:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}