# 评审报告：Milestone 3 切片 B（博客列表页）

> - **评审时间**：2026-06-13
> - **评审范围**：`/blog` 列表页 —— `lib/content.ts`（新增 `getAllPosts()`）、`app/blog/page.tsx`（重写，Server Component 列表）
> - **评审 agent**：reviewer
> - **对照基准**：`mdx-pipeline-decisions.md` §11 切片 B、`content-architecture.md` §6.3 性能原则、根 `CLAUDE.md` spacing/主题变量规范
> - **评审维度**：正确性 / 类型安全 / 性能 / 响应式 / 主题适配 / 设计还原。**未覆盖**：真实浏览器的三主题视觉过目、tag 筛选（切片 C）

---

## 总结

**整体可以接受，可以进入切片 C 或转其他 Milestone。** 列表页按架构设计实现：Server Component、`pnpm build` 绿、预渲染为静态 HTML、`getAllPosts()` 只读 frontmatter 不编译正文（性能合规）、按日期降序排序、spacing token 和主题变量使用一致。**无 🔴 阻塞项、无 🟡**。有 3 个 🟢 提示（内联辅助函数未来需抽取、容器宽度不一致、lint 仍红但非本切片引入）。

---

## 严重度分级

- 🔴 阻塞（必须修才能继续）
- 🟡 警告（建议修，可推迟）
- 🟢 提示（风格 / 优化空间 / 正面记录）

---

## 我实际跑了什么（透明度）

| 动作 | 结果 |
|---|---|
| `pnpm build`（清 `.next` 后冷跑） | ✅ 绿。`/blog` 标 `○ (Static)` 预渲染；tsc 通过 |
| 核对生成 HTML `.next/server/app/blog.html` | 页面标题"博客"、文章标题"你好，世界"、`/blog/hello-world` 链接、`<time dateTime="2026-06-07">`、category chip "技术"、summary —— 全在位 |
| 核对 `page.js` | 无 `"use client"`（Server Component ✅）；空状态分支在源码但未渲染到 HTML（当前有 1 篇文章） |
| 排序逻辑验证 | 手工模拟 `(a.date > b.date ? -1 : 1)`，ISO 字符串降序 = 时间降序 ✅ |
| `getAllPosts` 实现检查 | 只用 `parsePost`（gray-matter），无 `import()` 编译正文 ✅ |
| `pnpm lint` | ❌ 仍红（task3 遗留的 theme-dropdown，非本切片），与 slice A audit 一致 |

**没做**：真实浏览器三主题视觉；tag 筛选（切片 C）；首页"最近文章"复用（未到该 Milestone）。

---

## 具体发现

### 🟢 [提示] `formatDate` 和 `CATEGORY_LABEL` 内联，首页复用时需抽取

- **位置**：`app/blog/page.tsx:4-16`
- **现象**：`formatDate` 函数和 `CATEGORY_LABEL` 对象定义在列表页文件内。LOG 2026-06-13 遗留问题 #1 已标记"若首页要显示 category，需抽到 `lib/constants.ts` 或 `lib/content.ts`"。
- **影响**：当前无影响（只列表页用）。首页"最近文章"区要显示 category 时需抽取，否则重复定义两份。
- **建议**：MVP 可接受。等首页开发时（或任意第二处需要格式化日期 / category 映射时）再抽。**这是有意延后，非遗漏**（LOG 明确记录）。抽取时建议放 `lib/content.ts`（与 `PostSchema` 同文件，category 枚举/映射/schema 保持一处定义）。

---

### 🟢 [提示] 列表页 `max-w-[800px]` vs 详情页 `max-w-[65ch]` 不一致

- **位置**：`app/blog/page.tsx:22` vs `app/blog/[slug]/page.tsx:31`
- **现象**：列表页用绝对值 `800px`（不响应根字号），详情页用字符宽度 `65ch`（响应 `font-size`，排版经典值）。
- **影响**：视觉上，用户调大浏览器字号时列表容器不变宽、详情容器变宽，略有割裂感。但不阻塞功能。
- **建议**：低优先级。设计还原度属"视觉细节"，需对照设计稿确认列表页容器是否应与详情页统一（如都用 `65ch` / 都用 `max-w-4xl`）。若无设计稿明确规定，等真实浏览器视觉过目后调。

---

### 🟢 [提示] `pnpm lint` 仍红（task3 遗留，非本切片引入）

- **位置**：`components/theme/theme-dropdown.tsx:27`
- **现象**：与 slice A audit 一致，`setState-in-effect` 规则报错。
- **影响**：同 `known-issues.md` KI-1（已记录，milestone 6 接 CI 前清）。
- **建议**：本切片未触碰 theme-dropdown，无需在本 audit 重复展开。保持 KI-1 跟踪即可。

---

### 🟢 [正面记录] 几处实现值得肯定

- **Server Component**：列表页无 `"use client"`，预渲染为静态 HTML，零客户端 JS（相比 slice A 审出的旧占位页有 `"use client"`，本次正确实现）。
- **性能合规**：`getAllPosts()` 只用 `parsePost` + gray-matter，不编译正文，符合架构 §6.3 "列表页只读 frontmatter" 原则。
- **排序逻辑**：ISO 8601 日期字符串字典序 = 时间序，`(a.date > b.date ? -1 : 1)` 简洁正确。已手工验证 `2026-06-15 > 2026-06-07 > 2026-06-01` 顺序。
- **CATEGORY_LABEL 覆盖全枚举值**：`PostSchema` 的 `["tech", "thoughts", "music", "photo"]` 四项与 `CATEGORY_LABEL` 键一一对应，且有 `|| post.category` 兜底（未知 category 回退到英文原值）。
- **spacing token 使用**：`mb-3xl` / `space-y-2xl` / `pb-2xl` / `mt-sm` / `mt-md` / `px-md` / `gap-md` 全部来自 `@theme` spacing scale，与既有代码一致。
- **主题变量**：`--text-primary` / `--text-secondary` / `--border-color` / `--bg-hover` 统一用 CSS 变量，三主题自适应。
- **空状态分支**：`posts.length === 0` → "暂无文章"，代码路径完整（虽然当前有 1 篇文章、分支未渲染）。
- **语义化 HTML**：`<article>` / `<time dateTime="...">` / `<h1>` / `<h2>` 标签使用正确，a11y 基础到位。

---

## 设计还原度 / 正确性核对（对照架构文档）

| 架构要求 | 落地情况 |
|---|---|
| 列表页只读 frontmatter、不编译正文（§6.3） | ✅ `getAllPosts` 只用 gray-matter + parsePost，无 `import()` |
| 按日期降序排序（LOG §11 切片 B） | ✅ `posts.sort((a,b) => a.date > b.date ? -1 : 1)` |
| Server Component 预渲染（mdx-pipeline §4/§6） | ✅ 无 `"use client"`，build 标 `○ (Static)` |
| category chip 显示（content-architecture §4.2） | ✅ `CATEGORY_LABEL[post.category]`，chip 样式 `rounded-full` + `bg-hover` |
| spacing token / 主题变量（根 CLAUDE.md） | ✅ 全用 `--spacing-*` / `--text-*` / `--border-*` |
| tags 显示（TODO Milestone 3 / content-architecture §4.3） | ⏸️ **有意延后**。LOG 明确标记"遗留问题 #3，切片 C"。schema 有 `tags` 字段，列表页暂不显示 |
| 首页"最近文章"复用（LOG §11 / content-architecture §9） | ⏸️ **有意延后**。LOG 标记"遗留问题 #4"；`getAllPosts` 已导出，首页可 `.slice(0,3)` |

---

## 对比 slice A 的改进

| slice A 审出问题 | slice B 状态 |
|---|---|
| 旧 `/blog` 有不必要的 `"use client"` | ✅ **已修正**：重写为 Server Component |
| — | 无新引入问题 |

---

## 已知问题清单更新

**无新增**。slice B 代码质量符合预期，所有"遗留"均为 LOG 主动标记的延后项（tags 显示、首页复用、筛选），不属 known-issues（那是"暂不修但要追踪"的**非预期问题**）。

---

## 下一步建议

- **若继续打磨博客**：切片 C（tag 显示 + category/tag 筛选、标题锚点 hover #、`<img>` → `next/image`）。
- **若转其他 Milestone**：回 TODO.md 按顺序（如 Milestone 4 项目展示、Milestone 5 工具集合）。当前博客核心管线（单篇 + 列表）已贯通，剩余是增强性功能。
- **首页"最近文章"接入**：等首页开发时，复用 `getAllPosts().slice(0, 3)` + 把 `formatDate` / `CATEGORY_LABEL` 抽到 `lib/content.ts`。

---

## 附：build 输出确认

```
Route (app)
┌ ○ /
├ ○ /_not-found
├ ○ /about
├ ○ /blog                  ← slice B：预渲染为静态
├ ● /blog/[slug]            ← slice A：SSG
│ └ /blog/hello-world
├ ○ /music
└ ○ /tools
```

`/blog` 标记 `○ (Static)` —— 预渲染为静态 HTML，符合 MVP"无数据库、build 时编译"的架构目标。
