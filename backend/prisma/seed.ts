import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { loadBackendEnv } from '../src/common/load-backend-env';

loadBackendEnv(path.resolve(__dirname, '..'));

const prisma = new PrismaClient();

async function main() {
  await prisma.userPhoto.deleteMany();
  await prisma.discoveryPost.deleteMany();
  await prisma.matchEvent.deleteMany();
  await prisma.cardSwipe.deleteMany();
  await prisma.userSession.deleteMany();
  await prisma.cardExposure.deleteMany();
  await prisma.card.deleteMany();
  await prisma.userProfileTag.deleteMany();
  await prisma.onboardingAnswer.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      {
        id: 1n,
        nickname: 'SOFIA',
        avatarUrl: 'https://example.com/avatars/sofia.jpg',
        gender: 'female',
        ageRange: 'gen-z',
        relationshipStatus: 'single',
        mbti: 'INFJ',
        signature: '先理解，再表达。',
        city: 'Shanghai',
        onboardingCompleted: true,
      },
      {
        id: 2n,
        nickname: 'MARCUS',
        avatarUrl: 'https://example.com/avatars/marcus.jpg',
        gender: 'male',
        ageRange: '90s',
        relationshipStatus: 'single',
        mbti: 'INTJ',
        signature: '夜晚效率更高。',
        city: 'Beijing',
        onboardingCompleted: true,
      },
      {
        id: 3n,
        nickname: 'ELENA',
        avatarUrl: 'https://example.com/avatars/elena.jpg',
        gender: 'female',
        ageRange: '90s',
        relationshipStatus: 'single',
        mbti: 'ENFJ',
        signature: '相信温柔也有力量。',
        city: 'Hangzhou',
        onboardingCompleted: true,
      },
      {
        id: 4n,
        nickname: 'JULI',
        avatarUrl: 'https://example.com/avatars/juli.jpg',
        gender: 'female',
        ageRange: 'gen-z',
        relationshipStatus: 'single',
        mbti: 'ENFP',
        signature: '喜欢旅行和探索。',
        city: 'Chengdu',
        onboardingCompleted: true,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.userProfileTag.createMany({
    data: [
      { userId: 1n, tagType: 'topic_preference', tagKey: 'topic', tagValue: '价值观', source: 'onboarding' },
      { userId: 1n, tagType: 'viewpoint_style', tagKey: 'style', tagValue: 'empathetic', source: 'behavior' },
      { userId: 2n, tagType: 'topic_preference', tagKey: 'topic', tagValue: '内心世界', source: 'behavior' },
      { userId: 2n, tagType: 'viewpoint_style', tagKey: 'style', tagValue: 'rational', source: 'behavior' },
      { userId: 3n, tagType: 'topic_preference', tagKey: 'topic', tagValue: '价值观', source: 'behavior' },
      { userId: 3n, tagType: 'viewpoint_style', tagKey: 'style', tagValue: 'warm', source: 'behavior' },
      { userId: 4n, tagType: 'topic_preference', tagKey: 'topic', tagValue: '旅行与探索', source: 'onboarding' },
      { userId: 4n, tagType: 'viewpoint_style', tagKey: 'style', tagValue: 'curious', source: 'behavior' },
    ],
    skipDuplicates: true,
  });

  await prisma.card.createMany({
    data: [
      {
        id: 101n,
        authorUserId: 1n,
        sourceType: 'platform',
        category: '社会观察',
        content: '坚定地认为《虎胆龙威》是一部圣诞电影。',
        status: 'active',
        agreeCount: 65,
        disagreeCount: 35,
      },
      {
        id: 202n,
        authorUserId: 2n,
        sourceType: 'platform',
        category: '内心世界',
        content: '认为晚上的效率永远比白天高。',
        status: 'active',
        agreeCount: 42,
        disagreeCount: 58,
      },
      {
        id: 303n,
        authorUserId: 3n,
        sourceType: 'platform',
        category: '价值观',
        content: '真正成熟的人会先理解，再表达自己。',
        status: 'active',
        agreeCount: 71,
        disagreeCount: 29,
      },
      {
        id: 404n,
        authorUserId: 4n,
        sourceType: 'platform',
        category: '旅行与探索',
        content: '旅行的意义是重新看见熟悉的自己。',
        status: 'active',
        agreeCount: 54,
        disagreeCount: 46,
      },
      {
        id: 505n,
        authorUserId: 1n,
        sourceType: 'platform',
        category: '内心世界',
        content: '树洞比热闹更能让人放松。',
        status: 'active',
        agreeCount: 60,
        disagreeCount: 40,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.discoveryPost.createMany({
    data: [
      {
        id: 501n,
        authorUserId: 1n,
        postType: 'featured',
        category: '价值观',
        title: '关于成熟',
        content: '我更认同先理解后表达。',
        status: 'published',
      },
      {
        id: 502n,
        authorUserId: 2n,
        postType: 'timeline',
        category: '内心世界',
        content: '今晚也想把话说给风听。',
        status: 'published',
      },
      {
        id: 503n,
        authorUserId: 4n,
        postType: 'timeline',
        category: '旅行与探索',
        content: '想去海边待三天不看手机。',
        status: 'published',
      },
    ],
    skipDuplicates: true,
  });

  await prisma.userPhoto.createMany({
    data: [
      { userId: 1n, photoUrl: 'https://example.com/photos/sofia-1.jpg', sortOrder: 0 },
      { userId: 1n, photoUrl: 'https://example.com/photos/sofia-2.jpg', sortOrder: 1 },
      { userId: 2n, photoUrl: 'https://example.com/photos/marcus-1.jpg', sortOrder: 0 },
      { userId: 3n, photoUrl: 'https://example.com/photos/elena-1.jpg', sortOrder: 0 },
    ],
    skipDuplicates: true,
  });
}

main().finally(() => prisma.$disconnect());
