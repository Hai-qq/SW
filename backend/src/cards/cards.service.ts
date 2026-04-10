import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecommendCardsDto } from './dto/recommend-cards.dto';
import { SwipeCardDto } from './dto/swipe-card.dto';

@Injectable()
export class CardsService {
  constructor(private readonly prisma: PrismaService) {}

  async recommend(userId: bigint, dto: RecommendCardsDto) {
    const cards = await this.prisma.card.findMany({
      where: {
        status: 'active',
        category: dto.category && dto.category !== '全部' ? dto.category : undefined,
        swipes: {
          none: {
            userId,
          },
        },
      },
      include: {
        author: true,
      },
      orderBy: [{ agreeCount: 'desc' }, { createdAt: 'desc' }],
      take: dto.limit,
    });

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
          agreeAvatars: avatarPool
            .slice(0, 2)
            .map((user) => user.avatarUrl)
            .filter((value): value is string => Boolean(value)),
          disagreeAvatar: avatarPool[2]?.avatarUrl ?? avatarPool[0]?.avatarUrl ?? '',
        },
      })),
    };
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
}
