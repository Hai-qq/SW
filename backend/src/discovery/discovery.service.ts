import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GetFeedDto } from './dto/get-feed.dto';
import { GetMyPostsDto } from './dto/get-my-posts.dto';
import { PublishPostDto } from './dto/publish-post.dto';

@Injectable()
export class DiscoveryService {
  constructor(private readonly prisma: PrismaService) {}

  async getFeed(userId: bigint, dto: GetFeedDto) {
    const items = await this.prisma.discoveryPost.findMany({
      where: {
        status: 'published',
        category: dto.tabType && dto.tabType !== '全部' ? dto.tabType : undefined,
        postType: dto.feedType,
      },
      include: {
        author: true,
        reactions: {
          where: {
            userId,
            reactionType: 'like',
          },
        },
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
        status: item.status,
        anonymous: item.anonymous,
        author: {
          userId: item.author.id.toString(),
          nickname: item.author.nickname,
          avatar: item.author.avatarUrl ?? '',
        },
        stats: {
          likeCount: item.likeCount,
          commentCount: item.commentCount,
          likedByMe: item.reactions.length > 0,
        },
        createdAt: item.createdAt.toISOString(),
      })),
    };
  }

  async getMyPosts(userId: bigint, dto: GetMyPostsDto) {
    const items = await this.prisma.discoveryPost.findMany({
      where: {
        authorUserId: userId,
        status: dto.status,
      },
      orderBy: [{ createdAt: 'desc' }],
      take: 20,
    });

    return {
      items: items.map((item) => ({
        feedId: item.id.toString(),
        type: item.postType,
        category: item.category,
        content: item.content,
        status: item.status,
        anonymous: item.anonymous,
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
        status: dto.action === 'draft' ? 'draft' : 'published',
      },
    });

    return {
      feedId: created.id.toString(),
      status: created.status,
    };
  }

  async likePost(userId: bigint, postIdValue: string) {
    const postId = this.parseBigInt(postIdValue, 'invalid_post_id');
    const post = await this.prisma.discoveryPost.findUnique({ where: { id: postId } });
    if (!post || post.status !== 'published') {
      throw new NotFoundException('post_not_found');
    }

    const result = await this.prisma.$transaction(async (tx) => {
      const existing = await tx.discoveryReaction.findUnique({
        where: {
          postId_userId_reactionType: {
            postId,
            userId,
            reactionType: 'like',
          },
        },
      });

      if (!existing) {
        await tx.discoveryReaction.create({
          data: {
            postId,
            userId,
            reactionType: 'like',
          },
        });
        await tx.discoveryPost.update({
          where: { id: postId },
          data: { likeCount: { increment: 1 } },
        });
      }

      return tx.discoveryPost.findUniqueOrThrow({ where: { id: postId } });
    });

    return {
      feedId: result.id.toString(),
      liked: true,
      likeCount: result.likeCount,
    };
  }

  async listComments(postIdValue: string) {
    const postId = this.parseBigInt(postIdValue, 'invalid_post_id');
    const comments = await this.prisma.discoveryComment.findMany({
      where: {
        postId,
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

  async createComment(userId: bigint, postIdValue: string, dto: CreateCommentDto) {
    const content = dto.content.trim();
    if (!content) {
      throw new BadRequestException('empty_comment_content');
    }

    const postId = this.parseBigInt(postIdValue, 'invalid_post_id');
    const post = await this.prisma.discoveryPost.findUnique({ where: { id: postId } });
    if (!post || post.status !== 'published') {
      throw new NotFoundException('post_not_found');
    }

    const comment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.discoveryComment.create({
        data: {
          postId,
          authorUserId: userId,
          content,
        },
        include: {
          author: true,
        },
      });

      await tx.discoveryPost.update({
        where: { id: postId },
        data: { commentCount: { increment: 1 } },
      });

      return created;
    });

    return this.serializeComment(comment);
  }

  private serializeComment(comment: {
    id: bigint;
    content: string;
    createdAt: Date;
    author: { id: bigint; nickname: string; avatarUrl: string | null };
  }) {
    return {
      commentId: comment.id.toString(),
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
