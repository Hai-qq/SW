import { Body, Controller, Get, HttpCode, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../common/current-user.decorator';
import { DiscoveryService } from './discovery.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { GetFeedDto } from './dto/get-feed.dto';
import { GetMyPostsDto } from './dto/get-my-posts.dto';
import { PublishPostDto } from './dto/publish-post.dto';

@Controller('discovery')
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Get('feed')
  getFeed(@CurrentUser() user: { id: bigint }, @Query() dto: GetFeedDto) {
    return this.discoveryService.getFeed(user.id, dto);
  }

  @Get('my-posts')
  getMyPosts(@CurrentUser() user: { id: bigint }, @Query() dto: GetMyPostsDto) {
    return this.discoveryService.getMyPosts(user.id, dto);
  }

  @Post('publish')
  publish(@CurrentUser() user: { id: bigint }, @Body() dto: PublishPostDto) {
    return this.discoveryService.publish(user.id, dto);
  }

  @HttpCode(200)
  @Post('posts/:postId/like')
  likePost(
    @CurrentUser() user: { id: bigint },
    @Param('postId') postId: string,
  ) {
    return this.discoveryService.likePost(user.id, postId);
  }

  @Get('posts/:postId/comments')
  listComments(@Param('postId') postId: string) {
    return this.discoveryService.listComments(postId);
  }

  @Post('posts/:postId/comments')
  createComment(
    @CurrentUser() user: { id: bigint },
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
  ) {
    return this.discoveryService.createComment(user.id, postId, dto);
  }
}
