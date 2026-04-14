# SW V6 Lightweight Chat Design

## 1. 目标

V6 的目标，是把当前已有的 `UserConnection` 关系承接成最小可用聊天能力。

本阶段不做复杂即时通信，而是先完成：

- 已连接用户可以打开会话
- 会话可以展示在小纸条页面
- 会话内可以查看历史消息
- 会话内可以发送文本消息

一句话目标：

> 让小纸条从静态 mock 页面升级为基于真实连接关系的轻量聊天闭环。

---

## 2. 本阶段范围

### 2.1 本阶段要做

后端：

- 新增 `chat` 模块
- 新增 `Conversation` 数据表
- 新增 `Message` 数据表
- 从 `UserConnection(status = connected)` 创建或打开会话
- 查询当前用户会话列表
- 查询某个会话的消息列表
- 向某个会话发送文本消息

前端：

- `pages/chat/chat` 从 mock 列表改为真实会话列表
- 点击会话进入消息视图
- 支持发送一条文本消息
- 空会话与空消息状态不白屏

### 2.2 本阶段不做

- WebSocket
- 已读回执
- 输入中状态
- 图片 / 语音 / 表情消息
- 消息撤回
- 消息推送
- 群聊
- 敏感词审核

### 2.3 实现补充

这份设计稿定义的是 V6 的最小聊天范围。后续实现已经在不引入 WebSocket 的前提下补上了几项轻量能力：

- 会话未读计数
- 进入会话后标记已读
- 消息列表 `limit / before` 分页
- 小纸条空状态展示当前用户的 `connected` 连接，并可直接创建或打开会话

因此，后续阅读时应以 `docs/superpowers/specs/2026-04-11-page-backend-status-and-remaining-work.md` 和 `docs/API.md` 作为当前状态来源；本文件保留为 V6 初始设计背景。

---

## 3. 当前基础

V4 已经完成：

- 微信登录
- Bearer token
- 当前用户识别

V5 已经完成：

- `UserConnection`
- `GET /api/v1/matching/connections`
- `POST /api/v1/matching/connections`
- 前端 `我的连接` 页面

因此 V6 可以建立在：

- 当前用户身份
- 已连接用户关系

之上，不需要重新设计账号体系。

---

## 4. 数据模型设计

### 4.1 `Conversation`

建议字段：

- `id`
- `connectionId`
- `userAId`
- `userBId`
- `lastMessageText`
- `lastMessageAt`
- `createdAt`
- `updatedAt`

约束：

- `connectionId` 唯一
- `userAId` 和 `userBId` 分别关联 `User`

说明：

- 本阶段只做一对一会话
- 会话必须来源于 `UserConnection(status = connected)`

### 4.2 `Message`

建议字段：

- `id`
- `conversationId`
- `senderUserId`
- `content`
- `messageType`
- `createdAt`

本阶段固定：

- `messageType = text`

---

## 5. 后端接口设计

### 5.1 `POST /api/v1/chat/conversations`

用途：

- 从一个 `connectionId` 创建或打开会话

请求：

```json
{
  "connectionId": "9"
}
```

返回：

```json
{
  "conversationId": "15",
  "peer": {
    "userId": "2",
    "nickname": "MARCUS",
    "avatar": "https://..."
  }
}
```

规则：

- connection 必须属于当前用户
- connection 状态必须是 `connected`
- 已存在会话时直接返回已有会话

### 5.2 `GET /api/v1/chat/conversations`

用途：

- 查询当前用户会话列表

返回：

```json
{
  "items": [
    {
      "conversationId": "15",
      "peer": {
        "userId": "2",
        "nickname": "MARCUS",
        "avatar": "https://..."
      },
      "lastMessageText": "看到你的想法很有共鸣",
      "lastMessageAt": "2026-04-11T12:00:00.000Z",
      "unreadCount": 1
    }
  ]
}
```

规则：

- 只返回当前用户参与的会话
- 按 `lastMessageAt` 或 `updatedAt` 倒序

### 5.3 `GET /api/v1/chat/conversations/:conversationId/messages`

用途：

- 查询会话消息

返回：

```json
{
  "items": [
    {
      "messageId": "100",
      "senderUserId": "1",
      "content": "你好",
      "messageType": "text",
      "createdAt": "2026-04-11T12:00:00.000Z",
      "isMine": true
    }
  ]
}
```

规则：

- 当前用户必须是会话参与者

### 5.4 `POST /api/v1/chat/conversations/:conversationId/messages`

用途：

- 发送文本消息

请求：

```json
{
  "content": "你好，很高兴认识你"
}
```

返回：

```json
{
  "messageId": "101",
  "sent": true
}
```

规则：

- 内容不能为空
- 当前用户必须是会话参与者
- 发送后更新会话的 `lastMessageText` 和 `lastMessageAt`

### 5.5 `POST /api/v1/chat/conversations/:conversationId/read`

用途：

- 标记当前用户已读某个会话

返回：

```json
{
  "conversationId": "15",
  "unreadCount": 0
}
```

规则：

- 当前用户必须是会话参与者
- 以会话最后一条消息时间作为当前用户的已读位置

### 5.6 `GET /api/v1/chat/conversations/:conversationId/messages?limit=30&before=100`

用途：

- 分页查询更早的历史消息

规则：

- `limit` 默认 `30`，范围 `1-50`
- `before` 为可选消息游标
- 返回 `nextCursor` 时表示还有更早消息可继续加载

---

## 6. 前端设计

### 6.1 小纸条列表

`pages/chat/chat` 先展示真实会话列表：

- 对方头像
- 对方昵称
- 最后一条消息
- 最后消息时间

如果没有会话：

- 展示空状态
- 引导用户去“我的连接”

### 6.2 消息视图

本阶段为了控制范围，可以在 `pages/chat/chat` 内做轻量切换：

- `mode = list`
- `mode = detail`

不强制新增独立 `chat-detail` 页面。

消息视图需要：

- 返回列表
- 展示消息气泡
- 输入框
- 发送按钮
- 加载更早消息入口
- 进入会话后标记已读

### 6.3 从连接进入会话

`pages/connections/connections` 中点击已连接用户：

- 调用 `POST /api/v1/chat/conversations`
- 成功后进入小纸条页面并打开对应会话

本阶段也允许先从小纸条页面显示已有会话，不强制先接复杂跳转。

---

## 7. 测试设计

后端 e2e 需要覆盖：

- connected connection 可以创建会话
- hidden connection 不能创建会话
- 当前用户只能看自己的会话
- 当前用户只能看自己参与会话的消息
- 发送消息会写入 `Message`
- 发送消息会更新 `Conversation.lastMessageText`
- 未读计数会随对方消息变化
- 进入会话可标记已读
- 消息列表支持 `before` 游标分页

前端手工联调需要覆盖：

- 小纸条页面不再显示 mock 固定用户
- 没有会话时显示空态
- 从连接创建会话
- 发送文本消息后消息列表刷新
- 未读数进入会话后清零
- 加载更早消息不打乱当前消息顺序

---

## 8. 验收标准

V6 完成时应满足：

- `chat` 后端模块存在
- 会话与消息真实落库
- 当前用户不能访问别人的会话
- 小纸条页面能展示真实会话
- 用户可以发送文本消息
- 现有 V1-V5 流程不回归

---

## 9. 后续阶段

V6 完成后，再考虑：

- WebSocket 实时消息
- 完整已读回执 / 送达状态
- 输入中状态
- 消息推送
- 图片消息
- 举报与拉黑
- 聊天内容审核
