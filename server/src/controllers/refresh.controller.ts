import type { Request, Response } from 'express';
import type { RefreshRunResponse, SnapshotRunResponse } from '@basket/shared';
import { getCurrentMonth } from '@basket/shared';
import * as refreshService from '../services/refresh.service.js';
import * as snapshotService from '../services/snapshot.service.js';
import { AppError } from '../middleware/error-handler.js';

export async function runRefresh(_req: Request, res: Response): Promise<void> {
  const result: RefreshRunResponse = await refreshService.runRefresh();
  res.json(result);
}

export async function runSnapshot(req: Request, res: Response): Promise<void> {
  const month = (req.body as { month?: string }).month ?? getCurrentMonth();

  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'month must match YYYY-MM format');
  }

  const result: SnapshotRunResponse = await snapshotService.runSnapshot(month);
  res.json(result);
}
