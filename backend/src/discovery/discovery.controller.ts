import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../common/current-user.decorator';
import { DiscoveryService } from './discovery.service';
import { GetFeedDto } from './dto/get-feed.dto';
import { PublishPostDto } from './dto/publish-post.dto';

@Controller('discovery')
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Get('feed')
  getFeed(@Query() dto: GetFeedDto) {
    return this.discoveryService.getFeed(dto);
  }

  @Post('publish')
  publish(@CurrentUser() user: { id: bigint }, @Body() dto: PublishPostDto) {
    return this.discoveryService.publish(user.id, dto);
  }
}
