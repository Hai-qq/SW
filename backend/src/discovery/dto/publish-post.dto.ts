import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class PublishPostDto {
  @IsString()
  content!: string;

  @IsString()
  tabType!: string;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  anonymous = false;
}
