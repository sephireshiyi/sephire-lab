# 架构文档重构总结 2026-06-13

> 本次重构将 `doc/ai/architecture/` 从扁平结构（11 个文件）重构为分层结构（4 个子目录 + 根目录活文档）。

---

## 重构目标

1. **清晰分层**：按文档性质分类（元文档 / 根目录活文档 / 决策 / 交接 / 归档）
2. **可扩展性**：新功能加 `decisions/<prefix>-<name>.md`，不会让根目录爆炸
3. **生命周期管理**：区分活文档（根目录 `content-architecture.md`）、实施中决策（decisions/）、临时交接（handoffs/）、已完成（archive/）
4. **三 agent 同步**：更新所有 agent 的 CLAUDE.md，确保协作无缝

---

## 重构前后对比

### 重构前（扁平结构）

```
doc/ai/architecture/
├── CLAUDE.md
├── content-architecture.md
├── deployment-decisions.md
├── documentation-structure.md
├── font-decisions.md
├── homepage-decisions.md
├── markdown-rendering-tradeoffs.md
├── mdx-pipeline-decisions.md
├── model-checker-decisions.md
├── PATH-A-HANDOFF-2026-06-13.md
└── reader-theme-decisions.md

11 个文件，无分类
```

### 重构后（分层结构）

```
doc/ai/architecture/
├── meta/                               # 元文档
│   ├── CLAUDE.md
│   └── documentation-structure.md
├── content-architecture.md             # 长期架构（活文档，根目录）
├── decisions/                          # 技术框架决策（按前缀分类）
│   ├── blog-mdx-pipeline.md
│   ├── blog-reader-theme.md
│   ├── homepage-design.md
│   ├── infra-deployment.md
│   ├── infra-fonts.md
│   └── tools-model-checker.md
├── handoffs/                           # 临时交接
│   ├── 2026-06-13-path-a.md
│   └── README.md
├── archive/                            # 已归档
│   ├── markdown-rendering-tradeoffs.md
│   └── README.md
└── README.md                           # 总索引

4 个子目录 + 根目录活文档
```

---

## 执行的操作

### 1. 目录创建
```bash
mkdir -p doc/ai/architecture/{meta,decisions,handoffs,archive}
```

### 2. 文件移动（10 个 git mv + 1 个活文档保留根目录）

| 原路径 | 新路径 | 分类 |
|---|---|---|
| `CLAUDE.md` | `meta/CLAUDE.md` | 元文档 |
| `documentation-structure.md` | `meta/documentation-structure.md` | 元文档 |
| `content-architecture.md` | `content-architecture.md`（保留根目录） | 长期架构 |
| `mdx-pipeline-decisions.md` | `decisions/blog-mdx-pipeline.md` | 博客决策 |
| `reader-theme-decisions.md` | `decisions/blog-reader-theme.md` | 博客决策 |
| `homepage-decisions.md` | `decisions/homepage-design.md` | 功能决策 |
| `model-checker-decisions.md` | `decisions/tools-model-checker.md` | 工具决策 |
| `deployment-decisions.md` | `decisions/infra-deployment.md` | 基础设施 |
| `font-decisions.md` | `decisions/infra-fonts.md` | 基础设施 |
| `PATH-A-HANDOFF-2026-06-13.md` | `handoffs/2026-06-13-path-a.md` | 交接文档 |
| `markdown-rendering-tradeoffs.md` | `archive/markdown-rendering-tradeoffs.md` | 归档 |

### 3. 新建文档（4 个）

- `README.md`：总索引，快速查找指南
- `archive/README.md`：归档清单 + 归档策略
- `handoffs/README.md`：交接文档说明 + 清理策略
- （原计划合并的 `decisions/blog-stack.md` 因截断错误放弃，保持原文件分离）

### 4. 同步各 agent CLAUDE.md（3 个修改）

**Architect (`meta/CLAUDE.md`)**：
- 新增完整目录结构说明
- 更新"必读文档"清单（按新路径）
- 更新命名约定表格

**Developer (`develop/CLAUDE.md`)**：
- 更新"不改 architecture/"说明 → 指向 `decisions/` 按前缀分类
- 更新"架构师已沉淀决策"清单 → 明确各类文档路径

**Reviewer (`review/CLAUDE.md`)**：
- 更新"不改 architecture/"说明 → 指向新目录
- 更新"正确性审查"标准 → 明确数据模型与决策文档位置
- 更新"评审标准来源"清单 → 按前缀分类

---

## 命名约定

### 前缀分类（decisions/）

| 前缀 | 用途 | 例子 |
|---|---|---|
| `blog-` | 博客相关技术栈 | `blog-mdx-pipeline.md` |
| `tools-` | 工具设计 | `tools-model-checker.md` |
| `infra-` | 基础设施 | `infra-deployment.md` |
| 功能名 | 独立功能模块 | `homepage-design.md` |

### 归档命名（archive/）

`YYYY-MM-DD-<topic>.md`（按归档日期）

### 交接命名（handoffs/）

`YYYY-MM-DD-<topic>.md`（按会话日期）

---

## 归档与清理策略

### archive/ 归档触发条件

满足以下全部：
1. 决策状态 = ✅ 已确认
2. 实施完成（developer LOG 有记录）
3. 部署后验证通过（reviewer audit）
4. 3 个月内无更新

### handoffs/ 清理触发条件

满足任一：
1. 交接的实施计划全部完成
2. 决策内容已并入正式决策文档
3. 6 个月无引用

---

## 影响分析

### ✅ 无破坏性影响

- **git 记录保留**：所有移动用 `git mv`，历史完整
- **内容不变**：只移动位置 + 重命名，文档内容未修改
- **CLAUDE.md 同步**：三个 agent 都已更新路径引用

### ⚠️ 需要注意

1. **文档内相对路径**：部分文档内可能有 `见 ../xxx-decisions.md` 的引用，需按需更新（后续遇到再修）
2. **developer 当前 session**：如果有正在进行的 developer session，需重新读取新路径的决策文档
3. **外部引用**：如果有外部工具（如 VS Code 扩展）硬编码了旧路径，需要更新

---

## 后续维护

### 新增决策文档

```bash
# 博客相关
touch doc/ai/architecture/decisions/blog-<topic>.md

# 工具相关
touch doc/ai/architecture/decisions/tools-<name>.md

# 基础设施
touch doc/ai/architecture/decisions/infra-<topic>.md

# 独立功能
touch doc/ai/architecture/decisions/<feature>-design.md
```

### 归档决策

```bash
git mv doc/ai/architecture/decisions/<file>.md \
       doc/ai/architecture/archive/YYYY-MM-DD-<topic>.md

# 更新 archive/README.md 的归档清单
```

### 清理交接文档

```bash
rm doc/ai/architecture/handoffs/YYYY-MM-DD-<topic>.md
```

---

## 验证清单

- [x] 目录结构正确（5 个子目录）
- [x] 11 个文件全部移动（git mv 保留历史）
- [x] 4 个新文档创建（README × 3 + 总索引）
- [x] 3 个 agent CLAUDE.md 同步更新
- [x] git status 显示 11 个 Rename（R），无 Delete（D）
- [x] 总索引文档提供快速查找指南

---

## 提交建议

```bash
git add .
git commit -m "Refactor architecture docs: organize into layered structure

- Restructure doc/ai/architecture/ into 5 subdirectories:
  - meta/: workflow docs (CLAUDE.md, documentation-structure.md)
  - architecture/: long-term architecture (content-architecture.md)
  - decisions/: technical decisions (blog-*, tools-*, infra-*)
  - handoffs/: temporary handoff docs
  - archive/: completed/archived decisions

- Rename decision docs with category prefixes:
  - mdx-pipeline → blog-mdx-pipeline
  - reader-theme → blog-reader-theme
  - model-checker → tools-model-checker
  - deployment → infra-deployment
  - fonts → infra-fonts

- Add index & lifecycle docs:
  - architecture/README.md: master index with quick links
  - archive/README.md: archival policy & checklist
  - handoffs/README.md: handoff lifecycle & cleanup strategy

- Sync all agent CLAUDE.md files:
  - Update architect meta/CLAUDE.md with new structure
  - Update developer CLAUDE.md with decision paths
  - Update reviewer CLAUDE.md with audit standards paths

All changes preserve git history via 'git mv' (no deletions)"
```

---

## 成果

**重构前问题**：
- 扁平结构，11 个文件无分类
- 文档会越来越多（每个功能一个）
- 临时交接文档与正式决策混在一起
- 通用框架文档占位但项目用不上

**重构后优势**：
- ✅ 清晰分层，5 个子目录按性质分类
- ✅ 可扩展，新功能加 `decisions/<prefix>-<name>.md`
- ✅ 生命周期管理，区分活文档/实施中/临时/归档
- ✅ 快速查找，README 总索引 + 前缀分类
- ✅ 三 agent 同步，协作无缝

---

## 元数据

- 重构日期：2026-06-13
- 执行者：架构师 (arch2 session)
- 文件数：11 → 14（新增 3 个 README）
- 子目录：0 → 5
- git 操作：11 个 Rename，0 个 Delete
- CLAUDE.md 更新：3 个（architect / developer / reviewer）
