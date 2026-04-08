import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import * as priceController from '../controllers/price.controller.js';

export const priceRoutes = Router();

priceRoutes.get('/current', asyncHandler(priceController.getCurrentPrices));

priceRoutes.get('/history', asyncHandler(priceController.getPriceHistory));

priceRoutes.get('/evidence/:itemKey', asyncHandler(priceController.getPriceEvidence));
