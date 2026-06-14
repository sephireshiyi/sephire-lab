# 内容架构设计

> 本文档记录 Sephire Lab 的内容（blog / gallery / music）的数据模型、URL 结构、标签系统、渲染管线设计。
>
> **性质**：activing document（活文档）。每次开发涉及内容相关模块时，先回到本文档核对决策，开发过程中如有新决策也回写到本文档。
>
> **更新历史**：
> - 2026-05-21：初版，确定三类内容、共享数据模型、双轨标签系统的基本框架。
> - 2026-06-06：确定 frontmatter 用 zod 校验，数据模型事实源改为"以 lib/content.ts 的 zod schema 为准、TS 类型 z.infer 派生"（见 §2 开头说明）。MDX 技术栈细节见 `decisions/blog-mdx-pipeline.md`。

---

## 0. 设计目标

- **共享底层、分离表现**：blog / gallery / music 在数据模型层面共享 80% 的字段（title / date / tags 等），只在各自专属字段和渲染模板上分化。这样筛选、tag 系统、日历视图等"跨内容"功能可以一套实现。
- **修改友好**：以后想换列表样式、加新视图、改路由命名，**数据文件不用动**。
- **类型化**：所有读取函数都返回明确的 TypeScript 类型，IDE 自动检查。
- **不过度设计**：MVP 阶段不引入数据库，不做后台编辑器。新内容靠手写 mdx 文件。

---

## 1. 内容类型总览

三种顶层内容类型，对应三个导航板块：

| 类型 | URL 板块 | 重心 | 形态 |
|---|---|---|---|
| **post** | `/blog`（导航文字 "Writing"） | 文字 ~90% | 单文件 mdx，长文为主 |
| **photo** | `/gallery`（命名待定） | 图片为主，文字穿插 | 文件夹 + 多张图 + mdx |
| **album** | `/music` | 专辑封面 + 文字介绍 + 可选音乐 | 文件夹 + 封面 + mdx + 可选音频 |

> ⚠️ 当前 nav 是 Writing / Music / Tools / About 四项，没有 Gallery。如果决定加 gallery，需要：
> 1. 更新 `components/layout/site-header.tsx`（顺便做 NavLink 抽出重构）
> 2. 检查设计稿是否容纳 5 项 nav，否则要么放 dropdown，要么调整间距
> 3. 同步更新 `CLAUDE.md` 的 MVP 范围

---

## 2. 数据模型

> **事实源约定（2026-06-06 更新）**：已决定用 zod 做 frontmatter 运行时校验（见 `decisions/blog-mdx-pipeline.md` §4）。因此**实现层的类型以 `lib/content.ts` 里的 zod schema 为准**，TS 类型通过 `z.infer` 派生。本节的 `interface` 是"人类可读的规格说明"，zod schema 是"机器强制的实现"——**两者必须保持一致**；改字段时先改 zod schema，再同步本文档。不要在代码里再手写一份独立的 `interface`，否则会和 schema 漂移。

### 2.1 共享基础字段 `BaseContent`

所有内容类型都包含这些字段（规格说明；`post` 的实际 zod schema 见 `decisions/blog-mdx-pipeline.md` §4）：

```ts
interface BaseContent {
  type: "post" | "photo" | "album"
  slug: string              // 由文件名/文件夹名推导，URL 用
  title: string
  date: string              // ISO 8601, 例 "2026-05-21"，发布到 lab 的日期
  category: Category        // 单选分类，见 §4
  tags?: string[]           // 多选自由标签，见 §4
  summary?: string          // 1-2 句摘要，列表页和 SEO 用
  cover?: string            // 封面图路径，列表卡片用
}
```

### 2.2 `Post`（博客文章）

```ts
interface Post extends BaseContent {
  type: "post"
  // 正文是同一 mdx 文件的 markdown 部分
}
```

frontmatter 示例：

```mdx
---
type: "post"
title: "我对某个东西的思考"
date: "2026-05-21"
category: "thoughts"
tags: ["philosophy", "学习方法"]
summary: "一两句话说清楚这篇文章讲了什么。"
cover: "/images/posts/abc.jpg"
---

正文 Markdown 在这里。可以嵌入 React 组件（MDX 的能力）。
```

### 2.3 `Photo`（摄影集）

```ts
interface Photo extends BaseContent {
  type: "photo"
  photos: PhotoItem[]       // 照片列表，至少 1 张
}

interface PhotoItem {
  src: string               // 图片路径，相对于 public/ 或外链
  caption?: string          // 单张照片的说明文字
  alt?: string              // 无障碍 alt 文本，缺失时回退到 caption
}
```

frontmatter 示例：

```mdx
---
type: "photo"
title: "京都的雨"
date: "2026-04-12"
category: "photo"
tags: ["travel", "japan", "film"]
summary: "四月，京都被雨困住的一个下午。"
cover: "/images/gallery/kyoto-rain/01.jpg"
photos:
  - src: "/images/gallery/kyoto-rain/01.jpg"
    caption: "下午三点，等不到的雨停。"
  - src: "/images/gallery/kyoto-rain/02.jpg"
  - src: "/images/gallery/kyoto-rain/03.jpg"
    caption: "屋檐"
---

可选：mdx 正文做整组照片的总体说明（拍摄背景、思考、技术细节等）。
显示在第一张图之前或者最后一张图之后（待定）。
```

### 2.4 `Album`（音乐专辑）

```ts
interface Album extends BaseContent {
  type: "album"
  artist: string                 // 艺术家
  releaseDate?: string           // 专辑原始发行日期（区别于 BaseContent.date）
  tracks?: Track[]               // 可选曲目，配合自托管 mp3 或 widget
  externalLinks?: ExternalLinks  // 跳转流媒体平台
}

interface Track {
  title: string
  duration?: number              // 秒，可选
  src?: string                   // 自托管 mp3 路径（方案 A）
  embedUrl?: string              // 官方 widget URL（方案 B）
}

interface ExternalLinks {
  spotify?: string
  appleMusic?: string
  bandcamp?: string
  netease?: string
}
```

> **音乐播放方式未定**——见 §7 未决问题 1。当前 `tracks` 字段同时容纳两种方案，开发时择一。

---

## 3. URL 与目录结构

### 3.1 URL 规划

```
/                          首页
/blog                      文章列表
/blog/[slug]               文章详情
/blog/category/[cat]       按 category 筛选（或用 query: /blog?category=xx）
/blog/tag/[tag]            按 tag 筛选

/gallery                   摄影集列表（命名待定）
/gallery/[slug]            单个摄影集

/music                     专辑列表
/music/[slug]              单个专辑

/tools                     工具列表
/tools/[slug]              工具详情

/about                     关于
/archive                   时间索引（日历视图，跨内容类型）—— 待定，见 §5
```

**关于筛选页 URL 风格**：`/blog/tag/japan` 静态化更友好（SEO + Vercel 边缘缓存），`/blog?tag=japan` 客户端切换更轻量。建议 **MVP 用 query 字符串**（一个 `/blog` 页面读 query 即可），等内容多了再做静态预渲染。

### 3.2 文件目录结构

```
content/
  posts/                              # 单文件结构
    2026-05-21-my-thought.mdx
    2026-05-22-another.mdx

  gallery/                            # 文件夹结构，因为有多张图
    2026-04-12-kyoto-rain/
      index.mdx                       # frontmatter + 总体说明
      photos/
        01.jpg
        02.jpg
        03.jpg

  music/                              # 文件夹结构
    2026-03-10-album-name/
      index.mdx                       # frontmatter + 专辑介绍
      cover.jpg
      tracks/                         # 可选，自托管方案才需要
        01-track-name.mp3
```

**为什么 post 用单文件、photo/album 用文件夹？**

- post 只有一份正文 + 一张可选封面，单文件足够，列表扫描快
- photo/album 自带多个资源（多张图 / 多个 mp3），用文件夹隔离，避免 `public/images/gallery/` 散乱

**slug 推导规则**：
- post: 文件名去掉 `.mdx` 后缀，即 `2026-05-21-my-thought`
- photo/album: 文件夹名，即 `2026-04-12-kyoto-rain`
- 日期前缀是约定，不是强制（frontmatter 里的 `date` 是数据源），但有助于文件系统下排序

---

## 4. Category 与 Tag 系统

### 4.1 双轨设计

- **`category`（单选，必填）**：每篇内容只能属于一个分类，用于顶层导航式筛选和 URL 路由
- **`tags`（多选，可选）**：自由标签，每篇可以有 0~N 个，用于细粒度主题筛选

### 4.2 Category 预定义集合（待最终确定）

候选枚举值：

```ts
type Category =
  | "tech"        // 技术、工程、工具
  | "thoughts"    // 随笔、感受、思考
  | "music"       // 音乐专辑
  | "photo"       // 摄影
```

> **未定**：是否需要 `essay` / `note` / `review` 等。建议先用上面 4 个，等内容多了再裂变。

UI 上 category 适合做：
- `/blog` 顶部一排 tab
- 列表卡片右上角小徽章
- 日历视图的颜色分组依据

### 4.3 Tags 设计

- 自由文本，每篇文章自己写
- 跨内容类型聚合：blog 的 `"japan"` 和 photo 的 `"japan"` 是**同一个 tag**，可以一起列出
- UI 上做成 chip，列表页可以点击筛选
- 不维护单独的 tag 元信息文件，靠扫描所有内容自动汇总

**为什么不限制 tag**：限制了反而要先决定再写文章，对个人站太繁琐。自动汇总是常见做法。

---

## 5. 日历视图设计

### 5.1 形态

GitHub contribution graph 风格的月视图（或年视图），有更新的日期格子被涂色，鼠标 hover 显示当天发的内容标题，点击跳转。

### 5.2 多 tag/category 着色方案

**未决** —— 见 §7 未决问题 2。混色方案有信息丢失风险，已记录 4 种备选方案，等开发到这个组件时再敲定。

### 5.3 放在哪里

三个候选位置：

| 候选 | 优点 | 缺点 |
|---|---|---|
| 首页一个区域 | 一目了然，是首页信息密度的核心 | 增加首页复杂度，违反"极简首页"原则 |
| `/blog` 列表页顶部 | 离博客最近 | 只能看 post，浪费了 photo / album 的数据 |
| **独立的 `/archive` 页** | 跨内容聚合，符合"日历是时间索引"语义 | 多一个路由 |

**推荐**：独立 `/archive`，但 nav 里不显式入口（足够小众的功能，从 footer 或 about 页面进入）。或者放 `/about` 页面底部当作"时间线"。

### 5.4 数据接口

```ts
interface CalendarCell {
  date: string                  // "2026-05-21"
  entries: {
    type: "post" | "photo" | "album"
    slug: string
    title: string
    category: Category
    tags?: string[]
  }[]
}

function getCalendarData(year: number): CalendarCell[]
```

---

## 6. 公共渲染管线

### 6.1 拆分建议

```
lib/
  mdx.ts             # 通用 MDX 编译，所有内容类型共用
  content.ts         # 通用读取（getAllContent / getContentBySlug）
  posts.ts           # post 类型专用方法（如果有特殊逻辑）
  gallery.ts         # photo 类型专用
  music.ts           # album 类型专用
  tags.ts            # tag 索引、按 tag 取内容
  calendar.ts        # 按日期聚合
```

> 也可以全部塞 `content.ts`。建议**先全塞一个文件，超过 200 行再拆**，避免过度模块化。

### 6.2 核心函数签名

```ts
// 拿所有指定类型的元信息（不读正文，性能好）
function getAllContent<T extends ContentType>(
  type: T
): BaseContent[]

// 拿单个内容的完整信息（含 MDX 编译后的 React 树）
function getContentBySlug<T extends ContentType>(
  type: T,
  slug: string
): ContentByType<T>

// 按 category / tag / date 筛选（跨内容类型）
function getContentByCategory(cat: Category): BaseContent[]
function getContentByTag(tag: string): BaseContent[]
function getContentByDate(date: string): BaseContent[]

// 拿所有出现过的 tag（用于 chip / 标签云）
function getAllTags(): { tag: string; count: number }[]
```

### 6.3 性能注意点

- 列表页**只读 frontmatter**（用 `gray-matter`），不编译 MDX 正文，扫几百个文件也很快
- 详情页才编译 MDX
- 列表函数结果可以在构建时缓存（Next.js 默认 SSG，所有 mdx 文件在 build 时读一次）
- 不要在每个页面里独立扫一遍 `content/`，应该统一入口

---

## 7. 未决问题（开发时再定）

| # | 问题 | 触发时机 |
|---|---|---|
| 1 | 音乐播放方式：自托管 mp3 vs 嵌入官方 widget（spotify/apple/bandcamp） | 开发 `/music/[slug]` 时 |
| 2 | 日历视图多 tag/category 着色方案（分段格 / 主色+角标 / 密度 + popover / 泳道图） | 开发日历组件时 |
| 3 | Gallery 翻页技术选型（CSS scroll-snap vs Embla Carousel vs 自写） | 开发 `/gallery/[slug]` 时 |
| 4 | Gallery 文字显示方式（caption 在图下 vs 点击浮层 vs hover 显示） | 同上 |
| 5 | Category 取值列表的最终敲定（当前 4 项是建议） | 写第一批文章时调整 |
| 6 | Gallery 板块的 URL 命名（`/gallery` / `/photos` / `/portfolio` / 其他） | 加入 gallery 时 |
| 7 | Tag 跨内容聚合的 UI 表达：是否要在 chip 上标注"这个 tag 在 X 篇 post + Y 个 photo 中出现" | 做 tag 索引页时 |
| 8 | `/archive` 时间索引页是否独立、放在哪个入口 | 做日历视图时 |
| 9 | 筛选页用静态预渲染（`/blog/tag/[tag]`）还是 query 参数（`/blog?tag=`） | 内容超过 20 篇时再考虑预渲染 |
| 10 | mdx 正文在 photo 类型中显示的位置（图前 / 图后 / 折叠展开） | 开发 `/gallery/[slug]` 时 |

---

## 8. 后续可扩展点

完成 MVP 后可以考虑：

- **RSS / Atom feed**：从 `getAllContent` 拼，几十行代码
- **站内搜索**：内容少时纯前端 filter 够用；多了用 Pagefind（静态搜索引擎，无后端）
- **阅读时间估算**：MDX 正文字数 / 200 字每分钟
- **文章系列**：frontmatter 加 `series: "react-deep-dive"` 字段，把多篇 post 串成一组
- **i18n**：当前有 LanguageDropdown 占位，未来接 next-intl 或 next 内置 i18n routing
- **OG 图生成**：用 `@vercel/og` 给每篇文章动态生成卡片图
- **评论**：如果想加，先用 Giscus（基于 GitHub Discussions，零后端）

---

## 9. MVP 实施建议顺序

1. **先做 blog 完整链路**：`lib/content.ts` + `lib/mdx.ts` + `/blog` + `/blog/[slug]`，跑通一篇示例文章
2. **复用到 music**：80% 的代码可以共用，只需要加 `Album` 类型扩展和 `/music/[slug]` 模板
3. **再做 gallery**：同上，加 `Photo` 类型扩展和翻页 UI
4. **tag / category 筛选页**：基础内容跑通后再加
5. **日历视图**：最后，作为锦上添花的功能放在 `/archive`

不要一开始把所有功能并行做，会陷入"什么都没做完"的状态。
