const ACCESS_TOKEN_KEY = 'swAccessToken';
const SESSION_ID_KEY = 'swSessionId';

function ensureSessionId() {
  const existing = wx.getStorageSync(SESSION_ID_KEY);
  if (existing) {
    return existing;
  }

  const next = `session-${Date.now()}`;
  wx.setStorageSync(SESSION_ID_KEY, next);
  return next;
}

function resetSessionId() {
  wx.removeStorageSync(SESSION_ID_KEY);
}

function getAccessToken() {
  return wx.getStorageSync(ACCESS_TOKEN_KEY) || '';
}

function setAccessToken(token) {
  wx.setStorageSync(ACCESS_TOKEN_KEY, token);
}

function clearAccessToken() {
  wx.removeStorageSync(ACCESS_TOKEN_KEY);
}

module.exports = {
  ensureSessionId,
  resetSessionId,
  getAccessToken,
  setAccessToken,
  clearAccessToken,
};
