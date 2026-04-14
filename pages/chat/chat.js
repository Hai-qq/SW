const { request } = require('../../utils/request');
const { normalizeAvatarUrl } = require('../../utils/avatar');

function formatTime(value) {
  if (!value) {
    return '';
  }

  const date = new Date(value);
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${hour}:${minute}`;
}

function normalizeConversation(item) {
  const peer = item.peer || {};
  const avatar = normalizeAvatarUrl(peer.avatar || '');
  return {
    ...item,
    peer: {
      ...peer,
      avatar
    },
    hasAvatar: Boolean(avatar),
    hasUnread: Number(item.unreadCount || 0) > 0,
    unreadText: Number(item.unreadCount || 0) > 99 ? '99+' : String(item.unreadCount || 0),
    timeText: formatTime(item.lastMessageAt),
    previewText: item.lastMessageText || '还没有小纸条，先打个招呼吧。'
  };
}

function normalizeConnection(item) {
  const targetUser = item.targetUser || {};
  const avatar = normalizeAvatarUrl(targetUser.avatar || '');
  return {
    connectionId: item.connectionId,
    status: item.status,
    matchReason: item.matchReason || '你们有一些接近的表达频率。',
    peer: {
      ...targetUser,
      avatar
    },
    hasAvatar: Boolean(avatar)
  };
}

function normalizeMessages(items) {
  return (items || []).map((item) => ({
    ...item,
    rowClass: item.isMine ? 'message-row mine' : 'message-row'
  }));
}

Page({
  data: {
    statusBarHeight: 20,
    mode: 'list',
    isListMode: true,
    isDetailMode: false,
    conversations: [],
    connections: [],
    messages: [],
    activeConversation: null,
    pageTitle: '小纸条',
    messageInput: '',
    loading: true,
    showConversationLoading: true,
    showConversationEmpty: false,
    showConversationList: false,
    showConnectionEntrypoints: false,
    showMessageEmpty: false,
    nextCursor: null,
    hasOlderMessages: false,
    messageScrollIntoView: ''
  },
  onLoad(options) {
    const info = wx.getWindowInfo();
    this.setData({ statusBarHeight: info.statusBarHeight || 44 });
    this.initPageAsync(options);
  },
  async initPageAsync(options = {}) {
    const app = getApp();
    if (typeof app.ensureBootstrap === 'function') {
      await app.ensureBootstrap();
    }

    if (app.globalData.authRequired || !app.globalData.currentUser) {
      wx.redirectTo({ url: '/pages/auth/auth' });
      return;
    }

    await this.loadConversations();

    if (!options.conversationId) {
      return;
    }

    const target = this.data.conversations.find(
      (item) => item.conversationId === options.conversationId
    );
    if (target) {
      await this.openConversationDetail(target);
    }
  },
  onShow() {
    if (this.data.isListMode) {
      this.loadConversations();
    }
  },
  async loadConversations() {
    this.setData({ loading: true });
    try {
      const result = await request({ url: '/api/v1/chat/conversations' });
      const conversations = (result.items || []).map(normalizeConversation);
      this.setData({
        conversations,
        loading: false,
        showConversationLoading: false,
        showConversationEmpty: conversations.length === 0,
        showConversationList: conversations.length > 0
      });
      if (conversations.length === 0) {
        await this.loadConnections();
      } else {
        this.setData({
          connections: [],
          showConnectionEntrypoints: false
        });
      }
    } catch (error) {
      this.setData({
        loading: false,
        showConversationLoading: false,
        showConversationEmpty: true,
        showConversationList: false,
        showConnectionEntrypoints: false
      });
      wx.showToast({ title: '小纸条加载失败', icon: 'none' });
    }
  },
  async loadConnections() {
    try {
      const result = await request({
        url: '/api/v1/matching/connections?status=connected'
      });
      const connections = (result.items || []).map(normalizeConnection);
      this.setData({
        connections,
        showConnectionEntrypoints: connections.length > 0,
        showConversationEmpty: connections.length === 0
      });
    } catch (error) {
      this.setData({
        connections: [],
        showConnectionEntrypoints: false
      });
    }
  },
  async openConnection(e) {
    const connectionId = e.currentTarget.dataset.id;
    const connection = this.data.connections.find((item) => item.connectionId === connectionId);
    if (!connection) {
      return;
    }

    try {
      const conversation = await request({
        url: '/api/v1/chat/conversations',
        method: 'POST',
        data: { connectionId }
      });
      const normalized = normalizeConversation({
        ...conversation,
        peer: conversation.peer || connection.peer
      });
      await this.openConversationDetail(normalized);
    } catch (error) {
      wx.showToast({ title: '打开小纸条失败', icon: 'none' });
    }
  },
  async openConversation(e) {
    const conversationId = e.currentTarget.dataset.id;
    const conversation = this.data.conversations.find(
      (item) => item.conversationId === conversationId
    );
    if (conversation) {
      await this.openConversationDetail(conversation);
    }
  },
  async openConversationDetail(conversation) {
    this.setData({
      mode: 'detail',
      isListMode: false,
      isDetailMode: true,
      activeConversation: conversation,
      pageTitle: conversation.peer.nickname,
      messages: [],
      showMessageEmpty: true,
      nextCursor: null,
      hasOlderMessages: false,
      messageScrollIntoView: ''
    });
    await this.loadMessages(conversation.conversationId);
  },
  async loadMessages(conversationId, options = {}) {
    try {
      const limit = options.prepend ? 20 : 30;
      const beforeQuery = options.before ? `&before=${encodeURIComponent(options.before)}` : '';
      const result = await request({
        url: `/api/v1/chat/conversations/${conversationId}/messages?limit=${limit}${beforeQuery}`
      });
      const loadedMessages = normalizeMessages(result.items);
      const messages = options.prepend
        ? loadedMessages.concat(this.data.messages)
        : loadedMessages;
      const lastMessage = messages[messages.length - 1];
      this.setData({
        messages,
        nextCursor: result.nextCursor,
        hasOlderMessages: Boolean(result.nextCursor),
        showMessageEmpty: messages.length === 0,
        messageScrollIntoView: options.prepend || !lastMessage ? '' : `message-${lastMessage.messageId}`
      });
      if (!options.prepend) {
        await this.markActiveConversationRead();
      }
    } catch (error) {
      wx.showToast({ title: '消息加载失败', icon: 'none' });
    }
  },
  async loadOlderMessages() {
    if (!this.data.activeConversation || !this.data.nextCursor) {
      return;
    }

    await this.loadMessages(this.data.activeConversation.conversationId, {
      prepend: true,
      before: this.data.nextCursor
    });
  },
  async markActiveConversationRead() {
    const conversation = this.data.activeConversation;
    if (!conversation) {
      return;
    }

    try {
      await request({
        url: `/api/v1/chat/conversations/${conversation.conversationId}/read`,
        method: 'POST'
      });
      this.setData({
        conversations: this.data.conversations.map((item) => (
          item.conversationId === conversation.conversationId
            ? { ...item, unreadCount: 0, hasUnread: false, unreadText: '0' }
            : item
        ))
      });
    } catch (error) {
      // 已读状态不阻断聊天主流程。
    }
  },
  backToList() {
    this.setData({
      mode: 'list',
      isListMode: true,
      isDetailMode: false,
      activeConversation: null,
      pageTitle: '小纸条',
      messages: [],
      showMessageEmpty: false,
      messageInput: '',
      connections: [],
      showConnectionEntrypoints: false,
      nextCursor: null,
      hasOlderMessages: false,
      messageScrollIntoView: ''
    });
    this.loadConversations();
  },
  onMessageInput(e) {
    this.setData({ messageInput: e.detail.value });
  },
  async sendMessage() {
    const content = (this.data.messageInput || '').trim();
    const conversation = this.data.activeConversation;
    if (!content || !conversation) {
      return;
    }

    try {
      await request({
        url: `/api/v1/chat/conversations/${conversation.conversationId}/messages`,
        method: 'POST',
        data: { content }
      });
      this.setData({ messageInput: '' });
      await Promise.all([
        this.loadMessages(conversation.conversationId),
        this.loadConversations()
      ]);
    } catch (error) {
      wx.showToast({ title: '发送失败', icon: 'none' });
    }
  },
  goToHome() {
    wx.redirectTo({ url: '/pages/home/home' });
  },
  goToDiscovery() {
    wx.redirectTo({ url: '/pages/discovery/discovery' });
  }
});
