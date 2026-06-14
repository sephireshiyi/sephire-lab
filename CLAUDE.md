# Sephire Lab

> 本文件是项目级 CLAUDE.md，会自动加载到每个 Claude 会话上下文。
> 内容仅包含**跨 role 的项目契约**——任何角色都必须遵守。
> Role 专属工作流见下方表格，按需 lazy 加载。

---

## 项目定位

Sephire Lab（部署在 sephire.xyz）是个人实验型站点，承载写作、摄影、音乐介绍、在线小工具与技术实验记录。同时承担两个目标：

1. 长期可用、可展示的个人站
2. 大学生学习全栈开发的载体

## 开发者背景

有 React / Vue / Django 接触经验，但首次从零做完整全栈项目。沟通时多解释 why，避免压缩到只剩结论。

---

## MVP 范围

**第一版要做：**

- 首页 `/`、`/blog` + `/blog/[slug]`、`/music`、`/tools` + `/tools/model-checker`、`/about`
- 三主题切换（light / dark / reader）
- MDX 文章系统
- 部署到 Vercel + 绑定 sephire.xyz

**第一版暂不做：**

用户系统、评论、数据库、后台、在线编辑器、复杂权限、访问统计、独立后端、项目展示页。如果某个功能必须保存数据，先用静态文件或前端状态模拟。

> 后续讨论中可能加入 gallery（摄影集）、archive（时间索引）等——不在 MVP 内，详见 `doc/ai/architecture/content-architecture.md`。

---

## 技术栈（锁定）

- Next.js 16 App Router · React 19 · TypeScript
- Tailwind v4（`@theme` token 模式，spacing 已沉淀 `--spacing-2xs ~ 5xl`）
- MDX · next-themes · Headless UI v2 · Iconify
- 部署：Vercel
- 可后续引入：shadcn/ui、Framer Motion、Recharts
- **不要**引入数据库

新依赖必须在文档（LOG / 决策）里写明引入理由。

---

## 设计参考

设计稿在 `design/` 目录（Figma 导出）：

- `Home - Light.png` / `Home - Dark.png` / `Home - Read.png` — 三主题首页
- `Selection.png` — 设计规范说明

**配色速查：**

| 主题 | 背景 | 文字 |
|---|---|---|
| light | `#F9F9F9` | `#000000` |
| dark | `#1E1E1E` | `#FFFFFF` |
| reader | `#EAE5D4` | `#1E1907` |

**字体**：Maven Pro（UI/正文）+ Geist Mono（代码）+ Noto Serif SC（博客中文正文，状态见 `doc/ai/architecture/decisions/infra-fonts.md`）

**设计原则**：极简黑白、留白多、动效轻、阅读优先。严格对照设计稿，间距/颜色不擅自调整。

---

## 多 Agent 协作约定

项目有三个 Claude role，每个 role 独立 session：

| Role | 职责 | 工作流文档（lazy 加载） |
|---|---|---|
| **架构师** (architect) | 设计、评审、写决策文档 | `doc/ai/architecture/meta/CLAUDE.md` |
| **开发者** (developer) | 实现功能、调试、写代码、维护 LOG | `doc/ai/develop/CLAUDE.md` |
| **审查者** (reviewer) | 代码评审、性能/安全/可访问性审计 | `doc/ai/review/CLAUDE.md` |

### 每次会话开始的约定

**用户**：在 session 第一句话明确身份，例：「我是开发者，要做 …」。

**Claude**：根据声明，主动 read 上表对应的工作流文档（lazy 加载触发），再开始工作。

### Role 输出边界（红线）

- **架构师**：可读全部 / 可写 markdown / **不直接改 `.ts .tsx .css` 等代码**（改动以建议形式给用户）
- **开发者**：可读全部 / 可写代码 / 可写 `doc/ai/develop/`、`LOG.md`、`TODO.md` / **不改 `doc/ai/architecture/`** 下的决策文档
- **审查者**：可读全部 / 仅写 `doc/ai/review/` / **不改代码** / **不改 architecture/**

### 跨 Role 信息流

- 架构师 → 开发者：通过 `doc/ai/architecture/` 文档传递设计与约束
- 开发者 → 架构师：通过 LOG 反馈实际偏差，由架构师审阅后更新决策
- 审查者 → 架构师 + 开发者：系统性问题写到 `doc/ai/review/review-feedback.md`；具体 bug 写到 audit 报告，开发者修

---

## 跨 Role 通用规则

- 不引入数据库、用户系统、评论、后台
- 中文文档、英文代码命名
- 新依赖要在文档里写明理由
- 关键决策必须落到 `doc/ai/architecture/` 文档里，不能只在对话里讲完就丢
- 文件结构：内容放 `content/`、静态资源放 `public/`、设计稿放 `design/`、文档放 `doc/`
- 任何会影响"数据形状"或"URL 形状"的改动，必须先看（或先更新）`doc/ai/architecture/content-architecture.md`
