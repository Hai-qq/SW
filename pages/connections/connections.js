const { request } = require('../../utils/request');
const { normalizeAvatarUrl } = require('../../utils/avatar');

function normalizeConnections(items) {
  return (items || []).map((item) => {
    const avatar = normalizeAvatarUrl(item.targetUser?.avatar || '');
    return {
      ...item,
      targetUser: {
        ...(item.targetUser || {}),
        avatar
      },
      hasAvatar: Boolean(avatar),
      statusText: item.status === 'connected' ? '已连接' : item.status === 'hidden' ? '已隐藏' : '待确认',
      subtitleText: item.matchReason || '你们的连接已经建立'
    };
  });
}

Page({
  data: {
    loading: true,
    items: [],
    showLoading: true,
    showEmpty: false,
    showList: false
  },
  onLoad() {
    this.loadConnections();
  },
  onShow() {
    this.loadConnections();
  },
  async loadConnections() {
    this.setData({ loading: true });

    try {
      const result = await request({
        url: '/api/v1/matching/connections?status=connected'
      });

      this.setData({
        items: normalizeConnections(result.items),
        loading: false,
        showLoading: false,
        showEmpty: !result.items || result.items.length === 0,
        showList: Boolean(result.items && result.items.length)
      });
    } catch (error) {
      this.setData({
        loading: false,
        showLoading: false,
        showEmpty: true,
        showList: false
      });
      wx.showToast({
        title: '连接列表加载失败',
        icon: 'none'
      });
    }
  },
  async openChat(e) {
    const connectionId = e.currentTarget.dataset.id;
    try {
      const conversation = await request({
        url: '/api/v1/chat/conversations',
        method: 'POST',
        data: { connectionId }
      });

      wx.navigateTo({
        url: `/pages/chat/chat?conversationId=${conversation.conversationId}`
      });
    } catch (error) {
      wx.showToast({
        title: '打开小纸条失败',
        icon: 'none'
      });
    }
  }
});
