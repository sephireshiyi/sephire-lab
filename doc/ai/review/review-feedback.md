# 评审反馈（给架构师）

> reviewer 维护。**系统性问题**写在这里，由架构师审阅后决定是否更新 `doc/ai/architecture/` 的决策文档。
> 具体 bug 不写这里——写在对应 audit 报告 + `known-issues.md`。
>
> reviewer **不直接改 `architecture/`**。本文件是单向通道：reviewer 提 → 架构师裁决并回写决策文档。
>
> 状态标记：🆕 待架构师处理 / 💬 讨论中 / ✅ 已回写决策文档（处理完从本文件移除，决策落到 architecture/）

---

## RF-1 ✅ 正式确认博客排版机制：mdx-components 最小化 + `.mdx-body` 集中 CSS

- **来源**：`audits/2026-06-07-milestone3-slice-a.md`；开发者 LOG 2026-06-07 实施反馈 #4
- **架构师决策（2026-06-13）**：✅ 正式采纳为官方排版范式。已更新 `mdx-pipeline-decisions.md` §6 措辞 + 更新历史；已修正 `mdx-components.tsx:9` 注释错字。

---

## RF-2 ✅ `mdx-pipeline-decisions.md` §6/§7 依赖清单两处需更正

- **来源**：开发者 LOG 2026-06-07 实施反馈 #1/#2
- **架构师确认（2026-06-13）**：✅ 已在 2026-06-07 并入 `mdx-pipeline-decisions.md`。grep 输出证实 `remark-frontmatter` / `shiki` 均在 §6/§7/更新历史中。

---

## RF-3 ✅ reader 主题正文的行内码 / 链接是否专门着色

- **来源**：`audits/2026-06-07-milestone3-slice-a.md` 🟡-3；`known-issues.md` KI-3
- **架构师决策（2026-06-13）**：✅ 采用统一配色原则——reader 主题目标是"长文阅读舒适"（行高 + 宋体 + 米色背景），不是"给每个元素换颜色"。正文链接 / 行内码与 light/dark 统一用 `var(--text-primary)`；仅代码块保持 Shiki `rose-pine-dawn` 专门着色。已新建 `reader-theme-decisions.md` 完整记录决策 + 实施建议。开发者据此修 KI-3（收窄旧规则作用域或删除）。

---

## RF-4 🟢（低优）`content-architecture.md` §2 手写 interface 与已落地的 zod schema 有漂移风险

- **来源**：`mdx-pipeline-decisions.md` §4 ⚠️ 落地注意 2
- **架构师判断（2026-06-13）**：🟢 低优先级，暂不处理。§2 已标注"规格说明，实现以 zod 为准"。photo/album 扩展前再理顺即可。
