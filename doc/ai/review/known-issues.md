# 已知问题清单

> reviewer 维护。记录"暂不修但要追踪"的问题。每条注明：发现日期 / 严重度 / 暂缓原因 / 触发重评的条件。
> 修复后从本清单移除（保留在原 audit 报告里作为历史）。
>
> 严重度：🔴 阻塞 / 🟡 警告 / 🟢 提示

---

## KI-1 🟡 `pnpm lint` 失败：effect 内同步 setState

- **发现日期**：2026-06-07（audit：`audits/2026-06-07-milestone3-slice-a.md`）
- **位置**：`components/theme/theme-dropdown.tsx:27`（`language-dropdown.tsx` 若同款 mounted 守卫亦然）
- **现象**：eslint `react-hooks/set-state-in-effect` 报错，`useEffect(() => setMounted(true), [])` 触发规则。`pnpm lint` exit 1。
- **暂缓原因**：next-themes 经典 hydration 守卫；非 milestone 3 切片 A 引入（task3 遗留）；`next build` 当前不跑 eslint，不阻断部署。
- **触发重评的条件**：① milestone 6 接 Vercel/CI 前（部署前必须清）；② 任何时候开启 `next lint` 或把 lint 纳入 CI 门禁；③ 处理 header 渲染时机问题（TODO "Goal Adjustment" 第 1 条）时顺手解决。
- **建议方向**：加 `eslint-disable-next-line` + 说明，或用 hydration-safe 占位替代 `mounted`+`return null`（同时消首屏 CLS）。

---

## KI-2 🟡 `--header-height` 魔法值的布局 / 锚点双重耦合

- **发现日期**：2026-06-07
- **位置**：`app/globals.css:30` → `app/layout.tsx:33`（main paddingTop）+ `app/globals.css:124,131`（h2/h3 scroll-margin-top）
- **现象**：`--header-height: 8.5rem` 是按 header `py-3xl` + 内容手算的固定值；fixed header 让位 + 锚点偏移都依赖它准确。
- **暂缓原因**：当前值与实际 header 高度匹配，功能正常；彻底解法（ResizeObserver 动态测量）对 MVP 过重。
- **触发重评的条件**：① 改 site-header 的 padding / 字号 / dropdown 图标尺寸；② 锚点跳转后标题位置明显偏移（被页眉压住或留白过多）；③ 移动端 header 换行导致实际高度变化。
- **建议方向**：先在 `site-header.tsx` 加注释标明耦合；后期若频繁踩坑再上动态测量。

---

## KI-3 🟡 `.reader code` / `.reader a` 与 `.mdx-body` 作用域重叠

- **发现日期**：2026-06-07
- **位置**：`app/globals.css:94-102`（milestone-2 旧规则）vs `:156-178`（milestone-3 新 `.mdx-body`）
- **现象**：specificity / 源码顺序导致——reader 主题下行内码文字色被旧 `.reader code` 的 `#5d4e37` 接管（light/dark 用继承 text-primary），三主题分叉；reader 链接在文章内/外也分叉。非有意设计，是 cascade 巧合。
- **暂缓原因**：当前都可读、对比度过 AA；正确修法取决于架构师对"reader 正文是否专门着色"的决策（见 `review-feedback.md` RF-3）。
- **触发重评的条件**：① 架构师就 RF-3 给出决策；② photo/album 复用 `.mdx-body` 时（坑会扩散）；③ 调整 reader 主题正文配色发现改 `.mdx-body` 不生效。
- **建议方向**：旧规则收窄作用域，或把 reader 正文特殊色显式写进 `.reader .mdx-body ...`。
