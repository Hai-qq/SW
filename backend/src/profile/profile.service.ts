import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getInfo(userId: bigint) {
    const [user, photos, swipeCount] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({
        where: { id: userId },
      }),
      this.prisma.userPhoto.findMany({
        where: { userId, status: 'active' },
        orderBy: { sortOrder: 'asc' },
      }),
      this.prisma.cardSwipe.count({
        where: { userId },
      }),
    ]);

    return {
      userId: user.id.toString(),
      nickname: user.nickname,
      gender: user.gender,
      age: user.ageRange,
      mbti: user.mbti,
      signature: user.signature,
      photos: photos.map((item) => item.photoUrl),
      counts: {
        visitors: 0,
        followers: 0,
        following: 0,
        interactions: swipeCount,
      },
    };
  }
}
