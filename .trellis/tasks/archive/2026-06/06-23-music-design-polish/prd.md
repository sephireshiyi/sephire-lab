# 按设计稿修复 Music 页面

## 目标

只针对 Music 模块，按开发者提供的设计稿（`design/Music - Index - {Light,Dark}.png`、`design/Music - Album{,-1,-2}.png`）把 `/music` 专辑墙和 `/music/[slug]` 专辑详情页从「基础 MVP 骨架」打磨到接近设计稿的视觉。本任务不处理 Gallery 横向浏览，也不处理 Writing reader 主题。

## 父任务

- `.trellis/tasks/06-18-site-direction-architecture`

## 前置任务（已归档）

- `06-19-route-static-export-shell`（静态导出外壳）
- `06-19-yaml-content-models-seed-media`（YAML 内容模型 + 种子媒体）
- `06-19-music-skeleton-pages`（Music 骨架页面，本任务在其产出上打磨）

## 需求

### `/music` 专辑墙索引页

- 表现为专辑封面墙：桌面端大间距封面网格，封面优先，文字不破坏视觉秩序。
- 当前只有 3 张专辑也必须排版稳定（不溢出、不重叠、不空旷失衡）。
- 未来内容增加时应自然扩展为设计稿那样的多行专辑墙（响应式网格，无需改代码即可加专辑）。
- 每张封面可点击进入 `/music/[slug]`。
- light / dark 主题都可用。

### `/music/[slug]` 专辑详情页

- 左侧大封面，右侧专辑标题、艺术家、年份、类型/标签（tags）等核心信息。
- 整页背景使用 YAML 里的 `themeColor` 形成主题色氛围，参考设计稿的 fading 处理（Apple Music 气质），light / dark 都自然适配。
- 短评（`note`）可保留，但短评和曲目列表不能压坏首屏视觉；放到更次级的位置。
- 保留非交互播放区域占位，但**不得**放置会误导用户的假播放按钮或假交互控件。
- 封面正常显示，light / dark 下视觉不重叠、信息可读。

### 内容模型

- 在 Music schema 新增可选 `tags: string[]` 字段。
- 3 张专辑 YAML 各自填上合理的 tags。
- 详情页渲染 tags 为小标签；索引页不显示 tags，保持封面墙纯粹。

### 全局约束（与父任务一致）

- 保持完全静态导出兼容：不引入服务端运行时、数据库、API、第三方播放器或音频文件。
- 不修改 Gallery、Writing、About 的业务行为。
- 不重新引入 `/blog`、`/tools` 或任何 redirect。
- 不改动导航（当前已是 `Writing / Music / Gallery / About`，符合产品决策；设计稿里出现的 `Tools` 不还原）。
- 遵循现有主题约定：用 inline CSS 变量（`var(--text-*)`、`var(--bg-*)` 等），不引入 `dark:` Tailwind 变体；间距用 `@theme` 的 `2xs..5xl` scale。
- 不引入新依赖。

## 非目标

- 不做真实音频播放、不接入播放器、不放音频文件。
- 不处理 Gallery 横向浏览或 Writing reader 主题。
- 不做首页、About 的视觉改动。
- 不做 i18n、不做全局 footer。
- 不做像素级的设计稿还原自动化比对（本环境无视觉能力，视觉对齐由开发者人工确认，见下「验证限制」）。

## 验证限制（本 session 特有，必须如实遵守）

- 本 session 运行在 glm-5.2，**无视觉能力**：无法直接查看 5 张设计图，也无法查看浏览器截图。子 agent 的 model 覆盖在本环境不生效，因此没有任何 agent 能看图。
- 因此本任务的「视觉对齐」分两层：
  - **我（Claude）负责**：按文字需求 + 父 prd 设计意图 + 代码现有约定实现；跑 `pnpm lint`；在 `/tmp` 副本跑 `pnpm build` + `test -d out`；做 DOM/结构层面检查（确认不重叠、封面渲染、静态导出、无控制台报错、tags 渲染、主题色背景生效）。
  - **开发者负责**：在浏览器看 `/music` 和至少一个 `/music/[slug]` 的 light/dark，确认视觉接近设计图，把偏差反馈给 Claude 迭代。
- 我不得声称自己「看到了设计图」或「确认了像素级视觉对齐」。

## 验收标准

- [ ] `/music` 为大间距封面墙网格，3 张专辑排版稳定，响应式可自然扩展多行；light/dark 都可用。
- [ ] `/music/[slug]` 左大封面 + 右核心信息（标题/艺术家/年份/tags），背景以 `themeColor` 形成主题色氛围且 light/dark 自然适配。
- [ ] 短评与曲目列表处于次级位置，不压首屏。
- [ ] 详情页无假播放按钮或误导性交互控件（保留非交互占位可接受）。
- [ ] Music schema 新增可选 `tags` 字段，3 张专辑 YAML 已填充 tags，zod 构建期校验通过。
- [ ] `pnpm lint` 通过。
- [ ] `/tmp` 副本 `pnpm build` 通过且 `out/` 生成（静态导出兼容）。
- [ ] 未改动 Gallery / Writing / About 业务行为；未引入 `/blog`、`/tools`、redirect、音频/播放器/API/数据库/新依赖。
- [ ] 提交按 `task-completion-guide.md` 规则：仅提交本任务范围内文件，commit message 用 `Refine music page layouts from design references` 风格。

## 后续任务

- 真实音频播放能力另拆独立任务。
- 若开发者视觉确认后发现偏差，作为本任务的迭代轮次继续修正。
