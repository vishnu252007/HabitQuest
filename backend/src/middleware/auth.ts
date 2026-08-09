import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ApiError } from './errorHandler';

// Extend Express Request to include userId
declare global {
  namespace Express {
    interface Request {
      userId: number;
    }
  }
}

export const authMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'No token provided', 'UNAUTHORIZED');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: number };
    req.userId = decoded.userId;
    next();
  } catch {
    throw new ApiError(401, 'Invalid or expired token', 'INVALID_TOKEN');
  }
};
