# SW API Reference

> Version: 2026-04-11
> Status: aligned with the current NestJS backend implementation

## 1. Global contract

- Base path: `/api/v1`
- Auth: `Authorization: Bearer <token>`
- Development fallback: when backend enables `ALLOW_TEST_AUTH=true`, local test-user auth can still be used for development and e2e flows
- Unified response shape:

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

## 2. Current implemented modules

Implemented backend modules:

- `auth`
- `users`
- `onboarding`
- `cards`
- `matching`
- `discovery`
- `profile`
- `chat`

## 3. Implemented endpoints

### 3.1 Auth

- `POST /api/v1/auth/wechat-login`
  - body: `{ "code": "wx-login-code" }`
  - purpose: create or reuse a user identity and return login state
- `GET /api/v1/auth/me`
  - purpose: resolve the current user from bearer token

### 3.2 Users

- `GET /api/v1/users/bootstrap`
  - purpose: determine startup routing for the current user, including whether onboarding is complete

### 3.3 Onboarding

- `POST /api/v1/onboarding/submit`
  - purpose: submit the 3-question onboarding answer set for the current user

### 3.4 Home / Cards

- `GET /api/v1/cards/recommend`
  - purpose: fetch home recommendation cards
- `GET /api/v1/cards/recommend-users`
  - purpose: fetch the home top rail of similar-frequency users
- `POST /api/v1/cards/swipe`
  - body fields include:
    - `cardId`
    - `action = agree | disagree | skip`
    - `sessionId`
    - optional `sourceTab`
- `POST /api/v1/cards/feedback`
  - body fields include:
    - `cardId`
    - `feedbackType = reduce_similar`
    - optional `category`
- `GET /api/v1/cards/:cardId/comments`
  - purpose: list comments for a home card
- `POST /api/v1/cards/:cardId/comments`
  - purpose: create a comment for a home card

### 3.5 Matching / Connections

- `POST /api/v1/matching/trigger-check`
  - purpose: evaluate whether the current session should surface a match candidate
- `POST /api/v1/matching/connections`
  - body fields include:
    - `candidateUserId`
    - `action = connect | hide`
    - optional `matchEventId`
- `GET /api/v1/matching/connections`
  - query:
    - optional `status = pending | connected | hidden`

### 3.6 Discovery

- `GET /api/v1/discovery/feed`
  - purpose: load the public discovery feed
- `GET /api/v1/discovery/my-posts`
  - purpose: load the current user's own posts
- `POST /api/v1/discovery/publish`
  - body fields include:
    - `content`
    - `tabType`
    - optional `anonymous`
    - optional `action = draft | publish`
- `POST /api/v1/discovery/posts/:postId/like`
  - purpose: like a discovery post once per user
- `GET /api/v1/discovery/posts/:postId/comments`
  - purpose: list comments for a discovery post
- `POST /api/v1/discovery/posts/:postId/comments`
  - purpose: create a comment for a discovery post

### 3.7 Profile

- `GET /api/v1/profile/info`
  - purpose: fetch the current user's profile
- `PATCH /api/v1/profile/info`
  - purpose: update editable profile fields
- `POST /api/v1/profile/photos`
  - purpose: add a photo to the user's photo wall
- `DELETE /api/v1/profile/photos/:photoId`
  - purpose: delete one photo
- `PATCH /api/v1/profile/photos/sort`
  - purpose: reorder photo-wall items

### 3.8 Chat

- `POST /api/v1/chat/conversations`
  - body: `{ "connectionId": "9" }`
  - purpose: create or reopen a one-to-one conversation from a `connected` relationship
- `GET /api/v1/chat/conversations`
  - purpose: list the current user's conversations
- `GET /api/v1/chat/conversations/:conversationId/messages`
  - query:
    - optional `limit` with default `30`, range `1-50`
    - optional `before` cursor
  - purpose: list conversation messages with backward pagination
- `POST /api/v1/chat/conversations/:conversationId/messages`
  - body: `{ "content": "你好，很高兴认识你" }`
  - purpose: send one text message
- `POST /api/v1/chat/conversations/:conversationId/read`
  - purpose: mark a conversation as read and clear unread count

## 4. Product status summary

As of 2026-04-11:

- Home is on real backend data for recommendation, swipe, user rail, feedback, comments, matching, and connect-to-chat
- Discovery is on real backend data for feed, publish, drafts, my-posts, likes, and comments
- Chat is on real backend data for conversation list, open conversation, message list, send text, unread count, read marking, and message pagination

## 5. Not implemented yet

The main missing capabilities are no longer "whether backend exists", but the next-stage enhancements:

- chat realtime refresh via polling or WebSocket
- blocking, reporting, disconnecting, and other safety controls
- message revoke/delete and richer message types
- discovery moderation, edit flows, search, and operations tooling
- image upload pipeline and object storage
- recommendation quality improvements and feedback-loop refinement

## 6. Related source references

- Backend overview: `backend/README.md`
- Current project status: `docs/superpowers/specs/2026-04-11-page-backend-status-and-remaining-work.md`
- Frontend/backend page alignment: `README.md`
