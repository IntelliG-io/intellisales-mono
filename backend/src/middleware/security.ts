import cors from 'cors';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import { getServerEnv } from '../config/env';

export function applySecurity(app: any): void {
  const env = getServerEnv();

  const helmetOptions: Parameters<typeof helmet>[0] = env.isProd
    ? { contentSecurityPolicy: true }
    : { contentSecurityPolicy: false };
  app.use(helmet(helmetOptions));

  const originCfg = env.CORS_ORIGIN === '*'
    ? '*'
    : env.CORS_ORIGIN.split(',').map((s) => s.trim());

  app.use(cors({
    origin: originCfg as any,
    methods: env.CORS_METHODS,
    credentials: env.CORS_CREDENTIALS,
  }));

  app.use(json({ limit: env.JSON_BODY_LIMIT }));
  app.use(urlencoded({ extended: true }));
}
