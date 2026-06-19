# 路由与静态导出基础 — 技术设计

## 范围与边界

本子任务只做「不依赖设计稿的路由外壳与静态导出地基」。它会触碰首页、PostCard 等跨任务文件，但**只改与路由重命名直接相关的部分**，不做这些文件的功能改版。

- ✅ 属于本任务：`/blog` → `/writing` 路由迁移、删除 `/blog` 与 `/tools`、导航四模块、`/gallery` 占位入口、metadata 文案、`output: "export"` 与图片兼容配置。
- ❌ 不属于本任务（留给后续子任务）：
  - 首页四模块入口/摘要改版 → `06-19-home-about-header-theme-cleanup`（任务 5）。
  - `/gallery`、`/music` 真正的索引/详情骨架 → 任务 3 / 4。
  - YAML 内容模型 → 任务 2。
  - 隐藏语言切换、`reader` 主题收敛 → 任务 5。

**跨任务边界裁决**：凡是指向被重命名路由的「链接目标字符串」（href），本任务都要改，否则会指向已删除路由导致 404 或构建失败；但不改这些页面的结构与视觉。例如首页 `app/page.tsx` 的「查看全部」`href` 必须从 `/blog` 改到 `/writing`，但首页 Hero + Recent Writing 的整体改版仍归任务 5。

## 受影响文件清单（来自仓库扫描）

引用 `/blog` 的位置：

- `app/blog/page.tsx` — Writing 列表页 → 迁到 `app/writing/page.tsx`。
- `app/blog/[slug]/page.tsx` — 文章详情页 → 迁到 `app/writing/[slug]/page.tsx`。
- `app/blog/layout.tsx` — 思源宋体子布局 → 迁到 `app/writing/layout.tsx`。
- `components/layout/site-header.tsx:28` — 导航 `Writing` 链接 `/blog` → `/writing`。
- `components/blog/post-card.tsx:22` — `href={`/blog/${post.slug}`}` → `/writing/${post.slug}`。**该组件被列表页与首页 Recent Writing 共用**，是必须改点。
- `app/page.tsx:44` — 首页「查看全部」`href="/blog"` → `/writing`（仅改 href）。

引用 `/tools` 的位置：

- `app/tools/page.tsx` — 删除整个路由。
- `components/layout/site-header.tsx:50` — 导航 `Tools` 项 → 替换为 `Gallery`，链接 `/gallery`。
- `app/layout.tsx:9` — metadata `description` 含 "online tools" → 改写。

注：`components/blog/` 目录名、`lib/content.ts` 的 `content/posts` 注释中出现 "blog" 字样属内部命名，**不影响公开 URL**，本任务不强制重命名（见下「目录命名决策」）。

## 路由迁移方式

采用「移动 + 改 href」而非「新建 + 重定向」，与 prd「不保留兼容入口、不做重定向」一致：

1. 新建 `app/writing/` 目录，把 `app/blog/` 三个文件（`page.tsx`、`[slug]/page.tsx`、`layout.tsx`）迁过去，内容除注释里的 `/blog` 字样外基本不变。
2. 删除 `app/blog/` 整个目录。
3. 删除 `app/tools/` 整个目录。
4. 新建 `app/gallery/page.tsx` 极简占位页（与现有 `/music`、`/about` 占位页同风格），让导航 `Gallery` 不 404。任务 3 再替换为真正骨架。

`app/blog/[slug]/page.tsx` 的 `dynamicParams = false` + `generateStaticParams()` 原样保留 —— 它本就是静态导出友好的形态，迁移后语义不变。

## 目录命名决策

- **公开 URL** 以 `/writing` 为准（硬要求）。
- **内容目录** `content/posts` 与 **组件目录** `components/blog`：本任务**保持不变**，不一并改名。
  - 理由：URL 是用户可见契约，必须改；`content/posts`、`components/blog` 是内部命名，改名会扩大 diff 与回归面，且与本任务「稳定路由与静态导出」的目标无关。父任务 design.md 也明确「可先保留现有目录以降低第一步风险」。
  - 详情页 `import(`@/content/posts/${slug}.mdx`)` 路径随之保持 `content/posts`，不动。

## 静态导出配置

目标：`next build` 在 `output: "export"` 下产出 `out/` 静态站点。

`next.config.ts` 需要补两项（在 `nextConfig` 对象内，MDX 包裹之前）：

```ts
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};
```

- `output: "export"`：开启完整静态导出，禁用服务器运行时能力。
- `images: { unoptimized: true }`：**硬要求，不是预防项**。`components/layout/logo.tsx` 已使用 `next/image`；静态导出不带运行时图片优化器，不设此项构建会直接报错。这同时也是后续 Gallery / Music 静态图片策略的地基。

兼容性确认点（实现时验证，不预设结论）：

- Next 16 + Turbopack + `output: "export"` + `@next/mdx` 动态 `import` 是否能正常预编译并导出。以 `pnpm build` 实际输出为准；若有问题写回本任务并上报父任务。
- 导出产物目录默认是 `out/`，用 `test -d out` 确认。

## 数据流（不变）

Writing 列表/详情仍走现有 MDX/frontmatter 管线：`lib/content.ts`（gray-matter + zod 构建期校验）→ `generateStaticParams` 枚举 slug → 详情页动态 `import` 对应 `.mdx`。本任务不改这条链路，只改它挂载的 URL 段。

## 风险与取舍

- 删除 `/blog`、`/tools` 是有意破坏旧 URL；不得在实现中偷偷加兼容路由或 redirect。
- PostCard 是共享组件，改 href 会同时影响列表页与首页；这是预期内的单点改动，改完两处都应指向 `/writing/[slug]`。
- 首页只改 href、不改版，避免与任务 5 冲突；实现时注意克制，不要顺手重构首页结构。
- `images.unoptimized` 是全局开关，会关闭 logo 的运行时优化；对静态站点而言这是正确取舍（图片改为预先优化的静态文件）。
- 思源宋体子布局必须随 `/writing` 一起迁移，否则文章正文会丢失 CJK 衬线字体且可能触发非预期字体下载。

## 验收对齐

实现需满足 prd.md 全部验收标准；其中静态导出项以 `pnpm build` 通过且 `test -d out` 成立为准。
