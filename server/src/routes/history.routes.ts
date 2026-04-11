import { Router } from 'express';
import { asyncHandler } from '../middleware/async-handler.js';
import * as historyController from '../controllers/history.controller.js';

export const historyRoutes = Router();

historyRoutes.get('/', asyncHandler(historyController.getHistory));
historyRoutes.delete('/:id', asyncHandler(historyController.deleteRun));
