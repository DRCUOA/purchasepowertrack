import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export function serveClientApp(app: express.Application): void {
  const clientDist = path.resolve(__dirname, '../../../client/dist');

  app.use(express.static(clientDist));

  app.get('*', (_req, res, next) => {
    if (_req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}
