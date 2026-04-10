import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class TestUserGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const rawUserId = request.headers['x-test-user-id'] ?? process.env.TEST_USER_ID ?? '1';
    request.currentUser = { id: BigInt(Array.isArray(rawUserId) ? rawUserId[0] : rawUserId) };
    return true;
  }
}
