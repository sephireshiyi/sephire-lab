# Music 专辑目录化 + 本地 MP3 播放

## 目标

把 Music 的内容模型从「扁平 YAML + 分离媒体目录」迁移为**每张专辑一个自包含源文件夹**，并在专辑详情页支持播放文件夹内的本地 MP3 片段。`content/music/` 成为唯一内容源，媒体（封面 / MP3）通过确定性发布步骤进入 `output: "export"` 的静态导出结果。

## 父任务

- `.trellis/tasks/06-18-site-direction-architecture`
- 关联（只继承视觉、不扩展）：`.trellis/tasks/06-24-music-visual-redesign`

## 背景

- 当前 loader（`lib/music.ts`）按 `content/music/<slug>.yaml` 扫描，封面手工放在 `public/music/<slug>/cover.jpg`——存在两套需人工同步的媒体真值。
- 06-24 视觉任务明确排除真实音频，播放是独立任务（即本任务）。
- 用户已提供 4 个专辑文件夹（Bon Iver、Neutral Milk Hotel、Sufjan Stevens、万能青年旅店），每个含文件夹内 YAML、`cover.jpeg`、1 个 MP3。这些用户提供的媒体是**输入**，不得下载替换、覆盖或丢弃（web-safe 重命名除外）。
- Daft Punk、Radiohead 是早期视觉占位数据，用户已确认**舍弃**，不迁移。

## 需求

### R1 统一专辑目录结构
所有专辑为 `content/music/<album-slug>/`，包含：文件夹内 YAML（唯一 manifest，固定名 `album.yaml`）、封面、可选 MP3。`content/music/` 是唯一内容源，禁止再要求人工同步第二套媒体目录。

### R2 删除占位专辑（用户已确认）
删除 `content/music/daft-punk-discovery.yaml`、`content/music/radiohead-in-rainbows.yaml`，及 `public/music/` 下 daft-punk-discovery、radiohead-in-rainbows、bon-iver-for-emma-forever-ago 的旧封面。最终站点为用户提供的 4 张专辑。

### R3 确定性媒体发布（静态导出兼容）
构建前脚本把专辑目录中的媒体镜像到 `public/music/<slug>/`，使封面和 MP3 进入静态导出产物并可直接 URL 访问。`public/music/` 为生成产物（gitignore），镜像语义须清理孤儿文件。

### R4 loader 发现并校验文件夹
loader（`lib/music.ts`）改为发现 `content/music/*/album.yaml` 并校验；公开 URL 由 loader 派生（`coverUrl` / `audioUrl`），YAML 只存相对文件名。

### R5 显式音频契约
`TrackSchema` 增加**可选、显式**的 `audio` 字段（相对文件名）；不依赖任意下载文件名猜测 URL。无 MP3 的曲目 / 专辑仍合法。

### R6 无音频专辑不破损
没有 MP3 的专辑合法，详情页不渲染空的 / 损坏的播放器。

### R7 播放器 MVP
可访问的原生 `<audio controls preload="metadata">`，**禁止自动播放**，不引入第三方播放器，不做自定义全局播放器。只对有 `audio` 字段的曲目渲染播放器。

### R8 视觉与主题
保持当前 Music 页视觉、Light/Dark 主题与响应式布局不变。唯一新增的视觉规则：**曲目名过长时单行截断、省略号收尾**（CSS `truncate`），时长列不被挤压。

### R9 slug 规范
- slug 字符集统一为 `^[a-z0-9-]+$`（小写 ASCII）。
- 修正拼写：`neutural-milk-hotel-...` → `neutral-milk-hotel-in-the-aeroplane-over-the-sea`。
- 中文专辑改用英文 slug（用户已确认）：`万能青年旅店-冀西南林路行` → `omnipotent-youth-society-inside-the-cable-temple`（乐队官方英文名 + 专辑官方英文名）；YAML 的 `title` / `artist` 保留中文。
- MP3 重命名为稳定 web-safe 名（小写、连字符）。

### R10 校验与错误信息
校验：目录名与 YAML slug 一致、每目录恰好一个 `album.yaml`、cover/audio 引用文件存在且不越出专辑目录、封面扩展名限 jpg/jpeg/png/webp、slug 不重复且符合字符集。失败时给出指名文件 / 专辑的可操作错误，在 build 时失败。

### R11 不新增媒体
不下载任何新音频，不替换用户已有媒体（重命名 = 移动，允许）。

## 验收标准

- [x] A1 `/music` 从文件夹内 `album.yaml` 发现并展示全部 4 张专辑。
- [x] A2 每张专辑详情页能播放其本地 MP3（原生控件，无自动播放）。
- [x] A3 无音频专辑 / 无 `audio` 字段的曲目不出现空播放器或报错（用临时去掉 audio 字段验证）。
- [x] A4 封面与 MP3 存在于静态导出产物（`out/`）并可直接 URL 访问。
- [x] A5 非法 / 缺失媒体引用触发指名专辑的校验错误。
- [x] A6 超长曲目名（Sufjan 样例）单行截断显示省略号，布局不破。
- [x] A7 ESLint 通过。
- [x] A8 build / 静态导出仅在 `/tmp` 副本（排除 `.git`、`node_modules`、`.next`、`out`）运行并通过；未在主工作目录运行 build。
- [x] A9 浏览器验证通过：Music 页面视觉与音频交互均由开发者确认。
- [x] A10 专辑目录与媒体发布约定已写入 `.trellis/spec/frontend/music-content-model.md`。
- [x] A11 本任务实现提交仅包含任务范围内文件，未推送。

## 非目标

- 自定义 / 全局播放器、播放列表、跨曲目连播。
- 音频转码、波形、歌词同步。
- 运行时服务器或第三方播放器依赖。
- Gallery / Writing / About 改动。
