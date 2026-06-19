# 首页 / About / Header / 主题整理

## 目标

整理基础 MVP 的全局外壳与普通页面：首页从 Recent Writing 偏向改为四模块入口，About 从占位页改为极简说明页，Header 隐藏语言切换并保留 logo，主题策略收敛为全站 light/dark + Writing reader。

## 父任务

- `.trellis/tasks/06-18-site-direction-architecture`

## 前置任务

- `06-19-route-static-export-shell`

## 需求

- 首页首屏保留极简 `Sephire Lab`。
- 首页下方从 `Recent Writing` 改为 `Writing`、`Music`、`Gallery`、`About` 四模块入口或摘要。
- 为未来首页光标粒子交互预留组件边界，但不实现粒子效果。
- About 改为极简个人说明页：一段个人说明、几个链接/联系方式、一句站点说明。
- Header 保留左侧 logo、居中导航、右侧主题控件。
- 隐藏当前只保存本地状态的语言切换控件，不做 i18n。
- 全站主题只暴露 `light` / `dark`。
- `reader` 收敛到 Writing 文章阅读场景，不作为 Gallery / Music / About 的全站视觉模式。
- 不启用全局 footer；已有 `SiteFooter` 暂不挂载。

## 非目标

- 不实现首页光标粒子效果。
- 不做完整个人履历或时间线。
- 不做双语/i18n。
- 不做 Gallery / Music 高保真交互。

## 验收标准

- [ ] 首页下方展示四模块入口/摘要，而不是只展示 Recent Writing。
- [ ] About 不再是占位页。
- [ ] Header 保留 logo，并显示新导航。
- [ ] Header 不显示语言切换控件。
- [ ] Gallery / Music / About 不受全站 reader 主题控制。
- [ ] 全局 footer 未启用。
- [ ] `pnpm lint` 通过。
- [ ] `pnpm build` 通过。

## 后续任务

首页粒子交互等设计稿驱动能力在设计稿交付后另建任务。
