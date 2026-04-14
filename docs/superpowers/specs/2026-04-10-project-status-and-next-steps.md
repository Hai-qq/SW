# SW Project Status And Next Steps

> Historical note: this document reflects the project status on 2026-04-10. It is now superseded by `docs/superpowers/specs/2026-04-11-page-backend-status-and-remaining-work.md`, because V4 auth, V5 relationship foundation, V6 lightweight chat, and later Home/Discovery/Chat interaction work have since landed.

## 1. 当前结论

截至 2026-04-10，SW 当前已经完成了：

- `MVP / P0` 主链路后端
- `V2` 用户资料编辑与照片墙管理
- `V3` Discovery 发布正式化与内容状态流转

项目当前不是“后端还没开始”，而是已经完成了一个**可本地联调、可落库、可继续迭代**的基础版本。

更准确地说，当前阶段已经从“搭骨架”进入到“补账号体系、关系链、聊天承接和更强推荐”的阶段。

---

## 2. 已完成内容

### 2.1 基础设施

已经完成：

- 本地 NestJS 后端
- Prisma ORM
- PostgreSQL 数据库接入
- Docker 本地数据库启动方案
- Prisma migration
- Prisma seed
- 测试态用户鉴权
- 后端 e2e 测试
- 本地 README 启动文档

相关位置：

- [backend/prisma/schema.prisma](D:/CodeWorkSpace/SW/backend/prisma/schema.prisma)
- [backend/prisma/seed.ts](D:/CodeWorkSpace/SW/backend/prisma/seed.ts)
- [backend/src/app.module.ts](D:/CodeWorkSpace/SW/backend/src/app.module.ts)
- [backend/src/common/test-user.guard.ts](D:/CodeWorkSpace/SW/backend/src/common/test-user.guard.ts)
- [backend/test](D:/CodeWorkSpace/SW/backend/test)

### 2.2 MVP / P0 主链路

已经完成的后端模块：

- `onboarding`
- `cards`
- `matching`
- `discovery`
- `profile`

已经完成的核心接口：

- `POST /api/v1/onboarding/submit`
- `GET /api/v1/cards/recommend`
- `POST /api/v1/cards/swipe`
- `POST /api/v1/matching/trigger-check`
- `GET /api/v1/discovery/feed`
- `POST /api/v1/discovery/publish`
- `GET /api/v1/profile/info`

### 2.3 V2 已完成

已完成：

- 资料编辑
- 照片墙新增
- 照片删除
- 照片排序
- Profile 展示与编辑分离

已完成接口：

- `PATCH /api/v1/profile/info`
- `POST /api/v1/profile/photos`
- `DELETE /api/v1/profile/photos/:photoId`
- `PATCH /api/v1/profile/photos/sort`

### 2.4 V3 已完成

已完成：

- Discovery 草稿发布
- Discovery 立即发布
- 公共 feed 仅展示 `published`
- 我的发布列表
- `draft / published / hidden` 状态展示

已完成接口：

- `POST /api/v1/discovery/publish` with `action = draft | publish`
- `GET /api/v1/discovery/my-posts`
- `GET /api/v1/discovery/feed` status-filtered

---

## 3. 还没有做的内容

### 3.1 账号与身份体系

当前还没做：

- 用户注册流程
- 多用户真实账号创建
- 登录态持久化
- token / session 体系
- `auth` 模块
- `users` 独立模块

当前状态：

- 依赖测试头 `x-test-user-id`
- 用户主要来自 seed 数据

这意味着：

- “有多用户数据”不等于“有多用户注册体系”
- 当前只能算测试态多用户，不算真实多用户产品流程

### 3.2 微信登录

当前还没做：

- `wx.login` 后端对接
- `code2session`
- `openid` / `unionid` 写入
- 微信登录态绑定
- 微信手机号授权

说明：

- 文档里已明确微信登录属于后续阶段
- 当前代码里也还没有这部分实现

### 3.3 聊天系统

当前还没做：

- 消息表
- 会话表
- 聊天接口
- 已匹配关系与聊天入口联动

当前只有前端页面占位：

- [pages/chat/chat.js](D:/CodeWorkSpace/SW/pages/chat/chat.js)

### 3.4 关系链

当前还没做：

- 连接状态
- 关注
- 拉黑
- 举报
- 匹配成功后的关系沉淀

### 3.5 匹配增强

当前还没做：

- 更细粒度标签权重
- 相似度计算增强
- 匹配反馈回流
- 候选人质量过滤
- 多样性控制

当前匹配仍是可运行的轻量规则版。

### 3.6 用户画像自动聚合

当前还没做：

- 行为画像聚合任务
- 用户画像快照
- 标签定时重算
- 更完整的 Discovery / 卡片行为回流画像

### 3.7 审核与运营能力

当前还没做：

- 审核后台
- 内容 review 流程
- 人工隐藏/放行
- 审计字段
- 运营查询能力

### 3.8 对象存储与真实图片上传

当前还没做：

- 图片上传接口
- 云存储接入
- 上传凭证
- 图片审核

当前还是 URL 联调方案。

---

## 4. 关于你提到的 3 个问题

### 4.1 数据库还没有

结论：

- 不对

原因：

- 数据库已经完成
- PostgreSQL + Prisma + migration + seed 都已经在项目里

### 4.2 多用户注册还没做

结论：

- 对

原因：

- 目前只有测试态多用户和 seed 用户
- 没有真实注册/登录/创建用户流程

### 4.3 微信登录还没做

结论：

- 对

原因：

- 当前没有任何 `openid / unionid / code2session` 实现

---

## 5. 建议的后续优先级

如果按产品与工程价值排序，我建议接下来按这个顺序推进：

### 5.1 第一优先级

- 微信登录 + 用户身份体系

原因：

- 这是从“测试态产品”走向“真实用户产品”的关键
- 不解决这个问题，后续关系链和聊天都不稳

### 5.2 第二优先级

- 多用户真实进入流程

包括：

- 新用户首次进入
- 自动创建/绑定用户
- onboarding 与真实账号绑定

### 5.3 第三优先级

- 基础关系链

包括：

- 匹配记录
- 连接状态
- 为聊天入口提供前置条件

### 5.4 第四优先级

- 聊天轻量上线

包括：

- 最小消息模型
- 会话列表
- 与匹配结果衔接

### 5.5 第五优先级

- 匹配规则增强

包括：

- 更好的候选筛选
- 更好的解释
- 更好的行为回流

---

## 6. 当前最准确的项目判断

如果用一句话总结当前项目状态：

> SW 当前已经完成了本地可联调的基础产品版本，但还没有进入真实用户身份体系阶段。

因此，接下来真正的关键不再是“数据库有没有”，而是：

- 如何让真实用户进入系统
- 如何绑定微信身份
- 如何把匹配关系沉淀成关系链
- 如何让聊天承接这些关系

---

## 7. 推荐下一步

建议下一阶段直接进入：

1. `微信登录 + 用户身份体系`

这是当前所有未完成事项里最有杠杆的一项。完成后，下面这些都会变得更顺：

- 多用户真实进入
- onboarding 与用户绑定
- discovery 作者身份可信化
- profile 资料归属
- 关系链
- 聊天
