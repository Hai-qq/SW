import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/main';
import { resetDatabase } from './test-helpers';

describe('Cards (e2e)', () => {
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

  it('returns recommend cards in frontend-compatible shape', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/cards/recommend?limit=2&category=价值观&sessionId=session-cards-1')
      .set('x-test-user-id', '1')
      .expect(200);

    expect(response.body.data.items[0]).toMatchObject({
      cardId: expect.any(String),
      content: expect.any(String),
      user: {
        userId: expect.any(String),
        name: expect.any(String),
        avatar: expect.any(String),
      },
      stats: {
        agreePercent: expect.any(Number),
        agreeAvatars: expect.any(Array),
      },
    });
  });

  it('records agree/disagree/skip and returns sessionSwipeCount', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/cards/swipe')
      .set('x-test-user-id', '1')
      .send({
        cardId: '101',
        action: 'agree',
        sessionId: 'session-cards-2',
        sourceTab: '全部',
      })
      .expect(201);

    expect(response.body.data).toEqual({ recorded: true, sessionSwipeCount: 1 });
  });

  it('does not increment validSwipeCount for skip', async () => {
    await request(app.getHttpServer())
      .post('/api/v1/cards/swipe')
      .set('x-test-user-id', '1')
      .send({
        cardId: '202',
        action: 'skip',
        sessionId: 'session-cards-2',
      })
      .expect(201);
  });
});
