import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/main';
import { resetDatabase } from './test-helpers';

describe('Profile (e2e)', () => {
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

  it('returns profile info in the page-ready shape', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/profile/info')
      .set('x-test-user-id', '1')
      .expect(200);

    expect(response.body.data).toMatchObject({
      nickname: expect.any(String),
      counts: {
        interactions: expect.any(Number),
      },
      photos: expect.any(Array),
    });
  });
});
