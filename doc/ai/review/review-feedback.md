# 评审反馈（给架构师）

> reviewer 维护。**系统性问题**写在这里，由架构师审阅后决定是否更新 `doc/ai/architecture/` 的决策文档。
> 具体 bug 不写这里——写在对应 audit 报告 + `known-issues.md`。
>
> reviewer **不直接改 `architecture/`**。本文件是单向通道：reviewer 提 → 架构师裁决并回写决策文档。
>
> 状态标记：🆕 待架构师处理 / 💬 讨论中 / ✅ 已回写决策文档（处理完从本文件移除，决策落到 architecture/）

---

## RF-1 🆕 正式确认博客排版机制：mdx-components 最小化 + `.mdx-body` 集中 CSS

- **来源**：`audits/2026-06-07-milestone3-slice-a.md`；开发者 LOG 2026-06-07 实施反馈 #4
- **背景**：`mdx-pipeline-decisions.md` §6 写"必须有 `mdx-components.tsx`……在这里给 `pre`/`code`/`img`/`h2` 等挂 Tailwind 类"。开发者实际做法是：`mdx-components.tsx` 保持最小（空映射），把正文排版集中到 `app/globals.css` 的 `.mdx-body` 作用域 CSS。
- **reviewer 评估**：这是**合理的工程选择**，不是偷懒。理由：① 后代选择器能干净处理"标题里的锚点 `<a>`""行内 `code` vs 代码块 `code`"这类区分，比给每个元素挂 Tailwind 类更省；② 与既有 `.reader article` 同属一套 CSS 体系，三主题统一维护；③ 对学习者少一套并行机制。
- **为什么需要架构师拍板（而不是开发者自己定）**：这不是单篇文章的局部选择，它**定义了 photo/album 未来复用的排版范式**（`content-architecture.md` §9 计划 80% 代码复用）。属于跨模块约定，应落到决策文档而非散在代码注释里。
- **请架构师决定**：
  1. 是否正式采纳 "mdx-components 最小化 + `.mdx-body` 集中 CSS" 为官方排版机制？
  2. 若采纳：更新 `mdx-pipeline-decisions.md` §6 措辞（"给 pre/code/h2 挂 Tailwind 类" → "用 `.mdx-body` 作用域 CSS 集中排版，需 React 组件替换元素时才往 mdx-components 加映射"）。
  3. 连带修 `mdx-components.tsx:9` 的注释错字（写的是 `.article`，实际是 `.mdx-body`——已在 audit 列为 🟡，开发者会改，但决策文档措辞要先统一口径）。

---

## RF-2 🆕 `mdx-pipeline-decisions.md` §6/§7 依赖清单两处需更正

- **来源**：开发者 LOG 2026-06-07 实施反馈 #1/#2（reviewer 汇总进决策通道，确保回写文档而非只停在 LOG）
- **两处**：
  1. **缺 `remark-frontmatter`**：§6 管线图、§7 待装清单都没列它。但 `@next/mdx` 默认不剥离 frontmatter（离线官方文档明确写 "does not support frontmatter by default"），不剥离的话详情页动态 import 的 `.mdx` 开头那段 `---…---` 会被当成 `<hr>` + 文本渲染。开发者已加 `remark-frontmatter@5.0.0` 解决，并核实生成 HTML 无残留。
  2. **shiki 是 peer 依赖、需显式装**：§7 把 shiki 当作 rehype-pretty-code "自带"，实际它是 peerDependency，必须显式安装（开发者已装 `shiki@4.2.0`）。
- **请架构师决定**：把这两点回写进 §6 管线图 + §7 待装清单，避免下次别人照旧清单装包再踩。

---

## RF-3 🆕 reader 主题正文的行内码 / 链接是否专门着色

- **来源**：`audits/2026-06-07-milestone3-slice-a.md` 🟡-3；`known-issues.md` KI-3
- **背景**：milestone-2 留下的 `.reader code { color:#5d4e37 }`、`.reader a { color:#8b4513 }` 与 milestone-3 新 `.mdx-body` 规则按 specificity/源码顺序交叠，导致 reader 主题下"行内码棕色、链接色文章内外不一致"等分叉。当前可读，但不是有意设计。
- **请架构师决定**（这关系到 reader 主题的整体语义，属设计决策不是实现细节）：
  1. reader 模式下，博客**行内码**要不要专门用暖棕色（呼应米色背景），还是统一跟 light/dark 一样用 text-primary？
  2. reader 模式下，**正文链接**配色（`#8b4513` saddlebrown vs text-primary）？
  3. 决策定了之后，开发者据此把旧规则收窄作用域或正式并入 `.mdx-body`（解 KI-3）。

---

## RF-4 🆕（低优）`content-architecture.md` §2 手写 interface 与已落地的 zod schema 有漂移风险

- **来源**：`mdx-pipeline-decisions.md` §4 ⚠️ 落地注意 2（"让 zod schema 成为唯一事实源，删掉手写 `BaseContent` interface 或改为派生"）
- **现状**：`lib/content.ts` 的 `PostSchema` 已落地为事实源。但 `content-architecture.md` §2 仍保留手写的 `BaseContent` / `Post` interface（文档自己也标注"两者必须保持一致"）。
- **请架构师决定**：按文档自己定的约定，把 §2 的手写 interface 改成"规格说明 + 指向 `lib/content.ts` zod schema 为准"，或明确标注它只是人类可读规格、实现以 schema 为准。低优先级，但内容类型扩展（photo/album 加字段）前应理顺，否则两份定义会漂。
