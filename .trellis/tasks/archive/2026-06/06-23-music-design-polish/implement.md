# Music 设计稿打磨 — 实现计划

实现顺序从数据层到页面，每步可独立验证。所有改动遵循「inline CSS 变量、无 `dark:` 变体、间距用 `2xs..5xl`」约定。🎨 标记处是无视觉下的默认值，开发者可纠正。

## 步骤

### 1. schema 加 `tags` — `lib/music.ts`

在 `MusicSchema` 的 `playbackPlaceholder` 之后加：

```ts
tags: z.array(z.string()).optional(),
```

更新 `MusicSchema` 上方注释，补一句 `tags：可选类型/标签数组，详情页渲染为小标签，索引页不显示`。`Album` 类型由 zod 推导，无需手改。

### 2. 3 张专辑 YAML 加 `tags`

在 `note` 之后、`tracks` 之前（若有）插入块状数组，风格对齐现有 `tracks`：

- `content/music/radiohead-in-rainbows.yaml`：
  ```yaml
  tags:
    - Alternative Rock
    - Art Rock
    - Experimental
  ```
- `content/music/daft-punk-discovery.yaml`：
  ```yaml
  tags:
    - Electronic
    - French House
    - Disco
  ```
- `content/music/bon-iver-for-emma-forever-ago.yaml`：
  ```yaml
  tags:
    - Folk
    - Indie
    - Singer-Songwriter
  ```

（`themeColor` 值仍带引号不动；tags 是开发者可改的合理值。）

### 3. `/music` 索引页 — `app/music/page.tsx`

- 网格 `gap-lg` → `gap-2xl`：`<ul className="grid grid-cols-2 gap-2xl sm:grid-cols-3">`。🎨
- 封面圆角 `rounded-md` → `rounded-lg`：`className="aspect-square w-full rounded-lg object-cover"`。
- 封面下文字收敛为克制小字：
  - title：`className="mt-md text-sm font-medium"`（去掉原 `mb` 大标题感），`style={{ color: "var(--text-primary)" }}`。
  - artist · year：`className="text-xs"`，`style={{ color: "var(--text-secondary)" }}`。
  - 🎨（若设计稿是纯封面无文字，删掉这两行 `<p>`，仅留封面 + `<Link>`）。
- 容器 `container mx-auto max-w-5xl px-lg py-4xl`、`h1` 维持。🎨
- 不渲染 tags。

### 4. `/music/[slug]` 详情页 — `app/music/[slug]/page.tsx`

**4a. 背景升级（D3）**：把外层 `<div style={{ background: linear-gradient(...) }}>` 换成：

```tsx
style={{
  background: `radial-gradient(ellipse 90% 70% at 22% 18%, ${album.themeColor}40 0%, var(--bg-primary) 72%)`,
}}
```

🎨（渐变形状/强度/中心/alpha 待视觉确认）

**4b. 首屏两栏（D4）**：保留 `flex flex-col gap-2xl sm:flex-row sm:items-start`：
- 左封面：`w-full sm:w-2/5 sm:flex-shrink-0`，`<img>` `aspect-square w-full rounded-lg object-cover`。🎨（比例可调 `sm:w-1/2`）
- 右栏首屏信息：`flex-1`
  - `h1` 标题 `text-4xl font-bold tracking-tight` + `var(--text-primary)`
  - `artist · year` `mt-sm text-lg` + `var(--text-secondary)`
  - **tags 行**（D5，`album.tags?.length` 时渲染）：
    ```tsx
    {album.tags && album.tags.length > 0 ? (
      <ul className="mt-lg flex flex-wrap gap-xs">
        {album.tags.map((tag) => (
          <li
            key={tag}
            className="rounded-full px-sm py-2xs text-xs"
            style={{
              border: `1px solid ${album.themeColor}66`,
              color: "var(--text-primary)",
              backgroundColor: `${album.themeColor}1a`,
            }}
          >
            {tag}
          </li>
        ))}
      </ul>
    ) : null}
    ```
    🎨（主题色 vs 中性边待确认）

**4c. 次级区（D4）**：把 `note` + 播放占位 + 曲目列表从右栏移到两栏布局**之下**的全宽次级区，包一个 `<div className="mt-3xl">`：
- `note`：`className="text-base leading-relaxed"`，`style={{ color: "var(--text-secondary)" }}`（降为次级色）。
- 播放占位：保留虚线框非交互占位（`border: 1px dashed var(--border-color)`，文案 `album.playbackPlaceholder ?? "音乐片段播放能力将在后续阶段接入"`），加 `mt-xl`。🎨
- 曲目列表：保留 `<ol className="mt-xl flex flex-col gap-xs">` + 行结构，作为次级区尾部。
- 返回链接 `← Music` 维持在容器顶部。
- 🎨（首屏/次级切分待确认）

### 5. 验证

1. `pnpm lint`（主工作区，不受 .next 影响）。
2. `/tmp` 副本静态导出（**不**在主目录跑 build）：
   ```bash
   VERIFY_DIR="/tmp/shiyi-lab-verify-$(date +%Y%m%d%H%M%S)"
   rsync -a --delete --exclude='.git' --exclude='node_modules' --exclude='.next' --exclude='out' --exclude='.tmp-design-preview' /Users/jiechu/shiyi-lab/ "$VERIFY_DIR"/
   cd "$VERIFY_DIR" && pnpm install --frozen-lockfile && pnpm lint && pnpm build && test -d out
   ```
   （sandbox 下 rsync/install/build 会因端口/进程绑定失败 → 用 `dangerouslyDisableSandbox` 跑 build；install 可 sandboxed。）
3. DOM/结构检查（无视觉，靠结构确认）：
   - 启 dev server（端口 3000 已被占用 → 用 `next dev -p 3100` 或直接看 `/tmp` 副本 `next start`）抓 `/music` 与一个 `/music/[slug]` 的 HTML，确认：封面 `<img src>` 指向正确、tags `<li>` 渲染、themeColor 出现在 inline `background`、无重叠（grid/flex 结构正常）、无 console error。
   - 或用 `curl` 取静态 `out/music/index.html` 与 `out/music/<slug>/index.html` grep 关键结构。
4. light/dark：确认 inline `var(--text-*)`/`var(--bg-primary)` 在两种 `.light`/`.dark` class 下都能解析（结构层面保证）；视觉明暗由开发者确认。

### 6. 提交（按 `task-completion-guide.md`）

- `git status --short` 确认仅本任务文件（`app/music/page.tsx`、`app/music/[slug]/page.tsx`、`lib/music.ts`、3 个 `content/music/*.yaml`）；`.tmp-design-preview/` 已在 `.gitignore`，不应出现。
- 有无关 dirty（`design/*.png`、`dev.log`）→ **不** stage，必要时停止询问。
- commit message：`Refine music page layouts from design references`（英文祈使句，对齐 git log 风格，无 `feat:` 前缀）。
- 不 push。work commit 与 Trellis 归档分开。

## Review Gates

- **G1（start 前）**：开发者 review prd/design/implement，确认或纠正 🎨 默认值。
- **G2（实现后、提交前）**：`pnpm lint` + `/tmp` build + `test -d out` 通过；DOM 结构检查通过；无无关 dirty。
- **G3（提交后）**：开发者浏览器视觉确认 light/dark，反馈偏差 → 迭代轮（回到步骤 3/4 微调，不重开任务）。

## Rollback Points

- 步骤 1–2 后：schema/YAML 改动可 `git checkout lib/music.ts content/music/` 回滚（optional 字段，不影响骨架）。
- 步骤 3–4 后：页面改动可 `git checkout app/music/` 回滚到骨架。
- 整体：`git checkout -- app/music lib/music.ts content/music/` 一键回到任务前状态。

## 子 Agent 派发

- 实现阶段：dispatch `trellis-implement`，prompt 以 `Active task: .trellis/tasks/06-23-music-design-polish` 开头，按 jsonl→prd→design→implement 顺序加载上下文，执行步骤 1–4。
- 检查阶段：dispatch `trellis-check` 对照 prd 验收标准 + 步骤 5 验证。
- 注意：子 agent 同样无视觉能力，不得要求其「看设计图」；视觉对齐留给开发者 G3。
