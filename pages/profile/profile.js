// pages/profile/profile.js

// 词云数据：word=关键词, size=字号, opacity=透明度, left/top=位置(%), rotate=旋转, color=颜色, weight=字重
const WORD_CLOUD_ITEMS = [
  {
    id: 1,
    word: "理想主义",
    size: 36,
    opacity: 1,
    left: 12,
    top: 15,
    rotate: -8,
    color: "#F5D76E",
    weight: "bold",
  },
  {
    id: 2,
    word: "独立",
    size: 28,
    opacity: 0.85,
    left: 52,
    top: 8,
    rotate: 5,
    color: "#FFFFFF",
    weight: "bold",
  },
  {
    id: 3,
    word: "深度思考",
    size: 32,
    opacity: 0.9,
    left: 68,
    top: 20,
    rotate: -3,
    color: "#A8E6CF",
    weight: "bold",
  },
  {
    id: 4,
    word: "内敛",
    size: 26,
    opacity: 0.7,
    left: 5,
    top: 38,
    rotate: 12,
    color: "#FFFFFF",
    weight: "bold",
  },
  {
    id: 5,
    word: "慢热",
    size: 40,
    opacity: 1,
    left: 35,
    top: 35,
    rotate: 0,
    color: "#FFD3B6",
    weight: "bold",
  },
  {
    id: 6,
    word: "感性",
    size: 24,
    opacity: 0.65,
    left: 72,
    top: 42,
    rotate: -10,
    color: "#FFFFFF",
    weight: "bold",
  },
  {
    id: 7,
    word: "自洽",
    size: 30,
    opacity: 0.88,
    left: 18,
    top: 58,
    rotate: 7,
    color: "#C7CEEA",
    weight: "bold",
  },
  {
    id: 8,
    word: "自由",
    size: 34,
    opacity: 0.95,
    left: 55,
    top: 55,
    rotate: -5,
    color: "#F5D76E",
    weight: "bold",
  },
  {
    id: 9,
    word: "克制",
    size: 22,
    opacity: 0.6,
    left: 78,
    top: 65,
    rotate: 15,
    color: "#FFFFFF",
    weight: "bold",
  },
  {
    id: 10,
    word: "平等",
    size: 28,
    opacity: 0.8,
    left: 8,
    top: 72,
    rotate: -6,
    color: "#FFFFFF",
    weight: "bold",
  },
  {
    id: 11,
    word: "真实",
    size: 38,
    opacity: 1,
    left: 40,
    top: 70,
    rotate: 3,
    color: "#A8E6CF",
    weight: "bold",
  },
  {
    id: 12,
    word: "边界感",
    size: 26,
    opacity: 0.75,
    left: 70,
    top: 80,
    rotate: -12,
    color: "#FFFFFF",
    weight: "bold",
  },
  {
    id: 13,
    word: "共情",
    size: 30,
    opacity: 0.88,
    left: 20,
    top: 85,
    rotate: 8,
    color: "#FFD3B6",
    weight: "bold",
  },
  {
    id: 14,
    word: "成长型思维",
    size: 22,
    opacity: 0.6,
    left: 55,
    top: 88,
    rotate: -4,
    color: "#FFFFFF",
    weight: "bold",
  },
];

const TOP_KEYWORDS = [
  { id: 1, word: "慢热 · 理想主义", strength: 92, color: "#F5D76E" },
  { id: 2, word: "真实 · 深度思考", strength: 87, color: "#A8E6CF" },
  { id: 3, word: "自由 · 自洽", strength: 81, color: "#FFD3B6" },
];

// 瀑布流卡片数据（模拟不规则高度）
const BROWSE_CARDS = [
  {
    id: "b1",
    tag: "内心世界",
    content: "认为晚上的效率永远比白天高。",
    myVote: "👍 认同",
    agreePercent: 42,
    bgColor: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
    height: 280,
  },
  {
    id: "b2",
    tag: "价值观",
    content: "相信真正成熟的人会先理解，再表达自己。",
    myVote: "👍 认同",
    agreePercent: 71,
    bgColor: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    height: 360,
  },
  {
    id: "b3",
    tag: "社会观察",
    content: "坚定地认为《虎胆龙威》是一部圣诞电影。",
    myVote: "👎 不认同",
    agreePercent: 65,
    bgColor: "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)",
    height: 320,
  },
  {
    id: "b4",
    tag: "生活观",
    content: "在大城市打拼多年，户口比爱情更重要。",
    myVote: "👍 认同",
    agreePercent: 44,
    bgColor: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    height: 300,
  },
  {
    id: "b5",
    tag: "人生观",
    content: "真正的朋友不需要每天联系，但关键时刻一定在。",
    myVote: "👍 认同",
    agreePercent: 62,
    bgColor: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
    height: 260,
  },
  {
    id: "b6",
    tag: "爱情观",
    content: "恋爱里主动的那方注定付出更多，也更容易受伤。",
    myVote: "👎 不认同",
    agreePercent: 38,
    bgColor: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    height: 340,
  },
];

// 奇数索引给左列，偶数给右列
const LEFT_COL = BROWSE_CARDS.filter((_, i) => i % 2 === 0);
const RIGHT_COL = BROWSE_CARDS.filter((_, i) => i % 2 !== 0);

Page({
  data: {
    statusBarHeight: 20,
    windowHeight: 800,
    wordCloudItems: WORD_CLOUD_ITEMS,
    topKeywords: TOP_KEYWORDS,
    answeredCount: 48,
    currentBrowseTab: "voted",
    leftColItems: LEFT_COL,
    rightColItems: RIGHT_COL,
  },

  onLoad() {
    const windowInfo = wx.getWindowInfo();
    this.setData({
      statusBarHeight: windowInfo.statusBarHeight || 44,
      windowHeight: windowInfo.windowHeight,
    });
  },

  switchBrowseTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentBrowseTab: tab });
    // 实际应根据 tab 请求不同数据
  },

  openPreferences() {
    wx.showToast({ title: "偏好设定开发中", icon: "none" });
  },

  openReport() {
    wx.showToast({ title: "价值观报告开发中", icon: "none" });
  },

  openSettings() {
    wx.showToast({ title: "账号设置开发中", icon: "none" });
  },

  goBack() {
    wx.navigateBack();
  },

  goToHome() {
    wx.redirectTo({ url: "/pages/home/home" });
  },

  goToDiscovery() {
    wx.redirectTo({ url: "/pages/discovery/discovery" });
  },

  goToChat() {
    wx.redirectTo({ url: "/pages/chat/chat" });
  },
});
