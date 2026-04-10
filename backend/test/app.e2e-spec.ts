import { resetDatabase } from './test-helpers';
import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/main';

describe('App bootstrap (e2e)', () => {
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

  it('/api/v1/health returns wrapped data', async () => {
    await request(app.getHttpServer())
      .get('/api/v1/health')
      .set('x-test-user-id', '1')
      .expect(200)
      .expect({
        code: 200,
        message: 'success',
        data: { ok: true, userId: '1' },
      });
  });

  it('uses the wrapped health contract consistently', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/health')
      .set('x-test-user-id', '1')
      .expect(200);

    expect(response.body).toEqual({
      code: 200,
      message: 'success',
      data: { ok: true, userId: '1' },
    });
  });
});
