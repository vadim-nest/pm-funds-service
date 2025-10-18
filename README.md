# README — what to include (copy-ready outline)

## Title

**Titanbay Funds API (Take-Home)**

## Quick start (minimal local setup)

```bash
# 1) clone
git clone <repo-url> && cd <repo>

# 2) env
cp .env.example .env
# Windows (PowerShell)
Copy-Item .env.example .env

# 3) start postgres
docker compose up -d

# 4) install deps
npm i

# 5) migrate + seed
npm run db:migrate
npm run db:seed

# 6) run API (dev)
npm run dev

# Swagger UI
# http://localhost:3000/docs

# Health
# http://localhost:3000/health
```

## Prerequisites

- Node.js 20+ (tested with Node 22)
- Docker Desktop (for Postgres)
- (Optional) GNU Make for `make` shortcuts

## Tech choices (brief)

- Fastify + TypeScript for speed and type safety
- Prisma + Postgres for schema/migrations/seeding
- Zod for validation; centralised error handler; consistent JSON error shape
- Vitest + Supertest for integration tests
- Swagger UI for quick inspection; **official spec** linked below

## Endpoints implemented (core 8)

- `GET /funds` — list funds. **200** with array.
- `POST /funds` — create fund. **201** with created fund (includes `created_at`).
- `PUT /funds` — update fund by **id in body**. **200** with updated fund.
- `GET /funds/:id` — fund by id. **200** or **404**.
- `GET /investors` — list investors. **200**.
- `POST /investors` — create investor (unique email). **201** or **409**.
- `GET /funds/:fund_id/investments` — list investments for a fund. **200**.
- `POST /funds/:fund_id/investments` — create investment for a fund. **201**; **404** if fund/investor missing.

## Validation & errors

- Zod validates bodies/params (UUIDs, enums, positive amounts, date format).

- Error shape:

  ```json
  { "error": { "type": "VALIDATION_ERROR", "message": "…", "details": [...] } }
  ```

- Status codes: 400 invalid input, 404 not found, 409 conflict (email), 500 unknown.

## Sample data

- Seeds create:
  - 2 funds (e.g., “Titanbay Growth Fund I” [Fundraising], “Titanbay Growth Fund II” [Investing])
  - 3 investors (Institution/Individual/Family Office) with valid emails
  - 3–5 investments across funds

- Run again safely (idempotent) by upsert logic in the seed script.

## Testing

```bash
npm run test
```

Tests run against an isolated test database (`.env.test`); the test script resets & seeds it automatically.

### Running tests

- Integration tests for happy paths + edge cases; CI-friendly.

## Swagger / OpenAPI

- Swagger UI: [http://localhost:3000/docs](http://localhost:3000/docs)
- Raw OpenAPI JSON: [http://localhost:3000/docs/json](http://localhost:3000/docs/json)

## Assumptions & design decisions

- Followed spec **verbatim** for `PUT /funds` (id in body), even though REST would typically be `PUT /funds/:id`.
- Decimal amounts use Postgres `NUMERIC(20,2)`; returned as numbers in JSON (precision ok for 2 decimals).
- `created_at` is generated server-side and returned to match examples.
- Email is unique per investor; conflicts return **409**.
- Deleting is not part of the spec; omitted intentionally.
- Pagination/filtering not required by spec; omitted for clarity and time.

## How to run in one line (optional)

```bash
make dev      # or: npm run dev after db up/migrate/seed
```
