# SW V6 Lightweight Chat Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a minimum viable one-to-one chat flow backed by existing connected user relationships.

**Architecture:** Introduce a focused NestJS `chat` module that owns conversation creation, conversation listing, message listing, and text message sending. Conversations are created only from `UserConnection(status = connected)`, and the Mini Program `pages/chat/chat` page is upgraded from mock list to real conversations and a lightweight in-page message view.

**Tech Stack:** NestJS, Prisma, PostgreSQL, Jest, Supertest, WeChat Mini Program, JavaScript

---

## Scope check

This plan covers one focused V6 sub-project: **lightweight one-to-one chat**.

It intentionally does not include:

- WebSocket
- read receipts
- push notifications
- images, voice, emoji message types
- blocking/reporting
- moderation
- group chat

---

## Planned file structure

### Backend files to modify

- Modify: `backend/prisma/schema.prisma`
- Modify: `backend/prisma/seed.ts`
- Modify: `backend/src/app.module.ts`
- Modify: `backend/README.md`
- Modify: `README.md`

### Backend files to create

- Create: `backend/src/chat/chat.module.ts`
- Create: `backend/src/chat/chat.controller.ts`
- Create: `backend/src/chat/chat.service.ts`
- Create: `backend/src/chat/dto/open-conversation.dto.ts`
- Create: `backend/src/chat/dto/send-message.dto.ts`
- Create: `backend/test/chat.e2e-spec.ts`
- Create: `backend/prisma/migrations/<timestamp>_lightweight_chat/migration.sql`

### Frontend files to modify

- Modify: `pages/chat/chat.js`
- Modify: `pages/chat/chat.wxml`
- Modify: `pages/chat/chat.wxss`
- Modify: `pages/connections/connections.js`
- Modify: `pages/connections/connections.wxml`

---

## Task 1: Add chat schema and failing e2e coverage

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Modify: `backend/prisma/seed.ts`
- Create: `backend/test/chat.e2e-spec.ts`

- [ ] **Step 1: Write the failing chat e2e suite**

Create `backend/test/chat.e2e-spec.ts` with tests for:

- connected connection can open a conversation
- hidden connection cannot open a conversation
- sending a text message persists it and updates conversation preview

- [ ] **Step 2: Run the chat suite to verify RED**

Run: `npm test -- --runInBand test/chat.e2e-spec.ts`
Expected: FAIL because the `chat` routes and tables do not exist.

- [ ] **Step 3: Extend Prisma schema**

Add:

- `Conversation`
- `Message`
- `User.conversationsA`
- `User.conversationsB`
- `User.sentMessages`
- `UserConnection.conversation`

- [ ] **Step 4: Add a manual migration SQL**

Create migration for:

- `Conversation`
- `Message`
- indexes and foreign keys

- [ ] **Step 5: Apply migration and regenerate Prisma**

Run:

- `npx prisma migrate deploy`
- `npm run prisma:generate`

Expected: both pass.

---

## Task 2: Implement backend chat module

**Files:**
- Create: `backend/src/chat/chat.module.ts`
- Create: `backend/src/chat/chat.controller.ts`
- Create: `backend/src/chat/chat.service.ts`
- Create: `backend/src/chat/dto/open-conversation.dto.ts`
- Create: `backend/src/chat/dto/send-message.dto.ts`
- Modify: `backend/src/app.module.ts`
- Test: `backend/test/chat.e2e-spec.ts`

- [ ] **Step 1: Create DTOs**

`OpenConversationDto`:

- `connectionId: string`

`SendMessageDto`:

- `content: string`

- [ ] **Step 2: Implement `ChatService.openConversation()`**

Rules:

- connection must belong to current user
- connection must be `connected`
- existing conversation is reused
- peer is derived from the connection target user

- [ ] **Step 3: Implement `ChatService.listConversations()`**

Rules:

- return conversations where current user is `userAId` or `userBId`
- include peer info
- order by latest `lastMessageAt`, then `updatedAt`

- [ ] **Step 4: Implement `ChatService.listMessages()`**

Rules:

- current user must participate in the conversation
- return messages in ascending order
- each message includes `isMine`

- [ ] **Step 5: Implement `ChatService.sendMessage()`**

Rules:

- content must be non-empty after trimming
- current user must participate in the conversation
- creates `Message`
- updates `Conversation.lastMessageText` and `Conversation.lastMessageAt`

- [ ] **Step 6: Create controller and module wiring**

Routes:

- `POST /api/v1/chat/conversations`
- `GET /api/v1/chat/conversations`
- `GET /api/v1/chat/conversations/:conversationId/messages`
- `POST /api/v1/chat/conversations/:conversationId/messages`

- [ ] **Step 7: Run chat e2e suite to verify GREEN**

Run: `npm test -- --runInBand test/chat.e2e-spec.ts`
Expected: PASS.

---

## Task 3: Wire Mini Program chat page

**Files:**
- Modify: `pages/chat/chat.js`
- Modify: `pages/chat/chat.wxml`
- Modify: `pages/chat/chat.wxss`
- Modify: `pages/connections/connections.js`
- Modify: `pages/connections/connections.wxml`

- [ ] **Step 1: Update chat page data model**

State:

- `mode: 'list' | 'detail'`
- `conversations`
- `messages`
- `activeConversation`
- `messageInput`
- `loading`

- [ ] **Step 2: Load real conversations**

Call:

- `GET /api/v1/chat/conversations`

Empty state:

- show a message that there are no small notes yet

- [ ] **Step 3: Load messages when tapping a conversation**

Call:

- `GET /api/v1/chat/conversations/:conversationId/messages`

- [ ] **Step 4: Send text message**

Call:

- `POST /api/v1/chat/conversations/:conversationId/messages`

After send:

- clear input
- reload messages
- refresh conversation list

- [ ] **Step 5: Add connection-to-conversation entry**

In `pages/connections/connections`, tapping a connected user should:

- call `POST /api/v1/chat/conversations`
- navigate to `/pages/chat/chat?conversationId=<id>`

---

## Task 4: Verification and docs

**Files:**
- Modify: `backend/README.md`
- Modify: `README.md`

- [ ] **Step 1: Update docs**

Document:

- `POST /api/v1/chat/conversations`
- `GET /api/v1/chat/conversations`
- `GET /api/v1/chat/conversations/:conversationId/messages`
- `POST /api/v1/chat/conversations/:conversationId/messages`

- [ ] **Step 2: Run focused chat suite**

Run: `npm test -- --runInBand test/chat.e2e-spec.ts`
Expected: PASS.

- [ ] **Step 3: Run full backend suite**

Run: `npm test -- --runInBand`
Expected: PASS.

- [ ] **Step 4: Run backend build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Manual Mini Program verification**

Manual flow:

1. Start backend
2. Open Mini Program
3. Enter Profile -> 我的连接
4. Tap a connected user
5. Confirm chat page opens conversation detail
6. Send a text message
7. Return to chat list and confirm preview updates

Expected:

- no white screen
- message persists
- chat list uses real backend data

---

## Self-review

### Spec coverage

- chat backend module: Task 2
- conversation/message tables: Task 1
- conversation list: Task 2 and Task 3
- message list and send: Task 2 and Task 3
- connection-to-chat entry: Task 3
- docs and verification: Task 4

### Placeholder scan

- no `TODO`, `TBD`, or vague implementation placeholders remain
- each task has concrete files and commands

### Type consistency

- `conversationId`, `connectionId`, `content`, `items`, and `peer` are used consistently across backend and frontend tasks
