import { query } from '@/lib/db';

export async function POST(request) {
    try {
        const { logs } = await request.json();

        if (!logs) {
            return Response.json({ error: 'No logs provided' }, { status: 400 });
        }

        // 1. Fetch all active services and decoders from the database
        const servicesResult = await query('SELECT id, name, prefilter_keyword FROM services WHERE is_active = true');
        const decodersResult = await query('SELECT id, service_id, name, regex_pattern FROM decoders WHERE is_active = true');

        const services = servicesResult.rows;
        const decoders = decodersResult.rows;

        // 2. Process each log line against the fetched rules
        const logLines = logs.split('\n').filter(line => line.trim() !== '');
        const results = [];

        for (const line of logLines) {
            let matchFound = false;

            for (const service of services) {
                if (line.includes(service.prefilter_keyword)) {
                    const serviceDecoders = decoders.filter(d => d.service_id === service.id);

                    for (const decoder of serviceDecoders) {
                        try {
                            const regex = new RegExp(decoder.regex_pattern);
                            const match = line.match(regex);

                            if (match && match.groups) {
                                results.push({
                                    log: line,
                                    status: 'Success',
                                    service: service.name,
                                    decoder: decoder.name,
                                    data: match.groups,
                                });
                                matchFound = true;
                                break; // First decoder match wins
                            }
                        } catch (e) {
                            // Ignore invalid regex patterns in the database to prevent crashing the whole process
                            console.error(`Invalid regex for decoder "${decoder.name}": ${decoder.regex_pattern}`);
                        }
                    }
                }
                if (matchFound) break; // First service match wins
            }

            if (!matchFound) {
                results.push({
                    log: line,
                    status: 'No Match',
                    service: 'Unknown',
                    decoder: 'N/A',
                    data: null,
                });
            }
        }

        return Response.json(results);

    } catch (error) {
        // This is the error that will be printed in your server terminal
        console.error('Error processing batch:', error);
        return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}