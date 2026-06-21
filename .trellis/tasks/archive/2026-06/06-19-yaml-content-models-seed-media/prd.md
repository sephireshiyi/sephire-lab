# YAML 内容模型与种子媒体

## 目标

为 Gallery 和 Music 建立 YAML 内容源、zod 构建期校验、类型安全 loader 和基础 MVP 种子内容/媒体目录。

## 父任务

- `.trellis/tasks/06-18-site-direction-architecture`

## 前置任务

- `06-19-route-static-export-shell`

## 需求

- 建立 Gallery YAML 内容模型。
- 建立 Music YAML 内容模型。
- 使用 zod 在构建期校验 YAML 数据。
- 页面组件消费解析并校验后的 TypeScript 数据，不直接依赖 YAML 原始结构。
- 建立 `public/gallery/<series-slug>/...` 媒体目录约定。
- 建立 `public/music/<album-slug>/cover.jpg` 媒体目录约定。
- 添加基础 MVP 种子内容：
  - Gallery 1 个照片集。
  - 该照片集至少 5 张网页优化图。
  - Music 3 张专辑。
- Gallery 图片只使用网页优化图，不提供原图/高分辨率下载入口。
- 确认 YAML parser 策略：复用现有依赖是否足够，或新增轻量解析依赖。

## 建议字段

Gallery 至少包含：

- `slug`
- `title`
- `date` 或 `year`
- `cover`
- `summary`
- `photos[]`
- 每张照片的 `src`、`width`、`height`、`alt`、可选 `caption` / `note`

Music 至少包含：

- `slug`
- `title`
- `artist`
- `year`
- `cover`
- `themeColor`
- `note`
- 可选 `tracks` / `playbackPlaceholder`

## 非目标

- 不实现 Gallery 页面。
- 不实现 Music 页面。
- 不接入音频播放。
- 不做高保真视觉或交互。

## 验收标准

- [ ] Gallery YAML 能被读取并通过 zod 校验。
- [ ] Music YAML 能被读取并通过 zod 校验。
- [ ] Gallery loader 能返回照片集列表和单个照片集。
- [ ] Music loader 能返回专辑列表和单张专辑。
- [ ] 示例 Gallery 内容包含至少 5 张网页优化图。
- [ ] 示例 Music 内容包含 3 张专辑。
- [ ] 无效 YAML/schema 能在构建或 loader 调用时报错。
- [ ] `pnpm lint` 通过。
- [ ] `pnpm build` 通过。

## 后续依赖

完成后进入 `06-19-gallery-skeleton-pages` 和 `06-19-music-skeleton-pages`。
