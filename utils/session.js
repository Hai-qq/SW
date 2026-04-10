function ensureSessionId() {
  const key = 'swSessionId';
  const existing = wx.getStorageSync(key);
  if (existing) {
    return existing;
  }

  const next = `session-${Date.now()}`;
  wx.setStorageSync(key, next);
  return next;
}

function resetSessionId() {
  wx.removeStorageSync('swSessionId');
}

module.exports = {
  ensureSessionId,
  resetSessionId,
};
