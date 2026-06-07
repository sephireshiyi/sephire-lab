# 评审报告：Milestone 3 切片 A（MDX 博客 tracer bullet）

> - **评审时间**：2026-06-07
> - **评审范围**：单篇博客端到端管线 —— `next.config.ts` / `mdx-components.tsx` / `lib/content.ts` / `lib/fonts.ts` / `app/blog/[slug]/page.tsx` / `app/blog/layout.tsx` / `content/posts/hello-world.mdx` / `app/globals.css`（`.mdx-body` 段 + `--font-serif`）/ `package.json`
> - **评审 agent**：reviewer
> - **对照基准**：`mdx-pipeline-decisions.md`（§4/§5/§6/§11 切片 A）、`content-architecture.md`（§2 数据模型 / §6 渲染管线）、`font-decisions.md`（§5）、根 `CLAUDE.md`
> - **评审维度**：正确性 / 类型安全 / 性能 / a11y / 主题适配 / 响应式 / 安全 / 设计还原。**未覆盖**：真实浏览器的三主题像素级过目（环境无浏览器，见文末"覆盖边界"）

---

## 总结

**整体可以接受，可以进入切片 B。** 管线按架构设计端到端跑通：`pnpm build` 绿、`/blog/hello-world` 预渲染为 SSG、tsc 通过；我独立核对生成 HTML，确认 Shiki 三主题变量齐全、frontmatter 已剥离、标题锚点无障碍安全、代码块结构与 CSS 选择器对得上。**无 🔴 阻塞项**。有 4 个 🟡（1 个是注释错字、1 个 lint 红、2 个 CSS/布局耦合脆弱）和若干 🟢，均不影响继续往下做。

有 1 个**设计偏离**已由开发者在 LOG 主动反馈（mdx-components 最小化 + `.mdx-body` 集中排版，偏离 §6 措辞），需架构师定夺 —— 已转 `review-feedback.md`。

---

## 严重度分级

- 🔴 阻塞（必须修才能继续）
- 🟡 警告（建议修，可推迟）
- 🟢 提示（风格 / 优化空间 / 正面记录）

---

## 我实际跑了什么（透明度）

| 动作 | 结果 |
|---|---|
| `pnpm build`（清 `.next` 后冷跑） | ✅ 绿。`/blog/[slug]` 标 `● (SSG)`，`/blog/hello-world` 预渲染；TypeScript 检查通过 |
| 核对生成 HTML `.next/server/app/blog/hello-world.html` | 标题锚点 = `<a aria-hidden="true" tabindex="-1">`（a11y 安全）；`--shiki-light/dark/reader` 三套变量齐全；frontmatter 已剥离（无 `<hr>`、无 `category:`/`tracer-bullet` 文本）；`<figure data-rehype-pretty-code-figure>` + `<pre tabindex="0">` 无内联背景；行内 `<code>` 是裸标签 |
| `pnpm lint` | ❌ exit 1，1 个 error（见 🟡-2，非本切片代码） |

**没做**：真实浏览器里 light/dark/reader 三主题的人工过目（本环境无浏览器）。a11y 结论基于静态分析 + 生成 HTML，非读屏器实测。

---

## 具体发现

### 🟡 [警告] `mdx-components.tsx` 注释指向不存在的 `.article`，实际类名是 `.mdx-body`

- **位置**：`mdx-components.tsx:9`
- **现象**：注释写"排版样式集中写在 `app/globals.css` 的 `.article` 作用域里"。但 `globals.css:111` 起的实际作用域是 `.mdx-body`，`app/blog/[slug]/page.tsx:54` 的正文容器也是 `<div className="mdx-body">`。项目里**没有** `.article` 这个类（只有 `.reader article` 这种元素选择器，是另一回事）。
- **影响**：未来开发者（包括几周后的你自己）按注释去找 `.article` 会扑空，或误以为存在两套并行机制。错的注释比没注释更误导。
- **建议修复**：把 `mdx-components.tsx:9` 的 `.article` 改成 `.mdx-body`。一处字符串。

```diff
- * 排版样式集中写在 app/globals.css 的 `.article` 作用域里（与既有的 `.reader article`
+ * 排版样式集中写在 app/globals.css 的 `.mdx-body` 作用域里（与既有的 `.reader article`
```

---

### 🟡 [警告] `pnpm lint` 失败，打破"lint 绿"基线（注：task3 代码，非本切片引入）

- **位置**：`components/theme/theme-dropdown.tsx:27`（`language-dropdown.tsx` 若用同款 mounted 守卫也会中招）
- **现象**：eslint 规则 `react-hooks/set-state-in-effect` 报错——`useEffect(() => { setMounted(true); }, [])` 在 effect 体里同步调 `setState`。这是 next-themes 经典的 hydration 守卫写法，但新版 `eslint-plugin-react-hooks` 把它判为可能触发级联渲染。
- **影响**：`pnpm lint` exit 1。当前 `next build` 不跑 eslint（build log 无 lint 阶段），所以**不阻断部署**；但 milestone 6 接 CI、或开启 `next lint` 后会红。附带：`mounted` 为 false 时 `return null` 让 ThemeDropdown 首屏不渲染 → header 右侧在 hydration 前是空的，有轻微 CLS。
- **建议修复**（二选一，不阻塞切片 B，建议进 known-issues 等部署前清）：
  - **保守**：该行上方加 `// eslint-disable-next-line react-hooks/set-state-in-effect`，并注释说明这是 next-themes 推荐的 hydration 守卫（明确表态"知道这条规则、此处有意为之"）。
  - **更好**：按 next-themes 文档用 hydration-safe 占位替代 `mounted` 守卫——给 trigger 一个固定尺寸骨架 + `suppressHydrationWarning`，既消 lint 错误又消首屏空白闪烁。

---

### 🟡 [警告] milestone-2 旧规则 `.reader code` / `.reader a` 与新 `.mdx-body` 作用域重叠，主题表现靠 cascade 巧合而非显式控制

- **位置**：`app/globals.css:94-102`（`.reader a`、`.reader code`）对阵 `:156-178`（`.mdx-body` 的 `a` / 行内 `code`）
- **现象**（按 specificity 推算 + 已核实 DOM 结构）：
  - **行内 code**：`.mdx-body :not(pre) > code`（特异度 0,1,2）赢过 `.reader code`（0,1,1）的 `background`，但 `.reader code` 的 `color:#5d4e37` 没人覆盖 → **reader 主题下行内码文字是棕色，而 light/dark 下是继承的 text-primary**。三主题不一致，且这棕色不是 `.mdx-body` 有意设的，是旧规则漏过来的。
  - **正文链接**：`.reader a`（0,1,1）与 `.mdx-body a`（0,1,1）**同特异度**，靠源码顺序决定，`.mdx-body a` 在后 → 赢。所以文章内链接在 reader 下是 text-primary、不是 `#8b4513`；但**文章外**（reader 主题的其它页面）链接仍是 `#8b4513`。又一处分叉。
- **影响**：不是"坏了"（都还能读，对比度也过 AA），但主题样式变成"cascade 意外"而非集中可控。以后想调 reader 正文色，改 `.mdx-body` 不一定生效（color 被 `.reader code` 抢），debug 成本高。photo/album 复用 `.mdx-body` 后这个坑会扩散。
- **建议修复**：把 milestone-2 遗留的 `.reader code` / `.reader a` **收窄作用域**（例如只管非文章内容），或把 reader 正文的特殊色**正式并入** `.mdx-body`（写成 `.reader .mdx-body :not(pre) > code { ... }`），让"reader 下正文长什么样"集中在一处说清。**需架构师先拍板** reader 行内码/链接到底要不要专门着色（见 `review-feedback.md` RF-3）。

---

### 🟡 [警告] `--header-height: 8.5rem` 是手工实测的魔法值，被布局和锚点偏移双重依赖

- **位置**：`app/globals.css:30`（定义）→ `app/layout.tsx:33`（main `paddingTop`）+ `app/globals.css:124,131`（h2/h3 `scroll-margin-top`）
- **现象**：header 是 `position: fixed`，靠 `main` 的 `paddingTop: var(--header-height)` 给内容让位；锚点跳转又靠 h2/h3 的 `scroll-margin-top: var(--header-height)` 不被页眉遮住。8.5rem 是按 "py-3xl(48)+内容(~40)+py-3xl(48)=136px" 手算的（site-header 用 `py-3xl`）。
- **影响**：一旦改 header 内容（logo/nav 字号、dropdown 图标尺寸）或 padding，8.5rem 就和实际高度脱钩 → 要么内容被页眉压住，要么锚点跳转差几十像素。本切片当前是对的，但耦合脆弱。
- **建议**：MVP 可接受。先在 `site-header.tsx` 旁加一行注释"改 padding/字号需同步 `--header-height`"。彻底解法（ResizeObserver 实测 header 高度写进 CSS 变量）留到后期，现在不值得做。进 known-issues 跟踪。

---

### 🟢 [提示] `app/blog/page.tsx` 不必要的 `"use client"`

- **位置**：`app/blog/page.tsx:1`
- **现象**：列表页占位是纯静态文字，无 hooks、无事件，却标了 `"use client"`，平白进客户端 bundle。
- **影响**：极小（一点点 JS），且切片 B 会重写它。
- **建议**：切片 B 重写列表页时直接做成 Server Component。按 `content-architecture.md` §3.1，筛选 MVP 用 query 参数，列表本体可纯服务端渲染。现在不必专门改。

### 🟢 [提示] frontmatter 被读两遍（gray-matter + import 编译）

- **位置**：`app/blog/[slug]/page.tsx:26-28`
- **现象**：`getPostBySlug` 用 gray-matter 读一次 frontmatter，正文又 `import()` 编译一次同一 `.mdx`。同文件读两遍。
- **影响**：仅 build 时、单篇，可忽略。这正是架构 §3/§6 的分工（列表靠 gray-matter、详情靠 import），**符合设计**。
- **建议**：无需改，仅作记录。不要为省这一次读而改走 `.mdx` 的 `export const metadata`——那会破坏"列表页不编译正文"的核心设计。

### 🟢 [提示] slug 未净化，靠 `dynamicParams=false` 兜底（当前安全）

- **位置**：`lib/content.ts:58-60`（`path.join(POSTS_DIR, \`${slug}.mdx\`)`）
- **现象**：slug 直接拼进文件路径，无 `../` 过滤。
- **影响**：**当前无风险**——`dynamicParams = false` + `generateStaticParams` 只放行扫描到的真实文件名，运行时非法 slug 直接 404，到不了 `readFileSync`。
- **建议**：无需改，仅作"安全为什么成立"的记录。**若未来加搜索或任何用户可控的 slug 输入**，要在这里补 `path.basename(slug)` 或白名单校验。

### 🟢 [正面记录] 几处实现值得肯定

- `formatDate`（`page.tsx:12-15`）手工切字符串而非 `new Date()`，避开时区把日期推前一天——正确的防御式写法。
- `lib/content.ts:20` 的 `date: z.iso.date()` + 注释说明"必须加引号，否则 YAML 解析成 Date 对象、校验失败"——把隐式坑变成显式约定 + build 时拦截，教学价值高（"parse, don't validate" 的活例子）。
- `Post` 由 `z.infer` 派生、不手写 interface；`getPostBySlug` 才补 `slug` 字段——与架构"slug 从文件名派生、不进 frontmatter"一致，单一事实源落地干净。
- 字体局部挂载（`app/blog/layout.tsx`）+ `fontVariables` 不含宋体 + `preload:false`——完全按 `font-decisions.md` §5 落地，非博客页不下载 CJK。已核实生成 HTML 的 `<html>` 只挂 Maven Pro + Geist Mono。
- 架构师 §5 留的"`weight:"variable"` 落地若报错按文档调"未决项，开发者实测确认 `"variable"` 可用——闭环干净。

---

## 设计还原度 / 正确性核对（对照架构文档）

| 架构要求 | 落地情况 |
|---|---|
| `@next/mdx` 官方编译、RSC、详情页零客户端 JS（§2/§4） | ✅ `page.tsx` 无 `"use client"`，正文服务端渲染 |
| 插件管线顺序：remark-frontmatter→gfm；rehype-slug→autolink→pretty-code（§6） | ✅ `next.config.ts:13-39` 一致 |
| Turbopack 字符串名 + 可序列化选项（§5/§11 坑） | ✅ 全用字符串名，theme 是纯 JSON |
| `generateStaticParams` + `dynamicParams=false` + `await params`（§6/§11） | ✅ `page.tsx:4,7-9,23` |
| zod 单一事实源、build 时校验报错带文件名（§4） | ✅ `lib/content.ts`，LOG 已验证删 date 触发 build 失败 |
| Shiki 三主题 + `keepBackground:false` + CSS 变量映射（§5/决策6） | ✅ 已核实生成 HTML 三变量齐全、`<pre>` 无内联背景、`globals.css:199-215` 按 `.dark`/`.reader` 映射 |
| 正文 `font-serif`、舒适行高、reader 用宋体（font §5） | ✅ `page.tsx:31` `font-serif`，`.mdx-body` `line-height:1.8` |
| **偏离**：§6 要求"在 mdx-components 给 pre/code/h2 挂 Tailwind 类" | ⚠️ 改为 mdx-components 最小化 + `globals.css .mdx-body` 集中。开发者已在 LOG 实施反馈 #4 主动报备。**这是合理的工程选择**（后代选择器干净处理"标题里锚点""行内 vs 块级 code"），但它定义了 photo/album 未来的排版范式 → 需架构师正式确认并更新 §6 措辞。见 `review-feedback.md` RF-1 |
| 架构文档清单遗漏 remark-frontmatter / 误把 shiki 当自带（§6/§7） | 开发者已在 LOG 实施反馈 #1/#2 指出并解决。我汇总进 `review-feedback.md` RF-2，供架构师回写文档 |

---

## 已知问题清单更新

新增到 `doc/ai/review/known-issues.md`：
- **KI-1**（🟡）：`pnpm lint` setState-in-effect（theme/language-dropdown）
- **KI-2**（🟡）：`--header-height` 魔法值的布局/锚点双重耦合
- **KI-3**（🟡）：`.reader code`/`.reader a` 与 `.mdx-body` 作用域重叠（依赖 RF-3 架构决策）

转给架构师（`doc/ai/review/review-feedback.md`）：
- **RF-1**：正式确认 "mdx-components 最小化 + `.mdx-body` 集中排版" 为官方排版机制，回写 §6 + 修 `mdx-components.tsx` 注释
- **RF-2**：§6/§7 补 `remark-frontmatter`、更正 shiki 为显式 peer 依赖（汇总开发者 LOG 反馈）
- **RF-3**：拍板 reader 主题行内码/链接是否专门着色（解 KI-3）
- **RF-4**（低优）：`content-architecture.md` §2 仍有手写 `BaseContent`/`Post` interface，zod schema 已落地，按 §2 自己的约定应改为"由 schema 派生"以防漂移
