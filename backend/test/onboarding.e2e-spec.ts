import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/main';
import { resetDatabase } from './test-helpers';

describe('Onboarding (e2e)', () => {
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

  it('overwrites existing answers on repeat submit', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/onboarding/submit')
      .set('x-test-user-id', '1')
      .send({
        answers: [{ questionId: 2, selected: '90s' }],
      })
      .expect(201);
  });
});
