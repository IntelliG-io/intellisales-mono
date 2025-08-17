import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { json, urlencoded } from 'express';
import healthRouter from './routes/health';
import authRouter from './routes/auth';
import * as swaggerUi from 'swagger-ui-express';
import swaggerSpec from './docs/swagger';

const app = express();

app.use(helmet());
app.use(cors({ origin: (process.env.ALLOWED_ORIGINS || '*').split(',') }));
app.use(json());
app.use(urlencoded({ extended: true }));

app.use('/health', healthRouter);
app.use('/auth', authRouter);

// API documentation endpoints
app.get('/docs.json', (_req, res) => {
  res.json(swaggerSpec);
});
app.use('/swagger', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/docs', (_req, res) => {
  res.setHeader('Content-Type', 'text/html');
  // Override Helmet CSP for this route to allow ReDoc CDN and inline init script
  res.setHeader(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' https://cdn.redoc.ly 'unsafe-inline'",
      "style-src 'self' https: 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' https: data:",
      "connect-src 'self'",
      "worker-src 'self' blob:",
      "child-src 'self' blob:",
    ].join('; ')
  );
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
        // Initialize ReDoc after the script loads
        document.addEventListener('DOMContentLoaded', function () {
          // @ts-ignore
          Redoc.init('/docs.json', {}, document.getElementById('redoc-container'));
        });
      </script>
    </body>
  </html>`);
});

app.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'backend', time: new Date().toISOString() });
});

// Not found handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  res.status(status).json({ error: message });
});

export default app;
