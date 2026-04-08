import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import * as refreshController from '../controllers/refresh.controller.js';

export const refreshRoutes = Router();

refreshRoutes.post('/run', asyncHandler(refreshController.runRefresh));

refreshRoutes.post('/monthly-snapshot/run', asyncHandler(refreshController.runSnapshot));
