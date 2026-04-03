Page({
  data: {
    statusBarHeight: 20
  },
  onLoad() {
    const info = wx.getWindowInfo();
    this.setData({ statusBarHeight: info.statusBarHeight || 44 });
  },
  goToHome() {
    wx.redirectTo({ url: '/pages/home/home' });
  },
  goToDiscovery() {
    wx.redirectTo({ url: '/pages/discovery/discovery' });
  }
});
