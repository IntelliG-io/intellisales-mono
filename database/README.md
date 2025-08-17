# Database

Artifacts for the POS database live here. Default stack assumes Postgres.

## Structure

- `migrations/` — SQL or migration tool files

## Tips

- Connection string is controlled via `DATABASE_URL` in the root `.env`.
- Use `docker/docker-compose.yml` to start a local Postgres instance quickly.
