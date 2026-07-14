# Music 页面视觉重做 - 实施计划

## 执行原则

1. **只改 Music 模块**：不触碰 Gallery、Writing、About、全局 header/footer。
2. **保持静态导出兼容**：不引入运行时依赖、API、数据库。
3. **遵循现有约定**：inline CSS 变量，`@theme` spacing，不用 `dark:` 变体。
4. **先改索引页，再改详情页**：降低一次性改动风险。
5. **实测驱动**：每改一处，在浏览器 Light/Dark 模式下验证，按需微调参数。

## 实施清单

### 阶段 1：准备与环境确认

- [x] 任务已创建并链接到父任务 `06-18-site-direction-architecture`。
- [ ] 读取设计图 5 张（已完成，见 PRD 差异清单）。
- [ ] 确认当前代码基线：
  - [ ] `app/music/page.tsx`（索引页）
  - [ ] `app/music/[slug]/page.tsx`（详情页）
  - [ ] `lib/music.ts`（YAML schema）
  - [ ] `content/music/*.yaml`（3 张专辑数据）
- [ ] 确认全局 CSS 变量配置：
  - [ ] `app/globals.css` 中 `--bg-primary` 的 Light/Dark 值。
  - [ ] 若 Light 模式为纯白，考虑改为 `#F7F5F1`（仅当 Music 页面实测背景为纯白时）。

### 阶段 2：`/music` 索引页视觉增强

- [ ] **2.1 网格列数调整**
  - 文件：`app/music/page.tsx`
  - 改动：`grid-cols-2 sm:grid-cols-3` → `grid-cols-2 md:grid-cols-3 lg:grid-cols-4`
  - 验证：浏览器桌面端确认 4 列。

- [ ] **2.2 间距增大**
  - 文件：`app/music/page.tsx`
  - 改动：`gap-2xl` → `gap-3xl`
  - 验证：封面之间留白明显增大。

- [ ] **2.3 容器宽度增大**
  - 文件：`app/music/page.tsx`
  - 改动：`max-w-5xl` → `max-w-6xl`
  - 验证：封面占据更多横向空间。

- [ ] **2.4 封面文字克制化**
  - 文件：`app/music/page.tsx`
  - 改动：标题从 `text-sm` → `text-xs`，艺术家/年份保持 `text-xs`，增加透明度（`opacity-80` 或 `var(--text-tertiary)`）。
  - 验证：文字几乎次要，封面是绝对主角。

- [ ] **2.5 浏览器实测**
  - Light 模式：确认背景色接近 `#F7F5F1`，封面墙气质贴近设计图。
  - Dark 模式：确认深灰/近黑背景，封面对比度良好。
  - 响应式：移动端 2 列，平板 3 列，桌面 4 列。

### 阶段 3：`/music/[slug]` 详情页视觉增强

- [ ] **3.1 背景渐变增强**
  - 文件：`app/music/[slug]/page.tsx`
  - 改动：
    ```tsx
    // 原始
    background: `radial-gradient(ellipse 90% 70% at 22% 18%, ${album.themeColor}40 0%, var(--bg-primary) 72%)`
    
    // 修改为
    background: `radial-gradient(ellipse 80% 75% at 25% 20%, ${album.themeColor}80 0%, ${album.themeColor}33 50%, var(--bg-primary) 90%)`
    ```
  - 参数说明：
    - Alpha 从 `40`（25%）增至 `80`（50%），主题色更饱和。
    - 增加 `50%` 中间停止点，过渡更自然。
    - 终止位置从 `72%` 延至 `90%`，色彩覆盖更广。
    - 椭圆尺寸和中心微调（`80% 75%` at `25% 20%`）。
  - 验证：整页呈现 Apple Music 式主题色沉浸感，Light/Dark 都自然。

- [ ] **3.2 封面阴影添加**
  - 文件：`app/music/[slug]/page.tsx`
  - 改动：封面 `<img>` 的 `className` 添加 `shadow-2xl`。
  - 验证：封面有轻微立体感。

- [ ] **3.3 标题字号响应式增大**
  - 文件：`app/music/[slug]/page.tsx`
  - 改动：`text-4xl` → `text-4xl sm:text-5xl lg:text-6xl`。
  - 验证：移动端 `text-4xl`，平板 `text-5xl`，桌面 `text-6xl`，标题醒目。

- [ ] **3.4 播放占位简化**
  - 文件：`app/music/[slug]/page.tsx`
  - 改动：移除虚线框 `border: "1px dashed var(--border-color)"`，改为：
    ```tsx
    <p className="mt-xl text-xs" style={{ color: "var(--text-tertiary)" }}>
      {album.playbackPlaceholder ?? "音乐片段播放能力将在后续阶段接入"}
    </p>
    ```
  - 验证：播放提示极简，不干扰首屏。

- [ ] **3.5 浏览器实测（至少一个专辑）**
  - 测试专辑：`bon-iver-for-emma-forever-ago`（`themeColor: "#2f4f2f"` 深绿）或 `radiohead-in-rainbows`（`themeColor: "#7a1f1f"` 深红）。
  - Light 模式：确认主题色背景渗透，封面阴影，标题巨大，tags 渲染。
  - Dark 模式：确认背景不过暗，文字可读，视觉沉浸。
  - 响应式：移动端标题不挤压，桌面端标题醒目。

### 阶段 4：全局背景色调整（按需）

- [ ] **4.1 检查 Light 模式背景色**
  - 文件：`app/globals.css`
  - 检查：`:root` 的 `--bg-primary` 是否为纯白（如 `#ffffff`）。
  - 决策：
    - 若为纯白，改为 `#F7F5F1`（浅米色）。
    - 若已是浅米色或接近，无需改动。

- [ ] **4.2 若改动 `--bg-primary`，验证全站页面**
  - 验证范围：`/`（首页）、`/writing`、`/gallery`、`/about`。
  - 确认：背景色改动不破坏其他页面视觉。
  - 回滚条件：若其他页面出现回归，改为在 `/music` 页面级别覆盖背景色，不改全局。

### 阶段 5：构建验证

- [ ] **5.1 Lint 检查**
  - 命令：`pnpm lint`
  - 预期：无 ESLint 或 TypeScript 错误。

- [ ] **5.2 构建验证（/tmp 副本）**
  - 命令：
    ```bash
    rm -rf /tmp/shiyi-lab-build-test
    cp -R . /tmp/shiyi-lab-build-test
    cd /tmp/shiyi-lab-build-test
    pnpm build
    test -d out && echo "Static export success" || echo "Static export failed"
    ```
  - 预期：`out/` 目录生成，包含 `/music/index.html` 和 `/music/[slug]/index.html`。
  - **重要**：不在主工作区运行 `pnpm build`，避免影响本地 `pnpm dev` 的 `.next` 缓存。

- [ ] **5.3 静态产物检查**
  - 文件：`/tmp/shiyi-lab-build-test/out/music/index.html`
  - 确认：HTML 包含 3 张专辑的封面 `<img>` 标签。
  - 文件：`/tmp/shiyi-lab-build-test/out/music/bon-iver-for-emma-forever-ago/index.html`
  - 确认：HTML 包含专辑详情、主题色 inline style。

### 阶段 6：开发者视觉确认

- [ ] **6.1 提供确认清单**
  - 开发者需在浏览器确认：
    1. `/music` Light 模式：4 列网格，大间距，浅米色背景，封面主角。
    2. `/music` Dark 模式：4 列网格，大间距，深灰背景，封面对比度良好。
    3. `/music/[slug]` Light 模式：整页主题色渐变，封面阴影，标题巨大，tags 渲染，播放占位极简。
    4. `/music/[slug]` Dark 模式：整页主题色渐变，文字可读，视觉沉浸。
    5. 响应式：移动端 2 列/`text-4xl`，桌面端 4 列/`text-6xl`。

- [ ] **6.2 迭代修正（若需要）**
  - 若开发者反馈「背景渐变过亮/过暗」，调整 alpha（`80` → `60` 或 `99`）。
  - 若开发者反馈「标题过大/过小」，调整响应式字号。
  - 若开发者反馈「间距过大/过小」，调整 `gap-3xl` → `gap-4xl` 或 `gap-2xl`。

### 阶段 7：提交

- [ ] **7.1 检查 dirty files**
  - 命令：`git status`
  - 预期改动范围：
    - `app/music/page.tsx`
    - `app/music/[slug]/page.tsx`
    - 可选：`app/globals.css`（若改动 `--bg-primary`）
  - 确认：无意外改动（如 Gallery、Writing、About、`package.json`）。

- [ ] **7.2 读取 task-completion-guide**
  - 文件：`.trellis/spec/guides/task-completion-guide.md`
  - 确认：提交规则、commit message 风格。

- [ ] **7.3 创建 commit**
  - Message：`Refine music page visuals from design references`
  - 提交范围：仅本任务改动的文件。
  - 命令：
    ```bash
    git add app/music/page.tsx app/music/[slug]/page.tsx
    # 若改了全局 CSS
    git add app/globals.css
    git commit -m "Refine music page visuals from design references"
    ```

- [ ] **7.4 归档任务**
  - 命令：`python3 ./.trellis/scripts/task.py archive 06-24-music-visual-redesign`
  - 确认：任务移至 `.trellis/tasks/archive/2026-06/`。

## 验证命令速查

```bash
# Lint
pnpm lint

# 构建验证（/tmp 副本）
rm -rf /tmp/shiyi-lab-build-test && \
cp -R . /tmp/shiyi-lab-build-test && \
cd /tmp/shiyi-lab-build-test && \
pnpm build && \
test -d out && echo "✓ Static export success" || echo "✗ Static export failed"

# 检查静态产物
ls -lh /tmp/shiyi-lab-build-test/out/music/
ls -lh /tmp/shiyi-lab-build-test/out/music/bon-iver-for-emma-forever-ago/

# Git 状态
git status

# 任务归档
python3 ./.trellis/scripts/task.py archive 06-24-music-visual-redesign
```

## 风险点与缓解

1. **背景渐变 alpha 过高导致 Dark 模式可读性不足**
   - 缓解：先用 `${themeColor}80`（50%），实测后按需降至 `60`（37.5%）或 `66`（40%）。

2. **全局背景色改动影响其他页面**
   - 缓解：仅当 Music 页面实测背景为纯白时才改；或在 `/music` 页面级别覆盖，不改全局。

3. **标题 `text-6xl` 在长标题时换行挤压布局**
   - 缓解：响应式字号（移动端 `text-4xl`），`tracking-tight` 压缩字距；实测后按需调整。

4. **4 列网格 + 3 张专辑显得空旷**
   - 缓解：通过大间距和大封面让视觉密度足够；未来加专辑自然填充。

5. **/tmp 构建失败**
   - 缓解：确保 `/tmp/shiyi-lab-build-test` 有写权限；确保 `dangerouslyDisableSandbox: true`。

## 回滚策略

- **单文件回滚**：`git checkout HEAD -- app/music/page.tsx`
- **全部回滚**：`git reset --hard HEAD`（需确认无其他未提交工作）
- **迭代修正**：基于开发者反馈调整参数，无需完全回滚。
