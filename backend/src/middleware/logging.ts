import pinoHttp from 'pino-http';
import type { RequestHandler } from 'express';
import { getServerEnv } from '../config/env';

function genReqId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createHttpLogger(): RequestHandler {
  const env = getServerEnv();
  const transport = env.isDev ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } } : undefined;
  return pinoHttp({
    level: env.LOG_LEVEL as any,
    genReqId,
    redact: {
      paths: ['req.headers.authorization', 'res.headers["set-cookie"]'],
      remove: true,
    },
    transport: transport as any,
    customLogLevel: function (res: any, err: any) {
      if (err || res.statusCode >= 500) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
  });
}
