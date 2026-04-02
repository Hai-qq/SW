// pages/home/home.js
Page({
  data: {
    statusBarHeight: 20,
    windowHeight: 800,
    currentTab: '全部',
    tabs: ['全部', '内心世界', '旅行与探索', '价值观', '社会观察'],
    recommendUsers: [
      { id: 1, name: 'SOFIA', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLrAr37lhydIX_1LumoKueO-D-FbfMv-u9ccyCDSbEVfqJ30SBBxej5ljN8hbNo3G2jVjVsg2WfdnPfOkfl7GN9X8cOH1yUxB26QeajBgV7Lw35RgYOEXfsvS0HkpBsoVKeMjM9CAc-O7u9MjrggZZKYsAyASBH6La-bXbdmH3Y-BRxKQKGFPzCnSxhjOrr9Uhjf0VUlm5bQGfu33dk7Ok4kx6EM3vcj57j7Y1MtYMgULeBpRWSZC8BQyrnjDf2D_VTkIR0vWNJOI' },
      { id: 2, name: 'MARCUS', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAn5HzxKpfPgAW1WfhKpnshh3KoTUthnkQQ01WXgHFpX-rvCaJgK448OBgBIjOw3Bdo3nog51RWfExCiH1lzpPrN6T8dnDenhtwbzbJJY2cNcSO_O4c1_JHMzrTYo2ObLjq18yEQ-FQc5q6nI4eWgTpGOU89zuSjxmqzJpQdHEEAFZaCT2TZY6nWoGc1LgZEQygHBRLBi04V6X_Qk_zTjIg-2jUGzf48j8s5kAugk1NVLCrzowRlMO5BB2CwLd6mpAkG-K9786mvQY' },
      { id: 3, name: 'ELENA', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCnJoNUvpdNdhMH1dxfOqPQW_lusQ3CJSA1xm7sgVdpn2wfUhclcjunpwvbUuRB1OdNwfg4PjxB3JHTMgrb8S1LEhdb1JLE4tiOlYJ5YIgRTmGdq3X0iUwxTZEOuP9RHyiX0l6fQ3cEEaJ_0d0USv2apQ6LvdXpl5ydJ0YMa0RARk6lrYY8Wyr5Ec2hdx6YOgZF_eHLv6eVQ3FdtJ9nJjdGt7NEpqEB5GKRbVJcHRVS752Y2UmrRHsWKw9sQvnv3yH0u4cGcMph82k' },
      { id: 4, name: 'JULI', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB-Z8IF5na2wP_u3mIa7KkxtYQMxkGNEnQTXeI7C24KLECwa-tXuUPLgaOFnyM2S85MR7PLo-ogcRtfUSqHQq6E_M-3Spk1lTt12Rta6_-hEAOuD_1WfyOotIO49yfl_GnuTQrBCNIVmOIA05b8iF_QO9THJsxRiCqD-jjpwU5CdxOKrFf5QRYf3ApwysooRMiMY9ClbhuxlO2G6n2C6da3emzy4tOIq4nT0KB5bHI7PSya-hqLHAe-DNG4M7Yp89lZn9j_Y1zZSIw' }
    ],
    currentCard: {
      id: 101,
      user: {
        name: 'SOFIA',
        avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLrAr37lhydIX_1LumoKueO-D-FbfMv-u9ccyCDSbEVfqJ30SBBxej5ljN8hbNo3G2jVjVsg2WfdnPfOkfl7GN9X8cOH1yUxB26QeajBgV7Lw35RgYOEXfsvS0HkpBsoVKeMjM9CAc-O7u9MjrggZZKYsAyASBH6La-bXbdmH3Y-BRxKQKGFPzCnSxhjOrr9Uhjf0VUlm5bQGfu33dk7Ok4kx6EM3vcj57j7Y1MtYMgULeBpRWSZC8BQyrnjDf2D_VTkIR0vWNJOI'
      },
      tags: '态度 · 幽默',
      content: '坚定地认为《虎胆龙威》是一部圣诞电影。',
      agreePercent: 65,
      agreeAvatars: [
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAn5HzxKpfPgAW1WfhKpnshh3KoTUthnkQQ01WXgHFpX-rvCaJgK448OBgBIjOw3Bdo3nog51RWfExCiH1lzpPrN6T8dnDenhtwbzbJJY2cNcSO_O4c1_JHMzrTYo2ObLjq18yEQ-FQc5q6nI4eWgTpGOU89zuSjxmqzJpQdHEEAFZaCT2TZY6nWoGc1LgZEQygHBRLBi04V6X_Qk_zTjIg-2jUGzf48j8s5kAugk1NVLCrzowRlMO5BB2CwLd6mpAkG-K9786mvQY',
        'https://lh3.googleusercontent.com/aida-public/AB6AXuCnJoNUvpdNdhMH1dxfOqPQW_lusQ3CJSA1xm7sgVdpn2wfUhclcjunpwvbUuRB1OdNwfg4PjxB3JHTMgrb8S1LEhdb1JLE4tiOlYJ5YIgRTmGdq3X0iUwxTZEOuP9RHyiX0l6fQ3cEEaJ_0d0USv2apQ6LvdXpl5ydJ0YMa0RARk6lrYY8Wyr5Ec2hdx6YOgZF_eHLv6eVQ3FdtJ9nJjdGt7NEpqEB5GKRbVJcHRVS752Y2UmrRHsWKw9sQvnv3yH0u4cGcMph82k'
      ],
      disagreeAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBKIsQ_bqFzmWxDSDkiZxPO2wAgWkowGYIPO4QTcuJtrO_sZjy0vXIEH1v_IzEUuvE_MstRGn0ENMLnF5L2ZeoRnB0UdWrIdPqBSjYMPZxI9YbWyRNotG8jewPQeF_UXwfxGe52oL8DVzjv6kx3-eOQ7g8BR28FK-whVhDgDX6Yw9c9intyLOHfgDXnjdwJF8aOtUZ9TSTQg3E4UuDDbI4utTxXxxtUjdgDmFuZzO3eQznb6Wxt0K_uYOa2MWd63rKUaVmx58SBfww'
    },
    
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
    this.setData({
      statusBarHeight: windowInfo.statusBarHeight || 44,
      windowHeight: windowInfo.windowHeight,
      entryTime: Date.now()
    });
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

    this.setData({
      cardTranslateX: deltaX,
      cardTranslateY: deltaY,
      cardRotate: rotate
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
        cardTransition: 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
      });
    }
  },

  /* ====== Swipe Logic ====== */
  animateSwipeAndNext(direction) {
    const xDest = direction === 'right' ? 800 : -800;
    this.setData({
      cardTranslateX: xDest,
      cardRotate: direction === 'right' ? 30 : -30,
      cardTransition: 'transform 0.4s ease-out'
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
        showLimitModal: true
      });
      return;
    }

    this.setData({
      cardTranslateY: -800,
      cardTransition: 'transform 0.4s ease-out',
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
  recordSwipe(direction) {
    // API Call to /api/v1/cards/swipe expected here

    // Add to session count
    let sc = this.data.swipeSessionCount + 1;
    this.setData({ swipeSessionCount: sc });

    // Check blindbox trigger (e.g., 3 valid swipes + 5 mins, simulating fast for demo)
    const timeSpent = (Date.now() - this.data.entryTime) / 1000;
    if (sc >= 3 && timeSpent > 30) {
      this.checkBlindBoxTrigger();
    }
  },

  loadNextCard() {
    // API Call to /api/v1/cards/recommend expected here
    // Mocking next card loading
    this.setData({
      cardTranslateX: 0,
      cardTranslateY: 0,
      cardRotate: 0,
      cardTransition: 'none',
      currentCard: {
        id: Math.floor(Math.random() * 1000),
        user: { name: 'MARCUS', avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAn5HzxKpfPgAW1WfhKpnshh3KoTUthnkQQ01WXgHFpX-rvCaJgK448OBgBIjOw3Bdo3nog51RWfExCiH1lzpPrN6T8dnDenhtwbzbJJY2cNcSO_O4c1_JHMzrTYo2ObLjq18yEQ-FQc5q6nI4eWgTpGOU89zuSjxmqzJpQdHEEAFZaCT2TZY6nWoGc1LgZEQygHBRLBi04V6X_Qk_zTjIg-2jUGzf48j8s5kAugk1NVLCrzowRlMO5BB2CwLd6mpAkG-K9786mvQY' },
        tags: '态度 · 生活',
        content: '认为晚上的效率永远比白天高。',
        agreePercent: 42,
        agreeAvatars: [],
        disagreeAvatar: ''
      }
    });
  },

  checkBlindBoxTrigger() {
    // Trigger Blind Box UI
    wx.showToast({
      title: '触发盲盒弹窗!',
      icon: 'none'
    });
    // 重置计数，避免重复触发
    this.setData({ swipeSessionCount: 0 });
  },

  openAICommentDrawer() {
    // Implement AI sliding drawer opening
    wx.showToast({
      title: '打开AI评论与讨论',
      icon: 'none'
    });
  },

  closeModal() {
    this.setData({ showLimitModal: false });
  },

  preventTouchMove() {
    // Empty function to prevent touch propagation on modal
  },

  switchTab(e) {
    this.setData({ currentTab: e.currentTarget.dataset.tab });
  },

  goToDiscovery() {
    wx.redirectTo({ url: '/pages/discovery/discovery' });
  },

  goToProfile() {
    wx.redirectTo({ url: '/pages/profile/profile' });
  }
});
