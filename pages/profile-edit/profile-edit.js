const { request } = require('../../utils/request');
const { normalizeAvatarUrl } = require('../../utils/avatar');

const MBTI_OPTIONS = ['INTJ', 'INTP', 'ENTJ', 'ENTP', 'INFJ', 'INFP', 'ENFJ', 'ENFP', 'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'];
const GENDER_OPTIONS = [
  { label: '男', value: 'male' },
  { label: '女', value: 'female' }
];
const AGE_RANGE_OPTIONS = [
  { label: 'Gen Z', value: 'gen-z' },
  { label: '90s', value: '90s' }
];
const RELATIONSHIP_OPTIONS = [
  { label: '单身', value: 'single' },
  { label: '非单身', value: 'not-single' }
];

function findOptionIndex(options, value) {
  const index = options.findIndex((item) => item.value === value);
  return index >= 0 ? index : 0;
}

function buildPickerState(form) {
  const genderIndex = findOptionIndex(GENDER_OPTIONS, form.gender);
  const ageRangeIndex = findOptionIndex(AGE_RANGE_OPTIONS, form.ageRange);
  const relationshipIndex = findOptionIndex(RELATIONSHIP_OPTIONS, form.relationshipStatus);
  const mbtiIndex = MBTI_OPTIONS.indexOf(form.mbti);

  return {
    mbtiIndex: mbtiIndex >= 0 ? mbtiIndex : 0,
    genderIndex,
    ageRangeIndex,
    relationshipIndex,
    mbtiLabel: form.mbti || '请选择',
    genderLabel: GENDER_OPTIONS[genderIndex] ? GENDER_OPTIONS[genderIndex].label : '请选择',
    ageRangeLabel: AGE_RANGE_OPTIONS[ageRangeIndex] ? AGE_RANGE_OPTIONS[ageRangeIndex].label : '请选择',
    relationshipLabel: RELATIONSHIP_OPTIONS[relationshipIndex] ? RELATIONSHIP_OPTIONS[relationshipIndex].label : '请选择'
  };
}

function buildForm(profile) {
  return {
    nickname: profile.nickname || '',
    signature: profile.signature || '',
    mbti: profile.mbti || '',
    city: profile.city || '',
    gender: profile.gender || '',
    ageRange: profile.age || '',
    relationshipStatus: profile.relationshipStatus || ''
  };
}

Page({
  data: {
    loading: true,
    saving: false,
    form: {
      nickname: '',
      signature: '',
      mbti: '',
      city: '',
      gender: '',
      ageRange: '',
      relationshipStatus: ''
    },
    newPhotoUrl: '',
    photos: [],
    mbtiOptions: MBTI_OPTIONS,
    genderOptions: GENDER_OPTIONS.map((item) => item.label),
    ageRangeOptions: AGE_RANGE_OPTIONS.map((item) => item.label),
    relationshipOptions: RELATIONSHIP_OPTIONS.map((item) => item.label),
    mbtiIndex: 0,
    genderIndex: 0,
    ageRangeIndex: 0,
    relationshipIndex: 0,
    mbtiLabel: '请选择',
    genderLabel: '请选择',
    ageRangeLabel: '请选择',
    relationshipLabel: '请选择'
  },

  async onLoad() {
    await this.loadProfile();
  },

  async loadProfile() {
    this.setData({ loading: true });
    try {
      const profile = await request({ url: '/api/v1/profile/info' });
      const form = buildForm(profile);
      this.setData({
        loading: false,
        form,
        photos: (profile.photos || []).map((item) => ({
          ...item,
          photoUrl: normalizeAvatarUrl(item.photoUrl || '')
        })),
        ...buildPickerState(form)
      });
    } catch (error) {
      this.setData({ loading: false });
      wx.showToast({ title: '资料加载失败', icon: 'none' });
    }
  },

  onInputChange(e) {
    const field = e.currentTarget.dataset.field;
    this.setData({
      [`form.${field}`]: e.detail.value
    });
  },

  onMbtiChange(e) {
    const index = Number(e.detail.value);
    this.setData({
      mbtiIndex: index,
      mbtiLabel: MBTI_OPTIONS[index],
      'form.mbti': MBTI_OPTIONS[index]
    });
  },

  onGenderChange(e) {
    const index = Number(e.detail.value);
    this.setData({
      genderIndex: index,
      genderLabel: GENDER_OPTIONS[index].label,
      'form.gender': GENDER_OPTIONS[index].value
    });
  },

  onAgeRangeChange(e) {
    const index = Number(e.detail.value);
    this.setData({
      ageRangeIndex: index,
      ageRangeLabel: AGE_RANGE_OPTIONS[index].label,
      'form.ageRange': AGE_RANGE_OPTIONS[index].value
    });
  },

  onRelationshipChange(e) {
    const index = Number(e.detail.value);
    this.setData({
      relationshipIndex: index,
      relationshipLabel: RELATIONSHIP_OPTIONS[index].label,
      'form.relationshipStatus': RELATIONSHIP_OPTIONS[index].value
    });
  },

  onNewPhotoUrlChange(e) {
    this.setData({ newPhotoUrl: e.detail.value });
  },

  async saveProfile() {
    if (this.data.saving) {
      return;
    }

    this.setData({ saving: true });
    try {
      await request({
        url: '/api/v1/profile/info',
        method: 'PATCH',
        data: this.data.form
      });

      wx.showToast({ title: '已保存', icon: 'none' });
      setTimeout(() => {
        wx.navigateBack();
      }, 300);
    } catch (error) {
      this.setData({ saving: false });
      wx.showToast({ title: '保存失败', icon: 'none' });
      return;
    }
  },

  async addPhoto() {
    const photoUrl = normalizeAvatarUrl((this.data.newPhotoUrl || '').trim());
    if (!photoUrl) {
      wx.showToast({ title: '请输入有效图片链接', icon: 'none' });
      return;
    }

    try {
      await request({
        url: '/api/v1/profile/photos',
        method: 'POST',
        data: { photoUrl }
      });
      this.setData({ newPhotoUrl: '' });
      await this.loadProfile();
      wx.showToast({ title: '已新增', icon: 'none' });
    } catch (error) {
      wx.showToast({ title: '新增失败', icon: 'none' });
    }
  },

  async deletePhoto(e) {
    const photoId = e.currentTarget.dataset.photoId;
    try {
      await request({
        url: `/api/v1/profile/photos/${photoId}`,
        method: 'DELETE'
      });
      await this.loadProfile();
      wx.showToast({ title: '已删除', icon: 'none' });
    } catch (error) {
      wx.showToast({ title: '删除失败', icon: 'none' });
    }
  },

  async movePhotoUp(e) {
    const photoId = e.currentTarget.dataset.photoId;
    const currentIndex = this.data.photos.findIndex((item) => item.photoId === photoId);
    if (currentIndex <= 0) {
      return;
    }

    const items = [...this.data.photos];
    const target = items[currentIndex];
    items[currentIndex] = items[currentIndex - 1];
    items[currentIndex - 1] = target;
    await this.syncPhotoOrder(items);
  },

  async movePhotoDown(e) {
    const photoId = e.currentTarget.dataset.photoId;
    const currentIndex = this.data.photos.findIndex((item) => item.photoId === photoId);
    if (currentIndex < 0 || currentIndex >= this.data.photos.length - 1) {
      return;
    }

    const items = [...this.data.photos];
    const target = items[currentIndex];
    items[currentIndex] = items[currentIndex + 1];
    items[currentIndex + 1] = target;
    await this.syncPhotoOrder(items);
  },

  async syncPhotoOrder(items) {
    try {
      await request({
        url: '/api/v1/profile/photos/sort',
        method: 'PATCH',
        data: {
          items: items.map((item, index) => ({
            photoId: item.photoId,
            sortOrder: index
          }))
        }
      });
      await this.loadProfile();
      wx.showToast({ title: '顺序已更新', icon: 'none' });
    } catch (error) {
      wx.showToast({ title: '排序失败', icon: 'none' });
    }
  }
});
