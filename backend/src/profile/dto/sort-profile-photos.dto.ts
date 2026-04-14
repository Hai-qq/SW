import { Type } from 'class-transformer';
import { ArrayMinSize, IsString, Min, ValidateNested } from 'class-validator';

class SortProfilePhotoItemDto {
  @IsString()
  photoId!: string;

  @Type(() => Number)
  @Min(0)
  sortOrder!: number;
}

export class SortProfilePhotosDto {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SortProfilePhotoItemDto)
  items!: SortProfilePhotoItemDto[];
}
