Page({
  data: {
    currentIndex: 0,
    currentQuestion: {},
    questions: [
      { id: 1, title: '你的生理性别是？', desc: '为了同频共振信号标定。', leftAns: '男性', rightAns: '女性' },
      { id: 2, title: '你的出生年龄段是？', desc: '代际不同，频段不同。', leftAns: '95后&00后', rightAns: '90后及更早' },
      { id: 3, title: '你当前的感情状态是？', desc: '了解你对建立羁绊的渴望期。', leftAns: '单身', rightAns: '非单身' }
    ],
    translateX: 0,
    rotate: 0,
    transition: 'none',
    startX: 0
  },

  onLoad() {
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

  animateSwipe(direction) {
    const moveX = direction === 'right' ? 800 : -800;
    this.setData({ 
      translateX: moveX, rotate: direction === 'right' ? 30 : -30, 
      transition: 'transform 0.4s ease-out' 
    });
    // 逻辑：保存记录 -> 延迟切换题目
    setTimeout(() => { this.nextQuestion(); }, 300);
  },

  nextQuestion() {
    if (this.data.currentIndex < this.data.questions.length - 1) {
      const nextIdx = this.data.currentIndex + 1;
      this.setData({ 
        currentIndex: nextIdx,
        currentQuestion: this.data.questions[nextIdx],
        translateX: 0, rotate: 0, transition: 'none' 
      });
    } else {
      wx.redirectTo({ url: '/pages/home/home' });
    }
  },

  skipQuestion() {
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
  }
});
