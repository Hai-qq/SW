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

## V2 Profile Editing

This service now supports profile editing and photo-wall management through:

- `PATCH /api/v1/profile/info`
- `POST /api/v1/profile/photos`
- `DELETE /api/v1/profile/photos/:photoId`
- `PATCH /api/v1/profile/photos/sort`

## V3 Discovery Publication Formalization

The Discovery module now supports:

- `POST /api/v1/discovery/publish` with `action = draft | publish`
- `GET /api/v1/discovery/feed` returning only `published` content
- `GET /api/v1/discovery/my-posts`

## V4 WeChat Login And Identity

The backend now supports:

- `POST /api/v1/auth/wechat-login`
- `GET /api/v1/auth/me`
- bearer-token user resolution
- development fallback via `ALLOW_TEST_AUTH=true`

## V5 Multi-User Entry And Relationship Foundation

The backend now supports:

- `GET /api/v1/users/bootstrap`
- `POST /api/v1/matching/connections`
- `GET /api/v1/matching/connections`
- persisted user connections backed by match flows

## V6 Lightweight Chat

The backend now supports:

- `POST /api/v1/chat/conversations`
- `GET /api/v1/chat/conversations`
- `GET /api/v1/chat/conversations/:conversationId/messages`
- `POST /api/v1/chat/conversations/:conversationId/messages`
- `POST /api/v1/chat/conversations/:conversationId/read`
- one-to-one text conversations backed by `UserConnection(status = connected)`
