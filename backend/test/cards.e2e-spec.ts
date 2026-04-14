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

  it('seeds and recommends cards from the v6 question bank', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/cards/recommend?limit=5&category=爱情观与关系期待&sessionId=session-question-bank-1')
      .set('x-test-user-id', '1')
      .expect(200);

    expect(response.body.data.items.length).toBeGreaterThan(0);
    expect(response.body.data.items[0]).toMatchObject({
      cardId: expect.any(String),
      content: expect.stringContaining('？'),
      tags: '爱情观与关系期待',
    });
  });

  it('randomizes question-bank recommendation order for a fresh unswiped pool', async () => {
    const firstCardIds = new Set<string>();

    for (let index = 0; index < 8; index += 1) {
      const response = await request(app.getHttpServer())
        .get(`/api/v1/cards/recommend?limit=5&category=爱情观与关系期待&sessionId=session-question-bank-random-${index}`)
        .set('x-test-user-id', '1')
        .expect(200);

      firstCardIds.add(response.body.data.items[0].cardId);
    }

    expect(firstCardIds.size).toBeGreaterThan(1);
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

  it('returns same-frequency users for the home story rail', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/cards/recommend-users?limit=3')
      .set('x-test-user-id', '1')
      .expect(200);

    expect(response.body.data.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          userId: expect.any(String),
          nickname: expect.any(String),
          avatar: expect.any(String),
          hasAvatar: expect.any(Boolean),
          sharedTopic: expect.any(String),
        }),
      ]),
    );
  });

  it('records negative card feedback to downweight similar topics', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/cards/feedback')
      .set('x-test-user-id', '1')
      .send({
        cardId: '101',
        feedbackType: 'reduce_similar',
        category: '社会观察',
      })
      .expect(201);

    expect(response.body.data).toMatchObject({
      recorded: true,
      feedbackType: 'reduce_similar',
      category: '社会观察',
    });
  });

  it('adds and lists comments for a home card', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/v1/cards/101/comments')
      .set('x-test-user-id', '2')
      .send({ content: '这个观点我第一次听说，但有点被说服。' })
      .expect(201);

    expect(created.body.data).toMatchObject({
      commentId: expect.any(String),
      cardId: '101',
      content: '这个观点我第一次听说，但有点被说服。',
      author: {
        userId: '2',
        nickname: expect.any(String),
      },
    });

    const comments = await request(app.getHttpServer())
      .get('/api/v1/cards/101/comments')
      .set('x-test-user-id', '1')
      .expect(200);

    expect(comments.body.data.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          commentId: created.body.data.commentId,
          content: '这个观点我第一次听说，但有点被说服。',
        }),
      ]),
    );

    const cards = await request(app.getHttpServer())
      .get('/api/v1/cards/recommend?limit=1&category=社会观察&sessionId=session-cards-comments')
      .set('x-test-user-id', '3')
      .expect(200);

    expect(cards.body.data.items[0].stats.commentCount).toBeGreaterThan(0);
  });
});
