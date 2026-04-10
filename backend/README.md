# SW Backend

NestJS backend workspace for the SW Mini Program MVP/P0 local-first backend.

## Local run

1. `docker compose up -d`
2. Copy `.env.example` to `.env` if needed
3. `npm install`
4. `npm run prisma:generate`
5. `npm run prisma:migrate -- --name mvp_baseline`
6. `npm run prisma:seed`
7. `npm run start:dev`

The backend listens on `http://127.0.0.1:3005`.
PostgreSQL is exposed on `localhost:5434`.

## Available scripts

- `npm run start:dev`
- `npm run build`
- `npm test`
- `npm run test:e2e`

## Environment

Copy `.env.example` to `.env` before running the service.
