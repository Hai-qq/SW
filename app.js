const { clearAccessToken, getAccessToken, setAccessToken } = require('./utils/session')
const { normalizeAvatarUrl } = require('./utils/avatar')

const REQUEST_TIMEOUT_MS = 2500
const AUTH_DEBUG_PREFIX = '[SW Auth]'

function logAuthDebug(step, details) {
  if (typeof details === 'undefined') {
    console.log(`${AUTH_DEBUG_PREFIX} ${step}`)
    return
  }

  try {
    console.log(`${AUTH_DEBUG_PREFIX} ${step}`, details)
  } catch {
    console.log(`${AUTH_DEBUG_PREFIX} ${step}`)
  }
}

function createAppError(message, details = {}) {
  const error = new Error(message)
  Object.assign(error, details)
  return error
}

function normalizeRequestFail(error, context = '') {
  const errMsg = String((error && error.errMsg) || '').toLowerCase()
  if (errMsg.includes('timeout')) {
    return createAppError('request_timeout', {
      code: 'request_timeout',
      context,
      errMsg: String((error && error.errMsg) || '')
    })
  }

  if (errMsg.includes('abort')) {
    return createAppError('request_aborted', {
      code: 'request_aborted',
      context,
      errMsg: String((error && error.errMsg) || '')
    })
  }

  return createAppError('request_failed', {
    code: 'request_failed',
    context,
    errMsg: String((error && error.errMsg) || '')
  })
}

function getWechatLoginCode() {
  return new Promise((resolve, reject) => {
    logAuthDebug('wx.login.call')
    wx.login({
      success: (result) => {
        logAuthDebug('wx.login.success', {
          hasCode: Boolean(result && result.code),
          errMsg: result && result.errMsg ? result.errMsg : ''
        })
        resolve(result)
      },
      fail: (error) => {
        logAuthDebug('wx.login.fail', error)
        reject(error)
      }
    })
  })
}

function getWechatUserProfileRequired() {
  return new Promise((resolve, reject) => {
    logAuthDebug('wx.getUserProfile.check', {
      available: typeof wx.getUserProfile === 'function'
    })
    if (typeof wx.getUserProfile !== 'function') {
      reject(createAppError('wx_get_user_profile_unavailable', {
        code: 'wx_get_user_profile_unavailable'
      }))
      return
    }

    logAuthDebug('wx.getUserProfile.call')
    wx.getUserProfile({
      desc: '完善个人资料',
      success: (result) => {
        logAuthDebug('wx.getUserProfile.success', {
          hasUserInfo: Boolean(result && result.userInfo),
          nickName: result && result.userInfo ? result.userInfo.nickName : '',
          avatarUrl: result && result.userInfo ? result.userInfo.avatarUrl : '',
          errMsg: result && result.errMsg ? result.errMsg : ''
        })
        resolve(result)
      },
      fail: (error) => {
        logAuthDebug('wx.getUserProfile.fail', error)
        reject(createAppError('wx_get_user_profile_denied', {
          code: 'wx_get_user_profile_denied',
          errMsg: String((error && error.errMsg) || '')
        }))
      }
    })
  })
}

function loginWithWechat(code, apiBaseUrl, profile = {}) {
  const avatarUrl = normalizeAvatarUrl(profile.avatarUrl || '')
  return new Promise((resolve, reject) => {
    logAuthDebug('request.wechat-login.call', {
      url: `${apiBaseUrl}/api/v1/auth/wechat-login`,
      nickname: profile.nickname || '',
      avatarUrl,
      hasCode: Boolean(code)
    })
    wx.request({
      url: `${apiBaseUrl}/api/v1/auth/wechat-login`,
      method: 'POST',
      data: {
        code,
        ...(profile.nickname ? { nickname: profile.nickname } : {}),
        ...(avatarUrl ? { avatarUrl } : {})
      },
      timeout: REQUEST_TIMEOUT_MS,
      success: (res) => {
        logAuthDebug('request.wechat-login.response', {
          statusCode: res.statusCode,
          data: res.data || null
        })
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data.data)
          return
        }

        reject(createAppError(`Wechat login failed: ${res.statusCode}`, {
          code: 'wechat_login_http_error',
          statusCode: res.statusCode,
          endpoint: '/api/v1/auth/wechat-login',
          response: res.data || null
        }))
      },
      fail: (error) => {
        logAuthDebug('request.wechat-login.fail', error)
        reject(normalizeRequestFail(error, 'wechat_login'))
      }
    })
  })
}

function fetchBootstrap(apiBaseUrl, accessToken, allowTestAuthFallback) {
  return new Promise((resolve, reject) => {
    const header = accessToken
      ? { Authorization: `Bearer ${accessToken}` }
      : allowTestAuthFallback !== false
        ? { 'x-test-user-id': '1' }
        : {}

    logAuthDebug('request.bootstrap.call', {
      url: `${apiBaseUrl}/api/v1/users/bootstrap`,
      hasAccessToken: Boolean(accessToken),
      allowTestAuthFallback
    })
    wx.request({
      url: `${apiBaseUrl}/api/v1/users/bootstrap`,
      method: 'GET',
      header,
      timeout: REQUEST_TIMEOUT_MS,
      success: (res) => {
        logAuthDebug('request.bootstrap.response', {
          statusCode: res.statusCode,
          data: res.data || null
        })
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data.data)
          return
        }

        reject(createAppError(`Bootstrap failed: ${res.statusCode}`, {
          code: 'bootstrap_http_error',
          statusCode: res.statusCode,
          endpoint: '/api/v1/users/bootstrap',
          response: res.data || null
        }))
      },
      fail: (error) => {
        logAuthDebug('request.bootstrap.fail', error)
        reject(normalizeRequestFail(error, 'bootstrap'))
      }
    })
  })
}

App({
  globalData: {
    apiBaseUrl: 'http://127.0.0.1:3005',
    allowTestAuthFallback: true,
    currentUser: null,
    nextStep: 'home',
    authRequired: true,
    lastAuthError: null
  },
  applyBootstrapResult(bootstrap) {
    this.globalData.currentUser = {
      ...(this.globalData.currentUser || {}),
      userId: bootstrap.userId,
      nickname: bootstrap.nickname,
      avatarUrl: bootstrap.avatarUrl || '',
      onboardingCompleted: bootstrap.onboardingCompleted
    }
    this.globalData.nextStep = bootstrap.nextStep || 'home'
  },
  async bootstrapWithToken(accessToken = '') {
    logAuthDebug('bootstrapWithToken.start', {
      hasAccessToken: Boolean(accessToken)
    })
    try {
      if (!accessToken) {
        if (this.globalData.allowTestAuthFallback !== false) {
          logAuthDebug('bootstrapWithToken.test-fallback.start', {
            testUserId: '1'
          })
          const bootstrap = await fetchBootstrap(
            this.globalData.apiBaseUrl,
            '',
            true
          )
          this.applyBootstrapResult(bootstrap)
          this.globalData.authRequired = false
          this.globalData.lastAuthError = null
          logAuthDebug('bootstrapWithToken.test-fallback.success', {
            nextStep: this.globalData.nextStep,
            currentUser: this.globalData.currentUser
          })
          return
        }

        this.globalData.authRequired = true
        this.globalData.nextStep = 'auth'
        this.globalData.currentUser = null
        logAuthDebug('bootstrapWithToken.no-token')
        return
      }

      const bootstrap = await fetchBootstrap(
        this.globalData.apiBaseUrl,
        accessToken,
        false
      )
      this.applyBootstrapResult(bootstrap)
      this.globalData.authRequired = false
      this.globalData.lastAuthError = null
      logAuthDebug('bootstrapWithToken.success', {
        nextStep: this.globalData.nextStep,
        currentUser: this.globalData.currentUser
      })
    } catch (error) {
      logAuthDebug('bootstrapWithToken.error', error)
      clearAccessToken()
      this.globalData.currentUser = null
      this.globalData.nextStep = 'auth'
      this.globalData.authRequired = true
      this.globalData.lastAuthError = {
        message: String((error && error.message) || ''),
        code: error && error.code ? String(error.code) : '',
        statusCode: error && error.statusCode ? Number(error.statusCode) : null,
        endpoint: error && error.endpoint ? String(error.endpoint) : '',
        errMsg: error && error.errMsg ? String(error.errMsg) : ''
      }
    }
  },
  async loginWithWechatAuthorize(onDebug) {
    const report = (step, details = {}) => {
      logAuthDebug(step, details)
      if (typeof onDebug === 'function') {
        onDebug(step, details)
      }
    }

    report('auth.start')
    const profileResult = await getWechatUserProfileRequired()
    report('wx.getUserProfile.result', {
      granted: Boolean(profileResult && profileResult.userInfo)
    })
    const userInfo = (profileResult && profileResult.userInfo) || {}

    const loginResult = await getWechatLoginCode()
    report('wx.login.success', { hasCode: Boolean(loginResult && loginResult.code) })
    if (!loginResult.code) {
      throw createAppError('missing_wx_login_code', {
        code: 'missing_wx_login_code'
      })
    }

    report('request.wechat-login.start', {
      endpoint: `${this.globalData.apiBaseUrl}/api/v1/auth/wechat-login`
    })
    const auth = await loginWithWechat(loginResult.code, this.globalData.apiBaseUrl, {
      nickname: userInfo.nickName || '',
      avatarUrl: userInfo.avatarUrl || ''
    })
    report('request.wechat-login.success', {
      hasAccessToken: Boolean(auth && auth.accessToken)
    })

    setAccessToken(auth.accessToken)
    logAuthDebug('session.access-token.set', {
      hasAccessToken: Boolean(auth && auth.accessToken)
    })
    this.globalData.currentUser = auth.user || null
    this.globalData.authRequired = false

    report('request.bootstrap.start', {
      endpoint: `${this.globalData.apiBaseUrl}/api/v1/users/bootstrap`
    })
    await this.bootstrapWithToken(auth.accessToken)
    if (this.globalData.authRequired) {
      throw createAppError('bootstrap_after_login_failed', {
        code: 'bootstrap_after_login_failed',
        detail: this.globalData.lastAuthError || null
      })
    }
    report('request.bootstrap.success', {
      nextStep: this.globalData.nextStep
    })
    return {
      nextStep: this.globalData.nextStep
    }
  },
  async ensureBootstrap() {
    if (!this.bootstrapPromise) {
      this.bootstrapPromise = this.onLaunch()
    }

    return this.bootstrapPromise
  },
  async onLaunch() {
    if (this.bootstrapPromise) {
      return this.bootstrapPromise
    }

    this.bootstrapPromise = (async () => {
      const accessToken = getAccessToken()
      await this.bootstrapWithToken(accessToken)
    })()

    try {
      await this.bootstrapPromise
    } finally {
      return this.bootstrapPromise
    }
  }
})
