import type { Request, Response, NextFunction } from 'express';
import type { ApiErrorBody } from '@basket/shared';

export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    const body: ApiErrorBody = {
      error: {
        code: err.code,
        message: err.message,
        details: err.details,
      },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  console.error('Unhandled error:', err);
  const body: ApiErrorBody = {
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  };
  res.status(500).json(body);
}
