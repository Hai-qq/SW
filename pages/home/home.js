// pages/home/home.js
const MATCH_THRESHOLD = 0;

const MATCH_WORD_CLOUD = [
  { id: 1, word: "慢热", size: 44, opacity: 1, left: 15, top: 18, rotate: -8, color: "#1A1A1A" },
  { id: 2, word: "深度思考", size: 34, opacity: 0.78, left: 48, top: 14, rotate: 4, color: "#6F685A" },
  { id: 3, word: "自由", size: 40, opacity: 0.9, left: 63, top: 35, rotate: -5, color: "#1A1A1A" },
  { id: 4, word: "真实", size: 36, opacity: 0.86, left: 20, top: 45, rotate: 6, color: "#8A8170" },
  { id: 5, word: "边界感", size: 30, opacity: 0.7, left: 50, top: 60, rotate: -6, color: "#6F685A" },
  { id: 6, word: "共情", size: 34, opacity: 0.8, left: 18, top: 72, rotate: -3, color: "#1A1A1A" },
  { id: 7, word: "理想主义", size: 32, opacity: 0.72, left: 58, top: 78, rotate: 8, color: "#8A8170" },
];

const MOCK_MATCH_POOL = [
  {
    id: "m1",
    name: "LUNA",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDLrAr37lhydIX_1LumoKueO-D-FbfMv-u9ccyCDSbEVfqJ30SBBxej5ljN8hbNo3G2jVjVsg2WfdnPfOkfl7GN9X8cOH1yUxB26QeajBgV7Lw35RgYOEXfsvS0HkpBsoVKeMjM9CAc-O7u9MjrggZZKYsAyASBH6La-bXbdmH3Y-BRxKQKGFPzCnSxhjOrr9Uhjf0VUlm5bQGfu33dk7Ok4kx6EM3vcj57j7Y1MtYMgULeBpRWSZC8BQyrnjDf2D_VTkIR0vWNJOI",
    photoUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDLrAr37lhydIX_1LumoKueO-D-FbfMv-u9ccyCDSbEVfqJ30SBBxej5ljN8hbNo3G2jVjVsg2WfdnPfOkfl7GN9X8cOH1yUxB26QeajBgV7Lw35RgYOEXfsvS0HkpBsoVKeMjM9CAc-O7u9MjrggZZKYsAyASBH6La-bXbdmH3Y-BRxKQKGFPzCnSxhjOrr9Uhjf0VUlm5bQGfu33dk7Ok4kx6EM3vcj57j7Y1MtYMgULeBpRWSZC8BQyrnjDf2D_VTkIR0vWNJOI",
    wxAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDLrAr37lhydIX_1LumoKueO-D-FbfMv-u9ccyCDSbEVfqJ30SBBxej5ljN8hbNo3G2jVjVsg2WfdnPfOkfl7GN9X8cOH1yUxB26QeajBgV7Lw35RgYOEXfsvS0HkpBsoVKeMjM9CAc-O7u9MjrggZZKYsAyASBH6La-bXbdmH3Y-BRxKQKGFPzCnSxhjOrr9Uhjf0VUlm5bQGfu33dk7Ok4kx6EM3vcj57j7Y1MtYMgULeBpRWSZC8BQyrnjDf2D_VTkIR0vWNJOI",
    city: "杭州",
    gender: "女",
    age: 24,
    mbti: "INFP",
    signature: "想找个能一起安静看日落，聊聊梦境建筑的人。让我们找到属于自己的频率。",
    matchScore: 68,
    tags: ["内心世界", "价值观"],
    wordCloud: MATCH_WORD_CLOUD,
  },
  {
    id: "m2",
    name: "RIVER",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAn5HzxKpfPgAW1WfhKpnshh3KoTUthnkQQ01WXgHFpX-rvCaJgK448OBgBIjOw3Bdo3nog51RWfExCiH1lzpPrN6T8dnDenhtwbzbJJY2cNcSO_O4c1_JHMzrTYo2ObLjq18yEQ-FQc5q6nI4eWgTpGOU89zuSjxmqzJpQdHEEAFZaCT2TZY6nWoGc1LgZEQygHBRLBi04V6X_Qk_zTjIg-2jUGzf48j8s5kAugk1NVLCrzowRlMO5BB2CwLd6mpAkG-K9786mvQY",
    photoUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAn5HzxKpfPgAW1WfhKpnshh3KoTUthnkQQ01WXgHFpX-rvCaJgK448OBgBIjOw3Bdo3nog51RWfExCiH1lzpPrN6T8dnDenhtwbzbJJY2cNcSO_O4c1_JHMzrTYo2ObLjq18yEQ-FQc5q6nI4eWgTpGOU89zuSjxmqzJpQdHEEAFZaCT2TZY6nWoGc1LgZEQygHBRLBi04V6X_Qk_zTjIg-2jUGzf48j8s5kAugk1NVLCrzowRlMO5BB2CwLd6mpAkG-K9786mvQY",
    wxAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAn5HzxKpfPgAW1WfhKpnshh3KoTUthnkQQ01WXgHFpX-rvCaJgK448OBgBIjOw3Bdo3nog51RWfExCiH1lzpPrN6T8dnDenhtwbzbJJY2cNcSO_O4c1_JHMzrTYo2ObLjq18yEQ-FQc5q6nI4eWgTpGOU89zuSjxmqzJpQdHEEAFZaCT2TZY6nWoGc1LgZEQygHBRLBi04V6X_Qk_zTjIg-2jUGzf48j8s5kAugk1NVLCrzowRlMO5BB2CwLd6mpAkG-K9786mvQY",
    city: "上海",
    gender: "男",
    age: 27,
    mbti: "ENTP",
    signature: "喜欢在城市边缘散步，也喜欢把严肃问题聊得轻一点。差异感有时也是同频的入口。",
    matchScore: 82,
    tags: ["社会观察", "旅行"],
    wordCloud: MATCH_WORD_CLOUD,
  },
  {
    id: "m3",
    name: "NOVA",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCnJoNUvpdNdhMH1dxfOqPQW_lusQ3CJSA1xm7sgVdpn2wfUhclcjunpwvbUuRB1OdNwfg4PjxB3JHTMgrb8S1LEhdb1JLE4tiOlYJ5YIgRTmGdq3X0iUwxTZEOuP9RHyiX0l6fQ3cEEaJ_0d0USv2apQ6LvdXpl5ydJ0YMa0RARk6lrYY8Wyr5Ec2hdx6YOgZF_eHLv6eVQ3FdtJ9nJjdGt7NEpqEB5GKRbVJcHRVS752Y2UmrRHsWKw9sQvnv3yH0u4cGcMph82k",
    photoUrl:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCnJoNUvpdNdhMH1dxfOqPQW_lusQ3CJSA1xm7sgVdpn2wfUhclcjunpwvbUuRB1OdNwfg4PjxB3JHTMgrb8S1LEhdb1JLE4tiOlYJ5YIgRTmGdq3X0iUwxTZEOuP9RHyiX0l6fQ3cEEaJ_0d0USv2apQ6LvdXpl5ydJ0YMa0RARk6lrYY8Wyr5Ec2hdx6YOgZF_eHLv6eVQ3FdtJ9nJjdGt7NEpqEB5GKRbVJcHRVS752Y2UmrRHsWKw9sQvnv3yH0u4cGcMph82k",
    wxAvatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCnJoNUvpdNdhMH1dxfOqPQW_lusQ3CJSA1xm7sgVdpn2wfUhclcjunpwvbUuRB1OdNwfg4PjxB3JHTMgrb8S1LEhdb1JLE4tiOlYJ5YIgRTmGdq3X0iUwxTZEOuP9RHyiX0l6fQ3cEEaJ_0d0USv2apQ6LvdXpl5ydJ0YMa0RARk6lrYY8Wyr5Ec2hdx6YOgZF_eHLv6eVQ3FdtJ9nJjdGt7NEpqEB5GKRbVJcHRVS752Y2UmrRHsWKw9sQvnv3yH0u4cGcMph82k",
    city: "北京",
    gender: "女",
    age: 25,
    mbti: "INFJ",
    signature: "相信真正的靠近不是热闹，而是能理解彼此沉默里的重量。",
    matchScore: 91,
    tags: ["价值观", "内心世界", "社会观察"],
    wordCloud: MATCH_WORD_CLOUD,
  },
];

const MOCK_CARDS = [
  {
    id: 101,
    user: {
      name: "SOFIA",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuDLrAr37lhydIX_1LumoKueO-D-FbfMv-u9ccyCDSbEVfqJ30SBBxej5ljN8hbNo3G2jVjVsg2WfdnPfOkfl7GN9X8cOH1yUxB26QeajBgV7Lw35RgYOEXfsvS0HkpBsoVKeMjM9CAc-O7u9MjrggZZKYsAyASBH6La-bXbdmH3Y-BRxKQKGFPzCnSxhjOrr9Uhjf0VUlm5bQGfu33dk7Ok4kx6EM3vcj57j7Y1MtYMgULeBpRWSZC8BQyrnjDf2D_VTkIR0vWNJOI",
    },
    tags: ["社会观察"],
    content: "坚定地认为《虎胆龙威》是一部圣诞电影。",
    agreePercent: 65,
  },
  {
    id: 202,
    user: {
      name: "MARCUS",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAn5HzxKpfPgAW1WfhKpnshh3KoTUthnkQQ01WXgHFpX-rvCaJgK448OBgBIjOw3Bdo3nog51RWfExCiH1lzpPrN6T8dnDenhtwbzbJJY2cNcSO_O4c1_JHMzrTYo2ObLjq18yEQ-FQc5q6nI4eWgTpGOU89zuSjxmqzJpQdHEEAFZaCT2TZY6nWoGc1LgZEQygHBRLBi04V6X_Qk_zTjIg-2jUGzf48j8s5kAugk1NVLCrzowRlMO5BB2CwLd6mpAkG-K9786mvQY",
    },
    tags: ["内心世界"],
    content: "认为晚上的效率永远比白天高。",
    agreePercent: 42,
  },
  {
    id: 303,
    user: {
      name: "ELENA",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCnJoNUvpdNdhMH1dxfOqPQW_lusQ3CJSA1xm7sgVdpn2wfUhclcjunpwvbUuRB1OdNwfg4PjxB3JHTMgrb8S1LEhdb1JLE4tiOlYJ5YIgRTmGdq3X0iUwxTZEOuP9RHyiX0l6fQ3cEEaJ_0d0USv2apQ6LvdXpl5ydJ0YMa0RARk6lrYY8Wyr5Ec2hdx6YOgZF_eHLv6eVQ3FdtJ9nJjdGt7NEpqEB5GKRbVJcHRVS752Y2UmrRHsWKw9sQvnv3yH0u4cGcMph82k",
    },
    tags: ["价值观"],
    content: "相信真正成熟的人会先理解，再表达自己。",
    agreePercent: 71,
  },
];

function cloneCard(card) {
  return JSON.parse(JSON.stringify(card));
}

function hasReducedTag(card, reducedTopicTags) {
  return card.tags.some((tag) => reducedTopicTags.includes(tag));
}

function getNextMockCard(currentId, reducedTopicTags = []) {
  const availableCards = MOCK_CARDS.filter(
    (card) => !hasReducedTag(card, reducedTopicTags),
  );
  const pool = availableCards.length > 0 ? availableCards : MOCK_CARDS;
  const currentIndex = pool.findIndex((card) => card.id === currentId);
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % pool.length;
  return cloneCard(pool[nextIndex]);
}

Page({
  data: {
    statusBarHeight: 20,
    windowHeight: 800,
    menuTriggerRight: 0,
    menuTriggerTop: 0,
    menuTriggerH: 32,
    headerContentMT: 0,
    showMenuPanel: false,

    // 匹配筛选器
    matchFilter: { city: [], gender: "不限", ageRange: "不限" },
    cityOptions: ["北京", "上海", "广州", "深圳", "其他城市"],
    genderOptions: ["男", "女", "不限"],
    ageRangeOptions: ["18-22", "23-26", "27-30", "31-35", "不限"],

    recommendUsers: [
      {
        id: 1,
        name: "SOFIA",
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuDLrAr37lhydIX_1LumoKueO-D-FbfMv-u9ccyCDSbEVfqJ30SBBxej5ljN8hbNo3G2jVjVsg2WfdnPfOkfl7GN9X8cOH1yUxB26QeajBgV7Lw35RgYOEXfsvS0HkpBsoVKeMjM9CAc-O7u9MjrggZZKYsAyASBH6La-bXbdmH3Y-BRxKQKGFPzCnSxhjOrr9Uhjf0VUlm5bQGfu33dk7Ok4kx6EM3vcj57j7Y1MtYMgULeBpRWSZC8BQyrnjDf2D_VTkIR0vWNJOI",
      },
      {
        id: 2,
        name: "MARCUS",
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuAn5HzxKpfPgAW1WfhKpnshh3KoTUthnkQQ01WXgHFpX-rvCaJgK448OBgBIjOw3Bdo3nog51RWfExCiH1lzpPrN6T8dnDenhtwbzbJJY2cNcSO_O4c1_JHMzrTYo2ObLjq18yEQ-FQc5q6nI4eWgTpGOU89zuSjxmqzJpQdHEEAFZaCT2TZY6nWoGc1LgZEQygHBRLBi04V6X_Qk_zTjIg-2jUGzf48j8s5kAugk1NVLCrzowRlMO5BB2CwLd6mpAkG-K9786mvQY",
      },
      {
        id: 3,
        name: "ELENA",
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuCnJoNUvpdNdhMH1dxfOqPQW_lusQ3CJSA1xm7sgVdpn2wfUhclcjunpwvbUuRB1OdNwfg4PjxB3JHTMgrb8S1LEhdb1JLE4tiOlYJ5YIgRTmGdq3X0iUwxTZEOuP9RHyiX0l6fQ3cEEaJ_0d0USv2apQ6LvdXpl5ydJ0YMa0RARk6lrYY8Wyr5Ec2hdx6YOgZF_eHLv6eVQ3FdtJ9nJjdGt7NEpqEB5GKRbVJcHRVS752Y2UmrRHsWKw9sQvnv3yH0u4cGcMph82k",
      },
      {
        id: 4,
        name: "JULI",
        avatar:
          "https://lh3.googleusercontent.com/aida-public/AB6AXuB-Z8IF5na2wP_u3mIa7KkxtYQMxkGNEnQTXeI7C24KLECwa-tXuUPLgaOFnyM2S85MR7PLo-ogcRtfUSqHQq6E_M-3Spk1lTt12Rta6_-hEAOuD_1WfyOotIO49yfl_GnuTQrBCNIVmOIA05b8iF_QO9THJsxRiCqD-jjpwU5CdxOKrFf5QRYf3ApwysooRMiMY9ClbhuxlO2G6n2C6da3emzy4tOIq4nT0KB5bHI7PSya-hqLHAe-DNG4M7Yp89lZn9j_Y1zZSIw",
      },
    ],
    currentCard: cloneCard(MOCK_CARDS[0]),
    nextCard: cloneCard(MOCK_CARDS[1]),
    previewScale: 0.978,
    isCardMoving: false,
    isCardExiting: false,

    cardTranslateX: 0,
    cardTranslateY: 0,
    cardRotate: 0,
    cardOpacity: 1,
    cardTransition: "none",
    startX: 0,
    startY: 0,

    upSwipeCount: 0,
    maxUpSwipe: 5,
    showLimitModal: false,

    swipeSessionCount: 0,
    entryTime: 0,
    reducedTopicTags: [],

    totalAnsweredCount: 0,
    isMatchingEnabled: false,
    todayMatchIndex: 0,
    currentMatch: null,
    showMatchCard: false,
  },

  onLoad() {
    const windowInfo = wx.getWindowInfo();
    const menuBtn = wx.getMenuButtonBoundingClientRect();
    this.setData({
      statusBarHeight: windowInfo.statusBarHeight || 44,
      windowHeight: windowInfo.windowHeight,
      menuTriggerRight: windowInfo.windowWidth - menuBtn.left + 8,
      menuTriggerTop: menuBtn.top,
      menuTriggerH: menuBtn.height,
      headerContentMT: menuBtn.top - (windowInfo.statusBarHeight || 44),
      entryTime: Date.now(),
    });
  },

  onShareAppMessage() {
    return {
      title: `${this.data.currentCard.user.name}的观点卡片`,
      path: "/pages/home/home",
    };
  },

  onShareTimeline() {
    return { title: `${this.data.currentCard.user.name}的观点卡片` };
  },

  /* ====== Touch Events ====== */
  touchStart(e) {
    if (this.data.showLimitModal) return;
    this.setData({
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      cardTransition: "none",
    });
  },

  touchMove(e) {
    if (this.data.showLimitModal) return;
    const deltaX = e.touches[0].clientX - this.data.startX;
    const deltaY = e.touches[0].clientY - this.data.startY;
    const isCardMoving = Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4;
    const previewScale = Math.min(
      1,
      0.978 +
        Math.min(Math.abs(deltaX), 180) / 2400 +
        Math.min(Math.abs(deltaY), 120) / 3000,
    );
    this.setData({
      cardTranslateX: deltaX,
      cardTranslateY: deltaY,
      cardRotate: deltaX * 0.05,
      isCardMoving,
      previewScale,
    });
  },

  touchEnd() {
    if (this.data.showLimitModal) return;
    const { cardTranslateX, cardTranslateY } = this.data;
    const SWIPE_THRESHOLD = 100;
    if (cardTranslateX > SWIPE_THRESHOLD) {
      this.animateSwipeAndNext("right");
    } else if (cardTranslateX < -SWIPE_THRESHOLD) {
      this.animateSwipeAndNext("left");
    } else if (
      cardTranslateY < -SWIPE_THRESHOLD &&
      Math.abs(cardTranslateY) > Math.abs(cardTranslateX)
    ) {
      this.handleUpSwipe();
    } else {
      this.setData({
        cardTranslateX: 0,
        cardTranslateY: 0,
        cardRotate: 0,
        cardOpacity: 1,
        cardTransition:
          "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.18s ease",
        isCardMoving: false,
        previewScale: 0.978,
      });
    }
  },

  /* ====== Swipe Logic ====== */
  animateSwipeAndNext(direction) {
    const xDest = direction === "right" ? 800 : -800;
    this.setData({
      cardTranslateX: xDest,
      cardRotate: direction === "right" ? 30 : -30,
      cardOpacity: 0,
      cardTransition: "transform 0.34s ease-out, opacity 0.18s ease-out",
      previewScale: 1,
      isCardMoving: true,
      isCardExiting: true,
    });
    this.recordSwipe(direction);
    setTimeout(() => this.loadNextCard(), 400);
  },

  animateReduceAndNext() {
    this.setData({
      cardTranslateX: -760,
      cardTranslateY: -80,
      cardRotate: -18,
      cardOpacity: 0,
      cardTransition:
        "transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.16s ease-out",
      previewScale: 1,
      isCardMoving: true,
      isCardExiting: true,
    });
    setTimeout(() => this.loadNextCard(), 300);
  },

  handleUpSwipe() {
    if (this.data.upSwipeCount >= this.data.maxUpSwipe) {
      this.setData({
        cardTranslateX: 0,
        cardTranslateY: 0,
        cardRotate: 0,
        cardTransition: "transform 0.3s ease-out",
        previewScale: 0.978,
        showLimitModal: true,
      });
      return;
    }
    this.setData({
      cardTranslateY: -800,
      cardOpacity: 0,
      cardTransition: "transform 0.34s ease-out, opacity 0.18s ease-out",
      previewScale: 1,
      isCardMoving: true,
      isCardExiting: true,
      upSwipeCount: this.data.upSwipeCount + 1,
    });
    this.recordSwipe("up");
    setTimeout(() => this.loadNextCard(), 400);
  },

  forceSwipeLeft() {
    this.animateSwipeAndNext("left");
  },
  forceSwipeRight() {
    this.animateSwipeAndNext("right");
  },

  /* ====== Business Logic ====== */
  recordSwipe(direction) {
    const sc = this.data.swipeSessionCount + 1;
    const answered = this.data.totalAnsweredCount + 1;
    const isMatchingEnabled = answered >= MATCH_THRESHOLD;
    this.setData({
      swipeSessionCount: sc,
      totalAnsweredCount: answered,
      isMatchingEnabled,
    });
    if (isMatchingEnabled) this.checkMatchTrigger(sc);
  },

  checkMatchTrigger(sessionCount) {
    const { todayMatchIndex } = this.data;
    const poolSize = MOCK_MATCH_POOL.length;
    if (sessionCount % 5 !== 0) return;
    const nextIndex = Math.min(todayMatchIndex, poolSize - 1);
    this.setData({
      currentMatch: { ...MOCK_MATCH_POOL[nextIndex] },
      showMatchCard: true,
      todayMatchIndex: nextIndex + 1,
    });
  },

  closeMatchCard() {
    this.setData({ showMatchCard: false, currentMatch: null });
  },

  loadNextCard() {
    const { reducedTopicTags } = this.data;
    const currentCard = hasReducedTag(this.data.nextCard, reducedTopicTags)
      ? getNextMockCard(this.data.currentCard.id, reducedTopicTags)
      : cloneCard(this.data.nextCard);
    const nextCard = getNextMockCard(currentCard.id, reducedTopicTags);
    this.setData({
      cardTranslateX: 0,
      cardTranslateY: 0,
      cardRotate: 0,
      cardOpacity: 1,
      cardTransition: "none",
      previewScale: 0.978,
      isCardMoving: false,
      isCardExiting: false,
      currentCard,
      nextCard,
    });
  },

  /* ====== Filter Events ====== */
  toggleCityFilter(e) {
    const val = e.currentTarget.dataset.value;
    const city = this.data.matchFilter.city;
    const newCity = city.includes(val)
      ? city.filter((c) => c !== val)
      : [...city, val];
    this.setData({ matchFilter: { ...this.data.matchFilter, city: newCity } });
  },

  toggleGenderFilter(e) {
    const val = e.currentTarget.dataset.value;
    this.setData({ matchFilter: { ...this.data.matchFilter, gender: val } });
  },

  toggleAgeFilter(e) {
    const val = e.currentTarget.dataset.value;
    this.setData({ matchFilter: { ...this.data.matchFilter, ageRange: val } });
  },

  /* ====== UI Handlers ====== */
  openCommentPanel() {
    wx.showToast({ title: "评论功能开发中", icon: "none" });
  },

  handleShare() {
    wx.showShareMenu({ menus: ["shareAppMessage", "shareTimeline"] });
    wx.showToast({ title: "分享功能开发中", icon: "none" });
  },

  handleVoiceInput() {
    wx.showToast({ title: "语音输入开发中", icon: "none" });
  },

  reduceSimilarTopics() {
    if (this.data.isCardExiting) return;
    const reducedTopicTags = Array.from(
      new Set([...this.data.reducedTopicTags, ...this.data.currentCard.tags]),
    );
    wx.showToast({ title: "已减少此类话题", icon: "none" });
    this.setData({ reducedTopicTags }, () => this.animateReduceAndNext());
  },

  stopCardTouch() {},

  openPsychTest() {
    wx.showToast({ title: "心理测试开发中", icon: "none" });
  },

  closeModal() {
    this.setData({ showLimitModal: false });
  },

  preventTouchMove() {},

  toggleMenuPanel() {
    this.setData({ showMenuPanel: !this.data.showMenuPanel });
  },

  closeMenuPanel() {
    this.setData({ showMenuPanel: false });
  },

  goToDiscovery() {
    wx.redirectTo({ url: "/pages/discovery/discovery" });
  },

  goToChat() {
    wx.redirectTo({ url: "/pages/chat/chat" });
  },

  goToProfile() {
    wx.navigateTo({ url: "/pages/profile/profile" });
  },
});
