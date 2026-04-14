// pages/home/home.js
const { request } = require('../../utils/request');
const { ensureSessionId } = require('../../utils/session');
const { normalizeAvatarUrl } = require('../../utils/avatar');

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
  const agreeAvatars = (card.stats?.agreeAvatars || [])
    .map(normalizeAvatarUrl)
    .filter(Boolean);
  const disagreeAvatar = normalizeAvatarUrl(card.stats?.disagreeAvatar || '');
  const userAvatar = normalizeAvatarUrl(card.user?.avatar || '');
  return {
    id: Number(card.cardId),
    user: {
      name: card.user.name,
      avatar: userAvatar,
      hasAvatar: Boolean(userAvatar)
    },
    tags: Array.isArray(card.tags) ? card.tags : String(card.tags || '').split(' · ').filter(Boolean),
    content: card.content,
    agreePercent: card.stats?.agreePercent || 0,
    commentCount: card.stats?.commentCount || 0,
    agreeAvatars,
    hasAgreeAvatars: agreeAvatars.length > 0,
    disagreeAvatar,
    hasDisagreeAvatar: Boolean(disagreeAvatar)
  };
}

function normalizeRecommendUser(user) {
  const avatar = normalizeAvatarUrl(user.avatar || '');
  return {
    id: user.userId,
    name: user.nickname || '同频用户',
    avatar,
    hasAvatar: Boolean(avatar),
    sharedTopic: user.sharedTopic || ''
  };
}

function getNextMockCard(currentId) {
  const currentIndex = MOCK_CARDS.findIndex((card) => card.id === currentId);
  const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % MOCK_CARDS.length;
  return cloneCard(MOCK_CARDS[nextIndex]);
}

function drawWrappedText(ctx, text, x, startY, maxWidth, lineHeight, maxLines) {
  const value = String(text || '');
  if (!value) {
    return startY;
  }

  let line = '';
  let y = startY;
  let lineCount = 0;

  for (let i = 0; i < value.length; i += 1) {
    const next = line + value[i];
    if (ctx.measureText(next).width > maxWidth) {
      const isLastLine = lineCount >= maxLines - 1;
      ctx.fillText(isLastLine ? `${line}...` : line, x, y);
      y += lineHeight;
      line = value[i];
      lineCount += 1;
      if (isLastLine) {
        return y;
      }
    } else {
      line = next;
    }
  }

  if (line) {
    ctx.fillText(line, x, y);
    y += lineHeight;
  }

  return y;
}

Page({
  data: {
    statusBarHeight: 20,
    windowHeight: 800,
    currentTab: '全部',
    recommendUsers: [],
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
    entryTime: 0,
    showCommentPanel: false,
    comments: [],
    commentsEmpty: false,
    commentInput: '',
    showSharePanel: false,
    sharePosterPath: '',
    sharePosterGenerating: false
  },

  onLoad() {
    const windowInfo = wx.getWindowInfo();
    this.setData({
      statusBarHeight: windowInfo.statusBarHeight || 44,
      windowHeight: windowInfo.windowHeight,
      entryTime: Date.now()
    });
    ensureSessionId();
    this.initPageAsync();
  },

  async initPageAsync() {
    const app = getApp();
    try {
      if (typeof app.ensureBootstrap === 'function') {
        await app.ensureBootstrap();
      }
    } catch (error) {
      // 启动链路失败不阻塞首屏渲染。
    }

    if (app.globalData.authRequired || !app.globalData.currentUser) {
      wx.redirectTo({ url: '/pages/auth/auth' });
      return;
    }

    if (app.globalData.nextStep === 'onboarding') {
      wx.redirectTo({ url: '/pages/onboarding/onboarding' });
      return;
    }

    this.loadRecommendUsers();
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

  async loadRecommendUsers() {
    try {
      const data = await request({
        url: '/api/v1/cards/recommend-users?limit=5'
      });
      this.setData({
        recommendUsers: (data.items || []).map(normalizeRecommendUser)
      });
    } catch (error) {
      this.setData({ recommendUsers: [] });
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
        const confirmed = await new Promise((resolve) => {
          wx.showModal({
            title: '发现同频的人',
            content: `${result.matchUser.name} · ${result.matchReason || '你们的观点频率很接近'}\n要建立连接吗？`,
            confirmText: '建立连接',
            cancelText: '先略过',
            success: (modalResult) => resolve(modalResult.confirm)
          });
        });

        try {
          const connection = await request({
            url: '/api/v1/matching/connections',
            method: 'POST',
            data: {
              candidateUserId: result.matchUser.userId,
              action: confirmed ? 'connect' : 'hide'
            }
          });
          if (confirmed && connection.connectionId) {
            const conversation = await request({
              url: '/api/v1/chat/conversations',
              method: 'POST',
              data: { connectionId: connection.connectionId }
            });
            wx.redirectTo({
              url: `/pages/chat/chat?conversationId=${conversation.conversationId}`
            });
            return;
          }
        } catch (connectionError) {
          wx.showToast({
            title: '连接状态保存失败',
            icon: 'none'
          });
        }
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
    this.setData({
      showCommentPanel: true,
      commentInput: ''
    });
    this.loadComments();
  },

  closeCommentPanel() {
    this.setData({
      showCommentPanel: false,
      comments: [],
      commentsEmpty: false,
      commentInput: ''
    });
  },

  async loadComments() {
    try {
      const result = await request({
        url: `/api/v1/cards/${this.data.currentCard.id}/comments`
      });
      const comments = result.items || [];
      this.setData({
        comments,
        commentsEmpty: comments.length === 0
      });
    } catch (error) {
      wx.showToast({
        title: '评论加载失败',
        icon: 'none'
      });
    }
  },

  onCommentInput(e) {
    this.setData({ commentInput: e.detail.value });
  },

  async submitComment() {
    const content = (this.data.commentInput || '').trim();
    if (!content) {
      wx.showToast({
        title: '先写点评论',
        icon: 'none'
      });
      return;
    }

    try {
      await request({
        url: `/api/v1/cards/${this.data.currentCard.id}/comments`,
        method: 'POST',
        data: { content }
      });
      this.setData({
        commentInput: '',
        currentCard: {
          ...this.data.currentCard,
          commentCount: this.data.currentCard.commentCount + 1
        }
      });
      await this.loadComments();
    } catch (error) {
      wx.showToast({
        title: '评论失败',
        icon: 'none'
      });
    }
  },

  handleShare() {
    this.setData({
      showSharePanel: true
    });
  },

  closeSharePanel() {
    this.setData({
      showSharePanel: false
    });
  },

  async generateSharePoster() {
    if (this.data.sharePosterGenerating) {
      return this.data.sharePosterPath;
    }

    this.setData({ sharePosterGenerating: true });
    const width = 720;
    const height = 1160;
    const card = this.data.currentCard || {};

    try {
      const posterPath = await new Promise((resolve, reject) => {
        const ctx = wx.createCanvasContext('sharePosterCanvas', this);

        ctx.setFillStyle('#F8F1E4');
        ctx.fillRect(0, 0, width, height);

        ctx.setFillStyle('#1A1A1A');
        ctx.setFontSize(42);
        ctx.fillText('Same Wavelength', 64, 106);

        ctx.setFontSize(24);
        ctx.setFillStyle('rgba(26,26,26,0.55)');
        ctx.fillText('观点卡片分享', 64, 152);

        ctx.setFillStyle('#FFFFFF');
        ctx.fillRect(48, 198, 624, 708);

        ctx.setStrokeStyle('rgba(26,26,26,0.18)');
        ctx.strokeRect(48, 198, 624, 708);

        ctx.setFillStyle('#1A1A1A');
        ctx.setFontSize(26);
        const tags = Array.isArray(card.tags) && card.tags.length > 0 ? card.tags.join(' · ') : '全部';
        ctx.fillText(tags, 88, 268);

        ctx.setFontSize(48);
        drawWrappedText(
          ctx,
          `“${card.content || '观点正在加载中'}”`,
          88,
          388,
          540,
          68,
          6
        );

        ctx.setFillStyle('rgba(26,26,26,0.55)');
        ctx.setFontSize(24);
        const agreePercent = Number(card.agreePercent || 0);
        ctx.fillText(`A/B 当前倾向：${agreePercent}%`, 88, 758);
        ctx.fillText(`评论 ${Number(card.commentCount || 0)}`, 88, 800);

        ctx.setFillStyle('#1A1A1A');
        ctx.setFontSize(28);
        ctx.fillText('打开小程序，继续左右滑动表达观点', 88, 958);

        ctx.setFillStyle('rgba(26,26,26,0.42)');
        ctx.setFontSize(22);
        ctx.fillText(`#${tags.split(' · ')[0] || '同频话题'}`, 88, 1002);

        ctx.draw(false, () => {
          wx.canvasToTempFilePath({
            canvasId: 'sharePosterCanvas',
            x: 0,
            y: 0,
            width,
            height,
            destWidth: width * 2,
            destHeight: height * 2,
            success: (res) => resolve(res.tempFilePath),
            fail: reject
          }, this);
        });
      });

      this.setData({
        sharePosterPath: posterPath,
        sharePosterGenerating: false
      });
      wx.showToast({
        title: '海报已生成',
        icon: 'none'
      });
      return posterPath;
    } catch (error) {
      this.setData({ sharePosterGenerating: false });
      wx.showToast({
        title: '海报生成失败',
        icon: 'none'
      });
      throw error;
    }
  },

  async ensureSharePosterPath() {
    if (this.data.sharePosterPath) {
      return this.data.sharePosterPath;
    }

    return this.generateSharePoster();
  },

  async sharePosterToWechat() {
    try {
      const path = await this.ensureSharePosterPath();
      if (typeof wx.showShareImageMenu === 'function') {
        wx.showShareImageMenu({
          path,
          success: () => {
            wx.showToast({ title: '已打开分享面板', icon: 'none' });
          },
          fail: () => {
            wx.previewImage({ urls: [path], current: path });
          }
        });
        return;
      }

      wx.previewImage({ urls: [path], current: path });
      wx.showShareMenu({ menus: ['shareAppMessage', 'shareTimeline'] });
      wx.showToast({ title: '请从右上角继续分享', icon: 'none' });
    } catch (error) {
      // Toast already shown by upstream.
    }
  },

  async shareToWechatFriend() {
    await this.sharePosterToWechat();
  },

  async shareToTimeline() {
    await this.sharePosterToWechat();
  },

  async savePosterToAlbum() {
    try {
      const filePath = await this.ensureSharePosterPath();
      await new Promise((resolve, reject) => {
        wx.saveImageToPhotosAlbum({
          filePath,
          success: resolve,
          fail: reject
        });
      });
      wx.showToast({ title: '已保存到相册', icon: 'none' });
    } catch (error) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },

  handleVoiceInput() {
    wx.showToast({
      title: '语音输入开发中',
      icon: 'none'
    });
  },

  reduceSimilarTopics() {
    request({
      url: '/api/v1/cards/feedback',
      method: 'POST',
      data: {
        cardId: String(this.data.currentCard.id),
        feedbackType: 'reduce_similar',
        category: (this.data.currentCard.tags || [])[0] || this.data.currentTab
      }
    }).then(() => {
      wx.showToast({
        title: '已减少此类话题',
        icon: 'none'
      });
      this.loadNextCard();
    }).catch(() => {
      wx.showToast({
        title: '反馈保存失败',
        icon: 'none'
      });
    });
  },

  closeModal() {
    this.setData({ showLimitModal: false });
  },

  preventTouchMove() {
    // Empty function to prevent touch propagation on modal
  },

  noop() {},

  goToDiscovery() {
    wx.redirectTo({ url: '/pages/discovery/discovery' });
  },

  goToChat() {
    wx.redirectTo({ url: '/pages/chat/chat' });
  }
});
