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

  it('publishes a discovery post', async () => {
    const response = await request(app.getHttpServer())
      .post('/api/v1/discovery/publish')
      .set('x-test-user-id', '1')
      .send({ content: '观点文本', tabType: '价值观', anonymous: false })
      .expect(201);

    expect(response.body.data).toMatchObject({
      feedId: expect.any(String),
      status: 'published',
    });
  });
});
