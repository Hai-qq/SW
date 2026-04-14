import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/main';
import { resetDatabase } from './test-helpers';

describe('Chat (e2e)', () => {
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

  it('opens a conversation from a connected relationship', async () => {
    const connections = await request(app.getHttpServer())
      .get('/api/v1/matching/connections?status=connected')
      .set('x-test-user-id', '1')
      .expect(200);

    const response = await request(app.getHttpServer())
      .post('/api/v1/chat/conversations')
      .set('x-test-user-id', '1')
      .send({ connectionId: connections.body.data.items[0].connectionId })
      .expect(200);

    expect(response.body.data).toMatchObject({
      conversationId: expect.any(String),
      peer: {
        userId: expect.any(String),
        nickname: expect.any(String),
      },
    });
  });

  it('rejects opening a conversation from a hidden relationship', async () => {
    const hidden = await request(app.getHttpServer())
      .get('/api/v1/matching/connections?status=hidden')
      .set('x-test-user-id', '1')
      .expect(200);

    await request(app.getHttpServer())
      .post('/api/v1/chat/conversations')
      .set('x-test-user-id', '1')
      .send({ connectionId: hidden.body.data.items[0].connectionId })
      .expect(400);
  });

  it('sends and lists text messages for a conversation', async () => {
    const connections = await request(app.getHttpServer())
      .get('/api/v1/matching/connections?status=connected')
      .set('x-test-user-id', '1')
      .expect(200);

    const opened = await request(app.getHttpServer())
      .post('/api/v1/chat/conversations')
      .set('x-test-user-id', '1')
      .send({ connectionId: connections.body.data.items[0].connectionId })
      .expect(200);

    const conversationId = opened.body.data.conversationId;

    const sent = await request(app.getHttpServer())
      .post(`/api/v1/chat/conversations/${conversationId}/messages`)
      .set('x-test-user-id', '1')
      .send({ content: '看到你的想法很有共鸣。' })
      .expect(200);

    expect(sent.body.data).toMatchObject({
      messageId: expect.any(String),
      sent: true,
    });

    const messages = await request(app.getHttpServer())
      .get(`/api/v1/chat/conversations/${conversationId}/messages`)
      .set('x-test-user-id', '1')
      .expect(200);

    expect(messages.body.data.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          messageId: sent.body.data.messageId,
          content: '看到你的想法很有共鸣。',
          messageType: 'text',
          isMine: true,
        }),
      ]),
    );

    const conversations = await request(app.getHttpServer())
      .get('/api/v1/chat/conversations')
      .set('x-test-user-id', '1')
      .expect(200);

    expect(conversations.body.data.items[0]).toMatchObject({
      conversationId,
      lastMessageText: '看到你的想法很有共鸣。',
    });
  });

  it('tracks unread count and marks a conversation as read', async () => {
    const connections = await request(app.getHttpServer())
      .get('/api/v1/matching/connections?status=connected')
      .set('x-test-user-id', '1')
      .expect(200);

    const opened = await request(app.getHttpServer())
      .post('/api/v1/chat/conversations')
      .set('x-test-user-id', '1')
      .send({ connectionId: connections.body.data.items[0].connectionId })
      .expect(200);

    const conversationId = opened.body.data.conversationId;

    await request(app.getHttpServer())
      .post(`/api/v1/chat/conversations/${conversationId}/messages`)
      .set('x-test-user-id', '2')
      .send({ content: '我也想继续聊聊这个。' })
      .expect(200);

    const unread = await request(app.getHttpServer())
      .get('/api/v1/chat/conversations')
      .set('x-test-user-id', '1')
      .expect(200);

    expect(unread.body.data.items[0]).toMatchObject({
      conversationId,
      unreadCount: 1,
    });

    await request(app.getHttpServer())
      .post(`/api/v1/chat/conversations/${conversationId}/read`)
      .set('x-test-user-id', '1')
      .expect(200);

    const read = await request(app.getHttpServer())
      .get('/api/v1/chat/conversations')
      .set('x-test-user-id', '1')
      .expect(200);

    expect(read.body.data.items[0]).toMatchObject({
      conversationId,
      unreadCount: 0,
    });
  });

  it('paginates messages before a cursor', async () => {
    const connections = await request(app.getHttpServer())
      .get('/api/v1/matching/connections?status=connected')
      .set('x-test-user-id', '1')
      .expect(200);

    const opened = await request(app.getHttpServer())
      .post('/api/v1/chat/conversations')
      .set('x-test-user-id', '1')
      .send({ connectionId: connections.body.data.items[0].connectionId })
      .expect(200);

    const conversationId = opened.body.data.conversationId;

    const first = await request(app.getHttpServer())
      .post(`/api/v1/chat/conversations/${conversationId}/messages`)
      .set('x-test-user-id', '1')
      .send({ content: '第一条分页测试。' })
      .expect(200);

    const second = await request(app.getHttpServer())
      .post(`/api/v1/chat/conversations/${conversationId}/messages`)
      .set('x-test-user-id', '1')
      .send({ content: '第二条分页测试。' })
      .expect(200);

    const page = await request(app.getHttpServer())
      .get(`/api/v1/chat/conversations/${conversationId}/messages?limit=1&before=${second.body.data.messageId}`)
      .set('x-test-user-id', '1')
      .expect(200);

    expect(page.body.data.items).toEqual([
      expect.objectContaining({
        messageId: first.body.data.messageId,
        content: '第一条分页测试。',
      }),
    ]);
    expect(page.body.data.nextCursor).toEqual(expect.any(String));
  });
});
