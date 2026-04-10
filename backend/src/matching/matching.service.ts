import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TriggerCheckDto } from './dto/trigger-check.dto';

@Injectable()
export class MatchingService {
  constructor(private readonly prisma: PrismaService) {}

  async triggerCheck(userId: bigint, dto: TriggerCheckDto) {
    const session = await this.prisma.userSession.upsert({
      where: { sessionId: dto.sessionId },
      create: {
        sessionId: dto.sessionId,
        userId,
        entryPage: 'home',
        validSwipeCount: dto.sessionSwipeCount,
      },
      update: {
        lastActiveAt: new Date(),
        validSwipeCount: dto.sessionSwipeCount,
      },
    });

    if (session.blindBoxChecked) {
      return { shouldTrigger: false, reason: 'already_checked' };
    }

    if (dto.sessionSwipeCount < 3 || dto.sessionDuration < 30) {
      await this.prisma.userSession.update({
        where: { sessionId: dto.sessionId },
        data: { blindBoxChecked: true, blindBoxTriggered: false },
      });

      await this.prisma.matchEvent.create({
        data: {
          userId,
          sessionId: dto.sessionId,
          triggerReason: 'threshold_not_met',
          resultStatus: 'no_match',
        },
      });

      return { shouldTrigger: false, reason: 'threshold_not_met' };
    }

    const userTags = await this.prisma.userProfileTag.findMany({
      where: { userId, tagType: 'topic_preference' },
    });
    const userTopics = userTags.map((tag) => tag.tagValue);

    const candidates = await this.prisma.user.findMany({
      where: {
        id: { not: userId },
        onboardingCompleted: true,
        status: 'active',
      },
      include: {
        profileTags: true,
      },
    });

    const best = candidates
      .map((candidate) => {
        const candidateTopics = candidate.profileTags
          .filter((tag) => tag.tagType === 'topic_preference')
          .map((tag) => tag.tagValue);
        const sharedTopics = userTopics.filter((topic) => candidateTopics.includes(topic));
        const score = sharedTopics.length * 25 + (candidate.avatarUrl ? 10 : 0) + 5;
        const reason =
          sharedTopics.length > 0
            ? `你们都更关注${sharedTopics[0]}话题`
            : '你们最近的活跃与表达节奏接近';

        return { candidate, score, reason };
      })
      .sort((a, b) => b.score - a.score)[0];

    await this.prisma.userSession.update({
      where: { sessionId: dto.sessionId },
      data: { blindBoxChecked: true, blindBoxTriggered: Boolean(best) },
    });

    await this.prisma.matchEvent.create({
      data: {
        userId,
        candidateUserId: best?.candidate.id,
        sessionId: dto.sessionId,
        triggerReason: best?.reason ?? 'no_candidate',
        matchScore: best?.score ?? null,
        resultStatus: best ? 'matched' : 'no_match',
      },
    });

    if (!best) {
      return { shouldTrigger: false, reason: 'no_candidate' };
    }

    return {
      shouldTrigger: true,
      matchUser: {
        userId: best.candidate.id.toString(),
        name: best.candidate.nickname,
        avatar: best.candidate.avatarUrl ?? '',
      },
      matchReason: best.reason,
      matchScore: best.score,
    };
  }
}
