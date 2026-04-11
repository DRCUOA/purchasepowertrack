import express from 'express';
import cors from 'cors';
import { errorHandler } from './middleware/error-handler.js';
import { serveClientApp } from './middleware/static-files.js';
import { basketRoutes } from './routes/basket.routes.js';
import { priceRoutes } from './routes/price.routes.js';
import { dashboardRoutes } from './routes/dashboard.routes.js';
import { refreshRoutes } from './routes/refresh.routes.js';
import { settingsRoutes } from './routes/settings.routes.js';
import { trendsRoutes } from './routes/trends.routes.js';
import { historyRoutes } from './routes/history.routes.js';
import { logsRoutes } from './routes/logs.routes.js';
import { config } from './config.js';

export function createApp(): express.Application {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/api/basket-items', basketRoutes);
  app.use('/api/prices', priceRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/refresh', refreshRoutes);
  app.use('/api/settings', settingsRoutes);
  app.use('/api/trends', trendsRoutes);
  app.use('/api/history', historyRoutes);
  app.use('/api/logs', logsRoutes);

  app.use(errorHandler);

  if (config.nodeEnv === 'production') {
    serveClientApp(app);
  }

  return app;
}
