import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetFeedDto } from './dto/get-feed.dto';
import { PublishPostDto } from './dto/publish-post.dto';

@Injectable()
export class DiscoveryService {
  constructor(private readonly prisma: PrismaService) {}

  async getFeed(dto: GetFeedDto) {
    const items = await this.prisma.discoveryPost.findMany({
      where: {
        status: 'published',
        category: dto.tabType && dto.tabType !== '全部' ? dto.tabType : undefined,
        postType: dto.feedType,
      },
      include: {
        author: true,
      },
      orderBy: [{ createdAt: 'desc' }],
      take: 10,
    });

    return {
      cursor: null,
      items: items.map((item) => ({
        feedId: item.id.toString(),
        type: item.postType,
        category: item.category,
        title: item.title,
        content: item.content,
        anonymous: item.anonymous,
        author: {
          userId: item.author.id.toString(),
          nickname: item.author.nickname,
          avatar: item.author.avatarUrl ?? '',
        },
        stats: {
          likeCount: item.likeCount,
          commentCount: item.commentCount,
        },
        createdAt: item.createdAt.toISOString(),
      })),
    };
  }

  async publish(userId: bigint, dto: PublishPostDto) {
    const created = await this.prisma.discoveryPost.create({
      data: {
        authorUserId: userId,
        postType: 'timeline',
        category: dto.tabType,
        content: dto.content,
        anonymous: dto.anonymous,
        status: 'published',
      },
    });

    return {
      feedId: created.id.toString(),
      status: created.status,
    };
  }
}
