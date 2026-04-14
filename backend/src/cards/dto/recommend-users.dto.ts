import { Type } from 'class-transformer';
import { IsOptional, Max, Min } from 'class-validator';

export class RecommendUsersDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(10)
  limit = 5;
}
