# 技术设计：Music 专辑目录化 + 本地 MP3 播放

## 1. 总体形状

```
content/music/<album-slug>/          ← 唯一内容源（提交进 git）
  album.yaml                         ← 每专辑恰好一个 manifest（固定名）
  cover.jpeg | cover.jpg | ...       ← 封面（YAML 用相对文件名引用）
  <track>.mp3                        ← 可选音频片段（YAML 显式引用）

public/music/                        ← 构建产物，脚本生成，gitignore（见 §4）

lib/music.ts                         ← loader：发现文件夹、zod 校验、路径校验、派生公开 URL
scripts/sync-music-media.mjs         ← 确定性媒体发布脚本（dev/build 前运行）
app/music/[slug]/page.tsx            ← 曲目行内渲染原生 <audio>（仅当有 audio 字段）
```

最终 4 张专辑：`bon-iver-for-emma-forever-ago`、`neutral-milk-hotel-in-the-aeroplane-over-the-sea`、`sufjan-stevens-illinois`、`omnipotent-youth-society-inside-the-cable-temple`。

## 2. 数据契约（schema 变更）

```ts
export const TrackSchema = z.object({
  title: z.string(),
  duration: z.string().optional(),
  // 新增：相对于专辑文件夹的音频文件名，如 "flume.mp3"。
  // 可选且显式——没有该字段就没有播放器；绝不从下载文件名猜 URL。
  audio: z.string().optional(),
});

export const MusicSchema = z.object({
  // ... 现有字段不变 ...
  // cover 从「公开 URL」改为「相对专辑文件夹的文件名」，如 "cover.jpeg"。
  // 校验扩展名 ∈ {jpg, jpeg, png, webp}，不关心具体是 jpg 还是 jpeg。
  cover: z.string(),
});
```

「loader」= `lib/music.ts`：build 时读 YAML、zod 校验、把数据交给页面。**YAML 只存相对文件名，公开 URL 由 loader 派生**：

- `coverUrl` = `/music/<slug>/<cover>`
- 每条 track 的 `audioUrl?` = `/music/<slug>/<audio>`

取舍逻辑：内容不耦合发布路径；拼接与编码规则集中在一处便于测试与将来改动；顺带修掉现存漂移（Bon Iver YAML 写 `cover.jpg` 实际是 `cover.jpeg`）。派生字段不进 YAML，页面只消费派生 URL。因 slug 已统一为 ASCII，URL 拼接无需 percent-encode，但派生函数仍集中一处，将来若再引入非 ASCII 只改这里。

### 音频/封面文件名规范化
MP3 重命名为稳定 web-safe 名（小写连字符），如 `oh-comely.mp3`、`the-black-hawk-war.mp3`、`shan-que.mp3`、`flume.mp3`。现文件名含空格、逗号、撇号、来源站水印且极长（Sufjan 200+ 字符），既是丑陋 URL 也有文件系统长度风险。重命名 = `git mv` 级移动，非替换用户媒体，符合 R11。

## 3. Manifest 发现规则

- loader 扫 `content/music/` 一级子目录；忽略 `.DS_Store` 等非目录项。
- 每目录恰好一个 `album.yaml`；缺失或多余 → 报错指名目录。
- **固定名 `album.yaml`**：slug 只有一个来源（目录名），避免文件名重复承载 slug 造成第二处需同步的真值；「恰好一个 manifest」退化为存在性检查。
- 校验：`slug === 目录名`；slug 全站唯一；slug 匹配 `^[a-z0-9-]+$`；cover/audio 引用的文件必须存在且 `path.resolve` 后仍在专辑目录内（拒绝 `../` 越界）；封面扩展名 ∈ {jpg,jpeg,png,webp}。
- `content/music/` 根下的散落 `*.yaml`（占位专辑删除后应为空）→ 报错，提示迁移。

## 4. 媒体发布：构建期同步脚本（核心决策）

**`scripts/sync-music-media.mjs`：dev/build 前把专辑目录中除 `*.yaml`/`.DS_Store` 外的媒体镜像到 `public/music/<slug>/`；`public/music/` 整体 gitignore，删后可完整重建。**

- `package.json`：`"prebuild"` 与 `"predev"` 均 `node scripts/sync-music-media.mjs`（npm/pnpm 原生 pre 钩子，无需改 next 配置）。
- 镜像语义（清空重建 / 差异删除孤儿）：改 slug、删专辑后不留过期文件（R3）。
- `.gitignore` 加 `public/music/`；`git rm -r --cached public/music`。

### 已否决备选
| 备选 | 否决原因 |
|---|---|
| 手动维护 `public/music/` | 双真值，正是要消除的痛点 |
| Route Handler 运行时读 | `output: "export"` 无运行时服务器 |
| 打包器 import 资产 | 产出 hash 文件名，破坏「稳定可预测 URL」验收 |
| symlink `public/music -> content` | 静态导出对 symlink 目录复制不保证；且会把 YAML 也发布 |

代价：dev 中途新增专辑需重跑脚本（或重启 `pnpm dev`）。写入脚本输出与 spec。

## 5. slug 与命名决策

- `neutural-...` → `neutral-milk-hotel-in-the-aeroplane-over-the-sea`（`git mv` 目录 + 改 YAML slug）。未成为公开 URL，零迁移成本。
- 中文专辑 → 英文 slug `omnipotent-youth-society-inside-the-cable-temple`；`title: 冀西南林路行`、`artist: 万能青年旅店` 保留中文。理由（用户已确认）：URL 纯 ASCII，规避静态托管文件名编码与 macOS/Linux Unicode 归一化差异；中文表达保留在页面可见文案。
- Daft Punk / Radiohead 占位数据删除（含 `public/music/` 旧封面）。

## 6. 播放器 UI

`app/music/[slug]/page.tsx` 曲目列表内，有 `audioUrl` 的曲目在其行下方渲染：

```tsx
<audio controls preload="metadata" src={track.audioUrl}
       aria-label={`播放 ${track.title} 片段`} className="w-full" />
```

- 保持 server component——原生 `<audio>` 无需 `"use client"`。
- 无 `audio` 字段的曲目行完全不变（R6）。
- `preload="metadata"` 只拉元信息不预载音频体；无 autoplay 属性即无自动播放。
- 原生控件自带键盘操作与屏幕阅读器语义；深浅色由浏览器 `color-scheme` 适配。
- 视觉：原生控件外观随浏览器，MVP 接受；仅用现有间距 token 排版，不动主题布局（R8）。

### 曲目名截断（R8 / A6）
曲目名单行截断：`truncate`（`overflow:hidden; text-overflow:ellipsis; white-space:nowrap`）+ `min-w-0`，时长列固定不被挤压。用户已选单行而非两行 `line-clamp-2`，接受 Sufjan 超长曲名被截断。

## 7. 兼容与回滚

- 路由形状 `/music/[slug]` 不变；占位专辑本就是临时数据，无 301 需求。
- 回滚：revert 提交即回扁平结构；用户提供媒体始终在 `content/` untracked 目录不受影响。
- 无 DB / API / 外部依赖变更。
