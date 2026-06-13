# Sephire Lab 开发日志

## 2026-05-07 16:00

### 本轮目标

完成 Milestone 1：搭建基础站点结构，包括导航栏、首页和基础页面占位。

### 修改文件

- `components/layout/site-header.tsx` (新建)
- `components/layout/site-footer.tsx` (新建)
- `app/layout.tsx` (修改)
- `app/page.tsx` (修改)
- `app/blog/page.tsx` (新建)
- `app/projects/page.tsx` (新建)
- `app/tools/page.tsx` (新建)
- `app/about/page.tsx` (新建)

### 完成内容

- 创建了项目目录结构：`components/layout`、`components/blog`、`components/projects`、`components/tools`、`components/theme`、`components/ui`、`lib`、`content/posts`、`content/projects`
- 创建了站点导航栏组件 `SiteHeader`，包含 Writing、Projects、Tools、About 四个导航链接
- 创建了站点页脚组件 `SiteFooter`，包含版权信息和社交链接占位
- 更新了 `app/layout.tsx`：
  - 修改 metadata 为 "Sephire Lab"
  - 引入并使用 SiteHeader 和 SiteFooter
  - 调整了页面布局结构
- 重写了首页 `app/page.tsx`：
  - 清理了 Next.js 默认内容
  - 创建了 Hero 区域，展示站点名称和简介
  - 创建了 Recent Writing 区域，预留文章展示位置
  - 创建了 Projects 预览区，展示 Sephire Lab 项目本身
  - 创建了 Tools 预览区，展示 Model API Checker 工具入口
- 创建了四个基础页面占位：
  - `/blog` - Writing 页面
  - `/projects` - Projects 页面
  - `/tools` - Tools 页面
  - `/about` - About 页面

### 验证方式

运行 `pnpm dev` 并访问以下页面：
- `/` - 首页应显示 Hero、Recent Writing、Projects、Tools 四个区域
- `/blog` - 应显示 "Writing" 标题和占位文字
- `/projects` - 应显示 "Projects" 标题和占位文字
- `/tools` - 应显示 "Tools" 标题和占位文字
- `/about` - 应显示 "About" 标题和占位文字
- 导航栏应在所有页面顶部显示，点击链接可以跳转
- 页脚应在所有页面底部显示

### 遗留问题

- 主题切换功能尚未实现（需要安装 next-themes）
- MDX 文章系统尚未接入
- 工具页面 `/tools/model-checker` 尚未创建
- API 路由 `/api/model-checker` 尚未创建
- 导航栏在移动端可能需要响应式菜单（当前是简单的横向布局）

### 下一步建议

按照 CLAUDE.md 中的开发顺序，下一步应该是 Milestone 2：实现主题系统。

具体任务：
1. 安装 `next-themes` 依赖
2. 创建 `ThemeProvider` 组件
3. 创建 `ThemeSwitcher` 组件
4. 在 `app/layout.tsx` 中集成 ThemeProvider
5. 在导航栏中添加主题切换按钮
6. 定义 light、dark、reader 三个主题的 CSS variables
7. 测试主题切换功能

## 2026-05-15 17:30

### 本轮目标

完成 Milestone 2：实现主题切换系统，支持 light、dark、reader 三个主题。

### 修改文件

- `package.json` (安装依赖)
- `components/theme/theme-provider.tsx` (新建)
- `components/theme/theme-switcher.tsx` (新建)
- `app/layout.tsx` (修改)
- `components/layout/site-header.tsx` (修改)
- `app/globals.css` (修改)

### 完成内容

- 安装了 `next-themes@0.4.6` 依赖
- 创建了 `ThemeProvider` 组件：
  - 封装 next-themes 的 ThemeProvider
  - 配置为客户端组件
- 创建了 `ThemeSwitcher` 组件：
  - 提供 Light、Dark、Reader 三个主题切换按钮
  - 使用 `useTheme` hook 管理主题状态
  - 添加了 mounted 状态避免 hydration 错误
  - 当前选中的主题按钮会高亮显示
- 更新了 `app/layout.tsx`：
  - 引入并集成 ThemeProvider
  - 配置 `attribute="class"` 使用 class 方式切换主题
  - 设置默认主题为 light
  - 定义三个主题：light、dark、reader
  - 添加 `suppressHydrationWarning` 避免服务端渲染警告
- 更新了 `components/layout/site-header.tsx`：
  - 在导航栏右侧添加 ThemeSwitcher 组件
- 更新了 `app/globals.css`：
  - 定义了三个主题的 CSS variables：
    - `light`: 白色背景 (#ffffff)，深色文字 (#171717)
    - `dark`: 深色背景 (#0a0a0a)，浅色文字 (#ededed)
    - `reader`: 米黄色背景 (#f5f1e8)，深灰色文字 (#2d2d2d)
  - 为 reader 主题添加了特殊样式：
    - 增大行距 (line-height: 1.8)
    - 增大字体 (font-size: 1.125rem)
    - 限制文章宽度 (max-width: 65ch)
    - 调整链接颜色为棕色 (#8b4513)
    - 调整代码块背景色

### 验证方式

访问 http://localhost:3000：
- 导航栏右侧应显示 Light、Dark、Reader 三个主题切换按钮
- 点击 Light 按钮，页面应切换为白色背景
- 点击 Dark 按钮，页面应切换为深色背景
- 点击 Reader 按钮，页面应切换为米黄色背景，适合长文阅读
- 刷新页面后主题选择应保持（next-themes 会记住用户选择）
- 当前选中的主题按钮应有高亮显示

### 遗留问题

- MDX 文章系统尚未接入
- 工具页面 `/tools/model-checker` 尚未创建
- API 路由 `/api/model-checker` 尚未创建
- 导航栏在移动端可能需要响应式菜单
- Reader 主题的样式可能需要在实际文章页面中进一步调整

### 下一步建议

按照 CLAUDE.md 中的开发顺序，下一步应该是 Milestone 3：接入 MDX 博客系统。

具体任务：
1. 安装 MDX 相关依赖：`next-mdx-remote`、`gray-matter`
2. 创建 `lib/posts.ts` 工具函数
3. 创建 `app/blog/[slug]/page.tsx` 文章详情页
4. 在 `content/posts/` 中添加示例文章
5. 更新 `app/blog/page.tsx` 显示真实文章列表
6. 更新首页显示最近文章
7. 添加代码高亮支持

## 2026-05-18 21:30

### 本轮目标

根据 Figma 设计稿重构首页和导航栏样式，实现极简设计风格。

### 修改文件

- `CLAUDE.md` (新增设计稿说明)
- `package.json` (安装 @iconify/react)
- `app/globals.css` (更新主题颜色和字体)
- `components/layout/site-header.tsx` (重构导航栏)
- `components/theme/theme-switcher.tsx` (改用图标)
- `app/layout.tsx` (移除页脚，调整布局)
- `app/page.tsx` (极简首页设计)
- `app/music/page.tsx` (新建)

### 完成内容

- 在 `CLAUDE.md` 中添加了设计稿参考章节，记录设计规范
- 安装了 `@iconify/react@6.0.2` 用于图标显示
- 更新了 `app/globals.css`：
  - 引入 Google Fonts 的 Maven Pro 字体
  - 更新主题颜色为设计稿指定的颜色：
    - Light: bg #F9F9F9, text #000000
    - Dark: bg #1E1E1E, text #FFFFFF
    - Reader: bg #EAE5D4, text #1E1907
  - 添加了全局样式重置
- 重构了 `components/layout/site-header.tsx`：
  - 左侧：Logo（黑色方块 + "Sephire Lab" 文字）
  - 中间：Writing、Music、Tools、About 导航链接
  - 右侧：主题切换图标 + 语言切换按钮
  - 实现了当前页面指示器（顶部黑条）
  - 使用 `usePathname` 判断当前路由
- 更新了 `components/theme/theme-switcher.tsx`：
  - 改用图标按钮：太阳（Light）、月亮（Dark）、书本（Reader）
  - 当前主题的图标会高亮显示
- 重构了 `app/page.tsx`：
  - 极简设计，只显示居中的 "Sephire Lab" 标题
  - 大量留白，符合设计稿要求
- 更新了 `app/layout.tsx`：
  - 移除了页脚组件
  - 添加了 `pt-20` 为固定导航栏留出空间
- 创建了 `app/music/page.tsx` 页面（设计稿中有 Music 导航项）

### 验证方式

访问 http://localhost:3000 或 http://localhost:3001：
- 首页应显示极简的 "Sephire Lab" 标题，居中显示
- 导航栏左侧有黑色方块 Logo
- 导航栏中间有 Writing、Music、Tools、About 链接
- 导航栏右侧有三个主题切换图标和语言切换按钮
- 点击主题图标可以切换 Light、Dark、Reader 三个主题
- 当前页面的导航项上方应显示黑色指示条
- 整体风格应符合设计稿的极简黑白风格

### 遗留问题

- 语言切换功能尚未实现（目前只是占位按钮）
- MDX 文章系统尚未接入
- 工具页面 `/tools/model-checker` 尚未创建
- API 路由 `/api/model-checker` 尚未创建
- 导航栏在移动端需要响应式处理
- Projects 页面导航项在设计稿中改为了 Music，需要确认是否保留 Projects

### 下一步建议

1. 测试主题切换功能是否正常工作
2. 调整导航栏的悬停效果和指示器位置
3. 继续按照 CLAUDE.md 的开发顺序，下一步是 Milestone 3：接入 MDX 博客系统

## 2026-05-18 22:00

### 本轮目标

修复 CSS 解析错误，调整导航栏布局使其符合设计稿，统一项目结构为 Writing、Music、Tools、About 四个板块。

### 修改文件

- `app/globals.css` (修复 CSS 导入顺序)
- `components/layout/site-header.tsx` (调整布局)
- `CLAUDE.md` (更新项目结构和页面要求)
- 删除 `app/projects/`、`components/projects/`、`content/projects/` 目录
- 创建 `components/music/`、`content/music/` 目录

### 完成内容

- 修复了 `app/globals.css` 的 CSS 解析错误：
  - 将 `@import url()` 移到文件最前面
  - 必须在 `@import "tailwindcss"` 之前
- 重构了 `components/layout/site-header.tsx` 的布局：
  - 左侧：黑色方块 Logo + "Sephire Lab" 文字
  - 中间：导航链接使用绝对定位居中（`absolute left-1/2 transform -translate-x-1/2`）
  - 右侧：主题切换图标 + 语言切换图标
  - 调整了间距和字体大小以匹配设计稿
  - 语言切换改用图标而不是文字
- 更新了 `CLAUDE.md`：
  - 统一为 Writing、Music、Tools、About 四个板块
  - 更新了目录结构建议
  - 更新了页面内容要求
  - 将 Projects 移到"暂不做"列表，预留扩展空间
- 删除了 projects 相关的目录和文件
- 创建了 music 相关的目录结构

### 验证方式

访问 http://localhost:3000：
- 导航栏左侧应显示黑色方块 Logo + "Sephire Lab"
- 导航链接应该居中显示：Writing、Music、Tools、About
- 右侧应显示主题切换图标和语言切换图标
- 整体布局应符合设计稿
- CSS 解析错误应该消失

### 遗留问题

- 当前页面指示器（顶部黑条）的位置可能需要微调
- 语言切换功能尚未实现（目前只是图标占位）
- MDX 文章系统尚未接入
- Music 页面内容待规划
- 工具页面 `/tools/model-checker` 尚未创建
- API 路由 `/api/model-checker` 尚未创建
- 导航栏在移动端需要响应式处理

### 下一步建议

1. 微调导航栏细节，确保完全符合设计稿
2. 继续按照 CLAUDE.md 的开发顺序，下一步是 Milestone 3：接入 MDX 博客系统

## 2026-05-19 (task2)

### 本轮目标

将项目中绝对尺寸单位（Tailwind 间距类）改为基于 rem 的相对单位，建立统一的间距系统，让页面响应用户的浏览器字体设置，提升无障碍体验。

### 修改文件

- `app/globals.css` (新增间距变量)
- `components/layout/site-header.tsx`
- `components/layout/site-footer.tsx`
- `components/theme/theme-switcher.tsx`
- `app/layout.tsx`
- `app/blog/page.tsx`
- `app/music/page.tsx`
- `app/tools/page.tsx`
- `app/about/page.tsx`

### 完成内容

- 在 `app/globals.css` 的 `:root` 中定义了一套基于 rem 的间距 CSS 变量：
  - `--space-2xs` (0.25rem / 4px)
  - `--space-xs` (0.5rem / 8px)
  - `--space-sm` (0.75rem / 12px)
  - `--space-md` (1rem / 16px)
  - `--space-lg` (1.5rem / 24px)
  - `--space-xl` (2rem / 32px)
  - `--space-2xl` (2.5rem / 40px)
  - `--space-3xl` (3rem / 48px)
  - `--space-4xl` (4rem / 64px)
  - `--space-5xl` (5rem / 80px)
  - 额外定义 `--header-height` (5rem) 用于布局对齐
- 迁移 `site-header.tsx`：
  - `px-12 py-8` → `paddingInline: var(--space-3xl)` / `paddingBlock: var(--space-xl)`
  - 导航 `gap-10` → `gap: var(--space-2xl)`
  - 右侧 `gap-3` → `gap: var(--space-sm)`
  - 悬停指示条 `-top-3` → `top: calc(-1 * var(--space-sm))`
- 迁移 `theme-switcher.tsx`：
  - `gap-1` → `gap: var(--space-2xs)`
  - 按钮 `p-1` → `padding: var(--space-2xs)`
- 迁移 `site-footer.tsx`：
  - `px-6 py-8` → `paddingInline: var(--space-lg)` / `paddingBlock: var(--space-xl)`
  - `gap-4` / `gap-6` → `gap: var(--space-md)` / `gap: var(--space-lg)`
- 迁移 `app/layout.tsx`：
  - `pt-20` → `paddingTop: var(--header-height)`
- 迁移四个页面文件（blog / music / tools / about）：
  - `px-6 py-16` → `paddingInline: var(--space-lg)` / `paddingBlock: var(--space-4xl)`
  - `mb-8` → `marginBottom: var(--space-xl)`

### 设计决策

- 间距变量使用 `--space-*` 前缀而非 `--spacing-*`，避免与 Tailwind v4 默认 `--spacing-*` 命名空间冲突
- 变量定义在普通 `:root` 中（非 `@theme inline`），因为不需要 Tailwind 生成工具类，只供 `style` 属性引用
- 保留了 Tailwind 用于布局、定位、Flex、字体大小（已是 rem）、颜色等非间距用途
- 边框粗细（如 `h-0.5`）和 icon 尺寸（如 `w-5 h-5`）仍使用 Tailwind 类，符合 TODO 中"精确控制处仍可使用 px"的约定
- 视觉效果与改动前完全一致（变量值与原 Tailwind 类换算后的 px 一一对应）

### 验证方式

访问 http://localhost:3000：
- 首页应显示居中的 "Sephire Lab" 标题，间距与之前一致
- 导航栏左右内边距、导航项间距、右侧图标间距应保持视觉一致
- 鼠标悬停导航项时，顶部黑色指示条位置应正常
- 切换 Light / Dark / Reader 三个主题应正常工作
- 访问 `/blog`、`/music`、`/tools`、`/about` 应正常显示，页面内边距正常
- 在浏览器设置中调整默认字体大小（如 chrome://settings/fonts），所有间距应等比例缩放

### 遗留问题

- 字体大小（`text-base` / `text-4xl` 等）目前仍使用 Tailwind 类，不过 Tailwind 默认字号本身已是 rem 单位，已经响应根字号
- 容器宽度（`max-w-4xl` / `max-w-6xl`）仍使用 Tailwind 类，未来若需要统一可继续扩展 `--content-max-width-*` 变量
- 未来新增组件需遵循该间距系统，避免再次混入硬编码 px / 任意 Tailwind 间距类

### 下一步建议

1. 继续 Milestone 3：接入 MDX 博客系统
2. 在引入 MDX 文章正文时，再根据阅读体验补充更多间距 token（如段落间距、行高变量）

## 2026-05-20 (task2 重构 + 收尾)

### 本轮目标

承接 task2，把首版的"`:root { --space-* }` + 组件里写 inline `style`"重构为 Tailwind v4 原生方案，并修掉发现的两个 bug。

### 修改文件

- `app/globals.css` (重构 @theme 块)
- `components/layout/site-header.tsx`
- `components/layout/site-footer.tsx`
- `components/theme/theme-switcher.tsx`
- `app/blog/page.tsx` / `app/music/page.tsx` / `app/tools/page.tsx` / `app/about/page.tsx`
- `app/page.tsx` (首页居中修复)

### 完成内容

- **重构为 `@theme` 命名 token**：把 `--space-*` 改名为 Tailwind 保留的 `--spacing-*` 命名空间，放进独立 `@theme` 块。Tailwind v4 据此自动生成 `p-md`、`px-3xl`、`gap-2xl`、`mb-xl` 等所有 spacing utility 类
- **组件改用 utility 类**：所有原 `style={{ padding: 'var(--space-md)' }}` 改为 `className="p-md"` 形式。`style` 仅保留给动态颜色（`var(--text-primary)` 等主题色）和 `var(--header-height)` 这类非 spacing 变量
- **删除冗余 reset**：移除 `globals.css` 第 62-66 行的 `* { margin: 0; padding: 0; box-sizing: border-box }`，因为 Tailwind v4 preflight 已包含
- **修复首页标题居中**：原来用 `min-h-[calc(100dvh-var(--header-height))]`，但 page div 仍被 main 的 padding-top 推到 y=5rem，几何中心比视口中心低 2.5rem。改为 `min-h-[100dvh] mt-[calc(-1*var(--header-height))]`，让 page div 反向偏移到 y=0 跨整个视口，标题落在视口几何中心
- **首页改用 `dvh`**：从 `100vh` 改为 `100dvh`（dynamic viewport height），手机浏览器地址栏伸缩时不会抖动

### 设计决策

- **`@theme` vs `:root`**：Tailwind v4 中，命名 token 必须放在 `@theme` 才会自动生成 utility 类。`:root` 只能定义普通 CSS 变量
- **`@theme` vs `@theme inline`**：`inline` 模式会把变量值直接展开到 utility 中（失去运行时可覆盖性），spacing 不需要这个特性，故用普通 `@theme`
- **`--header-height` 单独留在 `:root`**：它是一次性布局变量，不属于 spacing scale，放进 `@theme` 会污染 spacing utility 命名空间
- **首页居中用负 margin 而非 padding-bottom**：负 margin 让 page div 跨整个视口，几何中心 = 视口中心；padding-bottom 方案算出来有舍入误差

### 遇到的坑

1. **Turbopack 不会热重载新加的 `@theme` token**：必须冷启动 dev server（Ctrl+C 后重跑 `pnpm dev`），Tailwind 的 JIT scanner 才会注册新 token
2. **CSS 变量未定义时的 fallback 行为**：`padding: var(--undefined)` → 整个声明无效 → 回退到 initial 值 0。这正是我们 debug "页眉只剩 20px" 时的根因
3. **逻辑属性 vs 物理属性的 cascade**：`paddingInline` 是逻辑属性，与 `padding`（物理属性简写）在某些浏览器中有微妙差异——所以用 Tailwind utility 类（生成的是物理属性）更稳

### 验证方式

访问 http://localhost:3000：
- 首页 "Sephire Lab" 标题落在视口几何中心，没有滚动条
- 页眉高度正常（py-xl ≈ 32px 上下内边距 + 内容 ≈ 80px 总高）
- 导航链接之间 40px 间距，鼠标悬停顶部黑条出现在文字上方约 12px 处
- Light / Dark / Reader 主题切换正常
- 浏览器 chrome://settings/fonts 改大默认字号后，所有间距等比放大

### 遗留问题

- 字体大小（`text-4xl`、`text-base` 等）仍使用 Tailwind 类，但 Tailwind 默认字号已是 rem 单位，已经响应根字号
- 容器最大宽度（`max-w-4xl`、`max-w-6xl`）仍使用 Tailwind 默认值，未提到 `--container-*` 命名空间
- 语言切换按钮仍是占位，无实际功能

### 下一步建议

继续 task3：用 Headless UI 封装下拉菜单和按钮组件，重构主题切换器为下拉菜单。

## 2026-05-20 (task3)

### 本轮目标

用 Headless UI v2 封装通用下拉菜单和按钮组件，把主题切换从横排图标重构为下拉菜单形式。

### 修改文件

- `package.json` (安装依赖)
- `app/globals.css` (新增 `--bg-hover` 主题变量)
- `components/ui/button.tsx` (新建)
- `components/ui/icon-button.tsx` (新建)
- `components/ui/dropdown.tsx` (新建)
- `components/theme/theme-dropdown.tsx` (新建)
- `components/theme/language-dropdown.tsx` (新建)
- `components/layout/site-header.tsx` (重构)
- `components/theme/theme-switcher.tsx` (删除)

### 完成内容

- 安装 `@headlessui/react@2.2.10`
- 在 `globals.css` 三个主题块各加 `--bg-hover` 变量（light: rgba(0,0,0,0.05), dark: rgba(255,255,255,0.08), reader: rgba(30,25,7,0.06)），用于 dropdown item 的悬停背景，自动跟随主题
- **`components/ui/button.tsx`**：最小通用按钮，ghost 风格（透明背景 + `--text-primary`），forwardRef + `disabled` 状态
- **`components/ui/icon-button.tsx`**：图标按钮，强制要求 `aria-label`，内置 20×20 图标槽位
- **`components/ui/dropdown.tsx`**：
  - `Dropdown` - 包裹 Headless UI Menu，props: `triggerIcon` / `triggerLabel` / `triggerIconSize` / `align`
  - 用 HUI v2 的 `MenuItems anchor={{ to, gap }}` 自动定位，省去 Floating UI 配置
  - 用 `transition data-[closed]:scale-95 data-[closed]:opacity-0` 实现开关动画
  - `DropdownItem` - 子组件，支持 `icon` / `iconSize` / `active` props，用 `data-[focus]:bg-[var(--bg-hover)]` 主题感知高亮
- **`components/theme/theme-dropdown.tsx`**：
  - 把三个主题的 icon / iconSize 抽成数组（per-theme: sun 20、moon 17、book 20）
  - Trigger 跟随当前主题：`current = themes.find(t => t.id === theme)`
  - Trigger 和 item 共用同一份 iconSize，改一处两处生效
- **`components/theme/language-dropdown.tsx`**：占位 dropdown，中文/English 两项，本地 state 记录选中，未接 i18n
- **`site-header.tsx`**：右侧三个分散的主题按钮 + 一个语言按钮 → 两个 dropdown

### 关键调试与学习

1. **iconify 图标视觉大小不一致**：`solar:moon-broken` 的 glyph 几乎填满 viewBox，`solar:sun-broken` 只占中间一小块。同一 width/height 下 moon 看起来明显更大。解法：per-icon iconSize（17 vs 20）做视觉补偿
2. **不同 iconSize 导致文字不对齐**：flex 布局下，icon 自然宽度不同 → 文字 x 起点不同。解法：用 `<span class="inline-flex w-5 h-5 shrink-0 items-center justify-center">` 包裹 Icon，给一个**固定尺寸槽位**，icon 在槽位里居中，槽位宽度恒定 → 文字起点恒定
3. **Headless UI v2 优势**：内置 `anchor` 定位（不需 Floating UI 手动配置）、内置 transition、`data-*` 属性配合 Tailwind 任意值（如 `data-[focus]:bg-[var(--bg-hover)]`）非常顺手

### 验证方式

- 右上角两个图标：当前主题图标 + globe
- 点击主题图标 → dropdown 弹出，三项 Light/Dark/Reader，当前项高亮（accent 色 + 粗体）
- 点击任意项 → 主题切换、菜单关闭、trigger 图标变为新主题图标
- 键盘：Tab 聚焦 → Enter 展开 → ↑↓ 导航 → Enter 选中 → Esc 关闭
- 点击菜单外 → 自动关闭
- 三个主题下，dropdown 的 hover 高亮颜色都自适应

### 遗留问题

- 语言切换是占位实现，未接 i18n
- 切换主题时 header 比页面主体渲染更快，能短暂看到边界（已记在 TODO 的"Goal Adjustment and Refine"）
- 大图标场景（iconSize > 20）会溢出 20×20 槽位，目前业务场景没遇到

### 下一步建议

按 Milestone 顺序进入 MDX 博客系统（task4 待规划）。也可以先处理用户记录的渲染时机问题。

## 2026-06-07 15:25 (task4)

### 本轮目标

Milestone 3 切片 A（tracer bullet）：把**单篇**博客文章端到端跑通——MDX 编译 + frontmatter zod 校验 + Shiki 代码高亮 + 思源宋体正文 + 三主题。先不做列表页/筛选（切片 B/C）。按 `mdx-pipeline-decisions.md` §11 切片 A 逐步实施。

### 修改文件

- `package.json` / `pnpm-lock.yaml`（装 MDX 依赖）
- `next.config.ts`（`createMDX` 包裹 + remark/rehype 管线）
- `mdx-components.tsx`（**新建**，项目根，@next/mdx 在 App Router 下必须有）
- `content/posts/hello-world.mdx`（**新建**，金丝雀示例文章）
- `lib/content.ts`（**新建**，zod `PostSchema` + `parsePost` / `getPostSlugs` / `getPostBySlug`）
- `app/blog/[slug]/page.tsx`（**新建**，详情页：generateStaticParams + 动态 import + frontmatter 标题区）
- `app/blog/layout.tsx`（**新建**，局部挂载思源宋体变量）
- `lib/fonts.ts`（`notoSerifSC` 的 `weight` 改 `"variable"`；`fontVariables` 仍不含它）
- `app/globals.css`（`@theme inline` 加 `--font-serif`；新增 `.mdx-body` 正文排版 + Shiki 三主题 CSS）

### 新增依赖（理由集中见 `mdx-pipeline-decisions.md` §2/§4/§5，此处只列用途）

| 依赖 | 版本 | 用途 |
|---|---|---|
| `@next/mdx` | **16.2.5**（对齐 Next，registry 最新是 16.2.7） | 官方 MDX 编译，build 时编译为 RSC |
| `@mdx-js/loader` / `@mdx-js/react` | 3.1.1 | MDX 核心 loader / runtime |
| `@types/mdx` | 2.0.14（dev） | `.mdx` 模块类型 |
| `gray-matter` | 4.0.3 | 只读 YAML frontmatter（不编译正文） |
| `zod` | 4.4.3 | build 时校验 frontmatter（zod 4 API：`z.iso.date()` / `z.prettifyError()`） |
| `remark-gfm` | 4.0.1 | 表格/删除线/任务列表/自动链接 |
| `remark-frontmatter` | 5.0.0 | **剥离** YAML frontmatter（详见下方实施反馈①） |
| `rehype-pretty-code` | 0.14.3 | 代码高亮（Shiki 内核，多主题 CSS 变量） |
| `shiki` | 4.2.0 | rehype-pretty-code 的 **peerDependency**，需显式装（实施反馈②） |
| `rehype-slug` / `rehype-autolink-headings` | 6.0.0 / 7.1.0 | 标题 id + 锚点链接 |

装包前按 §8 跑了 `npm view` 核对版本：zod 确为 4.x（按 zod 4 文档写）、`@next/mdx@16.2.5` 存在、`rehype-pretty-code@0.14.3` 的 peer `shiki ^1||^2||^3||^4` 覆盖 4.2.0。

### 完成内容

- **MDX 管线**：`next.config.ts` 用 `createMDX` 包裹，`pageExtensions` 加 md/mdx；Turbopack 约束下插件全部用**字符串名 + 可序列化选项**（核对 Next 16.2.5 离线文档 `node_modules/next/dist/docs/01-app/02-guides/mdx.md` 确认语法）。remark：`remark-frontmatter` → `remark-gfm`；rehype：`rehype-slug` → `rehype-autolink-headings` → `rehype-pretty-code`。
- **代码高亮三主题**：`theme: { light: github-light, dark: github-dark, reader: rose-pine-dawn }` + `keepBackground:false`。核对生成 HTML：每个 token `<span>` 带 `--shiki-light/dark/reader` 三套变量、`<pre>` 无内联背景。`globals.css` 按 `<html>` 的 `.dark`/`.reader` class 把对应变量映射到 `color`。
- **frontmatter 单一事实源**：`lib/content.ts` 的 zod `PostSchema` 定义一次，`Post` 由 `z.infer` 派生；`parsePost` 用 gray-matter 读 + `safeParse`，失败抛错并 `z.prettifyError` 指名文件与字段。
- **字体**：`weight:"variable"`（核对 next/font 的 `font-data.json` 确认 Noto Serif SC 有 wght 200–900 可变轴）；变量只在 `app/blog/layout.tsx` 的 `<div>` 局部挂载，`<html>` 仍只挂 Maven Pro + Geist Mono（已核对生成 HTML）。

### 验证方式

- `pnpm build` 绿：`/blog/[slug]` 标记 `● (SSG)`，`/blog/hello-world` 预渲染为静态 HTML；TypeScript 检查通过（build 内含 tsc）。
- 核对生成 HTML（`.next/server/app/blog/hello-world.html`）：frontmatter 已剥离（无 `type:"post"` 文本）、Shiki 三变量齐全、`mdx-body` 结构正常。
- **zod 生效验证**：故意删掉示例文章 `date` → `pnpm build` 直接失败（exit 1）：`Invalid frontmatter in /Users/.../hello-world.mdx ✖ Invalid input: expected string, received undefined → at date`，并 `exiting the build`。已恢复 date，再 build 转绿。
- dev server（:3000）curl `/blog/hello-world`：HTTP 200，标题/正文/高亮/`font-serif`/局部宋体变量均在位。

### 遗留问题 / 实施反馈（给架构师）

1. **【实施反馈】§6 管线图 + §7 依赖清单缺 `remark-frontmatter`**。`@next/mdx` 默认不处理 frontmatter（离线文档明确写 "does **not** support frontmatter by default"）：gray-matter 只负责"读"，详情页动态 import 的 `.mdx` 正文里那段 `---…---` 若不剥离，会被当成 `<hr>` + 文本渲染出来。已加 `remark-frontmatter` 解决。建议架构师把它补进 §6/§7。
2. **【实施反馈】§7 把 shiki 视作 rehype-pretty-code "自带"，但 shiki 实为其 peerDependency**，需显式安装（已显式装 `shiki@4.2.0`）。
3. **reader 的 Shiki 主题**（§10 未决项 1）定为 `rose-pine-dawn`（暖色，贴合 reader 米色背景）——初步选择，可后续对照设计稿调。
4. **mdx-components.tsx 走"最小实现"**，正文排版集中在 `globals.css` 的 `.mdx-body`，与架构文档"给 pre/code/h2 挂 Tailwind 类"措辞略有出入。理由：与既有 `.reader article` CSS 同体系、后代选择器能干净处理"标题里的锚点链接"和"行内 code vs 代码块 code"，对学习者更连贯（少一套并行机制）。需要用 React 组件替换元素（如 `<img>`→`next/image`）时再往 mdx-components 加。
5. **三主题视觉切换需人工过目**：机制已验证（三套 shiki 变量 + CSS 按 `.dark`/`.reader` 切换 + next-themes 设 class），但 light/dark/reader 的像素级效果请在浏览器点一遍确认。
6. **标题锚点**目前是隐藏空 `<a>`（autolink 默认 prepend），"hover 显示 #" 的视觉留待 §10 未决项 2（切片 C）。

### 下一步建议

切片 B（列表页 `/blog`）：`fs` 扫 `content/posts/` + gray-matter 只读 frontmatter（不编译正文）+ zod 校验 + 按日期排序 → 卡片列表；首页"最近文章"复用同一读取入口。`lib/content.ts` 已备好 `getPostSlugs`，可加 `getAllPosts()`。

## 2026-06-13 18:56 (task5 - Milestone 3 切片 B)

### 本轮目标

Milestone 3 切片 B（列表页）：实现 `/blog` 文章列表页——扫目录 + gray-matter 只读 frontmatter（不编译正文）+ zod 校验 + 按日期降序排序 → 卡片列表。按 `mdx-pipeline-decisions.md` §11 切片 B 实施。

### 修改文件

- `lib/content.ts`（新增 `getAllPosts()` 函数）
- `app/blog/page.tsx`（**新建**，列表页）

### 完成内容

- **`getAllPosts()` 函数**（`lib/content.ts`）：复用已有的 `getPostSlugs()` 和 `parsePost()`，扫 `content/posts/` 读每篇的 frontmatter（gray-matter 只切 YAML 头部、不编译 MDX 正文），zod 校验，按 `date` 降序排序（新文章在前）。返回 `Array<Post & { slug: string }>`。
- **列表页 `app/blog/page.tsx`**：调 `getAllPosts()`，每篇渲染成卡片（标题链接到 `/blog/[slug]`、日期格式化为"YYYY 年 M 月 D 日"、category chip、summary）。使用 spacing token（`mb-3xl`、`space-y-2xl`、`pb-2xl`）和主题变量（`--text-primary`、`--text-secondary`、`--border-color`、`--bg-hover`）。空状态显示"暂无文章"。
- **category 枚举到中文**：临时在页面内定义 `CATEGORY_LABEL`（tech→技术、thoughts→思考、music→音乐、photo→摄影），后续可抽到 `lib/constants.ts`。

### 验证方式

- dev server 访问 `/blog`：HTTP 200，页面标题"博客"、1 张卡片（hello-world）、标题/日期/category chip 正确渲染。
- 点击卡片标题链接 → 跳转到 `/blog/hello-world` 详情页（HTTP 200）。
- **排序逻辑验证**：临时创建第二篇测试文章（date: 2026-06-01，早于 hello-world 的 2026-06-07），重新访问 `/blog` 确认顺序为"你好，世界..."在前、"更早的测试文章"在后（降序正确），验证后删除测试文章。

### 遗留问题 / 后续优化

1. **category 映射抽取**：`CATEGORY_LABEL` 目前在 `page.tsx` 内联，若首页"最近文章"也要显示 category，需抽到 `lib/constants.ts` 或 `lib/content.ts` 统一导出。
2. **无筛选 / 无分页**：列表页当前显示所有文章（按日期降序），不支持按 category/tag 筛选、不支持分页。这些是切片 C 的内容（未来按需加）。
3. **标签显示**：`tags` 字段在 frontmatter schema 里有定义（`z.array(z.string()).optional()`），但列表页卡片暂未显示（TODO Milestone 3 里"添加标签显示"项仍待做）。
4. **首页"最近文章"区**：可复用 `getAllPosts().slice(0, 3)` 取前 3 篇，待首页开发时接入。

### 下一步建议

- **若继续打磨博客**：切片 C（category/tag 筛选、标签 chip 显示、标题锚点 hover 显示 #、`<img>` → `next/image`）。
- **若转战其他 Milestone**：回到 TODO.md 按 Milestone 顺序（如 Milestone 1 基础站点：清理默认首页、创建导航栏、Hero 区域等）。当前 Milestone 3 核心已打通（单篇详情 + 列表），剩余是增强性功能。
