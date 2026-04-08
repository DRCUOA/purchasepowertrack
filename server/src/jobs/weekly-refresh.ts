import { runRefresh } from '../services/refresh.service.js';
import { pool } from '../db/pool.js';

async function main() {
  console.log('Starting weekly refresh...');
  try {
    const result = await runRefresh();
    console.log('Refresh complete:', JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Refresh failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
    process.exit(0);
  }
}

main();
