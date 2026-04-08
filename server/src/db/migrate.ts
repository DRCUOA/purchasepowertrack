import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { pool, query } from './pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = path.join(__dirname, 'migrations');

async function ensureMigrationsTable(): Promise<void> {
  await query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL UNIQUE,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function getAppliedMigrations(): Promise<Set<string>> {
  const result = await query<{ name: string }>('SELECT name FROM _migrations ORDER BY id');
  return new Set(result.rows.map((r) => r.name));
}

async function getMigrationFiles(): Promise<string[]> {
  const files = fs.readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql'));
  files.sort();
  return files;
}

async function run(): Promise<void> {
  console.log('[migrate] Starting migration runner…');

  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();
  const files = await getMigrationFiles();

  let count = 0;
  for (const file of files) {
    if (applied.has(file)) {
      console.log(`[migrate] Already applied: ${file}`);
      continue;
    }

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');
    console.log(`[migrate] Applying: ${file}…`);

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO _migrations (name) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log(`[migrate] Applied: ${file}`);
      count++;
    } catch (err) {
      await client.query('ROLLBACK');
      console.error(`[migrate] Failed to apply ${file}:`, err);
      throw err;
    } finally {
      client.release();
    }
  }

  console.log(`[migrate] Done. ${count} migration(s) applied.`);
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[migrate] Fatal error:', err);
    process.exit(1);
  });
