import { query } from '../db/pool.js';
import type {
  MonthlySnapshot,
  MonthlySnapshotDetail,
  MonthSummary,
} from '@basket/shared';

interface MonthlySnapshotUpsert {
  snapshot_month: string;
  basket_item_id: number;
  quantity: number;
  unit_price: number;
  line_total: number;
  normalized_price_id?: number | null;
}

export async function upsert(data: MonthlySnapshotUpsert): Promise<MonthlySnapshot> {
  const result = await query<MonthlySnapshot>(
    `INSERT INTO monthly_snapshots (
       snapshot_month, basket_item_id, quantity, unit_price,
       line_total, normalized_price_id
     ) VALUES ($1, $2, $3, $4, $5, $6)
     ON CONFLICT (snapshot_month, basket_item_id) DO UPDATE SET
       quantity = EXCLUDED.quantity,
       unit_price = EXCLUDED.unit_price,
       line_total = EXCLUDED.line_total,
       normalized_price_id = EXCLUDED.normalized_price_id
     RETURNING *`,
    [
      data.snapshot_month,
      data.basket_item_id,
      data.quantity,
      data.unit_price,
      data.line_total,
      data.normalized_price_id ?? null,
    ],
  );
  return result.rows[0];
}

export async function findByMonth(month: string): Promise<MonthlySnapshotDetail[]> {
  const result = await query<MonthlySnapshotDetail>(
    `SELECT
       ms.*,
       bi.item_key,
       bi.name AS item_name,
       bi.unit_label
     FROM monthly_snapshots ms
     JOIN basket_items bi ON bi.id = ms.basket_item_id
     WHERE ms.snapshot_month = $1
     ORDER BY bi.id`,
    [month],
  );
  return result.rows;
}

export async function findMonthSummaries(): Promise<MonthSummary[]> {
  const result = await query<MonthSummary>(
    `SELECT
       snapshot_month,
       SUM(line_total)::numeric(10,2) AS basket_total,
       COUNT(*)::integer AS item_count
     FROM monthly_snapshots
     GROUP BY snapshot_month
     ORDER BY snapshot_month`,
  );
  return result.rows;
}

export async function findByMonthWithDetails(
  month: string,
): Promise<MonthlySnapshotDetail[]> {
  const result = await query<MonthlySnapshotDetail>(
    `SELECT
       ms.*,
       bi.item_key,
       bi.name AS item_name,
       bi.unit_label
     FROM monthly_snapshots ms
     JOIN basket_items bi ON bi.id = ms.basket_item_id
     WHERE ms.snapshot_month = $1
     ORDER BY bi.id`,
    [month],
  );
  return result.rows;
}
