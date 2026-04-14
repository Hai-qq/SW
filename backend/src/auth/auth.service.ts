import crypto from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WechatLoginDto } from './dto/wechat-login.dto';
import { WechatAuthProvider } from './providers/wechat-auth.provider';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly wechatAuthProvider: WechatAuthProvider,
  ) {}

  async wechatLogin(dto: WechatLoginDto) {
    const session = await this.wechatAuthProvider.codeToSession(dto.code);
    const identityData = this.buildWechatIdentityData(session);

    let user = await this.prisma.user.findUnique({
      where: { wechatOpenid: session.openid },
    });

    if (!user) {
      user = await this.createWechatUser(session.openid, identityData, dto);
    } else {
      const updateData = this.buildWechatProfileData(dto, this.shouldSyncWechatNickname(user.nickname));
      const nextData = {
        ...identityData,
        ...updateData,
      };

      if (Object.keys(nextData).length > 0) {
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: nextData,
        });
      }
    }

    const accessToken = `sw_at_${crypto.randomUUID().replace(/-/g, '')}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.userAuthSession.create({
      data: {
        userId: user.id,
        accessToken,
        source: 'wechat-miniapp',
        expiresAt,
      },
    });

    return {
      accessToken,
      user: {
        userId: user.id.toString(),
        nickname: user.nickname,
        avatarUrl: user.avatarUrl ?? '',
        onboardingCompleted: user.onboardingCompleted,
      },
    };
  }

  async getMe(userId: bigint) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    return {
      userId: user.id.toString(),
      nickname: user.nickname,
      avatarUrl: user.avatarUrl ?? '',
      onboardingCompleted: user.onboardingCompleted,
    };
  }

  private buildWechatProfileData(dto: WechatLoginDto, allowNicknameSync: boolean) {
    return {
      ...(allowNicknameSync && dto.nickname ? { nickname: dto.nickname } : {}),
      ...(dto.avatarUrl ? { avatarUrl: dto.avatarUrl } : {}),
    };
  }

  private shouldSyncWechatNickname(currentNickname: string) {
    return /^微信用户[A-Za-z0-9_-]{4,}$/.test(currentNickname);
  }

  private buildWechatIdentityData(session: { unionid: string | null }) {
    return {
      ...(session.unionid ? { wechatUnionid: session.unionid } : {}),
    };
  }

  private async createWechatUser(
    openid: string,
    identityData: Record<string, string>,
    dto: WechatLoginDto,
  ) {
    const data = {
      wechatOpenid: openid,
      ...identityData,
      nickname: `微信用户${openid.slice(-6)}`,
      ...this.buildWechatProfileData(dto, true),
      onboardingCompleted: false,
      status: 'active',
    };

    try {
      return await this.prisma.user.create({ data });
    } catch (error) {
      if (!this.isPrimaryKeyConflict(error)) {
        throw error;
      }

      await this.prisma.syncPrimaryKeySequences(['User', 'UserAuthSession']);
      return this.prisma.user.create({ data });
    }
  }

  private isPrimaryKeyConflict(error: unknown) {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002' &&
      Array.isArray(error.meta?.target) &&
      error.meta.target.includes('id')
    );
  }
}
