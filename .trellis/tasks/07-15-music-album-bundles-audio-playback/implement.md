# 实施计划：Music 专辑目录化 + 本地 MP3 播放

前置：本任务经 `task.py start` 激活；实现前运行 `trellis-before-dev` 加载 frontend spec。

## Step 0 — 保护现场（只读检查）

- [ ] `git status --short` 确认用户提供的 4 个专辑文件夹仍在；全程不覆盖 / 不删除用户媒体（唯一例外：web-safe 重命名的 `git mv` / `mv`）。
- [ ] 记录 4 张专辑清单作为核对表。**全程禁止 `git clean`**（用户媒体目前 untracked）。

## Step 1 — 删除占位数据（用户已确认）

- [ ] `git rm content/music/daft-punk-discovery.yaml content/music/radiohead-in-rainbows.yaml`
- [ ] `git rm -r public/music/daft-punk-discovery public/music/radiohead-in-rainbows public/music/bon-iver-for-emma-forever-ago`

## Step 2 — schema 与 loader（`lib/music.ts`）

- [ ] `TrackSchema` 加可选 `audio`（相对文件名）；`cover` 语义改为相对文件名，扩展名校验 jpg/jpeg/png/webp。
- [ ] 重写发现逻辑：扫一级子目录 → 每目录恰好一个 `album.yaml` → zod 校验。
- [ ] 校验：slug=目录名、slug 唯一、slug `^[a-z0-9-]+$`、cover/audio 文件存在、`path.resolve` 防越界、根下散落 YAML 报错。
- [ ] 派生 `coverUrl` / `audioUrl`（集中在一个派生函数）；导出类型带派生字段。
- [ ] 错误信息统一格式：`Invalid album "<dir>": <原因>`。
- 验证：临时 node 脚本调用 `getAllAlbums()` 打印 4 张专辑与派生 URL；构造坏样例（缺封面 / slug 不匹配 / 双 YAML）确认报错指名目录（验完删除样例）。

## Step 3 — 内容迁移（4 张专辑）

- [ ] `git mv`（untracked 目录用 `mv`）：`neutural-...` → `neutral-milk-hotel-in-the-aeroplane-over-the-sea`；`万能青年旅店-冀西南林路行` → `omnipotent-youth-society-inside-the-cable-temple`。
- [ ] 各专辑 YAML 改名 `album.yaml`；slug 与目录名对齐；`cover` 改相对文件名（`cover.jpeg`）。
- [ ] MP3 重命名 web-safe：`flume.mp3`（已合规）、`oh-comely.mp3`、`the-black-hawk-war.mp3`、`shan-que.mp3`；对应 track 加 `audio:` 字段。
- [ ] 清理专辑目录与 `content/music/` 下 `.DS_Store`（确认 `.gitignore` 覆盖）。
- 验证：Step 2 清单核对——4 张专辑全部通过校验，audio 字段与实际文件一一对应。

## Step 4 — 媒体同步脚本

- [ ] `scripts/sync-music-media.mjs`：镜像 `content/music/<slug>/`（除 `*.yaml`、`.DS_Store`）到 `public/music/<slug>/`，含孤儿清理。
- [ ] `package.json` 加 `predev` / `prebuild`；`.gitignore` 加 `public/music/`；`git rm -r --cached public/music`（若 Step 1 后仍有残留跟踪项）。
- 验证：跑脚本两次（幂等）；手动放一个孤儿文件确认被清除。

## Step 5 — 页面（`app/music/page.tsx`、`app/music/[slug]/page.tsx`）

- [ ] 两页改用 `coverUrl`。
- [ ] 详情页：有 `audioUrl` 的曲目行下渲染 `<audio controls preload="metadata">` + aria-label；无音频曲目零变化。
- [ ] 曲目名单行截断：`truncate` + `min-w-0`，时长列不被挤压（用 Sufjan 超长曲名目检）。
- 验证：dev 起服务，检查有音频与无音频曲目的 DOM、截断效果。

## Step 6 — 质量检查

- [ ] `pnpm lint`。
- [ ] 复制排除 `.git node_modules .next out` 到 `/tmp` 副本，副本内安装依赖 + `pnpm build`（沙盒需关闭，见项目备忘）。**禁止在主目录 build。**
- [ ] 检查 `out/`：每张专辑 `index.html`、封面、MP3 齐全；`npx serve out` + curl 验证封面与 MP3 URL 返回 200。
- [ ] 浏览器 QA（本环境无视觉能力时委托用户）：`/music` 索引、Bon Iver 播放确认、超长曲名截断、移动端宽度、Light/Dark。
- [ ] 运行 `trellis-check`。

## Step 7 — 收尾

- [ ] `trellis-update-spec`：写入专辑目录结构、`album.yaml` 契约、媒体同步脚本约定、slug 规范（ASCII、web-safe 媒体名）。
- [ ] 按 `AGENTS.md` 提交：只含本任务文件（`content/music/`、`public/music` 删除、`lib/music.ts`、两个页面、脚本、`package.json`、`.gitignore`、任务文档），短英文祈使句 message，**不推送**。发现非任务脏文件停下询问。

## 回滚点

- Step 1–3 后可整体 `git checkout` / `git restore --staged` 回滚；用户媒体在 untracked 目录，**禁止 `git clean`**。
- Step 4 独立可撤：删脚本 + 还原 `package.json` / `.gitignore`。
