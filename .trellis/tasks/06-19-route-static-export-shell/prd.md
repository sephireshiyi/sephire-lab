# 路由与静态导出基础

## 目标

完成 Sephire Lab 基础 MVP 的路由重命名、旧路由删除、导航更新和完全静态导出基础配置。该任务是后续 Gallery / Music / 首页整理任务的前置任务。

## 父任务

- `.trellis/tasks/06-18-site-direction-architecture`

## 需求

- 将公开 Writing 路由从 `/blog` 改为 `/writing`。
- 将文章详情路由从 `/blog/[slug]` 改为 `/writing/[slug]`。
- 删除旧 `/blog`、`/blog/[slug]`、`/tools` 路由，不保留兼容入口，不做重定向。
- 更新全局导航为 `Writing`、`Music`、`Gallery`、`About`。
- 新增 `/gallery` 基础入口占位，以替代 `/tools`。
- 更新 root metadata，移除 `online tools` 相关表述。
- 配置并验证项目兼容完整静态导出目标。
- 处理静态导出下图片优化的基础配置风险，例如 `next/image` 默认优化器与 `output: "export"` 的兼容问题。

## 非目标

- 不实现 Gallery / Music 的 YAML 内容模型。
- 不实现 Gallery / Music 详情页骨架。
- 不做首页四模块入口改版。
- 不做 About 内容改版。
- 不做设计稿驱动的视觉或交互。

## 验收标准

- [ ] `/writing` 可访问并展示现有 Writing 列表内容。
- [ ] `/writing/[slug]` 可访问现有文章详情。
- [ ] 应用路由中不再存在 `/blog`、`/blog/[slug]`、`/tools`。
- [ ] 导航显示 `Writing`、`Music`、`Gallery`、`About`，且链接指向新路由。
- [ ] metadata 不再描述 online tools。
- [ ] `pnpm lint` 通过。
- [ ] `pnpm build` 通过。
- [ ] 若启用 `output: "export"`，构建后能生成静态导出产物。

## 后续依赖

完成后进入 `06-19-yaml-content-models-seed-media`。
