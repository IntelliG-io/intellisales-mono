import express, { type Request, type Response } from 'express';
import * as swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger';
import apiRouter from './routes/index';
import health from './routes/system/health';
import ready from './routes/system/ready';
import { applySecurity } from './middleware/security';
import { createHttpLogger } from './middleware/logging';
import { errorHandler, notFoundHandler } from './middleware/error';
import { getServerEnv } from './config/env';

const env = getServerEnv();
const app = express();

// security headers (helmet)
applySecurity(app);
// request id + logger
app.use(createHttpLogger());

// routes
app.use(health); // exposes /health
app.use(ready); // exposes /ready
app.use('/v1', apiRouter);
app.use('/api', apiRouter);

// API documentation endpoints (keep existing)
app.get('/docs.json', (_req: Request, res: Response) => {
  res.json(swaggerSpec);
});
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/docs', (_req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/html');
  const csp = env.isProd ? undefined : [
    "default-src 'self'",
    "script-src 'self' https://cdn.redoc.ly 'unsafe-inline'",
    "style-src 'self' https: 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self' https: data:",
    "connect-src 'self'",
    "worker-src 'self' blob:",
    "child-src 'self' blob:",
  ].join('; ');
  if (csp) res.setHeader('Content-Security-Policy', csp);
  res.send(`<!DOCTYPE html>
  <html>
    <head>
      <title>POS Backend API Docs</title>
      <meta charset="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <style>body { margin: 0; padding: 0; }</style>
    </head>
    <body>
      <div id="redoc-container"></div>
      <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
      <script>
        document.addEventListener('DOMContentLoaded', function () {
          // @ts-ignore
          Redoc.init('/docs.json', {}, document.getElementById('redoc-container'));
        });
      </script>
    </body>
  </html>`);
});

// 404 handler
app.use(notFoundHandler);

// error handler (last)
app.use(errorHandler);

export default app;
