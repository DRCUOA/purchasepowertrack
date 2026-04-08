import type { Request, Response } from 'express';
import type {
  CurrentPricesResponse,
  PriceHistoryResponse,
  PriceEvidenceResponse,
} from '@basket/shared';
import { getWeekStart } from '@basket/shared';
import * as normalizedPriceRepo from '../repositories/normalized-price.repo.js';
import * as basketItemRepo from '../repositories/basket-item.repo.js';
import * as priceObservationRepo from '../repositories/price-observation.repo.js';
import { AppError } from '../middleware/error-handler.js';

export async function getCurrentPrices(_req: Request, res: Response): Promise<void> {
  const weekStart = getWeekStart(new Date());

  const [normalizedPrices, activeItems] = await Promise.all([
    normalizedPriceRepo.findCurrentWeek(),
    basketItemRepo.findActive(),
  ]);

  const itemMap = new Map(activeItems.map((item) => [item.id, item]));

  const prices = normalizedPrices
    .map((np) => {
      const item = itemMap.get(np.basket_item_id);
      if (!item) return null;
      return {
        basket_item_id: np.basket_item_id,
        item_key: item.item_key,
        name: item.name,
        unit_label: item.unit_label,
        canonical_unit_price: np.canonical_unit_price,
        observation_count: np.observation_count,
        accepted_count: np.accepted_count,
      };
    })
    .filter((p): p is NonNullable<typeof p> => p !== null);

  const response: CurrentPricesResponse = {
    week_start: weekStart,
    prices,
  };

  res.json(response);
}

export async function getPriceHistory(req: Request, res: Response): Promise<void> {
  const itemKey = req.query.item_key;

  if (typeof itemKey !== 'string' || !itemKey) {
    throw new AppError(400, 'VALIDATION_ERROR', 'item_key query parameter is required');
  }

  const item = await basketItemRepo.findByKey(itemKey);
  if (!item) {
    throw new AppError(404, 'NOT_FOUND', `Basket item not found: ${itemKey}`);
  }

  const history = await normalizedPriceRepo.findByItemKey(itemKey);

  const response: PriceHistoryResponse = {
    item_key: itemKey,
    history: history.map((h) => ({
      week_start: h.week_start,
      canonical_unit_price: h.canonical_unit_price,
      observation_count: h.observation_count,
    })),
  };

  res.json(response);
}

export async function getPriceEvidence(req: Request, res: Response): Promise<void> {
  const itemKey = String(req.params.itemKey);
  const rawWeekStart = req.query.week_start;

  if (typeof rawWeekStart !== 'string' || !rawWeekStart) {
    throw new AppError(400, 'VALIDATION_ERROR', 'week_start query parameter is required');
  }
  const weekStart: string = rawWeekStart;

  const item = await basketItemRepo.findByKey(itemKey);
  if (!item) {
    throw new AppError(404, 'NOT_FOUND', `Basket item not found: ${itemKey}`);
  }

  const [observations, normalizedPrice] = await Promise.all([
    priceObservationRepo.findByItemAndWeek(item.id, weekStart),
    normalizedPriceRepo.findByItemAndWeek(item.id, weekStart),
  ]);

  const response: PriceEvidenceResponse = {
    item_key: itemKey,
    week_start: weekStart,
    observations,
    normalized_price: normalizedPrice ?? null,
  };

  res.json(response);
}
