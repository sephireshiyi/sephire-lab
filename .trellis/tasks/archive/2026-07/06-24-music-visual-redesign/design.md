# Music 页面视觉重做 - 技术设计

## 设计目标

将 `/music` 索引页和 `/music/[slug]` 详情页从骨架状态提升到设计图的高保真视觉，同时保持完全静态导出兼容、现有 CSS 约定和主题系统。

## 架构边界

### 不变的部分

- 路由结构：`/music`（索引）和 `/music/[slug]`（详情）。
- YAML 内容模型：`lib/music.ts` 的 `MusicSchema` 和 `Album` 类型。
- 静态导出策略：`generateStaticParams` + `dynamicParams = false`。
- 主题系统：inline CSS 变量（`var(--text-*)`, `var(--bg-*)` 等），不引入 `dark:` Tailwind 变体。
- Spacing scale：使用 `@theme` 的 `2xs..5xl`。
- 图片策略：`images.unoptimized = true` + 普通 `<img>` 标签。

### 变化的部分

- `/music` 页面布局：网格列数、间距、容器宽度、文字大小。
- `/music/[slug]` 页面视觉：背景渐变强度、封面阴影、标题字号、播放占位处理。
- 全局 CSS 变量（如需调整 Light 模式背景色）。

## 关键技术决策

### 1. `/music` 索引页网格

**问题**：当前 `grid-cols-2 sm:grid-cols-3` 最多 3 列，设计图桌面端为 4 列。

**方案**：
```tsx
<ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3xl">
```

- 移动端 2 列，平板 3 列，桌面 4 列。
- 间距从 `gap-2xl` 增至 `gap-3xl`。
- 容器从 `max-w-5xl` 增至 `max-w-6xl`。

**权衡**：
- 4 列在宽屏上更贴近设计图，但需要足够宽的封面才不显拥挤。
- 当前 3 张专辑在 4 列网格下会空出第 4 列；可通过 `justify-items-center` 或保持左对齐。

### 2. 少量专辑时的居中处理

**问题**：只有 3 张专辑时，4 列网格会显得空旷。

**方案 A（推荐）**：保持左对齐，让视觉自然扩展。
- 优点：代码简单，未来加专辑无需改代码。
- 缺点：3 张专辑时右侧空白。

**方案 B**：动态判断专辑数量 ≤3 时居中。
- 优点：3 张专辑时视觉平衡。
- 缺点：需要条件渲染或动态类名。

**决策**：采用方案 A，保持左对齐网格，通过大间距和大封面让 3 张专辑不显单薄。

### 3. `/music/[slug]` 背景渐变增强

**问题**：当前渐变 `${themeColor}40`（25% alpha）过淡，`72%` 终止过早，缺乏沉浸感。

**方案**：
```tsx
style={{
  background: `radial-gradient(ellipse 80% 75% at 25% 20%, ${album.themeColor}80 0%, ${album.themeColor}33 50%, var(--bg-primary) 90%)`,
}}
```

**参数调整**：
- Alpha 从 `40`（25%）增至 `80`（50%）或 `99`（60%），让主题色更饱和。
- 渐变终止从 `72%` 延至 `90%`，让色彩覆盖更广。
- 中间增加一个 `50%` 停止点（`${themeColor}33`），形成更自然的过渡。
- 椭圆尺寸和中心位置微调，对齐左侧封面位置。

**权衡**：
- 高 alpha 在 Dark 模式下可能过亮，需实测调整。
- 渐变终止接近 `100%` 时，页面底部仍有主题色残留，可能影响长页面可读性；`90%` 是平衡点。

### 4. 封面阴影

**问题**：当前封面无阴影，设计图有轻微立体感。

**方案**：
```tsx
className="aspect-square w-full rounded-lg object-cover shadow-2xl"
```

- 使用 Tailwind `shadow-2xl` 类。
- 阴影颜色自动跟随主题（Light 模式黑色阴影，Dark 模式无明显阴影或更轻）。

### 5. 标题字号响应式

**问题**：当前 `text-4xl` 在设计图对比下显得不够醒目。

**方案**：
```tsx
className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight"
```

- 移动端 `text-4xl`（避免标题过长换行）。
- 平板 `text-5xl`。
- 桌面 `text-6xl`。

### 6. 播放占位简化

**问题**：当前虚线框占位视觉干扰较大，设计图中不可见。

**方案 A（推荐）**：移除虚线框，改为极简文字。
```tsx
<p className="mt-xl text-xs" style={{ color: "var(--text-tertiary)" }}>
  {album.playbackPlaceholder ?? "音乐片段播放能力将在后续阶段接入"}
</p>
```

**方案 B**：完全移除播放占位。
- 优点：视觉最干净。
- 缺点：开发者可能希望保留未来扩展提示。

**决策**：采用方案 A，保留极简文字提示。

### 7. Light 模式背景色

**问题**：设计图 Light 模式背景为浅米色（~`#F7F5F1`），当前可能是纯白。

**方案**：
- 检查 `app/globals.css` 中 `--bg-primary` 的 Light 模式值。
- 若为纯白，改为 `#F7F5F1`。
- 若已是浅米色，无需改动。

**影响范围**：全站 Light 模式背景色，不限于 Music 页面。

**决策**：仅当实测发现 Music 页面背景为纯白时才调整；否则保持现有全局配置。

## 数据流

1. 构建时：`lib/music.ts` 扫描 `content/music/*.yaml`，zod 校验后产出 `Album[]`。
2. 索引页：`getAllAlbums()` 按年份降序返回所有专辑，渲染为网格。
3. 详情页：`getMusicBySlug(slug)` 返回单张专辑，渲染左大封面 + 右核心信息 + 次级内容。
4. 主题色背景：从 `album.themeColor` 读取，动态注入 inline style。
5. 主题切换：全局 CSS 变量自动响应 Light/Dark，无需组件级 `dark:` 变体。

## 兼容与迁移

- **向后兼容**：YAML schema 未改动（`tags` 已存在），现有 3 张专辑 YAML 无需修改。
- **静态导出**：视觉改动不影响 `generateStaticParams` 和 `output: "export"`。
- **主题系统**：继续使用 inline CSS 变量，与全站主题切换一致。

## 风险与取舍

1. **背景渐变高 alpha 在 Dark 模式下的可读性**：
   - 风险：`${themeColor}80` 在 Dark 模式 + 深色主题色（如 `#2f4f2f`）时，背景可能过暗，文字对比度不足。
   - 缓解：实测后按需调整 alpha 或渐变中心位置；`var(--text-primary)` 应自动适配高对比度。

2. **4 列网格 + 3 张专辑的视觉空旷**：
   - 风险：右侧空白可能不美观。
   - 缓解：通过大间距和大封面让 3 张专辑仍有足够视觉密度；未来加专辑后自然填充。

3. **全局背景色改动的影响范围**：
   - 风险：若调整 `--bg-primary` 为 `#F7F5F1`，会影响 Writing、Gallery、About 页面。
   - 缓解：仅当 Music 页面实测背景为纯白时才调整；或在 `/music` 页面级别覆盖背景色，不改全局。

4. **标题 `text-6xl` 在窄屏/长标题时的换行**：
   - 风险：移动端或长标题换行后可能挤压布局。
   - 缓解：响应式字号（移动端 `text-4xl`），`tracking-tight` 压缩字距。

## 验证策略

### 构建期验证

1. `pnpm lint`：ESLint + TypeScript 类型检查。
2. `/tmp` 副本 `pnpm build`：确认静态导出成功，`out/` 目录生成。

### 运行时验证（开发者人工）

1. 浏览器打开 `http://localhost:3000/music`：
   - 确认 4 列网格（桌面端）。
   - 确认大间距，封面是主角。
   - 切换 Light/Dark，确认背景色符合设计图。

2. 浏览器打开 `http://localhost:3000/music/[slug]`（至少测试一个专辑）：
   - 确认整页主题色背景渐变，沉浸感强。
   - 确认封面有立体阴影。
   - 确认标题巨大醒目。
   - 确认 tags 标签渲染。
   - 确认播放占位极简或不干扰。
   - 切换 Light/Dark，确认视觉自然适配。

3. 响应式测试：
   - 移动端（375px）：2 列网格，标题 `text-4xl`。
   - 平板（768px）：3 列网格，标题 `text-5xl`。
   - 桌面（1024px+）：4 列网格，标题 `text-6xl`。

### 视觉对比（开发者主导）

- 并排对比设计图与浏览器截图，确认：
  - 封面大小、间距、阴影。
  - 背景色、主题色渗透感。
  - 文字层级、大小、克制度。
  - Light/Dark 模式差异符合设计图。

## 回滚策略

若视觉改动导致回归或不符合预期：

1. **回滚单个文件**：`git checkout HEAD -- app/music/page.tsx`。
2. **回滚全部改动**：`git reset --hard HEAD`（需确认无其他未提交工作）。
3. **迭代修正**：基于开发者反馈调整参数（alpha、间距、字号等），无需完全回滚。
