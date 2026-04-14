# SW（Same Wavelength / 同频）后端需求与架构设计文档（MVP / P0 / P1）

> 2026-04-09 确认范围补充：本轮实现按方案 B 执行——完成完整 MVP 后端（onboarding / cards / matching / discovery / profile 全部接口、数据库、seed、e2e），前端仅接入 onboarding / home / discovery / profile 这 4 个页面；chat、微信登录、生产级推荐与审核后台不纳入本轮交付。

## 1. 文档目标

本文档用于给当前微信小程序提供一份**本地优先、可逐步演进**的后端设计基线，帮助后端开发和产品设计明确以下问题：

- 当前产品主流程是什么
- MVP 阶段最小必要业务对象有哪些
- 后端数据应该如何存储
- 当前是否必须使用微信云服务
- PostgreSQL 是否适合作为主数据库
- 用户画像应该如何设计
- 匹配对象的筛选规则如何设计
- MVP、P0、P1 以及最终形态分别做什么

本文档默认技术方向采用：

> **本地优先：Node.js / NestJS（或类似分层框架） + PostgreSQL，后续再接微信能力。**

### 1.1 本轮确认的交付边界（2026-04-09）

本轮不是只做后端骨架，而是要交付一个可联调的 MVP 版本，范围明确如下：

- **后端必须完成**：
  - `POST /api/v1/onboarding/submit`
  - `GET /api/v1/cards/recommend`
  - `POST /api/v1/cards/swipe`
  - `GET /api/v1/matching/trigger-check`
  - `GET /api/v1/discovery/feed`
  - `POST /api/v1/discovery/publish`
  - `GET /api/v1/profile/info`
- **基础设施必须完成**：PostgreSQL schema、Prisma client、seed 数据、测试用户鉴权、核心 e2e 测试、启动文档
- **前端只接入 4 个页面**：
  - `pages/onboarding/onboarding.js`
  - `pages/home/home.js`
  - `pages/discovery/discovery.js`
  - `pages/profile/profile.js`
- **本轮不做**：chat、微信登录、审核后台、生产级推荐系统、云开发迁移

因此，本设计文档中的 MVP 解释，以“**后端完整可用 + 4 个前端页面完成联调**”为准。

---

## 2. 产品定位

SW（同频）是一个以“观点表达”为入口的轻社交微信小程序。

产品核心路径不是“先找人聊天”，而是：

1. 用户先完成轻量画像初始化
2. 用户通过滑动观点卡表达态度
3. 系统基于行为信号做内容推荐与匹配触发
4. 用户在发现页查看更多公共内容
5. 关系建立后进入聊天与个人档案场景

一句话描述：

> 以观点表达为入口，以同频匹配为目标，以聊天和个人档案为承接。

---

## 3. 总体结论（先回答核心问题）

### 3.1 当前后端数据怎么存？

当前阶段建议采用：

- **业务主库：PostgreSQL**
- **后端服务：Node.js / NestJS**
- **本地开发：Docker 启动 PostgreSQL，API 服务本地运行**
- **对象资源（头像/图片）**：MVP 阶段可先存 URL，后续接对象存储

这意味着当前小程序前端只负责调用 HTTP API，真正的业务状态、用户画像、滑卡行为、匹配记录、发现页内容都由你自己的后端服务管理。

---

### 3.2 PostgreSQL 可以用吗？

**可以，而且很适合当前项目。**

PostgreSQL 适合本项目的原因：

1. **关系清晰**：用户、卡片、滑动行为、内容流、匹配关系都天然适合关系型建模。
2. **支持 JSON 字段**：对画像扩展字段、推荐解释、前端兼容结构非常友好。
3. **本地开发成本低**：本地即可跑通，不依赖微信云环境。
4. **便于后期演进**：后续可增加 Redis、ES、消息队列，但主数据仍可稳定放在 PostgreSQL。
5. **适合 MVP 到中期产品**：当前数据规模、查询复杂度、统计需求都在 PostgreSQL 的舒适区间内。

因此，**PostgreSQL 完全可以作为当前项目的主数据库，不仅能用，而且应该优先用。**

---

### 3.3 一定要使用微信云服务吗？

**不一定，也没有必要在 MVP 一开始就绑定微信云服务。**

微信云服务适合以下场景：

- 希望快速接入云函数、云存储、云数据库
- 团队对微信生态部署非常熟悉
- 产品明确长期重度依赖微信云原生能力

但对于当前项目，MVP 阶段更适合采用你自己的后端服务，原因如下：

1. **架构更通用**：以后不只是微信小程序，也能扩展到 H5 / App。
2. **本地联调更直接**：前端 + 本地 API + 本地 PostgreSQL，调试路径清晰。
3. **业务模型更复杂**：画像、匹配、推荐、内容流、聊天，这些都更适合自主后端掌控。
4. **后期迁移成本更低**：先把领域模型和接口设计稳住，再按需接微信登录、订阅消息等能力。

因此本文档结论是：

> **MVP 阶段不要求使用微信云数据库或微信云开发。可以完全采用自建后端 + PostgreSQL。**

后续建议接入微信能力的部分包括：

- 微信登录态绑定（openid / unionid）
- 微信手机号授权
- 模板消息 / 订阅消息
- 小程序码 / 分享链路

---

## 4. 总体技术架构（本地优先）

### 4.1 架构分层

建议采用以下分层：

1. **客户端层**：微信小程序
2. **API 层**：Node.js / NestJS Controller
3. **应用服务层**：Onboarding / Card / Match / Discovery / Profile Service
4. **领域与规则层**：画像计算、盲盒触发、候选筛选、推荐排序
5. **数据访问层**：Repository / ORM
6. **存储层**：PostgreSQL

可抽象为：

```text
WeChat Mini Program
        ↓ HTTPS
Node/NestJS API Service
        ↓
Application Services + Domain Rules
        ↓
PostgreSQL
```

---

### 4.2 推荐的模块拆分

后端建议至少拆成以下模块：

- `auth`：登录态、游客态、后续微信授权绑定
- `users`：用户主体信息
- `onboarding`：引导问卷与初始画像写入
- `cards`：观点卡读取、曝光、滑动行为
- `matching`：盲盒触发、候选人筛选、匹配记录
- `discovery`：内容流、内容发布
- `profile`：个人档案聚合输出
- `analytics`：行为埋点、统计聚合（MVP 可轻量）

### 4.4 本轮实现策略（方案 B）

本轮采用“**模块边界完整保留，但业务规则先做轻量可运行版**”的策略：

1. **保留模块化结构**：`auth / users / onboarding / cards / matching / discovery / profile / prisma / common`
2. **避免过度算法化**：推荐、盲盒、候选人筛选先用规则版实现，保证可运行与可解释
3. **优先联调闭环**：以后端接口真实可用、前端 4 个页面可切换真实 API 为优先目标
4. **为 P1 留出升级位**：后续可以在不破坏接口的前提下替换推荐逻辑、接入微信登录、扩展聊天

该策略的核心原则是：

- 当前要解决的是“**MVP 真跑通**”，而不是“推荐系统做得多聪明”
- 当前后端必须让前端摆脱 mock 数据
- 当前实现必须可测试、可 seed、可本地启动、可继续演进

---

### 4.3 MVP 部署建议

本地开发阶段建议：

- 小程序：微信开发者工具运行
- API：本地 `localhost` 运行
- PostgreSQL：Docker 容器运行
- 管理工具：DBeaver / TablePlus / pgAdmin

一个典型本地启动方式可以是：

```text
Mini Program DevTools  ->  http://localhost:3000/api/v1/*
NestJS API             ->  localhost:3000
PostgreSQL             ->  localhost:5432
```

注意：微信小程序真机调试时，后续需处理合法域名、内网穿透或测试环境部署问题；但这不影响你先在本地完成后端建模和联调。

---

## 5. 当前产品主流程

### 5.1 流程总览

MVP 阶段用户主路径如下：

1. 首次进入小程序
2. 完成 3 题 onboarding 引导
3. 进入首页浏览观点卡
4. 对卡片执行左滑 / 右滑 / 上滑
5. 系统记录行为并在满足条件时检查盲盒触发
6. 用户切换到 Discovery 浏览公共内容流
7. 用户查看 Profile，未来在匹配后进入 Chat

---

### 5.2 阶段 A：Onboarding（新用户引导）

#### 功能目标

用户首次进入产品时，通过 3 道快速问题建立基础画像，用于后续推荐和匹配。

#### 当前前端行为

- 页面：`pages/onboarding/onboarding`
- 题目数量：3 题
- 操作：左滑、右滑、跳过、回退
- 最后一题完成后跳转首页

#### 后端职责

- 接收 onboarding 答案
- 保存用户的基础标签或基础画像
- 标记用户已完成初始化
- 为后续推荐系统提供初始输入

#### 业务规则

- 每个用户只需完成一次初始化流程
- 允许题目跳过，跳过题不应阻断用户进入首页
- onboarding 提交成功后，用户状态变为“已完成引导”

#### 成功结果

- 用户完成初始化画像
- 后端可基于画像为首页生成初步推荐内容

---

### 5.3 阶段 B：Home（首页观点卡交互）

#### 功能目标

首页是产品核心互动区。用户通过对观点卡片进行滑动表态，持续向系统提供偏好信号。

#### 当前前端行为

- 页面：`pages/home/home`
- 当前数据源：前端 `MOCK_CARDS`
- 操作：
  - 右滑：认同
  - 左滑：不认同
  - 上滑：跳过
- 每次滑动后切下一张卡
- 首页同时展示观点作者、标签、认同比例、参与头像

#### 后端职责

- 返回推荐观点卡列表或当前卡片
- 接收并记录用户对卡片的行为
- 维护会话内有效交互次数
- 为后续盲盒匹配触发提供依据

#### 业务规则

- `agree` 表示认同
- `disagree` 表示不认同
- `skip` 表示跳过
- 上滑跳过应被记录，但应与“有效偏好行为”区分统计
- 同一张卡片的曝光与滑动行为应具备可追踪性

#### 成功结果

- 后端持续积累用户兴趣和价值观偏好信号
- 用户可无感知地持续浏览下一张观点卡

---

### 5.4 阶段 C：Blind Box Trigger（盲盒触发）

#### 功能目标

在用户完成一定量有效互动后，为其提供一次可能的“同频匹配”触发机会，作为互动奖励。

#### 当前前端行为

- 条件示意：
  - 本次会话滑动次数 >= 3
  - 在线时长 > 30 秒
- 满足条件后调用盲盒触发检查接口

#### 后端职责

- 判断当前会话是否满足盲盒触发条件
- 如果满足，返回一个匹配候选用户
- 如果不满足，返回不触发结果

#### 业务规则

- 盲盒触发是奖励机制，不是主入口
- 不要求每次条件达成都一定命中匹配对象
- MVP 阶段匹配规则可以简单化，但必须可解释

#### 成功结果

- 用户在高参与状态下获得一次潜在“连接”机会

---

### 5.5 阶段 D：Discovery（发现 / 真心话广场）

#### 功能目标

为用户提供开放内容场景，使用户除了首页推荐卡片之外，还能浏览平台公共内容流。

#### 当前前端行为

- 页面：`pages/discovery/discovery`
- 内容类型规划：
  - `featured`：热门投票 / 热门观点
  - `timeline`：时间线 / 树洞内容
- 当前只有基础页面与发布入口占位

#### 后端职责

- 提供 feed 列表接口
- 根据 tab 和 feedType 返回不同内容
- 接收用户发布的新观点内容

#### 业务规则

- feed 至少支持分类维度：
  - 全部
  - 内心世界
  - 旅行与探索
  - 价值观
  - 社会观察
- 发布内容必须归属某一分类
- MVP 阶段可先不实现复杂审核流，但应保留状态字段

#### 成功结果

- 用户能从“被推荐”扩展到“主动探索公共内容”

---

### 5.6 阶段 E：Profile（我的档案）

#### 功能目标

展示用户画像与统计信息，作为个人身份、兴趣标签和运营承载页。

#### 当前前端行为

- 页面：`pages/profile/profile`
- 当前为静态 mock 信息
- 文档规划包含昵称、MBTI、签名、统计数据、照片等

#### 后端职责

- 返回用户档案基本信息
- 返回用户的展示型标签和统计数据
- 支持前端渲染照片、签名、MBTI、交互数等

#### 成功结果

- 用户可查看“我是谁”以及“我在产品中的互动状态”

---

### 5.7 阶段 F：Chat（小纸条）

#### 功能目标

承接用户建立连接后的私信会话场景。

#### 当前状态

- 页面：`pages/chat/chat`
- 当前没有真实消息逻辑
- 已具备页面入口定位

#### 后端定位

MVP 第一阶段可暂不实现完整聊天系统，但应在业务设计中保留其定位：

- 聊天不是起点，而是关系建立后的承接场景
- 聊天会话应来源于匹配或未来的关注 / 主动发起行为

---

## 6. 领域模型（MVP 核心）

本节定义后端在 MVP 阶段需要关注的最小业务对象。

### 6.1 User

表示平台用户的主体身份。

核心字段建议：

- `userId`
- `nickname`
- `avatar`
- `gender`
- `ageRange`
- `relationshipStatus`
- `mbti`（可为空）
- `signature`
- `createdAt`
- `onboardingCompleted`

---

### 6.2 OnboardingAnswer

表示用户在引导阶段提交的答案。

核心字段建议：

- `userId`
- `questionId`
- `selected`
- `submittedAt`

用途：

- 形成用户初始画像
- 作为推荐和匹配的基础输入

---

### 6.3 UserProfileTag

表示从 onboarding 或用户行为中沉淀出的标签。

核心字段建议：

- `userId`
- `tagType`
- `tagValue`
- `source`（onboarding / behavior / system）
- `weight`

用途：

- 用于推荐排序
- 用于匹配筛选

---

### 6.4 Card

表示首页供用户滑动表态的观点卡。

核心字段建议：

- `cardId`
- `content`
- `category`
- `authorUserId`
- `status`
- `agreeCount`
- `disagreeCount`
- `createdAt`

用途：

- 首页推荐内容载体
- 用户偏好信号采集入口

---

### 6.5 SwipeAction

表示用户对某张卡片产生的一次行为记录。

核心字段建议：

- `userId`
- `cardId`
- `action`（agree / disagree / skip）
- `sessionId`
- `timestamp`

用途：

- 沉淀行为数据
- 统计会话活跃度
- 驱动推荐、盲盒和画像更新

---

### 6.6 SessionActivity

表示用户一次进入首页后的会话级行为统计。

核心字段建议：

- `sessionId`
- `userId`
- `entryTime`
- `validSwipeCount`
- `skipCount`
- `durationSeconds`
- `blindBoxChecked`

用途：

- 判断是否满足盲盒触发条件
- 支撑埋点与活跃度统计

---

### 6.7 MatchCandidate

表示系统在盲盒触发场景下返回的候选匹配对象。

核心字段建议：

- `userId`
- `nickname`
- `avatar`
- `matchReason`
- `matchScore`（MVP 可选）

用途：

- 向前端返回匹配结果
- 作为未来聊天关系的来源

---

### 6.8 DiscoveryFeedItem

表示发现页内容流中的一条内容。

核心字段建议：

- `feedId`
- `type`（featured / timeline）
- `category`
- `title`
- `content`
- `authorUserId`
- `stats`
- `createdAt`
- `status`

用途：

- 支撑发现页公共内容流
- 支持热门观点与时间线内容展示

---

### 6.9 ProfileSnapshot

表示用户档案展示时需要返回的聚合视图。

核心字段建议：

- `userId`
- `nickname`
- `gender`
- `age`
- `mbti`
- `signature`
- `photos`
- `counts.visitors`
- `counts.followers`
- `counts.following`
- `counts.interactions`

用途：

- 提供 profile 页面完整展示数据

---

## 7. 领域关系说明

- `User` 提交多个 `OnboardingAnswer`
- `OnboardingAnswer` 与用户画像一起沉淀为 `UserProfileTag`
- `User` 浏览多个 `Card`
- `User` 对 `Card` 产生多个 `SwipeAction`
- 多个 `SwipeAction` 聚合到一个 `SessionActivity`
- `SessionActivity` 可触发一次 `MatchCandidate` 检查
- `DiscoveryFeedItem` 可以来自平台内容池或用户发布内容
- `ProfileSnapshot` 是 `User` 及其统计信息的聚合输出

---

## 8. 用户画像设计

用户画像不应只理解为“静态注册资料”，而应分成至少三层：

1. **静态画像**：用户自己填的基础属性
2. **行为画像**：用户在产品中的真实偏好行为
3. **关系画像**：用户与谁更容易形成连接（P1 以后逐步增强）

---

### 8.1 静态画像（MVP 必做）

来源：

- onboarding 三题
- 用户主动填写的基础资料

建议存储维度：

- 性别 `gender`
- 年龄段 `age_range`
- 感情状态 `relationship_status`
- 昵称 `nickname`
- 头像 `avatar_url`
- 个性签名 `signature`
- MBTI（可空）`mbti`
- 城市 / 地区（可空，P1 更有价值）

这些字段主要用于：

- 首页推荐的基础过滤
- 盲盒匹配的初筛
- Profile 展示

---

### 8.2 行为画像（MVP 必做）

来源：

- 卡片曝光
- agree / disagree / skip
- tab 切换偏好
- discovery 浏览与发布

建议沉淀的行为维度：

- 分类偏好：更常停留/更常认同的主题分类
- 观点取向：对某些态度类内容整体偏正向还是负向
- 活跃节奏：活跃天数、会话时长、单次刷卡量
- 参与强度：有效滑动率、跳过率、发布率
- 内容表达倾向：更喜欢发布树洞、观点、投票型内容

这些字段不一定全部实时存在 `users` 表里，很多适合：

- 原始记录落行为表
- 聚合结果进入画像快照表 / 标签表

---

### 8.3 关系画像（P1 起增强）

来源：

- 匹配命中记录
- 匹配后是否进入聊天
- 聊天是否持续
- 是否互相关注 / 收藏 / 再次互动

建议沉淀的关系维度：

- 容易匹配到哪类人
- 哪类人群的匹配成功率更高
- 哪些话题更容易触发连接
- 匹配后关系持续时长

这部分在 MVP 不必做复杂算法，但设计上应留口。

---

### 8.4 用户画像落库建议

建议不要把所有画像都塞进 `users` 一张表，而应采用：

- `users`：主体基础字段
- `onboarding_answers`：原始答卷
- `user_profile_tags`：标签化结果
- `user_profile_snapshots`：聚合画像快照（可选，MVP 也可以先不单独建）

这样做的好处：

- 原始数据与聚合数据分层
- 便于后续重算画像
- 便于调整推荐与匹配规则

---

## 9. 匹配对象筛选规则设计

### 9.1 设计原则

当前产品里的“盲盒匹配”不是即时婚恋匹配，也不是强精准推荐，而是：

- 在高参与状态下给用户一个“值得连接的人”
- 规则必须足够轻量
- 结果必须大致合理
- 原因必须可解释

因此 MVP 阶段不要做黑盒算法，而应做**可解释、可逐步优化**的规则系统。

---

### 9.2 MVP 阶段匹配规则

建议使用“四段式筛选”：

#### 第一步：基础过滤

过滤掉不应被匹配的人：

- 自己本人
- 已经在短期内匹配过的人
- 被禁用 / 注销 / 不活跃账号
- 未完成 onboarding 的用户
- 不满足最基本资料条件的用户

#### 第二步：可连接性过滤

优先选择当前可产生连接的人：

- 最近活跃用户优先
- 最近 24 小时有浏览/滑卡/发布行为的用户优先
- 有头像、昵称、基础资料完整的用户优先

#### 第三步：同频度粗排

MVP 可使用简单评分：

- onboarding 标签相近：+30
- 常认同的主题分类重合：+25
- 最近行为取向接近：+20
- 活跃时段接近：+10
- 内容表达强度接近：+10
- 随机探索因子：+5

最终得到一个 `match_score`，选 Top N 候选。

#### 第四步：结果解释生成

返回时带上 `matchReason`，例如：

- “你们都更关注价值观类话题”
- “你们最近都频繁认同内心世界相关观点”
- “你们的基础标签较接近，且活跃时间段相似”

这样前端展示会更自然，也方便产品以后优化。

---

### 9.3 P1 阶段匹配规则增强

P1 可以增加：

- 更细粒度标签权重
- 相似度向量计算
- 匹配成功率反馈回流
- 排除低质量候选人
- 多样性控制（避免总是同一类人）

---

### 9.4 长期目标匹配规则

最终可演进为：

- 规则系统 + 统计学习的混合模式
- 基于互动结果进行闭环优化
- 将“匹配是否进入聊天、聊天是否持续、是否再次互动”纳入模型反馈

但这不属于当前 MVP 必做范围。

---

## 10. 数据表草案（PostgreSQL）

以下为适合当前项目的首版数据表设计方向。MVP 不要求一次性全部建满，但建议结构先想清楚。

---

### 10.1 `users`

用户主表。

建议字段：

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | bigserial pk | 用户 ID |
| `wechat_openid` | varchar(64) null | 后续接微信登录 |
| `wechat_unionid` | varchar(64) null | 后续接微信生态 |
| `nickname` | varchar(64) | 昵称 |
| `avatar_url` | text null | 头像 |
| `gender` | varchar(16) null | 性别 |
| `age_range` | varchar(32) null | 年龄段 |
| `relationship_status` | varchar(32) null | 感情状态 |
| `mbti` | varchar(16) null | MBTI |
| `signature` | varchar(255) null | 个性签名 |
| `city` | varchar(64) null | 城市 |
| `onboarding_completed` | boolean default false | 是否完成引导 |
| `status` | varchar(16) default 'active' | 用户状态 |
| `created_at` | timestamptz | 创建时间 |
| `updated_at` | timestamptz | 更新时间 |

---

### 10.2 `onboarding_answers`

保存用户原始答卷。

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | bigserial pk | 主键 |
| `user_id` | bigint | 用户 ID |
| `question_id` | int | 题目 ID |
| `selected_value` | varchar(64) null | 用户选择 |
| `is_skipped` | boolean default false | 是否跳过 |
| `submitted_at` | timestamptz | 提交时间 |

建议唯一约束：

- `unique(user_id, question_id)`

---

### 10.3 `user_profile_tags`

用户标签表，用于画像、推荐、匹配。

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | bigserial pk | 主键 |
| `user_id` | bigint | 用户 ID |
| `tag_type` | varchar(32) | 标签类型 |
| `tag_key` | varchar(64) | 标签键 |
| `tag_value` | varchar(128) | 标签值 |
| `weight` | numeric(8,2) default 1 | 权重 |
| `source` | varchar(16) | 来源：onboarding / behavior / system |
| `updated_at` | timestamptz | 更新时间 |

示例：

- `tag_type=topic_preference`, `tag_value=values`
- `tag_type=viewpoint_style`, `tag_value=empathetic`

---

### 10.4 `cards`

首页观点卡主表。

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | bigserial pk | 卡片 ID |
| `author_user_id` | bigint null | 作者 ID，可为空表示平台卡 |
| `source_type` | varchar(16) | platform / user |
| `category` | varchar(32) | 分类 |
| `content` | text | 卡片内容 |
| `status` | varchar(16) | draft / active / hidden |
| `agree_count` | int default 0 | 认同数 |
| `disagree_count` | int default 0 | 不认同数 |
| `skip_count` | int default 0 | 跳过数 |
| `exposure_count` | int default 0 | 曝光数 |
| `created_at` | timestamptz | 创建时间 |
| `updated_at` | timestamptz | 更新时间 |

---

### 10.5 `card_exposures`

卡片曝光记录表。

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | bigserial pk | 主键 |
| `user_id` | bigint | 浏览用户 |
| `card_id` | bigint | 卡片 |
| `session_id` | varchar(64) | 会话 ID |
| `position_index` | int null | 列表/队列位置 |
| `exposed_at` | timestamptz | 曝光时间 |

说明：

- 严格来说，推荐系统最好把“曝光”和“滑动”分开记录。
- MVP 若希望先简化，也可以先只做 `card_swipes`，但推荐长期保留曝光表。

---

### 10.6 `card_swipes`

卡片滑动行为表。

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | bigserial pk | 主键 |
| `user_id` | bigint | 用户 |
| `card_id` | bigint | 卡片 |
| `session_id` | varchar(64) | 会话 ID |
| `action` | varchar(16) | agree / disagree / skip |
| `source_tab` | varchar(32) null | 当前 tab |
| `swiped_at` | timestamptz | 行为时间 |

推荐索引：

- `(user_id, swiped_at desc)`
- `(card_id, swiped_at desc)`
- `(session_id)`

---

### 10.7 `user_sessions`

用户会话统计表。

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | bigserial pk | 主键 |
| `session_id` | varchar(64) unique | 会话 ID |
| `user_id` | bigint | 用户 |
| `entry_page` | varchar(32) | 入口页 |
| `entered_at` | timestamptz | 进入时间 |
| `last_active_at` | timestamptz | 最近活跃时间 |
| `valid_swipe_count` | int default 0 | 有效滑动数 |
| `skip_count` | int default 0 | 跳过数 |
| `blind_box_checked` | boolean default false | 是否已检查 |
| `blind_box_triggered` | boolean default false | 是否已触发 |

---

### 10.8 `match_events`

盲盒匹配事件表。

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | bigserial pk | 主键 |
| `user_id` | bigint | 发起触发的用户 |
| `candidate_user_id` | bigint null | 候选用户 |
| `session_id` | varchar(64) | 会话 ID |
| `trigger_reason` | varchar(128) | 触发原因 |
| `match_score` | numeric(8,2) null | 匹配分 |
| `result_status` | varchar(16) | no_match / matched / expired |
| `created_at` | timestamptz | 创建时间 |

用途：

- 记录盲盒是否触发
- 支撑后续匹配效果分析

---

### 10.9 `discovery_posts`

发现页内容表。

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | bigserial pk | 主键 |
| `author_user_id` | bigint | 作者 |
| `post_type` | varchar(16) | featured / timeline |
| `category` | varchar(32) | 分类 |
| `title` | varchar(255) null | 标题 |
| `content` | text | 内容 |
| `anonymous` | boolean default false | 是否匿名 |
| `status` | varchar(16) | draft / published / hidden |
| `like_count` | int default 0 | 点赞数 |
| `comment_count` | int default 0 | 评论数 |
| `created_at` | timestamptz | 创建时间 |
| `updated_at` | timestamptz | 更新时间 |

---

### 10.10 `user_photos`

用户照片表。

| 字段 | 类型 | 说明 |
|---|---|---|
| `id` | bigserial pk | 主键 |
| `user_id` | bigint | 用户 |
| `photo_url` | text | 图片地址 |
| `sort_order` | int default 0 | 排序 |
| `status` | varchar(16) default 'active' | 状态 |
| `created_at` | timestamptz | 创建时间 |

---

## 11. MVP API 清单

以下接口为当前 MVP 最优先支持接口，且均已在现有前端文档或页面逻辑中出现。

### 11.1 POST `/api/v1/onboarding/submit`

#### 用途

提交 onboarding 的 3 题答案，建立用户基础画像。

#### Request Body

```json
{
  "answers": [
    { "questionId": 1, "selected": "female" },
    { "questionId": 2, "selected": "gen-z" },
    { "questionId": 3, "selected": "single" }
  ]
}
```

#### Response

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "onboardingCompleted": true
  }
}
```

#### 业务规则

- 允许少量题目为空或被跳过
- 成功提交后更新用户 onboarding 状态
- 重复提交时以最后一次结果覆盖，或限制重复提交，MVP 需二选一并固定

#### 前端调用位置

- `pages/onboarding/onboarding.js` → `animateSwipe()` 最后一题完成时

---

### 11.2 GET `/api/v1/cards/recommend`

#### 用途

获取首页推荐观点卡片。

#### Query Params

- `limit`
- `cursor`
- `category`（可选，映射首页 tab）

#### Response

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "cursor": "next_cursor_token",
    "items": [
      {
        "cardId": 1001,
        "content": "坚定地认为《虎胆龙威》是一部圣诞电影。",
        "tags": "态度 · 幽默",
        "user": {
          "userId": 201,
          "name": "SOFIA",
          "avatar": "https://..."
        },
        "stats": {
          "agreePercent": 65,
          "agreeAvatars": ["https://..."],
          "disagreeAvatar": "https://..."
        }
      }
    ]
  }
}
```

#### 业务规则

- 优先根据用户画像和近期行为做推荐
- MVP 阶段允许先使用简单排序策略
- 返回结构需兼容现有前端卡片渲染字段

#### 前端调用位置

- `pages/home/home.js` → `loadNextCard()`

---

### 11.3 POST `/api/v1/cards/swipe`

#### 用途

上报用户对卡片的一次滑动行为。

#### Request Body

```json
{
  "cardId": 1001,
  "action": "agree",
  "timestamp": 1743600000000
}
```

#### Response

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "recorded": true,
    "sessionSwipeCount": 3
  }
}
```

#### 业务规则

- `action` 允许值：`agree` / `disagree` / `skip`
- 后端需记录行为并更新会话计数
- `agree`、`disagree` 视为有效偏好行为；`skip` 可单独统计

#### 前端调用位置

- `pages/home/home.js` → `recordSwipe(direction)`

---

### 11.4 POST `/api/v1/blind-box/trigger-check`

#### 用途

检查当前会话是否应触发盲盒匹配。

#### Request Body

```json
{
  "sessionSwipeCount": 3,
  "sessionDuration": 45
}
```

#### Response

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "shouldTrigger": true,
    "matchUser": {
      "userId": 302,
      "name": "MARCUS",
      "avatar": "https://..."
    }
  }
}
```

#### 业务规则

- 后端以会话行为和时长判断是否触发
- 即使满足阈值，也允许返回 `shouldTrigger = false`
- 当触发成功时，应避免短时间内重复触发

#### 前端调用位置

- `pages/home/home.js` → `checkBlindBoxTrigger()`

---

### 11.5 GET `/api/v1/discovery/feed`

#### 用途

获取发现页内容流。

#### Query Params

- `tabType`
- `feedType`
- `cursor`

#### Response

兼容 `featured` 与 `timeline` 两种内容结构。

#### 业务规则

- 至少支持 tab 分类筛选
- 至少支持 featured / timeline 两种流
- MVP 阶段允许先返回 mock 风格的统一结构

#### 前端调用位置

- `pages/discovery/discovery.js` → `onLoad()` / tab 切换时

---

### 11.6 POST `/api/v1/discovery/publish`

#### 用途

用户在发现页发布一条新观点或内容。

#### Request Body

```json
{
  "content": "观点文本",
  "tabType": "values",
  "anonymous": false
}
```

#### Response

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "feedId": 502,
    "status": "published"
  }
}
```

#### 业务规则

- 内容必须归属某一分类
- 应保留匿名发布能力字段
- MVP 阶段可默认直接发布，但需保留内容状态位

#### 前端调用位置

- `pages/discovery/discovery.js` → `openPublish()`

---

### 11.7 GET `/api/v1/profile/info`

#### 用途

获取当前用户个人档案展示信息。

#### Response

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "userId": 8801,
    "nickname": "林深处的麋鹿",
    "gender": "female",
    "age": 24,
    "mbti": "INFJ-T",
    "signature": "在喧嚣的世界寻找同频的声音...",
    "counts": {
      "visitors": 1200,
      "followers": 458,
      "following": 89,
      "interactions": 2400
    },
    "photos": ["https://...", "https://..."]
  }
}
```

#### 业务规则

- 返回 Profile 页面展示所需的聚合数据
- 统计值允许先采用简化计算或 mock 数据回填

#### 前端调用位置

- `pages/profile/profile.js` → `onLoad()`

---

## 12. 阶段路线图：MVP / P0 / P1 / 最终形态

这里将“当前只做 MVP”与“架构必须想清楚”结合起来描述。

---

### 12.1 MVP 版本：先打通最小主链路

MVP 的目标不是把社交系统全部做完，而是验证这条链路是否成立：

> 新用户初始化画像 → 刷观点卡表达态度 → 系统记录偏好 → 在合适时机给出连接机会。

MVP 应完成：

- 用户基础身份建立
- onboarding 答卷入库
- 首页卡片读取
- 滑卡行为上报
- 会话统计与盲盒触发检查
- 发现页基础 feed
- Profile 基础信息展示

MVP 不做或暂缓：

- 完整聊天系统
- 高级推荐算法
- 复杂关系链
- 审核后台
- 风控体系

---

### 12.2 P0：必须先做的后端能力

P0 是“后端第一阶段上线所必须具备”的能力。

#### P0 功能范围

1. 用户主表与游客态/测试态账号方案
2. onboarding 提交接口与答卷落库
3. 首页推荐卡接口（允许简单排序）
4. 滑卡行为记录接口
5. 会话统计与盲盒触发接口
6. discovery feed 查询接口
7. profile 聚合查询接口

#### P0 技术范围

1. Node/NestJS 服务骨架
2. PostgreSQL 建库建表
3. 基础鉴权方案（先用测试 token / mock user）
4. 统一错误码与日志
5. 基础数据库索引

#### P0 交付标准

- 前端可去掉主要 mock 数据
- 核心链路可完整联调
- 数据可真实落库
- 能支持内部测试

---

### 12.3 P1：第一版迭代

P1 的目标不是重写，而是在 P0 跑通基础上，提升“质量”和“可持续性”。

#### P1 功能增强

1. 接入微信登录 / openid 绑定
2. 用户资料编辑
3. 更完整的 Profile 数据
4. 发现页发布能力正式化
5. 匹配规则增强与解释优化
6. 基础关系链（如匹配记录、连接状态）
7. 聊天能力预留或轻量上线

#### P1 数据与系统增强

1. 画像标签自动聚合
2. 曝光/滑动拆分统计
3. 更稳定的推荐候选池机制
4. 内容状态流转（published / hidden / review）
5. 基础运营字段和审计字段

#### P1 目标

- 提高推荐与匹配的合理性
- 提高用户资料与内容系统完整度
- 为聊天与更强社交关系打基础

---

### 12.4 最终形态（长期目标）

最终 SW 应演进为一个围绕“观点表达与同频连接”的轻社交系统。

长期可能包含：

- 更完整的个体画像系统
- 更强的匹配策略与推荐引擎
- 正式聊天系统
- 关系链系统（关注、收藏、拉黑、举报）
- 内容审核与运营后台
- 微信生态能力深度接入
- 多端化（小程序 + H5 + App）

最终系统形态应是：

> 内容表达、偏好理解、关系发现、连接承接、长期互动，形成闭环。

---

## 13. 建议的后端实现优先级

建议后端开发顺序如下：

1. 用户身份与 onboarding 提交
2. 首页卡片推荐接口
3. 滑动行为记录接口
4. 盲盒触发检查接口
5. Profile 信息接口
6. Discovery feed 接口
7. Discovery 发布接口

这样可以优先打通核心主链路：

> 新用户进入 → 完成引导 → 首页刷卡 → 上报行为 → 触发匹配检查

---

## 14. MVP 范围边界

### 14.1 本阶段要做

- 用户 onboarding 数据入库
- 首页推荐卡片读取
- 滑动行为记录
- 盲盒触发检查
- 发现页 feed 获取与简单发布
- Profile 信息读取

### 14.2 本阶段不做或暂缓

- 完整即时聊天系统
- 复杂推荐算法
- 完整关系链（关注、拉黑、举报）
- 内容审核后台
- 复杂风控与反作弊
- Premium 商业化能力

---

## 15. 验收标准（MVP 级）

当后端完成以下目标时，可认为 MVP 核心链路可联调：

- 用户能提交 onboarding 并成功进入首页
- 首页能从后端获取可渲染的卡片数据
- 用户每次滑卡都能成功上报行为
- 后端能根据会话条件返回盲盒触发结果
- Discovery 能成功拉取内容流
- Profile 能成功返回档案信息
- PostgreSQL 中能够查询到关键业务数据落库结果

---

## 16. 待确认问题（进入实现前建议定稿）

以下问题不影响本文档成立，但建议在正式开始数据库建模和接口开发前确认：

1. 首页卡片内容来源是平台内容池，还是允许用户发布内容进入推荐池？
2. onboarding 是否允许重复提交覆盖？
3. 盲盒触发后，是只展示一次候选，还是允许用户做接受/忽略？
4. P1 的聊天是否一定基于匹配成功后开启？
5. discovery 的 `featured` 与 `timeline` 是否最终统一为一套内容主表？
6. 画像标签更新是实时写入，还是定时聚合？

---

## 17. 最终建议（给当前项目的明确结论）

如果你现在要开始写这个小程序的后端，建议按下面这条路线直接开工：

1. **先用 Node/NestJS + PostgreSQL 在本地搭起来**
2. **先实现 P0 的 6~7 个核心接口，不要先碰聊天系统**
3. **先把用户、答卷、卡片、滑动、会话、匹配事件、发现内容这几类表设计清楚**
4. **先做规则型匹配，不做复杂算法**
5. **微信能力放到 P1 接入，不阻塞 MVP 联调**

也就是说，当前最合理的路线不是：

> 先选微信云开发再说

而是：

> **先把产品主链路、业务模型、数据库结构和 API 跑通；微信能力后接。**

这条路线最符合当前项目阶段，也最利于你本地快速启动。