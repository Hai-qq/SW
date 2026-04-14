const { getAccessToken } = require('./session');

const DEFAULT_BASE_URL = 'http://127.0.0.1:3005';
const REQUEST_TIMEOUT_MS = 2500;

function getBaseUrl() {
  const app = getApp();
  return app?.globalData?.apiBaseUrl || DEFAULT_BASE_URL;
}

function buildHeaders() {
  const app = getApp();
  const accessToken = getAccessToken();

  if (accessToken) {
    return {
      Authorization: `Bearer ${accessToken}`,
    };
  }

  if (app?.globalData?.allowTestAuthFallback !== false) {
    return {
      'x-test-user-id': '1',
    };
  }

  return {};
}

function buildRequestError(message, code) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function normalizeRequestFail(error) {
  const errMsg = String((error && error.errMsg) || '').toLowerCase();
  if (errMsg.includes('timeout')) {
    return buildRequestError('request_timeout', 'request_timeout');
  }

  if (errMsg.includes('abort')) {
    return buildRequestError('request_aborted', 'request_aborted');
  }

  return buildRequestError('request_failed', 'request_failed');
}

function request({ url, method = 'GET', data }) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${getBaseUrl()}${url}`,
      method,
      data,
      header: buildHeaders(),
      timeout: REQUEST_TIMEOUT_MS,
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data.data);
          return;
        }
        const backendMessage = res.data && (res.data.message || res.data.error);
        reject(
          buildRequestError(
            backendMessage || `request_failed_${res.statusCode}`,
            `http_${res.statusCode}`
          )
        );
      },
      fail: (error) => reject(normalizeRequestFail(error)),
    });
  });
}

module.exports = { request };
