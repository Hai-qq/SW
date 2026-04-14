import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/main';
import { resetDatabase } from './test-helpers';

describe('Matching (e2e)', () => {
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

  it('returns a match candidate once session thresholds are met', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/cards/swipe')
      .set('x-test-user-id', '1')
      .send({ cardId: '303', action: 'agree', sessionId: 'session-match-1', sourceTab: '价值观' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/cards/swipe')
      .set('x-test-user-id', '1')
      .send({ cardId: '404', action: 'agree', sessionId: 'session-match-1', sourceTab: '旅行与探索' })
      .expect(201);

    await request(app.getHttpServer())
      .post('/api/v1/cards/swipe')
      .set('x-test-user-id', '1')
      .send({ cardId: '505', action: 'disagree', sessionId: 'session-match-1', sourceTab: '内心世界' })
      .expect(201);

    const response = await request(app.getHttpServer())
      .post('/api/v1/matching/trigger-check')
      .set('x-test-user-id', '1')
      .send({ sessionId: 'session-match-1', sessionSwipeCount: 3, sessionDuration: 45 })
      .expect(201);

    expect(response.body.data).toMatchObject({
      shouldTrigger: expect.any(Boolean),
    });
  });

  it('does not trigger twice for the same session', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/matching/trigger-check')
      .set('x-test-user-id', '1')
      .send({ sessionId: 'session-match-2', sessionSwipeCount: 3, sessionDuration: 45 })
      .expect(201);

    const second = await request(app.getHttpServer())
      .post('/api/v1/matching/trigger-check')
      .set('x-test-user-id', '1')
      .send({ sessionId: 'session-match-2', sessionSwipeCount: 3, sessionDuration: 45 })
      .expect(201);

    expect(second.body.data).toMatchObject({ shouldTrigger: false });
  });

  it('creates a connected relationship from a match result', async () => {
    const trigger = await request(app.getHttpServer())
      .post('/api/v1/matching/trigger-check')
      .set('x-test-user-id', '1')
      .send({ sessionId: 'session-match-3', sessionSwipeCount: 3, sessionDuration: 45 })
      .expect(201);

    const created = await request(app.getHttpServer())
      .post('/api/v1/matching/connections')
      .set('x-test-user-id', '1')
      .send({
        candidateUserId: trigger.body.data.matchUser.userId,
        action: 'connect',
      })
      .expect(200);

    expect(created.body.data).toMatchObject({
      connectionId: expect.any(String),
      status: 'connected',
    });
  });

  it('lists the current user connections', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/matching/connections')
      .set('x-test-user-id', '1')
      .expect(200);

    expect(Array.isArray(response.body.data.items)).toBe(true);
    expect(response.body.data.items[0]).toMatchObject({
      connectionId: expect.any(String),
      targetUser: {
        userId: expect.any(String),
        nickname: expect.any(String),
      },
      status: expect.any(String),
    });
  });
});
