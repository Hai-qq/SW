// pages/discovery/discovery.js

// 热议榜权重算法：选项差异/性别差异 ×2、互动评论 ×2、转发 ×1
function calcHotScore(item) {
  return item.diffScore * 2 + item.commentCount * 2 + item.shareCount * 1;
}

const RAW_HOT_DATA = [
  {
    id: 1,
    content: "人到中年才发现，父母当年的很多决定其实是对的。",
    agreePercent: 71,
    diffScore: 42,
    commentCount: 312,
    shareCount: 89,
    genderDiffHigh: false,
  },
  {
    id: 2,
    content: "恋爱里主动的那方注定付出更多，也更容易受伤。",
    agreePercent: 38,
    diffScore: 78,
    commentCount: 506,
    shareCount: 134,
    genderDiffHigh: true,
  },
  {
    id: 3,
    content: "真正成熟的友谊不需要每天联系。",
    agreePercent: 62,
    diffScore: 35,
    commentCount: 278,
    shareCount: 67,
    genderDiffHigh: false,
  },
  {
    id: 4,
    content: "在大城市打拼多年，户口比爱情更重要。",
    agreePercent: 44,
    diffScore: 91,
    commentCount: 892,
    shareCount: 203,
    genderDiffHigh: true,
  },
  {
    id: 5,
    content: "结婚和不结婚，本质上是两种不同的人生选择，没有优劣。",
    agreePercent: 55,
    diffScore: 82,
    commentCount: 445,
    shareCount: 156,
    genderDiffHigh: true,
  },
  {
    id: 6,
    content: "真正自律的人不需要靠意志力，只是习惯不同。",
    agreePercent: 58,
    diffScore: 28,
    commentCount: 193,
    shareCount: 44,
    genderDiffHigh: false,
  },
  {
    id: 7,
    content: "学历只是敲门砖，出来后能力才是一切。",
    agreePercent: 49,
    diffScore: 55,
    commentCount: 367,
    shareCount: 98,
    genderDiffHigh: false,
  },
  {
    id: 8,
    content: "月薪一万在三线城市比月薪三万在北京更幸福。",
    agreePercent: 41,
    diffScore: 69,
    commentCount: 521,
    shareCount: 177,
    genderDiffHigh: false,
  },
  {
    id: 9,
    content: "读书无用论是穷人思维，但读死书同样无用。",
    agreePercent: 63,
    diffScore: 47,
    commentCount: 234,
    shareCount: 61,
    genderDiffHigh: false,
  },
  {
    id: 10,
    content: "现代人的孤独感，根源在于社交媒体的过度使用。",
    agreePercent: 52,
    diffScore: 31,
    commentCount: 189,
    shareCount: 52,
    genderDiffHigh: false,
  },
  {
    id: 11,
    content: "长期单身的人比长期恋爱的人更了解自己。",
    agreePercent: 48,
    diffScore: 22,
    commentCount: 145,
    shareCount: 38,
    genderDiffHigh: false,
  },
  {
    id: 12,
    content: "旅行只是用钱换回忆，未必真的改变一个人。",
    agreePercent: 36,
    diffScore: 18,
    commentCount: 112,
    shareCount: 29,
    genderDiffHigh: false,
  },
];

// 计算热度分并排序
const HOT_LIST = RAW_HOT_DATA.map((item) => ({
  ...item,
  hotScore: calcHotScore(item),
}))
  .sort((a, b) => b.hotScore - a.hotScore)
  .map((item, index) => ({ ...item, rank: index + 1 }));

const CAVE_LIST = [
  {
    id: "c1",
    virtualAvatar: "🦊",
    nickname: "迷路的狐狸",
    timeAgo: "12分钟前",
    content:
      "在大城市待久了，有时候真的分不清是在生活，还是只是在维持生存的体征。今天下班路上的晚霞好美，突然好想哭。",
    likeCount: 38,
    commentCount: 12,
  },
  {
    id: "c2",
    virtualAvatar: "🐋",
    nickname: "深海里的鲸鱼",
    timeAgo: "45分钟前",
    content:
      "辞职后的第30天。没有焦虑，只有一种如释重负的空虚感。我开始练习每天只做一个决定：中午吃什么。",
    likeCount: 91,
    commentCount: 27,
  },
  {
    id: "c3",
    virtualAvatar: "🌵",
    nickname: "沙漠里的仙人掌",
    timeAgo: "2小时前",
    content:
      "失眠第三天。不是因为什么大事，就是脑子里的一些小事反复播放。不知道有多少人和我一样。",
    likeCount: 156,
    commentCount: 43,
  },
  {
    id: "c4",
    virtualAvatar: "🪐",
    nickname: "漫游星际的人",
    timeAgo: "昨天",
    content:
      "和相处了5年的朋友渐渐疏远了，不是因为吵架，只是生活把我们带向了不同的方向。有时候想起来会有点难过。",
    likeCount: 204,
    commentCount: 58,
  },
];

const SQUARE_LIST = [
  {
    id: "s1",
    virtualAvatar: "🦅",
    nickname: "鹰眼少年",
    category: "生活",
    caption: "今天的云像棉花糖，拍了二十张只有这张最好看",
    bgColor: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    likeCount: 312,
  },
  {
    id: "s2",
    virtualAvatar: "🐆",
    nickname: "豹纹女孩",
    category: "颜值",
    caption: "新买的裙子，在公司被夸了三次今天很开心",
    bgColor: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
    likeCount: 576,
  },
  {
    id: "s3",
    virtualAvatar: "🦁",
    nickname: "狮子座的人",
    category: "财富",
    caption: "副业第一个月，多赚了3000。分享一下我的方法",
    bgColor: "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
    likeCount: 891,
  },
  {
    id: "s4",
    virtualAvatar: "🐺",
    nickname: "独行狼",
    category: "身材",
    caption: "健身第180天，终于看到了马甲线的轮廓",
    bgColor: "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)",
    likeCount: 443,
  },
];

Page({
  data: {
    statusBarHeight: 20,
    windowHeight: 800,
    currentSubTab: "hot",
    hotList: HOT_LIST,
    caveList: CAVE_LIST,
    squareList: SQUARE_LIST,
    squareFilters: ["全部", "颜值", "身材", "生活", "财富"],
    currentSquareFilter: "全部",
  },

  onLoad() {
    const windowInfo = wx.getWindowInfo();
    this.setData({
      statusBarHeight: windowInfo.statusBarHeight || 44,
      windowHeight: windowInfo.windowHeight,
    });
  },

  switchSubTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentSubTab: tab });
  },

  switchSquareFilter(e) {
    const filter = e.currentTarget.dataset.filter;
    this.setData({ currentSquareFilter: filter });
    // 实际应过滤 squareList，此处模拟
  },

  likeCavePost(e) {
    const { id } = e.currentTarget.dataset;
    const caveList = this.data.caveList.map((item) => {
      if (item.id !== id) return item;
      return { ...item, likeCount: item.likeCount + 1 };
    });
    this.setData({ caveList });
  },

  commentCavePost() {
    wx.showToast({ title: "评论功能开发中", icon: "none" });
  },

  publishCavePost() {
    wx.showToast({ title: "发布树洞开发中", icon: "none" });
  },

  openPublish() {
    wx.showToast({ title: "发布", icon: "none" });
  },

  goToHome() {
    wx.redirectTo({ url: "/pages/home/home" });
  },

  goToChat() {
    wx.redirectTo({ url: "/pages/chat/chat" });
  },
});
