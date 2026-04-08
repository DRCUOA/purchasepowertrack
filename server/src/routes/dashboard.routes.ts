import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import * as dashboardController from '../controllers/dashboard.controller.js';

export const dashboardRoutes = Router();

dashboardRoutes.get('/', asyncHandler(dashboardController.getDashboard));
