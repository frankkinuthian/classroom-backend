# Postman Collection - Classroom Backend

This directory contains a Postman collection for the current backend routes.

## Files

- `classroom-backend.postman_collection.json`: Postman v2.1 collection for health and subjects endpoints.

## Important runtime note

Your backend currently has two app entry files:

- `src/index.ts`: active app entry; serves `GET /` and mounts `GET /api/subjects`
- `src/server.ts`: still exists, but only serves `GET /`

`package.json` scripts run `src/index.ts` for `dev` and `dist/index.js` for `start`, so running `npm run dev`, `npm start`, or `npx tsx src/index.ts` exposes both `GET /` and `GET /api/subjects`.

## How to run for full collection coverage

From `classroom-backend/`:

```bash
npx tsx src/index.ts
```

Default base URL used by the collection:

- `http://localhost:8000`

## Import into Postman

1. Open Postman.
2. Click **Import**.
3. Select `postman/classroom-backend.postman_collection.json`.
4. Run requests under:
   - `Health` -> `GET /`
   - `Subjects` -> `GET /api/subjects ...`

## Collection variables

- `baseUrl` (default `http://localhost:8000`)
- `searchTerm` (default `math`)
- `departmentName` (default `science`)
- `page` (default `1`)
- `limit` (default `10`)

## Expected responses

- `GET /` returns HTTP `200`.
- `GET /api/subjects` returns HTTP `200` with:
  - `data` (array)
  - `pagination` (object with `page`, `limit`, `total`, `totalPages`)
