// This script should be run daily via a cron job, e.g., "5 0 * * *" (at 12:05 AM).
const { Pool } = require('pg');

// Ensure you have a .env file at the root of your project or that
// POSTGRES_URL is available as an environment variable where this script runs.
require('dotenv').config({ path: '../.env.local' });


const pool = new Pool({
    connectionString: process.env.POSTGRES_URL,
});

// How many days of "hot" data to keep attached to the main table.
const HOT_RETENTION_DAYS = 30;

/**
 * Creates a new partition for the NEXT day.
 * e.g., If run on the 25th, it creates the partition for the 26th.
 */
async function createNextDayPartition() {
    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);

    const year = tomorrow.getUTCFullYear();
    const month = String(tomorrow.getUTCMonth() + 1).padStart(2, '0');
    const day = String(tomorrow.getUTCDate()).padStart(2, '0');

    const partitionName = `events_${year}_${month}_${day}`;
    const startDate = `${year}-${month}-${day} 00:00:00Z`;

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setUTCDate(dayAfterTomorrow.getUTCDate() + 1);
    const endDateYear = dayAfterTomorrow.getUTCFullYear();
    const endDateMonth = String(dayAfterTomorrow.getUTCMonth() + 1).padStart(2, '0');
    const endDateDay = String(dayAfterTomorrow.getUTCDate()).padStart(2, '0');
    const endDate = `${endDateYear}-${endDateMonth}-${endDateDay} 00:00:00Z`;

    const query = `
    CREATE TABLE IF NOT EXISTS ${partitionName} PARTITION OF raw_events
    FOR VALUES FROM ('${startDate}') TO ('${endDate}');
  `;

    console.log(`[MAINTENANCE] Creating partition: ${partitionName}`);
    await pool.query(query);
    console.log(`[MAINTENANCE] Successfully created partition for ${startDate}.`);
}

/**
 * Detaches partitions older than the retention period, turning them into archive tables.
 */
async function detachOldPartitions() {
    const cutoffDate = new Date();
    cutoffDate.setUTCDate(cutoffDate.getUTCDate() - HOT_RETENTION_DAYS);

    const year = cutoffDate.getUTCFullYear();
    const month = String(cutoffDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(cutoffDate.getUTCDate()).padStart(2, '0');

    const partitionName = `events_${year}_${month}_${day}`;

    const checkExistsQuery = `
    SELECT to_regclass('public.${partitionName}');
  `;

    const { rows } = await pool.query(checkExistsQuery);

    if (rows[0].to_regclass) {
        console.log(`[MAINTENANCE] Archiving (detaching) partition: ${partitionName}`);
        const detachQuery = `ALTER TABLE raw_events DETACH PARTITION ${partitionName};`;
        await pool.query(detachQuery);
        console.log(`[MAINTENANCE] Successfully detached ${partitionName}. It is now an archive table.`);
    } else {
        console.log(`[MAINTENANCE] No partition found for ${year}-${month}-${day} to archive.`);
    }
}

async function runMaintenance() {
    console.log(`[MAINTENANCE] Starting daily partition maintenance at ${new Date().toISOString()}...`);
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await createNextDayPartition();
        await detachOldPartitions();
        await client.query('COMMIT');
        console.log('[MAINTENANCE] Maintenance complete.');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('[MAINTENANCE] Error during maintenance, transaction rolled back:', error);
        throw error; // Throw error to ensure cron job can report a failure
    } finally {
        client.release();
        pool.end();
    }
}

runMaintenance().catch(err => {
    process.exit(1); // Exit with a failure code if an error is uncaught
});
