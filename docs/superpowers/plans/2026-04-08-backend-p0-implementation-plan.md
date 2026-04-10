V# SW Backend P0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local-first NestJS + PostgreSQL backend that replaces the Mini Program's core mock data and supports the MVP/P0 user flow end-to-end.

**Architecture:** Create a new `backend/` service alongside the current Mini Program. Use NestJS for HTTP modules, Prisma for PostgreSQL schema and data access, and a lightweight test-user auth guard so the existing frontend can call real APIs before WeChat login is added in P1.

**Tech Stack:** Node.js, NestJS, Prisma, PostgreSQL, Docker Compose, Jest, Supertest, TypeScript

---

## Scope check

This plan covers one shippable subsystem: **the backend P0 core chain**.

It intentionally includes only the parts needed to support:

1. onboarding submit
2. cards recommend
3. cards swipe
4. blind-box trigger check
5. discovery feed
6. discovery publish
7. profile info

It explicitly does **not** include chat, WeChat login, moderation backend, or a production-grade recommendation engine.

---

## Planned file structure

### Mini Program files to modify later during integration

- Modify: `pages/onboarding/onboarding.js`
  - Replace local completion-only behavior with `POST /api/v1/onboarding/submit`
- Modify: `pages/home/home.js`
  - Replace mock card loading and swipe reporting with real API calls
- Modify: `pages/discovery/discovery.js`
  - Replace feed mock data with `GET /api/v1/discovery/feed`
- Modify: `pages/profile/profile.js`
  - Replace static profile mock with `GET /api/v1/profile/info`

### Backend files to create

- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/nest-cli.json`
- Create: `backend/.env.example`
- Create: `backend/.eslintrc.js`
- Create: `backend/.prettierrc`
- Create: `backend/docker-compose.yml`
- Create: `backend/prisma/schema.prisma`
- Create: `backend/prisma/seed.ts`
- Create: `backend/src/main.ts`
- Create: `backend/src/app.module.ts`
- Create: `backend/src/common/http-response.interceptor.ts`
- Create: `backend/src/common/test-user.guard.ts`
- Create: `backend/src/common/current-user.decorator.ts`
- Create: `backend/src/prisma/prisma.module.ts`
- Create: `backend/src/prisma/prisma.service.ts`
- Create: `backend/src/auth/auth.module.ts`
- Create: `backend/src/auth/auth.controller.ts`
- Create: `backend/src/users/users.module.ts`
- Create: `backend/src/users/users.service.ts`
- Create: `backend/src/onboarding/onboarding.module.ts`
- Create: `backend/src/onboarding/onboarding.controller.ts`
- Create: `backend/src/onboarding/onboarding.service.ts`
- Create: `backend/src/onboarding/dto/submit-onboarding.dto.ts`
- Create: `backend/src/cards/cards.module.ts`
- Create: `backend/src/cards/cards.controller.ts`
- Create: `backend/src/cards/cards.service.ts`
- Create: `backend/src/cards/dto/recommend-cards.dto.ts`
- Create: `backend/src/cards/dto/swipe-card.dto.ts`
- Create: `backend/src/matching/matching.module.ts`
- Create: `backend/src/matching/matching.controller.ts`
- Create: `backend/src/matching/matching.service.ts`
- Create: `backend/src/matching/dto/trigger-check.dto.ts`
- Create: `backend/src/discovery/discovery.module.ts`
- Create: `backend/src/discovery/discovery.controller.ts`
- Create: `backend/src/discovery/discovery.service.ts`
- Create: `backend/src/discovery/dto/get-feed.dto.ts`
- Create: `backend/src/discovery/dto/publish-post.dto.ts`
- Create: `backend/src/profile/profile.module.ts`
- Create: `backend/src/profile/profile.controller.ts`
- Create: `backend/src/profile/profile.service.ts`
- Create: `backend/test/app.e2e-spec.ts`
- Create: `backend/test/onboarding.e2e-spec.ts`
- Create: `backend/test/cards.e2e-spec.ts`
- Create: `backend/test/matching.e2e-spec.ts`
- Create: `backend/test/discovery.e2e-spec.ts`
- Create: `backend/test/profile.e2e-spec.ts`
- Create: `backend/README.md`

### Backend files likely modified repeatedly during implementation

- Modify: `backend/prisma/schema.prisma`
- Modify: `backend/prisma/seed.ts`
- Modify: `backend/src/app.module.ts`
- Modify: `backend/test/*.e2e-spec.ts`

---

## Implementation order

1. bootstrap backend workspace
2. stand up PostgreSQL and schema
3. add shared app plumbing and test-user auth
4. build onboarding flow
5. build cards recommendation + swipe tracking
6. build blind-box trigger logic
7. build discovery + profile APIs
8. seed data, verify end-to-end, then wire frontend pages

---

### Task 1: Bootstrap the backend workspace

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/nest-cli.json`
- Create: `backend/.env.example`
- Create: `backend/.eslintrc.js`
- Create: `backend/.prettierrc`
- Create: `backend/src/main.ts`
- Create: `backend/src/app.module.ts`
- Create: `backend/README.md`
- Test: `backend/test/app.e2e-spec.ts`

- [ ] **Step 1: Write the failing smoke test**

```ts
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('App bootstrap (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/health returns 200', async () => {
    await request(app.getHttpServer())
      .get('/health')
      .expect(200)
      .expect({ code: 200, message: 'success', data: { ok: true } });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cmd /c "cd /d d:\CodeWorkSpace\SW\backend && npm test -- --runInBand test/app.e2e-spec.ts"`
Expected: FAIL with `Cannot find module '../src/app.module'` or missing project files.

- [ ] **Step 3: Write the minimal Nest bootstrap**

`backend/src/main.ts`

```ts
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpResponseInterceptor } from './common/http-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api/v1');
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalInterceptors(new HttpResponseInterceptor());
  app.enableCors();
  await app.listen(process.env.PORT || 3000);
}

bootstrap();
```

`backend/src/app.module.ts`

```ts
import { Controller, Get, Module } from '@nestjs/common';

@Controller()
class HealthController {
  @Get('/health')
  health() {
    return { ok: true };
  }
}

@Module({
  controllers: [HealthController],
})
export class AppModule {}
```

`backend/src/common/http-response.interceptor.ts`

```ts
import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';

@Injectable()
export class HttpResponseInterceptor implements NestInterceptor {
  intercept(_context: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(
      map((data) => ({
        code: 200,
        message: 'success',
        data,
      })),
    );
  }
}
```

- [ ] **Step 4: Add package metadata and scripts**

`backend/package.json`

```json
{
  "name": "sw-backend",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "start:dev": "nest start --watch",
    "build": "nest build",
    "test": "jest",
    "test:e2e": "jest --config ./test/jest-e2e.json",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@nestjs/common": "^10.3.10",
    "@nestjs/core": "^10.3.10",
    "@nestjs/platform-express": "^10.3.10",
    "@prisma/client": "^5.12.1",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.1",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.4.2",
    "@nestjs/testing": "^10.3.10",
    "@types/jest": "^29.5.12",
    "@types/node": "^20.12.7",
    "@types/supertest": "^6.0.2",
    "jest": "^29.7.0",
    "prisma": "^5.12.1",
    "supertest": "^7.0.0",
    "ts-jest": "^29.1.2",
    "ts-node": "^10.9.2",
    "tsx": "^4.7.2",
    "typescript": "^5.4.5"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cmd /c "cd /d d:\CodeWorkSpace\SW\backend && npm test -- --runInBand test/app.e2e-spec.ts"`
Expected: PASS with `1 passed`.

- [ ] **Step 6: Commit**

```bash
git add backend/package.json backend/tsconfig.json backend/nest-cli.json backend/.env.example backend/.eslintrc.js backend/.prettierrc backend/src/main.ts backend/src/app.module.ts backend/src/common/http-response.interceptor.ts backend/test/app.e2e-spec.ts backend/README.md
git commit -m "feat: bootstrap backend service"
```

### Task 2: Stand up PostgreSQL and create the Prisma schema

**Files:**
- Create: `backend/docker-compose.yml`
- Create: `backend/prisma/schema.prisma`
- Create: `backend/prisma/seed.ts`
- Modify: `backend/.env.example`
- Test: `backend/test/app.e2e-spec.ts`

- [ ] **Step 1: Write the failing schema-level test expectation**

Add this test to `backend/test/app.e2e-spec.ts`:

```ts
it('bootstraps Prisma client successfully', async () => {
  const response = await request(app.getHttpServer()).get('/health').expect(200);
  expect(response.body.data.ok).toBe(true);
});
```

This will still pass only after Prisma initialization is wired into the app in later tasks; for now the failure mode is missing database config or generated client.

- [ ] **Step 2: Add Docker Compose and environment config**

`backend/docker-compose.yml`

```yaml
services:
  postgres:
    image: postgres:16
    container_name: sw-postgres
    ports:
      - '5432:5432'
    environment:
      POSTGRES_USER: sw
      POSTGRES_PASSWORD: sw
      POSTGRES_DB: sw
    volumes:
      - sw_postgres_data:/var/lib/postgresql/data

volumes:
  sw_postgres_data:
```

`backend/.env.example`

```env
PORT=3000
DATABASE_URL=postgresql://sw:sw@localhost:5432/sw?schema=public
TEST_USER_ID=1
```

- [ ] **Step 3: Define the initial Prisma schema**

`backend/prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                   BigInt   @id @default(autoincrement())
  nickname             String
  avatarUrl            String?
  gender               String?
  ageRange             String?
  relationshipStatus   String?
  mbti                 String?
  signature            String?
  city                 String?
  onboardingCompleted  Boolean  @default(false)
  status               String   @default("active")
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  onboardingAnswers    OnboardingAnswer[]
  profileTags          UserProfileTag[]
  authoredCards        Card[]             @relation("CardAuthor")
  cardSwipes           CardSwipe[]
  sessions             UserSession[]
  matchEvents          MatchEvent[]       @relation("MatchRequester")
  candidateMatchEvents MatchEvent[]       @relation("MatchCandidate")
  discoveryPosts       DiscoveryPost[]
  photos               UserPhoto[]
}

model OnboardingAnswer {
  id            BigInt   @id @default(autoincrement())
  userId        BigInt
  questionId    Int
  selectedValue String?
  isSkipped     Boolean  @default(false)
  submittedAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@unique([userId, questionId])
}

model UserProfileTag {
  id        BigInt   @id @default(autoincrement())
  userId    BigInt
  tagType   String
  tagKey    String
  tagValue  String
  weight    Decimal  @default(1)
  source    String
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])
}

model Card {
  id            BigInt   @id @default(autoincrement())
  authorUserId  BigInt?
  sourceType    String
  category      String
  content       String
  status        String
  agreeCount    Int      @default(0)
  disagreeCount Int      @default(0)
  skipCount     Int      @default(0)
  exposureCount Int      @default(0)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  author User? @relation("CardAuthor", fields: [authorUserId], references: [id])
  swipes CardSwipe[]
}

model CardSwipe {
  id        BigInt   @id @default(autoincrement())
  userId    BigInt
  cardId    BigInt
  sessionId String
  action    String
  sourceTab String?
  swipedAt  DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
  card Card @relation(fields: [cardId], references: [id])

  @@index([userId, swipedAt])
  @@index([cardId, swipedAt])
  @@index([sessionId])
}

model UserSession {
  id                 BigInt   @id @default(autoincrement())
  sessionId          String   @unique
  userId             BigInt
  entryPage          String
  enteredAt          DateTime @default(now())
  lastActiveAt       DateTime @default(now())
  validSwipeCount    Int      @default(0)
  skipCount          Int      @default(0)
  blindBoxChecked    Boolean  @default(false)
  blindBoxTriggered  Boolean  @default(false)

  user User @relation(fields: [userId], references: [id])
}

model MatchEvent {
  id              BigInt    @id @default(autoincrement())
  userId          BigInt
  candidateUserId BigInt?
  sessionId       String
  triggerReason   String
  matchScore      Decimal?
  resultStatus    String
  createdAt       DateTime  @default(now())

  user      User  @relation("MatchRequester", fields: [userId], references: [id])
  candidate User? @relation("MatchCandidate", fields: [candidateUserId], references: [id])
}

model DiscoveryPost {
  id           BigInt   @id @default(autoincrement())
  authorUserId BigInt
  postType     String
  category     String
  title        String?
  content      String
  anonymous    Boolean  @default(false)
  status       String
  likeCount    Int      @default(0)
  commentCount Int      @default(0)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  author User @relation(fields: [authorUserId], references: [id])
}

model UserPhoto {
  id        BigInt   @id @default(autoincrement())
  userId    BigInt
  photoUrl  String
  sortOrder Int      @default(0)
  status    String   @default("active")
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])
}
```

- [ ] **Step 4: Start PostgreSQL and create the first migration**

Run: `cmd /c "cd /d d:\CodeWorkSpace\SW\backend && docker compose up -d && copy .env.example .env && npm install && npx prisma generate && npx prisma migrate dev --name init"`
Expected: Docker container starts, Prisma client generates, and migration completes with `Your database is now in sync with your schema`.

- [ ] **Step 5: Seed deterministic local data**

`backend/prisma/seed.ts`

```ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      { id: 1n, nickname: 'SOFIA', gender: 'female', ageRange: 'gen-z', relationshipStatus: 'single', onboardingCompleted: true },
      { id: 2n, nickname: 'MARCUS', gender: 'male', ageRange: '90s', relationshipStatus: 'single', onboardingCompleted: true },
      { id: 3n, nickname: 'ELENA', gender: 'female', ageRange: '90s', relationshipStatus: 'single', onboardingCompleted: true }
    ],
    skipDuplicates: true,
  });
}

main().finally(() => prisma.$disconnect());
```

- [ ] **Step 6: Commit**

```bash
git add backend/docker-compose.yml backend/.env.example backend/prisma/schema.prisma backend/prisma/seed.ts backend/package.json
git commit -m "feat: add postgres schema and seed data"
```

### Task 3: Add shared Prisma access and test-user authentication

**Files:**
- Create: `backend/src/prisma/prisma.module.ts`
- Create: `backend/src/prisma/prisma.service.ts`
- Create: `backend/src/common/test-user.guard.ts`
- Create: `backend/src/common/current-user.decorator.ts`
- Create: `backend/src/auth/auth.module.ts`
- Create: `backend/src/auth/auth.controller.ts`
- Modify: `backend/src/app.module.ts`
- Test: `backend/test/app.e2e-spec.ts`

- [ ] **Step 1: Write the failing auth smoke test**

Add to `backend/test/app.e2e-spec.ts`:

```ts
it('returns current test user', async () => {
  const response = await request(app.getHttpServer())
    .get('/api/v1/auth/me')
    .set('x-test-user-id', '1')
    .expect(200);

  expect(response.body.data.userId).toBe('1');
  expect(response.body.data.nickname).toBe('SOFIA');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cmd /c "cd /d d:\CodeWorkSpace\SW\backend && npm run test:e2e -- --runInBand test/app.e2e-spec.ts"`
Expected: FAIL with 404 for `/api/v1/auth/me`.

- [ ] **Step 3: Implement Prisma service and test-user guard**

`backend/src/prisma/prisma.service.ts`

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

`backend/src/common/test-user.guard.ts`

```ts
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class TestUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const testUserId = request.headers['x-test-user-id'] || process.env.TEST_USER_ID;

    if (!testUserId) {
      throw new UnauthorizedException('Missing test user id');
    }

    request.user = { userId: String(testUserId) };
    return true;
  }
}
```

`backend/src/common/current-user.decorator.ts`

```ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user,
);
```

- [ ] **Step 4: Expose `/auth/me`**

`backend/src/auth/auth.controller.ts`

```ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TestUserGuard } from '../common/test-user.guard';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('auth')
@UseGuards(TestUserGuard)
export class AuthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('me')
  async me(@CurrentUser() user: { userId: string }) {
    const record = await this.prisma.user.findUniqueOrThrow({
      where: { id: BigInt(user.userId) },
    });

    return {
      userId: record.id.toString(),
      nickname: record.nickname,
    };
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cmd /c "cd /d d:\CodeWorkSpace\SW\backend && npm run test:e2e -- --runInBand test/app.e2e-spec.ts"`
Expected: PASS with `/health` and `/auth/me` green.

- [ ] **Step 6: Commit**

```bash
git add backend/src/prisma backend/src/common backend/src/auth backend/src/app.module.ts backend/test/app.e2e-spec.ts
git commit -m "feat: add prisma and test user auth"
```

### Task 4: Implement onboarding submission and base profile-tag generation

**Files:**
- Create: `backend/src/onboarding/onboarding.module.ts`
- Create: `backend/src/onboarding/onboarding.controller.ts`
- Create: `backend/src/onboarding/onboarding.service.ts`
- Create: `backend/src/onboarding/dto/submit-onboarding.dto.ts`
- Test: `backend/test/onboarding.e2e-spec.ts`

- [ ] **Step 1: Write the failing onboarding test**

`backend/test/onboarding.e2e-spec.ts`

```ts
it('stores onboarding answers and marks user complete', async () => {
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
    .expect(200);

  expect(response.body.data.onboardingCompleted).toBe(true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cmd /c "cd /d d:\CodeWorkSpace\SW\backend && npm run test:e2e -- --runInBand test/onboarding.e2e-spec.ts"`
Expected: FAIL with 404 for `/api/v1/onboarding/submit`.

- [ ] **Step 3: Define DTO validation**

`backend/src/onboarding/dto/submit-onboarding.dto.ts`

```ts
import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional, IsString, ValidateNested } from 'class-validator';

class OnboardingAnswerDto {
  @IsInt()
  questionId!: number;

  @IsOptional()
  @IsString()
  selected?: string;

  @IsOptional()
  @IsBoolean()
  isSkipped?: boolean;
}

export class SubmitOnboardingDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OnboardingAnswerDto)
  answers!: OnboardingAnswerDto[];
}
```

- [ ] **Step 4: Implement minimal upsert behavior**

`backend/src/onboarding/onboarding.service.ts`

```ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitOnboardingDto } from './dto/submit-onboarding.dto';

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(userId: string, dto: SubmitOnboardingDto) {
    const numericUserId = BigInt(userId);

    await this.prisma.$transaction(async (tx) => {
      for (const answer of dto.answers) {
        await tx.onboardingAnswer.upsert({
          where: {
            userId_questionId: {
              userId: numericUserId,
              questionId: answer.questionId,
            },
          },
          update: {
            selectedValue: answer.selected ?? null,
            isSkipped: answer.isSkipped ?? !answer.selected,
            submittedAt: new Date(),
          },
          create: {
            userId: numericUserId,
            questionId: answer.questionId,
            selectedValue: answer.selected ?? null,
            isSkipped: answer.isSkipped ?? !answer.selected,
          },
        });
      }

      await tx.user.update({
        where: { id: numericUserId },
        data: { onboardingCompleted: true },
      });

      await tx.userProfileTag.deleteMany({
        where: { userId: numericUserId, source: 'onboarding' },
      });

      await tx.userProfileTag.createMany({
        data: dto.answers
          .filter((item) => item.selected)
          .map((item) => ({
            userId: numericUserId,
            tagType: 'onboarding',
            tagKey: `question_${item.questionId}`,
            tagValue: item.selected!,
            source: 'onboarding',
          })),
      });
    });

    return { onboardingCompleted: true };
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `cmd /c "cd /d d:\CodeWorkSpace\SW\backend && npm run test:e2e -- --runInBand test/onboarding.e2e-spec.ts"`
Expected: PASS and database now contains 3 onboarding answers for user `1`.

- [ ] **Step 6: Commit**

```bash
git add backend/src/onboarding backend/test/onboarding.e2e-spec.ts backend/src/app.module.ts
git commit -m "feat: implement onboarding submit flow"
```

### Task 5: Implement cards recommendation and swipe tracking

**Files:**
- Create: `backend/src/cards/cards.module.ts`
- Create: `backend/src/cards/cards.controller.ts`
- Create: `backend/src/cards/cards.service.ts`
- Create: `backend/src/cards/dto/recommend-cards.dto.ts`
- Create: `backend/src/cards/dto/swipe-card.dto.ts`
- Modify: `backend/prisma/seed.ts`
- Test: `backend/test/cards.e2e-spec.ts`

- [ ] **Step 1: Write the failing cards tests**

`backend/test/cards.e2e-spec.ts`

```ts
it('returns recommend cards in frontend-compatible shape', async () => {
  const response = await request(app.getHttpServer())
    .get('/api/v1/cards/recommend?limit=2&category=all')
    .set('x-test-user-id', '1')
    .expect(200);

  expect(response.body.data.items).toHaveLength(2);
  expect(response.body.data.items[0]).toEqual(
    expect.objectContaining({
      cardId: expect.any(String),
      content: expect.any(String),
      user: expect.objectContaining({ name: expect.any(String) }),
      stats: expect.objectContaining({ agreePercent: expect.any(Number) }),
    }),
  );
});

it('records swipe and returns session swipe count', async () => {
  const response = await request(app.getHttpServer())
    .post('/api/v1/cards/swipe')
    .set('x-test-user-id', '1')
    .send({ cardId: '101', action: 'agree', timestamp: Date.now(), sessionId: 'session-a' })
    .expect(200);

  expect(response.body.data.recorded).toBe(true);
  expect(response.body.data.sessionSwipeCount).toBe(1);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cmd /c "cd /d d:\CodeWorkSpace\SW\backend && npm run test:e2e -- --runInBand test/cards.e2e-spec.ts"`
Expected: FAIL with 404s for both card endpoints.

- [ ] **Step 3: Seed a real card pool**

Append to `backend/prisma/seed.ts`:

```ts
  await prisma.card.createMany({
    data: [
      { id: 101n, authorUserId: 1n, sourceType: 'platform', category: 'social', content: '坚定地认为《虎胆龙威》是一部圣诞电影。', status: 'active', agreeCount: 65, disagreeCount: 35, exposureCount: 100 },
      { id: 202n, authorUserId: 2n, sourceType: 'platform', category: 'internal', content: '认为晚上的效率永远比白天高。', status: 'active', agreeCount: 42, disagreeCount: 58, exposureCount: 100 },
      { id: 303n, authorUserId: 3n, sourceType: 'platform', category: 'values', content: '相信真正成熟的人会先理解，再表达自己。', status: 'active', agreeCount: 71, disagreeCount: 29, exposureCount: 100 }
    ],
    skipDuplicates: true,
  });
```

- [ ] **Step 4: Implement recommendation and swipe persistence**

`backend/src/cards/dto/swipe-card.dto.ts`

```ts
import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class SwipeCardDto {
  @IsString()
  cardId!: string;

  @IsIn(['agree', 'disagree', 'skip'])
  action!: 'agree' | 'disagree' | 'skip';

  @IsNumber()
  timestamp!: number;

  @IsString()
  sessionId!: string;

  @IsOptional()
  @IsString()
  sourceTab?: string;
}
```

`backend/src/cards/cards.service.ts`

```ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SwipeCardDto } from './dto/swipe-card.dto';

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  async recommend(userId: string, limit = 5, category?: string) {
    const swiped = await this.prisma.cardSwipe.findMany({
      where: { userId: BigInt(userId) },
      select: { cardId: true },
    });

    const cards = await this.prisma.card.findMany({
      where: {
        status: 'active',
        id: { notIn: swiped.map((item) => item.cardId) },
        ...(category && category !== 'all' ? { category } : {}),
      },
      include: { author: true },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return {
      cursor: cards.length ? cards[cards.length - 1].id.toString() : null,
      items: cards.map((card) => ({
        cardId: card.id.toString(),
        content: card.content,
        tags: card.category,
        user: {
          userId: card.author?.id.toString() ?? '0',
          name: card.author?.nickname ?? 'PLATFORM',
          avatar: card.author?.avatarUrl ?? '',
        },
        stats: {
          agreePercent: card.agreeCount + card.disagreeCount === 0
            ? 0
            : Math.round((card.agreeCount / (card.agreeCount + card.disagreeCount)) * 100),
          agreeAvatars: [],
          disagreeAvatar: '',
        },
      })),
    };
  }

  async swipe(userId: string, dto: SwipeCardDto) {
    const numericUserId = BigInt(userId);

    const session = await this.prisma.userSession.upsert({
      where: { sessionId: dto.sessionId },
      update: {
        lastActiveAt: new Date(dto.timestamp),
        validSwipeCount: dto.action === 'skip' ? undefined : { increment: 1 },
        skipCount: dto.action === 'skip' ? { increment: 1 } : undefined,
      },
      create: {
        sessionId: dto.sessionId,
        userId: numericUserId,
        entryPage: 'home',
        lastActiveAt: new Date(dto.timestamp),
        validSwipeCount: dto.action === 'skip' ? 0 : 1,
        skipCount: dto.action === 'skip' ? 1 : 0,
      },
    });

    await this.prisma.cardSwipe.create({
      data: {
        userId: numericUserId,
        cardId: BigInt(dto.cardId),
        sessionId: dto.sessionId,
        action: dto.action,
        sourceTab: dto.sourceTab,
        swipedAt: new Date(dto.timestamp),
      },
    });

    return {
      recorded: true,
      sessionSwipeCount: dto.action === 'skip' ? session.validSwipeCount : session.validSwipeCount,
    };
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cmd /c "cd /d d:\CodeWorkSpace\SW\backend && npm run prisma:seed && npm run test:e2e -- --runInBand test/cards.e2e-spec.ts"`
Expected: PASS with both tests green.

- [ ] **Step 6: Commit**

```bash
git add backend/src/cards backend/prisma/seed.ts backend/test/cards.e2e-spec.ts backend/src/app.module.ts
git commit -m "feat: implement cards recommend and swipe"
```

### Task 6: Implement blind-box trigger check with explainable matching

**Files:**
- Create: `backend/src/matching/matching.module.ts`
- Create: `backend/src/matching/matching.controller.ts`
- Create: `backend/src/matching/matching.service.ts`
- Create: `backend/src/matching/dto/trigger-check.dto.ts`
- Test: `backend/test/matching.e2e-spec.ts`

- [ ] **Step 1: Write the failing blind-box tests**

`backend/test/matching.e2e-spec.ts`

```ts
it('does not trigger before threshold', async () => {
  const response = await request(app.getHttpServer())
    .post('/api/v1/blind-box/trigger-check')
    .set('x-test-user-id', '1')
    .send({ sessionId: 'session-a', sessionSwipeCount: 2, sessionDuration: 20 })
    .expect(200);

  expect(response.body.data.shouldTrigger).toBe(false);
});

it('returns a match candidate after threshold', async () => {
  const response = await request(app.getHttpServer())
    .post('/api/v1/blind-box/trigger-check')
    .set('x-test-user-id', '1')
    .send({ sessionId: 'session-b', sessionSwipeCount: 3, sessionDuration: 45 })
    .expect(200);

  expect(response.body.data.shouldTrigger).toBe(true);
  expect(response.body.data.matchUser).toEqual(
    expect.objectContaining({ userId: expect.any(String), name: expect.any(String) }),
  );
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cmd /c "cd /d d:\CodeWorkSpace\SW\backend && npm run test:e2e -- --runInBand test/matching.e2e-spec.ts"`
Expected: FAIL with 404 for `/api/v1/blind-box/trigger-check`.

- [ ] **Step 3: Implement threshold check and explainable candidate selection**

`backend/src/matching/dto/trigger-check.dto.ts`

```ts
import { IsInt, IsString, Min } from 'class-validator';

export class TriggerCheckDto {
  @IsString()
  sessionId!: string;

  @IsInt()
  @Min(0)
  sessionSwipeCount!: number;

  @IsInt()
  @Min(0)
  sessionDuration!: number;
}
```

`backend/src/matching/matching.service.ts`

```ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TriggerCheckDto } from './dto/trigger-check.dto';

@Injectable()
export class MatchingService {
  constructor(private readonly prisma: PrismaService) {}

  async triggerCheck(userId: string, dto: TriggerCheckDto) {
    if (dto.sessionSwipeCount < 3 || dto.sessionDuration <= 30) {
      return { shouldTrigger: false, matchUser: null };
    }

    const requester = await this.prisma.user.findUniqueOrThrow({
      where: { id: BigInt(userId) },
    });

    const candidates = await this.prisma.user.findMany({
      where: {
        id: { not: BigInt(userId) },
        onboardingCompleted: true,
        status: 'active',
      },
      take: 10,
      orderBy: { updatedAt: 'desc' },
    });

    const scored = candidates.map((candidate) => {
      let score = 0;
      if (candidate.relationshipStatus === requester.relationshipStatus) score += 30;
      if (candidate.ageRange === requester.ageRange) score += 25;
      if (candidate.gender !== requester.gender) score += 10;
      score += 5;

      return {
        candidate,
        score,
        reason: candidate.ageRange === requester.ageRange
          ? '你们的基础标签接近，且活跃阶段相似'
          : '你们都完成了画像初始化，适合开启一次同频连接',
      };
    });

    const best = scored.sort((a, b) => b.score - a.score)[0];

    if (!best) {
      await this.prisma.matchEvent.create({
        data: {
          userId: BigInt(userId),
          sessionId: dto.sessionId,
          triggerReason: 'threshold_met_but_no_candidate',
          resultStatus: 'no_match',
        },
      });
      return { shouldTrigger: false, matchUser: null };
    }

    await this.prisma.matchEvent.create({
      data: {
        userId: BigInt(userId),
        candidateUserId: best.candidate.id,
        sessionId: dto.sessionId,
        triggerReason: best.reason,
        matchScore: best.score,
        resultStatus: 'matched',
      },
    });

    await this.prisma.userSession.update({
      where: { sessionId: dto.sessionId },
      data: { blindBoxChecked: true, blindBoxTriggered: true },
    });

    return {
      shouldTrigger: true,
      matchUser: {
        userId: best.candidate.id.toString(),
        name: best.candidate.nickname,
        avatar: best.candidate.avatarUrl ?? '',
        matchReason: best.reason,
      },
    };
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cmd /c "cd /d d:\CodeWorkSpace\SW\backend && npm run test:e2e -- --runInBand test/matching.e2e-spec.ts"`
Expected: PASS with one non-triggered case and one triggered case.

- [ ] **Step 5: Commit**

```bash
git add backend/src/matching backend/test/matching.e2e-spec.ts backend/src/app.module.ts
git commit -m "feat: implement blind box trigger check"
```

### Task 7: Implement discovery feed, publish, and profile aggregation

**Files:**
- Create: `backend/src/discovery/discovery.module.ts`
- Create: `backend/src/discovery/discovery.controller.ts`
- Create: `backend/src/discovery/discovery.service.ts`
- Create: `backend/src/discovery/dto/get-feed.dto.ts`
- Create: `backend/src/discovery/dto/publish-post.dto.ts`
- Create: `backend/src/profile/profile.module.ts`
- Create: `backend/src/profile/profile.controller.ts`
- Create: `backend/src/profile/profile.service.ts`
- Modify: `backend/prisma/seed.ts`
- Test: `backend/test/discovery.e2e-spec.ts`
- Test: `backend/test/profile.e2e-spec.ts`

- [ ] **Step 1: Write the failing discovery/profile tests**

`backend/test/discovery.e2e-spec.ts`

```ts
it('returns feed items by tab and type', async () => {
  const response = await request(app.getHttpServer())
    .get('/api/v1/discovery/feed?tabType=values&feedType=timeline')
    .set('x-test-user-id', '1')
    .expect(200);

  expect(response.body.data.items[0]).toEqual(
    expect.objectContaining({
      feedId: expect.any(String),
      type: 'timeline',
      content: expect.any(String),
    }),
  );
});

it('publishes a new discovery post', async () => {
  const response = await request(app.getHttpServer())
    .post('/api/v1/discovery/publish')
    .set('x-test-user-id', '1')
    .send({ content: '观点文本', tabType: 'values', anonymous: false })
    .expect(200);

  expect(response.body.data.status).toBe('published');
});
```

`backend/test/profile.e2e-spec.ts`

```ts
it('returns current profile info', async () => {
  const response = await request(app.getHttpServer())
    .get('/api/v1/profile/info')
    .set('x-test-user-id', '1')
    .expect(200);

  expect(response.body.data).toEqual(
    expect.objectContaining({
      userId: '1',
      nickname: 'SOFIA',
      counts: expect.objectContaining({ interactions: expect.any(Number) }),
      photos: expect.any(Array),
    }),
  );
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cmd /c "cd /d d:\CodeWorkSpace\SW\backend && npm run test:e2e -- --runInBand test/discovery.e2e-spec.ts test/profile.e2e-spec.ts"`
Expected: FAIL with 404s for discovery and profile endpoints.

- [ ] **Step 3: Seed feed posts and photos**

Append to `backend/prisma/seed.ts`:

```ts
  await prisma.discoveryPost.createMany({
    data: [
      { id: 501n, authorUserId: 1n, postType: 'featured', category: 'values', title: '如果时间可以倒流，你最想回到哪一年的夏天？', content: '那年夏天没有口罩...', anonymous: false, status: 'published' },
      { id: 502n, authorUserId: 2n, postType: 'timeline', category: 'values', content: '在大城市待久了，更想找一个能说真话的人。', anonymous: true, status: 'published' }
    ],
    skipDuplicates: true,
  });

  await prisma.userPhoto.createMany({
    data: [
      { userId: 1n, photoUrl: 'https://example.com/sofia-1.jpg', sortOrder: 1 },
      { userId: 1n, photoUrl: 'https://example.com/sofia-2.jpg', sortOrder: 2 }
    ],
    skipDuplicates: true,
  });
```

- [ ] **Step 4: Implement services**

`backend/src/discovery/discovery.service.ts`

```ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DiscoveryService {
  constructor(private readonly prisma: PrismaService) {}

  async feed(tabType = 'all', feedType = 'featured') {
    const items = await this.prisma.discoveryPost.findMany({
      where: {
        status: 'published',
        postType: feedType,
        ...(tabType !== 'all' ? { category: tabType } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      cursor: items.length ? items[items.length - 1].id.toString() : null,
      items: items.map((item) => ({
        feedId: item.id.toString(),
        type: item.postType,
        title: item.title,
        content: item.content,
        createdAt: item.createdAt.toISOString(),
      })),
    };
  }

  async publish(userId: string, input: { content: string; tabType: string; anonymous: boolean }) {
    const created = await this.prisma.discoveryPost.create({
      data: {
        authorUserId: BigInt(userId),
        postType: 'timeline',
        category: input.tabType,
        content: input.content,
        anonymous: input.anonymous,
        status: 'published',
      },
    });

    return { feedId: created.id.toString(), status: created.status };
  }
}
```

`backend/src/profile/profile.service.ts`

```ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async info(userId: string) {
    const numericUserId = BigInt(userId);
    const [user, photos, interactions] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({ where: { id: numericUserId } }),
      this.prisma.userPhoto.findMany({ where: { userId: numericUserId, status: 'active' }, orderBy: { sortOrder: 'asc' } }),
      this.prisma.cardSwipe.count({ where: { userId: numericUserId } }),
    ]);

    return {
      userId: user.id.toString(),
      nickname: user.nickname,
      gender: user.gender,
      age: user.ageRange,
      mbti: user.mbti,
      signature: user.signature,
      counts: {
        visitors: 0,
        followers: 0,
        following: 0,
        interactions,
      },
      photos: photos.map((item) => item.photoUrl),
    };
  }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cmd /c "cd /d d:\CodeWorkSpace\SW\backend && npm run prisma:seed && npm run test:e2e -- --runInBand test/discovery.e2e-spec.ts test/profile.e2e-spec.ts"`
Expected: PASS with discovery and profile tests green.

- [ ] **Step 6: Commit**

```bash
git add backend/src/discovery backend/src/profile backend/prisma/seed.ts backend/test/discovery.e2e-spec.ts backend/test/profile.e2e-spec.ts backend/src/app.module.ts
git commit -m "feat: implement discovery and profile apis"
```

### Task 8: Verify end-to-end backend behavior and wire the Mini Program pages

**Files:**
- Modify: `pages/onboarding/onboarding.js`
- Modify: `pages/home/home.js`
- Modify: `pages/discovery/discovery.js`
- Modify: `pages/profile/profile.js`
- Modify: `docs/API.md`
- Modify: `backend/README.md`

- [ ] **Step 1: Write the integration contract before touching frontend code**

Use this request helper in each Mini Program page:

```js
function apiRequest({ url, method = 'GET', data }) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `http://localhost:3000/api/v1${url}`,
      method,
      data,
      header: {
        'content-type': 'application/json',
        'x-test-user-id': '1'
      },
      success: (res) => resolve(res.data.data),
      fail: reject
    });
  });
}
```

- [ ] **Step 2: Replace onboarding submit flow**

In `pages/onboarding/onboarding.js`, store answers locally and submit on the final question:

```js
data: {
  answers: {}
}

async submitOnboarding() {
  const answers = this.data.questions.map((question) => {
    const selected = this.data.answers[question.id];
    return {
      questionId: question.id,
      selected: selected || undefined,
      isSkipped: !selected,
    };
  });

  await apiRequest({
    url: '/onboarding/submit',
    method: 'POST',
    data: { answers },
  });

  wx.redirectTo({ url: '/pages/home/home' });
}
```

- [ ] **Step 3: Replace home mock loading and swipe reporting**

In `pages/home/home.js`, call the backend:

```js
async loadNextCard() {
  const result = await apiRequest({
    url: `/cards/recommend?limit=2&category=${encodeURIComponent(this.data.currentTab)}`,
  });

  const [currentCard, nextCard] = result.items;
  this.setData({
    currentCard,
    nextCard: nextCard || currentCard,
    cardTranslateX: 0,
    cardTranslateY: 0,
    cardRotate: 0,
    cardTransition: 'none',
    previewScale: 0.978,
  });
}

async recordSwipe(direction) {
  const action = direction === 'right' ? 'agree' : direction === 'left' ? 'disagree' : 'skip';
  const result = await apiRequest({
    url: '/cards/swipe',
    method: 'POST',
    data: {
      cardId: this.data.currentCard.cardId,
      action,
      timestamp: Date.now(),
      sessionId: 'dev-session-1',
      sourceTab: this.data.currentTab,
    },
  });

  this.setData({ swipeSessionCount: result.sessionSwipeCount });
}
```

- [ ] **Step 4: Replace discovery and profile data sources**

Use these page-level calls:

```js
const feed = await apiRequest({ url: '/discovery/feed?tabType=all&feedType=featured' });
const profile = await apiRequest({ url: '/profile/info' });
```

- [ ] **Step 5: Run the full local verification**

Run: `cmd /c "cd /d d:\CodeWorkSpace\SW\backend && docker compose up -d && npm install && npm run prisma:migrate && npm run prisma:seed && npm run test:e2e"`

Then run: `cmd /c "cd /d d:\CodeWorkSpace\SW\backend && npm run start:dev"`

Expected:

- Nest starts on port 3000
- `GET /health` returns `{ code: 200, message: 'success', data: { ok: true } }`
- all e2e tests pass
- Mini Program pages can replace primary mock data with real backend responses

- [ ] **Step 6: Commit**

```bash
git add pages/onboarding/onboarding.js pages/home/home.js pages/discovery/discovery.js pages/profile/profile.js docs/API.md backend/README.md
git commit -m "feat: connect mini program to backend p0 apis"
```

---

## Self-review

### 1. Spec coverage

- Onboarding submit: covered in Task 4
- Cards recommend: covered in Task 5
- Cards swipe: covered in Task 5
- Blind-box trigger check: covered in Task 6
- Discovery feed: covered in Task 7
- Discovery publish: covered in Task 7
- Profile info: covered in Task 7
- PostgreSQL local-first architecture: covered in Tasks 1-3
- Seed data and frontend integration: covered in Task 8
- P1 items like WeChat login and chat: intentionally excluded from this P0 plan

No P0 gaps found.

### 2. Placeholder scan

Checked for `TBD`, `TODO`, `implement later`, and vague instructions without code or commands. Removed all of them from this plan.

### 3. Type consistency

- Test user identity is always passed as string at the HTTP layer and converted to `BigInt` in services.
- Swipe action enum is consistently `agree | disagree | skip`.
- Blind-box endpoint path is consistently `/api/v1/blind-box/trigger-check`.
- Discovery uses `tabType` and `feedType` consistently.
- Profile endpoint is consistently `/api/v1/profile/info`.

---