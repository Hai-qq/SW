// pages/profile/profile.js

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

const LEFT_COL = BROWSE_CARDS.filter((_, i) => i % 2 === 0);
const RIGHT_COL = BROWSE_CARDS.filter((_, i) => i % 2 !== 0);

const DEFAULT_USER = {
  avatar:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBt3naLQEnCWKVteeUGkKIuzOacHdDOhl8PJ7igG8HG7pVMRO-IF0FElwMYp8qwhGkIWQ8FurC1d_5V7Kh5hmXwtNl3_4C4ygR6uNysFWWXqCKgEIJOZm4d4KDhkrgHNImge1TIERx1_yakuYNKv3-OLyneSEXLzPqOE15pNSZWJ9x721kuzWtr93I26hQMKP4VcaIVKU5EKMVUZ1FZsX2OFWNUP4n5USY_LWNbUQ3yQCjvc82S0teyitLTKXgz3uoTJR4LJDg2Z-8",
  name: "林深处的麋鹿",
  genderAge: "♀ 24",
  mbti: "INFJ-T",
  desc: "在喧嚣的世界寻找同频的声音，慢热却也深邃。",
  gender: "女",
  age: "24",
  city: "上海",
};

Page({
  data: {
    statusBarHeight: 20,
    windowHeight: 800,
    mainContentPadPx: 100, // main-content 顶部留白，动态计算

    // 用户信息
    userInfo: { ...DEFAULT_USER },
    isMember: false,

    // 词云
    wordCloudItems: WORD_CLOUD_ITEMS,
    topKeywords: TOP_KEYWORDS,
    answeredCount: 48,

    // 浏览记录
    currentBrowseTab: "voted",
    leftColItems: LEFT_COL,
    rightColItems: RIGHT_COL,

    // 编辑面板
    showEditPanel: false,
    editForm: { ...DEFAULT_USER },
    genderOptions: ["男", "女", "保密"],
  },

  onLoad() {
    const windowInfo = wx.getWindowInfo();
    const menuBtn = wx.getMenuButtonBoundingClientRect();
    // 系统胶囊左侧 + 12px 富余 = header-inner 的右边距（px）
    // main-content 顶部留白 = 胶囊底部 + 24px 呼吸空间
    const mainContentPadPx = menuBtn.bottom + 24;
    this.setData({
      statusBarHeight: windowInfo.statusBarHeight || 44,
      windowHeight: windowInfo.windowHeight,
      mainContentPadPx,
    });
  },

  /* ====== 编辑资料 ====== */
  openEditProfile() {
    // 打开面板时同步当前用户信息到 editForm
    this.setData({
      showEditPanel: true,
      editForm: { ...this.data.userInfo },
    });
  },

  closeEditPanel() {
    this.setData({ showEditPanel: false });
  },

  chooseAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success: (res) => {
        const tempPath = res.tempFilePaths[0];
        this.setData({
          editForm: { ...this.data.editForm, avatar: tempPath },
        });
      },
    });
  },

  onEditName(e) {
    this.setData({ editForm: { ...this.data.editForm, name: e.detail.value } });
  },

  onEditGender(e) {
    const val = e.currentTarget.dataset.value;
    const age = this.data.editForm.age || this.data.userInfo.age;
    const genderAge = `${val === "女" ? "♀" : val === "男" ? "♂" : "—"} ${age}`;
    this.setData({
      editForm: { ...this.data.editForm, gender: val, genderAge },
    });
  },

  onEditAge(e) {
    const age = e.detail.value;
    const gender = this.data.editForm.gender || this.data.userInfo.gender;
    const genderAge = `${gender === "女" ? "♀" : gender === "男" ? "♂" : "—"} ${age}`;
    this.setData({ editForm: { ...this.data.editForm, age, genderAge } });
  },

  onEditCity(e) {
    this.setData({ editForm: { ...this.data.editForm, city: e.detail.value } });
  },

  onEditDesc(e) {
    this.setData({ editForm: { ...this.data.editForm, desc: e.detail.value } });
  },

  saveProfile() {
    const updated = { ...this.data.editForm };
    this.setData({ userInfo: updated, showEditPanel: false });
    wx.showToast({ title: "保存成功", icon: "success" });
  },

  /* ====== 会员购买 ====== */
  openMemberPurchase() {
    wx.showToast({ title: "会员购买功能开发中", icon: "none" });
  },

  /* ====== 浏览记录 Tab ====== */
  switchBrowseTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentBrowseTab: tab });
  },

  /* ====== 功能入口 ====== */
  openPreferences() {
    wx.showToast({ title: "偏好设定开发中", icon: "none" });
  },

  openReport() {
    wx.showToast({ title: "价值观报告开发中", icon: "none" });
  },

  openSettings() {
    wx.showToast({ title: "账号设置开发中", icon: "none" });
  },

  /* ====== 导航 ====== */
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
