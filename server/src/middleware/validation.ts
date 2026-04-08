import { AppError } from './error-handler.js';
import type { Request, Response, NextFunction } from 'express';

export function validateBody(schema: Record<string, (v: unknown) => boolean>) {
  return (req: Request, _res: Response, next: NextFunction) => {
    for (const [key, validator] of Object.entries(schema)) {
      if (!validator(req.body[key])) {
        throw new AppError(400, 'VALIDATION_ERROR', `Invalid value for field: ${key}`);
      }
    }
    next();
  };
}
