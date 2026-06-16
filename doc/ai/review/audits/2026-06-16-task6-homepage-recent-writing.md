# 评审报告：task6 首页 Recent Writing

> - **评审时间**：2026-06-16
> - **评审范围**：首页 Recent Writing、`PostCard` 抽取、`formatDate` / `CATEGORY_LABEL` 抽取
> - **评审 agent**：reviewer
> - **对照基准**：`doc/ai/architecture/decisions/homepage-design.md`、`doc/ai/develop/TODO.md` task6、`doc/ai/review/known-issues.md`

## 总结

整体可以接受，**无 🔴 阻塞项**。首页已从 `"use client"` 改回 Server Component，`pnpm build` 在隔离目录通过且 `/` 标记为 `○ (Static)`；Hero 首屏类名保持原设计，Recent Writing 没有挤压首屏。主要风险是 reader 主题下全局 `.reader article` 会作用到新抽出的 `PostCard`，建议开发者后续收窄作用域。

## 严重度分级

- 🔴 阻塞（必须修才能继续）
- 🟡 警告（建议修，可推迟）
- 🟢 提示（风格 / 优化空间 / 已知偏差）

## 我实际跑了什么

| 动作 | 结果 |
|---|---|
| `npx tsc --noEmit` | ✅ 通过 |
| 隔离目录 `pnpm build` | ✅ 通过；`/` 为 `○ (Static)`，`/blog` 为 `○ (Static)`，`/blog/[slug]` 为 `● (SSG)` |
| `pnpm lint` | ❌ 仍只报 KI-1：`components/theme/theme-dropdown.tsx:27` 的 `setState-in-effect` |
| client reference manifest 窄搜 | ✅ 未发现 `app/page.tsx`、`components/blog/post-card.tsx`、`lib/content.ts` 进入客户端引用 |
| 生成 HTML 核对 | ✅ 首页含 Hero、Recent Writing、文章卡片、`/blog/hello-world`、`/blog` 链接 |
| 浏览器三主题过目 | ⚠️ 未覆盖；本地 Browser 对 `http://localhost:3000` 导航被安全策略拦截 |

## 具体发现

### 🟡 [警告] reader 主题的全局 `.reader article` 会泄漏到 `PostCard`

- **位置**：`app/globals.css:81`、`components/blog/post-card.tsx:18`、`app/page.tsx:37`
- **现象**：`.reader article, .reader .prose` 会给所有 `<article>` 加 `max-width: 65ch`、`font-size: 1.125rem`、`line-height: 1.8`。`PostCard` 根元素也是 `<article>`，所以 reader 主题下首页 Recent Writing 卡片和 `/blog` 列表卡片都会被这条长文规则影响。
- **影响**：light / dark 下卡片按 `max-w-[800px]` 容器铺开；reader 下卡片自身会被 `65ch` 限宽并放大字号，可能造成卡片边线变短、标题/摘要尺寸与列表页设计不一致。这个问题 task5 后已影响 `/blog`，task6 把同一组件放进首页后扩大到了 `/`。
- **建议修复**：把 reader 长文规则收窄到博客详情正文，例如给 `app/blog/[slug]/page.tsx` 的详情 `<article>` 加专用类后改成 `.reader .mdx-article`，或删除 broad `article` 选择器，改由 `.mdx-body` / 详情页类名显式控制长文排版。

### 🟢 [提示] `PostCard` 标题固定为 `h2`，首页语义层级略扁

- **位置**：`components/blog/post-card.tsx:23`、`app/page.tsx:25`
- **现象**：`PostCard` 的标题硬编码为 `h2`。在 `/blog` 列表页中是合理的：页面 `h1` 后每篇文章 `h2`。但首页已有 `h2 Recent Writing`，卡片标题继续用 `h2`，会和 section 标题处于同一层级。
- **影响**：不影响视觉或跳转，但屏幕阅读器的 heading navigation 会少一点结构感。
- **建议修复**：后续如果继续复用卡片，可给 `PostCard` 增加轻量 `headingLevel` / `titleAs`，首页传 `h3`，列表页保留 `h2`。

### 🟢 [提示] Recent Writing 容器宽度与架构文档有偏差，但已在 LOG/TODO 主动记录

- **位置**：`app/page.tsx:24`；对照 `doc/ai/architecture/decisions/homepage-design.md:121`、`:178`
- **现象**：架构文档写 `max-w-4xl`，实际实现为 `max-w-[800px]`。
- **影响**：严格对照文档是偏差；但它与当前 `/blog` 列表页 `max-w-[800px]` 保持一致，符合"复用 /blog 样式"的意图，也避免在 `800px`、`65ch`、`4xl` 之间引入第三种宽度。
- **建议修复**：不要求 task6 立即改。等架构师处理切片 B 遗留的容器宽度统一问题时，一次性决定 `/blog` 与首页 Recent Writing 的最终宽度，并更新 `homepage-design.md`。

## 验收项核对

| 验收项 | 结论 |
|---|---|
| 符合 homepage-design.md：极简 Hero + 下滚 Recent Writing | ✅ 结构符合；容器宽度有已记录偏差 |
| 首页首屏 Hero 不被 Recent Writing 影响 | ✅ Hero 原核心类名保持，Recent Writing 在后续 section |
| `app/page.tsx` 保持 Server Component | ✅ 无 `"use client"`；build 为 `○ (Static)` |
| `PostCard` 抽取不改变 `/blog` 行为 | ✅ markup 基本原样搬迁；列表页仍用同数据、同空状态 |
| `lib/content.ts` 展示辅助函数 | ✅ `CATEGORY_LABEL` 绑定 `Post["category"]`，`formatDate` 避免 `new Date()` 时区坑 |
| 三主题明显样式风险 | 🟡 reader 下 `.reader article` 泄漏到卡片，需收窄 |
| a11y / 响应式 / 类型安全 / 性能 | ✅ 类型与性能通过；🟢 heading 层级可优化；浏览器响应式未实测 |
| KI-1 / KI-2 / KI-3 | ✅ KI-1 仍存在但未扩大；KI-2 未触发；KI-3 未触碰，但本次发现同类 reader 全局选择器风险 |

## 已知问题清单更新

暂不更新 `known-issues.md`。本次新增的 reader `article` 泄漏建议直接由 developer 在后续修复；若决定继续暂缓，再由 reviewer 追加到 known issues。
