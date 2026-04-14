import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class AppAuthGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;

    if (typeof authorization === 'string' && authorization.startsWith('Bearer ')) {
      const accessToken = authorization.slice('Bearer '.length).trim();
      const session = await this.prisma.userAuthSession.findUnique({
        where: { accessToken },
      });

      if (!session || session.expiresAt.getTime() <= Date.now()) {
        throw new UnauthorizedException('invalid_access_token');
      }

      request.currentUser = { id: session.userId };
      return true;
    }

    const allowTestAuth = process.env.ALLOW_TEST_AUTH !== 'false';
    if (allowTestAuth) {
      const rawUserId = request.headers['x-test-user-id'] ?? process.env.TEST_USER_ID ?? '1';
      request.currentUser = { id: BigInt(Array.isArray(rawUserId) ? rawUserId[0] : rawUserId) };
      return true;
    }

    throw new UnauthorizedException('missing_access_token');
  }
}
