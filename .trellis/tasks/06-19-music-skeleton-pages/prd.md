# Music 骨架页面

## 目标

实现 `/music` 和 `/music/[slug]` 的基础可工作骨架，用来验证专辑内容模型、动态路由预生成和完全静态导出链路。高保真 Apple Music 式视觉和真实音频播放留到后续任务。

## 父任务

- `.trellis/tasks/06-18-site-direction-architecture`

## 前置任务

- `06-19-route-static-export-shell`
- `06-19-yaml-content-models-seed-media`

## 需求

- `/music` 是专辑墙索引页，基础 MVP 展示 3 张专辑。
- `/music/[slug]` 是单张专辑详情页骨架。
- `generateStaticParams` 枚举所有专辑 slug。
- 详情页展示专辑封面、标题、艺术家、年份、短评。
- 详情页保留非交互播放区域视觉占位，但不放会误导用户的假播放按钮。
- 不引入本地音频文件、外部播放器或第三方嵌入。
- 后续按设计稿实现封面主题色 fading 背景和最终播放区域视觉。

## 非目标

- 不做真实音频播放。
- 不做 Apple Music 式高保真背景。
- 不做第三方音乐服务嵌入。
- 不改 Gallery 页面。

## 验收标准

- [ ] `/music` 能展示 3 张专辑。
- [ ] `/music/[slug]` 能展示对应专辑详情。
- [ ] 详情页存在非交互播放区域占位。
- [ ] 页面中不存在可点击但不能播放的假播放按钮。
- [ ] 页面使用 YAML loader 的校验后数据。
- [ ] `pnpm lint` 通过。
- [ ] `pnpm build` 通过。

## 后续任务

设计稿交付后，再创建 Music 高保真详情页视觉任务；音频播放能力另拆独立任务。
