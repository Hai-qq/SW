import { IsIn, IsOptional, IsString } from 'class-validator';

export class GetFeedDto {
  @IsOptional()
  @IsString()
  tabType?: string;

  @IsOptional()
  @IsIn(['featured', 'timeline'])
  feedType?: 'featured' | 'timeline';

  @IsOptional()
  @IsString()
  cursor?: string;
}
