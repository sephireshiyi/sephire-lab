# Music 设计稿打磨 — 技术设计

本任务在 `06-19-music-skeleton-pages` 产出的骨架上做视觉打磨。设计稿见 `design/Music - Index - {Light,Dark}.png`、`design/Music - Album{,-1,-2}.png`。

> ⚠️ **视觉限制说明**：本 session（glm-5.2）无视觉能力，无法直接看设计稿。以下设计里的具体视觉数值（间距、字号、渐变强度、标签样式、列数等）是「按文字需求 + 父 prd 设计意图 + 代码现有约定」给出的**合理默认值**，每处标「🎨待视觉确认」。开发者 review 时可直接纠正，或在实现后视觉确认时反馈，再迭代。

## 边界

- **只改 Music**：`app/music/page.tsx`、`app/music/[slug]/page.tsx`、`lib/music.ts`（schema）、`content/music/*.yaml`（3 张专辑加 tags）。
- **不改**：Gallery / Writing / About、`site-header.tsx`、`globals.css` 的主题 token（除非必要）、`next.config.ts`、导航。
- **不引入**：音频/播放器/API/数据库/新依赖/`/blog`/`/tools`/redirect。

## 现状（已核实，作为改动基线）

- `app/music/page.tsx`：server component；`grid grid-cols-2 gap-lg sm:grid-cols-3`；封面 `<img>` `aspect-square rounded-md`；封面下 `title`（`font-medium`）+ `artist · year`（`text-sm`），全 inline `var(--text-*)`。
- `app/music/[slug]/page.tsx`：`dynamicParams=false` + `generateStaticParams`（静态导出 OK）；背景 `linear-gradient(180deg, ${themeColor}1f 0%, transparent 60%)`；两栏 `sm:flex-row`，左封面 `sm:w-2/5`，右栏顺序 = 标题 / 艺术家·年份 / `note` / 虚线播放占位 / 曲目列表。
- `lib/music.ts`：`MusicSchema` 字段 `slug/title/artist/year/cover/themeColor(#RRGGBB)/note/tracks?/playbackPlaceholder?`；无 `tags`。`getAllAlbums()` 按年份降序。
- `globals.css`：主题 token 是 CSS 变量（`--bg-primary/secondary/hover`、`--text-primary/secondary`、`--border-color`、`--accent-color`），`.light`/`.dark`/`.reader` 各一套；间距 scale `2xs..5xl`。全站用 inline `var(...)`，**无 `dark:` 变体**。

## 设计决策

### D1. 内容模型：新增 `tags`

- `MusicSchema` 加 `tags: z.array(z.string()).optional()`，位置放在 `playbackPlaceholder` 之后。
- `Album` 类型由 zod 推导，无需手写 interface。
- 3 张专辑 YAML 填合理 tags（见 implement.md 具体值）。
- **索引页不渲染 tags**（保持封面墙纯粹）；**详情页渲染为小标签**。

### D2. `/music` 索引页 — 专辑封面墙

- 保留 server component + `getAllAlbums()`，纯静态。
- 网格：`grid grid-cols-2 gap-2xl sm:grid-cols-3`（间距 `gap-lg`→`gap-2xl`，体现「大间距」）。🎨待视觉确认（列数 / 间距）。
- 封面：`aspect-square w-full rounded-lg object-cover`（圆角 `md`→`lg`，呼应详情页封面），`style={{ backgroundColor: "var(--bg-secondary)" }}` 占位底色。
- 封面下文字：**保留但更克制**——`title` 用 `mt-md text-sm font-medium`（从 `text-4xl`/`font-medium` 收敛为小字），`artist · year` 用 `text-xs` + `var(--text-secondary)`。理由：封面优先，文字不喧宾夺主但保留可识别性。🎨待视觉确认（若设计稿是纯封面无文字 / hover 才出文字，开发者纠正）。
- 容器维持 `container mx-auto max-w-5xl px-lg py-4xl`；`h1` 维持 `Music`。🎨待视觉确认（设计稿索引页是否有大标题）。
- 3 张专辑在 `sm:grid-cols-3` 下占满一行、大间距，排版稳定；未来加专辑自然换行成多行墙。✓
- light/dark：全 inline `var(--text-*)` / `var(--bg-*)`，自动适配，无需 `dark:` 变体。

### D3. `/music/[slug]` 详情页 — 背景 themeColor 氛围

升级占位渐变为更接近 Apple Music 气质的 fading 背景，**关键是用 `var(--bg-primary)` 作为渐变终点**，让 light/dark 自动适配（无需 `dark:` 变体、无需 per-theme alpha）：

```tsx
style={{
  background: `radial-gradient(ellipse 90% 70% at 22% 18%, ${album.themeColor}40 0%, var(--bg-primary) 72%)`,
}}
```

- `themeColor` + `40`（~25% alpha）作为封面附近的主题色光晕；`var(--bg-primary)` 作为终点 → light 下淡出到近白、dark 下淡出到近黑，自然融入。
- 光晕中心 `at 22% 18%` 大致对齐左上封面位置，强化「封面主题色向外扩散」。
- 🎨待视觉确认（渐变形状/强度/中心位置/alpha）——这是最依赖看图的点，开发者视觉确认时重点反馈。
- 文字仍用 `var(--text-primary/secondary)`，对比度在两种主题下都足够（光晕 alpha 仅 25%，不压字）。

### D4. `/music/[slug]` 详情页 — 布局与信息层级

- 保留 `dynamicParams=false` + `generateStaticParams`（静态导出不变）。
- **首屏（两栏）**：`flex flex-col gap-2xl sm:flex-row sm:items-start`。
  - 左封面：`w-full sm:w-2/5 sm:flex-shrink-0`（维持「左大封面」比例；🎨待视觉确认是否调到 `sm:w-1/2`）。`aspect-square w-full rounded-lg object-cover`。
  - 右栏核心信息（首屏主信息）：`h1` 标题（`text-4xl font-bold tracking-tight`）、`artist · year`（`mt-sm text-lg` + `var(--text-secondary)`）、**tags 标签行**（新增，`mt-lg flex flex-wrap gap-xs`）。
- **次级区（首屏下方，全宽）**：把 `note` 短评 + 播放占位 + 曲目列表从右栏下移到两栏布局之下的次级区，视觉更次级（`mt-3xl`、分隔）：
  - `note`：`text-base leading-relaxed` + `var(--text-secondary)`（从 `var(--text-primary)` 降为次级色）。
  - 播放占位：保留当前虚线框非交互占位（不是假按钮），文案用 `playbackPlaceholder ?? 默认`。🎨待视觉确认（设计稿播放区视觉）。
  - 曲目列表：保留 `<ol>` 结构，`border-b` 分隔，但整体作为次级区呈现。
- 返回链接 `← Music` 保留。
- 🎨待视觉确认（首屏/次级切分、短评与曲目是否同区、播放占位形态）。

### D5. tags 标签样式

- 详情页右栏 tags：每个 tag 一个小药丸：
  ```tsx
  style={{
    border: `1px solid ${album.themeColor}66`,
    color: "var(--text-primary)",
    backgroundColor: `${album.themeColor}1a`,
  }}
  className="rounded-full px-sm py-2xs text-xs"
  ```
  用 `themeColor` 低 alpha 做底/边，让标签与专辑主题色呼应；文字 `var(--text-primary)` 保证 light/dark 可读。🎨待视觉确认（是否用主题色、还是用中性 `--border-color`）。
- 索引页不渲染 tags。

## 数据流

- 构建期：`getAllAlbums()` / `getMusicBySlug()` 读 YAML → zod 校验（含新 `tags`）→ 返回 `Album[]`。校验失败直接 fail build。
- 渲染：server component 消费 `Album`，`themeColor` / `tags` 通过 inline style / JSX 固化进静态 HTML。
- 静态导出：`generateStaticParams` 枚举 slug，`output:"export"` 生成纯静态 HTML/CSS/JS。无运行时数据。✓

## 兼容性

- 完全静态导出兼容：无 client 组件、无 `use client`、无运行时 fetch、无 API。✓
- 主题：全 inline CSS 变量，无 `dark:` 变体，light/dark 自动适配。`themeColor` 渐变用 `var(--bg-primary)` 终点适配双主题。✓
- 图片：沿用 `<img>`（非 `next/image`）+ eslint-disable（静态导出预优化封面）。不引入新图片策略。✓
- 不影响 Gallery/Writing/About。✓

## 风险与取舍

- **无视觉下的默认值风险**：D2/D3/D4/D5 的具体数值是合理默认，可能首轮有偏差。缓解：每处标 🎨待视觉确认，开发者实现后视觉确认一轮即可收敛，迭代成本低（纯 CSS/JSX 调整）。
- **tags 需手填**：3 张专辑 tags 是 Claude 给的合理值，开发者可改。tags 可选字段，不填也不报错。
- **themeColor 渐变在极端主题色下的可读性**：用 25% alpha + `var(--text-primary)` 文字，对比度足够；若某专辑 themeColor 极端，开发者反馈再调 alpha。
- **不改 globals.css 主题 token**：避免影响其他页面；themeColor 是 per-album inline，不进全局 token。

## 回滚

- 改动集中在 3 类文件（2 个 page、1 个 lib、3 个 YAML），`git checkout` 即可整体回滚到骨架状态。
- schema 加的是 optional 字段，YAML 不填也不破坏现有数据。
