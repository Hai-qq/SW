# SW V2 Profile Editing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add editable user profile and photo-wall management on top of the shipped V1 MVP without introducing WeChat login or file upload infrastructure.

**Architecture:** Extend the existing `profile` backend module instead of creating a new domain slice. Keep the backend focused on CRUD for base profile fields plus ordered photo records, then add a dedicated `profile-edit` Mini Program page so the existing `profile` display page stays visually simple and only handles read-only rendering plus navigation.

**Tech Stack:** NestJS, Prisma, PostgreSQL, Jest, Supertest, WeChat Mini Program, JavaScript

---

## Scope check

This plan covers one focused V2 sub-project: **profile editing and photo-wall management**.

It intentionally does not include:

- WeChat login
- cloud/object storage uploads
- relationship graph
- chat
- recommendation retraining

---

## Planned file structure

### Backend files to modify

- Modify: `backend/prisma/schema.prisma`
- Modify: `backend/prisma/seed.ts`
- Modify: `backend/src/profile/profile.controller.ts`
- Modify: `backend/src/profile/profile.service.ts`
- Modify: `backend/src/profile/profile.module.ts`

### Backend files to create

- Create: `backend/src/profile/dto/update-profile.dto.ts`
- Create: `backend/src/profile/dto/add-profile-photo.dto.ts`
- Create: `backend/src/profile/dto/sort-profile-photos.dto.ts`
- Create: `backend/test/profile-edit.e2e-spec.ts`

### Frontend files to modify

- Modify: `pages/profile/profile.js`
- Modify: `pages/profile/profile.wxml`

### Frontend files to create

- Create: `pages/profile-edit/profile-edit.js`
- Create: `pages/profile-edit/profile-edit.wxml`
- Create: `pages/profile-edit/profile-edit.wxss`
- Create: `pages/profile-edit/profile-edit.json`
- Modify: `app.json`

---

### Task 1: Extend backend profile read model and update contract

**Files:**
- Modify: `backend/src/profile/profile.service.ts`
- Modify: `backend/src/profile/profile.controller.ts`
- Test: `backend/test/profile-edit.e2e-spec.ts`

- [ ] **Step 1: Write the failing e2e for expanded profile info**

```ts
it('returns expanded editable profile fields and photo objects', async () => {
  const response = await request(app.getHttpServer())
    .get('/api/v1/profile/info')
    .set('x-test-user-id', '1')
    .expect(200);

  expect(response.body.data).toMatchObject({
    userId: '1',
    nickname: expect.any(String),
    city: expect.any(String),
    relationshipStatus: expect.any(String),
    photos: [
      {
        photoId: expect.any(String),
        photoUrl: expect.any(String),
        sortOrder: expect.any(Number),
      },
    ],
  });
});
```

- [ ] **Step 2: Run the new profile-edit spec to verify the contract fails**

Run: `npm test -- --runInBand test/profile-edit.e2e-spec.ts`
Expected: FAIL because current `profile/info` still returns a string-array `photos` shape and lacks expanded fields.

- [ ] **Step 3: Update `ProfileService.getInfo()` to return the expanded DTO shape**

```ts
return {
  userId: user.id.toString(),
  nickname: user.nickname,
  gender: user.gender,
  age: user.ageRange,
  mbti: user.mbti,
  signature: user.signature,
  city: user.city,
  relationshipStatus: user.relationshipStatus,
  photos: photos.map((item) => ({
    photoId: item.id.toString(),
    photoUrl: item.photoUrl,
    sortOrder: item.sortOrder,
  })),
  counts: {
    visitors: 0,
    followers: 0,
    following: 0,
    interactions: swipeCount,
  },
};
```

- [ ] **Step 4: Re-run the profile-edit spec**

Run: `npm test -- --runInBand test/profile-edit.e2e-spec.ts`
Expected: PASS for the expanded `GET /api/v1/profile/info` contract.

- [ ] **Step 5: Commit the read-model upgrade**

```bash
git add backend/src/profile backend/test/profile-edit.e2e-spec.ts
git commit -m "feat: expand profile info contract"
```

### Task 2: Add profile base-field editing endpoint

**Files:**
- Create: `backend/src/profile/dto/update-profile.dto.ts`
- Modify: `backend/src/profile/profile.controller.ts`
- Modify: `backend/src/profile/profile.service.ts`
- Test: `backend/test/profile-edit.e2e-spec.ts`

- [ ] **Step 1: Add a failing test for `PATCH /api/v1/profile/info`**

```ts
it('updates editable base profile fields', async () => {
  await request(app.getHttpServer())
    .patch('/api/v1/profile/info')
    .set('x-test-user-id', '1')
    .send({
      nickname: '林深处的麋鹿',
      signature: '在喧嚣里寻找同频',
      mbti: 'INFJ',
      city: 'Shanghai',
      gender: 'female',
      ageRange: 'gen-z',
      relationshipStatus: 'single',
    })
    .expect(200)
    .expect({
      code: 200,
      message: 'success',
      data: { updated: true },
    });
});
```

- [ ] **Step 2: Run the spec and confirm the route does not exist yet**

Run: `npm test -- --runInBand test/profile-edit.e2e-spec.ts`
Expected: FAIL with 404 for `PATCH /api/v1/profile/info`.

- [ ] **Step 3: Create `UpdateProfileDto` with explicit validation**

```ts
export class UpdateProfileDto {
  @IsOptional() @IsString() @MaxLength(32) nickname?: string;
  @IsOptional() @IsString() @MaxLength(120) signature?: string;
  @IsOptional() @IsIn(['INTJ','INTP','ENTJ','ENTP','INFJ','INFP','ENFJ','ENFP','ISTJ','ISFJ','ESTJ','ESFJ','ISTP','ISFP','ESTP','ESFP']) mbti?: string;
  @IsOptional() @IsString() @MaxLength(64) city?: string;
  @IsOptional() @IsIn(['male', 'female']) gender?: string;
  @IsOptional() @IsIn(['gen-z', '90s']) ageRange?: string;
  @IsOptional() @IsIn(['single', 'not-single']) relationshipStatus?: string;
}
```

- [ ] **Step 4: Add controller + service update method**

```ts
@Patch('info')
updateInfo(@CurrentUser() user: { id: bigint }, @Body() dto: UpdateProfileDto) {
  return this.profileService.updateInfo(user.id, dto);
}
```

```ts
async updateInfo(userId: bigint, dto: UpdateProfileDto) {
  await this.prisma.user.update({
    where: { id: userId },
    data: dto,
  });

  return { updated: true };
}
```

- [ ] **Step 5: Add a read-after-write assertion and rerun**

```ts
const profile = await request(app.getHttpServer())
  .get('/api/v1/profile/info')
  .set('x-test-user-id', '1')
  .expect(200);

expect(profile.body.data.nickname).toBe('林深处的麋鹿');
expect(profile.body.data.city).toBe('Shanghai');
```

Run: `npm test -- --runInBand test/profile-edit.e2e-spec.ts`
Expected: PASS for update + read-back.

- [ ] **Step 6: Commit profile field editing**

```bash
git add backend/src/profile backend/test/profile-edit.e2e-spec.ts
git commit -m "feat: add editable profile fields"
```

### Task 3: Add photo create/delete/sort APIs

**Files:**
- Create: `backend/src/profile/dto/add-profile-photo.dto.ts`
- Create: `backend/src/profile/dto/sort-profile-photos.dto.ts`
- Modify: `backend/src/profile/profile.controller.ts`
- Modify: `backend/src/profile/profile.service.ts`
- Modify: `backend/prisma/seed.ts`
- Test: `backend/test/profile-edit.e2e-spec.ts`

- [ ] **Step 1: Add failing tests for photo creation, deletion, and sorting**

```ts
it('adds a photo to the end of the photo wall', async () => {
  const response = await request(app.getHttpServer())
    .post('/api/v1/profile/photos')
    .set('x-test-user-id', '1')
    .send({ photoUrl: 'https://example.com/photos/new-photo.jpg' })
    .expect(200);

  expect(response.body.data).toMatchObject({
    created: true,
    photoId: expect.any(String),
  });
});

it('deletes one of the current user photos', async () => {
  await request(app.getHttpServer())
    .delete('/api/v1/profile/photos/1')
    .set('x-test-user-id', '1')
    .expect(200);
});

it('reorders photos', async () => {
  await request(app.getHttpServer())
    .patch('/api/v1/profile/photos/sort')
    .set('x-test-user-id', '1')
    .send({
      items: [
        { photoId: '2', sortOrder: 0 },
        { photoId: '1', sortOrder: 1 },
      ],
    })
    .expect(200);
});
```

- [ ] **Step 2: Run the profile-edit suite and confirm the new routes fail**

Run: `npm test -- --runInBand test/profile-edit.e2e-spec.ts`
Expected: FAIL with 404 for the photo endpoints.

- [ ] **Step 3: Add the DTOs**

```ts
export class AddProfilePhotoDto {
  @IsString()
  @MaxLength(500)
  photoUrl!: string;
}
```

```ts
class SortProfilePhotoItemDto {
  @IsString() photoId!: string;
  @Type(() => Number) @Min(0) sortOrder!: number;
}

export class SortProfilePhotosDto {
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => SortProfilePhotoItemDto)
  items!: SortProfilePhotoItemDto[];
}
```

- [ ] **Step 4: Implement add-photo endpoint with max-photo guard**

```ts
const currentCount = await this.prisma.userPhoto.count({
  where: { userId, status: 'active' },
});

if (currentCount >= 9) {
  throw new BadRequestException('photo_limit_reached');
}

const created = await this.prisma.userPhoto.create({
  data: {
    userId,
    photoUrl: dto.photoUrl,
    sortOrder: currentCount,
  },
});

return { photoId: created.id.toString(), created: true };
```

- [ ] **Step 5: Implement delete-photo with ownership check and reindexing**

```ts
const target = await this.prisma.userPhoto.findFirstOrThrow({
  where: { id: BigInt(photoId), userId, status: 'active' },
});

await this.prisma.$transaction(async (tx) => {
  await tx.userPhoto.update({
    where: { id: target.id },
    data: { status: 'deleted' },
  });

  const remaining = await tx.userPhoto.findMany({
    where: { userId, status: 'active' },
    orderBy: { sortOrder: 'asc' },
  });

  for (const [index, item] of remaining.entries()) {
    await tx.userPhoto.update({
      where: { id: item.id },
      data: { sortOrder: index },
    });
  }
});
```

- [ ] **Step 6: Implement bulk sort with ownership validation**

```ts
const ids = dto.items.map((item) => BigInt(item.photoId));
const ownedPhotos = await this.prisma.userPhoto.findMany({
  where: { userId, id: { in: ids }, status: 'active' },
});

if (ownedPhotos.length !== dto.items.length) {
  throw new BadRequestException('invalid_photo_selection');
}

await this.prisma.$transaction(
  dto.items.map((item) =>
    this.prisma.userPhoto.update({
      where: { id: BigInt(item.photoId) },
      data: { sortOrder: item.sortOrder },
    }),
  ),
);

return { updated: true };
```

- [ ] **Step 7: Rerun the suite and verify read-back ordering**

Run: `npm test -- --runInBand test/profile-edit.e2e-spec.ts`
Expected: PASS, and `GET /api/v1/profile/info` returns the new photo order.

- [ ] **Step 8: Commit photo management**

```bash
git add backend/src/profile backend/prisma/seed.ts backend/test/profile-edit.e2e-spec.ts
git commit -m "feat: add profile photo management"
```

### Task 4: Add a dedicated Mini Program profile-edit page

**Files:**
- Create: `pages/profile-edit/profile-edit.js`
- Create: `pages/profile-edit/profile-edit.wxml`
- Create: `pages/profile-edit/profile-edit.wxss`
- Create: `pages/profile-edit/profile-edit.json`
- Modify: `app.json`
- Modify: `pages/profile/profile.js`
- Modify: `pages/profile/profile.wxml`

- [ ] **Step 1: Add a minimal navigation link from profile to the new edit page**

```js
goToEditProfile() {
  wx.navigateTo({ url: '/pages/profile-edit/profile-edit' });
}
```

```xml
<button class="edit-profile-btn" bindtap="goToEditProfile">编辑资料</button>
```

- [ ] **Step 2: Create the new page skeleton**

`pages/profile-edit/profile-edit.js`

```js
const { request } = require('../../utils/request');

Page({
  data: {
    form: {
      nickname: '',
      signature: '',
      mbti: '',
      city: '',
      gender: '',
      ageRange: '',
      relationshipStatus: '',
    },
    photos: [],
  },
});
```

Add the page path into `app.json` page registration.

- [ ] **Step 3: Build a failing manual behavior checkpoint**

Manual action:
- Open `profile`
- Tap “编辑资料”
- Expect a navigable edit page shell

Expected current state before completion:
- The page opens, but save / photo actions are not wired yet.

- [ ] **Step 4: Implement initial data load into the edit form**

```js
async onLoad() {
  const profile = await request({ url: '/api/v1/profile/info' });
  this.setData({
    form: {
      nickname: profile.nickname || '',
      signature: profile.signature || '',
      mbti: profile.mbti || '',
      city: profile.city || '',
      gender: profile.gender || '',
      ageRange: profile.age || '',
      relationshipStatus: profile.relationshipStatus || '',
    },
    photos: profile.photos || [],
  });
}
```

- [ ] **Step 5: Implement save action**

```js
async saveProfile() {
  await request({
    url: '/api/v1/profile/info',
    method: 'PATCH',
    data: this.data.form,
  });

  wx.showToast({ title: '已保存', icon: 'none' });
  setTimeout(() => {
    wx.navigateBack();
  }, 300);
}
```

- [ ] **Step 6: Add minimal photo controls**

Use:
- one text input for photo URL
- “新增照片” button
- “删除” button on each photo row
- “上移 / 下移” buttons for reorder

```js
async addPhoto() {
  await request({
    url: '/api/v1/profile/photos',
    method: 'POST',
    data: { photoUrl: this.data.newPhotoUrl },
  });
}
```

```js
async deletePhoto(e) {
  await request({
    url: `/api/v1/profile/photos/${e.currentTarget.dataset.photoId}`,
    method: 'DELETE',
  });
}
```

```js
async syncPhotoOrder(items) {
  await request({
    url: '/api/v1/profile/photos/sort',
    method: 'PATCH',
    data: {
      items: items.map((item, index) => ({
        photoId: item.photoId,
        sortOrder: index,
      })),
    },
  });
}
```

- [ ] **Step 7: Refresh profile page after returning**

In `pages/profile/profile.js`:

```js
async onShow() {
  await this.loadProfile();
}
```

This ensures saved edits immediately reflect on the display page.

- [ ] **Step 8: Commit the frontend editing flow**

```bash
git add app.json pages/profile pages/profile-edit
git commit -m "feat: add profile editing page"
```

### Task 5: End-to-end verification and docs touch-up

**Files:**
- Modify: `backend/README.md`
- Modify: `README.md`

- [ ] **Step 1: Add a new e2e suite run to the verification checklist**

Run: `npm test -- --runInBand test/profile-edit.e2e-spec.ts`
Expected: PASS.

- [ ] **Step 2: Run the full backend suite**

Run: `npm test -- --runInBand`
Expected: All backend suites PASS, including the new profile-edit coverage.

- [ ] **Step 3: Run backend build**

Run: `npm run build`
Expected: PASS with no TypeScript errors.

- [ ] **Step 4: Manual Mini Program verification**

Manual flow:
1. Open `pages/profile/profile`
2. Tap “编辑资料”
3. Change nickname and signature
4. Save and return
5. Verify display page refreshes
6. Add one photo URL
7. Delete one photo
8. Move one photo up or down

Expected:
- No WXML compile errors
- All actions round-trip against the backend successfully

- [ ] **Step 5: Update docs**

Add one short section to `backend/README.md`:

```md
## V2 Profile Editing

This service now supports profile editing and photo-wall management through:
- `PATCH /api/v1/profile/info`
- `POST /api/v1/profile/photos`
- `DELETE /api/v1/profile/photos/:photoId`
- `PATCH /api/v1/profile/photos/sort`
```

Add one short note to `README.md`:

```md
The Mini Program now includes a V2 profile editing flow backed by the local NestJS API.
```

- [ ] **Step 6: Commit docs and final verification**

```bash
git add README.md backend/README.md
git commit -m "docs: document profile editing flow"
```

---

## Self-review

### Spec coverage

- Expanded `profile/info`: covered in Task 1.
- Base profile editing: covered in Task 2.
- Photo add/delete/sort: covered in Task 3.
- Dedicated front-end editing flow: covered in Task 4.
- Verification and docs: covered in Task 5.

### Placeholder scan

- No `TODO`, `TBD`, or “handle appropriately” placeholders remain.
- Each behavior-changing step includes concrete commands or code snippets.

### Type consistency

- `ageRange` is the write field, `age` is the read field, and this mapping is used consistently.
- `photos` are object arrays throughout V2, with `photoId`, `photoUrl`, and `sortOrder`.
- The profile-edit page reads and writes exactly the fields introduced in the DTOs.
