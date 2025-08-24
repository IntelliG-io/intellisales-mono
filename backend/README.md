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

## Architecture Overview

* __Layered structure__: `routes/` (HTTP + Swagger) → `controllers/` (request orchestration) → `services/` (business logic) → `repositories/` (data access via Prisma).
* __Error handling__: repositories map Prisma errors to `DuplicateError`, `NotFoundError`, `DatabaseError`; services/controllers convert to `HttpError` responses.

## Repository Pattern

* __Location__: `src/repositories/*`
* __Purpose__: Encapsulate all Prisma access to improve testability and maintainability.
* __Implemented__: `userRepository`, `storeRepository`, and `productRepository`.
* __ProductRepository API__ (`src/repositories/productRepository.ts`):
  - `findById`, `findFirstByName`, `findFirstByNameExcludingId`
  - `findMany(filter, options)`, `count(filter)`
  - `create(data)`, `update(id, data)`, `softDelete(id)`

## Products Module

* __Services__: `src/services/products/{list,create,update,remove}.ts`
  - All refactored to use `createProductRepository(prisma)` instead of direct Prisma usage.
  - Shared validation helpers in `src/services/products/common.ts` also use the repository.
* __Controllers__: `src/controllers/products/*` call services; routes keep Swagger docs in `src/routes/products/*`.

## Testing

* __Unit tests__: under `src/__tests__/repositories/*` and route/controller tests under `src/__tests__/routes/*`.
* Added `productRepository.test.ts` covering CRUD, filtering, pagination, soft delete, and error mapping.
