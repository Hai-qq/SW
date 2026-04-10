import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../common/current-user.decorator';
import { RecommendCardsDto } from './dto/recommend-cards.dto';
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

  @Post('swipe')
  swipe(@CurrentUser() user: { id: bigint }, @Body() dto: SwipeCardDto) {
    return this.cardsService.swipe(user.id, dto);
  }
}
