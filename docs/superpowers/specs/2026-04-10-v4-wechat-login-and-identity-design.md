# SW V4 WeChat Login And Identity Design

## 1. 目标

V4 这一阶段的目标，是把当前依赖测试用户头的后端访问方式，升级为“真实微信登录优先、开发环境保留测试兜底”的用户身份体系。

这次不追求一次性把关系链、聊天、手机号授权和完整权限系统都做完，而是先把最核心的身份问题解决：

- 小程序用户能通过 `wx.login` 获取真实身份
- 后端能完成 `code -> openid` 交换
- 首次登录用户能自动创建
- 已存在用户能稳定绑定与复用
- 前端请求不再只能依赖 `x-test-user-id`
- 本地开发仍保留测试态兜底，避免联调效率下降

一句话目标：

> 让 SW 从“测试态用户系统”升级为“真实微信身份可接入、开发态仍可平滑联调”的双轨身份体系。

---

## 2. 范围

### 2.1 本阶段要做

后端新增或扩展：

- 新增 `auth` 模块
- 新增微信登录接口
- 新增本地 token / session 发放能力
- 新增基于 token 的当前用户解析
- `users` 数据模型补微信身份字段
- 首次登录自动创建用户
- 已登录用户复用已有身份
- 保留开发环境测试用户兜底

前端新增或扩展：

- `App.onLaunch()` 发起微信登录
- 保存本地登录 token
- `request` 自动带上 token
- 登录失败时在开发环境可退回测试态

数据层：

- `users` 表补 `wechatOpenid` / `wechatUnionid`
- 新增轻量登录会话表或 token 载荷方案

---

### 2.2 本阶段不做

- 微信手机号授权
- 多端账号合并
- 账号注销
- 风控登录策略
- 刷新 token 体系复杂化
- 后台用户管理
- 完整 RBAC

---

## 3. 设计原则

### 3.1 真实登录优先，开发态不被卡死

线上与真实联调时，应优先使用微信登录态。

但本地开发不应因为微信接口、扫码、账号条件而频繁阻塞，因此保留开发环境测试用户兜底是本阶段的明确策略。

### 3.2 身份接入独立成模块

当前后端还没有 `auth` 模块。V4 应把登录、token、当前用户识别从 `common/test-user.guard` 的临时实现中抽离出来，形成明确边界。

### 3.3 先解决“谁在访问”，再做更复杂账号能力

本阶段只解决：

- 当前请求来自哪个用户
- 新用户如何创建
- 老用户如何识别

不在本阶段提前引入复杂账户中心概念。

### 3.4 渐进式替换现有测试态方案

当前已有很多接口依赖 `request.currentUser`。

因此 V4 应尽量保持控制器层拿当前用户的方式不变，只替换“当前用户是如何解析出来的”。

---

## 4. 当前现状

### 4.1 后端现状

当前后端通过 [test-user.guard.ts](D:/CodeWorkSpace/SW/backend/src/common/test-user.guard.ts) 注入用户：

- 默认读取 `x-test-user-id`
- 如果没有，则读取 `TEST_USER_ID`
- 最后默认回退到用户 `1`

这意味着：

- 当前没有真实登录
- 当前没有 token
- 当前没有微信身份绑定

### 4.2 前端现状

当前前端请求层 [request.js](D:/CodeWorkSpace/SW/utils/request.js) 直接固定发送：

- `x-test-user-id: 1`

当前 [app.js](D:/CodeWorkSpace/SW/app.js) 没有登录逻辑，只有基础 API 地址。

### 4.3 数据现状

当前 `users` 表还没有：

- `wechatOpenid`
- `wechatUnionid`

因此当前用户主体还只是“测试种子用户”，不是微信身份用户。

---

## 5. 数据模型设计

### 5.1 `users` 表扩展

在当前 `User` 模型上新增：

- `wechatOpenid String? @unique`
- `wechatUnionid String?`

用途：

- `wechatOpenid` 作为当前阶段最核心的微信身份键
- `wechatUnionid` 先可空，作为后续生态打通的预留

### 5.2 登录会话设计

本阶段建议增加一张轻量登录会话表，例如 `UserAuthSession`。

建议字段：

- `id`
- `userId`
- `accessToken`
- `source`
- `expiresAt`
- `createdAt`

用途：

- 管理小程序登录后的本地 token
- 支持服务端根据 token 找到当前用户

本阶段不需要复杂 refresh token 体系，只需一个短期可验证 access token 即可。

### 5.3 为什么不只用 JWT 无状态方案

本阶段更推荐“数据库会话 + accessToken”而不是完全无状态 JWT，原因是：

- 本地调试更直观
- 更容易手动失效/排查
- 更适合当前阶段的可控性

这不是长期唯一方案，但很适合当前阶段。

---

## 6. 后端接口设计

### 6.1 POST `/api/v1/auth/wechat-login`

用途：

- 小程序把 `wx.login` 拿到的 `code` 传给后端
- 后端调用微信 `code2session`
- 找到或创建用户
- 返回本地 access token 和基础用户信息

请求体：

```json
{
  "code": "wx-login-code"
}
```

返回：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "accessToken": "sw_at_xxx",
    "user": {
      "userId": "101",
      "nickname": "微信用户",
      "onboardingCompleted": false
    }
  }
}
```

规则：

- 若 `openid` 未命中用户，则自动创建新用户
- 若已命中，则直接复用用户
- 昵称可先使用默认占位名
- 本阶段不强制要求首次登录就拿头像昵称

### 6.2 GET `/api/v1/auth/me`

用途：

- 前端启动后校验当前 token 对应的用户

返回：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "userId": "101",
    "nickname": "微信用户",
    "onboardingCompleted": false
  }
}
```

作用：

- 用于前端恢复登录状态
- 避免每次都重新拉全量 profile

---

## 7. 当前用户解析设计

### 7.1 新的鉴权链路

本阶段建议把当前用户解析统一成以下优先级：

1. `Authorization: Bearer <accessToken>`
2. 开发环境 `x-test-user-id`
3. `TEST_USER_ID`

这意味着：

- 真实登录优先
- 开发态仍可退回测试用户

### 7.2 实现方式

建议新增：

- `AuthModule`
- `CurrentUserGuard` 或统一 `AppAuthGuard`

职责：

- 解析 access token
- 查找登录会话
- 注入 `request.currentUser`
- 在开发态允许测试用户兜底

### 7.3 与现有控制器兼容

当前控制器层已经普遍通过 `CurrentUser` 装饰器拿用户：

- 这层应尽量保持不变
- 只替换 guard 的实现逻辑

这样可以最小化波及已有业务模块。

---

## 8. 前端设计

### 8.1 App 启动登录

在 [app.js](D:/CodeWorkSpace/SW/app.js) 中加入：

- `wx.login`
- 调后端 `/api/v1/auth/wechat-login`
- 保存 `accessToken`

### 8.2 本地会话存储

在 `utils/session.js` 中扩展：

- `getAccessToken`
- `setAccessToken`
- `clearAccessToken`

这样请求层可以统一取 token。

### 8.3 请求层改造

在 [request.js](D:/CodeWorkSpace/SW/utils/request.js) 中改成：

- 若有 `accessToken`，则发 `Authorization`
- 若没有 token 且在开发态，允许继续发 `x-test-user-id`

### 8.4 前端失败兜底

如果微信登录失败：

- 开发态允许退回测试用户头
- 非开发态则提示登录失败

这个策略能保证本地开发不因微信登录偶发问题被彻底阻塞。

---

## 9. 新用户创建策略

### 9.1 首次登录自动创建

当 `openid` 不存在时，后端自动创建用户。

默认字段建议：

- `nickname = 微信用户 + 短 ID`
- `status = active`
- `onboardingCompleted = false`

### 9.2 与 onboarding 的关系

新用户自动创建后：

- 若 `onboardingCompleted = false`
- 前端继续走 onboarding 页面

也就是说：

- 登录解决“你是谁”
- onboarding 解决“你是什么样的人”

两者分工要清晰。

---

## 10. 开发环境兜底策略

### 10.1 为什么必须保留

如果 V4 一刀切成“没有微信登录就完全不能访问”，会严重拖慢本地开发和调试。

尤其是：

- 后端联调
- e2e 测试
- 前端 GUI 快速排错

都需要低摩擦入口。

### 10.2 明确规则

开发环境中：

- token 优先
- 无 token 时允许 `x-test-user-id`

生产环境中：

- 不允许测试头
- 必须走真实 token

### 10.3 风险控制

因此本阶段需要明确一个环境开关，例如：

- `ALLOW_TEST_AUTH=true|false`

避免测试头误进入生产部署。

---

## 11. 测试设计

### 11.1 后端 e2e

应补充：

- 微信登录接口返回 token
- 首次登录自动创建用户
- 重复登录命中已有用户
- `Authorization` 能解析当前用户
- 无 token 时开发态测试头仍可用

### 11.2 前端联调

应验证：

- 小程序启动时能完成一次登录
- 请求自动携带 token
- 新用户首次进入时能继续走 onboarding
- 已完成 onboarding 的用户能直接进入主流程
- 开发态关闭微信登录时仍可回退测试态

---

## 12. 风险与边界

### 12.1 微信接口依赖外部环境

这次开始接入真实微信登录，因此：

- 本地联调会比纯测试头复杂

这也是保留开发态兜底的核心原因。

### 12.2 当前不处理复杂账号合并

本阶段不会解决：

- 一个用户多端合并
- openid 与 unionid 的复杂绑定迁移

### 12.3 当前不引入完整安全体系

本阶段 token 方案以“可用、可控、可联调”为目标，不追求一次到位的企业级安全架构。

---

## 13. 验收标准

当以下条件成立时，可认为本阶段完成：

- 小程序能通过微信登录拿到真实 access token
- 后端能根据 token 识别当前用户
- 首次登录会自动创建用户
- 老用户重复登录能命中已有身份
- onboarding 与用户身份能正确衔接
- 开发环境下测试态兜底仍然可用
- 生产环境可关闭测试态兜底

---

## 14. 与后续阶段关系

本阶段完成后，后续这些能力都会变得更稳：

- 多用户真实进入产品
- discovery 作者身份可信化
- profile 资料归属可信化
- 匹配关系沉淀
- 聊天会话建立

因此它应作为当前项目下一阶段的最高优先级子项目。
