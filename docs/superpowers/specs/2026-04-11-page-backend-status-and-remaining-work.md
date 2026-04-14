# SW Page Backend Status And Remaining Work

## 1. 结论

截至 2026-04-11，截图里的 3 个主页面都已经进入真实后端联调阶段：

- `冲浪 / Home`：卡片推荐、滑卡、匹配、连接、顶部同频用户、减少同类推荐、卡片评论、匹配后进入聊天都已接后端。
- `真心话 / Discovery`：feed、发布、草稿、我的发布、点赞、评论都已接后端。
- `小纸条 / Chat`：会话列表、空状态连接入口、打开会话、消息列表、发送文本、未读计数、已读标记、消息分页都已接后端。

当前项目已经完成：

- `V1 / MVP` 主链路
- `V2` 资料编辑与照片墙
- `V3` Discovery 发布正式化
- `V4` 微信登录与身份体系
- `V5` 多用户进入流程与基础连接关系
- `V6` 轻量聊天上线
- `V7` Home / Discovery / Chat 互动闭环
- `V8` Home 评论与 Chat 空状态开聊入口

下一批真正还没做的大块是实时性、安全治理、图片上传和推荐质量，而不是“有没有后端”。

## 2. 三个页面与后端状态

### 2.1 冲浪 / Home

页面位置：

- [pages/home/home.js](D:/CodeWorkSpace/SW/pages/home/home.js)

已实现后端：

- `GET /api/v1/cards/recommend`
- `GET /api/v1/cards/recommend-users`
- `POST /api/v1/cards/swipe`
- `POST /api/v1/cards/feedback`
- `GET /api/v1/cards/:cardId/comments`
- `POST /api/v1/cards/:cardId/comments`
- `POST /api/v1/matching/trigger-check`
- `POST /api/v1/matching/connections`
- `GET /api/v1/matching/connections`
- `POST /api/v1/chat/conversations`

当前完成度：

- 卡片推荐已接后端。
- 顶部同频用户横条已接后端。
- 滑卡行为已落库。
- “减少此类推荐”已落库，并会在后续推荐里降低同类话题出现。
- 卡片评论已支持加载与发布。
- 盲盒匹配检查已接后端。
- 匹配结果可以沉淀为 `UserConnection`。
- 建立连接后可以直接打开聊天会话并跳转到小纸条。

还可以继续增强：

- 推荐算法增强。
- 服务端每日划过限额。
- 更细粒度匹配解释和反馈回流。
- Home 评论删除、举报和通知。

### 2.2 真心话 / Discovery

页面位置：

- [pages/discovery/discovery.js](D:/CodeWorkSpace/SW/pages/discovery/discovery.js)

已实现后端：

- `GET /api/v1/discovery/feed`
- `POST /api/v1/discovery/publish`
- `GET /api/v1/discovery/my-posts`
- `POST /api/v1/discovery/posts/:postId/like`
- `GET /api/v1/discovery/posts/:postId/comments`
- `POST /api/v1/discovery/posts/:postId/comments`

当前完成度：

- 公共 feed 已接后端。
- 发布已接后端。
- 支持 `draft / published / hidden`。
- 公共 feed 默认只展示 `published`。
- 支持“我的发布”。
- 支持基础点赞与评论。

还可以继续增强：

- 评论删除、举报与通知。
- 审核后台。
- 内容编辑。
- 图片上传。
- 运营筛选、搜索与分页。

### 2.3 小纸条 / Chat

页面位置：

- [pages/chat/chat.js](D:/CodeWorkSpace/SW/pages/chat/chat.js)

已实现后端：

- `POST /api/v1/chat/conversations`
- `GET /api/v1/chat/conversations`
- `GET /api/v1/chat/conversations/:conversationId/messages`
- `POST /api/v1/chat/conversations/:conversationId/messages`
- `POST /api/v1/chat/conversations/:conversationId/read`

当前完成度：

- 前端页面壳子已接真实接口。
- 会话表和消息表已落地。
- 空状态会展示当前用户的 `connected` 连接，点击后可创建或打开会话。
- 已连接用户可以进入聊天闭环。
- 支持文本消息发送和历史消息读取。
- 支持会话未读计数。
- 支持进入会话标记已读。
- 支持加载更早消息。

还可以继续增强：

- WebSocket 或轮询刷新。
- 输入中状态。
- 消息撤回、删除、举报、拉黑。
- 图片、语音、表情消息。

## 3. 推荐后续顺序

### 3.1 下一步：聊天实时化与安全能力

建议先做小范围增强：

- 轮询或 WebSocket 刷新。
- 举报 / 拉黑 / 解除连接。
- 消息撤回或删除。

### 3.2 再下一步：内容治理与图片上传

Discovery 和 Profile 接下来需要：

- Discovery 评论删除/举报。
- 图片上传接口。
- 云存储 / 对象存储。
- 图片审核。

### 3.3 再后面：推荐系统增强

等主链路稳定后，再增强：

- 更细粒度标签权重。
- 推荐反馈回流。
- 多样性控制。
- 内容互动通知。

## 4. 一句话状态

> Home、Discovery、Chat 都已经进入真实后端联调阶段；下一阶段重点不再是“有没有后端”，而是实时性、安全治理、图片上传和推荐质量。
