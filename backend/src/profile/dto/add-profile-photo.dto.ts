import { IsString, MaxLength } from 'class-validator';

export class AddProfilePhotoDto {
  @IsString()
  @MaxLength(500)
  photoUrl!: string;
}
