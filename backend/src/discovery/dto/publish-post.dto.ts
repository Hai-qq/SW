import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class PublishPostDto {
  @IsString()
  @MaxLength(500)
  content!: string;

  @IsString()
  tabType!: string;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  anonymous = false;

  @IsOptional()
  @IsIn(['draft', 'publish'])
  action: 'draft' | 'publish' = 'publish';
}
