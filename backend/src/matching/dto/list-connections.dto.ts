import { IsIn, IsOptional, IsString } from 'class-validator';

export class ListConnectionsDto {
  @IsOptional()
  @IsString()
  @IsIn(['pending', 'connected', 'hidden'])
  status?: 'pending' | 'connected' | 'hidden';
}
