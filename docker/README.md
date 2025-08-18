# Docker

Local development environment with Docker Compose.

## Services

- Postgres (service `db`) on port 5432 with persistent volume `pgdata`
- Redis (service `redis`) on port 6379 with persistent volume `redisdata`
- Backend (service `backend`) Node 18 running repo workspace script on port 4000
- Frontend (service `frontend`) Node 18 with Next.js dev server on port 3000
- Prisma Studio (service `studio`) on port 5555 for DB browsing

All services share a dedicated Docker network `devnet` for internal DNS resolution (`db`, `redis`, `backend`, `frontend`).

## Prerequisites

1. Create root development env file (used by db/backend/frontend):

```bash
cp .env.example .env.development
$EDITOR .env.development
```

2. (Optional) Create frontend env file to override/add variables for Next.js dev:

```bash
cd frontend
cp .env.example .env.development.local
$EDITOR .env.development.local
```

Notes:
- Backend loads `DOTENV_CONFIG_PATH=/workspace/.env.development` inside the container.
- Compose also passes selected vars via `env_file` and `environment`.
- Frontend public vars can be set via `NEXT_PUBLIC_*` in `frontend/.env.development.local` or passed from compose.

## Usage

```bash
# from repo root
docker compose -f docker/docker-compose.yml up -d

# follow logs
docker compose -f docker/docker-compose.yml logs -f backend

# stop (keeps DB/Redis volumes)
docker compose -f docker/docker-compose.yml down

# optional: remove persistent volumes
docker compose -f docker/docker-compose.yml down -v
```

### Prisma Studio

```bash
# start Studio
docker compose -f docker/docker-compose.yml up -d studio

# open http://localhost:5555
```

## Ports

- Postgres: host 5432 -> container 5432
- Redis: host 6379 -> container 6379
- Backend: host 4000 -> container 4000 (configurable via BACKEND_PORT)
- Frontend: host 3000 -> container 3000 (configurable via FRONTEND_PORT)
- Prisma Studio: host 5555 -> container 5555

## Healthchecks

- Postgres: `pg_isready`
- Redis: `redis-cli ping`

## Environment and networking

- Internal services use DNS names `db` and `redis`. Example DB URL used in compose:
  `postgres://$DB_USER:$DB_PASSWORD@db:5432/$DB_NAME`
- CORS defaults to `http://localhost:3000`. Adjust `ALLOWED_ORIGINS` if needed.

## Prisma and seeding

Common commands (run from repo root):

```bash
# Generate Prisma Client
npm run prisma:generate

# Apply schema (or use migrate in dev)
npm run db:push

# Open Prisma Studio (via compose service)
docker compose -f docker/docker-compose.yml up -d studio

# Seed database (idempotent)
npm run seed
```
