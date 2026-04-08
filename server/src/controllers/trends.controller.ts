import type { Request, Response } from 'express';
import type { TrendsResponse } from '@basket/shared';
import * as monthlySnapshotRepo from '../repositories/monthly-snapshot.repo.js';
import { config } from '../config.js';

export async function getTrends(_req: Request, res: Response): Promise<void> {
  const summaries = await monthlySnapshotRepo.findMonthSummaries();
  const sorted = [...summaries].sort((a, b) =>
    a.snapshot_month.localeCompare(b.snapshot_month),
  );

  const baselineMonth = config.baselineMonth;
  const baselineSummary = sorted.find((s) => s.snapshot_month === baselineMonth);
  const baselineTotal = baselineSummary?.basket_total ?? null;

  const index_series = sorted.map((s) => ({
    snapshot_month: s.snapshot_month,
    index_value:
      baselineTotal !== null && baselineTotal !== 0
        ? Number(((s.basket_total / baselineTotal) * 100).toFixed(1))
        : 100,
  }));

  const allDetails = await Promise.all(
    sorted.map((s) => monthlySnapshotRepo.findByMonth(s.snapshot_month)),
  );

  const item_breakdown = sorted.map((s, i) => ({
    snapshot_month: s.snapshot_month,
    items: allDetails[i],
  }));

  const response: TrendsResponse = {
    months: sorted,
    baseline_month: baselineMonth,
    index_series,
    item_breakdown,
  };

  res.json(response);
}
