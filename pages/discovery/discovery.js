const { request } = require('../../utils/request');
const { normalizeAvatarUrl } = require('../../utils/avatar');

function buildTabs(currentTab, tabs) {
  return tabs.map((tab) => ({
    label: tab,
    tabClass: currentTab === tab ? 'tab-item active' : 'tab-item'
  }));
}

function buildPostFilters(currentFilter, filters) {
  return filters.map((filter) => ({
    label: filter,
    filterClass: currentFilter === filter ? 'my-post-filter active' : 'my-post-filter'
  }));
}

function normalizeFeaturedItem(item) {
  if (!item) {
    return null;
  }

  const likeCount = Number(item.stats?.likeCount || 0);
  const commentCount = Number(item.stats?.commentCount || 0);
  const totalEngagement = likeCount + commentCount;
  const progressPercent = totalEngagement <= 0
    ? 0
    : Math.min(95, Math.max(8, totalEngagement * 6));

  const avatar = normalizeAvatarUrl(item.author?.avatar || '');
  return {
    titleText: item.title || item.content,
    categoryText: `${item.category} · ${item.author.nickname}`,
    statsText: `${likeCount} 喜欢 · ${commentCount} 评论`,
    progressPercent,
    avatar,
    hasAvatar: Boolean(avatar),
    likeCountText: `+${likeCount}`,
    likedByMe: Boolean(item.stats.likedByMe),
    likeButtonText: item.stats.likedByMe ? '已共鸣' : '共鸣一下',
    quoteText: `"${item.content}"`,
    raw: item
  };
}

function normalizeTimelineItems(items) {
  return (items || []).map((item, index) => ({
    ...item,
    dotClass: index === 0 ? 'black-dot' : 'gray-dot',
    metaText: `${item.author.nickname} · ${item.category}`
  }));
}

function getStatusText(status) {
  if (status === 'draft') {
    return '草稿';
  }

  if (status === 'hidden') {
    return '已隐藏';
  }

  return '已发布';
}

function getStatusClass(status) {
  if (status === 'draft') {
    return 'my-post-status draft';
  }

  if (status === 'hidden') {
    return 'my-post-status hidden';
  }

  return 'my-post-status published';
}

Page({
  data: {
    statusBarHeight: 20,
    windowHeight: 800,
    tabs: ['全部', '内心世界', '旅行与探索', '价值观', '社会观察'],
    tabItems: [],
    currentTab: '全部',
    featuredItems: [],
    featuredCard: null,
    timelineItems: [],
    showComposer: false,
    publishContent: '',
    showSideMenu: false,
    myPostsVisible: false,
    myPosts: [],
    myPostsEmpty: false,
    myPostFilters: ['全部', 'draft', 'published', 'hidden'],
    myPostFilter: '全部',
    myPostFilterItems: [],
    commentsVisible: false,
    activePostId: '',
    comments: [],
    commentsEmpty: false,
    commentInput: '',
    headerAvatar: '',
    hasHeaderAvatar: false
  },
  onLoad() {
    const app = getApp();
    const windowInfo = wx.getWindowInfo();
    const headerAvatar = normalizeAvatarUrl(app?.globalData?.currentUser?.avatarUrl || '');
    this.setData({
      statusBarHeight: windowInfo.statusBarHeight || 44,
      windowHeight: windowInfo.windowHeight,
      tabItems: buildTabs(this.data.currentTab, this.data.tabs),
      myPostFilterItems: buildPostFilters(this.data.myPostFilter, this.data.myPostFilters),
      headerAvatar,
      hasHeaderAvatar: Boolean(headerAvatar)
    });
    this.ensureAuthAndLoad();
  },
  async ensureAuthAndLoad() {
    const app = getApp();
    if (typeof app.ensureBootstrap === 'function') {
      await app.ensureBootstrap();
    }

    if (app.globalData.authRequired || !app.globalData.currentUser) {
      wx.redirectTo({ url: '/pages/auth/auth' });
      return;
    }

    const nextAvatar = normalizeAvatarUrl(app?.globalData?.currentUser?.avatarUrl || '');
    this.setData({
      headerAvatar: nextAvatar,
      hasHeaderAvatar: Boolean(nextAvatar)
    });
    this.loadFeed();
  },
  async loadFeed() {
    try {
      const [featured, timeline] = await Promise.all([
        request({
          url: `/api/v1/discovery/feed?tabType=${encodeURIComponent(this.data.currentTab)}&feedType=featured`
        }),
        request({
          url: `/api/v1/discovery/feed?tabType=${encodeURIComponent(this.data.currentTab)}&feedType=timeline`
        })
      ]);

      this.setData({
        featuredItems: featured.items || [],
        featuredCard: normalizeFeaturedItem((featured.items || [])[0]),
        timelineItems: normalizeTimelineItems(timeline.items || [])
      });
    } catch (error) {
      wx.showToast({ title: '加载失败', icon: 'none' });
    }
  },
  async loadMyPosts() {
    try {
      const statusQuery = this.data.myPostFilter === '全部'
        ? ''
        : `?status=${encodeURIComponent(this.data.myPostFilter)}`;
      const result = await request({
        url: `/api/v1/discovery/my-posts${statusQuery}`
      });
      const myPosts = (result.items || []).map((item) => ({
        ...item,
        statusText: getStatusText(item.status),
        statusClass: getStatusClass(item.status)
      }));

      this.setData({
        myPosts,
        myPostsEmpty: myPosts.length === 0
      });
    } catch (error) {
      wx.showToast({ title: '我的发布加载失败', icon: 'none' });
    }
  },
  goToHome() {
    wx.redirectTo({ url: '/pages/home/home' });
  },
  goToChat() {
    wx.redirectTo({ url: '/pages/chat/chat' });
  },
  openSideMenu() {
    this.setData({ showSideMenu: true });
  },
  closeSideMenu() {
    this.setData({ showSideMenu: false });
  },
  preventTouchMove() {},
  noop() {},
  goToProfile() {
    this.setData({ showSideMenu: false });
    wx.navigateTo({ url: '/pages/profile/profile' });
  },
  goToSettings() {
    this.setData({ showSideMenu: false });
    wx.navigateTo({ url: '/pages/settings/settings' });
  },
  openPublish() {
    this.setData({ showComposer: true });
  },
  closePublish() {
    this.setData({
      showComposer: false,
      publishContent: ''
    });
  },
  onPublishInput(e) {
    this.setData({ publishContent: e.detail.value });
  },
  async submitPost(action) {
    const content = (this.data.publishContent || '').trim();
    if (!content) {
      wx.showToast({ title: '先写点内容', icon: 'none' });
      return false;
    }

    await request({
      url: '/api/v1/discovery/publish',
      method: 'POST',
      data: {
        content,
        tabType: this.data.currentTab === '全部' ? '价值观' : this.data.currentTab,
        anonymous: false,
        action
      }
    });

    return true;
  },
  async saveDraft() {
    try {
      const submitted = await this.submitPost('draft');
      if (!submitted) {
        return;
      }

      wx.showToast({ title: '草稿已保存', icon: 'none' });
      this.closePublish();
      await this.loadMyPosts();
    } catch (error) {
      wx.showToast({ title: '保存失败', icon: 'none' });
    }
  },
  async publishNow() {
    try {
      const submitted = await this.submitPost('publish');
      if (!submitted) {
        return;
      }

      wx.showToast({ title: '已发布', icon: 'none' });
      this.closePublish();
      await Promise.all([this.loadFeed(), this.loadMyPosts()]);
    } catch (error) {
      wx.showToast({ title: '发布失败', icon: 'none' });
    }
  },
  async likeFeatured() {
    const postId = this.data.featuredCard && this.data.featuredCard.raw.feedId;
    if (!postId) {
      return;
    }

    try {
      await request({
        url: `/api/v1/discovery/posts/${postId}/like`,
        method: 'POST'
      });
      wx.showToast({ title: '已记录共鸣', icon: 'none' });
      await this.loadFeed();
    } catch (error) {
      wx.showToast({ title: '共鸣失败', icon: 'none' });
    }
  },
  async openFeaturedComments() {
    const postId = this.data.featuredCard && this.data.featuredCard.raw.feedId;
    if (!postId) {
      return;
    }

    this.setData({
      commentsVisible: true,
      activePostId: postId,
      commentInput: ''
    });
    await this.loadComments(postId);
  },
  closeComments() {
    this.setData({
      commentsVisible: false,
      activePostId: '',
      comments: [],
      commentsEmpty: false,
      commentInput: ''
    });
  },
  async loadComments(postId) {
    try {
      const result = await request({
        url: `/api/v1/discovery/posts/${postId}/comments`
      });
      const comments = result.items || [];
      this.setData({
        comments,
        commentsEmpty: comments.length === 0
      });
    } catch (error) {
      wx.showToast({ title: '评论加载失败', icon: 'none' });
    }
  },
  onCommentInput(e) {
    this.setData({ commentInput: e.detail.value });
  },
  async submitComment() {
    const postId = this.data.activePostId;
    const content = (this.data.commentInput || '').trim();
    if (!postId || !content) {
      wx.showToast({ title: '先写点评论', icon: 'none' });
      return;
    }

    try {
      await request({
        url: `/api/v1/discovery/posts/${postId}/comments`,
        method: 'POST',
        data: { content }
      });
      this.setData({ commentInput: '' });
      await Promise.all([this.loadComments(postId), this.loadFeed()]);
    } catch (error) {
      wx.showToast({ title: '评论失败', icon: 'none' });
    }
  },
  async toggleMyPosts() {
    const nextVisible = !this.data.myPostsVisible;
    this.setData({ myPostsVisible: nextVisible });
    if (nextVisible) {
      await this.loadMyPosts();
    }
  },
  async switchMyPostFilter(e) {
    const myPostFilter = e.currentTarget.dataset.status;
    this.setData({
      myPostFilter,
      myPostFilterItems: buildPostFilters(myPostFilter, this.data.myPostFilters)
    });
    await this.loadMyPosts();
  },
  async switchTab(e) {
    const currentTab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab,
      tabItems: buildTabs(currentTab, this.data.tabs)
    });
    await this.loadFeed();
  }
});
