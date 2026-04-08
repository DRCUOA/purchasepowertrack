import { pool, query } from './pool.js';
import {
  STARTER_BASKET,
  DEFAULT_MONTHLY_QUANTITIES,
  getCurrentMonth,
} from '@basket/shared';

async function seedBasketItems(): Promise<void> {
  console.log('[seed] Upserting basket items…');

  for (const item of STARTER_BASKET) {
    await query(
      `INSERT INTO basket_items (item_key, name, unit_label, category)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (item_key) DO UPDATE SET
         name = EXCLUDED.name,
         unit_label = EXCLUDED.unit_label,
         category = EXCLUDED.category,
         updated_at = NOW()`,
      [item.item_key, item.name, item.unit_label, item.category],
    );
    console.log(`[seed]   ${item.item_key}`);
  }
}

async function seedDefaultQuantities(): Promise<void> {
  const month = getCurrentMonth();
  console.log(`[seed] Upserting default quantities for ${month}…`);

  for (const [itemKey, qty] of Object.entries(DEFAULT_MONTHLY_QUANTITIES)) {
    const itemResult = await query<{ id: number }>(
      'SELECT id FROM basket_items WHERE item_key = $1',
      [itemKey],
    );
    if (itemResult.rows.length === 0) {
      console.warn(`[seed]   Skipping unknown item_key: ${itemKey}`);
      continue;
    }

    const basketItemId = itemResult.rows[0].id;
    await query(
      `INSERT INTO basket_item_quantities (basket_item_id, effective_month, monthly_quantity)
       VALUES ($1, $2, $3)
       ON CONFLICT (basket_item_id, effective_month) DO UPDATE SET
         monthly_quantity = EXCLUDED.monthly_quantity,
         updated_at = NOW()`,
      [basketItemId, month, qty],
    );
    console.log(`[seed]   ${itemKey} → ${qty}/mo`);
  }
}

async function run(): Promise<void> {
  console.log('[seed] Starting seed…');
  await seedBasketItems();
  await seedDefaultQuantities();
  console.log('[seed] Done.');
}

run()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('[seed] Fatal error:', err);
    process.exit(1);
  });
