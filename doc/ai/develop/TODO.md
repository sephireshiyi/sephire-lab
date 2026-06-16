# Sephire Lab TODO

---

## 命名规范

三层命名，各司其职：

- **Milestone（里程碑 1–6）**：产品路线图阶段，源自 MVP 范围，**永不重编号**。见下方 Milestones 区。
- **task（task1, task2…）**：开发批次，全局递增。**一个 task ≈ 一条 LOG ≈ 一次可交付 / 可验证的工作量**，细节记在 Developing 区。
- **切片（Milestone X 切片 A/B/C）**：一个 Milestone 太大、需多个 task 才能完成时的描述性子标签（**不是独立编号轨道**）。例：task4 = M3 切片 A、task5 = M3 切片 B。

> 旧的 "Session N"（见 `../architecture/handoffs/2026-06-13-path-a.md` §5）已废弃，统一映射为 task6~task11，开发以本文件为准。

---

## Milestones

> 产品路线图，永不重编号。各项后标注对应 task（开发批次细节见 Developing 区）。

1. 基础站点 — ✅ 基本完成，Tools 预览区留 task8（Recent Writing 已由 task6 收尾）
- [x] 清理 Next.js 默认首页
- [x] 创建基础导航栏
- [x] 创建首页 Hero 区域（极简版）
- [x] 创建 Recent Writing 区域 → **task6**
- [ ] 创建 Tools 预览区 → **task8**（Model Checker 就绪后在首页补工具卡片）
- [x] 创建 `/blog`
- [x] 创建 `/tools`
- [x] 创建 `/about`
- ~~创建 Projects 预览区 / 创建 `/projects`~~ —— 移出 MVP（根 `CLAUDE.md`「第一版暂不做：项目展示页」）
2. 主题系统 — ✅ 完成
- [x] 安装 next-themes
- [x] 创建 ThemeProvider
- [x] 创建主题切换 UI（task3 重构为 ThemeDropdown）
- [x] 添加 light 主题
- [x] 添加 dark 主题
- [x] 添加 reader 主题
- [x] 使用 CSS variables 管理主题颜色
3. MDX 博客 — ✅ 核心完成（切片 A/B），标签显示留切片 C
- [x] 创建 `content/posts`
- [x] 添加第一篇 MDX 文章
- [x] 实现读取文章元信息
- [x] 实现 `/blog` 文章列表
- [x] 实现 `/blog/[slug]` 文章详情
- [x] 添加代码高亮
- [ ] 添加标签显示 → **切片 C**（路径 A 完成后回来）
4. ~~项目展示~~ — 整体移出 MVP（根 `CLAUDE.md`「第一版暂不做：项目展示页」）
5. 工具集合 — ⬜ task7（后端）+ task8（前端 / 工具页）
- [ ] 完成 `/tools` → task8
- [ ] 创建工具卡片组件 → task8
- [ ] 创建 `/tools/model-checker` → task8
- [ ] 实现输入表单 → task8
- [ ] 实现测试结果展示 → task8
- [ ] 创建 `/api/model-checker` → task7
- [ ] 支持 OpenAI Compatible `/models` 测试 → task7
- [ ] 支持 Anthropic Compatible 基础测试 → task7
6. 部署 — ⬜ task9（整理推送）+ task10（Vercel + 域名）+ task11（部署后验证）
- [ ] 推送到 GitHub → task9
- [ ] 导入 Vercel → task10
- [ ] 配置环境变量 → task10
- [ ] 绑定 sephire.xyz → task10
- [ ] 检查移动端显示 → task11
- [ ] 更新 README → task9

---

## Goal Adjustment and Refine

1. 在切换主题的时候header和页面主体的渲染速度不一样，header要明显快一些，导致可以看得出来header和主体的分界线。

---

## Developing

### task1

> ✅ 已完成：统一字体管理，使用 next/font/google 优化字体加载

**完成内容**：

- 创建了 `lib/fonts.ts` 统一管理字体配置
- 使用 `next/font/google` 导入 Maven Pro 和 Geist Mono
- 移除了 globals.css 中的 Google Fonts CDN 导入
- 更新了 layout.tsx 使用新的字体配置
- 字体现在从本地加载，提升了性能和用户体验

**额外修复**：

- 增加了页眉顶部间距（py-5 → py-8）
- 调整了 hover 指示条位置（-top-6 → -top-3），使其可见

---

### task2

> ✅ 已完成：建立基于 Tailwind v4 `@theme` 的命名间距系统，所有组件迁移到 utility 类

**完成内容**：

- 在 `globals.css` 的 `@theme` 块中定义 `--spacing-2xs` ~ `--spacing-5xl` 命名 token，Tailwind 自动生成 `p-md` / `gap-2xl` / `mb-xl` / `px-3xl` 等 utility 类
- 单独保留 `--header-height` 作为布局变量（不属于 spacing scale）
- 删除 `globals.css` 中冗余的 `* { margin: 0; padding: 0; box-sizing: border-box }` reset（Tailwind v4 preflight 已含）
- 迁移所有组件的间距类：`site-header.tsx`, `site-footer.tsx`, `theme-switcher.tsx`, `layout.tsx`, 四个页面文件
- 修复首页标题居中问题：用 `mt-[calc(-1*var(--header-height))]` 抵消 main 的 padding-top，让 page div 跨整个视口，标题正好落在视口几何中心

**绕过的坑**：

- 第一版思路：`:root { --space-* }` + 组件里 `style={{ padding: 'var(--space-md)' }}`——啰嗦，且无法使用 Tailwind 修饰符（`md:`、`hover:`）
- 改用 `@theme` 后 Turbopack 没扫到新 token，需要冷启动 dev server 才生效
- 把 spacing 块从 `@theme inline` 拆到独立 `@theme` 块（spacing 不需要 inline 模式）

**关键学习**：

- Tailwind v4 中，命名 token 应放在 `@theme`（不是 `:root`）才会自动生成 utility 类
- `--spacing-*` 命名空间会生成 `p-`, `m-`, `gap-`, `px-`, `pt-` 等所有 spacing 相关 utility
- `--header-height` 这类一次性布局变量适合留在 `:root` 单独维护
- 首页标题居中需要补偿 main 的 padding-top，否则几何中心比视口中心低 `header/2`

---

### task3

> ✅ 已完成：用 Headless UI v2 封装通用下拉菜单、按钮和图标按钮，重构主题/语言切换为 dropdown

**完成内容**：

- 安装 `@headlessui/react@2.2.10`
- 在 `globals.css` 新增 `--bg-hover` 主题感知变量（dropdown item 悬停高亮用）
- 创建 `components/ui/`：
  - `button.tsx` - 通用文字按钮（最小实现，ghost 风格）
  - `icon-button.tsx` - 图标按钮（强制要求 `aria-label`）
  - `dropdown.tsx` - 通用下拉（trigger + DropdownItem 子组件），基于 HUI Menu，自动处理键盘导航/外点关闭/ARIA
- 创建 `components/theme/`：
  - `theme-dropdown.tsx` - trigger 跟随当前主题（sun/moon/book），三项可切换
  - `language-dropdown.tsx` - 占位 dropdown（中文/English，未接 i18n）
- 重构 `site-header.tsx`：删除 ThemeSwitcher 引用，改用 ThemeDropdown + LanguageDropdown
- 删除旧的 `components/theme/theme-switcher.tsx`

**设计决策**：

- **Trigger 跟随当前主题**：用户体验更直观，无需打开菜单就能看到当前模式
- **每个主题维护独立 iconSize**：iconify 不同图标 glyph 占 viewBox 比例不同（moon 比 sun 满），需视觉补偿（20/17/20）
- **固定 20×20 图标槽位**：用 `<span class="w-5 h-5 inline-flex">` 包裹 Icon，无论 iconSize 多少，dropdown 各 item 的文字 x 起点都对齐
- **`bg-hover` CSS 变量**：每个主题定义半透明覆盖色（light: 5% 黑，dark: 8% 白，reader: 6% 棕），用 `data-[focus]:bg-[var(--bg-hover)]` 实现主题感知的悬停高亮

**关键学习**：

- Headless UI v2 的 `MenuItems` 内置了 `anchor` 定位（`anchor="bottom end"`），无需手写 Floating UI
- HUI v2 用 `data-[focus]`、`data-[closed]` 等数据属性配合 Tailwind 实现状态样式
- iconify 图标在同一 px 尺寸下视觉大小不一致，需要 per-icon 调整
- 多个不等宽元素并列时，加一个**固定尺寸槽位**容器是 flex 对齐的常用手段

---

### task4

> ✅ 已完成：Milestone 3 切片 A（tracer bullet）——单篇博客文章端到端跑通

**范围**：只做"单篇贯通"，列表页/筛选/标签 UI 留给切片 B/C。详细 LOG 见 `LOG.md` 2026-06-07 (task4)。

**完成内容**：

- 接入 MDX 管线：`next.config.ts`（`createMDX` + Turbopack 字符串插件）+ 根 `mdx-components.tsx`（必须文件）
- `lib/content.ts`：zod `PostSchema`（单一事实源，`z.infer` 派生 `Post`）+ `parsePost` / `getPostSlugs` / `getPostBySlug`
- `app/blog/[slug]/page.tsx`：`generateStaticParams` + `dynamicParams=false` + 动态 `import()` 正文 + zod 校验过的标题区
- `app/blog/layout.tsx`：局部挂载思源宋体变量（不上 `<html>`）
- `content/posts/hello-world.mdx`：覆盖各元素的金丝雀文章
- 代码高亮 rehype-pretty-code + Shiki 三主题（light=github-light / dark=github-dark / reader=rose-pine-dawn），`globals.css` 加 `--font-serif` token + `.mdx-body` 排版 + Shiki 变量映射

**关键决策 / 学习**：

- Turbopack 下 remark/rehype 插件只能传字符串名 + 可序列化选项（函数传不进 Rust 侧）
- `@next/mdx` 默认不剥离 frontmatter → 必须加 `remark-frontmatter`，否则 `---` 块渲染成 `<hr>`+文本（架构文档清单遗漏，已在 LOG 反馈）
- shiki 是 rehype-pretty-code 的 peerDependency，需显式装
- zod 4 API 与 zod 3 不同：`z.iso.date()` / `z.prettifyError()`，build 时校验失败会指名文件+字段并中断构建
- Noto Serif SC 在 next/font 里是可变字体（wght 200–900），`weight:"variable"` 一个轴覆盖所有字重

**待办（后续切片）**：

- 切片 B：列表页 `/blog`（fs 扫目录 + gray-matter 只读 + 排序 → 卡片）；首页"最近文章"复用
- 切片 C：category/tag 筛选、标签 chip 显示、标题锚点 hover 显示 #、`<img>`→`next/image`
- reader 的 Shiki 主题名、三主题视觉切换的人工过目

---

### task5

> ✅ 已完成：Milestone 3 切片 B（列表页）—— `/blog` 文章列表

**范围**：实现列表页 `/blog`，显示所有文章按日期降序，暂不做筛选/分页/标签显示（切片 C）。详细 LOG 见 `LOG.md` 2026-06-13 (task5)。

**完成内容**：

- `lib/content.ts` 新增 `getAllPosts()` 函数：复用 `getPostSlugs()` + `parsePost()`，扫目录 + gray-matter 只读 frontmatter（不编译正文）+ zod 校验 + 按 `date` 降序排序
- `app/blog/page.tsx`（新建）：列表页，调 `getAllPosts()` 渲染卡片（标题链接、日期格式化、category chip、summary），空状态处理
- category 枚举到中文映射（临时在页面内，后续可抽到 `lib/constants.ts`）

**验证**：

- `/blog` 访问正常（HTTP 200），1 张卡片渲染正确
- 点击标题 → 跳转到详情页
- 排序逻辑验证：临时创建第二篇早期文章，确认降序正确（新文章在前）

**待办（后续切片 C）**：

- category/tag 筛选
- 标签 chip 显示
- 分页（文章多时）
- 首页"最近文章"区复用 `getAllPosts().slice(0,3)`

---

### task6 ✅ 已完成

> ✅ **已完成**：Milestone 1 收尾 —— 首页改 Server Component，Hero 保持极简（首屏不变）+ 新增下滚 Recent Writing 区；抽取 `components/blog/post-card.tsx` 与 `lib/content.ts` 的 `formatDate` / `CATEGORY_LABEL`（解决 reviewer 切片 B 🟢-1）。详细见 `LOG.md` 2026-06-16 (task6)。
> **设计依据**：`../architecture/decisions/homepage-design.md` §3、§5
> **推进**：Milestone 1（创建 Recent Writing 区域 ✅；Tools 预览区仍留 task8）

**任务分解**：

1. `app/page.tsx` 改 Server Component（删 `"use client"`），Hero 区保持不变
2. 抽 `components/blog/post-card.tsx`（从 `app/blog/page.tsx` 抽卡片，props `{ post, showSummary? }`）
3. 抽 `formatDate` / `CATEGORY_LABEL` 到 `lib/content.ts`（与 `PostSchema` 同文件，**不新开 `lib/constants.ts`**）
4. `app/blog/page.tsx` 改引用新组件 + 新函数，行为不变
5. `app/page.tsx` Hero 下新增 `<section>`：`getAllPosts().slice(0,3)` → 3 张 PostCard + "查看全部 →" 链到 `/blog`

**样式约束**：下滚区对齐 `/blog` 列表页 —— 容器 `max-w-4xl mx-auto px-lg py-5xl`、标题 `text-3xl font-medium mb-3xl`、卡片间距 `space-y-2xl`、全用 spacing token + 主题变量。

**验收**：`pnpm build` 绿且 `/` 标 `○ (Static)`；首屏极简标题与设计稿一致；下滚见 3 卡片 + 查看全部；点卡片 → 详情、点查看全部 → `/blog`；light/dark/reader 三主题各过一遍。

**验证现状（task6 收尾）**：`npx tsc --noEmit` 绿；代码层验收项全部满足（结构上 `/` 为纯静态 Server Component，预期标 `○ Static`）。两项需停 dev / 上浏览器才能闭环、留给 reviewer 或部署前：① `pnpm build` 的 `○ Static` 标记（按 `doc/dev-server-guide.md` 约定，须先停 dev server 才能跑，未擅自停）；② 三主题视觉 + 点击跳转的浏览器过目。另：当前仅 1 篇文章，下滚显示 1 张卡片（`slice(0,3)` 行为正确，"3 张"取决于文章数）。

**实施偏差（给架构师，已记 LOG）**：Recent Writing 容器用 `max-w-[800px]`（对齐 `/blog` 列表页实际宽度），未用设计文档/handoff 写的 `max-w-4xl`(896px)——理由是"复用列表页样式"的意图 + handoff §6 🟢-2 已知列表页是 800px 且把宽度统一推迟到部署后；用 4xl 反而会造出第三种宽度。待 🟢-2 决定最终宽度时两处一起改。

**收尾补充（2026-06-16 theme polish + reviewer 审计回应）**：
- reviewer 已出 task6 审计（`doc/ai/review/audits/2026-06-16-task6-homepage-recent-writing.md`）：**无 🔴**；隔离目录 `pnpm build` 确认 `/`、`/blog` 为 `○ (Static)`、`/blog/[slug]` 为 `● (SSG)` —— 上面"验证现状"里 build/`○ Static` 待补项由此闭环。
- 🟡（reader 全局 `.reader article` 泄漏到 PostCard）→ **已在 theme polish 收尾修复**：删除 `.reader article, .reader .prose` 裸元素选择器，正文排版统一迁到 `.mdx-body`（三主题 18px / line-height 1.8），符合架构师 `blog-reader-theme.md §3.1` 新原则。同批还完成：去掉 `.reader a` 全局下划线、reader 底色改 `#F4EDD6`（+secondary 微调）、`disableTransitionOnChange` 修主题切换分界线、reader logo 重导出对齐新底色。详见 LOG「2026-06-16 主题样式打磨」「reader logo 重导出」两条。
- 🟢-1（PostCard 标题硬编码 `h2`，首页 heading 层级偏扁）→ **未做**，留后续（reviewer 标为可推迟；如继续复用卡片再加 `headingLevel`/`titleAs` prop，首页传 h3）。
- 🟢-2（容器宽度 `max-w-4xl` vs `800px`）→ 架构师范围，待统一。
- **待最终确认**：reviewer/architect 复核 🟡 修复 + 浏览器三主题视觉过目（含 reader logo 色差）。

**红线**：本 task 只做首页 Recent Writing。Tools 预览区等 Model Checker 做完（task8），Projects 不做。不碰 KI-1/2/3。

---

### task7 ⬜ 待开发

> **目标**：Model Checker 后端 API —— `app/api/model-checker/route.ts`，POST 接口测 OpenAI `/models` + Anthropic `/messages`。
> **设计依据**：`../architecture/decisions/tools-model-checker.md` §7 阶段 1
> **推进**：Milestone 5（`/api/model-checker`、OpenAI / Anthropic 协议测试）

**验收**：`curl` 调用返回 `{ success, latency, data }`；错误场景（错 key / 错 URL）正确分类并提示；超时 10s。前端留 task8。

---

### task8 ⬜ 待开发

> **目标**：Model Checker 前端页 + 工具索引页 —— `app/tools/model-checker/page.tsx`（表单 + 调后端 + 结果展示）、`lib/model-providers.ts`（预设服务商）、`app/tools/page.tsx`（工具卡片）。
> **设计依据**：`../architecture/decisions/tools-model-checker.md` §7 阶段 2+3
> **推进**：Milestone 5（`/tools`、工具卡片、表单、结果展示）；顺带 Milestone 1 在首页补一张工具卡片

**验收**：填表 → Test → 成功绿 / 失败红；loading 态（按钮 disabled + spinner）；API Key 用密码框且不存储 / 不记日志；三主题正常；`pnpm build` 绿。

---

### task9 ⬜ 待开发

> **目标**：部署前整理 + 推送 GitHub。
> **设计依据**：`../architecture/decisions/infra-deployment.md` §2+§3
> **推进**：Milestone 6（推送到 GitHub、更新 README）

**核心**：`pnpm build` 绿；处理 KI-1（`pnpm lint` 红 —— 加 `eslint-disable` + 说明，或换 hydration-safe 占位）；移动端 375px 自测；更新 README；commit + `git push origin main`。

---

### task10 ⬜ 待开发

> **目标**：Vercel 部署 + 绑定 sephire.xyz。
> **设计依据**：`../architecture/decisions/infra-deployment.md` §4
> **推进**：Milestone 6（导入 Vercel、配置环境变量、绑定域名）

**核心**：Vercel 导入仓库（自动识别 Next + pnpm）→ 首次部署 → 配 DNS 绑 `sephire.xyz` → 等 SSL 证书。

---

### task11 ⬜ 待开发

> **目标**：部署后验证 + 优化。
> **设计依据**：`../architecture/decisions/infra-deployment.md` §5
> **推进**：Milestone 6（检查移动端显示）

**核心**：Lighthouse 审计（Performance ≥ 90 / a11y ≥ 95）；移动端真机；三主题对照设计稿过目；处理发现的问题。性能基线 `doc/ai/review/perf-baseline.md` 由审查者建立。

---

## Barriers

black right now