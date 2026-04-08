import type { Request, Response } from 'express';
import type { BasketItemsResponse, UpdateQuantityRequest } from '@basket/shared';
import { getCurrentMonth } from '@basket/shared';
import * as basketItemRepo from '../repositories/basket-item.repo.js';
import { AppError } from '../middleware/error-handler.js';

export async function listBasketItems(_req: Request, res: Response): Promise<void> {
  const currentMonth = getCurrentMonth();
  const items: BasketItemsResponse = await basketItemRepo.findAllWithQuantity(currentMonth);
  res.json(items);
}

export async function getBasketItem(req: Request, res: Response): Promise<void> {
  const itemKey = String(req.params.itemKey);
  const item = await basketItemRepo.findByKey(itemKey);
  if (!item) {
    throw new AppError(404, 'NOT_FOUND', `Basket item not found: ${itemKey}`);
  }
  res.json(item);
}

export async function updateQuantity(req: Request, res: Response): Promise<void> {
  const id = parseInt(String(req.params.id), 10);
  if (Number.isNaN(id)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'Invalid basket item id');
  }

  const { monthly_quantity, effective_month } = req.body as UpdateQuantityRequest;

  if (typeof monthly_quantity !== 'number' || monthly_quantity < 0) {
    throw new AppError(400, 'VALIDATION_ERROR', 'monthly_quantity must be a non-negative number');
  }

  if (typeof effective_month !== 'string' || !/^\d{4}-\d{2}$/.test(effective_month)) {
    throw new AppError(400, 'VALIDATION_ERROR', 'effective_month must match YYYY-MM format');
  }

  const existing = await basketItemRepo.findById(id);
  if (!existing) {
    throw new AppError(404, 'NOT_FOUND', `Basket item not found: ${id}`);
  }

  const result = await basketItemRepo.upsertQuantity(id, effective_month, monthly_quantity);
  res.json(result);
}
