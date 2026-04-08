import { Router, type Request, type Response } from 'express';
import { addClient, removeClient, getRecentLogs } from '../services/log-stream.js';

export const logsRoutes = Router();

logsRoutes.get('/stream', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  res.write('\n');
  addClient(res);

  req.on('close', () => {
    removeClient(res);
  });
});

logsRoutes.get('/recent', (_req: Request, res: Response) => {
  res.json(getRecentLogs());
});
