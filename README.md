# POS Monorepo

A monorepo for a Point-of-Sale (POS) system containing:

- backend
- frontend
- database
- docker
- documentation

This repository uses npm workspaces to manage backend and frontend as separate packages.

## Requirements

- Node.js >= 18
- npm >= 9
- Docker & Docker Compose (optional, for containers)

## Getting Started

1. Clone the repository
2. Create your environment file
   - Copy `.env.example` to `.env` and adjust values as needed
3. Install dependencies for all workspaces

```bash
npm install
```

4. Run services during development (placeholders included)

```bash
# Backend (http://localhost:4000)
npm run dev:backend

# Frontend (http://localhost:5173)
npm run dev:frontend
```

5. Using Docker (optional)

```bash
# from repo root
docker compose -f docker/docker-compose.yml up -d
```

## Workspace Commands

- Install all: `npm install`
- Run backend dev: `npm run dev:backend`
- Run frontend dev: `npm run dev:frontend`
- Start backend: `npm run start:backend`
- Start frontend: `npm run start:frontend`
- Run tests across workspaces: `npm test -ws`
- Run build across workspaces: `npm run build -ws`

Use the `-w` flag to target a specific workspace from the root, e.g.:

```bash
npm run dev -w backend
npm run dev -w frontend
```

## Project Structure

```
.
├── backend/                # Backend service (Node.js placeholder)
├── frontend/               # Frontend app (Node.js placeholder)
├── database/               # Database artifacts (migrations, seeds, docs)
│   └── migrations/
├── docker/                 # Docker compose and container docs
│   └── docker-compose.yml
├── documentation/          # Additional documentation
├── .env.example            # Example environment variables
├── .gitignore
├── package.json            # Root workspace configuration
└── README.md
```

## Environment Variables

See `.env.example` for a comprehensive list of variables for backend, frontend, database, and docker. Copy and rename it to `.env` in the repo root.

## Notes

- The backend and frontend are minimal placeholders you can replace with your preferred stack (Express/NestJS, React/Vue/Next, etc.).
- The Docker setup is a template including Postgres and Redis with simple Node containers to run the workspaces.
