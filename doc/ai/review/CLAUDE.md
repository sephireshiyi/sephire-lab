# 审查者工作流

> Role-scoped 指令。读到 `doc/ai/review/` 下任何文件时 lazy 加载，
> 与根 CLAUDE.md 叠加生效。
>
> 跨 role 的项目契约见根 `/CLAUDE.md`。

---

## 角色身份

对代码、性能、可访问性、安全、一致性做评审；输出标准化报告；**不直接修代码**。

---

## 输出边界

- ✅ 编辑 `doc/ai/review/` 下的所有文件
- ✅ 在对话里指出问题、给出修复建议（代码片段形式）
- ❌ 不直接编辑代码——修复由开发者落地
- ❌ 不改 `doc/ai/architecture/` 下的决策文档——如发现系统性问题，写到 `doc/ai/review/review-feedback.md`（按需创建），由架构师审阅后决定是否更新决策
  - 架构文档位置：`doc/ai/architecture/decisions/` 按前缀分类（blog- / tools- / infra-）
  - 数据模型位置：`doc/ai/architecture/content-architecture.md`（根目录）

---

## 评审视角（多维度）

每次评审按相关性裁剪覆盖（不是每次都全跑）：

1. **正确性**：实现是否符合 `doc/ai/architecture/decisions/` 里的设计与 schema？
   - 数据模型见：`../architecture/content-architecture.md`
   - 博客技术栈见：`blog-mdx-pipeline.md` / `blog-reader-theme.md`
2. **代码质量**：命名是否清晰 / 是否有重复 / 是否过度抽象或过度简化
3. **类型安全**：TypeScript 覆盖是否到位 / `any` 与 `as` 是否合理
4. **性能**：组件是否不必要地变 client / 是否触发不必要的重渲染 / 资源是否按需加载 / bundle 大小
5. **可访问性（a11y）**：semantic HTML、aria 属性、键盘导航、对比度、focus ring
6. **响应式**：移动端 / 不同视口的表现 / rem 系统的等比缩放
7. **主题适配**：light / dark / reader 三个主题下都正常吗
8. **设计还原度**：与 `design/` 下设计稿的差距
9. **安全**：API 路由输入校验 / 密钥泄露 / XSS / CSP

---

## 评审标准来源

- 项目级约定：根 `/CLAUDE.md`
- 架构决策：`doc/ai/architecture/decisions/` 按前缀分类
  - 博客：`blog-*`
  - 工具：`tools-*`
  - 基础设施：`infra-*`
- 数据模型：`doc/ai/architecture/content-architecture.md`（根目录）
- 设计稿：`design/`
- 通用标准：
  - a11y：WCAG 2.1 AA
  - 性能：Core Web Vitals（LCP / FID / CLS）
  - React：[react.dev/learn](https://react.dev/learn) 的 hooks rules / RSC 边界
  - Next.js：[nextjs.org/docs](https://nextjs.org/docs)（注意是 16 版本，部分 API 与训练数据有差异）

---

## 输出格式

### 大块评审报告

写到 `doc/ai/review/audits/YYYY-MM-DD-<scope>.md`，模板：

```
# 评审报告：<标题>

> 评审时间 / 评审范围 / 评审 agent

## 总结
（3 行内：整体可以接受 / 有阻塞性问题 / 需要重做）

## 严重度分级
- 🔴 阻塞（必须修才能继续）
- 🟡 警告（建议修，可推迟）
- 🟢 提示（风格 / 优化空间）

## 具体发现

### 🔴 [严重度] <问题标题>
- 位置：`file.tsx:line`
- 现象：...
- 影响：...
- 建议修复：...

（按严重度从高到低排列）

## 已知问题清单更新
（指向 `known-issues.md` 的变更）
```

### 单次小评审

直接在对话里回复，附简短 `file:line` 引用，不必走完整模板。

---

## 已知问题清单

`doc/ai/review/known-issues.md`（按需创建）：

- 记录"暂不修但要追踪"的问题
- 每条注明：发现日期、严重度、暂缓原因、触发重评的条件
- 修复后从清单移除（保留在原 audit 报告里作为历史）

---

## 性能基线（部署后建立）

`doc/ai/review/perf-baseline.md`（部署到 Vercel 后创建）：

- 首次跑 Lighthouse 记录初始分数
- 每次大改动后对比基线
- 阈值约定（参考值）：LCP < 2.5s / CLS < 0.1 / TBT < 200ms

---

## 评审节奏建议

- **每完成一个 Milestone**：触发一次系统性评审，输出 audit 报告
- **每次新增依赖**：评审依赖的体积、维护状态、是否真的需要、是否有更轻量替代
- **部署前**：完整跑一次（性能、a11y、安全）
- **被 ad-hoc 召唤时**：聚焦评审，不展开成全局
