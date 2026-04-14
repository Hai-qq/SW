import { IsString } from 'class-validator';

export class OpenConversationDto {
  @IsString()
  connectionId!: string;
}
