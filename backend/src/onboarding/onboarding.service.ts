import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SubmitOnboardingDto } from './dto/submit-onboarding.dto';

const QUESTION_FIELD_MAP = {
  1: 'gender',
  2: 'ageRange',
  3: 'relationshipStatus',
} as const;

const QUESTION_TAG_MAP = {
  1: { tagType: 'demographic', tagKey: 'gender' },
  2: { tagType: 'demographic', tagKey: 'age_range' },
  3: { tagType: 'demographic', tagKey: 'relationship_status' },
} as const;

@Injectable()
export class OnboardingService {
  constructor(private readonly prisma: PrismaService) {}

  async submit(userId: bigint, dto: SubmitOnboardingDto) {
    await this.prisma.$transaction(async (tx) => {
      for (const answer of dto.answers) {
        await tx.onboardingAnswer.upsert({
          where: {
            userId_questionId: {
              userId,
              questionId: answer.questionId,
            },
          },
          create: {
            userId,
            questionId: answer.questionId,
            selectedValue: answer.selected ?? null,
            isSkipped: !answer.selected,
          },
          update: {
            selectedValue: answer.selected ?? null,
            isSkipped: !answer.selected,
            submittedAt: new Date(),
          },
        });

        const tagConfig = QUESTION_TAG_MAP[answer.questionId as keyof typeof QUESTION_TAG_MAP];
        if (tagConfig && answer.selected) {
          await tx.userProfileTag.upsert({
            where: {
              id: BigInt(
                `${userId}${answer.questionId}`,
              ),
            },
            create: {
              id: BigInt(`${userId}${answer.questionId}`),
              userId,
              tagType: tagConfig.tagType,
              tagKey: tagConfig.tagKey,
              tagValue: answer.selected,
              source: 'onboarding',
            },
            update: {
              tagValue: answer.selected,
              source: 'onboarding',
              updatedAt: new Date(),
            },
          });
        }
      }

      const userUpdateData: Record<string, string | boolean | null> = {
        onboardingCompleted: true,
      };

      for (const answer of dto.answers) {
        const field = QUESTION_FIELD_MAP[answer.questionId as keyof typeof QUESTION_FIELD_MAP];
        if (field) {
          userUpdateData[field] = answer.selected ?? null;
        }
      }

      await tx.user.update({
        where: { id: userId },
        data: userUpdateData,
      });
    });

    return { onboardingCompleted: true };
  }
}
