import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '../common/current-user.decorator';
import { ProfileService } from './profile.service';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('info')
  getInfo(@CurrentUser() user: { id: bigint }) {
    return this.profileService.getInfo(user.id);
  }
}
