import { BadRequestException } from '@nestjs/common';
import { WechatAuthProvider } from '../src/auth/providers/wechat-auth.provider';

describe('WechatAuthProvider', () => {
  const originalEnv = process.env;
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  afterAll(() => {
    process.env = originalEnv;
    global.fetch = originalFetch;
  });

  it('exchanges login code with the WeChat code2Session API when credentials are configured', async () => {
    process.env.WECHAT_APP_ID = 'wx-test-app';
    process.env.WECHAT_APP_SECRET = 'secret-test';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        openid: 'real-openid',
        unionid: 'real-unionid',
        session_key: 'session-key',
      }),
    } as Response);

    const session = await new WechatAuthProvider().codeToSession('login-code');

    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('jscode2session'));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('appid=wx-test-app'));
    expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('js_code=login-code'));
    expect(session).toEqual({
      openid: 'real-openid',
      unionid: 'real-unionid',
      sessionKey: 'session-key',
    });
  });

  it('throws when WeChat returns an error payload', async () => {
    process.env.WECHAT_APP_ID = 'wx-test-app';
    process.env.WECHAT_APP_SECRET = 'secret-test';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        errcode: 40029,
        errmsg: 'invalid code',
      }),
    } as Response);

    await expect(new WechatAuthProvider().codeToSession('bad-code')).rejects.toThrow(BadRequestException);
  });
});
