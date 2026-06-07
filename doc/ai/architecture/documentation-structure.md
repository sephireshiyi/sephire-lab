# 文档结构 — 架构师视角评估

> 评估 `doc/ai/{architecture,develop,review}` 三 agent 分目录决策，并给出每个目录的内容范围建议。
>
> **更新历史**：
> - 2026-05-26：初版，评估当前结构 + 改进建议。
> - 2026-05-26（修订）：澄清 CLAUDE.md 加载机制——子目录 CLAUDE.md 是 lazy 加载而非完全失效；调整建议 A 的描述。

---

## 1. 当前结构

```
doc/
├─ README.md                     # ⚠️ 还是 create-next-app 默认内容，应清理
└─ ai/
   ├─ architecture/              # 架构师 agent 维护
   │  ├─ content-architecture.md
   │  └─ font-decisions.md
   ├─ develop/                   # 开发者 agent 维护
   │  ├─ CLAUDE.md
   │  ├─ AGENTS.md
   │  ├─ LOG.md
   │  └─ TODO.md
   └─ review/                    # 审查 agent 维护
      └─ (空)
```

---

## 2. 整体评价

**👍 这个决策值得肯定**，理由：

1. **职责分离**：架构、开发、审查是三种不同的思考视角，文档分目录能让每个 agent 进入会话时立刻有"自己的领地"，减少信息噪音
2. **避免文档膨胀**：如果所有文档全堆 `doc/` 一级，将来 20+ 文件时会找不到东西
3. **多会话协作的物理标记**：把"哪个 agent 应该读/写什么"变成文件系统约定，比纯口头规则可执行
4. **与 Claude Code 的 subagent 机制天然契合**：如果将来配 `settings.json` 的 subagent，每个 subagent 的 `additionalDirectories` 字段就能直接指向对应目录

**⚠️ 但有三个隐患需要解决**：

### 隐患 1：根目录失去 `CLAUDE.md` → 项目契约不再自动加载

Claude Code 的 CLAUDE.md 加载机制分两种：

| 类型 | 加载时机 | 涉及范围 |
|---|---|---|
| **启动级自动加载** | session 开始时一次性加载 | 项目根 `<cwd>/CLAUDE.md`、用户全局 `~/.claude/CLAUDE.md`、cwd 的所有父目录链 |
| **Lazy（按需）加载** | Claude 读到该目录下任意文件时触发 | **子目录的 CLAUDE.md** |

也就是说，子目录 CLAUDE.md 不是"完全失效"，而是"按需触发"。但搬家后仍然有问题：

- **项目契约本应每个 session 启动就知道**（项目定位、技术栈、MVP 范围）——这是跨 role 的强制信息，不应该等到读文件才加载
- 把 `CLAUDE.md` 搬到 `doc/ai/develop/` 后，新会话开局时**没有项目背景**——只在 Claude 偶然读到 `develop/` 下文件时才补上
- 架构师、审查者 session 如果只读 `architecture/` 或 `review/`，永远也不会触发 `develop/CLAUDE.md` 的 lazy 加载——他们彻底拿不到项目契约

**验证**：本次会话进来时，system reminder 里没有 CLAUDE.md 内容——确认搬家中断了启动级自动加载。

**解法**：根目录必须有一份 CLAUDE.md，**只放跨 role 项目契约**；各 role 专属工作流放各自子目录的 CLAUDE.md，依赖 lazy 加载触发。

### 隐患 2：CLAUDE.md 的内容并不全属于"开发者"

读了一遍 `doc/ai/develop/CLAUDE.md`，里面混了两类内容：

- **跨 agent 的项目契约**（每个 agent 都应该知道）：项目定位、开发者背景、MVP 范围、技术栈、设计稿、设计风格、第一阶段页面结构、主题规范
- **仅与开发者相关**：开发顺序（Milestones）、`pnpm dev` 验证流程、日志记录要求、与 Claude Code 协作方式

把这两类塞在同一个文件里、放在 `develop/` 下，会让架构师和审查 agent 进会话时缺少项目背景，或者要去"开发者目录"翻——破坏了职责分离的初衷。

### 隐患 3：`review/` 目录空着 → 不利于新 agent 上手

第一次进入 review/ 的 agent 没有任何起点文档，会不知道"该按什么标准评审、有哪些已知问题、之前评审过什么"。

---

## 3. 改进建议（架构层面）

### 建议 A：拆 CLAUDE.md，根目录留一份"项目契约"

```
shiyi-lab/
├─ CLAUDE.md                     # 新建：跨 agent 项目契约（定位 + MVP + 技术栈 + 三目录入口指引）
└─ doc/ai/
   ├─ architecture/CLAUDE.md     # 仅架构师工作流（评审视角、不直接改代码、文档输出规范）
   ├─ develop/CLAUDE.md          # 仅开发者工作流（Milestones、pnpm dev 流程、LOG 维护规则）
   └─ review/CLAUDE.md           # 仅审查工作流（评审 checklist、严重度分级）
```

根 CLAUDE.md 的内容大致：

- 项目定位（5 行）
- MVP 范围（10 行）
- 技术栈（5 行）
- 设计稿参考路径
- **入口指引**：「架构相关任务：见 doc/ai/architecture/CLAUDE.md；开发任务：见 develop/CLAUDE.md；审查任务：见 review/CLAUDE.md」
- 简短约定：「每次新会话开始时，先声明 role 并读 doc/ai/<your-role>/CLAUDE.md」

这样所有 agent 都能拿到项目背景；role-specific 内容通过 Claude 主动 read 触发 lazy 加载，不污染其他 role 的上下文。

> **加载机制澄清**：根 CLAUDE.md 启动级加载（确保跨 role 共享），子目录 CLAUDE.md 是 lazy 加载（Claude 读到该目录文件时触发）。所以约定"每个 session 开始时声明 role + read 对应目录的 CLAUDE.md"是关键——它显式触发 lazy 加载。

### 建议 B：用 `settings.json` 配 subagent

如果想把"三个角色"沉淀成 Claude Code 的固定能力，可以在 `.claude/settings.json` 里配三个 subagent：

```jsonc
{
  "subagents": {
    "architect": {
      "description": "Design decisions, review existing code, no direct edits",
      "additionalDirectories": ["doc/ai/architecture/"]
    },
    "developer": {
      "description": "Implement features, write code, maintain LOG.md",
      "additionalDirectories": ["doc/ai/develop/"]
    },
    "reviewer": {
      "description": "Code review, security, performance audits",
      "additionalDirectories": ["doc/ai/review/"]
    }
  }
}
```

这样在主会话里可以 `Use the architect subagent to ...`，subagent 自动加载对应目录。**但 MVP 阶段不急做**，先用文件系统约定即可。

### 建议 C：每个目录加 `README.md` 作为"门面"

```
doc/ai/architecture/
├─ README.md                     # 目录用途 + 文档清单 + 维护约定
├─ content-architecture.md
└─ font-decisions.md
```

README.md 解决"新 agent 进来不知道这里有什么"的问题。一页内容就够。

### 建议 D：替换 `doc/README.md` 的默认内容

当前 `doc/README.md` 还是 create-next-app 的"Getting Started"模板，跟项目无关。建议替换成 `doc/` 整体的导航页（列出 ai/ 三个子目录的用途）。

---

## 4. 每个目录该放什么 — 内容分类建议

### `doc/ai/architecture/` — 决策与设计

**核心目的**：**沉淀"为什么"**。代码会告诉你"是什么"，但当时为什么选这条路、考虑了哪些备选、在哪里做了权衡——这些只能用文档保留。

| 子类 | 例子 | 何时新增 |
|---|---|---|
| **领域 / 数据架构** | `content-architecture.md`、未来的 `tools-architecture.md` | 涉及跨模块的数据流、URL、目录结构 |
| **技术选型与字体/样式决策** | `font-decisions.md`、未来的 `mdx-pipeline.md`、`theme-system.md` | 引入新依赖、新设计语言 |
| **ADR（Architecture Decision Record）** | `adr/001-mdx-vs-mdx-remote.md`、`adr/002-spacing-system.md` | 任何关键决策，尤其是有多个备选的 |
| **未决问题清单** | 跨文档统一的 `open-questions.md`（可选） | 防止散落到各个文档里 |
| **图示 / 流程图** | `diagrams/data-flow.mmd`（mermaid） | 复杂关系无法用文字说清时 |

> 📌 关键原则：**架构文档面向"未来的自己"和"接手项目的人"**，不是面向当前任务。每一篇都应该回答"为什么是这样而不是别样"。

### `doc/ai/develop/` — 执行与状态

**核心目的**：**支持"日常推进"**。当前要做什么、做到哪儿了、怎么做、遇到什么。

| 子类 | 例子 | 维护频率 |
|---|---|---|
| **工作流约定** | `CLAUDE.md`（仅开发者工作流部分） | 较少改 |
| **任务清单** | `TODO.md`（已有） | 每完成一项更新 |
| **开发日志** | `LOG.md`（已有） | 每完成一轮工作追加 |
| **依赖说明** | `dependencies.md`（如有）解释每个 dep 为什么引入 | 引入新 dep 时 |
| **开发陷阱集** | `pitfalls.md`（如有）记录踩过的坑（不属于代码注释的） | 偶尔 |
| **设计稿与现状对照** | 一份记录"哪些已对照 Figma 实现、哪些有出入" | 较少 |

> 📌 关键原则：**执行文档是高频更新、可丢弃的**，跟"当前 sprint"绑死。LOG.md 是例外（只追加不删）。

### `doc/ai/review/` — 标准与发现

**核心目的**：**保证"质量底线"**。评审 agent 用什么标准、找过什么问题、有什么待修。

| 子类 | 例子 | 何时新增 |
|---|---|---|
| **评审 Checklist** | `review-checklist.md`（无障碍 / 性能 / 安全 / 一致性 / 命名） | 一次性建立，偶尔补充 |
| **代码质量标准** | `code-standards.md`（命名约定、错误处理、注释规则） | 团队增加时 |
| **历次评审报告** | `audits/2026-06-01-mvp-pre-launch.md` | 每次大评审一份 |
| **已知问题清单** | `known-issues.md`（暂不修但要记录的）  | 评审中发现"先记下不修"的 |
| **性能 / Lighthouse 基线** | `perf-baseline.md` | 部署后建立基线 |
| **安全审计笔记** | `security-notes.md` | XSS / API 密钥 / CSP 等检查 |

> 📌 关键原则：**评审是面向"是否达标"的判断**。每篇文档都要明确"标准来自哪里"（如 a11y 来自 WCAG、性能来自 Core Web Vitals）。

---

## 5. 跨 agent 引用关系

三个目录不是孤岛——决策会影响开发、开发完了被审查、审查发现问题反馈回架构。建议确立**引用规则**：

- **架构 → 开发**：架构文档定下数据 schema 后，开发者按 schema 实现。schema 改动要先回写架构文档，再改代码
- **开发 → 架构**：实现过程中发现架构文档与现实不符（比如某个字段没考虑到），开发者**不直接改架构文档**（保持架构师身份的输出权），而是在 LOG.md 或单独的反馈文档里记下，由架构师审阅后合并
- **审查 → 架构 + 开发**：审查发现的"系统性问题"反馈给架构师改架构文档；"具体 bug"反馈给开发者改代码与 LOG

简单来说：**每个 agent 写自己目录、读其他目录**。这套规则一旦确立，三个会话能用文件系统协作，不容易乱。

---

## 6. 推荐立即做的小事

按重要性排：

1. **根目录建一个新 `CLAUDE.md`**（按 §3 建议 A 拆分），恢复自动加载机制
2. **替换 `doc/README.md`** 为整个 `doc/` 的导航页（按 §3 建议 D）
3. **每个 ai/<role>/ 下加 README.md**（按 §3 建议 C）
4. **`develop/CLAUDE.md` 瘦身**，把跨 agent 内容上移到根 CLAUDE.md
5. **`review/` 加一份初始 `review-checklist.md`**，作为审查 agent 的起点

这五项可以一次性做完，估计 1–2 小时。不需要写代码，全是 markdown 维护。

---

## 7. 长期演化

随着项目推进，可能会出现这些需求：

- **跨 agent 共享文档**：如 `glossary.md`（术语表）适合放在 `doc/ai/` 根目录而非任一子目录
- **设计稿对照**：`design/` 目录与 `doc/ai/` 的关系可能要梳理（设计稿是输入，文档是输出？）
- **`doc/users/`**：如果未来要写面向访客的帮助文档（如 model-checker 怎么用），可以并列开一个 `doc/users/`

但**不要现在过早设计这些**。先把 `doc/ai/` 的三目录跑顺，等真正需要再扩。
