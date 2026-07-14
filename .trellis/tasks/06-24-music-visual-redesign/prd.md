# 按视觉模型重做 Music 页面

## 目标

基于设计图（`design/Music - Index - {Light,Dark}.png`、`design/Music - Album{,-1,-2}.png`），将 `/music` 和 `/music/[slug]` 从当前骨架状态打磨到高保真视觉，消除与设计图之间的差异。本任务只处理 Music 模块，不涉及 Gallery、Writing、About。

## 父任务

- `.trellis/tasks/06-18-site-direction-architecture`

## 背景

- 上一个归档任务 `06-23-music-design-polish` 由无视觉能力的模型执行，无法读取设计图，导致浏览器视觉几乎未按设计稿变化。
- 当前代码可作为结构基线（路由、YAML schema、静态导出已就绪），但视觉与设计图存在明显差距。
- 设计图包含 5 张 PNG：
  - `design/Music - Index - Light.png`（浅色主题索引页）
  - `design/Music - Index - Dark.png`（深色主题索引页）
  - `design/Music - Album.png`（详情页 - God Is an Astronaut 专辑，浅色）
  - `design/Music - Album-1.png`（详情页变体 1）
  - `design/Music - Album-2.png`（详情页变体 2）

## 当前页面 vs 设计图差异清单

### `/music` 索引页

1. **网格列数**：当前 `grid-cols-2 sm:grid-cols-3`（最多 3 列）；设计图桌面端为 4 列。
2. **封面间距**：当前 `gap-2xl`；设计图间距更大，呈现"画廊墙"气质。
3. **容器宽度**：当前 `max-w-5xl`；设计图封面占据更多空间，需要更宽容器。
4. **封面主导**：设计图封面是绝对主角，标题/艺术家文字极小且克制。
5. **少量专辑排版**：当前左对齐；只有 3 张专辑时需居中且不显空旷。
6. **背景色**：Light 模式需浅米色（~`#F7F5F1`），Dark 模式需深灰/近黑。

### `/music/[slug]` 详情页

7. **整页背景渐变**：
   - 当前：`radial-gradient(ellipse 90% 70% at 22% 18%, ${themeColor}40 0%, var(--bg-primary) 72%)`
   - 设计图：更强的色彩渗透，更饱和的主题色背景，覆盖范围更广，呈现 Apple Music 式沉浸感。
   - 差异：Alpha 过淡（`40` = 25%），终止位置过早（`72%`），中心位置可能需调整。

8. **封面视觉冲击**：
   - 当前：`sm:w-2/5`，无阴影。
   - 设计图：封面更大（约 40-45% 宽度），有轻微立体阴影。
   - 差异：需添加 `shadow-xl` 或 `shadow-2xl`。

9. **标题字号**：
   - 当前：`text-4xl`。
   - 设计图：标题巨大醒目。
   - 差异：可能需 `text-5xl` 或 `text-6xl`。

10. **tags 标签**：
    - 当前：`border: 1px solid ${themeColor}66`，`backgroundColor: ${themeColor}1a`。
    - 设计图：tags 与背景渐变视觉呼应。
    - 状态：逻辑正确，需验证实际效果。

11. **次级内容位置**：
    - 当前：短评/曲目/播放占位在次级区（`mt-3xl`）。
    - 设计图：次级内容不干扰首屏。
    - 状态：结构正确。

12. **播放占位**：
    - 当前：虚线框 + 文案。
    - 设计图：播放区域不可见或极度简化。
    - 差异：可能需要更隐蔽处理或移除占位。

### 通用

13. **导航栏**：
    - 设计图显示 `Writing | Music | Tools | About`（旧版）。
    - 当前代码：`Writing | Music | Gallery | About`（正确，Tools 已被 Gallery 替换）。
    - **决策**：不恢复 Tools，保持当前导航。

## 需求

### `/music` 索引页

- 桌面端改为 4 列网格（`grid-cols-2 md:grid-cols-3 lg:grid-cols-4`）。
- 增大封面间距至 `gap-3xl` 或 `gap-4xl`。
- 容器宽度改为 `max-w-6xl` 或 `max-w-7xl`。
- 封面下方标题/艺术家文字保持极小（`text-xs` 或更小），增加透明度让封面更突出。
- 当专辑数量少（≤3）时，网格居中对齐。
- Light 模式背景接近 `#F7F5F1`，Dark 模式深灰/近黑。

### `/music/[slug]` 详情页

- 整页背景渐变增强：
  - 提高主题色 Alpha 至 50-60%（`${themeColor}80` 或 `${themeColor}99`）。
  - 渐变终止位置延后至 85-100%。
  - 调整渐变中心位置以对齐封面。
  - 确保 Light/Dark 模式下都有沉浸式氛围。

- 封面增强：
  - 保持 `sm:w-2/5` 或略增至 `sm:w-[45%]`。
  - 添加 `shadow-2xl` 立体阴影。

- 标题字号增大至 `text-5xl` 或 `text-6xl`（响应式：移动端 `text-4xl`，桌面端 `text-6xl`）。

- tags 标签视觉与主题色呼应（当前逻辑保持）。

- 播放占位简化：
  - 移除虚线框视觉。
  - 改为极简文字提示（`text-xs`，低透明度），或完全移除。

- 返回链接 `← Music` 保持当前样式。

### 全局约束

- 不修改导航（保持 `Writing | Music | Gallery | About`）。
- 不重新引入 `/tools`。
- 不修改 Gallery、Writing、About。
- 不引入新依赖。
- 保持完全静态导出兼容。
- 不接入音频、播放器、第三方嵌入。
- 遵循现有 CSS 约定：inline CSS 变量，`@theme` spacing scale，不用 `dark:` 变体。

## 非目标

- 不做真实音频播放。
- 不处理 Gallery 横向浏览。
- 不处理 Writing reader 主题。
- 不做首页、About 视觉改动。
- 不做像素级自动化视觉回归测试（依赖开发者人工确认）。

## 验收标准

- [ ] `/music` 为 4 列大间距封面墙（桌面端），3 张专辑时居中且排版稳定。
- [ ] `/music` 封面文字极小克制，封面是绝对主角。
- [ ] `/music` Light 模式背景接近 `#F7F5F1`，Dark 模式深灰/近黑。
- [ ] `/music/[slug]` 整页背景渐变增强，呈现 Apple Music 式主题色沉浸感，Light/Dark 都自然适配。
- [ ] `/music/[slug]` 封面有立体阴影。
- [ ] `/music/[slug]` 标题字号巨大醒目（桌面端 `text-5xl` 或 `text-6xl`）。
- [ ] `/music/[slug]` 播放占位极简或移除，不干扰首屏。
- [ ] tags 标签渲染正确，视觉与主题色呼应。
- [ ] 导航保持 `Writing | Music | Gallery | About`，未恢复 Tools。
- [ ] `pnpm lint` 通过。
- [ ] `/tmp` 副本 `pnpm build` 通过且 `out/` 生成。
- [ ] 未修改 Gallery / Writing / About；未引入音频/播放器/新依赖。
- [ ] 开发者在浏览器确认 Light/Dark 模式下 `/music` 和至少一个 `/music/[slug]` 接近设计图。

## 后续任务

- 真实音频播放能力另拆独立任务。
- 若开发者视觉确认后发现偏差，作为本任务迭代继续修正。
