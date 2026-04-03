Page({
  data: {
    statusBarHeight: 20,
    windowHeight: 800,
    tabs: ['全部', '内心世界', '旅行与探索', '价值观', '社会观察'],
    currentTab: '全部',
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
  goToChat() {
    wx.redirectTo({ url: '/pages/chat/chat' });
  },
  openPublish() {
    wx.showToast({ title: '发布', icon: 'none' });
  }
});
