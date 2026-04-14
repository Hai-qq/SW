import fs from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

type CardQuestionBankItem = {
  bankId: string;
  category: string;
  content: string;
  optionA: string;
  optionB: string;
  source: string;
};

type CardQuestionBank = {
  version: string;
  source: string;
  count: number;
  items: CardQuestionBankItem[];
};

const QUESTION_BANK_CARD_ID_START = 10000n;

const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envPath)) {
  const envText = fs.readFileSync(envPath, 'utf8');
  for (const line of envText.split(/\r?\n/)) {
    if (!line || line.trim().startsWith('#')) {
      continue;
    }

    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = line.slice(0, separatorIndex).trim();
    const value = line.slice(separatorIndex + 1).trim();
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

const prisma = new PrismaClient();

const MOCK_AVATARS = {
  aurora: 'https://i.pravatar.cc/300?u=sw-mock-aurora',
  lin: 'https://i.pravatar.cc/300?u=sw-mock-lin',
  miya: 'https://i.pravatar.cc/300?u=sw-mock-miya',
  auroraAlt: 'https://i.pravatar.cc/300?u=sw-mock-aurora-alt',
  linAlt: 'https://i.pravatar.cc/300?u=sw-mock-lin-alt',
  miyaAlt: 'https://i.pravatar.cc/300?u=sw-mock-miya-alt',
} as const;

function loadCardQuestionBank() {
  const bankPath = path.resolve(__dirname, 'data/card-question-bank.v6.json');
  const bank = JSON.parse(fs.readFileSync(bankPath, 'utf8')) as CardQuestionBank;
  if (bank.items.length !== bank.count) {
    throw new Error(`question_bank_count_mismatch:${bank.items.length}:${bank.count}`);
  }

  return bank;
}

function formatQuestionBankContent(item: CardQuestionBankItem) {
  return `${item.content}\nA｜${item.optionA}\nB｜${item.optionB}`;
}

async function main() {
  const questionBank = loadCardQuestionBank();

  await prisma.discoveryComment.deleteMany();
  await prisma.discoveryReaction.deleteMany();
  await prisma.cardComment.deleteMany();
  await prisma.conversationReadState.deleteMany();
  await prisma.cardFeedback.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.userConnection.deleteMany();
  await prisma.userAuthSession.deleteMany();
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
        wechatOpenid: 'mock-openid-aurora',
        nickname: 'AURORA',
        avatarUrl: MOCK_AVATARS.aurora,
        gender: 'female',
        ageRange: 'gen-z',
        relationshipStatus: 'single',
        mbti: 'INFJ',
        signature: '会认真听完别人的心事，也愿意慢慢表达自己。',
        city: 'Shanghai',
        onboardingCompleted: true,
      },
      {
        id: 2n,
        wechatOpenid: 'mock-openid-lin',
        nickname: 'LIN',
        avatarUrl: MOCK_AVATARS.lin,
        gender: 'male',
        ageRange: '90s',
        relationshipStatus: 'single',
        mbti: 'INTJ',
        signature: '深夜思路最清楚，偏爱有边界感的真诚。',
        city: 'Beijing',
        onboardingCompleted: true,
      },
      {
        id: 3n,
        wechatOpenid: 'mock-openid-miya',
        nickname: 'MIYA',
        avatarUrl: MOCK_AVATARS.miya,
        gender: 'female',
        ageRange: 'gen-z',
        relationshipStatus: 'single',
        mbti: 'ENFP',
        signature: '喜欢带着一点冲动去看世界，也喜欢被坚定接住。',
        city: 'Hangzhou',
        onboardingCompleted: true,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.userProfileTag.createMany({
    data: [
      { userId: 1n, tagType: 'topic_preference', tagKey: 'topic', tagValue: '价值观', source: 'onboarding' },
      { userId: 1n, tagType: 'topic_preference', tagKey: 'topic', tagValue: '内心世界', source: 'behavior' },
      { userId: 1n, tagType: 'viewpoint_style', tagKey: 'style', tagValue: 'empathetic', source: 'behavior' },
      { userId: 2n, tagType: 'topic_preference', tagKey: 'topic', tagValue: '内心世界', source: 'behavior' },
      { userId: 2n, tagType: 'topic_preference', tagKey: 'topic', tagValue: '社会观察', source: 'onboarding' },
      { userId: 2n, tagType: 'viewpoint_style', tagKey: 'style', tagValue: 'rational', source: 'behavior' },
      { userId: 3n, tagType: 'topic_preference', tagKey: 'topic', tagValue: '价值观', source: 'behavior' },
      { userId: 3n, tagType: 'topic_preference', tagKey: 'topic', tagValue: '旅行与探索', source: 'onboarding' },
      { userId: 3n, tagType: 'viewpoint_style', tagKey: 'style', tagValue: 'warm', source: 'behavior' },
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
        authorUserId: 3n,
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

  await prisma.card.createMany({
    data: questionBank.items.map((item, index) => ({
      id: QUESTION_BANK_CARD_ID_START + BigInt(index),
      authorUserId: null,
      sourceType: 'question_bank_v6',
      category: item.category,
      content: formatQuestionBankContent(item),
      status: 'active',
      agreeCount: 0,
      disagreeCount: 0,
    })),
    skipDuplicates: true,
  });

  await prisma.discoveryPost.createMany({
    data: [
      {
        id: 501n,
        authorUserId: 1n,
        postType: 'featured',
        category: '价值观',
        title: '成熟不是压抑',
        content: '真正让我安心的人，往往不是反应最快的人，而是愿意先理解我的人。',
        status: 'published',
      },
      {
        id: 502n,
        authorUserId: 2n,
        postType: 'timeline',
        category: '内心世界',
        content: '如果今天只能在深夜和一个人认真聊十分钟，我会更想聊那些没说出口的情绪。',
        status: 'published',
      },
      {
        id: 503n,
        authorUserId: 3n,
        postType: 'timeline',
        category: '旅行与探索',
        content: '很想找一个能一起去陌生城市散步的人，不赶行程，只交换真实想法。',
        status: 'published',
      },
      {
        id: 504n,
        authorUserId: 1n,
        postType: 'timeline',
        category: '内心世界',
        content: '这是一条还没发出去的草稿。',
        status: 'draft',
      },
      {
        id: 505n,
        authorUserId: 1n,
        postType: 'timeline',
        category: '社会观察',
        content: '这条内容已经被隐藏。',
        status: 'hidden',
      },
      {
        id: 506n,
        authorUserId: 2n,
        postType: 'featured',
        category: '社会观察',
        title: '边界感',
        content: '越长大越觉得，能清楚表达边界感的人，反而更适合长期相处。',
        status: 'published',
      },
    ],
    skipDuplicates: true,
  });

  await prisma.userPhoto.createMany({
    data: [
      { userId: 1n, photoUrl: MOCK_AVATARS.aurora, sortOrder: 0 },
      { userId: 1n, photoUrl: MOCK_AVATARS.auroraAlt, sortOrder: 1 },
      { userId: 2n, photoUrl: MOCK_AVATARS.lin, sortOrder: 0 },
      { userId: 2n, photoUrl: MOCK_AVATARS.linAlt, sortOrder: 1 },
      { userId: 3n, photoUrl: MOCK_AVATARS.miya, sortOrder: 0 },
      { userId: 3n, photoUrl: MOCK_AVATARS.miyaAlt, sortOrder: 1 },
    ],
    skipDuplicates: true,
  });

  await prisma.userConnection.createMany({
    data: [
      {
        userId: 1n,
        targetUserId: 2n,
        sourceMatchEventId: null,
        status: 'connected',
      },
      {
        userId: 1n,
        targetUserId: 3n,
        sourceMatchEventId: null,
        status: 'hidden',
      },
    ],
    skipDuplicates: true,
  });

  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"User"', 'id'), COALESCE((SELECT MAX(id) FROM "User"), 1), true);`,
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"Card"', 'id'), COALESCE((SELECT MAX(id) FROM "Card"), 1), true);`,
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"DiscoveryPost"', 'id'), COALESCE((SELECT MAX(id) FROM "DiscoveryPost"), 1), true);`,
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"MatchEvent"', 'id'), COALESCE((SELECT MAX(id) FROM "MatchEvent"), 1), true);`,
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"UserConnection"', 'id'), COALESCE((SELECT MAX(id) FROM "UserConnection"), 1), true);`,
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"Conversation"', 'id'), COALESCE((SELECT MAX(id) FROM "Conversation"), 1), true);`,
  );
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"Message"', 'id'), COALESCE((SELECT MAX(id) FROM "Message"), 1), true);`,
  );
}

main().finally(() => prisma.$disconnect());
