// pages/chat-detail/chat-detail.js

const MOCK_PEERS = {
  u1: {
    name: "LUNA",
    isOnline: true,
    matchScore: 68,
    context: "来自同频匹配",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDLrAr37lhydIX_1LumoKueO-D-FbfMv-u9ccyCDSbEVfqJ30SBBxej5ljN8hbNo3G2jVjVsg2WfdnPfOkfl7GN9X8cOH1yUxB26QeajBgV7Lw35RgYOEXfsvS0HkpBsoVKeMjM9CAc-O7u9MjrggZZKYsAyASBH6La-bXbdmH3Y-BRxKQKGFPzCnSxhjOrr9Uhjf0VUlm5bQGfu33dk7Ok4kx6EM3vcj57j7Y1MtYMgULeBpRWSZC8BQyrnjDf2D_VTkIR0vWNJOI",
  },
  u2: {
    name: "MARCUS",
    isOnline: false,
    matchScore: 82,
    context: "观点共鸣",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAn5HzxKpfPgAW1WfhKpnshh3KoTUthnkQQ01WXgHFpX-rvCaJgK448OBgBIjOw3Bdo3nog51RWfExCiH1lzpPrN6T8dnDenhtwbzbJJY2cNcSO_O4c1_JHMzrTYo2ObLjq18yEQ-FQc5q6nI4eWgTpGOU89zuSjxmqzJpQdHEEAFZaCT2TZY6nWoGc1LgZEQygHBRLBi04V6X_Qk_zTjIg-2jUGzf48j8s5kAugk1NVLCrzowRlMO5BB2CwLd6mpAkG-K9786mvQY",
  },
  u3: {
    name: "ELENA",
    isOnline: true,
    matchScore: 91,
    context: "高频同频",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCnJoNUvpdNdhMH1dxfOqPQW_lusQ3CJSA1xm7sgVdpn2wfUhclcjunpwvbUuRB1OdNwfg4PjxB3JHTMgrb8S1LEhdb1JLE4tiOlYJ5YIgRTmGdq3X0iUwxTZEOuP9RHyiX0l6fQ3cEEaJ_0d0USv2apQ6LvdXpl5ydJ0YMa0RARk6lrYY8Wyr5Ec2hdx6YOgZF_eHLv6eVQ3FdtJ9nJjdGt7NEpqEB5GKRbVJcHRVS752Y2UmrRHsWKw9sQvnv3yH0u4cGcMph82k",
  },
  u4: {
    name: "JULIA",
    isOnline: false,
    matchScore: 74,
    context: "小纸条来信",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB-Z8IF5na2wP_u3mIa7KkxtYQMxkGNEnQTXeI7C24KLECwa-tXuUPLgaOFnyM2S85MR7PLo-ogcRtfUSqHQq6E_M-3Spk1lTt12Rta6_-hEAOuD_1WfyOotIO49yfl_GnuTQrBCNIVmOIA05b8iF_QO9THJsxRiCqD-jjpwU5CdxOKrFf5QRYf3ApwysooRMiMY9ClbhuxlO2G6n2C6da3emzy4tOIq4nT0KB5bHI7PSya-hqLHAe-DNG4M7Yp89lZn9j_Y1zZSIw",
  },
};

const MOCK_MESSAGES = {
  u1: [
    {
      id: "m1",
      text: "你好！看到你的想法很有共鸣～",
      fromSelf: false,
      time: "14:20",
      showTime: true,
    },
    {
      id: "m2",
      text: "哈哈，哪一条让你有共鸣？",
      fromSelf: true,
      time: "14:22",
      showTime: false,
    },
    {
      id: "m3",
      text: "就是那道关于「成熟的人先理解再表达」，我觉得说得特别准",
      fromSelf: false,
      time: "14:23",
      showTime: false,
    },
    {
      id: "m4",
      text: "对！很多人习惯先表达，然后才去理解对方",
      fromSelf: true,
      time: "14:25",
      showTime: false,
    },
    {
      id: "m5",
      text: "看来我们三观挺合的，希望能认识一下～",
      fromSelf: false,
      time: "14:32",
      showTime: true,
    },
  ],
  u2: [
    {
      id: "m1",
      text: "你对那道题的回答让我印象深刻",
      fromSelf: false,
      time: "昨天 20:10",
      showTime: true,
    },
    {
      id: "m2",
      text: "哦？哪道题？",
      fromSelf: true,
      time: "昨天 20:15",
      showTime: false,
    },
    {
      id: "m3",
      text: "就是关于「户口和爱情」那题，你的观点很独特",
      fromSelf: false,
      time: "昨天 20:18",
      showTime: false,
    },
  ],
  u3: [
    {
      id: "m1",
      text: "哈哈，我们三观好像差挺多的",
      fromSelf: false,
      time: "周二 19:00",
      showTime: true,
    },
    {
      id: "m2",
      text: "差异大才有意思啊，可以互相了解",
      fromSelf: true,
      time: "周二 19:05",
      showTime: false,
    },
  ],
  u4: [
    {
      id: "m1",
      text: "线下大冒险你要参加吗？",
      fromSelf: false,
      time: "周一 12:00",
      showTime: true,
    },
    {
      id: "m2",
      text: "什么活动，说来听听～",
      fromSelf: true,
      time: "周一 12:08",
      showTime: false,
    },
  ],
};

let _msgCounter = 100;

Page({
  data: {
    statusBarHeight: 20,
    windowHeight: 800,
    headerTopPadding: 64,
    headerRightPadding: 132,
    headerRowHeight: 32,
    messagesTopPadding: 142,
    peerId: "",
    peerName: "",
    peerAvatar: "",
    peerContext: "",
    matchScore: 0,
    isOnline: false,
    messages: [],
    inputText: "",
    keyboardHeight: 0,
    scrollToId: "",
  },

  onLoad(options) {
    const windowInfo = wx.getWindowInfo();
    const menuBtn = wx.getMenuButtonBoundingClientRect();
    const headerTopPadding = menuBtn.top;
    const headerRightPadding = windowInfo.windowWidth - menuBtn.left + 10;
    const headerRowHeight = menuBtn.height;
    const messagesTopPadding = menuBtn.bottom + 42;
    const peerId = options.id || "u1";
    const peer = MOCK_PEERS[peerId] || MOCK_PEERS["u1"];
    const messages = (MOCK_MESSAGES[peerId] || []).map((m) => ({ ...m }));

    this.setData({
      statusBarHeight: windowInfo.statusBarHeight || 44,
      windowHeight: windowInfo.windowHeight,
      headerTopPadding,
      headerRightPadding,
      headerRowHeight,
      messagesTopPadding,
      peerId,
      peerName: peer.name,
      peerAvatar: peer.avatar,
      peerContext: peer.context,
      matchScore: peer.matchScore,
      isOnline: peer.isOnline,
      messages,
    });

    // 滚动到最后一条消息
    this._scrollToBottom();
  },

  _scrollToBottom() {
    const { messages } = this.data;
    if (messages.length === 0) return;
    const lastId = messages[messages.length - 1].id;
    this.setData({ scrollToId: `msg-${lastId}` });
  },

  onInput(e) {
    this.setData({ inputText: e.detail.value });
  },

  onKeyboardHeightChange(e) {
    this.setData({ keyboardHeight: e.detail.height });
  },

  sendMessage() {
    const text = this.data.inputText.trim();
    if (!text) return;

    _msgCounter += 1;
    const newMsg = {
      id: `new-${_msgCounter}`,
      text,
      fromSelf: true,
      time: this._formatTime(new Date()),
      showTime: false,
    };

    const messages = [...this.data.messages, newMsg];
    this.setData({ messages, inputText: "" });
    this._scrollToBottom();
  },

  _formatTime(date) {
    const h = String(date.getHours()).padStart(2, "0");
    const m = String(date.getMinutes()).padStart(2, "0");
    return `${h}:${m}`;
  },

  openProfile() {
    wx.showToast({ title: "查看三观档案", icon: "none" });
  },

  goBack() {
    wx.navigateBack();
  },
});
