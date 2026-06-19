# Sephire Lab 基础 MVP 实施计划

## 执行原则

父任务 `06-18-site-direction-architecture` 保持 planning 状态，作为总规划、任务地图和跨子任务验收来源。不要直接在父任务里开始业务代码实现。

基础 MVP 拆成多个 child tasks，在不同 session 中逐个完成。每个 child task 都应有自己的 `prd.md`，必要时补 `design.md` / `implement.md`，并在实现前通过 `task.py start <child>` 进入 in_progress。

## 子任务拆分

### 1. 路由与静态导出基础

目标：

- 将公开 Writing 路由从 `/blog` / `/blog/[slug]` 改为 `/writing` / `/writing/[slug]`。
- 删除旧 `/blog`、`/blog/[slug]`、`/tools`。
- 更新导航为 `Writing`、`Music`、`Gallery`、`About`。
- 更新 metadata，移除 online tools 表述。
- 配置并验证完整静态导出兼容。

验收：

- `/writing` 和 `/writing/[slug]` 可访问。
- `/blog`、`/tools` 不再作为应用路由存在。
- `pnpm lint` 通过。
- `pnpm build` 通过并生成静态导出产物。

### 2. YAML 内容模型与种子媒体

目标：

- 为 Gallery / Music 建立 YAML 内容源和 zod schema。
- 建立构建期 loader，输出类型安全数据。
- 建立 `public/gallery/...` 与 `public/music/...` 媒体目录约定。
- 添加基础 MVP 样例内容：Gallery 1 个照片集至少 5 张图；Music 3 张专辑。

验收：

- Gallery / Music 内容在 build 时读取并校验。
- 无效 YAML/schema 能在构建或 loader 调用时报错。
- `pnpm lint` 和 `pnpm build` 通过。

### 3. Gallery 骨架页面

目标：

- 实现 `/gallery` 照片集索引页骨架。
- 实现 `/gallery/[slug]` 照片集详情页骨架。
- 详情页先展示网页优化图和基础说明，不做高保真横向摄影集交互。
- `generateStaticParams` 枚举所有照片集 slug。

验收：

- `/gallery` 能列出照片集。
- `/gallery/[slug]` 能显示至少 5 张图片。
- 未定义 slug 在静态路由边界内按预期处理。
- `pnpm lint` 和 `pnpm build` 通过。

### 4. Music 骨架页面

目标：

- 实现 `/music` 专辑墙索引页骨架。
- 实现 `/music/[slug]` 专辑详情页骨架。
- 详情页展示封面、艺术家、年份、短评和非交互播放占位。
- 不接入音频、不放假播放按钮、不引入第三方嵌入。
- `generateStaticParams` 枚举所有专辑 slug。

验收：

- `/music` 能展示 3 张专辑。
- `/music/[slug]` 能展示专辑详情。
- 不存在可点击但不能播放的假播放控件。
- `pnpm lint` 和 `pnpm build` 通过。

### 5. 首页 / About / Header / 主题整理

目标：

- 首页首屏保留 `Sephire Lab`，下方改为四模块入口/摘要。
- 为未来首页粒子交互预留组件边界，但不实现粒子效果。
- About 改为极简个人说明页。
- Header 保留左侧 logo、居中导航、右侧主题控件。
- 隐藏语言切换控件。
- 全站主题只暴露 `light` / `dark`；`reader` 收敛到 Writing 阅读场景。
- 不启用全局 footer。

验收：

- 首页不再只突出 Recent Writing。
- About 不再是占位页。
- Header 不显示语言切换控件。
- Gallery / Music / About 不受全站 reader 主题控制。
- `pnpm lint` 和 `pnpm build` 通过。

## 后续设计稿驱动任务

这些任务不属于基础 MVP，等设计稿交付后再创建或细化：

- 首页光标粒子交互。
- Gallery 高保真横向摄影集体验。
- Music 高保真专辑详情页视觉与主题色背景。
- Music 音频片段播放能力。
- Gallery 高分辨率图片查看或下载策略。
- 双语 / i18n。

## 建议执行顺序

1. 路由与静态导出基础。
2. YAML 内容模型与种子媒体。
3. Gallery 骨架页面。
4. Music 骨架页面。
5. 首页 / About / Header / 主题整理。

这个顺序先稳定路由和静态导出，再建立数据，再铺页面，最后整理全局外壳。

## 验证命令

每个 child task 至少运行：

```bash
pnpm lint
pnpm build
```

涉及静态导出的 child task 还应确认：

```bash
test -d out
```

如果 `output: "export"` 产物路径或 Next 版本行为有变化，以 `pnpm build` 的实际输出为准，并把确认结果写回对应 child task。

## 风险点

- `next/image` 默认优化器和静态导出存在兼容限制，图片策略必须验证。
- YAML parser 依赖尚未最终确定；实现前确认复用现有依赖是否足够，或新增轻量解析依赖。
- `reader` 从全站主题收敛到 Writing 可能触及现有 ThemeDropdown 和全局 CSS，需要谨慎验证主题切换。
- 删除 `/blog`、`/tools` 是有意破坏旧 URL 的迁移，不能在实现中悄悄加兼容路由。
- Gallery / Music 高保真交互不应混入基础 MVP，避免没有设计稿时过早定型。
