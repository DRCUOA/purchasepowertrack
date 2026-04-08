import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import * as settingsController from '../controllers/settings.controller.js';

export const settingsRoutes = Router();

settingsRoutes.get('/', asyncHandler(settingsController.getSettings));
