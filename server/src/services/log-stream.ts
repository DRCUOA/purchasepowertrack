import type { Response } from 'express';

export interface LogEntry {
  timestamp: string;
  level: 'info' | 'warn' | 'error';
  message: string;
}

const clients = new Set<Response>();
const LOG_BUFFER_SIZE = 200;
const buffer: LogEntry[] = [];

function broadcast(entry: LogEntry): void {
  buffer.push(entry);
  if (buffer.length > LOG_BUFFER_SIZE) {
    buffer.splice(0, buffer.length - LOG_BUFFER_SIZE);
  }
  const data = `data: ${JSON.stringify(entry)}\n\n`;
  for (const res of clients) {
    res.write(data);
  }
}

export function addClient(res: Response): void {
  clients.add(res);
  for (const entry of buffer) {
    res.write(`data: ${JSON.stringify(entry)}\n\n`);
  }
}

export function removeClient(res: Response): void {
  clients.delete(res);
}

export function getRecentLogs(): LogEntry[] {
  return [...buffer];
}

const originalLog = console.log.bind(console);
const originalWarn = console.warn.bind(console);
const originalError = console.error.bind(console);

function formatArgs(args: unknown[]): string {
  return args
    .map((a) => (typeof a === 'string' ? a : JSON.stringify(a)))
    .join(' ');
}

export function installLogCapture(): void {
  console.log = (...args: unknown[]) => {
    originalLog(...args);
    broadcast({
      timestamp: new Date().toISOString(),
      level: 'info',
      message: formatArgs(args),
    });
  };

  console.warn = (...args: unknown[]) => {
    originalWarn(...args);
    broadcast({
      timestamp: new Date().toISOString(),
      level: 'warn',
      message: formatArgs(args),
    });
  };

  console.error = (...args: unknown[]) => {
    originalError(...args);
    broadcast({
      timestamp: new Date().toISOString(),
      level: 'error',
      message: formatArgs(args),
    });
  };
}
