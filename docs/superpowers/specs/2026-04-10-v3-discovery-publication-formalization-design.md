# SW V3 Discovery Publication Formalization Design

## 1. 目标

V3 这一阶段的目标，是把当前“能发布一条内容”的 Discovery 能力，升级为一个具备基础内容生命周期的本地可联调版本。

这次不追求审核后台、评论系统或云存储，而是先把以下问题做扎实：

- 内容发布不再只有一种“直接 published”状态
- feed 只展示真正应该被公开展示的内容
- 用户能看到自己发过的内容及其状态
- 后端状态语义和前端展示语义对齐

一句话目标：

> 让 Discovery 从“可发内容”升级为“有状态、有归属、有最小管理能力”的内容系统。

---

## 2. 范围

### 2.1 本阶段要做

后端新增或扩展：

- 扩展 `discovery_posts.status` 的使用语义
- 扩展 `POST /api/v1/discovery/publish`
- 新增 `GET /api/v1/discovery/my-posts`
- 扩展 `GET /api/v1/discovery/feed`
- 为 Discovery 返回更明确的作者与状态字段

前端新增或扩展：

- Discovery 发布时支持“存草稿”与“提交发布”
- Discovery 页面增加“我的发布”入口
- 我的发布列表支持查看不同状态内容
- 已发布内容和草稿内容在前端有不同展示文案

数据层：

- 继续使用 `discovery_posts`
- 不新增后台审核表
- 不新增评论表

---

### 2.2 本阶段不做

- 审核后台页面
- 评论系统
- 点赞交互
- 云存储图片上传
- 内容举报
- 推荐池联动
- 编辑历史版本

---

## 3. 设计原则

### 3.1 本地联调优先

这次仍然以“前端页面能点通、后端状态能回写、数据库能落库”为第一目标，不引入需要额外平台依赖的能力。

### 3.2 状态先清晰，再谈复杂流程

当前 Discovery 最大的问题不是功能少，而是状态语义太单一。V3 先把状态建清楚，再为后续审核流和内容管理留口。

### 3.3 保持单表演进

V3 继续让 `discovery_posts` 承担主内容表职责，不拆出额外工作流表，避免本阶段范围膨胀。

### 3.4 用户侧体验优先于运营后台

这次优先补用户真正能感知的能力：发布、看见状态、管理自己的内容。运营后台留到后续阶段。

---

## 4. 状态模型设计

### 4.1 状态定义

`discovery_posts.status` 在 V3 统一定义为：

- `draft`
- `review`
- `published`
- `hidden`

### 4.2 状态含义

- `draft`
  用户保存但尚未公开的内容，只能自己看到

- `review`
  用户点击“提交发布”后进入待审核态。因为当前没有审核后台，本地联调版本可以选择直接转 `published`，也可以保留为 `review` 用于前端展示

- `published`
  可进入公共 feed 的内容

- `hidden`
  已下线或被系统隐藏的内容，不在公共 feed 展示

### 4.3 本阶段落地规则

为了保证本地联调流畅，V3 采用这条明确规则：

- “存草稿” -> `draft`
- “提交发布” -> 直接写成 `published`
- `review` 状态先作为结构预留，不在本阶段默认产出
- `feed` 只返回 `published`
- `my-posts` 返回当前用户自己的 `draft / published / hidden`

这个决定的理由是：

- 保留未来审核流的状态位
- 又不让当前本地联调被“没有审核后台”卡住

---

## 5. API 设计

### 5.1 POST `/api/v1/discovery/publish`

用途：

- 创建一条 Discovery 内容
- 支持“存草稿”与“提交发布”两种动作

请求体建议扩展为：

```json
{
  "content": "观点文本",
  "tabType": "价值观",
  "anonymous": false,
  "action": "publish"
}
```

`action` 允许值：

- `draft`
- `publish`

返回：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "feedId": "502",
    "status": "published"
  }
}
```

规则：

- `action = draft` 时，落库状态为 `draft`
- `action = publish` 时，落库状态为 `published`
- `tabType` 仍必须归属既有分类
- `content` 不能为空，并保留长度限制

---

### 5.2 GET `/api/v1/discovery/feed`

用途：

- 获取 Discovery 公共内容流

V3 行为调整：

- 只返回 `status = published`
- 继续支持 `tabType`
- 继续支持 `feedType`

响应建议新增 `status` 字段，便于前端统一结构：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "cursor": null,
    "items": [
      {
        "feedId": "501",
        "type": "featured",
        "category": "价值观",
        "title": "关于成熟",
        "content": "我更认同先理解后表达。",
        "status": "published",
        "author": {
          "userId": "1",
          "nickname": "SOFIA",
          "avatar": "https://example.com/avatar.jpg"
        },
        "stats": {
          "likeCount": 0,
          "commentCount": 0
        },
        "createdAt": "2026-04-10T00:00:00.000Z"
      }
    ]
  }
}
```

---

### 5.3 GET `/api/v1/discovery/my-posts`

用途：

- 获取当前用户自己的发布记录

Query 参数建议：

- `status` 可选
- `cursor` 可选，V3 可以先不做真实翻页

响应：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "items": [
      {
        "feedId": "601",
        "type": "timeline",
        "category": "内心世界",
        "content": "今晚也想把话说给风听。",
        "status": "draft",
        "anonymous": false,
        "createdAt": "2026-04-10T00:00:00.000Z"
      }
    ]
  }
}
```

规则：

- 仅返回当前用户自己的内容
- 默认按 `createdAt desc`
- 若传 `status`，只返回指定状态

---

## 6. 后端设计

### 6.1 `discovery` 模块职责扩展

继续沿用当前 `discovery` 模块，新增以下职责：

- 发布动作与状态映射
- 用户个人发布列表查询
- 公共 feed 的状态过滤

### 6.2 DTO 设计

建议新增或扩展：

- 扩展 `publish-post.dto.ts`
- 新增 `get-my-posts.dto.ts`

`PublishPostDto` 新增：

- `action`

`GetMyPostsDto` 包含：

- `status`

### 6.3 Service 设计

`DiscoveryService` 建议保留并扩展为：

- `getFeed(dto)`
- `publish(userId, dto)`
- `getMyPosts(userId, dto)`

其中 `publish()` 内部统一做状态映射：

- `draft` -> `draft`
- `publish` -> `published`

---

## 7. 前端设计

### 7.1 Discovery 页面扩展

当前 `pages/discovery/discovery` 已具备公共 feed 展示与发布入口。

V3 在这个页面上新增：

- 发布弹窗或发布动作的二选一按钮
- “我的发布”入口
- 从公共 feed 和个人内容管理两个视角切换

### 7.2 我的发布展示

本阶段建议做最小可用版：

- 通过一个轻量弹层、切页，或页面内区块展示“我的发布”
- 每条记录展示：
  - 内容摘要
  - 分类
  - 状态
  - 创建时间

推荐实现方式：

- 先在 Discovery 页内增加“我的发布”区块或二级视图
- 不新增复杂页面栈，减少改动范围

### 7.3 发布动作交互

发布时不再只有一个“发布”动作，而是：

- `保存草稿`
- `立即发布`

本阶段可以继续用轻量 modal，但如果现有 `showModal editable` 不方便承载双动作，就应升级为页面内自定义发布面板。

推荐做法：

- 从系统 `showModal` 升级为自定义简易发布面板
- 这样可以稳定承载：
  - 文本输入
  - 分类回显
  - 草稿 / 发布两个按钮

---

## 8. 数据与 Seed 设计

### 8.1 Seed 调整

种子数据建议补充：

- 至少 1 条 `draft`
- 至少 1 条 `hidden`
- 保留若干 `published`

这样可以保证：

- `feed` 的状态过滤能被测试覆盖
- `my-posts` 能展示不同状态

### 8.2 兼容性要求

V3 不改动 `discovery_posts` 基础字段结构，只强化状态值和读取方式。

因此：

- 不需要 Prisma migration 改 schema 字段
- 只需要 seed、service、DTO、测试同步升级

---

## 9. 测试与验证设计

### 9.1 后端 e2e

应新增或补充覆盖：

- `publish` with `action = draft`
- `publish` with `action = publish`
- `feed` 不返回 `draft / hidden`
- `my-posts` 返回当前用户自己的内容
- `my-posts?status=draft` 过滤正确

### 9.2 前端联调

应验证：

- Discovery 页面正常加载公共内容
- 草稿内容不会出现在公共 feed
- 用户可以保存草稿
- 用户可以立即发布
- 用户可以看到自己的发布列表
- 状态文案展示正确

---

## 10. 风险与边界

### 10.1 没有审核后台

本阶段虽然保留了 `review` 状态，但不会真正进入人工审核流程。

这不是缺陷，而是明确的阶段边界。

### 10.2 发布入口可能需要从系统 modal 升级

当前 Discovery 使用 `wx.showModal({ editable: true })`，它适合单输入、单确认流程，不太适合双动作发布。

因此 V3 大概率要改成自定义发布面板，这是本阶段前端的主要 UI 改动点。

### 10.3 暂不支持内容编辑

本阶段用户可以查看自己的内容状态，但不支持修改已保存内容。

如果后续需要“编辑草稿后重新发布”，再作为下一段子项目单独加入。

---

## 11. 验收标准

当以下条件成立时，可认为 V3 这个子项目完成：

- 用户可保存草稿
- 用户可立即发布内容
- 公共 feed 只显示 `published`
- 用户可查看自己的发布记录
- 前端能区分至少 `draft / published / hidden`
- 后端 e2e 覆盖新增状态流逻辑
- Discovery 页面联调通过且无模板编译错误

---

## 12. 与后续阶段关系

这个子项目完成后，会为后续能力提供直接基础：

- 审核后台：可直接承接 `review / hidden`
- 匹配与推荐：可利用更稳定的内容池
- 关系链：可基于作者内容表达补充画像
- 聊天承接：未来可从内容互动延伸到关系建立

因此它是 V2 资料编辑之后，最自然的下一段演进。
