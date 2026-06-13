# 首页设计决策

> 记录 Sephire Lab 首页（`/`）的布局结构、设计意图、与设计稿的关系。
>
> **状态**：✅ 已确认（2026-06-13）
>
> **更新历史**：
> - 2026-06-13：初版。基于设计稿 + MVP 定位 + LOG 历史，确定"极简 Hero + 内容区"混合方案。

---

## 1. 设计意图变更历史

### 时间线

| 日期 | 事件 | 首页状态 |
|---|---|---|
| 2026-05-07 | Milestone 1 初版 | Hero + Recent Writing + Projects + Tools 四区块 |
| 2026-05-18 | 根据 Figma 设计稿重构 | 极简版（只有居中"Sephire Lab"标题） |
| 2026-06-13 | 架构师重新评估 | **极简 Hero（首屏）+ Recent Writing 内容区（下滚）** |

### 为什么不是纯极简

1. **设计稿只给了首屏**  
   `Home - Light.png` 是 1440×1024 画布，展示的是"用户打开页面第一眼"（above the fold）。极简大标题适合首屏震撼，但**不代表首页不能有更多内容**。下滚后的内容区不在设计稿范围内，属于实施时的合理扩展。

2. **"长期可用、可展示的个人站"定位**  
   纯极简首页适合品牌官网（强调调性），但个人站需要**内容入口**。访客打开首页应该能快速发现"这个站有什么"（写作、工具），而不是只看到一个标题然后离开。

3. **MVP 明确要求首页有 Recent Writing**  
   根 `CLAUDE.md` MVP 范围："首页 `/`、`/blog` + `/blog/[slug]`"，隐含首页应展示博客内容。`TODO.md` Milestone 1 也明确列了"创建 Recent Writing 区域"。设计稿重构时删掉了内容区，但那是**实施偏差**，不是设计意图。

### 决策：极简 Hero + 内容区（混合方案）

**首屏（100dvh）**：严格遵循设计稿，极简居中标题 + 大量留白  
**下滚后**：Recent Writing 内容区（最近 3 篇文章卡片 + "查看全部"链接）

两全其美：保留设计稿的震撼感 + 满足内容展示需求。

---

## 2. 首页布局结构

```
┌─────────────────────────────────────┐
│ [site-header - 固定顶部]             │  ← 已有，80px 高
├─────────────────────────────────────┤
│                                     │
│          (极简 Hero 区)              │
│                                     │  100dvh，垂直居中
│         Sephire Lab                 │  ← 设计稿：text-6xl ~ text-8xl
│                                     │     负 margin 跨满视口
│                                     │     （当前 app/page.tsx 已实现）
│                                     │
└─────────────────────────────────────┘
         ↓ 用户下滚
┌─────────────────────────────────────┐
│                                     │
│     Recent Writing                  │  ← 新增内容区
│                                     │
│  ┌─────────────────────────────┐   │
│  │ 你好，世界...                │   │  ← 文章卡片（复用 /blog 样式）
│  │ 2026-06-07 · 技术            │   │
│  │ 这是第一篇测试文章...         │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ 文章标题 2                   │   │
│  └─────────────────────────────┘   │
│  ┌─────────────────────────────┐   │
│  │ 文章标题 3                   │   │
│  └─────────────────────────────┘   │
│                                     │
│  [查看全部 →]  → /blog              │
│                                     │
└─────────────────────────────────────┘
         ↓ 未来扩展（非 MVP）
┌─────────────────────────────────────┐
│     Tools                           │  ← /tools/model-checker 实现后加
│                                     │
│  ┌─────────────────────────────┐   │
│  │ Model API Checker            │   │
│  │ 测试 LLM API 可用性          │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

---

## 3. Recent Writing 内容区设计规范

### 3.1 数据来源

```ts
// app/page.tsx (Server Component)
import { getAllPosts } from "@/lib/content";

export default async function Home() {
  const recentPosts = getAllPosts().slice(0, 3);
  
  return (
    <>
      {/* Hero 区（极简，保持不变）*/}
      <section>...</section>
      
      {/* Recent Writing 区（新增）*/}
      <section>
        <h2>Recent Writing</h2>
        {recentPosts.map(post => <PostCard key={post.slug} post={post} />)}
        <Link href="/blog">查看全部 →</Link>
      </section>
    </>
  );
}
```

### 3.2 样式约定

| 元素 | 规范 |
|---|---|
| **容器宽度** | `max-w-4xl mx-auto`（与 `/blog` 列表页一致） |
| **标题** | `text-3xl font-medium mb-3xl`，使用 `--text-primary` |
| **文章卡片** | 复用 `/blog` 的卡片组件（标题 + 日期 + category chip + summary） |
| **间距** | 卡片之间 `space-y-2xl`（与列表页一致） |
| **"查看全部"链接** | `text-base underline hover:opacity-70`，右对齐或居中 |
| **上下留白** | 内容区 `py-5xl`（与 Hero 区拉开距离） |

### 3.3 组件复用策略

**抽取文章卡片组件**：`/blog` 列表页当前把卡片逻辑写在 `page.tsx` 内，首页复用时需抽取：

```
components/blog/
  └── post-card.tsx   ← 新建，接收 { post, showSummary? } props
```

**抽取辅助函数**：解决 reviewer 🟢-1（`formatDate` 和 `CATEGORY_LABEL` 内联问题）

```ts
// lib/content.ts（扩展）
export const CATEGORY_LABEL: Record<string, string> = {
  tech: "技术",
  thoughts: "思考",
  music: "音乐",
  photo: "摄影",
};

export function formatDate(isoDate: string): string {
  const date = new Date(isoDate);
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}
```

---

## 4. 与设计稿的关系

### 设计稿覆盖范围

| 设计稿 | 覆盖的页面区域 | 实施约束 |
|---|---|---|
| `Home - Light.png` | **首屏**（100dvh Hero 区） | ✅ 严格遵循（居中标题 + 极简留白） |
| `Home - Dark.png` | 同上 | ✅ 三主题一致 |
| `Home - Read.png` | 同上 | ✅ 三主题一致 |
| — | 下滚内容区（Recent Writing / Tools） | ⚠️ 设计稿未给，参照 `/blog` 列表页样式 |

### 首屏实施检查清单

- [x] 导航栏：左侧 Logo + 中间导航 + 右侧主题/语言切换（task3 已完成）
- [x] Hero 标题：`Sephire Lab`，text-6xl ~ text-8xl，垂直居中（task2 已完成）
- [x] 100dvh 高度 + 负 margin 跨满视口（task2 已修复居中问题）
- [x] 三主题配色：#F9F9F9 / #1E1E1E / #EAE5D4（task2 已确认）

### 内容区样式约定（设计稿未覆盖部分）

**原则**：与 `/blog` 列表页保持一致（spacing token / 主题变量 / 字号 / 卡片样式）

- 容器：`max-w-4xl mx-auto px-lg py-5xl`
- 标题：`text-3xl font-medium mb-3xl`
- 卡片：`border border-[var(--border-color)] rounded-lg p-lg hover:bg-[var(--bg-hover)]`
- 间距：`space-y-2xl`

---

## 5. 实施计划（交给 developer）

### 任务分解

1. **改首页为 Server Component**（当前有 `"use client"`，无必要）
2. **抽取 `components/blog/post-card.tsx`**（从 `/blog/page.tsx` 抽出卡片逻辑）
3. **抽取 `lib/content.ts` 辅助函数**（`formatDate` / `CATEGORY_LABEL`，解决 reviewer 🟢-1）
4. **更新 `app/blog/page.tsx`**（引用新组件 / 新辅助函数）
5. **重写 `app/page.tsx`**（Hero 区保持 + 新增 Recent Writing 区）
6. **验证**：
   - `/` 首屏：极简标题（与设计稿一致）
   - `/` 下滚：3 张文章卡片 + "查看全部"链接
   - 点击卡片 → 跳转到 `/blog/[slug]`
   - 点击"查看全部" → 跳转到 `/blog`
   - 三主题切换正常
7. **更新 LOG.md**

### 验证标准

- `pnpm build` 绿，`/` 标记为 `○ (Static)`（Server Component 预渲染）
- Hero 区视觉与设计稿一致（居中、字号、留白）
- Recent Writing 区卡片样式与 `/blog` 列表页一致
- 无 `"use client"`（除非后续加交互组件）

---

## 6. 未来扩展（非 MVP）

### Tools 预览区

等 `/tools/model-checker` 实现后，在 Recent Writing 下方加"Tools"区：
- 一张卡片（标题 + 描述 + 链接到工具详情页）
- 样式与文章卡片保持一致

### Projects 预览区

根 CLAUDE.md 明确"第一版暂不做：项目展示页"。若后续决定做，再加入首页。

### Gallery 入口

`content-architecture.md` 提到 gallery 不在 MVP，若后续加入，首页可加"Recent Photos"区。

---

## 7. 与其他文档的关系

- **根 `CLAUDE.md`**：MVP 范围"首页 `/`"——本文档实现了首页的完整设计
- **`content-architecture.md`**：Recent Writing 区调用 `getAllPosts()`（§6.3 列表读取）
- **`mdx-pipeline-decisions.md`**：文章卡片复用 `formatDate` / `CATEGORY_LABEL`（§11 切片 B 提到的抽取）
- **TODO.md Milestone 1**：本设计覆盖"创建首页 Hero 区域"+"创建 Recent Writing 区域"，不做 Projects / Tools 预览（后者等 model-checker 实现）
