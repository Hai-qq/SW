import { IsIn, IsOptional, IsString } from 'class-validator';

export class CardFeedbackDto {
  @IsString()
  cardId!: string;

  @IsIn(['reduce_similar'])
  feedbackType!: 'reduce_similar';

  @IsOptional()
  @IsString()
  category?: string;
}
