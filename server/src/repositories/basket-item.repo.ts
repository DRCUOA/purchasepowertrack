import { query } from '../db/pool.js';
import type {
  BasketItem,
  BasketItemQuantity,
  BasketItemWithQuantity,
} from '@basket/shared';

export async function findAll(): Promise<BasketItem[]> {
  const result = await query<BasketItem>('SELECT * FROM basket_items ORDER BY id');
  return result.rows;
}

export async function findActive(): Promise<BasketItem[]> {
  const result = await query<BasketItem>(
    'SELECT * FROM basket_items WHERE is_active = true ORDER BY id',
  );
  return result.rows;
}

export async function findByKey(itemKey: string): Promise<BasketItem | null> {
  const result = await query<BasketItem>(
    'SELECT * FROM basket_items WHERE item_key = $1',
    [itemKey],
  );
  return result.rows[0] ?? null;
}

export async function findById(id: number): Promise<BasketItem | null> {
  const result = await query<BasketItem>(
    'SELECT * FROM basket_items WHERE id = $1',
    [id],
  );
  return result.rows[0] ?? null;
}

export async function findAllWithQuantity(month: string): Promise<BasketItemWithQuantity[]> {
  const result = await query<BasketItemWithQuantity>(
    `SELECT
       bi.*,
       biq.monthly_quantity,
       biq.effective_month
     FROM basket_items bi
     LEFT JOIN basket_item_quantities biq
       ON biq.basket_item_id = bi.id
       AND biq.effective_month = $1
     WHERE bi.is_active = true
     ORDER BY bi.id`,
    [month],
  );
  return result.rows;
}

export async function upsertQuantity(
  basketItemId: number,
  month: string,
  qty: number,
): Promise<BasketItemQuantity> {
  const result = await query<BasketItemQuantity>(
    `INSERT INTO basket_item_quantities (basket_item_id, effective_month, monthly_quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (basket_item_id, effective_month) DO UPDATE SET
       monthly_quantity = EXCLUDED.monthly_quantity,
       updated_at = NOW()
     RETURNING *`,
    [basketItemId, month, qty],
  );
  return result.rows[0];
}
