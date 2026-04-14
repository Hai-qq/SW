import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../common/current-user.decorator';
import { CardFeedbackDto } from './dto/card-feedback.dto';
import { CreateCardCommentDto } from './dto/create-card-comment.dto';
import { RecommendCardsDto } from './dto/recommend-cards.dto';
import { RecommendUsersDto } from './dto/recommend-users.dto';
import { SwipeCardDto } from './dto/swipe-card.dto';
import { CardsService } from './cards.service';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Get('recommend')
  recommend(
    @CurrentUser() user: { id: bigint },
    @Query() dto: RecommendCardsDto,
  ) {
    return this.cardsService.recommend(user.id, dto);
  }

  @Get('recommend-users')
  recommendUsers(
    @CurrentUser() user: { id: bigint },
    @Query() dto: RecommendUsersDto,
  ) {
    return this.cardsService.recommendUsers(user.id, dto);
  }

  @Post('swipe')
  swipe(@CurrentUser() user: { id: bigint }, @Body() dto: SwipeCardDto) {
    return this.cardsService.swipe(user.id, dto);
  }

  @Post('feedback')
  feedback(@CurrentUser() user: { id: bigint }, @Body() dto: CardFeedbackDto) {
    return this.cardsService.feedback(user.id, dto);
  }

  @Get(':cardId/comments')
  listComments(@Param('cardId') cardId: string) {
    return this.cardsService.listComments(cardId);
  }

  @Post(':cardId/comments')
  createComment(
    @CurrentUser() user: { id: bigint },
    @Param('cardId') cardId: string,
    @Body() dto: CreateCardCommentDto,
  ) {
    return this.cardsService.createComment(user.id, cardId, dto);
  }
}
