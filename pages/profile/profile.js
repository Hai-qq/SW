Page({
  data: {
    statusBarHeight: 20,
    windowHeight: 800,
    userInfo: {
      location: '13km Away',
      mbti: 'INTJ',
      matchScore: '89%'
    }
  },
  onLoad() {
    const windowInfo = wx.getWindowInfo();
    this.setData({
      statusBarHeight: windowInfo.statusBarHeight || 44,
      windowHeight: windowInfo.windowHeight
    });
  },
  goToHome() {
    wx.redirectTo({ url: '/pages/home/home' });
  },
  goToDiscovery() {
    wx.redirectTo({ url: '/pages/discovery/discovery' });
  }
});
