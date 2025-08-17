# Docker

This folder contains a Docker Compose setup for local development.

## Services

- Postgres (db)
- Redis (redis)
- Backend (Node 18 container that runs the backend workspace)
- Frontend (Node 18 container that runs the frontend workspace)

## Usage

```bash
# from repo root
docker compose -f docker/docker-compose.yml up -d

# logs
docker compose -f docker/docker-compose.yml logs -f backend

# stop
docker compose -f docker/docker-compose.yml down
```

The Node services mount the entire repository at `/workspace` and execute workspace scripts from the root `package.json`.
