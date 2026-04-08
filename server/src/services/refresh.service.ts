import type {
  RefreshRunResponse,
  PriceObservationInsert,
  PriceObservation,
} from '@basket/shared';
import { getWeekStart, computeMedian } from '@basket/shared';
import { config } from '../config.js';
import { getEnabledAdapters } from '../adapters/retailers/index.js';
import { runWithConcurrency } from '../lib/run-with-concurrency.js';
import * as basketItemRepo from '../repositories/basket-item.repo.js';
import * as priceObservationRepo from '../repositories/price-observation.repo.js';
import * as normalizedPriceRepo from '../repositories/normalized-price.repo.js';
import { reviewPendingObservations } from './review.service.js';

/** LLM review calls are the dominant cost; cap parallel calls to reduce rate-limit risk */
const REVIEW_CONCURRENCY = 4;

export async function runRefresh(): Promise<RefreshRunResponse> {
  const startTime = Date.now();
  const errors: string[] = [];
  let totalObservations = 0;
  let totalReviewed = 0;

  const items = await basketItemRepo.findActive();
  if (items.length === 0) {
    console.warn('[Refresh] No active basket items found');
    return {
      status: 'completed',
      observations_collected: 0,
      observations_reviewed: 0,
      errors: [],
      duration_ms: Date.now() - startTime,
    };
  }

  const adapters = getEnabledAdapters(config.enabledRetailers as string[]);
  if (adapters.length === 0) {
    console.warn('[Refresh] No enabled retailer adapters');
    return {
      status: 'completed',
      observations_collected: 0,
      observations_reviewed: 0,
      errors: ['No enabled retailer adapters'],
      duration_ms: Date.now() - startTime,
    };
  }

  // Phase 1: Fetch prices from all adapters (independent I/O — run in parallel)
  const allObservations: PriceObservationInsert[] = [];

  const fetchResults = await Promise.allSettled(
    adapters.map(async (adapter) => {
      console.log(`[Refresh] Fetching prices from ${adapter.retailerName}...`);
      const obs = await adapter.fetchPrices(items);
      console.log(`[Refresh] ${adapter.retailerName}: ${obs.length} observations collected`);
      return obs;
    }),
  );

  for (let i = 0; i < fetchResults.length; i++) {
    const r = fetchResults[i]!;
    const adapter = adapters[i]!;
    if (r.status === 'fulfilled') {
      allObservations.push(...r.value);
    } else {
      const err = r.reason;
      const msg = `Failed to fetch from ${adapter.retailerName}: ${err instanceof Error ? err.message : String(err)}`;
      console.error(`[Refresh] ${msg}`);
      errors.push(msg);
    }
  }

  // Phase 2: Store observations
  if (allObservations.length > 0) {
    try {
      await priceObservationRepo.insertBatch(allObservations);
      totalObservations = allObservations.length;
      console.log(`[Refresh] Stored ${totalObservations} observations`);
    } catch (err) {
      const msg = `Failed to store observations: ${err instanceof Error ? err.message : String(err)}`;
      console.error(`[Refresh] ${msg}`);
      errors.push(msg);
    }
  }

  // Phase 3: Review pending observations per item (bounded parallel LLM calls)
  const itemsWithNewObs = new Set(allObservations.map((o) => o.basket_item_id));
  const itemById = new Map(items.map((it) => [it.id, it]));
  const itemIdsToReview = Array.from(itemsWithNewObs);

  const reviewResults = await runWithConcurrency(
    itemIdsToReview,
    async (itemId) => {
      try {
        return await reviewPendingObservations(itemId, itemById.get(itemId));
      } catch (err) {
        const msg = `Review failed for item ${itemId}: ${err instanceof Error ? err.message : String(err)}`;
        console.error(`[Refresh] ${msg}`);
        errors.push(msg);
        return { reviewed: 0 };
      }
    },
    REVIEW_CONCURRENCY,
  );

  for (const result of reviewResults) {
    totalReviewed += result.reviewed;
  }

  // Phase 4: Compute normalized prices — one DB read for the week, then parallel upserts
  const weekStart = getWeekStart(new Date());
  const weekRows = await priceObservationRepo.findByWeekForBasketItems(
    items.map((i) => i.id),
    weekStart,
  );
  const weekObsByItemId = new Map<number, PriceObservation[]>();
  for (const row of weekRows) {
    const bid = row.basket_item_id;
    const list = weekObsByItemId.get(bid);
    if (list) list.push(row);
    else weekObsByItemId.set(bid, [row]);
  }

  const normResults = await Promise.allSettled(
    items.map(async (item) => {
      const weekObs = weekObsByItemId.get(item.id);
      if (!weekObs || weekObs.length === 0) return;

      const accepted = weekObs.filter((o) => o.review_status === 'accepted');
      const rejected = weekObs.filter((o) => o.review_status === 'rejected');

      if (accepted.length === 0) return;

      const prices = accepted.map((o) => {
        const reviewPayload = o.review_payload as Record<string, unknown> | null;
        const normalizedPrice =
          typeof reviewPayload?.normalized_unit_price === 'number'
            ? reviewPayload.normalized_unit_price
            : o.raw_price;
        return normalizedPrice;
      });

      const canonicalPrice = computeMedian(prices);

      await normalizedPriceRepo.upsert({
        basket_item_id: item.id,
        week_start: weekStart,
        canonical_unit_price: canonicalPrice,
        observation_count: weekObs.length,
        accepted_count: accepted.length,
        rejected_count: rejected.length,
        method: 'llm-median',
        source_detail: {
          accepted_prices: prices,
          median: canonicalPrice,
        },
      });

      console.log(
        `[Refresh] Normalized price for "${item.name}": $${canonicalPrice.toFixed(2)} (${accepted.length} accepted, ${rejected.length} rejected)`,
      );
    }),
  );

  for (let i = 0; i < normResults.length; i++) {
    const r = normResults[i]!;
    if (r.status === 'rejected') {
      const item = items[i]!;
      const err = r.reason;
      const msg = `Normalization failed for item "${item.name}": ${err instanceof Error ? err.message : String(err)}`;
      console.error(`[Refresh] ${msg}`);
      errors.push(msg);
    }
  }

  const durationMs = Date.now() - startTime;
  const status: RefreshRunResponse['status'] =
    errors.length === 0 ? 'completed' : totalObservations > 0 ? 'partial' : 'failed';

  console.log(
    `[Refresh] Finished in ${durationMs}ms — ${totalObservations} collected, ${totalReviewed} reviewed, ${errors.length} errors`,
  );

  return {
    status,
    observations_collected: totalObservations,
    observations_reviewed: totalReviewed,
    errors,
    duration_ms: durationMs,
  };
}
