
import { query } from '@/lib/db';
import { deepEqual } from 'assert'; // Using Node's built-in assertion for object comparison

// Helper function for deep object comparison
const areObjectsEqual = (obj1, obj2) => {
    try {
        deepEqual(obj1, obj2);
        return true;
    } catch (error) {
        return false;
    }
};

export async function POST(request) {
    try {
        // 1. Fetch all active decoders and their test cases in one efficient query
        const queryText = `
      SELECT
        d.id AS decoder_id,
        d.name AS decoder_name,
        d.regex_pattern,
        s.name AS service_name,
        json_agg(
          json_build_object(
            'id', tc.id,
            'log_sample', tc.log_sample,
            'should_match', tc.should_match,
            'expected_output', tc.expected_output
          )
        ) AS test_cases
      FROM decoders d
      JOIN services s ON d.service_id = s.id
      LEFT JOIN decoder_test_cases tc ON d.id = tc.decoder_id
      WHERE d.is_active = true AND s.is_active = true
      GROUP BY d.id, s.name;
    `;
        const dbResult = await query(queryText);
        const decodersWithTests = dbResult.rows;

        let passedCount = 0;
        let failedCount = 0;
        const failures = [];

        // 2. Process each decoder
        for (const decoder of decodersWithTests) {
            let decoderHasFailed = false;
            if (!decoder.test_cases || decoder.test_cases[0].id === null) {
                // If no test cases, we can consider it a pass for now.
                passedCount++;
                continue;
            }

            const regex = new RegExp(decoder.regex_pattern);

            for (const test of decoder.test_cases) {
                const match = regex.exec(test.log_sample);
                const didMatch = match !== null;

                if (didMatch !== test.should_match) {
                    decoderHasFailed = true; // Test failed (e.g., should have matched but didn't)
                    break; // No need to check other tests for this decoder
                }

                if (didMatch && test.should_match && test.expected_output) {
                    // If it matched, we also need to check if the extracted data is correct.
                    if (!areObjectsEqual(match.groups || {}, test.expected_output)) {
                        decoderHasFailed = true; // Extracted data did not match expected output
                        break;
                    }
                }
            }

            if (decoderHasFailed) {
                failedCount++;
                failures.push({
                    decoderName: decoder.decoder_name,
                    serviceName: decoder.service_name,
                });
            } else {
                passedCount++;
            }
        }

        // 3. Return the final report
        return new Response(JSON.stringify({ passed: passedCount, failed: failedCount, failures }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error) {
        console.error('Error running integrity test:', error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}