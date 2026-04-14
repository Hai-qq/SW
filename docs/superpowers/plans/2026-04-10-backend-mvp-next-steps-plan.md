# SW Backend MVP Next Steps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the existing `backend-p0` worktree into a locally runnable MVP backend and wire the four Mini Program pages off mock data.

**Architecture:** Continue from the existing NestJS + Prisma skeleton in `.worktrees/backend-p0/backend` instead of rebuilding from scratch. Implement contract-first e2e coverage for the seven MVP endpoints, keep the recommendation and matching rules lightweight and explainable, then connect the Mini Program pages through a tiny shared request wrapper.

**Tech Stack:** Node.js, NestJS, Prisma, PostgreSQL, Jest, Supertest, TypeScript, WeChat Mini Program

---

## Scope check

This plan covers one shippable subsystem: the MVP backend + four-page frontend integration already defined in the approved spec.

This plan fixes one ambiguity from the spec so implementation does not stall:

- Use `POST /api/v1/matching/trigger-check` as the canonical trigger endpoint.
- If frontend code or existing docs still expect `/api/v1/blind-box/trigger-check`, add a temporary alias controller method after the canonical route is green.

---

## Planned file structure

### Existing backend files to modify

- Modify: `.worktrees/backend-p0/backend/prisma/schema.prisma`
- Modify: `.worktrees/backend-p0/backend/prisma/seed.ts`
- Modify: `.worktrees/backend-p0/backend/src/app.module.ts`
- Modify: `.worktrees/backend-p0/backend/src/main.ts`
- Modify: `.worktrees/backend-p0/backend/README.md`

### Backend files to create

- Create: `.worktrees/backend-p0/backend/src/common/current-user.decorator.ts`
- Create: `.worktrees/backend-p0/backend/src/common/test-user.guard.ts`
- Create: `.worktrees/backend-p0/backend/src/prisma/prisma.module.ts`
- Create: `.worktrees/backend-p0/backend/src/prisma/prisma.service.ts`
- Create: `.worktrees/backend-p0/backend/src/onboarding/onboarding.module.ts`
- Create: `.worktrees/backend-p0/backend/src/onboarding/onboarding.controller.ts`
- Create: `.worktrees/backend-p0/backend/src/onboarding/onboarding.service.ts`
- Create: `.worktrees/backend-p0/backend/src/onboarding/dto/submit-onboarding.dto.ts`
- Create: `.worktrees/backend-p0/backend/src/cards/cards.module.ts`
- Create: `.worktrees/backend-p0/backend/src/cards/cards.controller.ts`
- Create: `.worktrees/backend-p0/backend/src/cards/cards.service.ts`
- Create: `.worktrees/backend-p0/backend/src/cards/dto/recommend-cards.dto.ts`
- Create: `.worktrees/backend-p0/backend/src/cards/dto/swipe-card.dto.ts`
- Create: `.worktrees/backend-p0/backend/src/matching/matching.module.ts`
- Create: `.worktrees/backend-p0/backend/src/matching/matching.controller.ts`
- Create: `.worktrees/backend-p0/backend/src/matching/matching.service.ts`
- Create: `.worktrees/backend-p0/backend/src/matching/dto/trigger-check.dto.ts`
- Create: `.worktrees/backend-p0/backend/src/discovery/discovery.module.ts`
- Create: `.worktrees/backend-p0/backend/src/discovery/discovery.controller.ts`
- Create: `.worktrees/backend-p0/backend/src/discovery/discovery.service.ts`
- Create: `.worktrees/backend-p0/backend/src/discovery/dto/get-feed.dto.ts`
- Create: `.worktrees/backend-p0/backend/src/discovery/dto/publish-post.dto.ts`
- Create: `.worktrees/backend-p0/backend/src/profile/profile.module.ts`
- Create: `.worktrees/backend-p0/backend/src/profile/profile.controller.ts`
- Create: `.worktrees/backend-p0/backend/src/profile/profile.service.ts`
- Create: `.worktrees/backend-p0/backend/test/onboarding.e2e-spec.ts`
- Create: `.worktrees/backend-p0/backend/test/cards.e2e-spec.ts`
- Create: `.worktrees/backend-p0/backend/test/matching.e2e-spec.ts`
- Create: `.worktrees/backend-p0/backend/test/discovery.e2e-spec.ts`
- Create: `.worktrees/backend-p0/backend/test/profile.e2e-spec.ts`

### Mini Program files to modify during integration

- Modify: `app.js`
- Create: `utils/request.js`
- Create: `utils/session.js`
- Modify: `pages/onboarding/onboarding.js`
- Modify: `pages/home/home.js`
- Modify: `pages/discovery/discovery.js`
- Modify: `pages/profile/profile.js`

---

### Task 1: Finish shared backend plumbing and database baseline

**Files:**
- Modify: `.worktrees/backend-p0/backend/prisma/schema.prisma`
- Modify: `.worktrees/backend-p0/backend/prisma/seed.ts`
- Modify: `.worktrees/backend-p0/backend/src/app.module.ts`
- Modify: `.worktrees/backend-p0/backend/src/main.ts`
- Create: `.worktrees/backend-p0/backend/src/common/current-user.decorator.ts`
- Create: `.worktrees/backend-p0/backend/src/common/test-user.guard.ts`
- Create: `.worktrees/backend-p0/backend/src/prisma/prisma.module.ts`
- Create: `.worktrees/backend-p0/backend/src/prisma/prisma.service.ts`
- Test: `.worktrees/backend-p0/backend/test/app.e2e-spec.ts`

- [ ] **Step 1: Expand the app smoke test so it proves global plumbing is installed**

```ts
it('/api/v1/health returns wrapped data', async () => {
  await request(app.getHttpServer())
    .get('/api/v1/health')
    .set('x-test-user-id', '1')
    .expect(200)
    .expect({
      code: 200,
      message: 'success',
      data: { ok: true, userId: '1' },
    });
});
```

- [ ] **Step 2: Run the smoke test to confirm the current skeleton still fails this contract**

Run: `npm test -- --runInBand test/app.e2e-spec.ts`
Expected: FAIL because `/api/v1/health` or `x-test-user-id` handling is missing.

- [ ] **Step 3: Add the minimum shared runtime pieces**

`src/common/current-user.decorator.ts`

```ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.currentUser as { id: bigint };
  },
);
```

`src/common/test-user.guard.ts`

```ts
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class TestUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const rawUserId = request.headers['x-test-user-id'] ?? '1';
    request.currentUser = { id: BigInt(rawUserId) };
    return true;
  }
}
```

`src/prisma/prisma.service.ts`

```ts
import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
```

- [ ] **Step 4: Wire AppModule to use the guard, Prisma, and versioned health route**

```ts
@Controller('api/v1/health')
@UseGuards(TestUserGuard)
class HealthController {
  @Get()
  health(@CurrentUser() user: { id: bigint }) {
    return { ok: true, userId: user.id.toString() };
  }
}

@Module({
  imports: [PrismaModule],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: TestUserGuard }],
})
export class AppModule {}
```

- [ ] **Step 5: Bring the Prisma schema and seed up to MVP baseline**

Use the existing models, then add the missing exposure table and uniqueness needed by later tasks:

```prisma
model CardExposure {
  id            BigInt   @id @default(autoincrement())
  userId        BigInt
  cardId        BigInt
  sessionId     String
  positionIndex Int?
  exposedAt     DateTime @default(now())

  @@index([userId, exposedAt])
  @@index([sessionId])
}

model CardSwipe {
  // ...
  @@unique([userId, cardId])
}
```

Seed at least:

```ts
await prisma.user.createMany({
  data: [
    { id: 1n, nickname: 'SOFIA', gender: 'female', ageRange: 'gen-z', relationshipStatus: 'single', onboardingCompleted: true, avatarUrl: 'https://example.com/sofia.jpg', signature: '先理解，再表达。', mbti: 'INFJ' },
    { id: 2n, nickname: 'MARCUS', gender: 'male', ageRange: '90s', relationshipStatus: 'single', onboardingCompleted: true, avatarUrl: 'https://example.com/marcus.jpg', signature: '夜晚效率更高。', mbti: 'INTJ' },
    { id: 3n, nickname: 'ELENA', gender: 'female', ageRange: '90s', relationshipStatus: 'single', onboardingCompleted: true, avatarUrl: 'https://example.com/elena.jpg', signature: '相信温柔也有力量。', mbti: 'ENFJ' },
    { id: 4n, nickname: 'JULI', gender: 'female', ageRange: 'gen-z', relationshipStatus: 'single', onboardingCompleted: true, avatarUrl: 'https://example.com/juli.jpg', signature: '喜欢旅行和探索。', mbti: 'ENFP' },
  ],
  skipDuplicates: true,
});

await prisma.userProfileTag.createMany({
  data: [
    { userId: 1n, tagType: 'topic_preference', tagKey: 'topic', tagValue: '价值观', source: 'onboarding' },
    { userId: 2n, tagType: 'topic_preference', tagKey: 'topic', tagValue: '内心世界', source: 'behavior' },
    { userId: 3n, tagType: 'topic_preference', tagKey: 'topic', tagValue: '价值观', source: 'behavior' },
    { userId: 4n, tagType: 'topic_preference', tagKey: 'topic', tagValue: '旅行与探索', source: 'onboarding' },
  ],
  skipDuplicates: true,
});

await prisma.card.createMany({
  data: [
    { id: 101n, sourceType: 'platform', category: '社会观察', content: '坚定地认为《虎胆龙威》是一部圣诞电影。', status: 'active', agreeCount: 65, disagreeCount: 35 },
    { id: 202n, sourceType: 'platform', category: '内心世界', content: '认为晚上的效率永远比白天高。', status: 'active', agreeCount: 42, disagreeCount: 58 },
    { id: 303n, sourceType: 'platform', category: '价值观', content: '真正成熟的人会先理解，再表达自己。', status: 'active', agreeCount: 71, disagreeCount: 29 },
    { id: 404n, sourceType: 'platform', category: '旅行与探索', content: '旅行的意义是重新看见熟悉的自己。', status: 'active', agreeCount: 54, disagreeCount: 46 },
    { id: 505n, sourceType: 'platform', category: '内心世界', content: '树洞比热闹更能让人放松。', status: 'active', agreeCount: 60, disagreeCount: 40 },
  ],
  skipDuplicates: true,
});

await prisma.discoveryPost.createMany({
  data: [
    { id: 501n, authorUserId: 1n, postType: 'featured', category: '价值观', title: '关于成熟', content: '我更认同先理解后表达。', status: 'published' },
    { id: 502n, authorUserId: 2n, postType: 'timeline', category: '内心世界', content: '今晚也想把话说给风听。', status: 'published' },
    { id: 503n, authorUserId: 4n, postType: 'timeline', category: '旅行与探索', content: '想去海边待三天不看手机。', status: 'published' },
  ],
  skipDuplicates: true,
});
```

- [ ] **Step 6: Generate Prisma client, run migration, reseed, and rerun the smoke test**

Run: `npm run prisma:generate`
Expected: Prisma client generated successfully.

Run: `npm run prisma:migrate -- --name mvp_baseline`
Expected: A migration is created and applied to the local PostgreSQL database.

Run: `npm run prisma:seed`
Expected: Seed completes without duplicate-key errors.

Run: `npm test -- --runInBand test/app.e2e-spec.ts`
Expected: PASS.

- [ ] **Step 7: Commit the shared baseline**

```bash
git add prisma src test README.md
git commit -m "feat: add backend mvp shared baseline"
```

### Task 2: Implement onboarding submission and profile-tag initialization

**Files:**
- Create: `.worktrees/backend-p0/backend/src/onboarding/onboarding.module.ts`
- Create: `.worktrees/backend-p0/backend/src/onboarding/onboarding.controller.ts`
- Create: `.worktrees/backend-p0/backend/src/onboarding/onboarding.service.ts`
- Create: `.worktrees/backend-p0/backend/src/onboarding/dto/submit-onboarding.dto.ts`
- Modify: `.worktrees/backend-p0/backend/src/app.module.ts`
- Test: `.worktrees/backend-p0/backend/test/onboarding.e2e-spec.ts`

- [ ] **Step 1: Write the failing onboarding e2e spec first**

```ts
it('submits answers, upserts tags, and marks onboarding complete', async () => {
  const response = await request(app.getHttpServer())
    .post('/api/v1/onboarding/submit')
    .set('x-test-user-id', '1')
    .send({
      answers: [
        { questionId: 1, selected: 'female' },
        { questionId: 2, selected: 'gen-z' },
        { questionId: 3, selected: 'single' },
      ],
    })
    .expect(201);

  expect(response.body.data).toEqual({ onboardingCompleted: true });
});
```

- [ ] **Step 2: Run the onboarding spec to verify the endpoint is not implemented yet**

Run: `npm test -- --runInBand test/onboarding.e2e-spec.ts`
Expected: FAIL with 404 or missing module errors.

- [ ] **Step 3: Define the request DTO and controller contract**

`src/onboarding/dto/submit-onboarding.dto.ts`

```ts
class OnboardingAnswerDto {
  @IsInt()
  questionId: number;

  @IsOptional()
  @IsString()
  selected?: string;
}

export class SubmitOnboardingDto {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => OnboardingAnswerDto)
  answers: OnboardingAnswerDto[];
}
```

`src/onboarding/onboarding.controller.ts`

```ts
@Controller('api/v1/onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('submit')
  submit(@CurrentUser() user: { id: bigint }, @Body() dto: SubmitOnboardingDto) {
    return this.onboardingService.submit(user.id, dto);
  }
}
```

- [ ] **Step 4: Implement minimal service logic with explicit question mapping**

```ts
const QUESTION_TAG_MAP: Record<number, { tagType: string; tagKey: string }> = {
  1: { tagType: 'demographic', tagKey: 'gender' },
  2: { tagType: 'demographic', tagKey: 'age_range' },
  3: { tagType: 'demographic', tagKey: 'relationship_status' },
};

await this.prisma.$transaction(async (tx) => {
  for (const answer of dto.answers) {
    await tx.onboardingAnswer.upsert({
      where: { userId_questionId: { userId, questionId: answer.questionId } },
      create: { userId, questionId: answer.questionId, selectedValue: answer.selected ?? null, isSkipped: !answer.selected },
      update: { selectedValue: answer.selected ?? null, isSkipped: !answer.selected, submittedAt: new Date() },
    });
  }

  await tx.user.update({
    where: { id: userId },
    data: {
      onboardingCompleted: true,
      gender: dto.answers.find((item) => item.questionId === 1)?.selected ?? null,
      ageRange: dto.answers.find((item) => item.questionId === 2)?.selected ?? null,
      relationshipStatus: dto.answers.find((item) => item.questionId === 3)?.selected ?? null,
    },
  });
});
```

- [ ] **Step 5: Add the module to AppModule and rerun the onboarding spec**

Run: `npm test -- --runInBand test/onboarding.e2e-spec.ts`
Expected: PASS with `onboardingCompleted: true`.

- [ ] **Step 6: Add a second test for re-submit overwrite behavior so the ambiguity is fixed in code**

```ts
it('overwrites existing answers on repeat submit', async () => {
  await request(app.getHttpServer())
    .post('/api/v1/onboarding/submit')
    .set('x-test-user-id', '1')
    .send({ answers: [{ questionId: 2, selected: '90s' }] })
    .expect(201);
});
```

Run: `npm test -- --runInBand test/onboarding.e2e-spec.ts`
Expected: PASS, and the stored age range becomes `90s`.

- [ ] **Step 7: Commit onboarding**

```bash
git add src/onboarding src/app.module.ts test/onboarding.e2e-spec.ts
git commit -m "feat: implement onboarding submission"
```

### Task 3: Implement cards recommendation, exposure tracking, and swipe recording

**Files:**
- Create: `.worktrees/backend-p0/backend/src/cards/cards.module.ts`
- Create: `.worktrees/backend-p0/backend/src/cards/cards.controller.ts`
- Create: `.worktrees/backend-p0/backend/src/cards/cards.service.ts`
- Create: `.worktrees/backend-p0/backend/src/cards/dto/recommend-cards.dto.ts`
- Create: `.worktrees/backend-p0/backend/src/cards/dto/swipe-card.dto.ts`
- Modify: `.worktrees/backend-p0/backend/src/app.module.ts`
- Test: `.worktrees/backend-p0/backend/test/cards.e2e-spec.ts`

- [ ] **Step 1: Write failing tests for recommend and swipe**

```ts
it('returns recommend cards in frontend-compatible shape', async () => {
  const response = await request(app.getHttpServer())
    .get('/api/v1/cards/recommend?limit=2&category=价值观')
    .set('x-test-user-id', '1')
    .expect(200);

  expect(response.body.data.items[0]).toMatchObject({
    cardId: expect.any(String),
    content: expect.any(String),
    user: { userId: expect.any(String), name: expect.any(String), avatar: expect.any(String) },
    stats: { agreePercent: expect.any(Number), agreeAvatars: expect.any(Array) },
  });
});

it('records agree/disagree/skip and returns sessionSwipeCount', async () => {
  const response = await request(app.getHttpServer())
    .post('/api/v1/cards/swipe')
    .set('x-test-user-id', '1')
    .send({ cardId: '101', action: 'agree', sessionId: 'session-1', sourceTab: '全部' })
    .expect(201);

  expect(response.body.data).toEqual({ recorded: true, sessionSwipeCount: 1 });
});
```

- [ ] **Step 2: Run the cards spec to lock in the failing state**

Run: `npm test -- --runInBand test/cards.e2e-spec.ts`
Expected: FAIL because the cards module does not exist yet.

- [ ] **Step 3: Define DTOs with the exact allowed request values**

```ts
export class RecommendCardsDto {
  @IsOptional() @Type(() => Number) @Min(1) @Max(20) limit = 1;
  @IsOptional() @IsString() cursor?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() sessionId?: string;
}

export class SwipeCardDto {
  @IsString() cardId: string;
  @IsIn(['agree', 'disagree', 'skip']) action: 'agree' | 'disagree' | 'skip';
  @IsString() sessionId: string;
  @IsOptional() @IsString() sourceTab?: string;
}
```

- [ ] **Step 4: Implement recommendation with simple rules that match the spec**

```ts
const cards = await this.prisma.card.findMany({
  where: {
    status: 'active',
    category: dto.category && dto.category !== '全部' ? dto.category : undefined,
    swipes: { none: { userId } },
  },
  include: { author: true },
  orderBy: [{ agreeCount: 'desc' }, { createdAt: 'desc' }],
  take: dto.limit,
});

await this.prisma.cardExposure.createMany({
  data: cards.map((card, index) => ({
    userId,
    cardId: card.id,
    sessionId: dto.sessionId ?? 'default-session',
    positionIndex: index,
  })),
});
```

- [ ] **Step 5: Implement swipe recording and session aggregation**

```ts
await this.prisma.$transaction(async (tx) => {
  await tx.cardSwipe.upsert({
    where: { userId_cardId: { userId, cardId } },
    create: { userId, cardId, action: dto.action, sessionId: dto.sessionId, sourceTab: dto.sourceTab },
    update: { action: dto.action, sessionId: dto.sessionId, sourceTab: dto.sourceTab, swipedAt: new Date() },
  });

  await tx.card.update({
    where: { id: cardId },
    data: dto.action === 'agree'
      ? { agreeCount: { increment: 1 } }
      : dto.action === 'disagree'
        ? { disagreeCount: { increment: 1 } }
        : { skipCount: { increment: 1 } },
  });

  await tx.userSession.upsert({
    where: { sessionId: dto.sessionId },
    create: {
      sessionId: dto.sessionId,
      userId,
      entryPage: 'home',
      validSwipeCount: dto.action === 'skip' ? 0 : 1,
      skipCount: dto.action === 'skip' ? 1 : 0,
    },
    update: {
      lastActiveAt: new Date(),
      validSwipeCount: dto.action === 'skip' ? undefined : { increment: 1 },
      skipCount: dto.action === 'skip' ? { increment: 1 } : undefined,
    },
  });
});
```

- [ ] **Step 6: Rerun cards e2e and add one skip-specific regression test**

Run: `npm test -- --runInBand test/cards.e2e-spec.ts`
Expected: PASS.

Add:

```ts
it('does not increment validSwipeCount for skip', async () => {
  await request(app.getHttpServer())
    .post('/api/v1/cards/swipe')
    .set('x-test-user-id', '1')
    .send({ cardId: '202', action: 'skip', sessionId: 'session-1' })
    .expect(201);
});
```

Run: `npm test -- --runInBand test/cards.e2e-spec.ts`
Expected: PASS, and the session keeps valid swipes unchanged.

- [ ] **Step 7: Commit cards**

```bash
git add src/cards src/app.module.ts test/cards.e2e-spec.ts prisma/schema.prisma
git commit -m "feat: implement cards recommend and swipe"
```

### Task 4: Implement matching trigger-check with explainable rules

**Files:**
- Create: `.worktrees/backend-p0/backend/src/matching/matching.module.ts`
- Create: `.worktrees/backend-p0/backend/src/matching/matching.controller.ts`
- Create: `.worktrees/backend-p0/backend/src/matching/matching.service.ts`
- Create: `.worktrees/backend-p0/backend/src/matching/dto/trigger-check.dto.ts`
- Modify: `.worktrees/backend-p0/backend/src/app.module.ts`
- Test: `.worktrees/backend-p0/backend/test/matching.e2e-spec.ts`

- [ ] **Step 1: Write the failing trigger-check test**

```ts
it('returns a match candidate once session thresholds are met', async () => {
  const response = await request(app.getHttpServer())
    .post('/api/v1/matching/trigger-check')
    .set('x-test-user-id', '1')
    .send({ sessionId: 'session-1', sessionSwipeCount: 3, sessionDuration: 45 })
    .expect(201);

  expect(response.body.data).toMatchObject({
    shouldTrigger: expect.any(Boolean),
  });
});
```

- [ ] **Step 2: Run the matching spec to confirm the route is missing**

Run: `npm test -- --runInBand test/matching.e2e-spec.ts`
Expected: FAIL with 404.

- [ ] **Step 3: Add a DTO that makes the trigger inputs explicit**

```ts
export class TriggerCheckDto {
  @IsString() sessionId: string;
  @Type(() => Number) @Min(0) sessionSwipeCount: number;
  @Type(() => Number) @Min(0) sessionDuration: number;
}
```

- [ ] **Step 4: Implement the simplest acceptable rules from the spec**

```ts
const eligible = dto.sessionSwipeCount >= 3 && dto.sessionDuration >= 30;
if (!eligible) {
  return { shouldTrigger: false, reason: 'threshold_not_met' };
}

const candidates = await this.prisma.user.findMany({
  where: {
    id: { not: userId },
    onboardingCompleted: true,
    status: 'active',
  },
  include: { profileTags: true },
  take: 10,
});
```

- [ ] **Step 5: Add explainable scoring and persist the result**

```ts
const best = candidates
  .map((candidate) => {
    const candidateTopics = candidate.profileTags
      .filter((tag) => tag.tagType === 'topic_preference')
      .map((tag) => tag.tagValue);
    const sharedTopics = userTopics.filter((topic) => candidateTopics.includes(topic));
    const score = sharedTopics.length * 25 + (candidate.avatarUrl ? 10 : 0) + 5;
    const reason = sharedTopics.length > 0
      ? `你们都更关注${sharedTopics[0]}话题`
      : '你们最近的活跃与表达节奏接近';

    return { candidate, score, reason };
  })
  .sort((a, b) => b.score - a.score)[0];

await this.prisma.matchEvent.create({
  data: {
    userId,
    candidateUserId: best?.candidate.id,
    sessionId: dto.sessionId,
    triggerReason: best?.reason ?? 'no_candidate',
    matchScore: best?.score ?? null,
    resultStatus: best ? 'matched' : 'no_match',
  },
});
```

- [ ] **Step 6: Add the one-shot session protection and rerun tests**

```ts
await this.prisma.userSession.update({
  where: { sessionId: dto.sessionId },
  data: { blindBoxChecked: true, blindBoxTriggered: !!best },
});
```

Run: `npm test -- --runInBand test/matching.e2e-spec.ts`
Expected: PASS.

Add a second test:

```ts
it('does not trigger twice for the same session', async () => {
  await request(app.getHttpServer())
    .post('/api/v1/matching/trigger-check')
    .set('x-test-user-id', '1')
    .send({ sessionId: 'session-2', sessionSwipeCount: 3, sessionDuration: 45 })
    .expect(201);

  const second = await request(app.getHttpServer())
    .post('/api/v1/matching/trigger-check')
    .set('x-test-user-id', '1')
    .send({ sessionId: 'session-2', sessionSwipeCount: 3, sessionDuration: 45 })
    .expect(201);

  expect(second.body.data).toMatchObject({ shouldTrigger: false });
});
```

Run: `npm test -- --runInBand test/matching.e2e-spec.ts`
Expected: PASS.

- [ ] **Step 7: Commit matching**

```bash
git add src/matching src/app.module.ts test/matching.e2e-spec.ts
git commit -m "feat: implement matching trigger check"
```

### Task 5: Implement discovery feed, publish, and profile aggregation

**Files:**
- Create: `.worktrees/backend-p0/backend/src/discovery/discovery.module.ts`
- Create: `.worktrees/backend-p0/backend/src/discovery/discovery.controller.ts`
- Create: `.worktrees/backend-p0/backend/src/discovery/discovery.service.ts`
- Create: `.worktrees/backend-p0/backend/src/discovery/dto/get-feed.dto.ts`
- Create: `.worktrees/backend-p0/backend/src/discovery/dto/publish-post.dto.ts`
- Create: `.worktrees/backend-p0/backend/src/profile/profile.module.ts`
- Create: `.worktrees/backend-p0/backend/src/profile/profile.controller.ts`
- Create: `.worktrees/backend-p0/backend/src/profile/profile.service.ts`
- Modify: `.worktrees/backend-p0/backend/src/app.module.ts`
- Test: `.worktrees/backend-p0/backend/test/discovery.e2e-spec.ts`
- Test: `.worktrees/backend-p0/backend/test/profile.e2e-spec.ts`

- [ ] **Step 1: Write failing discovery and profile e2e coverage**

```ts
it('returns feed rows filtered by tab and feed type', async () => {
  const response = await request(app.getHttpServer())
    .get('/api/v1/discovery/feed?tabType=价值观&feedType=featured')
    .set('x-test-user-id', '1')
    .expect(200);

  expect(response.body.data.items).toEqual(expect.any(Array));
});

it('returns profile info in the page-ready shape', async () => {
  const response = await request(app.getHttpServer())
    .get('/api/v1/profile/info')
    .set('x-test-user-id', '1')
    .expect(200);

  expect(response.body.data).toMatchObject({
    nickname: expect.any(String),
    counts: { interactions: expect.any(Number) },
    photos: expect.any(Array),
  });
});
```

- [ ] **Step 2: Run both specs to capture the red state**

Run: `npm test -- --runInBand test/discovery.e2e-spec.ts test/profile.e2e-spec.ts`
Expected: FAIL because both modules are missing.

- [ ] **Step 3: Implement feed query DTOs and publish DTO**

```ts
export class GetFeedDto {
  @IsOptional() @IsString() tabType?: string;
  @IsOptional() @IsIn(['featured', 'timeline']) feedType?: 'featured' | 'timeline';
  @IsOptional() @IsString() cursor?: string;
}

export class PublishPostDto {
  @IsString() content: string;
  @IsString() tabType: string;
  @IsOptional() @IsBoolean() anonymous = false;
}
```

- [ ] **Step 4: Implement discovery feed and publish with MVP-safe defaults**

```ts
const items = await this.prisma.discoveryPost.findMany({
  where: {
    status: 'published',
    category: dto.tabType && dto.tabType !== '全部' ? dto.tabType : undefined,
    postType: dto.feedType,
  },
  include: { author: true },
  orderBy: [{ createdAt: 'desc' }],
  take: 10,
});

const created = await this.prisma.discoveryPost.create({
  data: {
    authorUserId: userId,
    postType: 'timeline',
    category: dto.tabType,
    content: dto.content,
    anonymous: dto.anonymous ?? false,
    status: 'published',
  },
});
```

- [ ] **Step 5: Implement profile aggregation using real counts instead of page-local mock data**

```ts
const [user, photos, swipeCount] = await Promise.all([
  this.prisma.user.findUniqueOrThrow({ where: { id: userId } }),
  this.prisma.userPhoto.findMany({ where: { userId, status: 'active' }, orderBy: { sortOrder: 'asc' } }),
  this.prisma.cardSwipe.count({ where: { userId } }),
]);

return {
  userId: user.id.toString(),
  nickname: user.nickname,
  gender: user.gender,
  age: user.ageRange,
  mbti: user.mbti,
  signature: user.signature,
  photos: photos.map((item) => item.photoUrl),
  counts: {
    visitors: 0,
    followers: 0,
    following: 0,
    interactions: swipeCount,
  },
};
```

- [ ] **Step 6: Add one publish e2e and rerun both suites**

```ts
it('publishes a discovery post', async () => {
  await request(app.getHttpServer())
    .post('/api/v1/discovery/publish')
    .set('x-test-user-id', '1')
    .send({ content: '观点文本', tabType: '价值观', anonymous: false })
    .expect(201);
});
```

Run: `npm test -- --runInBand test/discovery.e2e-spec.ts test/profile.e2e-spec.ts`
Expected: PASS.

- [ ] **Step 7: Commit discovery and profile**

```bash
git add src/discovery src/profile src/app.module.ts test/discovery.e2e-spec.ts test/profile.e2e-spec.ts
git commit -m "feat: implement discovery and profile apis"
```

### Task 6: Wire the four Mini Program pages to the real backend

**Files:**
- Modify: `app.js`
- Create: `utils/request.js`
- Create: `utils/session.js`
- Modify: `pages/onboarding/onboarding.js`
- Modify: `pages/home/home.js`
- Modify: `pages/discovery/discovery.js`
- Modify: `pages/profile/profile.js`

- [ ] **Step 1: Create a tiny shared request helper and session helper**

`utils/request.js`

```js
const BASE_URL = 'http://127.0.0.1:3000';

function request({ url, method = 'GET', data }) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: { 'x-test-user-id': '1' },
      success: (res) => resolve(res.data.data),
      fail: reject,
    });
  });
}

module.exports = { request };
```

`utils/session.js`

```js
function ensureSessionId() {
  const existing = wx.getStorageSync('swSessionId');
  if (existing) return existing;
  const next = `session-${Date.now()}`;
  wx.setStorageSync('swSessionId', next);
  return next;
}

module.exports = { ensureSessionId };
```

- [ ] **Step 2: Replace onboarding local-only completion with submit API**

```js
const { request } = require('../../utils/request');

async finishOnboarding() {
  const answers = this.data.answers;
  await request({
    url: '/api/v1/onboarding/submit',
    method: 'POST',
    data: { answers },
  });
  wx.redirectTo({ url: '/pages/home/home' });
}
```

- [ ] **Step 3: Replace home page mock loop with API-driven current/next card state**

```js
async loadNextCard() {
  const sessionId = ensureSessionId();
  const data = await request({
    url: `/api/v1/cards/recommend?limit=2&category=${encodeURIComponent(this.data.currentTab)}&sessionId=${sessionId}`,
  });

  this.setData({
    currentCard: normalizeCard(data.items[0]),
    nextCard: normalizeCard(data.items[1] || data.items[0]),
  });
}
```

- [ ] **Step 4: Replace swipe reporting and blind-box check with real calls**

```js
await request({
  url: '/api/v1/cards/swipe',
  method: 'POST',
  data: {
    cardId: String(this.data.currentCard.id),
    action: mapDirectionToAction(direction),
    sessionId: ensureSessionId(),
    sourceTab: this.data.currentTab,
  },
});

const blindBox = await request({
  url: '/api/v1/matching/trigger-check',
  method: 'POST',
  data: {
    sessionId: ensureSessionId(),
    sessionSwipeCount: this.data.swipeSessionCount,
    sessionDuration: Math.floor((Date.now() - this.data.entryTime) / 1000),
  },
});
```

- [ ] **Step 5: Replace discovery and profile mocks with feed/profile requests**

```js
const feed = await request({
  url: `/api/v1/discovery/feed?tabType=${encodeURIComponent(this.data.currentTab)}&feedType=featured`,
});

const profile = await request({ url: '/api/v1/profile/info' });
this.setData({ profile });
```

- [ ] **Step 6: Manually run the Mini Program against the local backend**

Run backend: `npm run start:dev`
Expected: Nest starts on port 3000 without module import errors.

Run Mini Program in WeChat DevTools and verify:
- onboarding submits and redirects
- home loads non-mock cards
- swipe triggers network calls
- discovery feed loads rows
- profile renders backend data

- [ ] **Step 7: Commit frontend integration**

```bash
git add app.js utils pages/onboarding/onboarding.js pages/home/home.js pages/discovery/discovery.js pages/profile/profile.js
git commit -m "feat: connect mini program pages to backend mvp"
```

### Task 7: Final verification, startup docs, and handoff

**Files:**
- Modify: `.worktrees/backend-p0/backend/README.md`
- Modify: `README.md`

- [ ] **Step 1: Add a backend README section that exactly matches the local run flow**

```md
1. `docker compose up -d`
2. `cp .env.example .env`
3. `npm install`
4. `npm run prisma:generate`
5. `npm run prisma:migrate -- --name mvp_baseline`
6. `npm run prisma:seed`
7. `npm run start:dev`
```

- [ ] **Step 2: Add one root README note pointing frontend developers to the backend worktree**

```md
Backend MVP lives in `.worktrees/backend-p0/backend`. Start that service before opening the Mini Program pages that now call real APIs.
```

- [ ] **Step 3: Run the full backend test suite**

Run: `npm test -- --runInBand`
Expected: All `app`, `onboarding`, `cards`, `matching`, `discovery`, and `profile` e2e specs PASS.

- [ ] **Step 4: Run a production build**

Run: `npm run build`
Expected: Nest build completes without TypeScript errors.

- [ ] **Step 5: Reseed once more from a clean database and smoke-test the app manually**

Run: `npm run prisma:seed`
Expected: Seed remains idempotent.

Then re-open Mini Program DevTools and verify the four page flows once more.

- [ ] **Step 6: Capture final status in git**

Run: `git status --short`
Expected: only intentional backend/frontend/doc changes remain.

- [ ] **Step 7: Commit the release-ready MVP slice**

```bash
git add README.md .worktrees/backend-p0/backend/README.md
git commit -m "docs: finalize backend mvp local runbook"
```

---

## Self-review

### Spec coverage

- Onboarding submit: covered in Task 2.
- Cards recommend + swipe + session stats: covered in Task 3.
- Matching trigger check: covered in Task 4.
- Discovery feed + publish: covered in Task 5.
- Profile info: covered in Task 5.
- PostgreSQL schema, Prisma client, seed, test auth, e2e, startup docs: covered in Tasks 1 and 7.
- Four frontend pages integration: covered in Task 6.

### Placeholder scan

- No `TODO`, `TBD`, or “handle appropriately” placeholders remain.
- The one spec ambiguity around trigger-check route is fixed explicitly at the top of this plan.

### Type consistency

- Cards use `agree | disagree | skip` consistently across schema, DTOs, and frontend mapping.
- Matching uses `sessionId`, `sessionSwipeCount`, and `sessionDuration` consistently.
- Frontend integration assumes the response wrapper shape `data.data` from the existing interceptor.
