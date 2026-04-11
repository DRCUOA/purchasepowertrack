import type { Request, Response } from 'express';
import type { RunHistoryResponse } from '@basket/shared';
import * as runHistoryRepo from '../repositories/run-history.repo.js';
import { AppError } from '../middleware/error-handler.js';

export async function getHistory(req: Request, res: Response): Promise<void> {
  const limit = Math.min(Number(req.query.limit) || 50, 200);
  const runs = await runHistoryRepo.findAll(limit);
  const response: RunHistoryResponse = { runs };
  res.json(response);
}

export async function deleteRun(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id <= 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid run id');
  }
  const deleted = await runHistoryRepo.deleteById(id);
  if (!deleted) {
    throw new AppError(404, 'NOT_FOUND', 'Run not found');
  }
  res.json({ deleted: true });
}
