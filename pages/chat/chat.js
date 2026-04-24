// pages/chat/chat.js
const MOCK_CHAT_LIST = [
  {
    id: "u1",
    name: "LUNA",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDLrAr37lhydIX_1LumoKueO-D-FbfMv-u9ccyCDSbEVfqJ30SBBxej5ljN8hbNo3G2jVjVsg2WfdnPfOkfl7GN9X8cOH1yUxB26QeajBgV7Lw35RgYOEXfsvS0HkpBsoVKeMjM9CAc-O7u9MjrggZZKYsAyASBH6La-bXbdmH3Y-BRxKQKGFPzCnSxhjOrr9Uhjf0VUlm5bQGfu33dk7Ok4kx6EM3vcj57j7Y1MtYMgULeBpRWSZC8BQyrnjDf2D_VTkIR0vWNJOI",
    lastMsg: "看到你的想法很有共鸣，希望能认识一下～",
    lastTime: "14:32",
    unreadCount: 3,
    isOnline: true,
  },
  {
    id: "u2",
    name: "MARCUS",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAn5HzxKpfPgAW1WfhKpnshh3KoTUthnkQQ01WXgHFpX-rvCaJgK448OBgBIjOw3Bdo3nog51RWfExCiH1lzpPrN6T8dnDenhtwbzbJJY2cNcSO_O4c1_JHMzrTYo2ObLjq18yEQ-FQc5q6nI4eWgTpGOU89zuSjxmqzJpQdHEEAFZaCT2TZY6nWoGc1LgZEQygHBRLBi04V6X_Qk_zTjIg-2jUGzf48j8s5kAugk1NVLCrzowRlMO5BB2CwLd6mpAkG-K9786mvQY",
    lastMsg: "你对那道题的回答让我印象深刻",
    lastTime: "昨天",
    unreadCount: 0,
    isOnline: false,
  },
  {
    id: "u3",
    name: "ELENA",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCnJoNUvpdNdhMH1dxfOqPQW_lusQ3CJSA1xm7sgVdpn2wfUhclcjunpwvbUuRB1OdNwfg4PjxB3JHTMgrb8S1LEhdb1JLE4tiOlYJ5YIgRTmGdq3X0iUwxTZEOuP9RHyiX0l6fQ3cEEaJ_0d0USv2apQ6LvdXpl5ydJ0YMa0RARk6lrYY8Wyr5Ec2hdx6YOgZF_eHLv6eVQ3FdtJ9nJjdGt7NEpqEB5GKRbVJcHRVS752Y2UmrRHsWKw9sQvnv3yH0u4cGcMph82k",
    lastMsg: "哈哈，我们三观好像差挺多的",
    lastTime: "周二",
    unreadCount: 1,
    isOnline: true,
  },
  {
    id: "u4",
    name: "JULIA",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB-Z8IF5na2wP_u3mIa7KkxtYQMxkGNEnQTXeI7C24KLECwa-tXuUPLgaOFnyM2S85MR7PLo-ogcRtfUSqHQq6E_M-3Spk1lTt12Rta6_-hEAOuD_1WfyOotIO49yfl_GnuTQrBCNIVmOIA05b8iF_QO9THJsxRiCqD-jjpwU5CdxOKrFf5QRYf3ApwysooRMiMY9ClbhuxlO2G6n2C6da3emzy4tOIq4nT0KB5bHI7PSya-hqLHAe-DNG4M7Yp89lZn9j_Y1zZSIw",
    lastMsg: "线下大冒险你要参加吗？",
    lastTime: "周一",
    unreadCount: 0,
    isOnline: false,
  },
];

Page({
  data: {
    statusBarHeight: 20,
    menuTriggerRight: 0,
    menuTriggerTop: 0,
    menuTriggerH: 32,
    headerInnerMT: 0,
    chatList: MOCK_CHAT_LIST,
    newFriendCount: 5,
    visitorCount: 23,
  },

  onLoad() {
    const info = wx.getWindowInfo();
    const menuBtn = wx.getMenuButtonBoundingClientRect();
    const headerInnerMT = menuBtn.top - (info.statusBarHeight || 44);
    this.setData({
      statusBarHeight: info.statusBarHeight || 44,
      menuTriggerRight: info.windowWidth - menuBtn.left + 8,
      menuTriggerTop: menuBtn.top,
      menuTriggerH: menuBtn.height,
      headerInnerMT,
    });
  },

  openNewFriends() {
    wx.showToast({ title: "新朋友列表开发中", icon: "none" });
  },

  openVisitors() {
    wx.showToast({ title: "访客列表开发中", icon: "none" });
  },

  openChatDetail(e) {
    const { id } = e.currentTarget.dataset;
    // 清除未读数
    const chatList = this.data.chatList.map((item) => {
      if (item.id !== id) return item;
      return { ...item, unreadCount: 0 };
    });
    this.setData({ chatList });
    wx.navigateTo({ url: `/pages/chat-detail/chat-detail?id=${id}` });
  },

  openUserProfile(e) {
    const { id } = e.currentTarget.dataset;
    wx.showToast({ title: `查看 ${id} 三观档案`, icon: "none" });
  },

  openNewChat() {
    wx.showToast({ title: "发起新对话开发中", icon: "none" });
  },

  goToHome() {
    wx.redirectTo({ url: "/pages/home/home" });
  },

  goToDiscovery() {
    wx.redirectTo({ url: "/pages/discovery/discovery" });
  },
});
