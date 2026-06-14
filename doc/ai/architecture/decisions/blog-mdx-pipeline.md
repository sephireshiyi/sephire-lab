# MDX 渲染管线决策

> 记录 Sephire Lab 博客 MDX 技术栈选型：编译方式、frontmatter 解析与校验、渲染路径、代码高亮、插件管线。
>
> **状态**：✅ **已确认**（2026-06-06 用户拍板：frontmatter 上 zod 校验；首个开发切片走 tracer bullet 先贯通一篇）。配合 `../content-architecture.md`（数据模型）与 `infra-fonts.md`（正文字体）一起构成博客 Milestone 3 的完整设计输入。实施计划见 §11。
>
> **更新历史**：
> - 2026-06-06：初版。基于研究工作流（5 维度并行核查 + 对抗式验证）产出推荐栈。
> - 2026-06-06：用户确认 zod + tracer-bullet 切片，状态转"已确认"，新增 §11 首切片实施计划。
> - 2026-06-07：据 developer 切片 A 实施反馈补正——§6/§7 补 `remark-frontmatter`（@next/mdx 不自动剥离 frontmatter），§7 补 `shiki`（rehype-pretty-code 的 peerDependency，需显式装）。
> - 2026-06-13：据 reviewer RF-1 正式采纳"`.mdx-body` 集中 CSS + mdx-components 最小化"为官方排版范式，更新 §6 措辞。
>
> **可信度说明**：本文档结论分两档——
> - 🟢 **已核实**：对照 `node_modules/next@16.2.5` 自带的离线官方文档、next/font loader 源码、或 GitHub 实时仓库验证过。对锁定版本而言是权威来源。
> - 🟡 **待 pin 时复核**：研究的验证阶段遇到工具临时故障，部分"npm 最新版本号"未能在线确认。架构性结论不受影响，但**装包前**应按 §8 跑一次 `npm view` 确认版本。

---

## 0. 一句话推荐栈

> `@next/mdx`（官方编译）+ `gray-matter`（读 frontmatter 建列表）+ `zod`（build 时校验 frontmatter）+ 动态 import 渲染详情页 + `rehype-pretty-code`/Shiki（代码高亮，多主题）+ `remark-gfm` + 标题锚点插件。**不引入任何内容框架**（Contentlayer 已死、Velite 对 MVP 过重）。

---

## 1. 决策总表

| # | 决策点 | 选定 | 备选（未选） | 可信度 |
|---|---|---|---|---|
| 1 | MDX 编译 | **`@next/mdx`**（官方，build 时编译为 React 组件，RSC 原生） | `next-mdx-remote-client` / 裸 `@mdx-js/mdx` | 🟢 |
| 2 | frontmatter 解析 | **`gray-matter` + YAML frontmatter** | `export const metadata` JS 导出 / remark-frontmatter | 🟢 |
| 3 | frontmatter 校验 | **`zod`**（build 时 `safeParse`，报错带文件名，`z.infer` 派生类型） | 纯 TS interface（无运行时校验） | 🟡 |
| 4 | 详情页渲染 | **动态 `import()` `.mdx` + `generateStaticParams` + `dynamicParams=false`** | 读字符串再 compile | 🟢 |
| 5 | 列表页 | **`fs` 扫 `content/posts/` + `gray-matter` 只读 frontmatter**（不编译正文） | 编译每篇取 metadata | 🟢 |
| 6 | 代码高亮 | **`rehype-pretty-code`**（Shiki 内核，多主题 CSS 变量） | 裸 Shiki / rehype-highlight / Prism | 🟢 机制，🟡 版本 |
| 7 | Markdown 扩展 | **`remark-gfm`**（表格/删除线/任务列表/自动链接） | 不加 | 🟢 |
| 8 | 标题锚点 | **`rehype-slug` + `rehype-autolink-headings`** | 不加 / 自写 | 🟡 版本 |
| 9 | 内容框架 | **不用** | Contentlayer（已死）/ contentlayer2（停滞）/ Velite（过重） | 🟢 |
| 10 | 图片 | **MVP 先用原生 `<img>`，后续在 `mdx-components.tsx` 替换为 `next/image`** | 一开始就 next/image | 🟢 |

---

## 2. 为什么是 `@next/mdx`（决策 1）

研究核查的关键事实（🟢 对照离线 + 实时官方文档）：

- `@next/mdx` 是 **Next.js 官方插件**，跟 Next 同步维护——锁定 Next 16.2.5 不会有"第三方包跟不上"的风险。这是 2026 年最重要的区分点。
- **build 时编译**：`.mdx` 文件编译成一个 React 组件，在 **Server Component 里渲染，不需要 `"use client"`**，静态内容零客户端 JS。
- **最低 magic**：一个 `.mdx` 文件直接 `import` 进来就是组件，没有"字符串序列化 → 再 hydrate"那一层，对学习者最容易理解。

**淘汰的备选：**

| 备选 | 淘汰理由 |
|---|---|
| `next-mdx-remote`（hashicorp 原版） | 🟡 研究称其 2026-04 已 archive（此条未能在线复核），但**无论死活都不该用**——它是为"从字符串/远程源加载 MDX"设计的，我们的文章是磁盘上的本地文件，用不上它的运行时编译 |
| `next-mdx-remote-client`（活跃 fork） | 是好包、确实支持 Next 16 + RSC，但同样针对"字符串源"。本地文件场景下比 `@next/mdx` 多一层 plumbing。⚠️ 研究还**纠正**了一个误传：它**并未**被 Next.js 官方文档推荐（官方文档只在 `serverExternalPackages` 里提到原版 next-mdx-remote） |
| 裸 `@mdx-js/mdx` | 最透明但要自己手搓 runtime、frontmatter 剥离、组件 scope、缓存语义——对新手 magic 最多、最易错 |

---

## 3. frontmatter：为什么用 YAML + gray-matter 而不是官方的 `export const metadata`（决策 2）

这是个**值得展开的取舍**。研究发现一个反直觉的点：

> Next.js 16 官方文档其实更倾向用 MDX 里的 `export const metadata = {...}`（JS 导出）来存文章元信息，而不是 YAML frontmatter。`@next/mdx` **原生不解析 frontmatter**。

那为什么我仍然推荐 YAML frontmatter + gray-matter？**两个架构理由：**

1. **列表页需要"只读元信息、不编译正文"**。`content-architecture.md` §6.3 已经定下：列表页扫几十上百篇文章，只读 title/date/tags，**不应该编译每篇的 MDX 正文**（慢）。`gray-matter` 正好只切 YAML 头部、不碰正文。而 `export const metadata` 方案要拿到元信息就得 `import` 整个模块（= 编译正文），列表页就被迫全量编译，违背设计。
2. **可移植性**。YAML frontmatter 是 Markdown 世界的通用约定，哪天换静态站生成器、或用别的工具处理文章，frontmatter 都通用；`export const metadata` 是 MDX/JS 专有的。

代价：要自己装 `gray-matter`（官方文档把它列为三个"such as"选项之一，不是钦定，但确实是 doc 列出的合法选项）。值得。

**分工**（这是关键设计）：
- **列表页**：`fs.readdir(content/posts)` → 每个文件 `gray-matter()` 只取 frontmatter → 排序/筛选。**不编译正文**。
- **详情页**：动态 `import()` 那一篇 `.mdx`（`@next/mdx` 编译正文为组件）+ 单独用 gray-matter/或导入拿到 frontmatter 渲染标题区。

---

## 4. frontmatter 校验：gray-matter + zod（决策 3）

🟡 版本待复核，但**架构推荐明确**。

**问题**：纯 TS interface 是"编译期的谎言"——`data as Post` 这个断言 TS 从没真正检查过运行时数据。一篇文章漏写 `date`、`category` 拼错、`tags` 写成逗号字符串而不是 YAML 列表，**编译照过**，只在浏览器里以"莫名其妙的崩溃"暴露（比如对 string 调 `.map`），且离出错的源文件很远。

**方案**：`gray-matter` 解析 + `zod` 校验：

```ts
// lib/content.ts 里集中一个 ~15 行的 helper
const PostSchema = z.object({
  type: z.literal("post"),
  title: z.string(),
  date: z.iso.date(),               // 校验是合法 ISO 日期
  category: z.enum(["tech", "thoughts", "music", "photo"]),
  tags: z.array(z.string()).optional(),
  summary: z.string().optional(),
  cover: z.string().optional(),
});
type Post = z.infer<typeof PostSchema>;   // 类型从 schema 派生，单一事实源

function parsePost(filePath: string): Post {
  const { data } = matter(readFileSync(filePath, "utf8"));
  const result = PostSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Invalid frontmatter in ${filePath}:\n${/* 格式化 result.error.issues */}`);
  }
  return result.data;
}
```

**为什么对一个学习项目值得加这个依赖：**

- **单一事实源**：schema 定义一次，`z.infer` 派生类型。类型和运行时校验**永远不会漂移**。
- **build 时报错带文件名**：所有 `.mdx` 在 `next build` 时读一次，哪篇 frontmatter 写错 → 构建直接失败并指名道姓，**部署前**就拦住。
- **教学价值高**：这正是 "parse, don't validate" 和"编译期 vs 运行时边界"的最佳入门案例——这套模式以后写 API 入参校验、env 校验、表单校验都复用。是真正的全栈基础功。
- build-only，**不进客户端 bundle**。

⚠️ **两个落地注意**（🟡）：
1. zod 当前主版本是 4.x（研究称，但未在线复核）。zod 4 的 `error` 定制 API、`z.iso.date()` 等 helper 与 zod 3 的老教程不同——**按 zod 当前官方文档写，别抄老教程**。装之前先 `npm view zod version` 确认。
2. 让 zod schema 成为**唯一**事实源，删掉 `content-architecture.md` 里手写的 `BaseContent` interface（或改成由 schema 派生），否则两份定义会漂移。

> 如果你觉得 zod 对 MVP 偏重，**纯 TS interface + 几行手写 guard** 也能跑（这是唯一一个我会接受"降级"的决策点）。但我推荐上 zod——理由是学习价值，不是技术必需。

---

## 5. 代码高亮：rehype-pretty-code（决策 6）

🟢 机制已核实，🟡 版本待复核。

**选它的理由：**
- **build 时高亮**：Shiki 在 build 时把代码 tokenize 成带 inline 样式的静态 HTML，**客户端零高亮 JS**。
- **Shiki 质量**：用 VSCode 的 TextMate 语法 + 主题，着色和编辑器一致，几百种语言。
- **天然多主题**：传 `theme: { light, dark, reader }` 会输出 per-token 的 CSS 变量（`--shiki-light` / `--shiki-dark` / 命名变体），**同一份静态 HTML 靠 CSS 切换配色，不用重新 build**——完美契合我们的三主题。
- Next.js 16 官方 MDX 文档把它列为代码高亮选项之一。

⚠️ **三个落地注意：**

1. **Turbopack 序列化约束（Next 16 默认 Turbopack）🟢**：插件必须用**字符串名 + 可序列化选项**传，不能传 JS 函数选项。好消息：`theme: { light:'github-light', dark:'github-dark', reader:'...' }` 是纯 JSON，**可序列化，能用**。但如果以后想加自定义 transformer（函数），那不可序列化，要么走 webpack 模式，要么放弃。
2. **三主题的激活 CSS 要自己写一点 🟡**：Shiki 输出 CSS 变量，但你仍需为每个主题写一小段选择器把变量映射上去（如 `.reader code span { color: var(--shiki-reader); }`）。研究纠正了"纯 CSS 零样式"的过度简化说法——是"不用手写每个 token 的颜色"，但"每主题一个选择器块"还是要的。
3. `keepBackground: false`：让 Shiki 不要硬塞背景色，改由我们的 Tailwind `@theme` token 驱动代码块背景。
4. 若 rehype 插件不生效，关掉实验性的 `mdxRs`（Rust MDX 编译器，文档标注实验性、可能绕过 JS rehype 插件）。

**淘汰备选**：rehype-highlight（highlight.js，class 式，三主题要手写三套样式表，且保真度低于 Shiki）；Prism / prism-react-renderer（客户端高亮，违背零客户端 JS 目标，维护状态存疑）。

---

## 6. 完整插件管线 + 配置骨架

```
content/posts/*.mdx
   │
   ├─ 列表页：fs.readdir + gray-matter（只读 frontmatter）+ zod 校验 → 排序 → 卡片列表
   │
   └─ 详情页：动态 import(.mdx)
          │  remark 阶段：remark-frontmatter → remark-gfm
          │  rehype 阶段：rehype-slug → rehype-autolink-headings → rehype-pretty-code
          ↓
       Server Component 渲染（无 "use client"），font-serif 包裹正文
```

> ⚠️ **`remark-frontmatter` 必须有**（2026-06-07 据 developer 实施反馈补）：`@next/mdx` 默认**不剥离** frontmatter。详情页动态 import 的 `.mdx`，其正文里那段 `---…---` 若不剥离，会被当成 `<hr>` + 文本渲染出来。`remark-frontmatter` 负责在编译时把它从正文里剥掉（gray-matter 只负责"读"出来给列表/标题用，两者职责不同、都需要）。

`next.config.mjs`（🟢 必须 `.mjs` 或 `.ts`——remark/rehype 生态是 ESM-only）：

```js
import createMDX from "@next/mdx";

const withMDX = createMDX({
  options: {
    // ⚠️ Turbopack 下用字符串名 + 可序列化选项
    remarkPlugins: ["remark-frontmatter", "remark-gfm"],
    rehypePlugins: [
      "rehype-slug",
      ["rehype-pretty-code", { theme: { light: "github-light", dark: "github-dark", reader: "..." }, keepBackground: false }],
    ],
  },
});

const nextConfig = {
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

export default withMDX(nextConfig);
```

🟢 **必须有 `mdx-components.tsx`（项目根）**——`@next/mdx` 在 App Router 下没有它会静默失效。导出一个 `useMDXComponents()`（无参数，签名照 Next 16.2.5 文档）。**排版策略**：采用"`.mdx-body` 集中 CSS + mdx-components 最小化"范式——正文排版（标题间距、列表缩进、行高等）集中写在 `app/globals.css` 的 `.mdx-body` 作用域 CSS 里，与既有的 `.reader article` 同体系，三主题统一维护，用后代选择器干净处理"标题里的锚点链接""行内 code vs 代码块 code"等区分。`mdx-components.tsx` 先保持空映射（`{}`），等需要用 React 组件替换某个 HTML 元素时（例如 `<img>` → `next/image`）再来这里加映射。这是经 developer 切片 A 实施验证、reviewer 评审后正式采纳的方案（理由见 `review-feedback.md` RF-1）。

🟢 **Next 16 动态路由 params 是 Promise**：`async function Page({ params }: { params: Promise<{ slug: string }> })`，然后 `const { slug } = await params`。这是相对 Next 13/14 的破坏性变化。

---

## 7. 待装依赖清单

```
@next/mdx @mdx-js/loader @mdx-js/react @types/mdx   # MDX 核心（官方四件套）
gray-matter                                          # frontmatter 解析（读）
zod                                                  # frontmatter 校验
remark-frontmatter                                   # frontmatter 剥离（不剥会被渲染成 <hr>+文本）
remark-gfm                                           # GFM 扩展
rehype-pretty-code                                   # 代码高亮（Shiki 包装层）
shiki                                                # rehype-pretty-code 的 peerDependency，需显式装
rehype-slug rehype-autolink-headings                 # 标题锚点（可延后）
```

> ⚠️ 两条 2026-06-07 据 developer 实施反馈补正：
> - `remark-frontmatter`：原清单漏了。gray-matter 负责"读"frontmatter，remark-frontmatter 负责从正文"剥离"，两者职责不同、都要装。
> - `shiki`：它是 `rehype-pretty-code` 的 **peerDependency**，不是自动带的，必须显式安装（developer 实测装了 `shiki@4.2.0`）。

---

## 8. 装包前的版本核查（🟡 必做，verify 阶段遗留）

研究的验证阶段遇到工具临时故障，下列版本号未能在线确认。**开发者落地前**按"先查文档再答"的项目规则跑一遍：

```bash
npm view zod version                  # 确认是否 zod 4.x，error API 按当前文档
npm view gray-matter version
npm view rehype-pretty-code version   # 确认它 peer 依赖的 shiki 版本与你装的兼容
npm view shiki version
npm view @next/mdx version            # 应与 next 16.2.5 对齐
npm view next-mdx-remote-client version  # 仅当最终决定改用它时才需要
```

各依赖的**引入理由**已在本文档写明（满足 CLAUDE.md"新依赖要在文档里写明理由"的要求），开发者装包时在 LOG.md 引用本文档即可。

---

## 9. 与其他文档的关系

- **`content-architecture.md`**：本文档实现的是它定义的 `Post` 数据模型与 §6 渲染管线函数签名。⚠️ 决策 3 若上 zod，需把 `content-architecture.md` 的 `BaseContent` interface 改为"由 zod schema 派生"，避免双份定义漂移。
- **`infra-fonts.md`**：详情页正文容器套 `font-serif`（§5 已定），由本管线的 Server Component 渲染。
- **`CLAUDE.md`**：新依赖理由集中在本文档 §2/§4/§5，满足项目契约。

---

## 10. 未决 / 延后

| # | 问题 | 触发时机 |
|---|---|---|
| 1 | reader 主题给 Shiki 配哪个具体主题名 | 写代码高亮样式时，对照设计稿 |
| 2 | 标题锚点的视觉样式（hover 显示 # / 常驻） | 详情页排版时 |
| 3 | 目录（TOC）功能：是否加 `rehype-toc` 或自己从 headings 提取 | MVP 后，文章变长时 |
| 4 | 图片 `<img>` → `next/image`：MVP 用原生，后续在 mdx-components 替换 | 性能优化阶段；需先定图片放 public/ 还是文章同目录 |
| 5 | 阅读时间估算 | MVP 后 |
| 6 | 草稿（draft）字段：frontmatter 加 `draft: true` 在生产构建过滤 | 第一次需要存草稿时 |

---

## 11. 实施计划：首个切片（tracer bullet，交接给 developer）

> 用户已确认：第一个开发 session **先贯通一篇**，不要一次做完整个 Milestone 3。目标是"单篇文章端到端跑通",验证管线无误后，再做列表页/筛选/样式。
>
> developer 开 session 后：读根 `CLAUDE.md` + `doc/ai/develop/CLAUDE.md` + 本文档 + `doc/ai/architecture/content-architecture.md` + `doc/ai/architecture/decisions/infra-fonts.md`，然后把下面的切片转成 `TODO.md` 的 task 条目再动手。

### 切片 A：单篇文章端到端（第一个 session 的目标）

**做完的标准**：本地 `pnpm dev` 访问 `/blog/<示例slug>`，能看到一篇带格式、代码高亮、宋体正文、三主题正常的文章。

按顺序：

1. **装依赖**（先按 §8 跑 `npm view` 核对版本，再装）：
   `@next/mdx @mdx-js/loader @mdx-js/react @types/mdx gray-matter zod remark-gfm rehype-pretty-code rehype-slug rehype-autolink-headings`
   — 在 `LOG.md` 记录每个依赖的用途（理由引用本文档即可）
2. **配置 MDX**：`next.config.ts`（或 `.mjs`）用 `createMDX` 包裹，加 `pageExtensions`，remark/rehype 插件按 §6 骨架（⚠️ Turbopack 用字符串名 + 可序列化选项）
3. **建 `mdx-components.tsx`**（项目根，必须）：先最小实现，给 `pre`/`code`/`h2` 等挂基础 Tailwind 类
4. **写 1 篇示例文章**：`content/posts/hello-world.mdx`，frontmatter 用全字段（title/date/category/tags/summary），正文要**覆盖各种元素**当金丝雀：标题、加粗、行内代码、一个 ```js 代码块、引用、列表、一个链接。中英文混排各来一点（测宋体）
5. **写 `lib/content.ts` 的 zod schema + `parsePost` helper**（按 §4），先只实现"读单篇 + 校验"
6. **建 `app/blog/[slug]/page.tsx`**：
   - `generateStaticParams` 扫 `content/posts/` 列出 slug；`dynamicParams = false`
   - 动态 `import()` 那篇 `.mdx` 渲染正文；`params` 记得 `await`（Next 16）
   - 顶部用 zod 校验过的 frontmatter 渲染标题 + 日期
7. **建 `app/blog/layout.tsx`**：挂 `notoSerifSC.variable`（字体局部挂载，见 font-decisions §5.1）；正文容器用 `font-serif`
8. **`app/globals.css`**：`@theme inline` 加 `--font-serif`；给代码块三主题写 Shiki CSS 变量映射（见 §5）
9. **改 `lib/fonts.ts`**：`notoSerifSC` 的 `weight` 改 `"variable"`；确认 `fontVariables` 不含它
10. **验证**：`pnpm dev` 看 `/blog/hello-world`，三主题切一遍；故意把示例文章 `date` 删掉，确认 `pnpm build` 报错并指名文件（验证 zod 生效）
11. **更新 LOG.md**

### 切片 B、C（后续 session，先不做）

- **B：列表页** `app/blog/page.tsx` —— `fs` 扫目录 + gray-matter 只读 frontmatter（不编译正文）+ zod 校验 + 按日期排序 → 卡片列表；首页"最近文章"复用
- **C：筛选 + 样式打磨** —— category/tag 筛选（MVP 用 query 参数）、标题锚点视觉、阅读排版微调、`next/image` 替换 `<img>`

### developer 容易踩的坑（已知，提前预警）

- `next.config` 必须 `.ts`/`.mjs`（ESM），不能 `.js`
- 没有根 `mdx-components.tsx` → MDX 在 App Router 静默失效
- Turbopack 下插件传函数选项会失败 → 只传字符串名 + JSON 选项
- `params` 是 Promise，忘记 `await` 会拿到 undefined slug
- zod 4 的 `safeParse` 错误格式化 API 与 zod 3 老教程不同 → 按当前官方文档写
