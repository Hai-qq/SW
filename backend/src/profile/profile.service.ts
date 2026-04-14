import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddProfilePhotoDto } from './dto/add-profile-photo.dto';
import { SortProfilePhotosDto } from './dto/sort-profile-photos.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';

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
      avatarUrl: user.avatarUrl ?? '',
      gender: user.gender,
      age: user.ageRange,
      mbti: user.mbti,
      signature: user.signature,
      city: user.city,
      relationshipStatus: user.relationshipStatus,
      photos: photos.map((item) => ({
        photoId: item.id.toString(),
        photoUrl: item.photoUrl,
        sortOrder: item.sortOrder,
      })),
      counts: {
        visitors: 0,
        followers: 0,
        following: 0,
        interactions: swipeCount,
      },
    };
  }

  async updateInfo(userId: bigint, dto: UpdateProfileDto) {
    await this.prisma.user.update({
      where: { id: userId },
      data: dto,
    });

    return { updated: true };
  }

  async addPhoto(userId: bigint, dto: AddProfilePhotoDto) {
    const currentCount = await this.prisma.userPhoto.count({
      where: { userId, status: 'active' },
    });

    if (currentCount >= 9) {
      throw new BadRequestException('photo_limit_reached');
    }

    const created = await this.prisma.userPhoto.create({
      data: {
        userId,
        photoUrl: dto.photoUrl,
        sortOrder: currentCount,
      },
    });

    return {
      created: true,
      photoId: created.id.toString(),
    };
  }

  async deletePhoto(userId: bigint, photoId: string) {
    const photoIdValue = this.parsePhotoId(photoId);
    const target = await this.prisma.userPhoto.findFirst({
      where: {
        id: photoIdValue,
        userId,
        status: 'active',
      },
    });

    if (!target) {
      throw new NotFoundException('photo_not_found');
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.userPhoto.update({
        where: { id: target.id },
        data: { status: 'deleted' },
      });

      const remaining = await tx.userPhoto.findMany({
        where: { userId, status: 'active' },
        orderBy: { sortOrder: 'asc' },
      });

      for (const [index, item] of remaining.entries()) {
        await tx.userPhoto.update({
          where: { id: item.id },
          data: { sortOrder: index },
        });
      }
    });

    return { deleted: true };
  }

  async sortPhotos(userId: bigint, dto: SortProfilePhotosDto) {
    const ids = dto.items.map((item) => this.parsePhotoId(item.photoId));
    const ownedPhotos = await this.prisma.userPhoto.findMany({
      where: {
        userId,
        id: { in: ids },
        status: 'active',
      },
    });

    if (ownedPhotos.length !== dto.items.length) {
      throw new BadRequestException('invalid_photo_selection');
    }

    await this.prisma.$transaction(async (tx) => {
      for (const item of dto.items) {
        await tx.userPhoto.update({
          where: { id: this.parsePhotoId(item.photoId) },
          data: { sortOrder: item.sortOrder },
        });
      }
    });

    return { updated: true };
  }

  private parsePhotoId(photoId: string) {
    try {
      return BigInt(photoId);
    } catch {
      throw new BadRequestException('invalid_photo_id');
    }
  }
}
