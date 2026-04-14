import { BadRequestException, Injectable, ServiceUnavailableException } from '@nestjs/common';

type WechatCodeSessionResponse = {
  openid?: string;
  unionid?: string;
  session_key?: string;
  errcode?: number;
  errmsg?: string;
};

@Injectable()
export class WechatAuthProvider {
  async codeToSession(code: string) {
    const appId = process.env.WECHAT_APP_ID;
    const appSecret = process.env.WECHAT_APP_SECRET;

    if (appId && appSecret && process.env.WECHAT_AUTH_MODE !== 'mock') {
      return this.requestWechatCodeToSession(code, appId, appSecret);
    }

    if (code === 'existing-user-code') {
      return { openid: 'seed-openid-1', unionid: null, sessionKey: null };
    }

    if (code === 'existing-user-with-unionid-code') {
      return { openid: 'seed-openid-1', unionid: 'seed-unionid-1', sessionKey: null };
    }

    return {
      openid: `mock-openid-${code}`,
      unionid: null,
      sessionKey: null,
    };
  }

  private async requestWechatCodeToSession(code: string, appId: string, appSecret: string) {
    const params = new URLSearchParams({
      appid: appId,
      secret: appSecret,
      js_code: code,
      grant_type: 'authorization_code',
    });
    const response = await fetch(
      `https://api.weixin.qq.com/sns/jscode2session?${params.toString()}`,
    );

    if (!response.ok) {
      throw new ServiceUnavailableException('wechat_code2session_unavailable');
    }

    const payload = (await response.json()) as WechatCodeSessionResponse;
    if (payload.errcode || !payload.openid) {
      throw new BadRequestException(payload.errmsg || 'wechat_login_failed');
    }

    return {
      openid: payload.openid,
      unionid: payload.unionid ?? null,
      sessionKey: payload.session_key ?? null,
    };
  }
}
