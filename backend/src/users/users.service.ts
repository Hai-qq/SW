import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getBootstrap(userId: bigint) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    return {
      userId: user.id.toString(),
      nickname: user.nickname,
      avatarUrl: user.avatarUrl ?? '',
      onboardingCompleted: user.onboardingCompleted,
      nextStep: user.onboardingCompleted ? 'home' : 'onboarding',
    };
  }
}
