# Express Backend (TypeScript)

Scalable Express server with security, structured routing, logging, typed errors, and graceful shutdown.

## Features

- Security: `helmet` (CSP in prod), `cors` from env, JSON/urlencoded parsers
- Logging: `pino-http` with request IDs, redaction, pretty logs in dev
- Routing: health (`/health`, `/ready`) and API under `/v1`
- Errors: typed `HttpError`, 404 + centralized error handler (hides stack in prod)
- Graceful shutdown: drains connections on SIGINT/SIGTERM with timeout
- Strict env config: parsed via `src/config/env.ts`

## Endpoints

- GET `/health` -> `{ status: 'ok', uptime, timestamp }`
- GET `/ready` -> `{ status: 'ok' }`
- GET `/v1/echo` -> echoes query/headers
- POST `/v1/echo` -> echoes body/headers

## Environment

Server/runtime:
- `NODE_ENV` (development|test|production)
- `PORT` (default 3000) [fallback: `BACKEND_PORT`]
- `HOST` (default `0.0.0.0`)
- `LOG_LEVEL` (default `info`)
- `JSON_BODY_LIMIT` (default `1mb`)
- `TRUST_PROXY` (true|false)

CORS:
- `CORS_ORIGIN` (e.g., `*` or `http://localhost:3000,https://app.example.com`) [fallback: `ALLOWED_ORIGINS`]
- `CORS_METHODS` (default `GET,POST,PUT,PATCH,DELETE,OPTIONS`)
- `CORS_CREDENTIALS` (true|false)

Auth/JWT and DB variables are documented in `../../documentation/ENVIRONMENT.md`.

## Run

Dev:
```bash
npm run dev -w backend
```

Build & start:
```bash
npm run build -w backend
npm start -w backend
```

Tests:
```bash
npm test -w backend
```
