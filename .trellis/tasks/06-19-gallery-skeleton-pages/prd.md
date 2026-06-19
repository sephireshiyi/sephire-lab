# Gallery 骨架页面

## 目标

实现 `/gallery` 和 `/gallery/[slug]` 的基础可工作骨架，用来验证照片集内容模型、动态路由预生成和完全静态导出链路。高保真横向摄影集体验留到设计稿交付后实现。

## 父任务

- `.trellis/tasks/06-18-site-direction-architecture`

## 前置任务

- `06-19-route-static-export-shell`
- `06-19-yaml-content-models-seed-media`

## 需求

- `/gallery` 是照片集索引页，展示多个照片集入口；基础 MVP 可先只有 1 个照片集。
- `/gallery/[slug]` 是照片集详情页骨架。
- `generateStaticParams` 枚举所有照片集 slug。
- 详情页展示至少 5 张网页优化图。
- 详情页可展示基础标题、摘要、照片说明，但默认不追求最终视觉。
- 为后续横向摄影集交互预留组件边界。
- 浏览时导航自动隐藏、左右边缘低透明预览、hover 放大、文字下滑/展开等高保真交互不进入本任务。

## 非目标

- 不做设计稿驱动的 Gallery 高保真样式。
- 不实现复杂横向浏览交互。
- 不实现原图/高分辨率下载。
- 不改 Music 页面。

## 验收标准

- [ ] `/gallery` 能列出照片集。
- [ ] `/gallery/[slug]` 能显示对应照片集。
- [ ] 详情页能渲染至少 5 张图片。
- [ ] 未定义 slug 在静态路由边界内按预期处理。
- [ ] 页面使用 YAML loader 的校验后数据。
- [ ] `pnpm lint` 通过。
- [ ] `pnpm build` 通过。

## 后续任务

设计稿交付后，再创建 Gallery 高保真横向摄影集体验任务。
