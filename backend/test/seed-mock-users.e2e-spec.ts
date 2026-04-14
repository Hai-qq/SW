import { PrismaClient } from '@prisma/client';
import { resetDatabase } from './test-helpers';

describe('Mock user seed (e2e)', () => {
  const prisma = new PrismaClient();

  beforeAll(() => {
    resetDatabase();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('seeds exactly three mock users with avatars and published posts', async () => {
    const users = await prisma.user.findMany({
      orderBy: { id: 'asc' },
      include: {
        photos: {
          where: { status: 'active' },
          orderBy: { sortOrder: 'asc' },
        },
        discoveryPosts: {
          where: { status: 'published' },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    expect(users).toHaveLength(3);
    expect(users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          nickname: expect.any(String),
          avatarUrl: expect.any(String),
          photos: expect.arrayContaining([
            expect.objectContaining({
              photoUrl: expect.any(String),
            }),
          ]),
          discoveryPosts: expect.arrayContaining([
            expect.objectContaining({
              content: expect.any(String),
              status: 'published',
            }),
          ]),
        }),
      ]),
    );

    users.forEach((user) => {
      expect(user.avatarUrl).toBeTruthy();
      expect(user.photos.length).toBeGreaterThan(0);
      expect(user.photos[0].photoUrl).toBeTruthy();
      expect(user.discoveryPosts.length).toBeGreaterThan(0);
    });
  });
});
