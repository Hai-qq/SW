const { request } = require('../../utils/request');

Page({
  data: {
    statusBarHeight: 20,
    windowHeight: 800,
    profile: {
      nickname: '',
      gender: '',
      age: '',
      mbti: '',
      signature: '',
      photos: [],
      counts: {
        visitors: 0,
        followers: 0,
        following: 0,
        interactions: 0
      }
    }
  },
  async onLoad() {
    const windowInfo = wx.getWindowInfo();
    this.setData({
      statusBarHeight: windowInfo.statusBarHeight || 44,
      windowHeight: windowInfo.windowHeight
    });
    await this.loadProfile();
  },
  async loadProfile() {
    try {
      const profile = await request({ url: '/api/v1/profile/info' });
      this.setData({ profile });
    } catch (error) {
      wx.showToast({ title: '档案加载失败', icon: 'none' });
    }
  },
  goToHome() {
    wx.redirectTo({ url: '/pages/home/home' });
  },
  goToDiscovery() {
    wx.redirectTo({ url: '/pages/discovery/discovery' });
  }
});
