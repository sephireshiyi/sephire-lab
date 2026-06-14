# Architecture Documentation Index

> Sephire Lab 架构文档总索引。
>
> 本目录结构于 2026-06-13 重构，按文档性质分层存放。

---

## 目录结构

```
doc/ai/architecture/
├── meta/                   # 元文档（工作流）
├── decisions/              # 技术框架决策（按前缀分类）
├── handoffs/               # 临时交接文档
├── archive/                # 已完成决策 / 通用框架
└── content-architecture.md # 长期架构设计（根目录）
```

---

## 文档清单

### 元文档（meta/）

| 文档 | 内容 |
|---|---|
| `CLAUDE.md` | 架构师工作流、输出边界、命名约定 |
| `documentation-structure.md` | 文档体系整体设计、跨 role 引用规则 |

### 长期架构

| 文档 | 内容 | 状态 |
|---|---|---|
| `content-architecture.md` | 三类内容数据模型（post / photo / album） | ⏸️ 活文档 |

### 技术框架决策（decisions/）

#### 博客相关（blog-*）

| 文档 | 内容 | 状态 |
|---|---|---|
| `blog-mdx-pipeline.md` | MDX 编译、代码高亮、插件管线 | ✅ 已确认，切片 A/B 已实施 |
| `blog-reader-theme.md` | Reader 主题配色原则 | ✅ 已确认，待实施 KI-3 |

#### 功能设计

| 文档 | 内容 | 状态 |
|---|---|---|
| `homepage-design.md` | 首页布局（Hero + Recent Writing） | ✅ 已确认，待实施 |
| `tools-model-checker.md` | Model Checker 工具完整设计 | ✅ 已确认，待实施 |

#### 基础设施（infra-*）

| 文档 | 内容 | 状态 |
|---|---|---|
| `infra-deployment.md` | Vercel 部署流程、检查清单 | ✅ 已确认，待实施 |
| `infra-fonts.md` | 字体加载方案、思源宋体 | ⏸️ 部分待定 |

### 临时交接（handoffs/）

| 文档 | 内容 | 状态 |
|---|---|---|
| `2026-06-13-path-a.md` | 路径 A 完整设计（首页 + Model Checker + 部署） | ⏸️ 待实施 |

### 已归档（archive/）

| 文档 | 归档原因 |
|---|---|
| `markdown-rendering-tradeoffs.md` | 通用框架讨论，项目已选定 @next/mdx |

---

## 使用指南

### Developer 查找决策

**场景 1：开发博客功能**
- 先读 `content-architecture.md`（数据模型）
- 再读 `decisions/blog-mdx-pipeline.md`（技术栈）
- 如涉及 reader 主题，读 `decisions/blog-reader-theme.md`

**场景 2：开发首页**
- 读 `decisions/homepage-design.md`（布局结构）
- 读 `content-architecture.md` §6（`getAllPosts` 函数）

**场景 3：开发 Model Checker**
- 读 `decisions/tools-model-checker.md`（前后端设计）

**场景 4：准备部署**
- 读 `decisions/infra-deployment.md`（Vercel 流程）

### Reviewer 查找标准

**正确性审查**：
- 数据模型：`content-architecture.md`
- 技术栈：`decisions/blog-mdx-pipeline.md`
- 主题配色：`decisions/blog-reader-theme.md`

**性能审查**：
- `decisions/blog-mdx-pipeline.md` §6.3（列表页不编译正文）
- `decisions/infra-deployment.md` §5.2（Lighthouse 标准）

### Architect 工作流

**新决策**：写到 `decisions/`，按前缀命名（blog- / tools- / infra-）

**更新已有决策**：直接编辑对应文件，更新"更新历史"

**交接文档**：会话结束时写到 `handoffs/YYYY-MM-DD-<topic>.md`

**归档决策**：满足条件后移到 `archive/`，更新 `archive/README.md`

---

## 维护规则

### 新增文档命名

| 类型 | 命名规则 | 位置 |
|---|---|---|
| 博客相关 | `blog-<topic>.md` | `decisions/` |
| 工具相关 | `tools-<name>.md` | `decisions/` |
| 基础设施 | `infra-<topic>.md` | `decisions/` |
| 功能设计 | `<feature>-design.md` | `decisions/` |
| 交接文档 | `YYYY-MM-DD-<topic>.md` | `handoffs/` |

### 归档触发条件

满足以下全部条件：
1. 决策状态 = ✅ 已确认
2. 实施完成（developer LOG 有记录）
3. 部署后验证通过（reviewer audit 或 Lighthouse）
4. 3 个月内无更新

### 清理策略

**handoffs/**：实施完成后可删除（内容已落到决策文档）

**archive/**：永久保留，不删除

---

## 快速链接

- **架构师工作流**：[meta/CLAUDE.md](meta/CLAUDE.md)
- **内容数据模型**：[content-architecture.md](content-architecture.md)
- **博客技术栈**：[decisions/blog-mdx-pipeline.md](decisions/blog-mdx-pipeline.md)
- **首页设计**：[decisions/homepage-design.md](decisions/homepage-design.md)
- **Model Checker**：[decisions/tools-model-checker.md](decisions/tools-model-checker.md)
- **部署流程**：[decisions/infra-deployment.md](decisions/infra-deployment.md)
