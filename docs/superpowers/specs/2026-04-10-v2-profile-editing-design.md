# SW V2 Profile Editing Design

## 1. 目标

本阶段作为 V2 的第一个子项目，目标是在当前 V1 已跑通的基础上，把“只读档案页”升级为“可编辑、可保存、可回显”的用户资料系统。

这个子项目不追求一次性把账号体系、关系链和聊天全部做完，而是优先补齐后续推荐增强、关系建立和内容表达所依赖的用户资料基础设施。

一句话目标：

> 让用户可以真实维护自己的基础资料与照片墙，并让 Profile 成为可持续演进的用户资料中心。

---

## 2. 范围

### 2.1 本阶段要做

后端新增或扩展：

- 扩展 `GET /api/v1/profile/info`
- 新增 `PATCH /api/v1/profile/info`
- 新增 `POST /api/v1/profile/photos`
- 新增 `DELETE /api/v1/profile/photos/:photoId`
- 新增 `PATCH /api/v1/profile/photos/sort`

前端新增或扩展：

- Profile 页面展示完整资料
- Profile 页面增加“编辑资料”入口
- 支持编辑昵称、签名、MBTI、城市、性别、年龄段、感情状态
- 支持照片新增、删除、排序
- 保存成功后立即刷新回显

数据层：

- 继续使用 `users`
- 继续使用 `user_photos`
- 保持现有测试态鉴权方案

---

### 2.2 本阶段不做

- 微信登录 / openid 绑定
- 云存储上传
- 图片审核
- 即时聊天
- 关系链状态机
- 推荐重算任务
- 用户资料版本历史

---

## 3. 设计原则

### 3.1 保持子项目聚焦

本子项目只解决“资料可编辑”这一个问题，不把账号接入、聊天承接、推荐优化混进来。

### 3.2 沿用现有边界

继续沿用当前 `profile` 模块作为聚合出口，资料更新和照片管理都收敛在该模块中，避免额外拆出新模块造成范围发散。

### 3.3 先做本地可联调版本

照片仍然先使用 `photoUrl` 文本字段，不在本阶段引入真实上传链路。前端先以“填写 URL 或使用预置测试 URL”的方式联调，后续再接对象存储。

### 3.4 接口稳定优先

本阶段要保证接口形状尽量接近未来线上形态，即使内部实现仍是轻量版，也不要频繁改前端字段结构。

---

## 4. 用户体验设计

### 4.1 当前问题

V1 的 Profile 页面已经能展示基础资料，但本质上还是只读页面：

- 用户无法修改昵称或签名
- 用户无法补充 MBTI、城市等信息
- 用户无法维护照片墙
- Profile 数据不够完整，无法作为后续匹配和社交关系的可信输入

### 4.2 V2 体验目标

V2 之后，用户应能完成以下动作：

1. 打开 Profile 页面查看当前完整资料
2. 进入编辑模式
3. 修改文本资料
4. 新增或删除照片
5. 调整照片顺序
6. 保存后回到展示态，并立即看到最新结果

### 4.3 交互形态

本阶段建议采用“轻编辑模式”：

- 在 `profile` 页面新增“编辑资料”入口
- 点击后进入单独的编辑页，或当前页切换到编辑态
- 资料字段使用基础表单控件
- 照片墙先提供简单操作：新增 URL、删除、排序

本阶段不需要复杂拖拽体验，也不需要多步骤资料向导。重点是先保证数据流闭环。

---

## 5. 数据模型设计

### 5.1 `users`

继续作为用户基础资料主表，V2 直接使用并开放这些字段的编辑能力：

- `nickname`
- `avatar_url`
- `gender`
- `age_range`
- `relationship_status`
- `mbti`
- `signature`
- `city`

说明：

- `avatar_url` 本阶段可继续保留，但前端展示优先取 `user_photos` 第一张图
- 后续如果需要显式区分“头像”和“照片墙”，再补专门规则

### 5.2 `user_photos`

继续作为用户照片墙表，承担：

- 照片 URL
- 排序
- 状态

V2 仍使用以下字段：

- `id`
- `user_id`
- `photo_url`
- `sort_order`
- `status`
- `created_at`

### 5.3 本阶段不新增新表

为了保持范围收敛，本阶段不新增单独的 `user_profile_snapshots` 或 `profile_edit_logs` 表。

如后续需要审计能力或异步聚合，再在 P1 后续子项目中引入。

---

## 6. API 设计

### 6.1 GET `/api/v1/profile/info`

用途：

- 返回当前用户的完整档案展示数据

响应建议扩展为：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "userId": "1",
    "nickname": "SOFIA",
    "gender": "female",
    "age": "gen-z",
    "mbti": "INFJ",
    "signature": "先理解，再表达。",
    "city": "Shanghai",
    "relationshipStatus": "single",
    "photos": [
      {
        "photoId": "101",
        "photoUrl": "https://example.com/photos/sofia-1.jpg",
        "sortOrder": 0
      }
    ],
    "counts": {
      "visitors": 0,
      "followers": 0,
      "following": 0,
      "interactions": 12
    }
  }
}
```

设计决定：

- 把 `ageRange` 输出为前端使用的 `age`
- 新增 `city` 与 `relationshipStatus`
- `photos` 从字符串数组升级为对象数组，避免后续无法支持删除与排序

---

### 6.2 PATCH `/api/v1/profile/info`

用途：

- 更新用户基础资料

请求体：

```json
{
  "nickname": "林深处的麋鹿",
  "signature": "在喧嚣里寻找同频",
  "mbti": "INFJ",
  "city": "Shanghai",
  "gender": "female",
  "ageRange": "gen-z",
  "relationshipStatus": "single"
}
```

返回：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "updated": true
  }
}
```

规则：

- 允许部分字段更新
- 未传字段不覆盖
- `nickname`、`signature` 应做长度约束
- `mbti`、`gender`、`ageRange`、`relationshipStatus` 应限制在允许集合中

---

### 6.3 POST `/api/v1/profile/photos`

用途：

- 新增一张照片

请求体：

```json
{
  "photoUrl": "https://example.com/photos/new-photo.jpg"
}
```

返回：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "photoId": "205",
    "created": true
  }
}
```

规则：

- 默认追加到当前照片列表最后
- 若照片数有上限，本阶段固定一个明确值，建议 `9`
- 只接收 URL，不处理上传文件

---

### 6.4 DELETE `/api/v1/profile/photos/:photoId`

用途：

- 删除用户的一张照片

返回：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "deleted": true
  }
}
```

规则：

- 只能删除自己的照片
- 删除后其余照片排序需要重新整理

---

### 6.5 PATCH `/api/v1/profile/photos/sort`

用途：

- 批量调整照片顺序

请求体：

```json
{
  "items": [
    { "photoId": "101", "sortOrder": 0 },
    { "photoId": "103", "sortOrder": 1 }
  ]
}
```

返回：

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "updated": true
  }
}
```

规则：

- 一次按完整排序结果提交
- 服务端应校验所有照片都归属于当前用户

---

## 7. 后端模块设计

### 7.1 `profile` 模块职责扩大

V2 中继续使用现有 `profile` 模块作为资料聚合与编辑出口，新增以下职责：

- 用户基础资料读取
- 用户基础资料更新
- 用户照片列表管理
- 资料字段校验

### 7.2 DTO 划分

建议新增：

- `update-profile.dto.ts`
- `add-profile-photo.dto.ts`
- `sort-profile-photos.dto.ts`

这样能让文本资料更新和照片管理边界清晰。

### 7.3 Service 设计

`ProfileService` 建议拆成以下方法：

- `getInfo(userId)`
- `updateInfo(userId, dto)`
- `addPhoto(userId, dto)`
- `deletePhoto(userId, photoId)`
- `sortPhotos(userId, dto)`

这样后续接资料编辑页时不会继续膨胀成一个超大 service。

---

## 8. 前端设计

### 8.1 Profile 页面扩展

现有 Profile 页面保留展示层，但要新增：

- 编辑按钮
- 更完整字段展示
- 照片墙真实渲染对象数组

### 8.2 编辑入口

建议新增一个独立编辑页，例如：

- `pages/profile-edit/profile-edit`

理由：

- 当前 `profile` 页视觉元素较多，直接在原页塞表单会让页面职责混乱
- 独立编辑页更便于后续逐步增加字段
- 保存与取消行为更明确

### 8.3 编辑页内容

编辑页至少包含：

- 昵称输入框
- 签名输入框
- MBTI 选择
- 城市输入框
- 性别选择
- 年龄段选择
- 感情状态选择
- 照片列表与管理按钮
- 保存按钮

### 8.4 照片管理交互

本阶段建议做最小可用版本：

- 新增：手动输入 URL 或从预置 URL 列表中选择
- 删除：点击删除按钮
- 排序：先用“上移 / 下移”按钮，不做拖拽

这样能保持本阶段实现成本可控，又能把真实数据流走通。

---

## 9. 验证与测试设计

### 9.1 后端 e2e

应补充以下覆盖：

- `GET /api/v1/profile/info` 返回扩展字段
- `PATCH /api/v1/profile/info` 可更新部分字段
- `POST /api/v1/profile/photos` 可新增照片
- `DELETE /api/v1/profile/photos/:photoId` 可删除照片
- `PATCH /api/v1/profile/photos/sort` 可更新顺序
- 非本人照片不可删除或排序

### 9.2 前端联调验收

应验证：

- 编辑页打开正常
- 修改昵称、签名、MBTI 后保存成功
- 回到 Profile 页面可见最新数据
- 新增照片后页面刷新正确
- 删除与排序后显示顺序正确

---

## 10. 风险与边界

### 10.1 图片上传仍是假数据

本阶段使用 `photoUrl` 方式联调，意味着：

- 可以验证资料流转
- 不能验证真实上传链路

这是有意保留的边界，不算缺陷。

### 10.2 Profile 返回结构会变

当前 V1 的 `photos` 是字符串数组，V2 需要升级为对象数组。

因此：

- 前端 Profile 页面要同步适配
- 这是一次受控接口升级，应该在 V2 中统一完成

### 10.3 统计字段仍可保持轻量

本阶段 `counts` 仍允许使用简化聚合，不需要引入复杂统计系统。

---

## 11. 验收标准

当以下条件成立时，可认为本子项目完成：

- 用户可查看完整资料
- 用户可编辑基础资料并成功保存
- 用户可新增、删除、排序照片
- 刷新后资料与照片顺序保持一致
- 后端相关接口具备 e2e 覆盖
- 前端 Profile 与编辑页联调通过

---

## 12. 与后续子项目关系

这个子项目完成后，将直接为以下 V2 后续工作提供基础：

- 匹配规则增强：可使用更完整用户资料
- Discovery 正式化：可展示更真实作者信息
- 关系链与聊天预留：可依赖稳定的用户资料系统

因此它适合作为 V2 的第一步。
