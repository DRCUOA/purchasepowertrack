import type { SnapshotRunResponse, RunHistoryItemSnapshot } from '@basket/shared';
import { getCurrentMonth, DEFAULT_MONTHLY_QUANTITIES } from '@basket/shared';
import * as basketItemRepo from '../repositories/basket-item.repo.js';
import * as normalizedPriceRepo from '../repositories/normalized-price.repo.js';
import * as monthlySnapshotRepo from '../repositories/monthly-snapshot.repo.js';
import * as runHistoryRepo from '../repositories/run-history.repo.js';

export async function runSnapshot(month?: string): Promise<SnapshotRunResponse> {
  const startTime = Date.now();
  const snapshotMonth = month ?? getCurrentMonth();

  const items = await basketItemRepo.findAllWithQuantity(snapshotMonth);
  if (items.length === 0) {
    console.warn(`[Snapshot] No active basket items for ${snapshotMonth}`);
    return {
      status: 'completed',
      snapshot_month: snapshotMonth,
      items_snapshotted: 0,
      basket_total: 0,
    };
  }

  let basketTotal = 0;
  let itemsSnapshotted = 0;
  const historyItems: RunHistoryItemSnapshot[] = [];

  for (const item of items) {
    const latestPrice = await normalizedPriceRepo.findLatestByItem(item.id);
    const unitPrice = latestPrice?.canonical_unit_price ?? 0;

    if (unitPrice === 0) {
      console.warn(
        `[Snapshot] No normalized price for "${item.name}" (${item.item_key}), using $0`,
      );
    }

    const quantity =
      item.monthly_quantity ?? DEFAULT_MONTHLY_QUANTITIES[item.item_key] ?? 1;
    const lineTotal = Number((quantity * unitPrice).toFixed(2));

    await monthlySnapshotRepo.upsert({
      snapshot_month: snapshotMonth,
      basket_item_id: item.id,
      quantity,
      unit_price: unitPrice,
      line_total: lineTotal,
      normalized_price_id: latestPrice?.id ?? null,
    });

    historyItems.push({
      item_key: item.item_key,
      name: item.name,
      unit_price: unitPrice,
      quantity,
      line_total: lineTotal,
    });

    basketTotal += lineTotal;
    itemsSnapshotted++;
  }

  basketTotal = Number(basketTotal.toFixed(2));

  console.log(
    `[Snapshot] ${snapshotMonth}: ${itemsSnapshotted} items, basket total $${basketTotal.toFixed(2)}`,
  );

  try {
    await runHistoryRepo.insert({
      run_type: 'snapshot',
      started_at: new Date(startTime),
      completed_at: new Date(),
      status: 'completed',
      basket_total: basketTotal,
      item_count: itemsSnapshotted,
      summary: { snapshot_month: snapshotMonth },
      items: historyItems,
    });
  } catch (err) {
    console.error('[Snapshot] Failed to log run history:', err);
  }

  return {
    status: 'completed',
    snapshot_month: snapshotMonth,
    items_snapshotted: itemsSnapshotted,
    basket_total: basketTotal,
  };
}
