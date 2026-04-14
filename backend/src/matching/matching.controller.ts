import { Body, Controller, Get, HttpCode, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../common/current-user.decorator';
import { ListConnectionsDto } from './dto/list-connections.dto';
import { TriggerCheckDto } from './dto/trigger-check.dto';
import { UpsertConnectionDto } from './dto/upsert-connection.dto';
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

  @HttpCode(200)
  @Post('connections')
  upsertConnection(
    @CurrentUser() user: { id: bigint },
    @Body() dto: UpsertConnectionDto,
  ) {
    return this.matchingService.upsertConnection(user.id, dto);
  }

  @Get('connections')
  listConnections(
    @CurrentUser() user: { id: bigint },
    @Query() dto: ListConnectionsDto,
  ) {
    return this.matchingService.listConnections(user.id, dto);
  }
}
