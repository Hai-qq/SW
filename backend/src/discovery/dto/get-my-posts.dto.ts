import { IsIn, IsOptional } from 'class-validator';

export class GetMyPostsDto {
  @IsOptional()
  @IsIn(['draft', 'published', 'hidden'])
  status?: 'draft' | 'published' | 'hidden';
}
