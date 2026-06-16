# Reader 主题配色决策

> 记录 reader 主题（米色背景 #F4EDD6）的配色原则，解决 milestone-2 遗留的"全局实验规则"与 milestone-3 新增 `.mdx-body` 作用域的重叠问题。
>
> **状态**：✅ 已确认（2026-06-13）/ 旧规则已清理（2026-06-16 task6）
>
> **更新历史**：
> - 2026-06-13：初版。根据 reviewer RF-3 / KI-3 反馈，架构师给出统一配色原则。
> - 2026-06-16：task6 polish 落地，本文描述的 milestone-2 旧规则**已全部从 `app/globals.css` 删除**（`.reader article/.prose`、`.reader a`、`.reader code`）——行内码 / 链接改为继承主题变量，正文排版统一并入 `.mdx-body`；reader 底色由 `#EAE5D4` 调整为 `#F4EDD6`（secondary 同步微调到 `#FBF6E4`，见 LOG 2026-06-16）。§3 / §3.1 / §5 相应改为"已解决"记录，并把"reader 差异化只 scope 到正文、禁止裸元素选择器"沉淀为通用原则（§4）。触发：reviewer task6 audit 🟡（`.reader article` 泄漏到 `PostCard`）。

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

### 3.1 同源问题：`.reader article` 的排版规则（task6 reviewer 新发现）

`app/globals.css` 还有一条同源的 milestone-2 广播选择器：

```css
.reader article, .reader .prose {
  max-width: 65ch;
  font-size: 1.125rem;
  line-height: 1.8;
}
```

它用**裸 `article` 元素选择器**，会命中所有 `<article>`——包括 task6 抽出的 `PostCard`（根元素就是 `<article>`）。后果：reader 主题下 `/blog` 列表卡片和首页 Recent Writing 卡片被强制 `65ch` 限宽 + 放大字号，与 light/dark 下的卡片排版分叉。task5 起已影响 `/blog`，task6 把 `PostCard` 放进首页后扩散到 `/`（reviewer task6 audit 🟡）。

与 §3 的 `a` / `code` 是**同一类病根**：reader 的差异化规则用裸元素选择器广播，每复用一个语义标签就泄漏一次。

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

`.reader article` 的排版规则同理——它本意只服务博客正文，应由正文作用域承载，而不是裸 `article`：

```css
/* 把长文排版 scope 到博客正文：用 .mdx-body（已是正文排版的单一载体，见 RF-1），
   不要用裸 article（会命中 PostCard 等所有 <article>）*/
.reader .mdx-body {
  font-size: 1.125rem;
  line-height: 1.8;
}
/* 65ch 宽度本就由详情页 article 的 max-w-[65ch] 控制，这条 max-width 可直接删 */
```

**通用原则（适用于所有 reader 规则）**：reader 的差异化只能 scope 到博客正文（`.mdx-body` / 详情页专用类），**禁止裸元素选择器**（`article` / `a` / `code` / `.prose`）广播到全站。

---

## 5. 实施建议（交给 developer）

在下次处理 KI-3 时（或 photo/album 复用 `.mdx-body` 前）：

1. 把 `app/globals.css` 里 milestone-2 的旧广播规则收窄到博客正文作用域，或直接删除：
   - `.reader a` / `.reader code`（配色，§4）→ `:not(.mdx-body ...)` 或删
   - `.reader article, .reader .prose`（排版，§3.1）→ 改 `.reader .mdx-body` 承载、删裸 `article`
2. 核对三主题下 `/blog/hello-world` 的行内码 / 链接配色 + 正文宽度 / 字号 / 行高是否统一
3. 核对 `PostCard` 在 reader 下不再被 `65ch` / 放大字号影响（`/blog` 列表 + 首页 Recent Writing 都看）
4. 核对 header / footer / 首页的链接 / 行内码（若有）是否仍可读

> 行号会随改动漂移，定位以选择器文本为准，不要认死具体行号。

---

## 6. 未来扩展

若后续明确需要 reader 主题在"非正文区域"（导航栏、首页卡片等）给链接/行内码专门着色，在本文档更新决策后再加回对应规则。当前阶段先统一。
