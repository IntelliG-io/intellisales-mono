# Environment Configuration

This monorepo uses per-environment configuration files for backend (Node/Express + Prisma) and frontend (Next.js 14). Sensitive files are gitignored; only `*.example` files and this documentation are tracked.

- Backend reads environment via `dotenv` in `backend/src/index.ts`.
- Frontend (Next.js) reads environment via Next's built-in env file support.

## Files and precedence

- Root (backend):
  - `.env.development`, `.env.test`, `.env.production` (create locally; gitignored)
  - Set which file to load using `DOTENV_CONFIG_PATH` (recommended). Example: `.env.development`.
  - Fallback: `backend/src/index.ts` will try `../.env` if `DOTENV_CONFIG_PATH` is not set.
- Frontend (Next.js):
  - `.env.local` (all envs), `.env.development.local`, `.env.test.local`, `.env.production.local` (create under `frontend/`; gitignored)
  - Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.
- Examples (tracked):
  - Root: `.env.example`
  - Frontend: `frontend/.env.example`

## Variables (root .env)

- General
  - `NODE_ENV`: development | test | production
  - `TZ`: server timezone (e.g., `UTC`)
  - `DOTENV_CONFIG_PATH`: which env file to load (e.g., `.env.development`)

- Backend API
  - `BACKEND_PORT`: backend HTTP port (e.g., `4000`)
  - `BACKEND_URL`: public base URL for backend (used by Swagger/external services)
  - `API_BASE_URL`: base URL used in Swagger/OpenAPI docs if not provided
  - `ALLOWED_ORIGINS`: comma-separated CORS origins (e.g., `http://localhost:3000`)

- Secrets
  - `JWT_SECRET`: secret for JWT signing (generate strong value)
  - `SESSION_SECRET`: secret for session/cookies (if used)
  - Generate secrets: `openssl rand -base64 32`

- Database (Prisma / Postgres)
  - `DATABASE_URL` (required by Prisma): e.g., `postgres://user:pass@host:5432/db`
  - Optional:
    - `DB_CLIENT` (e.g., `postgres`)
    - `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`
  - Prisma runtime options (optional)
    - `PRISMA_CONNECTION_LIMIT`: sets `connection_limit` query param on `DATABASE_URL` (e.g., `10`)
    - `PRISMA_POOL_TIMEOUT`: sets `pool_timeout` query param on `DATABASE_URL` (ms, e.g., `10000`)
    - `PRISMA_LOG_QUERIES`: if not `0`, enables query event logging in development

- Cache / Queue (optional)
  - `REDIS_URL`: e.g., `redis://localhost:6379`

- Payments (optional)
  - `STRIPE_PUBLIC_KEY`, `STRIPE_SECRET_KEY`

## Variables (frontend .env.local)

- Server-side only vars (no `NEXT_PUBLIC_` prefix) are NOT sent to the browser.
- Public vars (exposed to browser) MUST be prefixed with `NEXT_PUBLIC_`:
  - `NEXT_PUBLIC_API_BASE_URL`: backend API base URL, e.g., `http://localhost:4000`
  - `NEXT_PUBLIC_APP_URL`: frontend base URL, e.g., `http://localhost:3000`

Optional convenience values:
  - `FRONTEND_PORT`: port for `next dev` (defaults to 3000 if not set)
  - `FRONTEND_URL`: public app URL

## Quick setup

1) Create root development env and set as default for backend

```bash
# From repo root
cp .env.example .env.development
# Edit values as needed
$EDITOR .env.development

# Use the file in backend by setting DOTENV_CONFIG_PATH
# Option A: export in your shell
export DOTENV_CONFIG_PATH=.env.development
# Option B: put it in your shell profile (~/.zshrc)
```

2) Create frontend development env

```bash
cd frontend
cp .env.example .env.development.local
# Edit values as needed
$EDITOR .env.development.local
```

3) Generate strong secrets (prod)

```bash
openssl rand -base64 32  # run twice for JWT and SESSION secrets
```

4) Test run

```bash
# Backend
npm run dev:backend
# Frontend (in another terminal)
npm run dev:frontend
```

## Example values

### Development (.env.development)

```
NODE_ENV=development
TZ=UTC
BACKEND_PORT=4000
BACKEND_URL=http://localhost:4000
API_BASE_URL=http://localhost:4000
ALLOWED_ORIGINS=http://localhost:3000
JWT_SECRET=dev-secret-change-me
SESSION_SECRET=dev-session-change-me
DATABASE_URL=postgres://pos_user:pos_password@localhost:5432/pos_db
REDIS_URL=redis://localhost:6379
COMPOSE_PROJECT_NAME=pos

# Prisma options (optional)
PRISMA_CONNECTION_LIMIT=10
PRISMA_POOL_TIMEOUT=10000
PRISMA_LOG_QUERIES=1
```

`frontend/.env.development.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Test (.env.test)
```
NODE_ENV=test
TZ=UTC
BACKEND_PORT=4100
BACKEND_URL=http://localhost:4100
API_BASE_URL=http://localhost:4100
ALLOWED_ORIGINS=http://localhost:3000
JWT_SECRET=test-secret-change-me
SESSION_SECRET=test-session-change-me
DATABASE_URL=postgres://pos_user:pos_password@localhost:5432/pos_db_test
REDIS_URL=redis://localhost:6379
COMPOSE_PROJECT_NAME=pos_test
```

`frontend/.env.test.local`:
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:4100
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

### Production (.env.production)
```
NODE_ENV=production
TZ=UTC
BACKEND_PORT=4000
BACKEND_URL=https://api.yourdomain.com
API_BASE_URL=https://api.yourdomain.com
ALLOWED_ORIGINS=https://app.yourdomain.com
JWT_SECRET=<generated-strong-secret>
SESSION_SECRET=<generated-strong-secret>
DATABASE_URL=postgres://user:pass@db-host:5432/prod_db
REDIS_URL=redis://redis-host:6379
COMPOSE_PROJECT_NAME=pos_prod
```

`frontend/.env.production.local`:
```
NEXT_PUBLIC_API_BASE_URL=https://api.yourdomain.com
NEXT_PUBLIC_APP_URL=https://app.yourdomain.com
```

## Security and version control

- `*.env`, `*.env.*`, and `frontend/*.env*` are already gitignored in the repo (`.gitignore`).
- Never commit real secrets. Use `.env.example` and `frontend/.env.example` as templates.
- Use a secrets manager (e.g., AWS Secrets Manager, GCP Secret Manager, 1Password) in production.

## Notes

- Prisma reads `DATABASE_URL` (see `backend/prisma/schema.prisma`).
- Backend reads env here: `backend/src/index.ts` and supports `DOTENV_CONFIG_PATH`.
- Next.js loads frontend env files automatically by environment.
