import { getCurrentMonth } from '@basket/shared';
import { runSnapshot } from '../services/snapshot.service.js';
import { pool } from '../db/pool.js';

async function main() {
  const month = process.argv[2] || getCurrentMonth();
  console.log(`Generating snapshot for ${month}...`);
  try {
    const result = await runSnapshot(month);
    console.log('Snapshot complete:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Snapshot failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

main();
