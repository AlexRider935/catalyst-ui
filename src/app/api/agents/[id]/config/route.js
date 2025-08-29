import { pool } from '@/lib/db';
import { NextResponse } from 'next/server';

// This endpoint will be called by the agent to get its configuration.
// For now, it returns a static config. In a full app, you'd store this in the database.
export async function GET(request, { params }) {
    const apiKey = request.headers.get('Authorization')?.split(' ')[1];
    if (!apiKey) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // You can add logic here to verify the API key belongs to the requested agent ID.
    
    // --- EXAMPLE CONFIGURATION ---
    // You can control the agent's behavior from your server.
    const agentConfig = {
        fim_enabled: true,
        fim_directories: ["/etc", "/bin", "/home/user/critical_files"], // Use appropriate paths
        log_collector_enabled: true,
        log_collector_file: "/var/log/syslog", // Use an appropriate log file
    };

    return NextResponse.json(agentConfig);
}