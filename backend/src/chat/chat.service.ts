import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ListMessagesDto } from './dto/list-messages.dto';
import { OpenConversationDto } from './dto/open-conversation.dto';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(private readonly prisma: PrismaService) {}

  async openConversation(userId: bigint, dto: OpenConversationDto) {
    const connectionId = this.parseBigInt(dto.connectionId, 'invalid_connection_id');
    const connection = await this.prisma.userConnection.findFirst({
      where: {
        id: connectionId,
        userId,
      },
      include: {
        targetUser: true,
        conversation: true,
      },
    });

    if (!connection) {
      throw new NotFoundException('connection_not_found');
    }

    if (connection.status !== 'connected') {
      throw new BadRequestException('connection_not_connected');
    }

    const conversation =
      connection.conversation ??
      (await this.prisma.conversation.create({
        data: {
          connectionId: connection.id,
          userAId: connection.userId,
          userBId: connection.targetUserId,
        },
      }));

    return this.serializeConversation(conversation.id, connection.targetUser, {
      lastMessageText: conversation.lastMessageText,
      lastMessageAt: conversation.lastMessageAt,
      unreadCount: 0,
    });
  }

  async listConversations(userId: bigint) {
    const conversations = await this.prisma.conversation.findMany({
      where: {
        OR: [{ userAId: userId }, { userBId: userId }],
      },
      include: {
        userA: true,
        userB: true,
      },
      orderBy: [{ lastMessageAt: 'desc' }, { updatedAt: 'desc' }],
    });

    return {
      items: await Promise.all(conversations.map(async (conversation) => {
        const peer = conversation.userAId === userId ? conversation.userB : conversation.userA;
        const readState = await this.prisma.conversationReadState.findUnique({
          where: {
            conversationId_userId: {
              conversationId: conversation.id,
              userId,
            },
          },
        });
        const unreadCount = await this.prisma.message.count({
          where: {
            conversationId: conversation.id,
            senderUserId: { not: userId },
            ...(readState ? { createdAt: { gt: readState.lastReadAt } } : {}),
          },
        });

        return this.serializeConversation(conversation.id, peer, {
          lastMessageText: conversation.lastMessageText,
          lastMessageAt: conversation.lastMessageAt,
          unreadCount,
        });
      })),
    };
  }

  async listMessages(userId: bigint, conversationId: string, dto: ListMessagesDto) {
    const conversation = await this.findParticipantConversation(userId, conversationId);
    const beforeMessage = dto.before
      ? await this.prisma.message.findFirst({
          where: {
            id: this.parseBigInt(dto.before, 'invalid_message_cursor'),
            conversationId: conversation.id,
          },
        })
      : null;

    const messages = await this.prisma.message.findMany({
      where: {
        conversationId: conversation.id,
        ...(beforeMessage ? { createdAt: { lt: beforeMessage.createdAt } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: dto.limit + 1,
    });
    const visibleMessages = messages.slice(0, dto.limit).reverse();

    return {
      items: visibleMessages.map((message) => ({
        messageId: message.id.toString(),
        senderUserId: message.senderUserId.toString(),
        content: message.content,
        messageType: message.messageType,
        createdAt: message.createdAt.toISOString(),
        isMine: message.senderUserId === userId,
      })),
      nextCursor:
        messages.length > dto.limit ? visibleMessages[0]?.id.toString() ?? null : null,
    };
  }

  async sendMessage(userId: bigint, conversationId: string, dto: SendMessageDto) {
    const content = dto.content.trim();
    if (!content) {
      throw new BadRequestException('empty_message_content');
    }

    const conversation = await this.findParticipantConversation(userId, conversationId);
    const message = await this.prisma.$transaction(async (tx) => {
      const created = await tx.message.create({
        data: {
          conversationId: conversation.id,
          senderUserId: userId,
          content,
          messageType: 'text',
        },
      });

      await tx.conversation.update({
        where: { id: conversation.id },
        data: {
          lastMessageText: content,
          lastMessageAt: created.createdAt,
        },
      });

      await tx.conversationReadState.upsert({
        where: {
          conversationId_userId: {
            conversationId: conversation.id,
            userId,
          },
        },
        create: {
          conversationId: conversation.id,
          userId,
          lastReadAt: created.createdAt,
        },
        update: {
          lastReadAt: created.createdAt,
        },
      });

      return created;
    });

    return {
      messageId: message.id.toString(),
      sent: true,
    };
  }

  async markRead(userId: bigint, conversationId: string) {
    const conversation = await this.findParticipantConversation(userId, conversationId);
    const lastMessage = await this.prisma.message.findFirst({
      where: { conversationId: conversation.id },
      orderBy: { createdAt: 'desc' },
    });
    const lastReadAt = lastMessage?.createdAt ?? new Date();

    await this.prisma.conversationReadState.upsert({
      where: {
        conversationId_userId: {
          conversationId: conversation.id,
          userId,
        },
      },
      create: {
        conversationId: conversation.id,
        userId,
        lastReadAt,
      },
      update: {
        lastReadAt,
      },
    });

    return {
      conversationId: conversation.id.toString(),
      unreadCount: 0,
    };
  }

  private async findParticipantConversation(userId: bigint, conversationId: string) {
    const id = this.parseBigInt(conversationId, 'invalid_conversation_id');
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id,
        OR: [{ userAId: userId }, { userBId: userId }],
      },
    });

    if (!conversation) {
      throw new NotFoundException('conversation_not_found');
    }

    return conversation;
  }

  private serializeConversation(
    conversationId: bigint,
    peer: { id: bigint; nickname: string; avatarUrl: string | null },
    preview: { lastMessageText: string | null; lastMessageAt: Date | null; unreadCount: number },
  ) {
    return {
      conversationId: conversationId.toString(),
      peer: {
        userId: peer.id.toString(),
        nickname: peer.nickname,
        avatar: peer.avatarUrl ?? '',
      },
      lastMessageText: preview.lastMessageText ?? '',
      lastMessageAt: preview.lastMessageAt?.toISOString() ?? null,
      unreadCount: preview.unreadCount,
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
