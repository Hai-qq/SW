# SW V5 Multi-User Entry And Relationship Foundation Design

## 1. 目标

V5 的目标，是把刚完成的 `微信登录 + 用户身份体系` 往前推进一层，从“后端知道你是谁”，升级为：

- 多个真实用户能稳定进入系统
- 新用户与老用户的进入路径清晰分流
- onboarding 与真实账号真正绑定
- 匹配结果不再只是一次事件，而能沉淀成基础关系

一句话目标：

> 让 SW 从“单用户可联调的身份系统”升级为“多用户真实进入 + 关系可沉淀”的产品基础层。

---

## 2. 本阶段范围

### 2.1 本阶段要做

后端：

- 新增 `users` 聚合模块
- 新增新用户进入状态判断
- 新增 onboarding 完成态驱动的首页分流
- 新增基础关系链模型
- 新增匹配结果落关系的最小闭环
- 新增“我的连接”查询接口

前端：

- App 启动后根据当前用户状态决定进入 `onboarding` 还是主流程
- 新增最小“连接列表”入口或页面
- 在已有匹配结果基础上提供“建立连接”动作

数据层：

- 新增基础关系表
- 为关系状态保留扩展空间

### 2.2 本阶段不做

- 聊天消息系统
- 关注 / 拉黑 / 举报
- 复杂好友推荐
- 关系图谱
- 运营后台

---

## 3. 为什么现在做这个

V4 解决了“身份识别”问题，但还没有完全解决“真实产品流程”问题。

当前还缺两件关键能力：

1. 新用户登录后，系统应明确知道他是否需要先做 onboarding
2. 匹配命中后，系统应有一个可以沉淀的关系对象，而不是只有一次临时返回

如果这两件事不做，后续聊天、关系链和多用户真实使用都会缺基础承接。

---

## 4. 当前现状

当前已完成：

- `auth` 模块
- `POST /api/v1/auth/wechat-login`
- `GET /api/v1/auth/me`
- Bearer token + 开发态测试兜底

当前还缺：

- 明确的用户进入态接口
- onboarding 后首页分流判断
- 匹配成功后的关系沉淀
- 用户自己的连接列表

---

## 5. 设计原则

### 5.1 先把“进入态”固定，再扩展产品能力

本阶段先解决：

- 你是不是新用户
- 你应不应该先做 onboarding
- 你已经建立了哪些连接

而不是提前做复杂社交系统。

### 5.2 关系链先做最小闭环

本阶段关系链只需要支持：

- 匹配命中
- 用户确认建立连接
- 后续可被聊天承接

不做大而全。

### 5.3 保持现有模块稳定

当前 `auth / onboarding / matching / profile` 已可运行。

V5 应优先新增模块与轻改造，而不是大面积推翻现有接口。

---

## 6. 功能设计

### 6.1 用户进入态

新增：

- `GET /api/v1/users/bootstrap`

用途：

- 前端启动后判断当前用户应进入哪条路径

返回建议：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "userId": "101",
    "nickname": "微信用户123456",
    "onboardingCompleted": false,
    "nextStep": "onboarding"
  }
}
```

规则：

- `onboardingCompleted = false` 时，`nextStep = onboarding`
- `onboardingCompleted = true` 时，`nextStep = home`

### 6.2 onboarding 与真实账号绑定

当前 onboarding 已写入当前用户。

V5 要明确它的产品意义：

- 新用户完成 onboarding 后，用户正式进入主流程
- 前端后续启动应不再回到 onboarding

这意味着：

- `POST /api/v1/onboarding/submit` 不一定需要重写
- 但需要与 `users/bootstrap` 串成真正的进入闭环

### 6.3 基础关系链

新增关系对象，例如 `UserConnection`。

建议字段：

- `id`
- `userId`
- `targetUserId`
- `sourceMatchEventId`
- `status`
- `createdAt`
- `updatedAt`

本阶段建议状态：

- `pending`
- `connected`
- `hidden`

语义：

- `pending`：系统已给出连接机会，但用户尚未明确建立连接
- `connected`：用户确认建立连接，后续聊天可依赖它
- `hidden`：用户忽略或暂不展示

### 6.4 匹配结果落关系

新增：

- `POST /api/v1/matching/connections`

用途：

- 将一次匹配结果沉淀为关系

请求示例：

```json
{
  "candidateUserId": "2",
  "matchEventId": "15",
  "action": "connect"
}
```

返回示例：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "connectionId": "9",
    "status": "connected"
  }
}
```

说明：

- `action = connect` 时创建或更新关系为 `connected`
- `action = hide` 时关系记为 `hidden`

### 6.5 我的连接列表

新增：

- `GET /api/v1/matching/connections`

用途：

- 返回当前用户的连接列表

返回字段建议：

- `connectionId`
- `targetUser.userId`
- `targetUser.nickname`
- `targetUser.avatar`
- `status`
- `matchReason`
- `createdAt`

本阶段只需要满足：

- 可以看到已连接的人
- 能为下一阶段聊天列表提供数据来源

---

## 7. 数据模型设计

### 7.1 `users` 继续作为主体表

不新增独立账户中心表。

本阶段继续使用：

- `User`
- `OnboardingAnswer`
- `MatchEvent`

### 7.2 新增 `UserConnection`

建议 Prisma 模型方向：

```prisma
model UserConnection {
  id                 BigInt   @id @default(autoincrement())
  userId             BigInt
  targetUserId       BigInt
  sourceMatchEventId BigInt?
  status             String
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt

  user       User       @relation("UserConnectionOwner", fields: [userId], references: [id])
  targetUser User       @relation("UserConnectionTarget", fields: [targetUserId], references: [id])
  matchEvent  MatchEvent? @relation(fields: [sourceMatchEventId], references: [id])

  @@unique([userId, targetUserId])
  @@index([userId, status, createdAt])
}
```

说明：

- 先采用单向关系存储，降低实现复杂度
- 后续如果要做双向确认或会话共享，再扩展

---

## 8. 前端设计

### 8.1 启动分流

前端启动流程改成：

1. `wx.login`
2. `/api/v1/auth/wechat-login`
3. `/api/v1/users/bootstrap`
4. 根据 `nextStep` 决定跳转：
   - `onboarding`
   - `home`

### 8.2 建立连接动作

当前首页已有匹配触发。

V5 建议在匹配命中后补一个最小操作：

- `connect`
- `hide`

不必在本阶段做复杂 UI，只要能完成联调闭环即可。

### 8.3 连接列表页面

本阶段建议新增一个最小页面，例如：

- `pages/connections/connections`

作用：

- 展示已连接对象
- 为 V6 聊天承接做准备

---

## 9. 验收标准

当以下条件成立时，V5 可视为完成：

- 新用户登录后能进入 onboarding
- 完成 onboarding 后再次启动会进入 home
- 匹配结果可被用户沉淀为连接
- 当前用户能查询自己的连接列表
- 关系数据真实落库
- 现有 home / discovery / profile 不被破坏

---

## 10. 与下一阶段关系

V5 完成后，下一阶段最自然的是：

- `V6: 轻量聊天上线`

因为到那时：

- 用户身份已稳定
- onboarding 分流已稳定
- 连接关系已有数据来源

聊天就不再是“无根的页面”，而是可以挂在连接关系上的承接层。
