import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import * as trendsController from '../controllers/trends.controller.js';

export const trendsRoutes = Router();

trendsRoutes.get('/', asyncHandler(trendsController.getTrends));
