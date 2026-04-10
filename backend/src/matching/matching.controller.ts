import { Body, Controller, Post } from '@nestjs/common';
import { CurrentUser } from '../common/current-user.decorator';
import { TriggerCheckDto } from './dto/trigger-check.dto';
import { MatchingService } from './matching.service';

@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Post('trigger-check')
  triggerCheck(
    @CurrentUser() user: { id: bigint },
    @Body() dto: TriggerCheckDto,
  ) {
    return this.matchingService.triggerCheck(user.id, dto);
  }
}
