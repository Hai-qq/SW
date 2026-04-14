import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/main';
import { resetDatabase } from './test-helpers';

describe('Discovery (e2e)', () => {
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

  it('returns feed rows filtered by tab and feed type', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/discovery/feed?tabType=价值观&feedType=featured')
      .set('x-test-user-id', '1')
      .expect(200);

    expect(response.body.data.items).toEqual(expect.any(Array));
  });

  it('does not return draft or hidden posts in the public feed', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/discovery/feed?tabType=全部&feedType=timeline')
      .set('x-test-user-id', '1')
      .expect(200);

    expect(
      response.body.data.items.every(
        (item: { status?: string }) => item.status === 'published',
      ),
    ).toBe(true);
  });

  it('saves a discovery post as draft', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/discovery/publish')
      .set('x-test-user-id', '1')
      .send({
        content: '这是一条草稿内容',
        tabType: '价值观',
        anonymous: false,
        action: 'draft',
      })
      .expect(201);

    expect(response.body.data).toMatchObject({
      feedId: expect.any(String),
      status: 'draft',
    });
  });

  it('publishes a discovery post when action is publish', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/discovery/publish')
      .set('x-test-user-id', '1')
      .send({
        content: '这是一条正式发布内容',
        tabType: '价值观',
        anonymous: false,
        action: 'publish',
      })
      .expect(201);

    expect(response.body.data).toMatchObject({
      feedId: expect.any(String),
      status: 'published',
    });
  });

  it('returns the current user posts across statuses', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/discovery/my-posts')
      .set('x-test-user-id', '1')
      .expect(200);

    expect(response.body.data.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          feedId: expect.any(String),
          status: expect.stringMatching(/draft|published|hidden/),
        }),
      ]),
    );
  });

  it('filters the current user posts by status', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/discovery/my-posts?status=draft')
      .set('x-test-user-id', '1')
      .expect(200);

    expect(
      response.body.data.items.every(
        (item: { status: string }) => item.status === 'draft',
      ),
    ).toBe(true);
  });

  it('likes a discovery post once per user and reflects my reaction in feed', async () => {
    const liked = await request(app.getHttpServer())
      .post('/api/v1/discovery/posts/501/like')
      .set('x-test-user-id', '2')
      .expect(200);

    expect(liked.body.data).toMatchObject({
      feedId: '501',
      liked: true,
      likeCount: expect.any(Number),
    });

    const feed = await request(app.getHttpServer())
      .get('/api/v1/discovery/feed?tabType=价值观&feedType=featured')
      .set('x-test-user-id', '2')
      .expect(200);

    expect(feed.body.data.items[0].stats).toMatchObject({
      likedByMe: true,
      likeCount: liked.body.data.likeCount,
    });
  });

  it('adds and lists comments for a discovery post', async () => {
    const created = await request(app.getHttpServer())
      .post('/api/v1/discovery/posts/501/comments')
      .set('x-test-user-id', '2')
      .send({ content: '这句我也很有共鸣。' })
      .expect(201);

    expect(created.body.data).toMatchObject({
      commentId: expect.any(String),
      content: '这句我也很有共鸣。',
      author: {
        userId: '2',
        nickname: expect.any(String),
      },
    });

    const comments = await request(app.getHttpServer())
      .get('/api/v1/discovery/posts/501/comments')
      .set('x-test-user-id', '1')
      .expect(200);

    expect(comments.body.data.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          commentId: created.body.data.commentId,
          content: '这句我也很有共鸣。',
        }),
      ]),
    );
  });
});
