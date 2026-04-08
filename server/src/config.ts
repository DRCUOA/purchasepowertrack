import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

export const config = {
  port: parseInt(optionalEnv('PORT', '3000'), 10),
  nodeEnv: optionalEnv('NODE_ENV', 'development'),
  databaseUrl: requireEnv('DATABASE_URL'),
  openaiApiKey: requireEnv('OPENAI_API_KEY'),
  enabledRetailers: optionalEnv('ENABLED_RETAILERS', 'openai-search')
    .split(',')
    .map((s) => s.trim()),
  baselineMonth: optionalEnv('BASELINE_MONTH', '2026-04'),
} as const;
