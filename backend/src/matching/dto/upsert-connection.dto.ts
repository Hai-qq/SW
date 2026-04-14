import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpsertConnectionDto {
  @IsString()
  candidateUserId!: string;

  @IsOptional()
  @IsString()
  matchEventId?: string;

  @IsString()
  @IsIn(['connect', 'hide'])
  action!: 'connect' | 'hide';
}
