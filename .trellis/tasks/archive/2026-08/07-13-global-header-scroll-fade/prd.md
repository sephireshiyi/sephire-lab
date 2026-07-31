# 全站 Header 滚动淡出

## 目标

柔化固定 Header 与页面内容之间目前清晰、突兀的边界。当页面从下向上滚动时，进入 Header 下方的内容应在一段短距离内逐渐淡出，再消失在 Header 后方，形成自然的滚动过渡。

## 用户价值

- Hero 与 Main 的衔接不再表现为明显的硬切线。
- 全站页面采用一致的内容离场方式，保持现有极简、克制的视觉气质。

## 已确认事实

- 全站 Header 由 `components/layout/site-header.tsx` 提供，并固定在视口顶部。
- Header 和页面背景均使用主题变量 `--bg-primary`。
- 全站支持 light / dark 两种主题。
- 用户确认淡出区域应固定在视口顶部，而不是只跟随首页 Hero/Main 交界滚动。

## 需求

- 淡出效果应用于所有使用全局 Header 的页面。
- 内容滚入 Header 下方时，通过 Header 下方的 `h-xl`（2rem）区域从正常显示过渡到不可见；该高度为开发者视觉确认后的最终值。
- 淡出颜色应跟随当前主题背景，light / dark 模式都不能出现异色接缝。
- 淡出层只能作为视觉装饰，不得阻挡页面链接、按钮或其他指针交互。
- 使用纯 CSS 实现，不增加滚动监听、React 状态或逐页接入逻辑。
- 保持开发者最终确认的 `py-2xl` Header 高度、布局、导航和主题切换行为。

## 验收标准

- [x] 首页 Hero 和 Main 内容滚到固定 Header 下方时，会逐渐淡出后消失，不再出现明确硬边界。
- [x] 淡出层由全局 Header 提供，非首页内容页具有相同效果。
- [x] light 与 dark 主题下，渐变通过 `--bg-primary` 自然融入对应背景色。
- [x] 渐变层使用 `pointer-events-none`，区域内的页面交互仍可正常点击或悬停。
- [x] Header 的布局、导航和主题控件行为无回归；`py-2xl` 为开发者确认后的最终高度。
- [x] ESLint 通过；排除主工作区旧 `.next` 后的源码 TypeScript 检查通过。

## 不在范围内

- 不改变页面内容本身的透明度或为各页面增加独立动画。
- 不调整 Header 尺寸、响应式布局或导航结构。
- 不修改 Hero、Main 及其他页面区块的内容和间距。
- 不引入基于 JavaScript 的滚动动画系统。

## 任务规模

这是一个 PRD-only 的轻量任务，不需要单独的 `design.md` 或 `implement.md`。

## 完成记录（2026-08-01）

- 实现包含在提交 `55f67d9`（`adjust album/music layout`）中。
- 开发者确认以当前 `h-xl` 淡出高度和 `py-2xl` Header 高度为最终视觉决策，取代早期约 `5rem` 与保持旧高度的描述。
- 代码核对确认：效果由全局 Header 的纯 CSS 渐变提供，颜色复用主题变量，并通过 `pointer-events-none` 保持下层交互。
- `./node_modules/.bin/eslint .` 通过。
- 在排除主工作区旧 `.next` 的临时副本中，`tsc --noEmit --incremental false` 通过。
