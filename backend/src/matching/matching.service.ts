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

    const ranked = candidates
      .map((candidate) => {
        const candidateTopics = candidate.profileTags
          .filter((tag) => tag.tagType === 'topic_preference')
          .map((tag) => tag.tagValue);
        const sharedTopics = userTopics.filter((topic) => candidateTopics.includes(topic));
        const score = sharedTopics.length * 25 + (candidate.avatarUrl ? 10 : 0) + 5;
        const tags = sharedTopics.slice(0, 2);
        const reason =
          sharedTopics.length > 0
            ? `你们都更关注${sharedTopics[0]}话题`
            : '你们最近的活跃与表达节奏接近';

        return { candidate, score, reason, tags };
      })
      .sort((a, b) => b.score - a.score);
    const selected = ranked.slice(0, 3);
    const primary = selected[0];

    await this.prisma.userSession.update({
      where: { sessionId: dto.sessionId },
      data: { blindBoxChecked: true, blindBoxTriggered: Boolean(primary) },
    });

    await this.prisma.matchEvent.create({
      data: {
        userId,
        candidateUserId: primary?.candidate.id,
        sessionId: dto.sessionId,
        triggerReason: primary?.reason ?? 'no_candidate',
        matchScore: primary?.score ?? null,
        resultStatus: primary ? 'matched' : 'no_match',
      },
    });

    if (!primary) {
      return { shouldTrigger: false, reason: 'no_candidate' };
    }

    return {
      shouldTrigger: true,
      blindBox: {
        triggerMode: 'threshold',
        title: '发现同频的人',
        confirmText: '打开盲盒',
        cancelText: '稍后再说',
        candidates: selected.map((item) => ({
          userId: item.candidate.id.toString(),
          nickname: item.candidate.nickname,
          avatar: item.candidate.avatarUrl ?? '',
          tags: item.tags.length > 0 ? item.tags : ['同频'],
        })),
      },
      matchReason: primary.reason,
      matchScore: primary.score,
    };
  }
}
