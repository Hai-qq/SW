# SW（Same Wavelength）前后端 API 对齐文档

> **版本：** V1.2（对齐实际实现，修正 Onboarding 题目数量为3题）
> **状态：** API 骨架定义，前端 Mock 数据，待后端实现

---

## 1. 全局规范

- **请求域名**：`https://api.yourdomain.com`（占位，待定）
- **通信协议**：HTTPS / RESTful
- **鉴权方式**：`Authorization: Bearer <Token>`
- **统一返回格式**：
  ```json
  {
    "code": 200,
    "message": "success",
    "data": {}
  }
  ```

---

## 2. Onboarding 接口（3 题引导）

### 2.1 上报初始答卷

| 项 | 值 |
|----|----|
| URL | `POST /api/v1/onboarding/submit` |
| 说明 | 用户完成 3 题划卡后上报，建立基础画像标签 |

**Request Body**
```json
{
  "answers": [
    { "questionId": 1, "selected": "female" },
    { "questionId": 2, "selected": "gen-z" },
    { "questionId": 3, "selected": "single" }
  ]
}
```

**前端调用位置**：`pages/onboarding/onboarding.js` → `animateSwipe()`（最后一题完成时）

---

## 3. Home（首页卡片）接口

### 3.1 获取推荐观点卡片

| 项 | 值 |
|----|----|
| URL | `GET /api/v1/cards/recommend` |
| Params | `limit=5&cursor=<上次游标>` |

**Response `data`**
```json
{
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
        "agreeAvatars": ["https://...", "https://..."],
        "disagreeAvatar": "https://..."
      }
    }
  ]
}
```

**前端调用位置**：`pages/home/home.js` → `loadNextCard()`

---

### 3.2 上报划动行为

| 项 | 值 |
|----|----|
| URL | `POST /api/v1/cards/swipe` |

**Request Body**
```json
{
  "cardId": 1001,
  "action": "agree",
  "timestamp": 1743600000000
}
```

`action` 枚举值：`agree`（右滑认同）/ `disagree`（左滑不认同）/ `skip`（上滑跳过）

**前端调用位置**：`pages/home/home.js` → `recordSwipe(direction)`

---

### 3.3 盲盒触发检查

| 项 | 值 |
|----|----|
| URL | `POST /api/v1/blind-box/trigger-check` |
| 触发条件 | 本次会话累计 ≥ 3 次有效划动 且 在线时长 > 30 秒 |

**Request Body**
```json
{
  "sessionSwipeCount": 3,
  "sessionDuration": 45
}
```

**Response `data`**
```json
{
  "shouldTrigger": true,
  "matchUser": {
    "userId": 302,
    "name": "MARCUS",
    "avatar": "https://..."
  }
}
```

**前端调用位置**：`pages/home/home.js` → `checkBlindBoxTrigger()`

---

## 4. Discovery（真心话）接口

### 4.1 获取内容 Feed

| 项 | 值 |
|----|----|
| URL | `GET /api/v1/discovery/feed` |
| Params | `tabType=all&feedType=featured&cursor=xxx` |

`tabType` 枚举：`all` / `internal` / `travel` / `values` / `politics`
`feedType` 枚举：`featured`（热门投票卡片）/ `timeline`（时间线）

**Response `data`**
```json
{
  "cursor": "next_cursor",
  "items": [
    {
      "feedId": 501,
      "type": "featured",
      "title": "如果时间可以倒流，你最想回到哪一年的夏天？",
      "quote": "那年夏天没有口罩...",
      "stats": { "optionA": 65, "optionB": 35 },
      "optionALabel": "2008: 奥运与旧时光",
      "optionBLabel": "2019: 最后的安稳",
      "participants": 130,
      "participantAvatars": ["https://...", "https://..."]
    },
    {
      "feedId": 502,
      "type": "timeline",
      "createdAt": "12 MINS AGO",
      "authorName": "匿名猫",
      "content": "在大城市待久了..."
    }
  ]
}
```

**前端调用位置**：`pages/discovery/discovery.js` → `onLoad()` / Tab 切换时

---

### 4.2 发布新观点

| 项 | 值 |
|----|----|
| URL | `POST /api/v1/discovery/publish` |

**Request Body**
```json
{
  "content": "观点文本",
  "tabType": "values",
  "anonymous": false
}
```

**前端调用位置**：`pages/discovery/discovery.js` → `openPublish()`（待实现发布弹窗）

---

## 5. Profile（我的档案）接口

### 5.1 获取个人档案

| 项 | 值 |
|----|----|
| URL | `GET /api/v1/profile/info` |

**Response `data`**
```json
{
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
```

**前端调用位置**：`pages/profile/profile.js` → `onLoad()`

---

## 6. 接口实现状态总览

| 接口 | 前端对接点 | 状态 |
|------|-----------|------|
| `POST /api/v1/onboarding/submit` | `onboarding.js animateSwipe` | 未实现，Mock |
| `GET /api/v1/cards/recommend` | `home.js loadNextCard` | 未实现，Mock |
| `POST /api/v1/cards/swipe` | `home.js recordSwipe` | 未实现，Mock |
| `POST /api/v1/blind-box/trigger-check` | `home.js checkBlindBoxTrigger` | 未实现，Mock |
| `GET /api/v1/discovery/feed` | `discovery.js onLoad` | 未实现，Mock |
| `POST /api/v1/discovery/publish` | `discovery.js openPublish` | 未实现，待开发 |
| `GET /api/v1/profile/info` | `profile.js onLoad` | 未实现，Mock |
