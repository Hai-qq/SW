# SW V3 Discovery Publication Formalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade Discovery from a single publish action into a small content lifecycle system with drafts, public-only feed filtering, and a current-user posts view.

**Architecture:** Keep all V3 work inside the existing `discovery` backend module and the existing `pages/discovery` Mini Program page. The backend will extend the current DTO/controller/service flow to support publish actions and current-user post queries, while the frontend will replace the single system modal with a lightweight in-page composer plus a "my posts" view.

**Tech Stack:** NestJS, Prisma, PostgreSQL, Jest, Supertest, WeChat Mini Program, JavaScript

---

## Scope check

This plan covers one focused V3 sub-project: **Discovery publication formalization and status flow**.

It intentionally does not include:

- review moderation workflow
- comments
- likes
- content editing
- cloud upload
- admin pages

---

## Planned file structure

### Backend files to modify

- Modify: `backend/prisma/seed.ts`
- Modify: `backend/src/discovery/discovery.controller.ts`
- Modify: `backend/src/discovery/discovery.service.ts`
- Modify: `backend/src/discovery/dto/publish-post.dto.ts`
- Modify: `backend/test/discovery.e2e-spec.ts`

### Backend files to create

- Create: `backend/src/discovery/dto/get-my-posts.dto.ts`

### Frontend files to modify

- Modify: `pages/discovery/discovery.js`
- Modify: `pages/discovery/discovery.wxml`
- Modify: `pages/discovery/discovery.wxss`

### Docs files to modify

- Modify: `backend/README.md`
- Modify: `README.md`

---

### Task 1: Formalize publish actions in the backend contract

**Files:**
- Modify: `backend/src/discovery/dto/publish-post.dto.ts`
- Modify: `backend/src/discovery/discovery.service.ts`
- Test: `backend/test/discovery.e2e-spec.ts`

- [ ] **Step 1: Extend the e2e suite with failing publish-action coverage**

```ts
it('saves a discovery post as draft', async () => {
  const response = await request(app.getHttpServer())
    .post('/api/v1/discovery/publish')
    .set('x-test-user-id', '1')
    .send({
      content: '这是一条草稿内容',
      tabType: '价值观',
      anonymous: false,
      action: 'draft',
    })
    .expect(201);

  expect(response.body.data).toMatchObject({
    feedId: expect.any(String),
    status: 'draft',
  });
});

it('publishes a discovery post when action is publish', async () => {
  const response = await request(app.getHttpServer())
    .post('/api/v1/discovery/publish')
    .set('x-test-user-id', '1')
    .send({
      content: '这是一条正式发布内容',
      tabType: '价值观',
      anonymous: false,
      action: 'publish',
    })
    .expect(201);

  expect(response.body.data).toMatchObject({
    feedId: expect.any(String),
    status: 'published',
  });
});
```

- [ ] **Step 2: Run the discovery suite and confirm the draft case fails**

Run: `npm test -- --runInBand test/discovery.e2e-spec.ts`
Expected: FAIL because `PublishPostDto` does not accept `action` and `publish()` always writes `published`.

- [ ] **Step 3: Expand `PublishPostDto` with explicit action validation**

```ts
import { Transform } from 'class-transformer';
import { IsBoolean, IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class PublishPostDto {
  @IsString()
  @MaxLength(500)
  content!: string;

  @IsString()
  tabType!: string;

  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  anonymous = false;

  @IsOptional()
  @IsIn(['draft', 'publish'])
  action: 'draft' | 'publish' = 'publish';
}
```

- [ ] **Step 4: Implement action-to-status mapping in `DiscoveryService.publish()`**

```ts
async publish(userId: bigint, dto: PublishPostDto) {
  const created = await this.prisma.discoveryPost.create({
    data: {
      authorUserId: userId,
      postType: 'timeline',
      category: dto.tabType,
      content: dto.content,
      anonymous: dto.anonymous,
      status: dto.action === 'draft' ? 'draft' : 'published',
    },
  });

  return {
    feedId: created.id.toString(),
    status: created.status,
  };
}
```

- [ ] **Step 5: Re-run the discovery suite**

Run: `npm test -- --runInBand test/discovery.e2e-spec.ts`
Expected: PASS for draft and publish action behavior.

- [ ] **Step 6: Commit the publish-action contract**

```bash
git add backend/src/discovery/dto/publish-post.dto.ts backend/src/discovery/discovery.service.ts backend/test/discovery.e2e-spec.ts
git commit -m "feat: support discovery draft and publish actions"
```

### Task 2: Add current-user discovery post queries and public-feed state filtering

**Files:**
- Create: `backend/src/discovery/dto/get-my-posts.dto.ts`
- Modify: `backend/src/discovery/discovery.controller.ts`
- Modify: `backend/src/discovery/discovery.service.ts`
- Modify: `backend/prisma/seed.ts`
- Test: `backend/test/discovery.e2e-spec.ts`

- [ ] **Step 1: Add failing tests for `my-posts` and feed status filtering**

```ts
it('does not return draft or hidden posts in the public feed', async () => {
  const response = await request(app.getHttpServer())
    .get('/api/v1/discovery/feed?tabType=全部&feedType=timeline')
    .set('x-test-user-id', '1')
    .expect(200);

  expect(response.body.data.items.every((item: { status: string }) => item.status === 'published')).toBe(true);
});

it('returns the current user posts across statuses', async () => {
  const response = await request(app.getHttpServer())
    .get('/api/v1/discovery/my-posts')
    .set('x-test-user-id', '1')
    .expect(200);

  expect(response.body.data.items).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        feedId: expect.any(String),
        status: expect.stringMatching(/draft|published|hidden/),
      }),
    ]),
  );
});

it('filters the current user posts by status', async () => {
  const response = await request(app.getHttpServer())
    .get('/api/v1/discovery/my-posts?status=draft')
    .set('x-test-user-id', '1')
    .expect(200);

  expect(response.body.data.items.every((item: { status: string }) => item.status === 'draft')).toBe(true);
});
```

- [ ] **Step 2: Run the suite and confirm `my-posts` fails with 404**

Run: `npm test -- --runInBand test/discovery.e2e-spec.ts`
Expected: FAIL because `GET /api/v1/discovery/my-posts` is not implemented and seed data does not yet cover multiple statuses.

- [ ] **Step 3: Add a `GetMyPostsDto` that validates `status`**

```ts
import { IsIn, IsOptional } from 'class-validator';

export class GetMyPostsDto {
  @IsOptional()
  @IsIn(['draft', 'published', 'hidden'])
  status?: 'draft' | 'published' | 'hidden';
}
```

- [ ] **Step 4: Add the controller route for `my-posts`**

```ts
import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { CurrentUser } from '../common/current-user.decorator';
import { DiscoveryService } from './discovery.service';
import { GetFeedDto } from './dto/get-feed.dto';
import { GetMyPostsDto } from './dto/get-my-posts.dto';
import { PublishPostDto } from './dto/publish-post.dto';

@Controller('discovery')
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  @Get('feed')
  getFeed(@Query() dto: GetFeedDto) {
    return this.discoveryService.getFeed(dto);
  }

  @Get('my-posts')
  getMyPosts(@CurrentUser() user: { id: bigint }, @Query() dto: GetMyPostsDto) {
    return this.discoveryService.getMyPosts(user.id, dto);
  }

  @Post('publish')
  publish(@CurrentUser() user: { id: bigint }, @Body() dto: PublishPostDto) {
    return this.discoveryService.publish(user.id, dto);
  }
}
```

- [ ] **Step 5: Implement `getMyPosts()` and include `status` in feed rows**

```ts
async getMyPosts(userId: bigint, dto: GetMyPostsDto) {
  const items = await this.prisma.discoveryPost.findMany({
    where: {
      authorUserId: userId,
      status: dto.status,
    },
    orderBy: [{ createdAt: 'desc' }],
    take: 20,
  });

  return {
    items: items.map((item) => ({
      feedId: item.id.toString(),
      type: item.postType,
      category: item.category,
      content: item.content,
      status: item.status,
      anonymous: item.anonymous,
      createdAt: item.createdAt.toISOString(),
    })),
  };
}
```

```ts
return {
  cursor: null,
  items: items.map((item) => ({
    feedId: item.id.toString(),
    type: item.postType,
    category: item.category,
    title: item.title,
    content: item.content,
    status: item.status,
    anonymous: item.anonymous,
    author: {
      userId: item.author.id.toString(),
      nickname: item.author.nickname,
      avatar: item.author.avatarUrl ?? '',
    },
    stats: {
      likeCount: item.likeCount,
      commentCount: item.commentCount,
    },
    createdAt: item.createdAt.toISOString(),
  })),
};
```

- [ ] **Step 6: Expand seed data with draft and hidden rows for user `1`**

```ts
  await prisma.discoveryPost.createMany({
    data: [
      {
        id: 501n,
        authorUserId: 1n,
        postType: 'featured',
        category: '价值观',
        title: '关于成熟',
        content: '我更认同先理解后表达。',
        status: 'published',
      },
      {
        id: 504n,
        authorUserId: 1n,
        postType: 'timeline',
        category: '内心世界',
        content: '这是一条还没发出去的草稿。',
        status: 'draft',
      },
      {
        id: 505n,
        authorUserId: 1n,
        postType: 'timeline',
        category: '社会观察',
        content: '这条内容已经被隐藏。',
        status: 'hidden',
      },
    ],
    skipDuplicates: true,
  });
```

- [ ] **Step 7: Re-run the discovery suite**

Run: `npm test -- --runInBand test/discovery.e2e-spec.ts`
Expected: PASS for `my-posts` and status-filtered public feed behavior.

- [ ] **Step 8: Commit the current-user query flow**

```bash
git add backend/src/discovery backend/prisma/seed.ts backend/test/discovery.e2e-spec.ts
git commit -m "feat: add discovery my-posts and status filtering"
```

### Task 3: Replace the single modal with an in-page composer and my-posts view

**Files:**
- Modify: `pages/discovery/discovery.js`
- Modify: `pages/discovery/discovery.wxml`
- Modify: `pages/discovery/discovery.wxss`

- [ ] **Step 1: Add frontend state for composer and my-posts**

```js
Page({
  data: {
    statusBarHeight: 20,
    windowHeight: 800,
    tabs: ['全部', '内心世界', '旅行与探索', '价值观', '社会观察'],
    tabItems: [],
    currentTab: '全部',
    featuredItems: [],
    featuredCard: null,
    timelineItems: [],
    showComposer: false,
    publishContent: '',
    myPostsVisible: false,
    myPosts: [],
    myPostFilters: ['全部', 'draft', 'published', 'hidden'],
    myPostFilter: '全部',
  },
});
```

- [ ] **Step 2: Add JS helpers for loading my-posts and submitting either draft or publish**

```js
async loadMyPosts() {
  const statusQuery = this.data.myPostFilter === '全部' ? '' : `?status=${encodeURIComponent(this.data.myPostFilter)}`;
  const result = await request({
    url: `/api/v1/discovery/my-posts${statusQuery}`
  });

  this.setData({
    myPosts: (result.items || []).map((item) => ({
      ...item,
      statusText: item.status === 'draft'
        ? '草稿'
        : item.status === 'published'
          ? '已发布'
          : '已隐藏'
    }))
  });
}

async submitPost(action) {
  if (!this.data.publishContent.trim()) {
    wx.showToast({ title: '先写点内容', icon: 'none' });
    return;
  }

  await request({
    url: '/api/v1/discovery/publish',
    method: 'POST',
    data: {
      content: this.data.publishContent.trim(),
      tabType: this.data.currentTab === '全部' ? '价值观' : this.data.currentTab,
      anonymous: false,
      action
    }
  });
}
```

- [ ] **Step 3: Replace `openPublish()` with in-page panel actions**

```js
openPublish() {
  this.setData({ showComposer: true });
}

closePublish() {
  this.setData({
    showComposer: false,
    publishContent: ''
  });
}

onPublishInput(e) {
  this.setData({ publishContent: e.detail.value });
}

async saveDraft() {
  try {
    await this.submitPost('draft');
    wx.showToast({ title: '草稿已保存', icon: 'none' });
    this.closePublish();
    await this.loadMyPosts();
  } catch (error) {
    wx.showToast({ title: '保存失败', icon: 'none' });
  }
}

async publishNow() {
  try {
    await this.submitPost('publish');
    wx.showToast({ title: '已发布', icon: 'none' });
    this.closePublish();
    await Promise.all([this.loadFeed(), this.loadMyPosts()]);
  } catch (error) {
    wx.showToast({ title: '发布失败', icon: 'none' });
  }
}
```

- [ ] **Step 4: Add my-posts toggles and the composer panel to `discovery.wxml`**

```xml
<view class="section-title">
  <text class="title-text">Surfing Feed</text>
  <view class="toolbar-actions">
    <button class="mini-action-btn" bindtap="toggleMyPosts">我的发布</button>
    <button class="mini-action-btn" bindtap="openPublish">写一条</button>
  </view>
</view>

<view wx:if="{{myPostsVisible}}" class="my-posts-panel">
  <scroll-view scroll-x="true" class="my-post-filters" show-scrollbar="false">
    <view
      wx:for="{{myPostFilters}}"
      wx:key="*this"
      class="my-post-filter {{myPostFilter === item ? 'active' : ''}}"
      data-status="{{item}}"
      bindtap="switchMyPostFilter"
    >
      <text>{{item}}</text>
    </view>
  </scroll-view>

  <view wx:for="{{myPosts}}" wx:key="feedId" class="my-post-card">
    <text class="my-post-status">{{item.statusText}}</text>
    <text class="my-post-category">{{item.category}}</text>
    <text class="my-post-content">{{item.content}}</text>
  </view>
</view>

<view wx:if="{{showComposer}}" class="composer-mask">
  <view class="composer-panel">
    <text class="composer-title">写下此刻的想法</text>
    <textarea class="composer-input" value="{{publishContent}}" bindinput="onPublishInput" maxlength="500" placeholder="这里支持存草稿或直接发布"></textarea>
    <view class="composer-actions">
      <button class="composer-btn ghost" bindtap="saveDraft">存草稿</button>
      <button class="composer-btn solid" bindtap="publishNow">立即发布</button>
    </view>
    <button class="composer-close" bindtap="closePublish">取消</button>
  </view>
</view>
```

- [ ] **Step 5: Add the supporting page methods**

```js
async toggleMyPosts() {
  const nextVisible = !this.data.myPostsVisible;
  this.setData({ myPostsVisible: nextVisible });
  if (nextVisible) {
    await this.loadMyPosts();
  }
}

async switchMyPostFilter(e) {
  const myPostFilter = e.currentTarget.dataset.status;
  this.setData({ myPostFilter });
  await this.loadMyPosts();
}
```

- [ ] **Step 6: Add the WXSS for the new toolbar, my-posts panel, and composer**

```css
.toolbar-actions {
  display: flex;
  gap: 16rpx;
}

.mini-action-btn {
  margin: 0;
  padding: 0 28rpx;
  height: 64rpx;
  line-height: 64rpx;
  border-radius: 999rpx;
  background: rgba(255,255,255,0.85);
  color: #1A1A1A;
  font-size: 22rpx;
  border: 2rpx solid rgba(0,0,0,0.08);
}

.my-posts-panel {
  margin-top: 24rpx;
  margin-bottom: 32rpx;
  padding: 28rpx;
  border-radius: 32rpx;
  background: rgba(255,255,255,0.72);
}

.composer-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.28);
  display: flex;
  align-items: flex-end;
  z-index: 120;
}

.composer-panel {
  width: 100%;
  padding: 36rpx 32rpx 48rpx;
  border-radius: 36rpx 36rpx 0 0;
  background: #f8f6ef;
}
```

- [ ] **Step 7: Manual checkpoint in WeChat DevTools**

Manual actions:
1. Open `pages/discovery/discovery`
2. Tap “写一条”
3. Enter content
4. Save draft once
5. Publish once
6. Open “我的发布”
7. Switch among `全部 / draft / published / hidden`

Expected:
- No WXML compile error
- Draft does not appear in the public feed
- Published content appears in the public feed after reload
- My-posts list shows state text correctly

- [ ] **Step 8: Commit the Discovery UI upgrade**

```bash
git add pages/discovery/discovery.js pages/discovery/discovery.wxml pages/discovery/discovery.wxss
git commit -m "feat: add discovery composer and my-posts view"
```

### Task 4: Final verification and docs touch-up

**Files:**
- Modify: `backend/README.md`
- Modify: `README.md`

- [ ] **Step 1: Add short docs for the new Discovery endpoints**

Append this to `backend/README.md`:

```md
## V3 Discovery Publication Formalization

The Discovery module now supports:

- `POST /api/v1/discovery/publish` with `action = draft | publish`
- `GET /api/v1/discovery/feed` returning only `published` content
- `GET /api/v1/discovery/my-posts`
```

Append this note to `README.md`:

```md
The Mini Program Discovery page now supports saving drafts, publishing immediately, and viewing the current user's own posts.
```

- [ ] **Step 2: Run the focused discovery suite**

Run: `npm test -- --runInBand test/discovery.e2e-spec.ts`
Expected: PASS.

- [ ] **Step 3: Run the full backend suite**

Run: `npm test -- --runInBand`
Expected: All suites PASS.

- [ ] **Step 4: Run backend build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 5: Final manual Discovery verification**

Manual flow:
1. Open the Discovery page
2. Save a draft
3. Confirm it is visible in “我的发布”
4. Publish a new item
5. Confirm it appears in the public feed
6. Switch tabs and verify feed still excludes drafts and hidden items

Expected:
- No WXML compile errors
- No 404/500 errors in network
- Public feed remains `published` only

- [ ] **Step 6: Commit docs and verification baseline**

```bash
git add backend/README.md README.md
git commit -m "docs: document discovery publication flow"
```

---

## Self-review

### Spec coverage

- Publish actions and status semantics: covered in Task 1.
- Public feed `published`-only filtering: covered in Task 2.
- Current-user posts endpoint: covered in Task 2.
- Discovery UI for draft/publish/my-posts: covered in Task 3.
- Verification and docs: covered in Task 4.

### Placeholder scan

- No `TODO`, `TBD`, or vague “handle appropriately” steps remain.
- Each behavior-changing task includes concrete code snippets or commands.

### Type consistency

- `action` is consistently `draft | publish`.
- `status` is consistently `draft | published | hidden` in V3 runtime behavior.
- `myPostFilter` uses `全部` on the frontend and maps to query omission rather than a backend enum value.
