# Sephire Lab 基础 MVP 架构设计

## 架构目标

Sephire Lab 后续作为完全静态导出的个人博客站运行，顶级模块为 `Writing`、`Music`、`Gallery`、`About`。基础 MVP 先完成不依赖设计稿的路由、内容模型、静态导出和页面骨架；Gallery / Music 的高保真视觉、首页粒子交互等设计稿驱动能力后续单独实现。

父任务只承载规划与跨子任务验收，不作为直接实现任务。基础 MVP 将拆成多个 Trellis child tasks，在不同 session 中逐个完成。

## 路由边界

- `/`：首页。首屏保留极简 `Sephire Lab`，下方改为四模块入口/摘要。
- `/writing`：Writing 索引页，替代当前 `/blog`。
- `/writing/[slug]`：Writing 文章详情页，替代当前 `/blog/[slug]`。
- `/gallery`：照片集索引页。
- `/gallery/[slug]`：照片集详情页骨架。基础 MVP 跑通内容与静态生成；高保真横向摄影集交互等设计稿后实现。
- `/music`：专辑墙索引页。
- `/music/[slug]`：专辑详情页骨架。基础 MVP 展示封面、信息、短评和非交互播放占位；高保真 Apple Music 式主题色背景等设计稿后实现。
- `/about`：极简个人说明页。

旧 `/blog`、`/blog/[slug]`、`/tools` 均直接删除，不保留兼容入口，不做重定向。

## 静态导出策略

项目目标是完整支持 Next `output: "export"`。所有动态路由必须通过构建期数据枚举生成，不能依赖请求时动态生成、服务器运行时、数据库或 API。

实现时需要特别处理图片：

- 媒体素材基础 MVP 先放在 `public/`，随静态站点一起发布。
- Gallery 图片只使用网页优化版本，不提供原图/高分辨率下载。
- 图片应预先优化为适合网页展示的静态文件。
- `next/image` 默认运行时优化器与静态导出不兼容，后续实现需配置 `images.unoptimized`、使用兼容 loader，或对 Gallery/Music 使用普通静态图片渲染策略。

## 内容模型

Writing 继续使用现有 MDX/frontmatter 管线，但公开路由改为 `/writing`。实现时可选择同步把内容目录从 `content/posts` 迁到更语义化的 `content/writing`，也可以先保留现有目录以降低第一步风险；公开 URL 以 `/writing` 为准。

Gallery 与 Music 使用 YAML 数据文件 + zod 构建期校验。页面组件不直接依赖 YAML，而依赖解析并校验后的 TypeScript 数据。

建议目录：

```text
content/
  gallery/
    <series-slug>.yaml
  music/
    <album-slug>.yaml
public/
  gallery/
    <series-slug>/
      <image>.jpg
  music/
    <album-slug>/
      cover.jpg
```

Gallery schema 至少覆盖：

- `slug`
- `title`
- `date` 或 `year`
- `cover`
- `summary`
- `photos[]`
- 每张照片的 `src`、`width`、`height`、`alt`、可选 `caption` / `note`

Music schema 至少覆盖：

- `slug`
- `title`
- `artist`
- `year`
- `cover`
- `themeColor` 或后续主题色字段
- `note`
- 可选 `tracks` / `playbackPlaceholder`

基础 MVP 样例内容：

- Gallery：1 个照片集，至少 5 张图片。
- Music：3 张专辑。

## 全局外壳

- Header 保留左侧 logo、居中导航、右侧主题控件。
- 导航为 `Writing`、`Music`、`Gallery`、`About`。
- 语言切换控件基础 MVP 隐藏，不做 i18n。
- 不挂载全局 footer；About 承载链接、联系方式和站点说明。
- 全站主题仅保留 `light` / `dark`；`reader` 收敛为 Writing 文章阅读场景能力。

## 交互边界

基础 MVP 只实现页面骨架与必要导航，不追高保真交互。

后续设计稿驱动能力包括：

- 首页光标粒子交互，以光标为中心，粒子密度向外递减。
- Gallery 详情页横向摄影集式体验、导航自动隐藏、左右边缘低透明预览、hover 放大、文字下滑/展开。
- Music 详情页封面主题色 fading 背景、播放区域最终视觉和后续音频能力。

基础 MVP 可以预留交互层或组件边界，但不实现粒子效果和复杂摄影集交互。

## 兼容与迁移

- 删除 `/blog` 和 `/tools` 会导致旧地址 404，这是已接受的决策。
- `metadata.description` 需要移除 online tools 叙述，改为匹配新站点定位。
- 当前 `SiteFooter` 暂不使用。
- 当前语言 dropdown 暂时隐藏；未来 i18n 作为独立任务规划。
- 当前 reader 主题不再全站暴露；Writing 侧如何触发 reader 需要在具体 child task 中设计最小方案。

## 风险与取舍

- 完全静态导出会限制 Next 运行时能力，尤其是图片优化与动态路由。
- YAML 更适合手写内容，但缩进和特殊字符容易出错，所以 zod 构建期校验是硬要求。
- Gallery / Music 先做骨架会牺牲第一版视觉完整度，但能尽早验证内容模型和静态导出。
- 设计稿后再做高保真交互可以减少返工，也让基础 MVP 更稳。
