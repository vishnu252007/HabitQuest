import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp: string;
}

export const sendSuccess = <T>(res: Response, data: T, statusCode = 200): Response => {
  return res.status(statusCode).json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  } satisfies ApiResponse<T>);
};

export const sendError = (
  res: Response,
  error: string,
  statusCode = 400,
  code = 'ERROR'
): Response => {
  return res.status(statusCode).json({
    success: false,
    error,
    code,
    timestamp: new Date().toISOString(),
  } satisfies ApiResponse);
};

export const sendPaginated = <T>(
  res: Response,
  data: T[],
  total: number,
  page: number,
  limit: number,
  statusCode = 200
): Response => {
  return res.status(statusCode).json({
    success: true,
    data,
    pagination: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    },
    timestamp: new Date().toISOString(),
  });
};
