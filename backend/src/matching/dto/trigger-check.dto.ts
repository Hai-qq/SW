import { Type } from 'class-transformer';
import { IsString, Min } from 'class-validator';

export class TriggerCheckDto {
  @IsString()
  sessionId!: string;

  @Type(() => Number)
  @Min(0)
  sessionSwipeCount!: number;

  @Type(() => Number)
  @Min(0)
  sessionDuration!: number;
}
