Page({
  data: {
    statusBarHeight: 20,
    windowHeight: 800
  },
  onLoad() {
    const windowInfo = wx.getWindowInfo();
    this.setData({
      statusBarHeight: windowInfo.statusBarHeight || 44,
      windowHeight: windowInfo.windowHeight
    });
  },
  goBack() {
    wx.navigateBack();
  },
  showComingSoon() {
    wx.showToast({ title: '设置项开发中', icon: 'none' });
  }
});
