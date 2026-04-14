import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post } from '@nestjs/common';
import { CurrentUser } from '../common/current-user.decorator';
import { AddProfilePhotoDto } from './dto/add-profile-photo.dto';
import { SortProfilePhotosDto } from './dto/sort-profile-photos.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('info')
  getInfo(@CurrentUser() user: { id: bigint }) {
    return this.profileService.getInfo(user.id);
  }

  @Patch('info')
  updateInfo(@CurrentUser() user: { id: bigint }, @Body() dto: UpdateProfileDto) {
    return this.profileService.updateInfo(user.id, dto);
  }

  @Post('photos')
  @HttpCode(200)
  addPhoto(@CurrentUser() user: { id: bigint }, @Body() dto: AddProfilePhotoDto) {
    return this.profileService.addPhoto(user.id, dto);
  }

  @Delete('photos/:photoId')
  deletePhoto(@CurrentUser() user: { id: bigint }, @Param('photoId') photoId: string) {
    return this.profileService.deletePhoto(user.id, photoId);
  }

  @Patch('photos/sort')
  sortPhotos(@CurrentUser() user: { id: bigint }, @Body() dto: SortProfilePhotosDto) {
    return this.profileService.sortPhotos(user.id, dto);
  }
}
