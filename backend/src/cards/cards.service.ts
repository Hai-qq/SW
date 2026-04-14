import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CardFeedbackDto } from './dto/card-feedback.dto';
import { CreateCardCommentDto } from './dto/create-card-comment.dto';
import { RecommendCardsDto } from './dto/recommend-cards.dto';
import { RecommendUsersDto } from './dto/recommend-users.dto';
import { SwipeCardDto } from './dto/swipe-card.dto';

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  async recommend(userId: bigint, dto: RecommendCardsDto) {
    const suppressedCategories = await this.getSuppressedCategories(userId);
    const candidateTake = Math.min(Math.max(dto.limit * 50, 200), 1000);
    const candidates = await this.prisma.card.findMany({
      where: {
        status: 'active',
        category: dto.category && dto.category !== '全部' ? dto.category : undefined,
        ...(dto.category && dto.category !== '全部'
          ? {}
          : { category: { notIn: suppressedCategories } }),
        swipes: {
          none: {
            userId,
          },
        },
      },
      include: {
        author: true,
      },
      orderBy: [{ id: 'asc' }],
      take: candidateTake,
    });
    const cards = this.shuffle(candidates).slice(0, dto.limit);

    if (cards.length > 0) {
      await this.prisma.cardExposure.createMany({
        data: cards.map((card, index) => ({
          userId,
          cardId: card.id,
          sessionId: dto.sessionId ?? 'default-session',
          positionIndex: index,
        })),
      });
    }

    const avatarPool = await this.prisma.user.findMany({
      where: { avatarUrl: { not: null } },
      orderBy: { id: 'asc' },
      take: 3,
    });

    return {
      cursor: null,
      items: cards.map((card) => ({
        cardId: card.id.toString(),
        content: card.content,
        tags: card.category,
        user: {
          userId: card.author?.id?.toString() ?? '0',
          name: card.author?.nickname ?? 'SW',
          avatar: card.author?.avatarUrl ?? '',
        },
        stats: {
          agreePercent:
            card.agreeCount + card.disagreeCount === 0
              ? 0
              : Math.round((card.agreeCount / (card.agreeCount + card.disagreeCount)) * 100),
          commentCount: card.commentCount,
          agreeAvatars: avatarPool
            .slice(0, 2)
            .map((user) => user.avatarUrl)
            .filter((value): value is string => Boolean(value)),
          disagreeAvatar: avatarPool[2]?.avatarUrl ?? avatarPool[0]?.avatarUrl ?? '',
        },
      })),
    };
  }

  async recommendUsers(userId: bigint, dto: RecommendUsersDto) {
    const currentUserTopics = await this.prisma.userProfileTag.findMany({
      where: { userId, tagType: 'topic_preference' },
    });
    const topicValues = currentUserTopics.map((tag) => tag.tagValue);

    const users = await this.prisma.user.findMany({
      where: {
        id: { not: userId },
        onboardingCompleted: true,
        status: 'active',
      },
      include: {
        profileTags: true,
      },
      orderBy: { id: 'asc' },
      take: dto.limit * 2,
    });

    const items = users
      .map((user) => {
        const sharedTopic =
          user.profileTags
            .filter((tag) => tag.tagType === 'topic_preference')
            .map((tag) => tag.tagValue)
            .find((topic) => topicValues.includes(topic)) ?? '';

        return {
          userId: user.id.toString(),
          nickname: user.nickname,
          avatar: user.avatarUrl ?? '',
          hasAvatar: Boolean(user.avatarUrl),
          sharedTopic,
          score: sharedTopic ? 100 : 10,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, dto.limit)
      .map(({ score, ...item }) => item);

    return { items };
  }

  async swipe(userId: bigint, dto: SwipeCardDto) {
    const cardId = BigInt(dto.cardId);

    const session = await this.prisma.$transaction(async (tx) => {
      const existingSwipe = await tx.cardSwipe.findUnique({
        where: {
          userId_cardId: {
            userId,
            cardId,
          },
        },
      });

      await tx.cardSwipe.upsert({
        where: {
          userId_cardId: {
            userId,
            cardId,
          },
        },
        create: {
          userId,
          cardId,
          action: dto.action,
          sessionId: dto.sessionId,
          sourceTab: dto.sourceTab,
        },
        update: {
          action: dto.action,
          sessionId: dto.sessionId,
          sourceTab: dto.sourceTab,
          swipedAt: new Date(),
        },
      });

      if (!existingSwipe) {
        await tx.card.update({
          where: { id: cardId },
          data:
            dto.action === 'agree'
              ? { agreeCount: { increment: 1 } }
              : dto.action === 'disagree'
                ? { disagreeCount: { increment: 1 } }
                : { skipCount: { increment: 1 } },
        });
      }

      return tx.userSession.upsert({
        where: { sessionId: dto.sessionId },
        create: {
          sessionId: dto.sessionId,
          userId,
          entryPage: 'home',
          validSwipeCount: dto.action === 'skip' ? 0 : 1,
          skipCount: dto.action === 'skip' ? 1 : 0,
        },
        update: {
          lastActiveAt: new Date(),
          validSwipeCount:
            dto.action === 'skip'
              ? undefined
              : {
                  increment: 1,
                },
          skipCount:
            dto.action === 'skip'
              ? {
                  increment: 1,
                }
              : undefined,
        },
      });
    });

    return {
      recorded: true,
      sessionSwipeCount: session.validSwipeCount + session.skipCount,
    };
  }

  async feedback(userId: bigint, dto: CardFeedbackDto) {
    const cardId = BigInt(dto.cardId);
    const card = await this.prisma.card.findUnique({ where: { id: cardId } });
    const category = dto.category ?? card?.category ?? null;

    await this.prisma.cardFeedback.upsert({
      where: {
        userId_cardId_feedbackType: {
          userId,
          cardId,
          feedbackType: dto.feedbackType,
        },
      },
      create: {
        userId,
        cardId,
        feedbackType: dto.feedbackType,
        category,
      },
      update: {
        category,
      },
    });

    return {
      recorded: true,
      feedbackType: dto.feedbackType,
      category: category ?? '',
    };
  }

  async listComments(cardIdValue: string) {
    const cardId = this.parseBigInt(cardIdValue, 'invalid_card_id');
    const comments = await this.prisma.cardComment.findMany({
      where: {
        cardId,
        status: 'published',
      },
      include: {
        author: true,
      },
      orderBy: { createdAt: 'asc' },
      take: 30,
    });

    return {
      items: comments.map((comment) => this.serializeComment(comment)),
    };
  }

  async createComment(userId: bigint, cardIdValue: string, dto: CreateCardCommentDto) {
    const content = dto.content.trim();
    if (!content) {
      throw new BadRequestException('empty_card_comment_content');
    }

    const cardId = this.parseBigInt(cardIdValue, 'invalid_card_id');
    const card = await this.prisma.card.findUnique({ where: { id: cardId } });
    if (!card || card.status !== 'active') {
      throw new NotFoundException('card_not_found');
    }

    const comment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.cardComment.create({
        data: {
          cardId,
          authorUserId: userId,
          content,
        },
        include: {
          author: true,
        },
      });

      await tx.card.update({
        where: { id: cardId },
        data: { commentCount: { increment: 1 } },
      });

      return created;
    });

    return this.serializeComment(comment);
  }

  private async getSuppressedCategories(userId: bigint) {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const feedback = await this.prisma.cardFeedback.findMany({
      where: {
        userId,
        feedbackType: 'reduce_similar',
        createdAt: { gte: since },
        category: { not: null },
      },
      select: { category: true },
      take: 10,
    });

    return feedback
      .map((item) => item.category)
      .filter((value): value is string => Boolean(value));
  }

  private shuffle<T>(items: T[]) {
    const copy = [...items];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }

    return copy;
  }

  private serializeComment(comment: {
    id: bigint;
    cardId: bigint;
    content: string;
    createdAt: Date;
    author: { id: bigint; nickname: string; avatarUrl: string | null };
  }) {
    return {
      commentId: comment.id.toString(),
      cardId: comment.cardId.toString(),
      content: comment.content,
      createdAt: comment.createdAt.toISOString(),
      author: {
        userId: comment.author.id.toString(),
        nickname: comment.author.nickname,
        avatar: comment.author.avatarUrl ?? '',
      },
    };
  }

  private parseBigInt(value: string, message: string) {
    try {
      return BigInt(value);
    } catch {
      throw new BadRequestException(message);
    }
  }
}
