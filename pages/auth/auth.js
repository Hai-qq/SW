Page({
  data: {
    statusBarHeight: 20,
    windowHeight: 800,
    loading: false,
    hint: '点击按钮后会通过微信授权登录'
  },

  async onLoad() {
    console.log('[SW Auth Page] onLoad')
    const info = wx.getWindowInfo();
    this.setData({
      statusBarHeight: info.statusBarHeight || 44,
      windowHeight: info.windowHeight
    });

    const app = getApp();
    if (typeof app.ensureBootstrap === 'function') {
      console.log('[SW Auth Page] ensureBootstrap.call')
      await app.ensureBootstrap();
      console.log('[SW Auth Page] ensureBootstrap.done', {
        authRequired: app.globalData.authRequired,
        nextStep: app.globalData.nextStep,
        currentUser: app.globalData.currentUser
      })
    }

    if (!app.globalData.authRequired && app.globalData.currentUser) {
      console.log('[SW Auth Page] already authed, redirecting', {
        nextStep: app.globalData.nextStep
      })
      this.redirectAfterLogin(app.globalData.nextStep);
    }
  },

  async handleWechatAuthorize() {
    console.log('[SW Auth Page] handleWechatAuthorize.click', {
      loading: this.data.loading
    })
    if (this.data.loading) {
      return;
    }

    this.setData({
      loading: true,
      hint: '登录中，请稍候...'
    });
    const app = getApp();

    try {
      const result = await app.loginWithWechatAuthorize();
      console.log('[SW Auth Page] loginWithWechatAuthorize.success', result)
      this.redirectAfterLogin(result.nextStep);
    } catch (error) {
      console.error('[SW Auth Page] loginWithWechatAuthorize.error', error)
      const hint = this.getAuthErrorHint(error);
      this.setData({
        loading: false,
        hint
      });
      wx.showToast({
        title: hint,
        icon: 'none'
      });
    }
  },

  getAuthErrorHint(error) {
    if (error && error.code === 'bootstrap_after_login_failed') {
      return '登录后拉取用户信息失败，请检查后端/数据库';
    }
    if (error && error.code === 'wx_get_user_profile_denied') {
      return '请允许使用微信头像和昵称后再登录';
    }
    if (error && error.code === 'wx_get_user_profile_unavailable') {
      return '当前微信环境不支持获取头像昵称';
    }
    const message = String((error && error.message) || '');
    if (message.includes('request_timeout')) {
      return '登录超时，请检查后端服务';
    }
    if (message.includes('Wechat login failed:')) {
      return '后端登录失败，请检查服务日志';
    }
    if (message.includes('request_failed') || message.includes('request_aborted')) {
      return '网络异常，请确认后端和数据库已启动';
    }
    return '授权失败，请重试';
  },

  redirectAfterLogin(nextStep) {
    const target = nextStep === 'onboarding'
      ? '/pages/onboarding/onboarding'
      : '/pages/home/home';

    console.log('[SW Auth Page] redirectAfterLogin', {
      nextStep,
      target
    })
    wx.redirectTo({ url: target });
  }
});
