import { pool } from './db';

// The single, master function for checking agent statuses.
// It accepts a 'thresholdSeconds' argument to be flexible.
export const checkAgentStatus = async (thresholdSeconds) => {
    // Default to a 3-minute (180 seconds) threshold if none is provided.
    const checkTime = thresholdSeconds || 180;
    console.log(`[${new Date().toISOString()}] Running agent status check with a ${checkTime}s threshold.`);

    const client = await pool.connect();
    let updatedCount = 0;
    try {
        const query = `
            UPDATE agents
            SET status = 'Offline', updated_at = NOW()
            WHERE status = 'Online' AND last_seen_at < (NOW() - INTERVAL '${checkTime} seconds');
        `;
        const result = await client.query(query);
        updatedCount = result.rowCount;

        if (updatedCount > 0) {
            console.log(`✅ Marked ${updatedCount} agent(s) as Offline.`);
        }
    } catch (error) {
        console.error("❌ Error during status check:", error);
    } finally {
        await client.release();
        return updatedCount;
    }
};

// --- THIS IS THE FIX ---
// The automatic check will now run every 3 minutes and use a 3-minute threshold.
// This gives the agent (which sends a heartbeat every 1 minute) plenty of time to check in.
const AUTOMATIC_CHECK_INTERVAL_MINUTES = 3;
const AUTOMATIC_THRESHOLD_SECONDS = AUTOMATIC_CHECK_INTERVAL_MINUTES * 60;

if (!global._statusChecker) {
    console.log("🚀 Initializing automatic agent status checker...");
    const runAutomaticCheck = () => checkAgentStatus(AUTOMATIC_THRESHOLD_SECONDS);

    setTimeout(runAutomaticCheck, 5000);
    global._statusChecker = setInterval(runAutomaticCheck, AUTOMATIC_CHECK_INTERVAL_MINUTES * 60 * 1000);
    console.log(`Automatic status checker will run every ${AUTOMATIC_CHECK_INTERVAL_MINUTES} minute(s).`);
}

export const startStatusChecker = () => { };