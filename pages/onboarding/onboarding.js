const { request } = require('../../utils/request');

Page({
  data: {
    currentIndex: 0,
    currentQuestion: {},
    questions: [
      { id: 1, title: '你的生理性别是？', desc: '为了同频共振信号标定。', leftAns: '男性', rightAns: '女性', leftValue: 'male', rightValue: 'female' },
      { id: 2, title: '你的出生年龄段是？', desc: '代际不同，频段不同。', leftAns: '95后&00后', rightAns: '90后及更早', leftValue: 'gen-z', rightValue: '90s' },
      { id: 3, title: '你当前的感情状态是？', desc: '了解你对建立羁绊的渴望期。', leftAns: '单身', rightAns: '非单身', leftValue: 'single', rightValue: 'not-single' }
    ],
    answers: [],
    translateX: 0,
    rotate: 0,
    transition: 'none',
    startX: 0
  },

  async onLoad() {
    const app = getApp();
    if (typeof app.ensureBootstrap === 'function') {
      await app.ensureBootstrap();
    }

    if (app.globalData.authRequired || !app.globalData.currentUser) {
      wx.redirectTo({ url: '/pages/auth/auth' });
      return;
    }

    if (app.globalData.nextStep === 'home') {
      wx.redirectTo({ url: '/pages/home/home' });
      return;
    }

    this.setData({
      currentQuestion: this.data.questions[0]
    });
  },

  touchStart(e) {
    this.setData({ startX: e.touches[0].clientX, transition: 'none' });
  },

  touchMove(e) {
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - this.data.startX;
    this.setData({ translateX: deltaX, rotate: deltaX * 0.05 });
  },

  touchEnd() {
    const { translateX } = this.data;
    if (translateX > 100) this.animateSwipe('right');
    else if (translateX < -100) this.animateSwipe('left');
    else this.setData({ translateX: 0, rotate: 0, transition: 'transform 0.3s ease' });
  },

  forceSwipeLeft() { this.animateSwipe('left'); },
  forceSwipeRight() { this.animateSwipe('right'); },

  async animateSwipe(direction) {
    const moveX = direction === 'right' ? 800 : -800;
    this.setData({ 
      translateX: moveX, rotate: direction === 'right' ? 30 : -30, 
      transition: 'transform 0.4s ease-out' 
    });

    const currentQuestion = this.data.questions[this.data.currentIndex];
    const selected =
      direction === 'right' ? currentQuestion.rightValue : currentQuestion.leftValue;
    const answers = [...this.data.answers];
    const existingIndex = answers.findIndex((item) => item.questionId === currentQuestion.id);
    const nextAnswer = { questionId: currentQuestion.id, selected };

    if (existingIndex >= 0) {
      answers[existingIndex] = nextAnswer;
    } else {
      answers.push(nextAnswer);
    }

    this.setData({ answers });

    setTimeout(async () => {
      await this.nextQuestion();
    }, 300);
  },

  async nextQuestion() {
    if (this.data.currentIndex < this.data.questions.length - 1) {
      const nextIdx = this.data.currentIndex + 1;
      this.setData({ 
        currentIndex: nextIdx,
        currentQuestion: this.data.questions[nextIdx],
        translateX: 0, rotate: 0, transition: 'none' 
      });
    } else {
      await this.submitAnswers();
    }
  },

  skipQuestion() {
    const currentQuestion = this.data.questions[this.data.currentIndex];
    const answers = [...this.data.answers];
    const existingIndex = answers.findIndex((item) => item.questionId === currentQuestion.id);
    const nextAnswer = { questionId: currentQuestion.id };

    if (existingIndex >= 0) {
      answers[existingIndex] = nextAnswer;
    } else {
      answers.push(nextAnswer);
    }

    this.setData({ answers });
    this.nextQuestion();
  },

  goBack() {
    if (this.data.currentIndex > 0) {
      const prevIdx = this.data.currentIndex - 1;
      this.setData({ 
        currentIndex: prevIdx,
        currentQuestion: this.data.questions[prevIdx],
        translateX: 0, rotate: 0, transition: 'none'
      });
    }
  },

  async submitAnswers() {
    try {
      await request({
        url: '/api/v1/onboarding/submit',
        method: 'POST',
        data: {
          answers: this.data.answers
        }
      });
      const app = getApp();
      app.globalData.nextStep = 'home';
      if (app.globalData.currentUser) {
        app.globalData.currentUser.onboardingCompleted = true;
      }
      wx.redirectTo({ url: '/pages/home/home' });
    } catch (error) {
      wx.showToast({
        title: '提交失败，请重试',
        icon: 'none'
      });
    }
  }
});
