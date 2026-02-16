# Classroom Backend

Express + TypeScript backend for the Classroom app, using Drizzle ORM with Postgres (Neon) and Arcjet request protection.

## Stack

- Node.js + Express 5
- TypeScript
- Drizzle ORM + drizzle-kit
- Neon Postgres (`@neondatabase/serverless`)
- Arcjet (`shield`, `detectBot`, and role-aware `slidingWindow` limits)

## Project Structure

- `src/index.ts` - app entrypoint, middleware registration, route mounting
- `src/routes/subjects.ts` - subjects list endpoint with filtering + pagination
- `src/middleware/security.ts` - Arcjet enforcement middleware (403/429 handling)
- `src/config/arcjet.ts` - Arcjet base client configuration
- `src/db/index.ts` - DB client initialization from `DATABASE_URL`
- `src/db/schema/app.ts` - domain schema (`departments`, `subjects`, `classes`, `enrollments`)
- `src/db/schema/auth.ts` - auth schema (`user`, `session`, `account`, `verification`)
- `src/db/schema/index.ts` - schema exports barrel

## Environment Variables

Required:

- `DATABASE_URL` - Postgres connection string
- `ARCJET_KEY` - Arcjet key (required unless `NODE_ENV=test`)

Common optional:

- `PORT` - server port (default `8000`)
- `FRONTEND_URL` - CORS origin (default `http://localhost:5173`)
- `LOG_REQUESTS` - set `true` to force request logs in production
- `NODE_ENV` - affects logging + security bypass in tests

## Run

```bash
pnpm install
pnpm dev
```

Build and run production:

```bash
pnpm build
pnpm start
```

## Database Workflow

Generate migrations:

```bash
pnpm db:generate
```

Run migrations:

```bash
pnpm db:migrate
```

Seed data:

```bash
pnpm db:seed
```

## API

### Health

- `GET /`
- Returns welcome text

### Subjects

- `GET /api/subjects`
- Query params:
  - `search`: subject name/code filter
  - `department`: department-name filter
  - `page`: pagination page (default `1`)
  - `limit`: pagination size (default `10`)
- Response shape:
  - `data`: subject rows with joined `department`
  - `pagination`: `page`, `limit`, `total`, `totalPages`

## Security Model

All requests pass through `securityMiddleware` in `src/middleware/security.ts`.

- Role is resolved from `req.user?.role` with fallback to `guest`
- Per-minute limits:
  - `admin`: 20
  - `teacher` / `student`: 10
  - `guest`: 5
- Arcjet deny outcomes:
  - Bot detection -> `403`
  - Shield policy block -> `403`
  - Rate limit -> `429`

In `NODE_ENV=test`, security middleware is bypassed.

## Data Model Overview

### App schema (`src/db/schema/app.ts`)

- `departments`
- `subjects` (belongs to `departments`)
- `classes`
  - belongs to `subjects`
  - belongs to `user` as `teacher`
  - includes `class_status` enum (`active`, `inactive`, `archived`)
  - includes `schedules` as JSONB array
- `enrollments`
  - belongs to `user` as `student`
  - belongs to `classes`
  - unique pair on `(student_id, class_id)`

### Auth schema (`src/db/schema/auth.ts`)

Better Auth-compatible core tables:

- `user` (`text` id PK, plus `role` and `imageCldPubId`)
- `session`
- `account`
- `verification`

## Notes

- CORS is enabled with credentials and defaults to local frontend origin.
- Request logging is enabled outside production by default.
- Postman collection lives in `postman/` (`postman/README.md`).
