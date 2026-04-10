import { Type } from 'class-transformer';
import { IsOptional, IsString, Max, Min } from 'class-validator';

export class RecommendCardsDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(20)
  limit = 1;

  @IsOptional()
  @IsString()
  cursor?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  sessionId?: string;
}
