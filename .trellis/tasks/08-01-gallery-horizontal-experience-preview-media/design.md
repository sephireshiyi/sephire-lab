# Gallery 横向摄影集技术设计

## 设计目标

在不破坏静态内容管线的前提下，把 Gallery 详情页拆成“构建期数据边界 + 客户端浏览交互 + 通用站点外壳状态”三层。照片仍由 YAML 与本地媒体驱动；客户端只接收已经校验且可序列化的数据，不读取文件系统，也不重新解释 YAML。

开发者已确认没有外部 Gallery 设计稿。以下原创方案及其可量化的几何、颜色、状态和输入契约就是本任务的高保真验收基线；实现阶段通过浏览器视觉验收微调参数，但不另等设计稿。

## 现有边界

- `app/gallery/[slug]/page.tsx`：Server Component，负责静态参数、读取 Gallery、输出页面入口。
- `lib/gallery.ts`：Gallery YAML 的唯一 schema、校验与读取边界。
- `content/gallery/kyoto-autumn.yaml`：照片顺序与展示元数据的事实来源。
- `public/gallery/kyoto-autumn/`：随静态导出发布的网页图片。
- `components/layout/site-header.tsx`：全局固定 Header，目前无页面级显示状态。
- `app/layout.tsx`：根布局与统一 Header 顶部空间。

## 目标组件边界

```text
content/gallery/*.yaml + public/gallery/**
                 │ build-time read + zod validation
                 ▼
            lib/gallery.ts
                 │ typed Gallery
                 ▼
app/gallery/[slug]/page.tsx  (Server Component)
                 │ serializable Gallery props
                 ▼
components/gallery/gallery-experience.tsx  (Client Component)
        ├─ native horizontal scroll + active-photo state
        ├─ wheel / keyboard / pointer affordances
        ├─ caption/details reveal
        └─ generic site-header visibility request
                 │
                 ▼
components/layout/site-chrome-context.tsx + site-header.tsx
```

### Server / client 责任

- Server page 保留 `dynamicParams = false`、`generateStaticParams()` 与 `getGalleryBySlug()`；它不持有浏览状态。
- `GalleryExperience` 接收 `Gallery`（或仅需要的字段）作为 props。类型从 `lib/gallery.ts` 导入，不复制 schema/interface。
- Client Component 不 import `node:fs`、YAML parser 或 loader 函数；静态 HTML 仍由 Next 预渲染，交互在 hydrate 后增强。
- 当前 schema 已足够：活动键使用 `photo.src`，不新增 `id`；只有实际实现证明存在稳定标识或内容缺口时才提议变更 schema。

## 页面结构与几何

### 视口舞台

- 详情根节点用与首页相同的负 `--header-height` 外边距抵消根 `<main>` 顶部空间，使摄影集舞台占满 `100dvh`，Header 以覆盖层出现/隐藏，切换时不推动照片。
- 舞台内保留 Header 安全区，活动照片的基线建议：桌面最大高度约 `72–76dvh`、最大宽度约 `72–78vw`；移动端最大高度约 `66–72dvh`、最大宽度约 `84–88vw`。
- 图片使用声明的真实 `width` / `height` 和 `object-contain`，不使用 `fill + object-cover`；最终渲染宽度由宽高比、视口上限共同决定。
- 横向轨道使用原生 `overflow-x: auto`、隐藏视觉滚动条、`scroll-snap-type: x mandatory`；每项 `scroll-snap-align: center` 与 `scroll-snap-stop: always`。
- 首尾增加可计算的 inline padding/spacer，使第一张和最后一张也能对齐视口中心；不能依赖固定第一张比例。

### 相邻预览与活动状态

- 轨道项之间保留约 `4–8vw` 的节奏空间，并让当前照片两侧各有约 `6–10vw` 的下一张/上一张可见提示；精确值通过桌面与移动浏览器验收收敛。
- 活动照片 `opacity: 1`、`scale: 1`；相邻照片基线约 `opacity: 0.28–0.42`，其他离屏项无需额外渲染效果。
- 指针 hover 相邻照片时，只将其提高到约 `opacity: 0.55–0.7` 并放大约 `1.015–1.025`；transform 不参与布局，避免 snap 坐标改变。
- 点击相邻照片调用该项的 `scrollIntoView({ inline: "center" })`。当前项不把整张照片变成信息开关，避免意外操作。
- 活动项按“元素中心距滚动容器中心最近”计算。scroll handler 只在 `requestAnimationFrame` 中读取位置并在索引实际改变时更新 state；不为每一像素更新 React state。

## 输入契约

| 输入 | 默认行为 | 边界行为 |
|---|---|---|
| 触控板水平手势 | 保留浏览器原生 `deltaX` 与惯性 | 首尾自然停止 |
| 鼠标纵向滚轮 / 触控板主纵向手势 | 指针位于舞台且详情关闭时，把主要 `deltaY` 映射到 `scrollLeft` | 已到首尾且继续向外时不 `preventDefault`，允许页面纵向离开舞台 |
| `ArrowLeft` / `ArrowRight` | 切到上一张 / 下一张并聚焦摄影集 | 首尾保持当前项，不循环 |
| `Home` / `End` | 到首张 / 末张 | 不改变页面路由 |
| `ArrowDown` | 打开详情并滚到详情区 | 详情已开时保留原生纵向行为 |
| `Escape` | 关闭详情（若已开）并恢复 Header | 不退出路由、不进入全屏模式 |
| 移动端触摸 | 原生 pan-x、惯性与 scroll snap | 允许明显纵向手势进入详情区，不实现 JS 拖拽 |

wheel listener 使用 `{ passive: false }`，但仅在确实消费横向浏览时阻止默认行为；`ctrlKey` 等浏览器缩放手势不得拦截。按 `deltaMode` 归一化滚轮单位，避免不同鼠标速度失控。

## 活动状态与 Header 状态机

### Gallery 本地状态

- `activeIndex`：当前距视口中心最近的照片。
- `detailsOpen`：详情区是否被显式打开。
- `browseIntent`：自最近一次横向输入后是否处于专注浏览状态。
- 其余信息（是否首尾、活动 caption/note、计数）由上述 state 与 props 派生，不重复存储。

### 通用 Header 协议

- 新增轻量 `SiteChromeProvider` / `useSiteHeaderVisibility`（最终命名按现有目录风格确定），由根布局包住 `SiteHeader` 与 `<main>`。
- API 表达通用的 `hideHeader(reason)` / `showHeader(reason)` 或等价注册/释放语义；Gallery 不直接 query/mutate Header DOM，也不写 `document.body` class。
- Header 只消费“当前是否有隐藏请求”，使用 `transform` 与 `opacity` 过渡；保留 DOM、导航焦点和布局高度，避免页面跳动。
- Gallery 在首次水平 wheel、方向键、相邻图点击或 touch 浏览后发出隐藏请求。
- 打开详情、`Escape`、指针进入顶部恢复区或 Header 获得键盘焦点时释放隐藏请求；组件卸载必须释放自己的 reason。
- Provider 的实现需避开仓库已知的 `setState`-inside-effect lint 禁止模式；状态变化来自用户事件/注册 API，effect 只负责事件订阅与清理。
- 其他页面不发出隐藏请求，因此现有 Header 行为不变。

## 文字详情设计

- 舞台只显示低对比的 `当前序号 / 总数` 与原生 `<button>` 详情入口；照片集标题使用视觉隐藏 heading 保留文档结构。
- 详情入口控制舞台下方的 `<section id="gallery-details">`，设置 `aria-expanded`、`aria-controls`。
- 详情区包含照片集标题、格式化日期、summary，以及当前照片的 caption/note；字段缺失时省略对应节点。
- 打开详情时显示 Header，并把详情区滚入视口；关闭/回到舞台时将焦点恢复到详情按钮或摄影集容器。
- 摄影集容器可聚焦，使用 `aria-roledescription="carousel"`；每张图保留语义 `<figure>`，声明 `n / total` 的位置语义。活动变化的计数使用克制的 polite live region，避免重复朗读全部说明。

## 动效与 reduced motion

- 默认使用短时、低幅度的 opacity / transform 过渡和浏览器平滑滚动；不使用弹簧、视差或持续动画。
- `prefers-reduced-motion: reduce` 时：`scroll-behavior: auto`、取消图片 scale 与 Header 位移动画，Header 改为即时显示/隐藏或仅无位移淡变；snap 和 opacity 状态仍保留。
- 不用动画计时器决定活动索引或 Header 是否可操作。

## 图片生成与发布管线

### 生成策略

- 实现阶段按 `imagegen` skill 使用内置 `image_gen`，每个不同场景单独调用一次，不用单一 prompt 的 `n` 冒充不同资产。
- 统一 prompt 骨架：`photorealistic-natural`、编辑旅行摄影、京都深秋、真实自然材质、低饱和红/赭色、阴天或金色时刻、安静无人/少人且不可识别、无文字/logo/水印、无具名摄影师模仿。
- 七个场景分别明确构图与朝向；生成后逐张视觉检查主体、季节、色调、摄影真实感、伪文字/水印和系列一致性。单张不合格只做一次针对性重生成，不改动已通过资产。

### 本地资产

- 选定输出必须从 imagegen 默认保存位置复制/移动到仓库；项目引用不能指向 `$CODEX_HOME`。
- 最终沿用仓库已有的 JPEG 发布格式，命名 `01.jpg` … `07.jpg`。本机现有 `sips` 可写 JPEG 但不能写 WebP，且仓库没有 `cwebp`、ImageMagick 或 Sharp；为避免只为格式新增依赖，使用质量 85 转换。最终长边为 1402–1536px、sRGB；生成源比例按 3:2、2:3、3:2、1:1、4:5、1:1、3:2 组织。
- 转换后读取最终文件真实尺寸，再更新 YAML；禁止按预期比例手填尺寸。
- `01.jpg` … `05.jpg` 已由新照片直接替换，并新增 `06.jpg`、`07.jpg`；imagegen 原始 PNG 保留在默认生成目录，Git 仍可恢复旧占位素材。

## Light / Dark 与视觉变量

- 页面背景、文字、详情按钮、计数和 focus ring 复用现有 `--bg-*`、`--text-*`、`--border-color`、`--accent-color`。
- 不给照片套随主题改变的滤镜；Dark 下只调整舞台底色和控制层对比。
- 新增布局尺寸时优先用局部 CSS custom properties；若需要全局容器 token，遵守 `.trellis/spec/frontend/quality-guidelines.md`，不得使用会与 spacing 冲突的 `max-w-2xs…5xl`。

## 静态导出与兼容

- 保持 `next/image` + 全局 `images.unoptimized: true`，图片全部为本地公开路径。
- 保持 Server page 构建期枚举与 zod 校验，输出不依赖 runtime API、cookies、headers 或外部服务。
- 新 Client Component 可以增强输入，但首个静态 HTML 仍包含全部图片与可访问文本结构。
- `/gallery` 只因 `cover` 文件名改变而随 YAML 自动更新，不另做索引布局重构。

## 风险与取舍

- **垂直 wheel 与详情滚动冲突**：只在中间照片且详情关闭时消费 wheel；首尾向外滚动和显式详情按钮保留纵向出口。
- **混合比例导致相邻图露出不一致**：按真实宽高比计算渲染尺寸，并通过首尾 spacer 与响应式 gap 收敛，不把图片裁成统一卡片。
- **Header 全局状态污染**：使用带 reason/清理语义的 Provider，Gallery 卸载释放请求；不通过全局 DOM class 偷渡状态。
- **生成素材风格漂移**：统一 prompt 母版、逐场景调用、逐张验收，并以整套缩略图接触表检查系列一致性。
- **大媒体增加仓库/导出体积**：仅保留最终网页版本，限制长边和压缩质量，不提交废弃变体或原始超大文件。
- **原创高保真参数需要实机收敛**：以本设计的可量化几何、状态与浏览器矩阵作为基线，在浏览器视觉验收中调整间距、露出和透明度，并把最终值写回任务记录。

## 回滚

- 交互回滚：恢复 `app/gallery/[slug]/page.tsx` 的纵向 Server Component，删除 Gallery Client Component；YAML/loader 无需回滚。
- Header 回滚：移除 Provider 接线并恢复 `SiteHeader` 固定可见样式，其他路由无数据迁移。
- 素材回滚：Git 恢复原 5 张 JPEG 和原 YAML；索引封面随 `cover` 一并恢复。
- 整体不涉及数据库、远端状态或不可逆迁移。
