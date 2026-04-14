# SW V5 Multi-User Entry And Relationship Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a real multi-user entry flow and a minimum viable relationship layer that turns match results into durable connections.

**Architecture:** Build a focused `users` module for startup/bootstrap state, extend `matching` with connection creation and listing, and keep existing onboarding and auth modules stable. On the Mini Program side, use a startup bootstrap call to route users into onboarding or home, and add a lightweight connections page for relationship visibility.

**Tech Stack:** NestJS, Prisma, PostgreSQL, Jest, Supertest, WeChat Mini Program, JavaScript

---

## Scope check

This plan covers one focused V5 sub-project: **multi-user entry flow + relationship foundation**.

It intentionally does not include:

- chat messages
- blocking/reporting/follow
- friendship graph
- moderation tooling
- advanced connection recommendations

---

## Planned file structure

### Backend files to modify

- Modify: `backend/prisma/schema.prisma`
- Modify: `backend/prisma/seed.ts`
- Modify: `backend/src/app.module.ts`
- Modify: `backend/src/matching/matching.controller.ts`
- Modify: `backend/src/matching/matching.service.ts`
- Modify: `backend/test/matching.e2e-spec.ts`

### Backend files to create

- Create: `backend/src/users/users.module.ts`
- Create: `backend/src/users/users.controller.ts`
- Create: `backend/src/users/users.service.ts`
- Create: `backend/src/matching/dto/upsert-connection.dto.ts`
- Create: `backend/src/matching/dto/list-connections.dto.ts`
- Create: `backend/test/users-bootstrap.e2e-spec.ts`

### Frontend files to modify

- Modify: `app.js`
- Modify: `app.json`
- Modify: `pages/home/home.js`
- Modify: `pages/profile/profile.js`

### Frontend files to create

- Create: `pages/connections/connections.js`
- Create: `pages/connections/connections.wxml`
- Create: `pages/connections/connections.wxss`
- Create: `pages/connections/connections.json`

### Docs files to modify

- Modify: `backend/README.md`
- Modify: `README.md`

---

## Task 1: Extend the data model for durable connections

**Files:**
- Modify: `backend/prisma/schema.prisma`
- Modify: `backend/prisma/seed.ts`
- Test: `backend/test/matching.e2e-spec.ts`

- [ ] **Step 1: Add failing coverage for connection persistence**

Add tests that expect:

- a user can convert a match event into a connection
- a user can list their own connections

- [ ] **Step 2: Run the matching suite and confirm failures**

Run: `npm test -- --runInBand test/matching.e2e-spec.ts`
Expected: FAIL because there is no connection model or API yet.

- [ ] **Step 3: Add `UserConnection` to Prisma**

Recommended shape:

```prisma
model UserConnection {
  id                 BigInt   @id @default(autoincrement())
  userId             BigInt
  targetUserId       BigInt
  sourceMatchEventId BigInt?
  status             String
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  user       User       @relation("UserConnectionOwner", fields: [userId], references: [id])
  targetUser User       @relation("UserConnectionTarget", fields: [targetUserId], references: [id])
  matchEvent  MatchEvent? @relation(fields: [sourceMatchEventId], references: [id])

  @@unique([userId, targetUserId])
  @@index([userId, status, createdAt])
}
```

- [ ] **Step 4: Add seed relationships and sequence reset coverage if needed**

Seed at least:

- one `connected` relationship for an existing seeded user
- one `hidden` relationship to cover filtering behavior

- [ ] **Step 5: Generate and apply the Prisma migration**

Run: `npm run prisma:migrate -- --name relationship_foundation`

If interactive migration is blocked, create the migration SQL manually and apply via deploy, consistent with the existing repo workflow.

- [ ] **Step 6: Re-run the matching suite**

Run: `npm test -- --runInBand test/matching.e2e-spec.ts`
Expected: still FAIL, but now at route/service level.

---

## Task 2: Add a users bootstrap endpoint for startup routing

**Files:**
- Create: `backend/src/users/users.module.ts`
- Create: `backend/src/users/users.controller.ts`
- Create: `backend/src/users/users.service.ts`
- Modify: `backend/src/app.module.ts`
- Test: `backend/test/users-bootstrap.e2e-spec.ts`

- [ ] **Step 1: Add failing e2e coverage for `/api/v1/users/bootstrap`**

Test cases:

- onboarding incomplete user returns `nextStep = onboarding`
- onboarding complete user returns `nextStep = home`

- [ ] **Step 2: Run the focused bootstrap suite and confirm 404 failures**

Run: `npm test -- --runInBand test/users-bootstrap.e2e-spec.ts`
Expected: FAIL with missing route/module coverage.

- [ ] **Step 3: Create the users service**

Suggested behavior:

```ts
async getBootstrap(userId: bigint) {
  const user = await this.prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  return {
    userId: user.id.toString(),
    nickname: user.nickname,
    onboardingCompleted: user.onboardingCompleted,
    nextStep: user.onboardingCompleted ? 'home' : 'onboarding',
  };
}
```

- [ ] **Step 4: Create controller and module**

Endpoint:

- `GET /api/v1/users/bootstrap`

Use `CurrentUser()` so it stays aligned with the V4 auth path.

- [ ] **Step 5: Wire `UsersModule` into `AppModule`**

Keep all existing modules intact and only add the new users module.

- [ ] **Step 6: Run the bootstrap suite**

Run: `npm test -- --runInBand test/users-bootstrap.e2e-spec.ts`
Expected: PASS.

---

## Task 3: Extend matching with connection creation and listing

**Files:**
- Modify: `backend/src/matching/matching.controller.ts`
- Modify: `backend/src/matching/matching.service.ts`
- Create: `backend/src/matching/dto/upsert-connection.dto.ts`
- Create: `backend/src/matching/dto/list-connections.dto.ts`
- Test: `backend/test/matching.e2e-spec.ts`

- [ ] **Step 1: Add DTOs for connection upsert and listing**

Suggested upsert payload:

```ts
{
  candidateUserId: string;
  matchEventId?: string;
  action: 'connect' | 'hide';
}
```

Listing can support optional `status`.

- [ ] **Step 2: Add controller routes**

Add:

- `POST /api/v1/matching/connections`
- `GET /api/v1/matching/connections`

- [ ] **Step 3: Implement connection upsert behavior**

Rules:

- `connect` creates or updates a row to `connected`
- `hide` creates or updates a row to `hidden`
- prevent self-connection
- if `matchEventId` is provided, ensure it belongs to the requesting user

- [ ] **Step 4: Implement connection listing**

Return:

- `connectionId`
- `status`
- `createdAt`
- `targetUser`
- `matchReason`

The `matchReason` can come from the linked `MatchEvent.triggerReason` when present.

- [ ] **Step 5: Run the matching suite**

Run: `npm test -- --runInBand test/matching.e2e-spec.ts`
Expected: PASS for trigger-check plus connection persistence/listing.

---

## Task 4: Wire Mini Program startup routing and add a connections page

**Files:**
- Modify: `app.js`
- Modify: `app.json`
- Modify: `pages/home/home.js`
- Modify: `pages/profile/profile.js`
- Create: `pages/connections/connections.js`
- Create: `pages/connections/connections.wxml`
- Create: `pages/connections/connections.wxss`
- Create: `pages/connections/connections.json`

- [ ] **Step 1: Add a bootstrap request after V4 login succeeds**

Startup flow becomes:

1. `wx.login`
2. `POST /api/v1/auth/wechat-login`
3. `GET /api/v1/users/bootstrap`
4. store `currentUser`
5. decide `nextStep`

- [ ] **Step 2: Add app-level navigation intent**

Suggested global fields:

- `currentUser`
- `nextStep`

The app should not aggressively force navigation on every launch, but it should expose enough state for pages to redirect safely.

- [ ] **Step 3: Use bootstrap state in onboarding/home entry**

Suggested behavior:

- if `nextStep === 'onboarding'`, route to onboarding for first-time users
- if onboarding is already complete, route to home

Keep the current app usable in local development even if bootstrap fails.

- [ ] **Step 4: Add a lightweight connections page**

Capabilities:

- fetch `GET /api/v1/matching/connections`
- display connected users
- tolerate empty states cleanly

- [ ] **Step 5: Add entry point from profile or home**

Recommend:

- add a “我的连接” entry from profile first, since it is the least disruptive

- [ ] **Step 6: Manual Mini Program verification checkpoint**

Manual flow:

1. login as a new user
2. verify bootstrap routes to onboarding
3. submit onboarding
4. relaunch and verify bootstrap routes to home
5. open connections page and verify empty state or seeded items

Expected:

- no white screen
- no auth regression
- startup state behaves predictably

---

## Task 5: Final verification and docs touch-up

**Files:**
- Modify: `backend/README.md`
- Modify: `README.md`

- [ ] **Step 1: Add backend docs for V5**

Document:

- `GET /api/v1/users/bootstrap`
- `POST /api/v1/matching/connections`
- `GET /api/v1/matching/connections`

- [ ] **Step 2: Add root README notes for startup routing and connections**

Describe:

- Mini Program startup now uses bootstrap routing
- there is now a lightweight connections page

- [ ] **Step 3: Run focused suites**

Run:

- `npm test -- --runInBand test/users-bootstrap.e2e-spec.ts`
- `npm test -- --runInBand test/matching.e2e-spec.ts`

Expected: PASS.

- [ ] **Step 4: Run the full backend suite**

Run: `npm test -- --runInBand`
Expected: PASS.

- [ ] **Step 5: Run backend build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 6: Final manual verification**

Manual flow:

1. start backend
2. open Mini Program
3. verify startup bootstrap
4. verify onboarding -> home transition
5. verify connections list loads

Expected:

- no auth regressions
- no routing regressions
- relationship records are queryable

---

## Self-review

### Spec coverage

- startup bootstrap routing: covered in Task 2 and Task 4
- onboarding and real account flow: covered in Task 2 and Task 4
- relationship persistence: covered in Task 1 and Task 3
- connections page and manual flow: covered in Task 4

### Placeholder scan

- no `TODO`, `TBD`, or vague placeholders remain
- each task points to concrete files and verification steps

### Type consistency

- bootstrap response consistently uses `nextStep`
- connection state consistently uses `pending | connected | hidden` semantics
- current-user resolution continues to rely on the V4 auth path
