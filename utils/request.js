const DEFAULT_BASE_URL = 'http://127.0.0.1:3005';

function getBaseUrl() {
  const app = getApp();
  return app?.globalData?.apiBaseUrl || DEFAULT_BASE_URL;
}

function request({ url, method = 'GET', data }) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${getBaseUrl()}${url}`,
      method,
      data,
      header: {
        'x-test-user-id': '1',
      },
      success: (res) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data.data);
          return;
        }

        reject(new Error(`Request failed with status ${res.statusCode}`));
      },
      fail: reject,
    });
  });
}

module.exports = { request };
