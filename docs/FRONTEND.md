# SW（Same Wavelength）同频 — 前端开发文档

**MVP V1.1 Release | 微信小程序原生框架**

> 修订记录：
> - V1.0：架构定稿与核心实现
> - V1.1（当前发布版）：全面重构底部三段式导航结构（冲浪、同频、小纸条），增加全局统一的暖调渐变背景，新增会话聊天广场页，迁移档案页至左上角统一入口，并优化各种排版及堆叠阴影高级感。

---

## 1. 项目总览

| 项 | 详情 |
|----|------|
| 产品名称 | SW（Same Wavelength，中文名：同频）|
| 产品形态 | 微信小程序 MVP |
| 核心定位 | 以三观观点站队为核心的轻社交平台 |
| AppID | wx7bee047ae1ab06a6 |
| 基础库版本 | 3.15.1 |
| 技术栈 | 微信小程序原生框架（WXML + WXSS + JS）|

### 页面路由

```
pages/onboarding/onboarding   新手引导（入口页）
pages/home/home               首页卡片（核心互动）
pages/discovery/discovery     真心话（发现/时间线）
pages/profile/profile         我的档案
```

导航策略：使用 `wx.redirectTo` 跳转（不保留历史栈），底部导航条通过各页面自实现（毛玻璃 fixed 定位）。

---

## 2. 全局视觉规范

### 2.1 色彩系统

| 名称 | 色值 | 用途 |
|------|------|------|
| 奶油白 | `#F5F3ED` | 页面背景顶部 |
| 浅绿灰 | `#D4DDDB` / `#E0E4E1` | 背景渐变底部 |
| 主深色 | `#1A1A1A` | 正文、按钮、图标 |
| 辅助灰 | `rgba(0,0,0,0.4)` | 次要文字、非激活状态 |
| 纯白 | `#FFFFFF` | 卡片背景 |

背景统一使用 `linear-gradient(180deg, #F5F3ED 0%, #D4DDDB/E0E4E1 100%)`。

### 2.2 字体

- 正文：`-apple-system, BlinkMacSystemFont, sans-serif`
- 衬线（观点文字、品牌名）：`Noto Serif, serif`
- **注意**：Material Symbols Outlined 字体（Google CDN）已从项目中移除，图标改用 Unicode 字符或本地 SVG。

### 2.3 间距 / 圆角

- 页面横向内边距：`40rpx`
- 卡片圆角：`40rpx`
- 按钮圆角：`100rpx`（胶囊形）/ `50%`（圆形）

### 2.4 适配规范

- 顶部安全区：所有固定 header 的 padding-top 使用 `wx.getWindowInfo().statusBarHeight`（单位 px），而非硬编码
- 底部导航高度约 `120rpx`，内容底部需留 `padding-bottom: 200rpx` 以防遮挡
- scroll-view 使用 flex 布局时必须加 `enable-flex` 属性

---

## 3. 图标方案

**不使用**需要网络加载的外部字体图标（已移除 Material Symbols）。

| 图标 | 方案 | 路径 / 字符 |
|------|------|------------|
| 底部导航 - 真心话 | SVG 文件 | `/assets/icons/forum.svg` |
| 底部导航 - 首页卡片 | SVG 文件 | `/assets/icons/home_cards.svg` |
| 底部导航 - 我的档案 | SVG 文件 | `/assets/icons/person.svg` |
| 操作按钮 - 不认同 | SVG 文件 | `/assets/icons/close.svg` |
| 操作按钮 - 认同 | SVG 文件 | `/assets/icons/circle.svg` |
| AI 评论按钮 | SVG 文件 | `/assets/icons/mic.svg` |
| 汉堡菜单 | Unicode | `☰` |
| 添加照片 | 文字 | `+` |
| Premium 水印 | Unicode | `✦` |

---

## 4. Onboarding（新手引导）

### 4.1 功能说明

用户首次进入展示，通过 3 道卡片滑动题目收集基础标签，完成后跳转首页。

### 4.2 数据结构

```javascript
data: {
  currentIndex: 0,
  currentQuestion: {},
  questions: [
    { id: 1, title: '你的生理性别是？', desc: '...', leftAns: '男性', rightAns: '女性' },
    { id: 2, title: '你的出生年龄段是？', desc: '...', leftAns: '95后&00后', rightAns: '90后及更早' },
    { id: 3, title: '你当前的感情状态是？', desc: '...', leftAns: '单身', rightAns: '非单身' }
  ],
  translateX: 0, rotate: 0, transition: 'none', startX: 0
}
```

### 4.3 交互逻辑

| 操作 | 触发 | 效果 |
|------|------|------|
| 右滑 / 点右按钮 | `touchEnd` / `forceSwipeRight` | 选右侧答案，切换下一题 |
| 左滑 / 点左按钮 | `touchEnd` / `forceSwipeLeft` | 选左侧答案，切换下一题 |
| 点「不愿透露」 | `skipQuestion` | 跳过当前题 |
| 点「上一步」 | `goBack` | 返回上一题 |
| 最后一题完成 | `nextQuestion` | `wx.redirectTo` → home |

### 4.4 进度显示

- 步骤数：`{{currentIndex + 1}}/{{questions.length}}`（左侧），`DISCOVERY`（右侧）
- 进度条宽度：`{{(currentIndex + 1) / questions.length * 100}}%`

---

## 5. Home（首页卡片）

### 5.1 功能说明

核心互动页，展示观点卡片供用户左右滑动表态，包含分类 Tab、推荐用户栏。

### 5.2 数据结构（关键字段）

```javascript
data: {
  statusBarHeight: 20, windowHeight: 800,
  currentTab: '全部',
  tabs: ['全部', '内心世界', '旅行与探索', '价值观', '社会观察'],
  recommendUsers: [ /* 4个推荐用户 { id, name, avatar } */ ],
  currentCard: {
    id, user: { name, avatar },
    tags, content,
    agreePercent,        // 0-100
    agreeAvatars: [],
    disagreeAvatar: ''
  },
  cardTranslateX: 0, cardTranslateY: 0,
  cardRotate: 0, cardTransition: 'none',
  startX: 0, startY: 0,
  upSwipeCount: 0, maxUpSwipe: 5,
  showLimitModal: false,
  swipeSessionCount: 0, entryTime: 0
}
```

### 5.3 滑动交互逻辑

滑动阈值：`SWIPE_THRESHOLD = 100px`

| 操作 | 条件 | 效果 |
|------|------|------|
| 右滑 | `cardTranslateX > 100` | 认同，`animateSwipeAndNext('right')` |
| 左滑 | `cardTranslateX < -100` | 不认同，`animateSwipeAndNext('left')` |
| 上滑 | `cardTranslateY < -100` 且 Y > X 位移 | 跳过（每日限5次）|
| 超出上滑限制 | `upSwipeCount >= maxUpSwipe` | 显示限制弹窗 |
| 点击左/右按钮 | `forceSwipeLeft/Right` | 同滑动效果 |

**盲盒触发**：`swipeSessionCount >= 3` 且在线 `> 30秒` → 触发后重置计数为 0。

### 5.4 Tab 切换

`switchTab(e)` 接收 `data-tab` 属性，更新 `currentTab`；卡片过滤逻辑待后端接入。

---

## 6. Discovery（真心话）

### 6.1 功能说明

内容发现页，展示 Featured Thoughts（热门投票）和 Timeline（时间线树洞），右下 FAB 发布新观点。

### 6.2 布局关键点

- header 为 `position: fixed`，高度 = `statusBarHeight(px) + 108rpx`
- `main-scroll` 的 `padding-top` 使用内联 `calc({{statusBarHeight}}px + 108rpx)` 动态适配，**不能**硬编码 `180rpx`
- FAB：`position: fixed; bottom: 200rpx; right: 40rpx; z-index: 60`

---

## 7. Profile（我的档案）

### 7.1 功能说明

用户个人档案页，含头像/标签/统计/文档卡片/Premium 升级区/照片墙/历史记录。

### 7.2 布局结构（关键）

```
<view class="page-wrapper">           外层容器
  <scroll-view class="container">     可滚动区（height = windowHeight）
    <view class="header">             fixed 顶部
    <view class="main-content">       主体（padding-top: 180rpx）
  </scroll-view>
  <view class="bottom-nav">           fixed 底部导航（必须在 scroll-view 外）
</view>
```

> **关键约束**：`bottom-nav` 必须放在 `scroll-view` 外部。`position: fixed` 在 scroll-view 内部会随内容滚动，导致导航条消失。

---

## 8. API 接入点速查

当前所有页面使用 Mock 数据，后端接入时替换以下位置：

| 页面 | 函数 | 待调用 API |
|------|------|-----------|
| Onboarding | `animateSwipe` | `POST /api/v1/onboarding/submit` |
| Home | `recordSwipe` | `POST /api/v1/cards/swipe` |
| Home | `loadNextCard` | `GET /api/v1/cards/recommend` |
| Home | `checkBlindBoxTrigger` | `POST /api/v1/blind-box/trigger-check` |
| Discovery | `onLoad` | `GET /api/v1/discovery/feed?tabType=all&feedType=featured` |
| Profile | `onLoad` | `GET /api/v1/profile/info` |

---

## 9. 废弃 API 替换记录

| 废弃 API | 替换 | 基础库版本 |
|----------|------|----------|
| `wx.getSystemInfoSync()` | `wx.getWindowInfo()` | 3.7.0+ |
