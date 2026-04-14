# Blind Box MVP P0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first end-to-end blind box flow on the home page so a user can be auto-triggered, open a blind box with 3 candidates, tap "想认识", see a success confirmation state, and enter 小纸条.

**Architecture:** Keep the MVP narrow by reusing the existing matching and chat modules instead of introducing a new blind-box database model. Extend `POST /api/v1/matching/trigger-check` to return a 3-candidate blind-box payload, keep the current fixed-threshold trigger, and let the home page manage a local blind-box UI state machine. For the MVP, preserve the product rule "双方都点想认识才进小纸条" in copy, but technically simulate the peer's approval by immediately creating a `connected` relationship for the selected candidate.

**Tech Stack:** WeChat Mini Program (`pages/home/*`), NestJS, Prisma, Jest e2e tests, existing matching/chat endpoints.

---

## File Structure

### Backend files

- Modify: `D:/CodeWorkSpace/SW/backend/src/matching/matching.service.ts`
  - Return a 3-candidate blind-box payload instead of a single `matchUser`
  - Reuse existing candidate scoring and `MatchEvent`
- Modify: `D:/CodeWorkSpace/SW/backend/test/matching.e2e-spec.ts`
  - Add failing e2e coverage for the 3-candidate response contract
- Modify: `D:/CodeWorkSpace/SW/docs/API.md`
  - Document the updated `trigger-check` payload

### Frontend files

- Modify: `D:/CodeWorkSpace/SW/pages/home/home.js`
  - Replace the modal-based match confirmation flow with a blind-box UI state machine
  - Handle candidate selection, success confirmation, and conversation entry
- Modify: `D:/CodeWorkSpace/SW/pages/home/home.wxml`
  - Render the blind-box trigger overlay, candidate list, and success confirmation state
- Modify: `D:/CodeWorkSpace/SW/pages/home/home.wxss`
  - Style the blind-box overlay and 3-card candidate layout

### Existing interfaces to reuse

- `POST /api/v1/matching/connections`
  - Continue using `action = connect | hide`
- `POST /api/v1/chat/conversations`
  - Continue opening or creating the chat conversation after a successful blind-box choice

---

### Task 1: Lock the backend blind-box response contract with e2e tests

**Files:**
- Modify: `D:/CodeWorkSpace/SW/backend/test/matching.e2e-spec.ts`
- Test: `D:/CodeWorkSpace/SW/backend/test/matching.e2e-spec.ts`

- [ ] **Step 1: Write the failing e2e test for a 3-candidate blind box payload**

Add a new test below the existing threshold test:

```ts
it('returns a blind box payload with three candidates once thresholds are met', async () => {
  const response = await request(app.getHttpServer())
    .post('/api/v1/matching/trigger-check')
    .set('x-test-user-id', '1')
    .send({ sessionId: 'session-blind-box-1', sessionSwipeCount: 3, sessionDuration: 45 })
    .expect(201);

  expect(response.body.data).toMatchObject({
    shouldTrigger: true,
    blindBox: {
      triggerMode: 'threshold',
      candidates: expect.any(Array),
    },
  });
  expect(response.body.data.blindBox.candidates).toHaveLength(3);
  expect(response.body.data.blindBox.candidates[0]).toMatchObject({
    userId: expect.any(String),
    nickname: expect.any(String),
    avatar: expect.any(String),
    tags: expect.any(Array),
  });
});
```

- [ ] **Step 2: Run the test to confirm the current contract fails**

Run:

```bash
cd D:/CodeWorkSpace/SW/backend
npx jest --config ./test/jest-e2e.json --runInBand test/matching.e2e-spec.ts -t "returns a blind box payload with three candidates once thresholds are met"
```

Expected:

```text
FAIL
Expected path: blindBox.candidates
Received: undefined
```

- [ ] **Step 3: Add a second failing test for the "already checked" branch to keep the contract stable**

Append this test:

```ts
it('keeps the no-trigger response when the same session was already checked', async () => {
  await request(app.getHttpServer())
    .post('/api/v1/matching/trigger-check')
    .set('x-test-user-id', '1')
    .send({ sessionId: 'session-blind-box-2', sessionSwipeCount: 3, sessionDuration: 45 })
    .expect(201);

  const second = await request(app.getHttpServer())
    .post('/api/v1/matching/trigger-check')
    .set('x-test-user-id', '1')
    .send({ sessionId: 'session-blind-box-2', sessionSwipeCount: 3, sessionDuration: 45 })
    .expect(201);

  expect(second.body.data).toEqual({
    shouldTrigger: false,
    reason: 'already_checked',
  });
});
```

- [ ] **Step 4: Run the matching suite to verify only the new blind-box contract is failing**

Run:

```bash
cd D:/CodeWorkSpace/SW/backend
npx jest --config ./test/jest-e2e.json --runInBand test/matching.e2e-spec.ts
```

Expected:

```text
FAIL test/matching.e2e-spec.ts
  Matching (e2e)
    ✕ returns a blind box payload with three candidates once thresholds are met
```

- [ ] **Step 5: Commit the failing-test checkpoint**

```bash
git add D:/CodeWorkSpace/SW/backend/test/matching.e2e-spec.ts
git commit -m "test: define blind box trigger payload"
```

---

### Task 2: Implement the backend blind-box candidate payload

**Files:**
- Modify: `D:/CodeWorkSpace/SW/backend/src/matching/matching.service.ts`
- Modify: `D:/CodeWorkSpace/SW/backend/test/matching.e2e-spec.ts`
- Test: `D:/CodeWorkSpace/SW/backend/test/matching.e2e-spec.ts`

- [ ] **Step 1: Update `triggerCheck()` to score multiple candidates instead of a single best user**

Replace the single-best selection block with a scored list:

```ts
const ranked = candidates
  .map((candidate) => {
    const candidateTopics = candidate.profileTags
      .filter((tag) => tag.tagType === 'topic_preference')
      .map((tag) => tag.tagValue);
    const sharedTopics = userTopics.filter((topic) => candidateTopics.includes(topic));
    const score = sharedTopics.length * 25 + (candidate.avatarUrl ? 10 : 0) + 5;
    const tags = sharedTopics.slice(0, 2);

    return {
      candidate,
      score,
      tags,
      reason:
        sharedTopics.length > 0
          ? `你们都更关注${sharedTopics[0]}话题`
          : '你们最近的活跃与表达节奏接近',
    };
  })
  .sort((a, b) => b.score - a.score);

const selected = ranked.slice(0, 3);
const primary = selected[0];
```

- [ ] **Step 2: Return a `blindBox` object while keeping `shouldTrigger` semantics unchanged**

Return this shape from the success branch:

```ts
return {
  shouldTrigger: true,
  blindBox: {
    triggerMode: 'threshold',
    title: '发现同频的人',
    confirmText: '打开盲盒',
    cancelText: '稍后再说',
    candidates: selected.map((item) => ({
      userId: item.candidate.id.toString(),
      nickname: item.candidate.nickname,
      avatar: item.candidate.avatarUrl ?? '',
      tags: item.tags.length > 0 ? item.tags : ['同频'],
    })),
  },
  matchReason: primary.reason,
  matchScore: primary.score,
};
```

Update the no-candidate branch to stay simple:

```ts
if (!primary) {
  return { shouldTrigger: false, reason: 'no_candidate' };
}
```

- [ ] **Step 3: Keep `MatchEvent` creation compatible with the existing schema**

Make sure the `matchEvent.create()` call still uses the primary candidate:

```ts
await this.prisma.matchEvent.create({
  data: {
    userId,
    candidateUserId: primary?.candidate.id,
    sessionId: dto.sessionId,
    triggerReason: primary?.reason ?? 'no_candidate',
    matchScore: primary?.score ?? null,
    resultStatus: primary ? 'matched' : 'no_match',
  },
});
```

- [ ] **Step 4: Run the matching e2e suite and confirm it passes**

Run:

```bash
cd D:/CodeWorkSpace/SW/backend
npx jest --config ./test/jest-e2e.json --runInBand test/matching.e2e-spec.ts
```

Expected:

```text
PASS test/matching.e2e-spec.ts
  Matching (e2e)
    ✓ returns a blind box payload with three candidates once thresholds are met
```

- [ ] **Step 5: Commit the backend contract change**

```bash
git add D:/CodeWorkSpace/SW/backend/src/matching/matching.service.ts D:/CodeWorkSpace/SW/backend/test/matching.e2e-spec.ts
git commit -m "feat: return blind box candidates from matching"
```

---

### Task 3: Replace the home-page modal with a blind-box UI state machine

**Files:**
- Modify: `D:/CodeWorkSpace/SW/pages/home/home.js`
- Modify: `D:/CodeWorkSpace/SW/pages/home/home.wxml`
- Modify: `D:/CodeWorkSpace/SW/pages/home/home.wxss`

- [ ] **Step 1: Add blind-box state to `data` in `home.js`**

Insert these fields in `Page({ data: { ... } })`:

```js
showBlindBox: false,
blindBoxStage: 'closed',
blindBoxTitle: '发现同频的人',
blindBoxCandidates: [],
selectedBlindBoxCandidate: null,
blindBoxOpening: false,
blindBoxSubmitting: false,
blindBoxEnteringChat: false,
```

- [ ] **Step 2: Replace the existing `wx.showModal()` flow with local UI state transitions**

In `checkBlindBoxTrigger()`, replace the modal block with:

```js
if (result.shouldTrigger && result.blindBox && Array.isArray(result.blindBox.candidates)) {
  this.setData({
    showBlindBox: true,
    blindBoxStage: 'prompt',
    blindBoxTitle: result.blindBox.title || '发现同频的人',
    blindBoxCandidates: result.blindBox.candidates.map((item) => ({
      ...item,
      hasAvatar: Boolean(normalizeAvatarUrl(item.avatar || '')),
      avatar: normalizeAvatarUrl(item.avatar || ''),
    })),
    selectedBlindBoxCandidate: null,
  });
  return;
}
```

Add local handlers:

```js
openBlindBox() {
  this.setData({ blindBoxStage: 'candidates' });
},

closeBlindBox() {
  this.setData({
    showBlindBox: false,
    blindBoxStage: 'closed',
    blindBoxCandidates: [],
    selectedBlindBoxCandidate: null,
    blindBoxSubmitting: false,
    blindBoxEnteringChat: false,
  });
},
```

- [ ] **Step 3: Render the blind-box overlay in `home.wxml`**

Add this block before the existing `comment-mask`:

```xml
<view class="blind-box-mask" wx:if="{{showBlindBox}}" catchtouchmove="preventTouchMove">
  <view class="blind-box-panel" catchtap="noop">
    <view wx:if="{{blindBoxStage === 'prompt'}}" class="blind-box-stage">
      <text class="blind-box-title">{{blindBoxTitle}}</text>
      <text class="blind-box-desc">你解锁了 3 位同频候选人，打开看看谁最想认识。</text>
      <button class="blind-box-primary" bindtap="openBlindBox">打开盲盒</button>
      <button class="blind-box-secondary" bindtap="closeBlindBox">稍后再说</button>
    </view>

    <view wx:elif="{{blindBoxStage === 'candidates'}}" class="blind-box-stage">
      <text class="blind-box-title">选择想认识的人</text>
      <view class="blind-box-candidate-list">
        <view class="blind-box-candidate" wx:for="{{blindBoxCandidates}}" wx:key="userId">
          <image wx:if="{{item.hasAvatar}}" class="blind-box-avatar" src="{{item.avatar}}" mode="aspectFill"></image>
          <view wx:else class="blind-box-avatar blind-box-avatar-placeholder"></view>
          <text class="blind-box-name">{{item.nickname}}</text>
          <text class="blind-box-tag">{{item.tags[0]}}</text>
          <button class="blind-box-primary small" data-user-id="{{item.userId}}" bindtap="chooseBlindBoxCandidate">想认识</button>
        </view>
      </view>
    </view>
  </view>
</view>
```

- [ ] **Step 4: Style the overlay in `home.wxss`**

Add these styles near the other modal styles:

```css
.blind-box-mask {
  position: fixed;
  inset: 0;
  background: rgba(18, 18, 18, 0.52);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 30;
}

.blind-box-panel {
  width: 640rpx;
  border-radius: 32rpx;
  background: #fffdf7;
  padding: 40rpx 32rpx;
}

.blind-box-candidate-list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
  margin-top: 24rpx;
}
```

- [ ] **Step 5: Manually verify the UI state change in WeChat DevTools**

Run:

```text
1. 打开首页
2. 在 DevTools 里将 `showBlindBox` 手动改为 `true`
3. 验证 prompt 状态和 candidates 状态都能正常展示
```

Expected:

```text
可看到盲盒遮罩层
点击“打开盲盒”后出现 3 张候选卡片
```

- [ ] **Step 6: Commit the UI shell**

```bash
git add D:/CodeWorkSpace/SW/pages/home/home.js D:/CodeWorkSpace/SW/pages/home/home.wxml D:/CodeWorkSpace/SW/pages/home/home.wxss
git commit -m "feat: add blind box home overlay"
```

---

### Task 4: Wire candidate selection to match success and chat entry

**Files:**
- Modify: `D:/CodeWorkSpace/SW/pages/home/home.js`
- Modify: `D:/CodeWorkSpace/SW/pages/home/home.wxml`
- Modify: `D:/CodeWorkSpace/SW/pages/home/home.wxss`
- Modify: `D:/CodeWorkSpace/SW/docs/API.md`

- [ ] **Step 1: Add the candidate-selection handler in `home.js`**

Add this method:

```js
async chooseBlindBoxCandidate(e) {
  const userId = e.currentTarget.dataset.userId;
  const candidate = this.data.blindBoxCandidates.find((item) => item.userId === userId);
  if (!candidate || this.data.blindBoxSubmitting) {
    return;
  }

  this.setData({ blindBoxSubmitting: true });
  try {
    const connection = await request({
      url: '/api/v1/matching/connections',
      method: 'POST',
      data: {
        candidateUserId: candidate.userId,
        action: 'connect',
      },
    });

    this.setData({
      blindBoxStage: 'success',
      blindBoxSubmitting: false,
      selectedBlindBoxCandidate: {
        ...candidate,
        connectionId: connection.connectionId,
      },
    });
  } catch (error) {
    this.setData({ blindBoxSubmitting: false });
    wx.showToast({ title: '想认识失败', icon: 'none' });
  }
}
```

- [ ] **Step 2: Add the "匹配成功" confirmation state and chat-entry handler**

Add this method:

```js
async enterBlindBoxChat() {
  const candidate = this.data.selectedBlindBoxCandidate;
  if (!candidate || !candidate.connectionId || this.data.blindBoxEnteringChat) {
    return;
  }

  this.setData({ blindBoxEnteringChat: true });
  try {
    const conversation = await request({
      url: '/api/v1/chat/conversations',
      method: 'POST',
      data: { connectionId: candidate.connectionId },
    });
    this.closeBlindBox();
    wx.redirectTo({
      url: `/pages/chat/chat?conversationId=${conversation.conversationId}`,
    });
  } catch (error) {
    this.setData({ blindBoxEnteringChat: false });
    wx.showToast({ title: '进入小纸条失败', icon: 'none' });
  }
}
```

Render the success state in `home.wxml`:

```xml
<view wx:elif="{{blindBoxStage === 'success'}}" class="blind-box-stage">
  <text class="blind-box-title">匹配成功</text>
  <text class="blind-box-desc">你和 {{selectedBlindBoxCandidate.nickname}} 已互相想认识。</text>
  <button class="blind-box-primary" bindtap="enterBlindBoxChat" loading="{{blindBoxEnteringChat}}">进入小纸条</button>
  <button class="blind-box-secondary" bindtap="closeBlindBox">稍后再去</button>
</view>
```

- [ ] **Step 3: Update the API reference to match the new trigger response**

In `D:/CodeWorkSpace/SW/docs/API.md`, replace the matching trigger bullet with:

```md
- `POST /api/v1/matching/trigger-check`
  - purpose: evaluate whether the current session should surface a blind box
  - success payload when triggered:
    - `shouldTrigger = true`
    - `blindBox.triggerMode = threshold`
    - `blindBox.candidates[]` with `userId`, `nickname`, `avatar`, `tags`
```

- [ ] **Step 4: Run backend tests and do a manual full-flow verification**

Run:

```bash
cd D:/CodeWorkSpace/SW/backend
npx jest --config ./test/jest-e2e.json --runInBand test/matching.e2e-spec.ts
```

Then manually verify:

```text
1. 首页滑卡达到阈值
2. 看到盲盒弹层
3. 打开盲盒并点任意一个“想认识”
4. 看到“匹配成功”确认态
5. 点击“进入小纸条”
6. 成功跳转到聊天详情页
```

Expected:

```text
matching e2e PASS
前端主闭环可完整跑通
```

- [ ] **Step 5: Commit the end-to-end MVP P0 flow**

```bash
git add D:/CodeWorkSpace/SW/pages/home/home.js D:/CodeWorkSpace/SW/pages/home/home.wxml D:/CodeWorkSpace/SW/pages/home/home.wxss D:/CodeWorkSpace/SW/docs/API.md
git commit -m "feat: connect blind box trigger to chat flow"
```

---

### Task 5: Final regression pass and handoff notes

**Files:**
- Modify: `D:/CodeWorkSpace/SW/docs/superpowers/specs/2026-04-14-blind-box-mechanism-design.md` (only if implementation constraints require a spec note)
- Test: `D:/CodeWorkSpace/SW/backend/test/matching.e2e-spec.ts`

- [ ] **Step 1: Run the focused backend regression suite**

Run:

```bash
cd D:/CodeWorkSpace/SW/backend
npx jest --config ./test/jest-e2e.json --runInBand test/matching.e2e-spec.ts test/chat.e2e-spec.ts
```

Expected:

```text
PASS test/matching.e2e-spec.ts
PASS test/chat.e2e-spec.ts
```

- [ ] **Step 2: Perform a smoke test for unaffected home-page flows**

Check these manually:

```text
- 滑卡仍然能切换卡片
- 评论弹层仍能打开
- 分享面板仍能打开
- 底部导航仍能跳转
```

- [ ] **Step 3: If implementation forced a spec-level deviation, document it explicitly**

Only if needed, append a short note like this to the spec:

```md
## MVP P0 Implementation Note

- The released MVP keeps the "双方都点想认识" copy, but technically simulates peer approval in order to validate the main blind-box-to-chat loop.
```

- [ ] **Step 4: Commit the regression checkpoint**

```bash
git add D:/CodeWorkSpace/SW/docs/superpowers/specs/2026-04-14-blind-box-mechanism-design.md
git commit -m "docs: note blind box mvp implementation constraints"
```

---

## Self-Review

### Spec coverage

- MVP P0 trigger shell: covered by Task 3
- 3-candidate blind box payload: covered by Task 1 and Task 2
- 想认识 -> 成功确认 -> 小纸条: covered by Task 4
- Minimal analytics/状态字段: not implemented in this plan; intentionally deferred because the current codebase has no existing analytics sink and MVP P0 only needs the UI and API loop. If event logging already exists elsewhere during implementation, add it inside Task 4 without widening scope.

### Placeholder scan

- No `TODO`, `TBD`, or open placeholders remain in tasks
- Commands, files, and expected outputs are concrete

### Type consistency

- Backend response uses `blindBox.candidates[]`
- Frontend consumes `blindBoxCandidates`
- Candidate field names stay aligned as `userId`, `nickname`, `avatar`, `tags`
