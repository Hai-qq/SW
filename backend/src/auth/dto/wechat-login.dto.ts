import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class WechatLoginDto {
  @IsString()
  code!: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  nickname?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @MaxLength(512)
  avatarUrl?: string;
}
