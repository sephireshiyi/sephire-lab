# Sephire Lab 后续方向与架构设计

## 目标

在不写业务代码的前提下，明确 Sephire Lab 下一阶段的产品方向、信息架构与技术架构。站点将调整为一个纯静态个人博客站，由 `Writing`、`Music`、`Gallery`、`About` 四个并列路由模块组成；当前 `Tools` 模块将被 `Gallery` 替换，在线工具类项目后续拆到其他项目中。

本任务只做规划。除非开发者明确说“开始实现”或以其他方式批准进入实现阶段，否则不得修改 `app/`、`components/`、`lib/`、`content/`、配置文件等业务代码。

## 用户价值

- 让 Sephire Lab 从“博客 + 工具”的混合项目，转为方向更清晰的个人静态博客站。
- 保留当前极简、克制、个人站点气质，同时给摄影和音乐内容留出一等入口。
- 在继续实现页面前，先确定路由边界、内容模型、静态化策略和设计稿落地方式。
- 把后续开发拆成小而清晰、可验证的 Trellis 任务。

## 已确认的产品决策

- 站点定位：`Writing`、`Music`、`Gallery`、`About` 四个模块并列的静态个人博客站。
- `Gallery` 替换当前 `Tools`，成为顶级导航与顶级路由模块。
- `Tools` 不再属于这个站点的后续方向；在线工具类能力以后拆到其他项目。
- 旧 `/tools` 直接删除，不保留说明页，不做重定向；新增 `/gallery` 作为替代顶级路由。
- `Writing` 的 canonical route 改为 `/writing`；文章详情 canonical route 对应改为 `/writing/[slug]`。
- 旧 `/blog` 与 `/blog/[slug]` 不保留兼容入口，不做重定向；实现时直接删除旧路由，只保留 `/writing`。
- 纯静态目标：完整支持 Next `output: "export"`，最终站点应能作为一组静态 HTML/CSS/JS/媒体文件部署。
- `Writing` 以文章阅读为导向。
- `Gallery` 是照片集索引页，用来展示多个摄影集/照片系列的入口。
- `Gallery` 的单个照片集详情页应像摄影集一样，以横向浏览为核心。
- 照片集详情页默认视觉导向优先，默认视图除图片外不展示其他内容。
- 照片集中的文字内容不应抢占默认视图；暂定通过下滑/展开显示，不采用点击图片翻转作为核心交互。该交互可在后续设计图明确后再微调。
- 照片集横向浏览采用混合交互：桌面端支持横向滚动/触控板、键盘方向键等辅助操作，移动端支持左右滑动；具体控制显隐以视觉克制为原则。
- 横向浏览时，上一张/下一张照片应在页面左右边缘以低透明度露出一小部分，提示还能继续浏览。
- 桌面端光标靠近页面边缘或相邻照片预览时，对应预览应有放大效果，强化“上一张/下一张”的可发现性。
- 浏览照片时，顶部导航栏应自动向上隐藏，减少界面干扰。
- `Gallery` 相关页面会由开发者提供示例设计图；后续实现应参考设计图来确定具体样式。
- `Music` 索引页应是专辑墙，用于展示喜欢的专辑入口。
- `Music` 单张专辑应有详情页：左侧展示专辑封面，并根据封面主题色生成类似 Apple Music 气质的 fading 背景色；右侧展示音乐信息、播放区域和短评。
- `Music` 详情页的主题色背景与布局会由开发者提供示例设计图；后续实现应参考设计图来确定具体样式。
- `Music` MVP 阶段不播放音频，音乐片段播放能力留到后续阶段再加。
- `Music` MVP 中的播放区域采用非交互视觉占位，不放置会误导用户的假播放按钮；等设计稿出来后再向最终视觉靠拢。
- 下一阶段开发先做不依赖设计稿的基础部分；开发者会并行准备 Gallery / Music 等强视觉页面的设计稿。
- 不依赖设计稿的基础部分包括路由结构、内容模型、静态导出兼容、基础索引/详情页面骨架与必要占位；其中 `/gallery/[slug]` 和 `/music/[slug]` 都应先实现可工作的详情页骨架，用来验证内容模型和静态导出链路。Gallery 详情页和 Music 详情页的高保真视觉与复杂交互等设计稿出来后再贴近实现。
- `Gallery` 与 `Music` 的内容源采用 YAML 数据文件，并在构建期使用 zod 校验；`Writing` 继续使用现有 MDX/frontmatter 管线。
- YAML 用于承载照片集、照片数组、专辑信息、主题色、短评等结构化内容；页面渲染不直接依赖 YAML 格式本身，而是依赖解析并校验后的 TypeScript 数据。
- 基础 MVP 使用最小可验证内容：`Gallery` 至少 1 个照片集、每个照片集至少 5 张图片；`Music` 至少 3 张专辑。素材可先使用真实素材或临时占位素材，但内容结构必须按最终 YAML schema 编写。
- 基础 MVP 的媒体素材先放在仓库 `public/` 目录内随站点静态导出，例如 `public/gallery/<series-slug>/...` 和 `public/music/<album-slug>/cover.jpg`；未来 Gallery 图片规模变大后，再评估外部静态托管/CDN。
- 基础 MVP 的 Gallery 图片只放网页优化图，不提供原图或高分辨率下载入口。YAML 中先记录展示图路径、宽高、alt/说明等展示所需字段。
- 完全静态导出下，图片展示应依赖预先优化好的静态图片文件，不依赖运行时图片优化服务。后续技术设计需处理 `next/image` 默认优化器与静态导出的兼容问题。
- 首页在基础 MVP 中改为四模块入口或四模块摘要，不再只突出 `Recent Writing`。首屏继续保留极简 `Sephire Lab` 气质，下方入口用于体现 `Writing`、`Music`、`Gallery`、`About` 并列结构。
- 站点需要为更精致的交互体验预留空间。首页后续计划加入光标交互动画：以光标为中心的粒子效果，粒子密度从中心向外逐渐降低。该效果会由开发者后续提供设计图；基础 MVP 只预留交互层/组件边界，不实现粒子效果，等设计图交付后作为后续高保真交互任务实现。
- 后续可能继续加入新的交互设计想法，架构上应避免把首页、Gallery、Music 的交互效果硬编码到普通内容组件中。
- 基础 MVP 隐藏当前语言切换控件，不做 i18n；未来如需双语，再单独设计多语言路由、内容字段和翻译流程。
- `About` 基础 MVP 做极简个人说明页：一段个人说明、几个链接/联系方式，以及一句站点说明；不做长履历、时间线或复杂自我介绍。
- 基础 MVP 的全局 header 保留当前左侧 logo，同时保留居中导航与右侧主题控件；语言切换控件按前述决策隐藏。
- 主题策略调整为：`light` / `dark` 作为全站主题；`reader` 收敛为 `Writing` 阅读场景能力，不作为 Gallery / Music / About 的全站视觉模式。
- 基础 MVP 不启用全局 footer；联系方式、链接和站点说明放入 `About`，视觉页面和详情页保持更干净。
- 某些关键页面会由开发者提供 Figma 设计稿；指定页面需要按设计稿实现 CSS 样式。
- 现有首页视觉参考应继续作为气质基准：浅米色/近白背景、顶部导航、`Sephire Lab` 大标题、简洁克制。
- 基础 MVP 后续拆成多个可独立验证的 Trellis 子任务，并在不同 session 中逐个完成；父任务负责保留总需求、任务地图和跨子任务验收。
- 本次 session 的目标是刨根问底并产出规划，不实现功能。
- `prd.md` 使用中文书写；`.trellis/spec/frontend` 的英文要求只约束未来项目规范文档，不约束本规划任务。

## 从仓库确认的事实

- 当前路由：
  - `/`：`app/page.tsx`
  - `/blog`：`app/blog/page.tsx`
  - `/blog/[slug]`：`app/blog/[slug]/page.tsx`
  - `/music`：`app/music/page.tsx`
  - `/tools`：`app/tools/page.tsx`
  - `/about`：`app/about/page.tsx`
- 当前导航位于 `components/layout/site-header.tsx`，显示 `Writing`、`Music`、`Tools`、`About`。
- 当前 `Writing` 导航链接到 `/blog`，也就是说“展示名”和“URL 命名”已经存在分歧。
- `/music`、`/tools`、`/about` 目前是占位 client page。
- `SiteFooter` 组件存在，但当前没有挂到 `app/layout.tsx`。
- 根布局 metadata 标题是 `Sephire Lab`，description 仍写着 `Personal blog, projects, and online tools`，与新方向冲突。
- 项目使用 Next.js `16.2.5`、React `19.2.4`、TypeScript strict mode、Tailwind CSS v4、`next-themes`、Headless UI、Iconify、MDX、gray-matter、zod、remark/rehype 插件。
- MDX 由 `@next/mdx` 配置；`next.config.ts` 允许 `.md` / `.mdx` 作为 page extension。
- 博客内容位于 `content/posts/*.mdx`。
- 博客 frontmatter 在 `lib/content.ts` 中由 zod 做构建期校验。
- 当前文章分类包括 `tech`、`thoughts`、`music`、`photo`。
- 博客详情页使用 `generateStaticParams()` 与 `dynamicParams = false`，未定义 slug 会 404，不走请求时动态生成。
- 当前博客管线已经具备静态预生成的基本形态，但 `next.config.ts` 尚未设置 `output: "export"`。
- 主题模式为 `light`、`dark`、`reader`。
- `/blog` 子树通过 `app/blog/layout.tsx` 局部挂载中文衬线字体，避免非博客页面触发 CJK 字体下载。
- 语言 dropdown 目前只保存本地状态，没有接入 i18n 路由或内容。
- 现有设计参考位于 `design/`，包括 `Home - Light.png`、`Home - Dark.png`、`Home - Read.png` 和 logo 导出。
- 当前首页设计参考图显示：极简首屏、顶部居中导航、右侧主题/语言控件、居中 `Sephire Lab` 标题。
- 当前代码相较设计参考多渲染了左侧 logo。
- 仓库根目录没有 README 或 CONTRIBUTING 文档。
- Trellis frontend spec 文件目前仍是初始化占位内容。
- 当前 git 分支是 `main`；未跟踪的 `codex-home/` 与 `hatch-pet-runs/` 与本规划任务无关。

## 本规划需要定下来的内容

- 站点定位与编辑气质。
- 顶级信息架构与导航顺序。
- `Writing`、`Music`、`Gallery`、`About` 的路由边界。
- `Tools` 的移除/过渡策略。
- “纯静态”的具体技术目标：只是不依赖运行时数据，还是完整兼容 `output: "export"`。
- `Writing`、`Gallery`、`Music` 的内容模型。
- `Gallery` 的照片集详情页交互细节，尤其是文字显示方式与桌面/移动端浏览方式。
- `Music` 的专辑内容模型与未来音频片段扩展边界。
- Figma 到 CSS 的工作流，以及哪些页面必须按设计稿高保真实现。
- 下一阶段 MVP 范围。
- 后续 Trellis 任务拆分方式。

## 本规划不做的事

- 不修改业务代码。
- 不实现 Gallery、Music、路由重命名、静态导出或 CSS。
- 不把 Tools 迁移到新项目。
- 不创建最终 Figma 设计稿。
- 除非它会约束纯静态架构，否则不在本任务里决定最终部署平台。

## 验收标准

- [x] `prd.md` 记录已定需求、范围、非目标、开放问题和下一阶段可验证的验收条件。
- [x] 能从仓库回答的问题都已经通过检查代码、配置、文档或 Trellis 任务回答，不再反问开发者。
- [x] 剩余开放问题只涉及产品意图、范围边界、偏好或风险容忍度。
- [x] 主要产品决策稳定后，创建或更新 `design.md`，记录架构边界、数据流、兼容/迁移策略和关键取舍。
- [x] 进入实现前，创建或更新 `implement.md`，记录有序实现清单、验证命令和风险点。
- [x] 后续工作被拆成可独立验证的 Trellis 子任务，或明确记录为一个下一阶段任务。
- [x] 在明确批准实现前，没有业务代码变更。

## 已解决的问题

- 站点主定位：四个模块并列的静态个人博客站，而不是 Writing-first 博客或工具集合。
- 顶级模块集合：`Writing`、`Music`、`Gallery`、`About`。
- `Tools` 处理方向：由 `Gallery` 替换；在线工具不再纳入本项目。
- 旧 `/tools` 处理：删除旧路由，不保留兼容页，不做重定向；新增 `/gallery`。
- `Writing` 路由命名：使用 `/writing` 作为公开主路径；文章详情使用 `/writing/[slug]`。
- 旧 `/blog` 处理：删除旧路由，不保留兼容页，不做重定向。
- 纯静态策略：以完整静态导出为目标，后续实现需要支持 `output: "export"`，不依赖服务器运行时、数据库或请求时动态生成。
- `Gallery` 内容模型：`/gallery` 是照片集索引页；具体照片集是独立详情页，采用横向摄影集式浏览。
- `Gallery` 详情页默认体验：视觉优先，默认只展示图片；文字暂定通过下滑/展开显示；浏览时导航栏自动向上隐藏。
- `Gallery` 横向浏览交互：采用混合方案；上一张/下一张在页面边缘低透明露出，光标靠近时放大；桌面支持滚动/键盘等辅助操作，移动端支持滑动。
- `Gallery` 样式来源：开发者后续会提供示例设计图，实现时应参考设计图。
- `Music` 内容模型：`/music` 是专辑墙索引页；单张专辑进入独立详情页。
- `Music` 详情页布局：左侧专辑封面，背景根据封面主题色做 fading 效果；右侧是音乐信息、播放区域和短评。该部分后续按开发者提供的示例设计图落地。
- `Music` MVP 范围：展示专辑墙与专辑详情，不播放音频；不引入本地音频文件、外部播放器或第三方嵌入。详情页播放区域先做非交互视觉占位，不放假播放按钮，后续按设计稿调整。
- MVP 节奏：先实现不依赖设计稿的基础架构与页面骨架；基础 MVP 包含 `/gallery`、`/gallery/[slug]`、`/music`、`/music/[slug]` 的可工作骨架，用来跑通内容源、动态路由预生成和静态导出。Gallery / Music 的高保真样式和复杂交互等设计稿完成后再对齐。
- 内容源格式：`Gallery` 与 `Music` 使用 YAML 数据文件 + zod 构建期校验；`Writing` 保持 MDX/frontmatter。当前 `package.json` 已有 `gray-matter` 和 `zod`，但没有单独 YAML parser；实现时需确认用现有依赖解析 YAML 是否足够，或新增解析依赖。
- 基础 MVP 样例内容：`Gallery` 1 个照片集、至少 5 张图片；`Music` 3 张专辑。内容结构按最终 schema 写，素材可临时占位。
- 媒体素材位置：基础 MVP 中 Gallery 图片和 Music 封面放在仓库 `public/`，随完全静态导出一起发布；暂不引入外部 CDN 或对象存储。
- Gallery 图片版本：基础 MVP 只使用网页优化图，不提供原图/高分辨率下载；未来如需高分辨率查看或下载，再单独设计多版本图片策略。
- 首页基础方向：首屏保留极简 `Sephire Lab`，下方改为四模块入口/摘要，而不是只展示 `Recent Writing`。
- 交互设计方向：首页后续需要光标粒子交互动画，粒子以光标为中心、密度向外递减；效果由后续设计图驱动。基础 MVP 只预留交互层或组件边界，不实现粒子效果，避免未来新增交互时大面积改动内容结构。
- 首页粒子效果范围：放到设计图交付之后实现，不进入基础 MVP。
- 语言切换范围：基础 MVP 隐藏当前只保存本地状态的语言 dropdown，不做 i18n；双语能力留作未来独立任务。
- About 基础范围：极简个人说明页，包括一段个人说明、几个链接/联系方式和一句站点说明；不做完整履历或时间线。
- 全局 header：基础 MVP 保留左侧 logo、居中导航、右侧主题控件；隐藏语言切换控件。
- 主题策略：全站只保留 `light` / `dark`；`reader` 不再作为全站主题，而是收敛到 `Writing` 文章阅读场景。
- Footer 策略：基础 MVP 不挂载全局 footer；已有 `SiteFooter` 暂不使用。链接、联系方式和站点说明放入 `About`。
- 任务拆分策略：基础 MVP 不作为一个大实现任务完成，而是拆成多个可独立验证的 Trellis 子任务，并在不同 session 中分别实现。
- 实际 child tasks 已创建：
  - `06-19-route-static-export-shell`
  - `06-19-yaml-content-models-seed-media`
  - `06-19-gallery-skeleton-pages`
  - `06-19-music-skeleton-pages`
  - `06-19-home-about-header-theme-cleanup`
- 规划文档语言：本任务的 `prd.md` 使用中文。

## 待决策问题

- 暂无阻塞基础 MVP 拆分的产品决策。后续每个 child task 在自己的 session 中按对应 `prd.md` 继续细化并实现。

## 最终集成验收（2026-08-01）

- [x] 9 个 child task 均已完成并归档。
- [x] 最终路由为 `/`、`/writing`、`/writing/[slug]`、`/gallery`、`/gallery/[slug]`、`/music`、`/music/[slug]`、`/about`；旧 `/blog` 与 `/tools` 不存在。
- [x] 全局导航为 `Writing`、`Music`、`Gallery`、`About`；全站只暴露 Light/Dark 主题，未挂载全局 Footer。
- [x] 首页包含四模块入口，About 已从占位页升级为极简说明页，Gallery 种子照片集包含 5 张图片。
- [x] Music 后续子任务在原 MVP 规划之上完成 4 张专辑目录化与本地 MP3 播放；该扩展经过独立验收，不视为父任务范围漂移。
- [x] ESLint 通过；隔离副本中的 TypeScript 与 Next 静态构建通过，共生成 14 个静态页面。
- [x] 静态产物包含 Writing、Gallery、4 个 Music 详情路由及对应 MP3，且不包含 `/blog`、`/tools`。
- [x] 开发者批准归档父任务。

非阻塞后续：About 中的 `hello@example.com` 与 GitHub 首页仍是内容占位链接，待真实联系方式确定后替换或移除；开发者确认该项不阻塞本父任务归档。Gallery 高保真横向浏览、首页粒子效果等仍按原规划作为未来独立任务处理。
