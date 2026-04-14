import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/main';
import { resetDatabase } from './test-helpers';

describe('Profile Editing (e2e)', () => {
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

  it('returns expanded editable profile fields and photo objects', async () => {
    const response = await request(app.getHttpServer())
      .get('/api/v1/profile/info')
      .set('x-test-user-id', '1')
      .expect(200);

    expect(response.body.data).toMatchObject({
      userId: '1',
      nickname: expect.any(String),
      city: expect.any(String),
      relationshipStatus: expect.any(String),
      photos: expect.arrayContaining([
        expect.objectContaining({
          photoId: expect.any(String),
          photoUrl: expect.any(String),
          sortOrder: expect.any(Number),
        }),
      ]),
    });
  });

  it('updates editable base profile fields and returns the saved profile', async () => {
    await request(app.getHttpServer())
      .patch('/api/v1/profile/info')
      .set('x-test-user-id', '1')
      .send({
        nickname: '林深处的麋鹿',
        signature: '在喧嚣里寻找同频',
        mbti: 'INFJ',
        city: 'Shanghai',
        gender: 'female',
        ageRange: 'gen-z',
        relationshipStatus: 'single',
      })
      .expect(200)
      .expect({
        code: 200,
        message: 'success',
        data: { updated: true },
      });

    const profile = await request(app.getHttpServer())
      .get('/api/v1/profile/info')
      .set('x-test-user-id', '1')
      .expect(200);

    expect(profile.body.data.nickname).toBe('林深处的麋鹿');
    expect(profile.body.data.signature).toBe('在喧嚣里寻找同频');
    expect(profile.body.data.city).toBe('Shanghai');
  });

  it('adds a photo to the end of the photo wall', async () => {
    const before = await request(app.getHttpServer())
      .get('/api/v1/profile/info')
      .set('x-test-user-id', '1')
      .expect(200);

    const response = await request(app.getHttpServer())
      .post('/api/v1/profile/photos')
      .set('x-test-user-id', '1')
      .send({ photoUrl: 'https://example.com/photos/new-photo.jpg' })
      .expect(200);

    expect(response.body.data).toMatchObject({
      created: true,
      photoId: expect.any(String),
    });

    const after = await request(app.getHttpServer())
      .get('/api/v1/profile/info')
      .set('x-test-user-id', '1')
      .expect(200);

    expect(after.body.data.photos).toHaveLength(before.body.data.photos.length + 1);
    expect(after.body.data.photos.at(-1)).toMatchObject({
      photoId: response.body.data.photoId,
      photoUrl: 'https://example.com/photos/new-photo.jpg',
      sortOrder: before.body.data.photos.length,
    });
  });

  it('deletes one of the current user photos', async () => {
    const before = await request(app.getHttpServer())
      .get('/api/v1/profile/info')
      .set('x-test-user-id', '1')
      .expect(200);

    const targetPhoto = before.body.data.photos[0];

    await request(app.getHttpServer())
      .delete(`/api/v1/profile/photos/${targetPhoto.photoId}`)
      .set('x-test-user-id', '1')
      .expect(200)
      .expect({
        code: 200,
        message: 'success',
        data: { deleted: true },
      });

    const after = await request(app.getHttpServer())
      .get('/api/v1/profile/info')
      .set('x-test-user-id', '1')
      .expect(200);

    expect(after.body.data.photos).toHaveLength(before.body.data.photos.length - 1);
    expect(after.body.data.photos.find((item: { photoId: string }) => item.photoId === targetPhoto.photoId)).toBeUndefined();
    expect(after.body.data.photos.map((item: { sortOrder: number }) => item.sortOrder)).toEqual(
      after.body.data.photos.map((_: unknown, index: number) => index),
    );
  });

  it('reorders photos', async () => {
    resetDatabase();

    const before = await request(app.getHttpServer())
      .get('/api/v1/profile/info')
      .set('x-test-user-id', '1')
      .expect(200);

    const reversedItems = [...before.body.data.photos]
      .reverse()
      .map((item: { photoId: string }, index: number) => ({
        photoId: item.photoId,
        sortOrder: index,
      }));

    await request(app.getHttpServer())
      .patch('/api/v1/profile/photos/sort')
      .set('x-test-user-id', '1')
      .send({ items: reversedItems })
      .expect(200)
      .expect({
        code: 200,
        message: 'success',
        data: { updated: true },
      });

    const after = await request(app.getHttpServer())
      .get('/api/v1/profile/info')
      .set('x-test-user-id', '1')
      .expect(200);

    expect(after.body.data.photos.map((item: { photoId: string }) => item.photoId)).toEqual(
      reversedItems.map((item) => item.photoId),
    );
    expect(after.body.data.photos.map((item: { sortOrder: number }) => item.sortOrder)).toEqual([0, 1]);
  });
});
