# Sephire Lab TODO

---

## Milestones

1. 基础站点
- [ ] 清理 Next.js 默认首页
- [ ] 创建基础导航栏
- [ ] 创建首页 Hero 区域
- [ ] 创建 Recent Writing 区域
- [ ] 创建 Projects 预览区
- [ ] 创建 Tools 预览区
- [ ] 创建 `/blog`
- [ ] 创建 `/projects`
- [ ] 创建 `/tools`
- [ ] 创建 `/about`
2. 主题系统
- [ ] 安装 next-themes
- [ ] 创建 ThemeProvider
- [ ] 创建 ThemeSwitcher
- [ ] 添加 light 主题
- [ ] 添加 dark 主题
- [ ] 添加 reader 主题
- [ ] 使用 CSS variables 管理主题颜色
3. MDX 博客
- [x] 创建 `content/posts`
- [x] 添加第一篇 MDX 文章
- [x] 实现读取文章元信息
- [ ] 实现 `/blog` 文章列表
- [x] 实现 `/blog/[slug]` 文章详情
- [x] 添加代码高亮
- [ ] 添加标签显示
4. 项目展示
- [ ] 创建项目数据结构
- [ ] 创建项目卡片组件
- [ ] 完成 `/projects`
- [ ] 添加 2-3 个示例项目
5. 工具集合
- [ ] 完成 `/tools`
- [ ] 创建工具卡片组件
- [ ] 创建 `/tools/model-checker`
- [ ] 实现输入表单
- [ ] 实现测试结果展示
- [ ] 创建 `/api/model-checker`
- [ ] 支持 OpenAI Compatible `/models` 测试
- [ ] 支持 Anthropic Compatible 基础测试
6. 部署
- [ ] 推送到 GitHub
- [ ] 导入 Vercel
- [ ] 配置环境变量
- [ ] 绑定 sephire.xyz
- [ ] 检查移动端显示
- [ ] 更新 README

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

## Barriers

black right now