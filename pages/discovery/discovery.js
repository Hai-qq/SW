const { request } = require('../../utils/request');

Page({
  data: {
    statusBarHeight: 20,
    windowHeight: 800,
    tabs: ['全部', '内心世界', '旅行与探索', '价值观', '社会观察'],
    currentTab: '全部',
    featuredItems: [],
    timelineItems: [],
  },
  async onLoad() {
    const windowInfo = wx.getWindowInfo();
    this.setData({
      statusBarHeight: windowInfo.statusBarHeight || 44,
      windowHeight: windowInfo.windowHeight
    });
    await this.loadFeed();
  },
  async loadFeed() {
    try {
      const [featured, timeline] = await Promise.all([
        request({
          url: `/api/v1/discovery/feed?tabType=${encodeURIComponent(this.data.currentTab)}&feedType=featured`
        }),
        request({
          url: `/api/v1/discovery/feed?tabType=${encodeURIComponent(this.data.currentTab)}&feedType=timeline`
        })
      ]);

      this.setData({
        featuredItems: featured.items || [],
        timelineItems: timeline.items || []
      });
    } catch (error) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },
  goToHome() {
    wx.redirectTo({ url: '/pages/home/home' });
  },
  goToChat() {
    wx.redirectTo({ url: '/pages/chat/chat' });
  },
  async openPublish() {
    const result = await wx.showModal({
      title: '发布观点',
      editable: true,
      placeholderText: '写下你此刻的想法'
    });

    if (!result.confirm || !result.content) {
      return;
    }

    try {
      await request({
        url: '/api/v1/discovery/publish',
        method: 'POST',
        data: {
          content: result.content,
          tabType: this.data.currentTab === '全部' ? '价值观' : this.data.currentTab,
          anonymous: false
        }
      });
      wx.showToast({ title: '已发布', icon: 'none' });
      await this.loadFeed();
    } catch (error) {
      wx.showToast({ title: '发布失败', icon: 'none' });
    }
  },
  async switchTab(e) {
    this.setData({
      currentTab: e.currentTarget.dataset.tab
    });
    await this.loadFeed();
  }
});
