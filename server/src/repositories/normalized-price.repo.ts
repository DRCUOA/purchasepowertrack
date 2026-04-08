import { query } from '../db/pool.js';
import type { NormalizedPrice } from '@basket/shared';
import { getWeekStart } from '@basket/shared';

interface NormalizedPriceUpsert {
  basket_item_id: number;
  week_start: string;
  canonical_unit_price: number;
  observation_count: number;
  accepted_count: number;
  rejected_count: number;
  method: string;
  source_detail: Record<string, unknown>;
  llm_review_payload?: Record<string, unknown>;
}

export async function upsert(data: NormalizedPriceUpsert): Promise<NormalizedPrice> {
  const result = await query<NormalizedPrice>(
    `INSERT INTO normalized_prices (
       basket_item_id, week_start, canonical_unit_price,
       observation_count, accepted_count, rejected_count,
       method, source_detail, llm_review_payload
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     ON CONFLICT (basket_item_id, week_start) DO UPDATE SET
       canonical_unit_price = EXCLUDED.canonical_unit_price,
       observation_count = EXCLUDED.observation_count,
       accepted_count = EXCLUDED.accepted_count,
       rejected_count = EXCLUDED.rejected_count,
       method = EXCLUDED.method,
       source_detail = EXCLUDED.source_detail,
       llm_review_payload = EXCLUDED.llm_review_payload,
       updated_at = NOW()
     RETURNING *`,
    [
      data.basket_item_id,
      data.week_start,
      data.canonical_unit_price,
      data.observation_count,
      data.accepted_count,
      data.rejected_count,
      data.method,
      JSON.stringify(data.source_detail),
      data.llm_review_payload ? JSON.stringify(data.llm_review_payload) : null,
    ],
  );
  return result.rows[0];
}

export async function findCurrentWeek(): Promise<NormalizedPrice[]> {
  const weekStart = getWeekStart(new Date());
  const result = await query<NormalizedPrice>(
    'SELECT * FROM normalized_prices WHERE week_start = $1 ORDER BY basket_item_id',
    [weekStart],
  );
  return result.rows;
}

export async function findByItemKey(itemKey: string): Promise<NormalizedPrice[]> {
  const result = await query<NormalizedPrice>(
    `SELECT np.* FROM normalized_prices np
     JOIN basket_items bi ON bi.id = np.basket_item_id
     WHERE bi.item_key = $1
     ORDER BY np.week_start DESC`,
    [itemKey],
  );
  return result.rows;
}

export async function findByItemAndWeek(
  basketItemId: number,
  weekStart: string,
): Promise<NormalizedPrice | null> {
  const result = await query<NormalizedPrice>(
    'SELECT * FROM normalized_prices WHERE basket_item_id = $1 AND week_start = $2',
    [basketItemId, weekStart],
  );
  return result.rows[0] ?? null;
}

export async function findLatestByItem(
  basketItemId: number,
): Promise<NormalizedPrice | null> {
  const result = await query<NormalizedPrice>(
    `SELECT * FROM normalized_prices
     WHERE basket_item_id = $1
     ORDER BY week_start DESC
     LIMIT 1`,
    [basketItemId],
  );
  return result.rows[0] ?? null;
}
