import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();
    await this.syncPrimaryKeySequences();
  }

  async syncPrimaryKeySequences(tableNames?: string[]) {
    const sequenceTargets = tableNames ?? [
      'User',
      'UserAuthSession',
      'OnboardingAnswer',
      'UserProfileTag',
      'Card',
      'CardExposure',
      'CardSwipe',
      'CardFeedback',
      'CardComment',
      'UserSession',
      'MatchEvent',
      'UserConnection',
      'Conversation',
      'Message',
      'ConversationReadState',
      'DiscoveryPost',
      'DiscoveryReaction',
      'DiscoveryComment',
      'UserPhoto',
    ];

    for (const tableName of sequenceTargets) {
      await this.$executeRawUnsafe(
        `SELECT setval(
          pg_get_serial_sequence('"${tableName}"', 'id'),
          COALESCE((SELECT MAX(id) FROM "${tableName}"), 1),
          true
        );`,
      );
    }
  }
}
