import type { Request, Response } from 'express';
import type { DashboardResponse, FlaggedItem } from '@basket/shared';
import { getWeekStart } from '@basket/shared';
import * as monthlySnapshotRepo from '../repositories/monthly-snapshot.repo.js';
import * as priceObservationRepo from '../repositories/price-observation.repo.js';
import * as normalizedPriceRepo from '../repositories/normalized-price.repo.js';
import * as basketItemRepo from '../repositories/basket-item.repo.js';
import { config } from '../config.js';

export async function getDashboard(_req: Request, res: Response): Promise<void> {
  const [summaries, latestRefreshDate, currentWeekPrices, activeItems] = await Promise.all([
    monthlySnapshotRepo.findMonthSummaries(),
    priceObservationRepo.findLatestObservationDate(),
    normalizedPriceRepo.findCurrentWeek(),
    basketItemRepo.findActive(),
  ]);

  const sorted = [...summaries].sort((a, b) => b.snapshot_month.localeCompare(a.snapshot_month));
  const current = sorted[0] ?? null;
  const previous = sorted[1] ?? null;

  const currentTotal = current?.basket_total ?? null;
  const previousTotal = previous?.basket_total ?? null;

  let changeVsPrevious: number | null = null;
  let changeVsPreviousPct: number | null = null;
  if (currentTotal !== null && previousTotal !== null) {
    changeVsPrevious = Number((currentTotal - previousTotal).toFixed(2));
    changeVsPreviousPct =
      previousTotal !== 0
        ? Number(((changeVsPrevious / previousTotal) * 100).toFixed(2))
        : null;
  }

  const baselineMonth = config.baselineMonth;
  const baselineSummary = summaries.find((s) => s.snapshot_month === baselineMonth) ?? null;
  const baselineTotal = baselineSummary?.basket_total ?? null;

  let changeVsBaseline: number | null = null;
  let changeVsBaselinePct: number | null = null;
  if (currentTotal !== null && baselineTotal !== null) {
    changeVsBaseline = Number((currentTotal - baselineTotal).toFixed(2));
    changeVsBaselinePct =
      baselineTotal !== 0
        ? Number(((changeVsBaseline / baselineTotal) * 100).toFixed(2))
        : null;
  }

  const weekStart = getWeekStart(new Date());
  const priceItemIds = new Set(currentWeekPrices.map((p) => p.basket_item_id));

  const flaggedItems: FlaggedItem[] = activeItems
    .filter((item) => {
      const price = currentWeekPrices.find((p) => p.basket_item_id === item.id);
      return !price || price.observation_count < 2;
    })
    .map((item) => {
      const price = currentWeekPrices.find((p) => p.basket_item_id === item.id);
      return {
        basket_item_id: item.id,
        item_key: item.item_key,
        name: item.name,
        reason: !price
          ? `No price data for week ${weekStart}`
          : `Low observation count (${price.observation_count}) for week ${weekStart}`,
      };
    });

  const response: DashboardResponse = {
    current_basket_total: currentTotal,
    previous_month_total: previousTotal,
    change_vs_previous: changeVsPrevious,
    change_vs_previous_pct: changeVsPreviousPct,
    baseline_month: baselineMonth,
    baseline_total: baselineTotal,
    change_vs_baseline: changeVsBaseline,
    change_vs_baseline_pct: changeVsBaselinePct,
    latest_refresh_date: latestRefreshDate ?? null,
    item_count: activeItems.length,
    flagged_items: flaggedItems,
  };

  res.json(response);
}
