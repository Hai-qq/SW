import { Controller, Get, Module, UseGuards } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CardsModule } from './cards/cards.module';
import { CurrentUser } from './common/current-user.decorator';
import { TestUserGuard } from './common/test-user.guard';
import { DiscoveryModule } from './discovery/discovery.module';
import { MatchingModule } from './matching/matching.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { ProfileModule } from './profile/profile.module';
import { PrismaModule } from './prisma/prisma.module';

@Controller('health')
@UseGuards(TestUserGuard)
class HealthController {
  @Get()
  health(@CurrentUser() user: { id: bigint }) {
    return { ok: true, userId: user.id.toString() };
  }
}

@Module({
  imports: [
    PrismaModule,
    OnboardingModule,
    CardsModule,
    MatchingModule,
    DiscoveryModule,
    ProfileModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: TestUserGuard }],
})
export class AppModule {}
