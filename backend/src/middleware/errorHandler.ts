import { Request, Response, NextFunction } from 'express';

export interface CustomError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  code?: number;
  keyValue?: Record<string, any>;
}

export const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode ?? 500;
  const status = err.status ?? 'error';

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = err.keyValue ? Object.keys(err.keyValue)[0] : 'field';
    res.status(409).json({
      success: false,
      status,
      message: `${field} already exists`,
      field,
    });
    return;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError' && err instanceof Error) {
    const errors = Object.values((err as any).errors || {}).map(
      (e: any) => e.message
    );

    res.status(400).json({
      success: false,
      status,
      message: 'Validation failed',
      errors,
    });
    return;
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      status,
      message: 'Invalid data format',
    });
    return;
  }

  // JWT invalid token
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      status,
      message: 'Invalid token',
    });
    return;
  }

  // JWT expired token
  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      status,
      message: 'Token expired',
    });
    return;
  }

  // Default error
  res.status(statusCode).json({
    success: false,
    status,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
