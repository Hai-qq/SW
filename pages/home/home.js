// pages/home/home.js
const { request } = require('../../utils/request');
const { ensureSessionId } = require('../../utils/session');

const MOCK_CARDS = [
  {
    id: 101,
    user: {
      name: 'SOFIA',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLrAr37lhydIX_1LumoKueO-D-FbfMv-u9ccyCDSbEVfqJ30SBBxej5ljN8hbNo3G2jVjVsg2WfdnPfOkfl7GN9X8cOH1yUxB26QeajBgV7Lw35RgYOEXfsvS0HkpBsoVKeMjM9CAc-O7u9MjrggZZKYsAyASBH6La-bXbdmH3Y-BRxKQKGFPzCnSxhjOrr9Uhjf0VUlm5bQGfu33dk7Ok4kx6EM3vcj57j7Y1MtYMgULeBpRWSZC8BQyrnjDf2D_VTkIR0vWNJOI'
    },
    tags: ['社会观察'],
    content: '坚定地认为《虎胆龙威》是一部圣诞电影。',
    agreePercent: 65,
    agreeAvatars: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAn5HzxKpfPgAW1WfhKpnshh3KoTUthnkQQ01WXgHFpX-rvCaJgK448OBgBIjOw3Bdo3nog51RWfExCiH1lzpPrN6T8dnDenhtwbzbJJY2cNcSO_O4c1_JHMzrTYo2ObLjq18yEQ-FQc5q6nI4eWgTpGOU89zuSjxmqzJpQdHEEAFZaCT2TZY6nWoGc1LgZEQygHBRLBi04V6X_Qk_zTjIg-2jUGzf48j8s5kAugk1NVLCrzowRlMO5BB2CwLd6mpAkG-K9786mvQY',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCnJoNUvpdNdhMH1dxfOqPQW_lusQ3CJSA1xm7sgVdpn2wfUhclcjunpwvbUuRB1OdNwfg4PjxB3JHTMgrb8S1LEhdb1JLE4tiOlYJ5YIgRTmGdq3X0iUwxTZEOuP9RHyiX0l6fQ3cEEaJ_0d0USv2apQ6LvdXpl5ydJ0YMa0RARk6lrYY8Wyr5Ec2hdx6YOgZF_eHLv6eVQ3FdtJ9nJjdGt7NEpqEB5GKRbVJcHRVS752Y2UmrRHsWKw9sQvnv3yH0u4cGcMph82k'
    ],
    disagreeAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKIsQ_bqFzmWxDSDkiZxPO2wAgWkowGYIPO4QTcuJtrO_sZjy0vXIEH1v_IzEUuvE_MstRGn0ENMLnF5L2ZeoRnB0UdWrIdPqBSjYMPZxI9YbWyRNotG8jewPQeF_UXwfxGe52oL8DVzjv6kx3-eOQ7g8BR28FK-whVhDgDX6Yw9c9intyLOHfgDXnjdwJF8aOtUZ9TSTQg3E4UuDDbI4utTxXxxtUjdgDmFuZzO3eQznb6Wxt0K_uYOa2MWd63rKUaVmx58SBfww'
  },
  {
    id: 202,
    user: {
      name: 'MARCUS',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAn5HzxKpfPgAW1WfhKpnshh3KoTUthnkQQ01WXgHFpX-rvCaJgK448OBgBIjOw3Bdo3nog51RWfExCiH1lzpPrN6T8dnDenhtwbzbJJY2cNcSO_O4c1_JHMzrTYo2ObLjq18yEQ-FQc5q6nI4eWgTpGOU89zuSjxmqzJpQdHEEAFZaCT2TZY6nWoGc1LgZEQygHBRLBi04V6X_Qk_zTjIg-2jUGzf48j8s5kAugk1NVLCrzowRlMO5BB2CwLd6mpAkG-K9786mvQY'
    },
    tags: ['内心世界'],
    content: '认为晚上的效率永远比白天高。',
    agreePercent: 42,
    agreeAvatars: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDLrAr37lhydIX_1LumoKueO-D-FbfMv-u9ccyCDSbEVfqJ30SBBxej5ljN8hbNo3G2jVjVsg2WfdnPfOkfl7GN9X8cOH1yUxB26QeajBgV7Lw35RgYOEXfsvS0HkpBsoVKeMjM9CAc-O7u9MjrggZZKYsAyASBH6La-bXbdmH3Y-BRxKQKGFPzCnSxhjOrr9Uhjf0VUlm5bQGfu33dk7Ok4kx6EM3vcj57j7Y1MtYMgULeBpRWSZC8BQyrnjDf2D_VTkIR0vWNJOI'
    ],
    disagreeAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnJoNUvpdNdhMH1dxfOqPQW_lusQ3CJSA1xm7sgVdpn2wfUhclcjunpwvbUuRB1OdNwfg4PjxB3JHTMgrb8S1LEhdb1JLE4tiOlYJ5YIgRTmGdq3X0iUwxTZEOuP9RHyiX0l6fQ3cEEaJ_0d0USv2apQ6LvdXpl5ydJ0YMa0RARk6lrYY8Wyr5Ec2hdx6YOgZF_eHLv6eVQ3FdtJ9nJjdGt7NEpqEB5GKRbVJcHRVS752Y2UmrRHsWKw9sQvnv3yH0u4cGcMph82k'
  },
  {
    id: 303,
    user: {
      name: 'ELENA',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnJoNUvpdNdhMH1dxfOqPQW_lusQ3CJSA1xm7sgVdpn2wfUhclcjunpwvbUuRB1OdNwfg4PjxB3JHTMgrb8S1LEhdb1JLE4tiOlYJ5YIgRTmGdq3X0iUwxTZEOuP9RHyiX0l6fQ3cEEaJ_0d0USv2apQ6LvdXpl5ydJ0YMa0RARk6lrYY8Wyr5Ec2hdx6YOgZF_eHLv6eVQ3FdtJ9nJjdGt7NEpqEB5GKRbVJcHRVS752Y2UmrRHsWKw9sQvnv3yH0u4cGcMph82k'
    },
    tags: ['价值观'],
    content: '相信真正成熟的人会先理解，再表达自己。',
    agreePercent: 71,
    agreeAvatars: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDLrAr37lhydIX_1LumoKueO-D-FbfMv-u9ccyCDSbEVfqJ30SBBxej5ljN8hbNo3G2jVjVsg2WfdnPfOkfl7GN9X8cOH1yUxB26QeajBgV7Lw35RgYOEXfsvS0HkpBsoVKeMjM9CAc-O7u9MjrggZZKYsAyASBH6La-bXbdmH3Y-BRxKQKGFPzCnSxhjOrr9Uhjf0VUlm5bQGfu33dk7Ok4kx6EM3vcj57j7Y1MtYMgULeBpRWSZC8BQyrnjDf2D_VTkIR0vWNJOI',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAn5HzxKpfPgAW1WfhKpnshh3KoTUthnkQQ01WXgHFpX-rvCaJgK448OBgBIjOw3Bdo3nog51RWfExCiH1lzpPrN6T8dnDenhtwbzbJJY2cNcSO_O4c1_JHMzrTYo2ObLjq18yEQ-FQc5q6nI4eWgTpGOU89zuSjxmqzJpQdHEEAFZaCT2TZY6nWoGc1LgZEQygHBRLBi04V6X_Qk_zTjIg-2jUGzf48j8s5kAugk1NVLCrzowRlMO5BB2CwLd6mpAkG-K9786mvQY'
    ],
    disagreeAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-Z8IF5na2wP_u3mIa7KkxtYQMxkGNEnQTXeI7C24KLECwa-tXuUPLgaOFnyM2S85MR7PLo-ogcRtfUSqHQq6E_M-3Spk1lTt12Rta6_-hEAOuD_1WfyOotIO49yfl_GnuTQrBCNIVmOIA05b8iF_QO9THJsxRiCqD-jjpwU5CdxOKrFf5QRYf3ApwysooRMiMY9ClbhuxlO2G6n2C6da3emzy4tOIq4nT0KB5bHI7PSya-hqLHAe-DNG4M7Yp89lZn9j_Y1zZSIw'
  }
];

function cloneCard(card) {
  return JSON.parse(JSON.stringify(card));
}

function normalizeCard(card) {
  return {
    id: Number(card.cardId),
    user: {
      name: card.user.name,
      avatar: card.user.avatar
    },
    tags: Array.isArray(card.tags) ? card.tags : String(card.tags || '').split(' · ').filter(Boolean),
    content: card.content,
    agreePercent: card.stats?.agreePercent || 0,
    agreeAvatars: card.stats?.agreeAvatars || [],
    disagreeAvatar: card.stats?.disagreeAvatar || ''
  };
}

function getNextMockCard(currentId) {
  const currentIndex = MOCK_CARDS.findIndex((card) => card.id === currentId);
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % MOCK_CARDS.length;
  return cloneCard(MOCK_CARDS[nextIndex]);
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
    currentTab: '全部',
    tabs: ['全部', '内心世界', '旅行与探索', '价值观', '社会观察'],
    recommendUsers: [
      { id: 1, name: 'SOFIA', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLrAr37lhydIX_1LumoKueO-D-FbfMv-u9ccyCDSbEVfqJ30SBBxej5ljN8hbNo3G2jVjVsg2WfdnPfOkfl7GN9X8cOH1yUxB26QeajBgV7Lw35RgYOEXfsvS0HkpBsoVKeMjM9CAc-O7u9MjrggZZKYsAyASBH6La-bXbdmH3Y-BRxKQKGFPzCnSxhjOrr9Uhjf0VUlm5bQGfu33dk7Ok4kx6EM3vcj57j7Y1MtYMgULeBpRWSZC8BQyrnjDf2D_VTkIR0vWNJOI' },
      { id: 2, name: 'MARCUS', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAn5HzxKpfPgAW1WfhKpnshh3KoTUthnkQQ01WXgHFpX-rvCaJgK448OBgBIjOw3Bdo3nog51RWfExCiH1lzpPrN6T8dnDenhtwbzbJJY2cNcSO_O4c1_JHMzrTYo2ObLjq18yEQ-FQc5q6nI4eWgTpGOU89zuSjxmqzJpQdHEEAFZaCT2TZY6nWoGc1LgZEQygHBRLBi04V6X_Qk_zTjIg-2jUGzf48j8s5kAugk1NVLCrzowRlMO5BB2CwLd6mpAkG-K9786mvQY' },
      { id: 3, name: 'ELENA', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnJoNUvpdNdhMH1dxfOqPQW_lusQ3CJSA1xm7sgVdpn2wfUhclcjunpwvbUuRB1OdNwfg4PjxB3JHTMgrb8S1LEhdb1JLE4tiOlYJ5YIgRTmGdq3X0iUwxTZEOuP9RHyiX0l6fQ3cEEaJ_0d0USv2apQ6LvdXpl5ydJ0YMa0RARk6lrYY8Wyr5Ec2hdx6YOgZF_eHLv6eVQ3FdtJ9nJjdGt7NEpqEB5GKRbVJcHRVS752Y2UmrRHsWKw9sQvnv3yH0u4cGcMph82k' },
      { id: 4, name: 'JULI', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-Z8IF5na2wP_u3mIa7KkxtYQMxkGNEnQTXeI7C24KLECwa-tXuUPLgaOFnyM2S85MR7PLo-ogcRtfUSqHQq6E_M-3Spk1lTt12Rta6_-hEAOuD_1WfyOotIO49yfl_GnuTQrBCNIVmOIA05b8iF_QO9THJsxRiCqD-jjpwU5CdxOKrFf5QRYf3ApwysooRMiMY9ClbhuxlO2G6n2C6da3emzy4tOIq4nT0KB5bHI7PSya-hqLHAe-DNG4M7Yp89lZn9j_Y1zZSIw' }
    ],
    currentCard: cloneCard(MOCK_CARDS[0]),
    nextCard: cloneCard(MOCK_CARDS[1]),
    previewScale: 0.978,
    
    // Animation & Touch state
    cardTranslateX: 0,
    cardTranslateY: 0,
    cardRotate: 0,
    cardTransition: 'none',
    startX: 0,
    startY: 0,
    
    // Limits
    upSwipeCount: 0,
    maxUpSwipe: 5,
    showLimitModal: false,
    
    // Session tracking
    swipeSessionCount: 0,
    entryTime: 0
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
      entryTime: Date.now()
    });
    ensureSessionId();
    this.loadNextCard();
  },

  onShareAppMessage() {
    return {
      title: `${this.data.currentCard.user.name}的观点卡片`,
      path: '/pages/home/home'
    };
  },

  onShareTimeline() {
    return {
      title: `${this.data.currentCard.user.name}的观点卡片`
    };
  },

  /* ====== Touch Events for Swiping ====== */
  touchStart(e) {
    if (this.data.showLimitModal) return; // disable swipe if modal shown
    this.setData({
      startX: e.touches[0].clientX,
      startY: e.touches[0].clientY,
      cardTransition: 'none'
    });
  },

  touchMove(e) {
    if (this.data.showLimitModal) return;
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = currentX - this.data.startX;
    const deltaY = currentY - this.data.startY;
    const rotate = deltaX * 0.05;
    const previewScale = Math.min(1, 0.978 + Math.min(Math.abs(deltaX), 180) / 2400 + Math.min(Math.abs(deltaY), 120) / 3000);

    this.setData({
      cardTranslateX: deltaX,
      cardTranslateY: deltaY,
      cardRotate: rotate,
      previewScale
    });
  },

  touchEnd() {
    if (this.data.showLimitModal) return;
    const { cardTranslateX, cardTranslateY } = this.data;
    const SWIPE_THRESHOLD = 100;
    
    // Right Swipe (Agree)
    if (cardTranslateX > SWIPE_THRESHOLD) {
      this.animateSwipeAndNext('right');
    } 
    // Left Swipe (Disagree)
    else if (cardTranslateX < -SWIPE_THRESHOLD) {
      this.animateSwipeAndNext('left');
    } 
    // Up Swipe (Skip)
    else if (cardTranslateY < -SWIPE_THRESHOLD && Math.abs(cardTranslateY) > Math.abs(cardTranslateX)) {
      this.handleUpSwipe();
    } 
    // Reset position
    else {
      this.setData({
        cardTranslateX: 0,
        cardTranslateY: 0,
        cardRotate: 0,
        cardTransition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
        previewScale: 0.978
      });
    }
  },

  /* ====== Swipe Logic ====== */
  animateSwipeAndNext(direction) {
    const xDest = direction === 'right' ? 800 : -800;
    this.setData({
      cardTranslateX: xDest,
      cardRotate: direction === 'right' ? 30 : -30,
      cardTransition: 'transform 0.4s ease-out',
      previewScale: 1
    });

    this.recordSwipe(direction);

    // Load next card after delay
    setTimeout(() => {
      this.loadNextCard();
    }, 400);
  },

  handleUpSwipe() {
    if (this.data.upSwipeCount >= this.data.maxUpSwipe) {
      this.setData({
        cardTranslateX: 0,
        cardTranslateY: 0,
        cardRotate: 0,
        cardTransition: 'transform 0.3s ease-out',
        previewScale: 0.978,
        showLimitModal: true
      });
      return;
    }

    this.setData({
      cardTranslateY: -800,
      cardTransition: 'transform 0.4s ease-out',
      previewScale: 1,
      upSwipeCount: this.data.upSwipeCount + 1
    });

    this.recordSwipe('up');

    setTimeout(() => {
      this.loadNextCard();
    }, 400);
  },

  forceSwipeLeft() {
    this.animateSwipeAndNext('left');
  },

  forceSwipeRight() {
    this.animateSwipeAndNext('right');
  },

  /* ====== Business Logic ====== */
  async recordSwipe(direction) {
    const actionMap = {
      right: 'agree',
      left: 'disagree',
      up: 'skip'
    };

    try {
      const result = await request({
        url: '/api/v1/cards/swipe',
        method: 'POST',
        data: {
          cardId: String(this.data.currentCard.id),
          action: actionMap[direction],
          sessionId: ensureSessionId(),
          sourceTab: this.data.currentTab
        }
      });

      this.setData({ swipeSessionCount: result.sessionSwipeCount });

      const timeSpent = Math.floor((Date.now() - this.data.entryTime) / 1000);
      if (result.sessionSwipeCount >= 3 && timeSpent > 30) {
        await this.checkBlindBoxTrigger();
      }
    } catch (error) {
      wx.showToast({
        title: '上报失败',
        icon: 'none'
      });
    }
  },

  async loadNextCard() {
    try {
      const data = await request({
        url: `/api/v1/cards/recommend?limit=2&category=${encodeURIComponent(this.data.currentTab)}&sessionId=${ensureSessionId()}`
      });
      const currentCard = data.items[0] ? normalizeCard(data.items[0]) : cloneCard(MOCK_CARDS[0]);
      const nextCard = data.items[1]
        ? normalizeCard(data.items[1])
        : getNextMockCard(currentCard.id);

      this.setData({
        cardTranslateX: 0,
        cardTranslateY: 0,
        cardRotate: 0,
        cardTransition: 'none',
        previewScale: 0.978,
        currentCard,
        nextCard
      });
    } catch (error) {
      const currentCard = cloneCard(this.data.nextCard);
      const nextCard = getNextMockCard(currentCard.id);

      this.setData({
        cardTranslateX: 0,
        cardTranslateY: 0,
        cardRotate: 0,
        cardTransition: 'none',
        previewScale: 0.978,
        currentCard,
        nextCard
      });
    }
  },

  async checkBlindBoxTrigger() {
    try {
      const result = await request({
        url: '/api/v1/matching/trigger-check',
        method: 'POST',
        data: {
          sessionId: ensureSessionId(),
          sessionSwipeCount: this.data.swipeSessionCount,
          sessionDuration: Math.floor((Date.now() - this.data.entryTime) / 1000)
        }
      });

      if (result.shouldTrigger && result.matchUser) {
        wx.showToast({
          title: `匹配到 ${result.matchUser.name}`,
          icon: 'none'
        });
      }

      this.setData({ swipeSessionCount: 0 });
    } catch (error) {
      wx.showToast({
        title: '盲盒检查失败',
        icon: 'none'
      });
    }
  },

  openCommentPanel() {
    wx.showToast({
      title: '评论功能开发中',
      icon: 'none'
    });
  },

  handleShare() {
    wx.showShareMenu({
      menus: ['shareAppMessage', 'shareTimeline']
    });
    wx.showToast({
      title: '分享功能开发中',
      icon: 'none'
    });
  },

  handleVoiceInput() {
    wx.showToast({
      title: '语音输入开发中',
      icon: 'none'
    });
  },

  reduceSimilarTopics() {
    wx.showToast({
      title: '将减少此类话题',
      icon: 'none'
    });
  },

  closeModal() {
    this.setData({ showLimitModal: false });
  },

  preventTouchMove() {
    // Empty function to prevent touch propagation on modal
  },

  toggleMenuPanel() {
    this.setData({ showMenuPanel: !this.data.showMenuPanel });
  },

  closeMenuPanel() {
    this.setData({ showMenuPanel: false });
  },

  selectCategory(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ currentTab: tab, showMenuPanel: false });
  },

  switchTab(e) {
    this.setData({ currentTab: e.currentTarget.dataset.tab });
    this.loadNextCard();
  },

  goToDiscovery() {
    wx.redirectTo({ url: '/pages/discovery/discovery' });
  },

  goToChat() {
    wx.redirectTo({ url: '/pages/chat/chat' });
  },

  goToProfile() {
    wx.navigateTo({ url: '/pages/profile/profile' });
  }
});
