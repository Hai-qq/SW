import { Type } from 'class-transformer';
import { IsOptional, IsString, Max, Min } from 'class-validator';

export class ListMessagesDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(50)
  limit = 30;

  @IsOptional()
  @IsString()
  before?: string;
}
