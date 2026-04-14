import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { WechatAuthProvider } from './providers/wechat-auth.provider';

@Module({
  controllers: [AuthController],
  providers: [AuthService, WechatAuthProvider],
  exports: [AuthService],
})
export class AuthModule {}
