# Card Question Bank Random Recommendation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Seed the Word question bank into cards and make card recommendation draw randomly from it.

**Architecture:** Extract the DOCX once into a versioned JSON file under `backend/prisma/data`, read it from Prisma seed, and reuse the existing `Card` table and `/cards/recommend` API. Keep the frontend contract unchanged.

**Tech Stack:** Node.js, NestJS, Prisma, PostgreSQL, Jest e2e, Python DOCX extraction for generated data

---

## Task 1: Add failing coverage

**Files:**
- Modify: `backend/test/cards.e2e-spec.ts`

- [ ] Add an e2e assertion that recommendations can return question-bank cards.
- [ ] Add an e2e assertion that repeated recommendation calls for users with fresh sessions are not pinned to the same first card.
- [ ] Run `npm test -- --runInBand test/cards.e2e-spec.ts` and confirm the new assertion fails before implementation.

## Task 2: Extract DOCX data

**Files:**
- Create: `backend/prisma/data/card-question-bank.v6.json`

- [ ] Parse `docs/三观档案完整题库v6_1000题.docx`.
- [ ] Extract 1000 items using the `question / A｜ / B｜` paragraph pattern.
- [ ] Store stable `bankId`, `category`, `content`, `optionA`, `optionB`, and `source`.

## Task 3: Seed question-bank cards

**Files:**
- Modify: `backend/prisma/seed.ts`

- [ ] Read `backend/prisma/data/card-question-bank.v6.json`.
- [ ] Insert all items into `Card` with deterministic ids starting at `10000`.
- [ ] Keep existing hand-written seed cards for focused fixtures.

## Task 4: Randomize recommendation

**Files:**
- Modify: `backend/src/cards/cards.service.ts`

- [ ] Preserve the existing filters for active cards, category, unswiped cards, and suppressed categories.
- [ ] Fetch an eligible pool larger than `limit`.
- [ ] Shuffle the pool in memory and return the first `limit` items.

## Task 5: Verify

**Files:**
- Test: `backend/test/cards.e2e-spec.ts`

- [ ] Run `npm test -- --runInBand test/cards.e2e-spec.ts`.
- [ ] If the database is available, run the focused suite until it passes.
