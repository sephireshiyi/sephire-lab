# PRD: Gallery 浏览体验修正

## 背景

`components/gallery/gallery-experience.tsx`（横向画廊，任务 08-01 产物）在触控板实测中暴露四个问题。本任务为轻量修正，改动集中在该单一文件。

## 需求

### R1 触控板一次划动只翻一张图
- 现状：wheel handler 将每个事件 delta 直接 `scrollBy`，触控板惯性事件流越过吸附点后继续推进，一次手势跳两张。
- 要求：改为离散翻页——累积 deltaX 超过阈值才推进一张，惯性事件不得重复触发。
- 键盘方向键、点击相邻图片的既有离散路径行为不变。

### R2 纵向滚动分流到文字区
- 现状：`normalizeWheelDelta` 取主导轴，纵向手势也被劫持为翻图。
- 要求：按轴分流——
  - `|deltaX| > |deltaY|` → 水平翻页（R1 逻辑）；
  - deltaY 向下占主导 → 调用 `openDetails()` 滚到文字区（防惯性重复触发）；
  - deltaY 向上 → 不拦截，由既有 IntersectionObserver 处理回到画廊。
- 触屏 touch 行为不改（纵向 pan 滚动页面已是期望行为）。

### R3 页面提供返回操作
- 图片区提供"← 影集"链接（`next/link` 指向 `/gallery`），样式与"文字 ↓"按钮一致。
- 文字区底部补一条返回影集列表的链接。

### R4 Header 自动隐藏
- 现状：仅滚动/翻图触发 `hideHeader`。
- 要求：进入画廊页即自动 `hideHeader(HEADER_REASON)`；保留指针近顶部浮现、进入文字区浮现、卸载恢复的既有逻辑。
- 不做：浮现后的二次自动隐藏（观察效果后另议）。

## 实测反馈修正（真机验证后调整，取代上文初稿设计）

- **F1**：header 改为挂载即隐藏，去掉 2.5s 延迟——延迟期间 header 悬挂反而干扰进入沉浸态。
- **F2**：返回入口从左上角浮层移到底部操作条，与页码、"文字 ↓"构成 `← 影集 | 01 / NN | 文字 ↓` 对称布局，样式与交互统一；不再需要与 header 联动淡出。
- **F3**：初稿的"锁定至手势静默"方案实测有两个缺陷——快速连划被全部吞掉导致卡顿；翻页基于 `activeIndex`（滚动途中被 scroll 监听改写）导致偶发回退一张。改为：
  - `targetIndexRef` 作为权威翻页基准，`goToPhoto` 写入，滚动停稳 150ms 后才与实际位置同步；
  - 固定 250ms 冷却取代锁定至静默，冷却到期即恢复累积，使持续快划能按节奏连续翻页；
  - 阈值提高到 100px、加 2px 噪声下限、方向反转时累积清零，保证单次轻扫只翻一张；
  - 移除轨道上的 CSS `scroll-smooth`（与 snap 吸附及程序化平滑滚动互相干扰；平滑行为已由 `getScrollBehavior()` 显式控制，reduced-motion 降级反而更严格）。
- **F4**：详情区 IntersectionObserver 补 else 分支，从文字区滚回照片区时调用 `markBrowsing()` 自动隐藏 header。

## 验收标准

- [x] 触控板单次横向划动（含惯性）恰好前进/后退一张；连续快划流畅连续翻页，无卡顿、无回退。
- [x] 触控板纵向下划从图片区平滑滚到文字区；文字区上划回到画廊。
- [x] 底部操作条呈 `← 影集 | 页码 | 文字 ↓` 对称布局，"← 影集"点击回到 `/gallery`。
- [x] 进入画廊页 header 即隐藏；指针移到页面顶部或滚到文字区时恢复；从文字区滚回照片区再次自动隐藏。
- [x] `prefers-reduced-motion` 下滚动行为仍为 `auto`；键盘导航（←/→/Home/End/↓/Esc）不回归。
- [x] lint / type-check 通过（`.next/types` 中指向已删除 `/blog`、`/tools` 路由的报错为既有问题，与本任务无关）。

## 约束

- 不引入新依赖；沿用 `useSiteChrome`、既有 CSS 变量与设计令牌。
- 视觉/交互的真机确认由用户完成（当前环境无法查看截图）——已于 2026-08-19 验证通过。

## 遗留观察（未处理，留待后续）

- `gallery-experience.tsx` 图片区顶部有一个空的 `aria-hidden` 占位 div（`pointer-events-none absolute inset-x-0 top-0 h-10`），是 `onPointerMove` 上移到 `<article>` 之前的遗留热区，当前无作用，可在后续清理中删除。
- 键盘翻页仍基于 `activeIndex` state，与 wheel 的 `targetIndexRef` 基准不同：长按方向键穿过平滑滚动时会合并按键。属既有行为，未改动。
- `returnToGallery()` 先 `revealHeader()` 再滚回照片区，途中 observer 的 else 分支会再次隐藏，视觉上 header 一闪。终态符合沉浸预期，实测可接受。
