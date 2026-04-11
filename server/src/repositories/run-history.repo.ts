import { query } from '../db/pool.js';
import type { RunHistoryEntry, RunHistoryItemSnapshot } from '@basket/shared';

interface RunHistoryInsert {
  run_type: 'refresh' | 'snapshot';
  started_at: Date;
  completed_at: Date;
  status: string;
  basket_total: number | null;
  item_count: number;
  summary: Record<string, unknown>;
  items: RunHistoryItemSnapshot[];
}

export async function insert(data: RunHistoryInsert): Promise<RunHistoryEntry> {
  const result = await query<RunHistoryEntry>(
    `INSERT INTO run_history (
       run_type, started_at, completed_at, status,
       basket_total, item_count, summary, items
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      data.run_type,
      data.started_at.toISOString(),
      data.completed_at.toISOString(),
      data.status,
      data.basket_total,
      data.item_count,
      JSON.stringify(data.summary),
      JSON.stringify(data.items),
    ],
  );
  return result.rows[0];
}

export async function findAll(limit = 50): Promise<RunHistoryEntry[]> {
  const result = await query<RunHistoryEntry>(
    `SELECT * FROM run_history ORDER BY started_at DESC LIMIT $1`,
    [limit],
  );
  return result.rows;
}

export async function findById(id: number): Promise<RunHistoryEntry | null> {
  const result = await query<RunHistoryEntry>(
    `SELECT * FROM run_history WHERE id = $1`,
    [id],
  );
  return result.rows[0] ?? null;
}

export async function deleteById(id: number): Promise<boolean> {
  const result = await query('DELETE FROM run_history WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
