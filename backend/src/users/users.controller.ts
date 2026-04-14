import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '../common/current-user.decorator';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('bootstrap')
  getBootstrap(@CurrentUser() user: { id: bigint }) {
    return this.usersService.getBootstrap(user.id);
  }
}
