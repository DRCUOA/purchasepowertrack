import { query, transaction } from '../db/pool.js';
import type {
  PriceObservation,
  PriceObservationInsert,
  ObservationStatus,
} from '@basket/shared';

export async function insert(obs: PriceObservationInsert): Promise<PriceObservation> {
  const result = await query<PriceObservation>(
    `INSERT INTO price_observations (
       basket_item_id, observed_at, shop_name, region, source_url,
       raw_title, raw_price, unit_text, is_member_price, is_special,
       extraction_method, raw_payload
     ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
     RETURNING *`,
    [
      obs.basket_item_id,
      obs.observed_at,
      obs.shop_name,
      obs.region ?? null,
      obs.source_url ?? null,
      obs.raw_title,
      obs.raw_price,
      obs.unit_text ?? null,
      obs.is_member_price,
      obs.is_special,
      obs.extraction_method,
      JSON.stringify(obs.raw_payload),
    ],
  );
  return result.rows[0];
}

const INSERT_COLUMNS = `INSERT INTO price_observations (
           basket_item_id, observed_at, shop_name, region, source_url,
           raw_title, raw_price, unit_text, is_member_price, is_special,
           extraction_method, raw_payload
         )`;

/** ~80 rows × 12 params stays well under Postgres parameter limits */
const INSERT_BATCH_CHUNK = 80;

function pushObservationParams(obs: PriceObservationInsert, values: unknown[]): void {
  values.push(
    obs.basket_item_id,
    obs.observed_at,
    obs.shop_name,
    obs.region ?? null,
    obs.source_url ?? null,
    obs.raw_title,
    obs.raw_price,
    obs.unit_text ?? null,
    obs.is_member_price,
    obs.is_special,
    obs.extraction_method,
    JSON.stringify(obs.raw_payload),
  );
}

export async function insertBatch(
  observations: PriceObservationInsert[],
): Promise<PriceObservation[]> {
  if (observations.length === 0) return [];

  return transaction(async (client) => {
    const results: PriceObservation[] = [];
    for (let offset = 0; offset < observations.length; offset += INSERT_BATCH_CHUNK) {
      const chunk = observations.slice(offset, offset + INSERT_BATCH_CHUNK);
      const values: unknown[] = [];
      const placeholders: string[] = [];
      let paramIdx = 1;
      for (const obs of chunk) {
        const row: string[] = [];
        for (let c = 0; c < 12; c++) {
          row.push(`$${paramIdx++}`);
        }
        placeholders.push(`(${row.join(',')})`);
        pushObservationParams(obs, values);
      }
      const result = await client.query<PriceObservation>(
        `${INSERT_COLUMNS} VALUES ${placeholders.join(',')} RETURNING *`,
        values,
      );
      results.push(...result.rows);
    }
    return results;
  });
}

export async function findPendingByItem(
  basketItemId: number,
): Promise<PriceObservation[]> {
  const result = await query<PriceObservation>(
    `SELECT * FROM price_observations
     WHERE basket_item_id = $1 AND review_status = 'pending'
     ORDER BY observed_at DESC`,
    [basketItemId],
  );
  return result.rows;
}

export async function findByItemAndWeek(
  basketItemId: number,
  weekStart: string,
): Promise<PriceObservation[]> {
  const result = await query<PriceObservation>(
    `SELECT * FROM price_observations
     WHERE basket_item_id = $1
       AND observed_at >= $2::date
       AND observed_at < ($2::date + INTERVAL '7 days')
     ORDER BY observed_at DESC`,
    [basketItemId, weekStart],
  );
  return result.rows;
}

/** Single round-trip for all basket items for the ISO week starting at weekStart */
export async function findByWeekForBasketItems(
  basketItemIds: number[],
  weekStart: string,
): Promise<PriceObservation[]> {
  if (basketItemIds.length === 0) return [];
  const result = await query<PriceObservation>(
    `SELECT * FROM price_observations
     WHERE basket_item_id = ANY($1::int[])
       AND observed_at >= $2::date
       AND observed_at < ($2::date + INTERVAL '7 days')
     ORDER BY basket_item_id, observed_at DESC`,
    [basketItemIds, weekStart],
  );
  return result.rows;
}

export async function updateReview(
  id: number,
  status: ObservationStatus,
  reason: string,
  payload: Record<string, unknown>,
): Promise<void> {
  await query(
    `UPDATE price_observations
     SET review_status = $2,
         review_reason = $3,
         review_payload = $4,
         reviewed_at = NOW()
     WHERE id = $1`,
    [id, status, reason, JSON.stringify(payload)],
  );
}

export async function updateReviewsBatch(
  updates: Array<{
    id: number;
    status: ObservationStatus;
    reason: string;
    payload: Record<string, unknown>;
  }>,
): Promise<void> {
  if (updates.length === 0) return;
  const ids = updates.map((u) => u.id);
  const statuses = updates.map((u) => u.status);
  const reasons = updates.map((u) => u.reason);
  const payloads = updates.map((u) => JSON.stringify(u.payload));
  await query(
    `UPDATE price_observations AS p
     SET
       review_status = u.status,
       review_reason = u.reason,
       review_payload = u.payload::jsonb,
       reviewed_at = NOW()
     FROM unnest(
       $1::int[],
       $2::text[],
       $3::text[],
       $4::text[]
     ) AS u(id, status, reason, payload)
     WHERE p.id = u.id`,
    [ids, statuses, reasons, payloads],
  );
}

export async function findLatestObservationDate(): Promise<string | null> {
  const result = await query<{ latest: string | null }>(
    'SELECT MAX(observed_at)::text AS latest FROM price_observations',
  );
  return result.rows[0]?.latest ?? null;
}
