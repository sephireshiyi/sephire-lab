# 路由与静态导出基础 — 实施计划

## 前置

- 实现前必须 `python3 ./.trellis/scripts/task.py start 06-19-route-static-export-shell`，状态进入 `in_progress`。
- 实现由 `trellis-implement` 子代理执行；检查由 `trellis-check` 执行。每次 dispatch 提示首行写 `Active task: .trellis/tasks/06-19-route-static-export-shell`。
- 不做重定向、不保留兼容路由（prd 硬约束）。

## 有序清单

### A. Writing 路由迁移

1. 新建 `app/writing/` 目录。
2. 把 `app/blog/page.tsx` 迁为 `app/writing/page.tsx`，内容不变（仅可顺手更正注释里的 `/blog` 字样）。
3. 把 `app/blog/[slug]/page.tsx` 迁为 `app/writing/[slug]/page.tsx`，保留 `dynamicParams = false`、`generateStaticParams()`、`import(\`@/content/posts/${slug}.mdx\`)` 路径不变。
4. 把 `app/blog/layout.tsx` 迁为 `app/writing/layout.tsx`（思源宋体子布局原样带走）。
5. 删除 `app/blog/` 整个目录。

### B. 删除 Tools

6. 删除 `app/tools/` 整个目录。

### C. Gallery 占位入口

7. 新建 `app/gallery/page.tsx`：参照 `app/music/page.tsx` / `app/about/page.tsx` 的占位页风格，做极简占位（标题 + 一句占位说明）。仅为让导航不 404，真正骨架归任务 3。

### D. 导航与链接目标

8. `components/layout/site-header.tsx`：
   - `Writing` 链接 `/blog` → `/writing`。
   - `Tools` 项整体替换为 `Gallery`，链接 `/gallery`。
   - 最终顺序：`Writing`、`Music`、`Gallery`、`About`。
9. `components/blog/post-card.tsx`：`href={\`/blog/${post.slug}\`}` → `/writing/${post.slug}`（共享组件，改这一处即同时修好列表页与首页）。
10. `app/page.tsx`：「查看全部」`href="/blog"` → `/writing`。**只改 href，不动首页结构与文案**（首页改版归任务 5）。

### E. Metadata

11. `app/layout.tsx`：`description: "Personal blog, projects, and online tools"` → 改为匹配新定位、移除 online tools 的文案（如「Writing, music, and photography by Sephire」之类，最终措辞实现时定）。

### F. 静态导出配置

12. `next.config.ts`：在 `nextConfig` 内加 `output: "export"` 与 `images: { unoptimized: true }`，`pageExtensions` 保留，MDX 包裹方式不变。

## 验证命令

每改动一批后、收尾前运行：

```bash
pnpm lint
pnpm build
test -d out && echo "static export OK: out/ exists"
```

构建后人工/脚本确认路由产物：

```bash
ls out/writing/index.html        # 列表页
ls out/writing/*/index.html      # 至少一篇文章详情（来自现有 content/posts）
ls out/gallery/index.html        # Gallery 占位
test ! -d out/blog && echo "no /blog"     # 旧路由已删
test ! -d out/tools && echo "no /tools"   # 旧路由已删
```

> 若 Next 16 导出的产物路径形态与上述不一致（如 `writing.html` 而非 `writing/index.html`），以 `pnpm build` 实际输出为准，把确认结果写回本 implement.md 与父任务。

### 实测结果（2026-06-19，在 /tmp 副本验证）

因当前工作区有本地服务占用 3000 端口并依赖其 `.next`，验证在 `/tmp` 副本（排除 `.git`/`node_modules`/`.next`/`out`，`pnpm install --frozen-lockfile`）中进行，未触碰真实工作区的 `.next`/`out`。

- `pnpm build`（Next 16.2.5 + Turbopack，`output: "export"`）通过，生成 `out/`。
- 路由表：`/`、`/_not-found`、`/about`、`/gallery`、`/music`、`/writing`（Static）、`/writing/[slug]`（SSG，预生成 `/writing/hello-world`）。无 `/blog`、`/tools`。
- **产物路径形态**：Next 16 默认（无 `trailingSlash`）采用**扁平命名**——列表页是 `out/writing.html`（不是 `out/writing/index.html`），文章详情是 `out/writing/hello-world.html`，`out/gallery.html`、`out/music.html`、`out/about.html`、`out/index.html` 同理。故验证脚本应查 `writing.html` 等，而非 `writing/index.html`。
- 旧路由产物 `blog*`、`tools*` 均不存在；所有 HTML 中无 `/blog`、`/tools` 链接。
- `pnpm lint`：存在**一个先于本任务的报错** `components/theme/theme-dropdown.tsx:27`（`react-hooks/set-state-in-effect`，next-themes mounted 模式）。该文件本任务未改动，HEAD 即报此错；本任务的改动未引入任何新 lint 错误。**决定（开发者 2026-06-19）：本任务不修，留给任务 5（首页/About/Header/主题整理）一并处理**；因此本任务的 lint 验收以「未引入新错误」为准，旧错单独跟踪。

## 审查门 / 回滚点

- **门 1（A–C 后）**：`pnpm build` 通过，说明路由迁移与删除没破坏编译。若失败，多半是漏改某处 `/blog` import 或残留引用。
- **门 2（D–E 后）**：`pnpm lint` + `pnpm build` 通过，导航与 href 全部指向新路由。
- **门 3（F 后）**：`output: "export"` 下 `pnpm build` 通过且 `out/` 生成。**这是最高风险步骤**——若 `next/image` / MDX / Turbopack 在 export 下报错，先确认 `images.unoptimized` 是否生效，再排查 MDX 动态 import。
- 回滚：本任务全部为文件移动/删除/小改，`git checkout -- .` 或按提交粒度回退即可；建议 A–C、D–E、F 分别成可回退的提交点。

## 风险点（实现时重点验证）

- `images.unoptimized: true` 必须先于「期待 export 成功」存在——`logo.tsx` 用了 `next/image`，否则 export 构建直接失败。
- 不得新增任何 `/blog`、`/tools` 的 redirect 或兼容页。
- PostCard 改完后，列表页与首页两处都要点到能跳转到 `/writing/[slug]`。
- 思源宋体子布局若漏迁，文章正文 CJK 衬线字体会丢。
- `content/posts`、`components/blog` 目录名本任务**不改**；如发现有人顺手改名，视为越界，回退。

## 完成定义

prd.md 八条验收标准全部满足，且 `pnpm lint`、`pnpm build`、`test -d out` 均通过；旧 `/blog`、`/tools` 在产物中不存在。
