import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/main';
import { PrismaService } from '../src/prisma/prisma.service';
import { resetDatabase } from './test-helpers';

describe('Auth (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    resetDatabase();
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates a new user and auth session on first wechat login', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/wechat-login')
      .send({ code: 'new-user-code' })
      .expect(200);

    expect(response.body.data).toMatchObject({
      accessToken: expect.any(String),
      user: {
        userId: expect.any(String),
        onboardingCompleted: false,
      },
    });
  });

  it('repairs a drifted user id sequence before creating a new wechat user', async () => {
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"User"', 'id'), 2, true);`,
    );

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/wechat-login')
      .send({ code: 'sequence-repair-code' })
      .expect(200);

    expect(BigInt(response.body.data.user.userId)).toBeGreaterThan(3n);
  });

  it('stores user profile fields collected by the mini program login flow', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/wechat-login')
      .send({
        code: 'profile-user-code',
        nickname: '微信昵称',
        avatarUrl: 'https://example.com/wechat-avatar.jpg',
      })
      .expect(200);

    expect(response.body.data.user).toMatchObject({
      nickname: '微信昵称',
      avatarUrl: 'https://example.com/wechat-avatar.jpg',
    });
  });

  it('reuses the same user on repeated wechat login', async () => {
    const first = await request(app.getHttpServer())
      .post('/api/v1/auth/wechat-login')
      .send({ code: 'existing-user-code' })
      .expect(200);

    const second = await request(app.getHttpServer())
      .post('/api/v1/auth/wechat-login')
      .send({ code: 'existing-user-code' })
      .expect(200);

    expect(second.body.data.user.userId).toBe(first.body.data.user.userId);
  });

  it('backfills unionid for an existing user when later wechat logins provide it', async () => {
    const first = await request(app.getHttpServer())
      .post('/api/v1/auth/wechat-login')
      .send({ code: 'existing-user-code' })
      .expect(200);

    const second = await request(app.getHttpServer())
      .post('/api/v1/auth/wechat-login')
      .send({ code: 'existing-user-with-unionid-code' })
      .expect(200);

    expect(second.body.data.user.userId).toBe(first.body.data.user.userId);
  });

  it('resolves current user from Authorization bearer token', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/wechat-login')
      .send({ code: 'token-user-code' })
      .expect(200);

    const response = await request(app.getHttpServer())
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${login.body.data.accessToken}`)
      .expect(200);

    expect(response.body.data.userId).toBe(login.body.data.user.userId);
  });
});
