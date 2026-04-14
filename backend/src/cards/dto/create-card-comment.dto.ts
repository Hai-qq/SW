import { IsString, MaxLength } from 'class-validator';

export class CreateCardCommentDto {
  @IsString()
  @MaxLength(300)
  content!: string;
}
