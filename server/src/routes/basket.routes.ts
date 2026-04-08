import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import { validateBody } from '../middleware/validation.js';
import * as basketController from '../controllers/basket.controller.js';

export const basketRoutes = Router();

basketRoutes.get('/', asyncHandler(basketController.listBasketItems));

basketRoutes.get('/:itemKey', asyncHandler(basketController.getBasketItem));

basketRoutes.patch(
  '/:id/quantity',
  validateBody({
    monthly_quantity: (v) => typeof v === 'number' && v >= 0,
    effective_month: (v) => typeof v === 'string' && /^\d{4}-\d{2}$/.test(v),
  }),
  asyncHandler(basketController.updateQuantity),
);
