import { IsIn, IsOptional, IsString } from 'class-validator';

export class SwipeCardDto {
  @IsString()
  cardId!: string;

  @IsIn(['agree', 'disagree', 'skip'])
  action!: 'agree' | 'disagree' | 'skip';

  @IsString()
  sessionId!: string;

  @IsOptional()
  @IsString()
  sourceTab?: string;
}
