import type { ErrorRequestHandler, RequestHandler } from 'express';
import { getServerEnv } from '../config/env';

export class HttpError extends Error {
  status: number;
  code: string;
  constructor(status: number, code: string, message: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ status: 404, code: 'NOT_FOUND', message: 'Not Found' });
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const env = getServerEnv();
  const status = (err && typeof err.status === 'number') ? err.status : 500;
  const code = (err && typeof err.code === 'string') ? err.code : 'INTERNAL_ERROR';
  const message = err?.message || 'Internal Server Error';
  const body: { status: number; code: string; message: string; requestId?: string; stack?: string } = {
    status,
    code,
    message,
  };

  const reqAny = req as any;
  if (reqAny.id) body.requestId = String(reqAny.id);
  if (!env.isProd && err?.stack) body.stack = err.stack;

  if ((req as any).log && typeof (req as any).log.error === 'function') {
    (req as any).log.error({ err }, 'request_error');
  }

  res.status(status).json(body);
};
