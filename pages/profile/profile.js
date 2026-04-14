const { request } = require('../../utils/request');
const { normalizeAvatarUrl } = require('../../utils/avatar');

function normalizeProfile(profile) {
  const photos = profile.photos || [];
  const profileAvatar = normalizeAvatarUrl(profile.avatarUrl || '');
  const firstPhoto = normalizeAvatarUrl(photos[0] ? photos[0].photoUrl : '');
  const primaryPhoto = profileAvatar || firstPhoto;

  return {
    ...profile,
    primaryPhoto,
    hasPrimaryPhoto: Boolean(primaryPhoto),
    visiblePhotos: photos.map((photo) => {
      const photoUrl = normalizeAvatarUrl(photo.photoUrl || '');
      return {
        ...photo,
        photoUrl,
        hasPhoto: Boolean(photoUrl)
      };
    }),
    nicknameText: profile.nickname || '加载中',
    genderAgeText: `${profile.gender || '-'} ${profile.age || '-'}`,
    mbtiText: profile.mbti || '-',
    signatureText: profile.signature || '',
    photoCountText: `${photos.length} PHOTOS`
  };
}

Page({
  data: {
    statusBarHeight: 20,
    windowHeight: 800,
    profile: {
      nickname: '',
      gender: '',
      age: '',
      mbti: '',
      signature: '',
      photos: [],
      counts: {
        visitors: 0,
        followers: 0,
        following: 0,
        interactions: 0
      }
    }
  },
  onLoad() {
    const windowInfo = wx.getWindowInfo();
    this.setData({
      statusBarHeight: windowInfo.statusBarHeight || 44,
      windowHeight: windowInfo.windowHeight
    });
    this.loadProfile();
  },
  onShow() {
    this.loadProfile();
  },
  async loadProfile() {
    try {
      const profile = await request({ url: '/api/v1/profile/info' });
      this.setData({ profile: normalizeProfile(profile) });
    } catch (error) {
      wx.showToast({ title: '档案加载失败', icon: 'none' });
    }
  },
  goToEditProfile() {
    wx.navigateTo({ url: '/pages/profile-edit/profile-edit' });
  },
  goToConnections() {
    wx.navigateTo({ url: '/pages/connections/connections' });
  },
  goBack() {
    if (getCurrentPages().length > 1) {
      wx.navigateBack();
      return;
    }

    wx.redirectTo({ url: '/pages/discovery/discovery' });
  }
});
