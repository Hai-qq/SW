import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/main';
import { resetDatabase } from './test-helpers';

describe('Users bootstrap (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    resetDatabase();
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns onboarding for a newly logged-in user', async () => {
    const login = await request(app.getHttpServer())
      .post('/api/v1/auth/wechat-login')
      .send({ code: 'bootstrap-new-user' })
      .expect(200);

    const response = await request(app.getHttpServer())
      .get('/api/v1/users/bootstrap')
      .set('Authorization', `Bearer ${login.body.data.accessToken}`)
      .expect(200);

    expect(response.body.data).toMatchObject({
      userId: login.body.data.user.userId,
      avatarUrl: expect.any(String),
      onboardingCompleted: false,
      nextStep: 'onboarding',
    });
  });

  it('returns home for an onboarded user', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/users/bootstrap')
      .set('x-test-user-id', '1')
      .expect(200);

    expect(response.body.data).toMatchObject({
      userId: '1',
      avatarUrl: expect.any(String),
      onboardingCompleted: true,
      nextStep: 'home',
    });
  });
});
