import { Controller, Get, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';
import { CardsModule } from './cards/cards.module';
import { ChatModule } from './chat/chat.module';
import { CurrentUser } from './common/current-user.decorator';
import { AppAuthGuard } from './common/app-auth.guard';
import { DiscoveryModule } from './discovery/discovery.module';
import { MatchingModule } from './matching/matching.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { ProfileModule } from './profile/profile.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Controller('health')
class HealthController {
  @Get()
  health(@CurrentUser() user: { id: bigint }) {
    return { ok: true, userId: user.id.toString() };
  }
}

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    OnboardingModule,
    CardsModule,
    ChatModule,
    MatchingModule,
    DiscoveryModule,
    ProfileModule,
    UsersModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: AppAuthGuard }],
})
export class AppModule {}
