# TinyLink — URL shortener (Take-Home)

A compact URL shortener built with Next.js, Prisma and Postgres. Matches autograder endpoints and behaviour.

## Required routes & endpoints
- `GET /healthz` → 200 (body: `{ ok: true, version: "1.0" }`)
- `POST /api/links` → create link (409 if code already exists)
- `GET /api/links` → list links
- `GET /api/links/:code` → get link stats
- `DELETE /api/links/:code` → delete link
- `GET /:code` → redirect (302), increments click count and updates lastClicked
- `GET /code/:code` → stats page

## Local development
1. Install dependencies
   ```bash
   npm install
   npx prisma generate
