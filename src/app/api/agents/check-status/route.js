import { NextResponse } from 'next/server';
import { checkAgentStatus } from '@/lib/StatusChecker';

export async function POST(request) {
    try {
        // The manual check uses a very short, 5-second threshold for an instant result.
        const instantThreshold = 5;
        const updatedCount = await checkAgentStatus(instantThreshold);

        return NextResponse.json({
            success: true,
            message: `Status check complete. ${updatedCount} agent(s) were updated to Offline.`
        });

    } catch (error) {
        console.error("[MANUAL_CHECK_API_ERROR]", error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}