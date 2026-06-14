# 字体决策

> 记录 Sephire Lab 字体选型、加载策略、待定决策。每次涉及字体相关改动时，先回到本文档核对决策。
>
> **更新历史**：
> - 2026-05-26：初版，记录思源宋体引入状态、关键事实与待定项。
> - 2026-06-06：经研究工作流核实 Next.js 16.2.5 的 next/font 实际行为后，敲定 §5 全部待定项；纠正"字重"决策（Noto Serif SC 是可变字体）；补充 CJK 子集真实机制。核实来源见 §3.1 脚注。

---

## 1. 当前字体清单

| 字体 | 用途 | 加载方式 | 字重 | 状态 |
|---|---|---|---|---|
| **Maven Pro** | 全站主字体（UI、首页、nav、非博客正文） | `next/font/google` | 400 / 500 / 600 / 700 | 已生效 |
| **Geist Mono** | 等宽字体（代码块、技术内容） | `next/font/google` | 默认全字重 | 已生效 |
| **Noto Serif SC**（思源宋体） | 博客正文中文渲染（计划） | `next/font/google` | 400 / 700 | ⚠️ 已导入但**未挂载到 HTML** |

---

## 2. 思源宋体 — 关键事实

- "思源宋体" = Source Han Serif（Adobe/Google 联合开发）= Noto Serif CJK（Google 发布名）= 同一套字体
- Google Fonts 上按语言子集发布：
  - **Noto Serif SC** — 简体中文（本项目选用）
  - Noto Serif TC — 繁体中文
  - Noto Serif JP / KR — 日韩
- 中文字体单字重 4–8MB（即使 unicode-range 分包），加载成本远高于 Latin 字体
- Google Fonts 输出的 CSS 已经做 `unicode-range` 切分，浏览器按字符按需下载分包，不会一次拉完整个字体

---

## 3. 已锁定的决策

| 决策点 | 选择 | 理由 |
|---|---|---|
| 字体源 | Google Fonts（`next/font/google`） | 与 Maven Pro / Geist Mono 同管理方式，自动 self-host、无 FOIT、HTTP/2 优化 |
| 字重 | **`weight: "variable"`（可变字体轴）** | ⚠️ **2026-06-06 纠正**：Noto Serif SC 在 next/font 里是**可变字体**（wght 轴 200–900）。原来写的 `["400","700"]` 是请求两个静态实例，多余。改用可变轴，一个文件覆盖所有字重，更轻。注意：`"variable"` 不能和具体字重并列写，否则 next/font 会报错 |
| `display` 策略 | `swap` | 先用 fallback 字体显示文字，下载完再切换。代价是 FOUT 闪烁（宋体差异大时较明显），但比 FOIT 不可见好 |
| `preload` 策略 | `false` | ✅ **核实后确认这是唯一合理选择**：next/font 对 Noto Serif SC **没有 `chinese-simplified` 子集**可选（只有 cyrillic/latin/latin-ext/vietnamese），所以 CJK 字形根本无法 preload，必须 `false` |
| `subsets` 配置 | `["latin"]` | ⚠️ **核实后澄清**：`subsets` **只控制哪个子集生成 `<link rel=preload>`**，不影响 CJK 字形的可用性。CJK 始终通过 Google 的 per-range unicode-range 切片按需下载。配 `["latin"]` 是无害的，因为 preload 反正关着 |

> **§3.1 CJK 子集加载机制（核实结论，最重要的成本问题）**
>
> 核实方式：直接读 next/font 的 loader 源码 `node_modules/next/dist/compiled/@next/font/dist/google/find-font-files-in-css.js` + 离线 API 文档。结论可信度**高**：
>
> - next/font/google **不会**拉取完整的多 MB 思源宋体。Google CSS2 API 把 CJK 字体切成几十个 per-unicode-range 的 woff2 切片，next 在 build 时把这些切片全部 self-host 下来，**浏览器只下载实际渲染到的字符所在的切片**。
> - `subsets: ["latin"]` **不 gate** CJK 字形可用性——它只决定哪个子集会被注入 `<link rel=preload>`。
> - 因此 `next/font/google` 默认方案对中文博客是够用的：首屏只下载文章里出现的汉字所在切片，不是整个字库。**先用，别过早优化**（自托管 + cn-font-split 见 §6，等真实指标证明有问题再上）。

---

## 4. 当前实现状态（半完成）

`lib/fonts.ts` 已经导入并配置了 `notoSerifSC`：

```ts
export const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,
});
```

**但 `fontVariables` 没有包含它**：

```ts
export const fontVariables = `${mavenPro.variable} ${geistMono.variable}`;
//                          没有 ${notoSerifSC.variable}
```

后果：CSS 变量 `--font-noto-serif-sc` 当前**没有**注入到 `<html>` 上。即使在某个组件里写 `font-family: var(--font-noto-serif-sc)`，浏览器找不到这个 variable → 字体不会生效。

**这是个有意的中间状态**：等到真正开发博客页面、能直接看到字体效果时，再二选一决定挂载位置（见 §5）。

---

## 5. 已决策（2026-06-06 敲定）

| # | 问题 | **决策** | 理由 |
|---|---|---|---|
| 1 | 加载范围 | **局部挂载到 `/blog` 子树** | loader 调用仍放 `lib/fonts.ts`（保持"字体集中管理"），但**不**把 `notoSerifSC.variable` 加进 `fontVariables`（即不挂到 `<html>`）。改为在 `app/blog/layout.tsx` 的包裹元素上单独应用 `notoSerifSC.variable`。这样非博客页面不触发 CJK 下载。因为 `preload:false`，全局/局部的差别其实很小，但局部更干净 |
| 2 | 拉丁字符策略 | **博客正文统一用宋体**（让 Noto Serif SC 自己渲染中英文） | 正文 90% 中文，夹杂的英文若回退到 Maven Pro(无衬线) 会和宋体(衬线)在同一段里割裂。统一衬线更适合长文阅读。`font-family: var(--font-noto-serif-sc), serif` |
| 3 | Tailwind `@theme` 集成 | **加 `--font-serif` token** | 在 `globals.css` 的 `@theme inline` 加 `--font-serif: var(--font-noto-serif-sc)`，自动生成 `font-serif` utility，博客正文写 `className="font-serif"` 即可，与 `font-sans`/`font-mono` 用法一致 |
| 4 | 字号 / 行高 / 字间距 | **复用现有 `.reader` 排版变量，正文容器统一加大行高** | 现有 `globals.css` 的 `.reader` 已有 `line-height:1.8` / `max-width:65ch`。博客正文容器（不分主题）也应有舒适行高（建议 1.75–1.8）。具体数值开发时对照视觉微调 |
| 5 | reader 主题是否用宋体 | **是** | reader 模式语义就是"沉浸阅读"，配衬线宋体吻合。实现上：reader 主题下博客正文同样走 `font-serif`（其实只要正文统一用 serif，三个主题都一致用宋体，reader 只是额外调背景色和行距） |
| 6 | fallback 字体链 | **暂不手动配，依赖 next/font 的 `adjustFontFallback`** | 核实确认 next/font 对 notoSerifSC 有 capsize 字体度量（`adjustFontFallback` 默认开），会自动合成一个度量匹配的 Latin-serif 回退来减少 CLS。但注意：CJK 字形在 `display:swap` 下仍会有一瞬"回退衬线 → 宋体"的闪烁，这是无法完全消除的，可接受 |

### 5.1 敲定后的目标配置

`lib/fonts.ts` 里 `notoSerifSC` 改成：

```ts
export const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  subsets: ["latin"],   // 无害：只控制 preload（已关），无 chinese 子集可选
  weight: "variable",   // ⚠️ 改：可变字体，一个轴覆盖所有字重（原 ["400","700"] 多余）
  display: "swap",
  preload: false,       // 必须：CJK 无法 preload
});
```

关键：**不要**把 `notoSerifSC.variable` 加进 `fontVariables`。`fontVariables` 保持只含 Maven Pro + Geist Mono（挂 `<html>`）。`notoSerifSC.variable` 只在 `app/blog/layout.tsx` 单独 apply。

> ⚠️ **可变字重写法待开发时实测确认**：研究指出 next/font 对可变字体省略 `weight` 时会默认 `"variable"`，且 `"variable"` 不能和具体字重并列。`weight: "variable"` 是推荐写法，但落地时若 build 报错，按 next/font 当前文档调整（可能是直接省略 `weight`）。

---

## 6. 备选方案（如果方案 A 性能不够）

当前选择是 **方案 A**（`next/font/google` 全字体）。如果未来内容增多、首屏 LCP 变差，可以升级到：

- **方案 B**：`next/font/local` + 自己用 [cn-font-split](https://github.com/KonghaYao/cn-font-split) 做精细 unicode-range 分包，按需下载，首屏可压到 100–200KB
- **方案 C**：自托管字体文件 + Cloudflare/Vercel CDN

方案 B 的成本是工具链维护，方案 C 是基础设施。**不要现在做**，等 MVP 上线后基于真实指标决定。

---

## 7. 与其他文档的关系

- **`content-architecture.md` §1 内容类型**：博客正文（`post` 类型）的渲染管线会用到本文档的字体决策
- **`CLAUDE.md` 设计规范**：主字体写的是 Maven Pro，本文档补充了博客正文场景的差异化字体

---

## 8. 实施 Checklist（待开发博客时执行，决策已敲定）

按顺序执行（决策见 §5，不再需要边做边定）：

- [ ] `lib/fonts.ts`：`notoSerifSC` 的 `weight` 从 `["400","700"]` 改为 `"variable"`（见 §5.1 目标配置）
- [ ] `lib/fonts.ts`：**确认** `fontVariables` 仍**不含** `notoSerifSC.variable`（保持只挂 Maven Pro + Geist Mono）
- [ ] 新建 `app/blog/layout.tsx`：把 `notoSerifSC.variable` 应用到包裹博客内容的元素上（局部挂载）
- [ ] `app/globals.css` 的 `@theme inline` 加 `--font-serif: var(--font-noto-serif-sc)`
- [ ] 博客正文容器应用 `font-serif`（统一中英文都走宋体，三主题一致）
- [ ] 博客正文容器设置舒适行高（建议 1.75–1.8，对照视觉微调）
- [ ] 浏览器实测：中文渲染正常、首屏只下载用到的字形切片、`swap` 闪烁可接受、三主题切换下正文都是宋体
- [ ] 更新 `LOG.md` 记录本次字体落地

> 落地时如果 `weight: "variable"` 触发 build 报错，按 next/font 当前文档调整（见 §5.1 脚注）。
