import { Body, Controller, Post } from '@nestjs/common';
import { CurrentUser } from '../common/current-user.decorator';
import { SubmitOnboardingDto } from './dto/submit-onboarding.dto';
import { OnboardingService } from './onboarding.service';

@Controller('onboarding')
export class OnboardingController {
  constructor(private readonly onboardingService: OnboardingService) {}

  @Post('submit')
  submit(
    @CurrentUser() user: { id: bigint },
    @Body() dto: SubmitOnboardingDto,
  ) {
    return this.onboardingService.submit(user.id, dto);
  }
}
