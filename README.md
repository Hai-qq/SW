# Same Wavelength (同频) - 微信小程序

这是一个注重前端美学与交互体验的微信小程序项目。项目旨在提供流畅、动态的用户交互，并且在设计上追求精致的高级感。

## 当前状态

截至 2026-04-11，项目已经从纯前端原型进入真实后端联调阶段。当前已完成：

- `V1 / MVP` 主链路后端与小程序联调
- `V2` 用户资料编辑与照片墙管理
- `V3` Discovery 草稿、发布与我的发布
- `V4` 微信登录与 Bearer token 身份体系
- `V5` 多用户进入流程与基础连接关系
- `V6` 轻量一对一聊天
- `V7` Home / Discovery / Chat 互动闭环
- `V8` Home 评论与 Chat 空状态开聊入口

当前下一阶段重点是实时性、安全治理、图片上传和推荐质量，而不是“有没有后端”。更完整的状态说明见 `docs/superpowers/specs/2026-04-11-page-backend-status-and-remaining-work.md`。

## 核心模块

本项目目前包含以下几个主要模块：
- **引导页 (Onboarding)**：展示给新用户的引导流程，丰富的动效过渡。
- **冲浪 / Home**：真实后端推荐卡片、滑卡、匹配、连接、卡片评论和开聊入口。
- **真心话 / Discovery**：真实后端 feed、发布、草稿、我的发布、点赞和评论。
- **小纸条 / Chat**：真实后端会话列表、消息列表、文本发送、未读计数、已读标记和分页。
- **个人中心 (Profile)**：资料展示、资料编辑和照片墙管理。

## 🚀 启动与使用

1. 确保已安装最新版的 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)。
2. 在微信开发者工具中，选择 **导入项目**。
3. 选择当前项目目录 (`SW`)。
4. AppID 可以填入自己的测试号或是选择“测试号”。
5. 若需联调真实后端，先启动 `backend` 中的 NestJS 服务。
6. 即可在开发者工具中进行预览和调试。

## 后端联调

- 后端目录：`backend`
- API 地址：`http://127.0.0.1:3005`
- PostgreSQL：`localhost:5434`
- 启动顺序：
  1. `docker compose up -d`
  2. `npm run prisma:generate`
  3. `npm run prisma:migrate -- --name mvp_baseline`
  4. `npm run prisma:seed`
  5. `npm run start:dev`

主要 API 说明见 `docs/API.md`，后端模块说明见 `backend/README.md`。

## 🛠 技术栈

- 微信小程序原生框架 (WXML, WXSS, JS)
- 自定义高级动画与交互逻辑
- 全新的视觉设计语言（深色模式/多态交互卡片等）

## 📄 设计哲学
- **极简与生动 (Minimal & Dynamic)**：去除多余的边框与元素，利用微动效构建有生命力的界面。
- **高级感 (Premium Feel)**：细致的字体排版、和谐的配色系统以及深色模式优化。

---
*Created by [Hai-qq](https://github.com/Hai-qq)*
