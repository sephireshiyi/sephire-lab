# Reader 主题配色决策

> 记录 reader 主题（米色背景 #EAE5D4）的配色原则，解决 milestone-2 遗留的"全局实验规则"与 milestone-3 新增 `.mdx-body` 作用域的重叠问题。
>
> **状态**：✅ 已确认（2026-06-13）
>
> **更新历史**：
> - 2026-06-13：初版。根据 reviewer RF-3 / KI-3 反馈，架构师给出统一配色原则。

---

## 1. 设计原则

**reader 主题的核心目标是"长文阅读舒适"**，体现为：
- 行高 1.8（vs light/dark 的默认 1.5）
- 正文思源宋体（vs 全站 Maven Pro 无衬线）
- 米色背景 #EAE5D4 + 深褐文字 #1E1907（低对比度，减少眼疲劳）

**reader 不是"给每个元素换颜色"的彩色主题**，而是"调整排版节奏"的阅读模式。因此配色原则是：

> **与 light/dark 保持一致性**，只在"阅读舒适性"必需的地方（背景、正文字色、代码块语法高亮）做差异化；其他元素（链接、行内码）复用统一的 `--text-primary` 等主题变量，**不专门着色**。

---

## 2. 具体元素配色

| 元素 | light | dark | reader | 统一性 |
|---|---|---|---|---|
| **背景** | #F9F9F9 | #1E1E1E | #EAE5D4 | ❌ 主题差异化 |
| **正文字色** | #000000 | #FFFFFF | #1E1907 | ❌ 主题差异化 |
| **正文链接** | `var(--text-primary)` + 下划线 | 同 | 同 | ✅ 统一 |
| **行内 code 文字色** | 继承 `var(--text-primary)` | 同 | 同 | ✅ 统一 |
| **行内 code 背景** | `var(--bg-secondary)` | 同 | 同 | ✅ 统一 |
| **代码块语法高亮** | Shiki `github-light` | Shiki `github-dark` | Shiki `rose-pine-dawn` | ❌ 暖色调贴合米色背景 |
| **代码块背景** | `var(--bg-code)` | 同 | 同 | ✅ 统一（由 `@theme` token 驱动） |

---

## 3. 遗留问题：milestone-2 的旧全局规则

`app/globals.css:94-102` 有 milestone-2 留下的两条规则：

```css
.reader a {
  color: #8b4513;              /* saddlebrown */
  text-decoration: underline;
}

.reader code {
  background: #e8e4d9;
  color: #5d4e37;              /* 暖棕色 */
}
```

这两条是 milestone-2 全局主题实验遗留（当时还没有博客正文）。milestone-3 新增 `.mdx-body` 作用域后，因 specificity / 源码顺序巧合，导致：
- reader 主题下博客**行内码**被 `.reader code` 接管为 `#5d4e37`（light/dark 用继承），三主题分叉
- reader **链接**在文章内外配色不一致

**这不是有意设计，是 cascade 巧合**（reviewer KI-3）。

---

## 4. 正式决策：收窄旧规则作用域

根据 §2 统一性原则，旧规则应收窄到"非博客正文"的作用域，让 `.mdx-body` 里的元素走统一配色：

```css
/* 收窄到「非 .mdx-body」的全局作用域（例如 header / footer / 首页链接）*/
.reader a:not(.mdx-body a) {
  color: #8b4513;
  text-decoration: underline;
}

.reader code:not(.mdx-body code) {
  background: #e8e4d9;
  color: #5d4e37;
}
```

或者干脆删掉这两条（当前全站链接 / 行内码在 reader 下已可读），等以后明确需要非正文区域专门着色时再加。

---

## 5. 实施建议（交给 developer）

在下次处理 KI-3 时（或 photo/album 复用 `.mdx-body` 前）：

1. 把 `app/globals.css:94-102` 的两条旧规则收窄作用域（`:not(.mdx-body ...)`），或直接删除
2. 核对三主题下 `/blog/hello-world` 的行内码 / 链接配色是否统一
3. 核对 header / footer / 首页的链接 / 行内码（若有）是否仍可读

---

## 6. 未来扩展

若后续明确需要 reader 主题在"非正文区域"（导航栏、首页卡片等）给链接/行内码专门着色，在本文档更新决策后再加回对应规则。当前阶段先统一。
