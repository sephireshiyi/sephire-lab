# Gallery 横向摄影集实施计划

## 阶段门禁

- [x] 开发者已确认没有外部设计稿，以当前原创横向方案作为高保真视觉基准。
- [x] 开发者已接受舞台下方的非覆盖式文字详情区。
- [x] 开发者已确认 Header 首次进入时可见、产生浏览意图后隐藏。
- [x] 开发者已审阅并批准 `prd.md`、`design.md`、`implement.md`。
- [x] 批准后运行 `task.py start`，任务状态已从 `planning` 改为 `in_progress`。
- [x] 写代码前已加载 `trellis-before-dev`，读取 frontend 相关规范与 Phase 2.1 细节。
- [x] 已按 `imagegen` skill 使用内置工具逐场景生成素材，未使用 CLI fallback。

## 1. 建立实现基线

- [x] 检查 `git status --short`，确认工作区只包含本任务文件。
- [ ] 记录 `/gallery/kyoto-autumn` 的浏览器截图（内置浏览器 localhost 授权被拒，待开发者允许后执行）。
- [ ] 通过浏览器验收收敛视口几何、间距、显隐和动效最终值。
- [x] 已搜索 Header、Gallery 路径、context 和滚动实现，仓库无可直接复用的同类机制。

## 2. 拆分 Server / Client Gallery 边界

- [x] 新增 `components/gallery/gallery-experience.tsx`，props 类型复用 `lib/gallery.ts`。
- [x] 保留 Server page 的静态参数与构建期 loader，只把校验后的 Gallery 交给 Client Component。
- [x] 建立全视口舞台、横向轨道、语义 figure、真实宽高比与首尾居中 spacer。
- [x] 加入 scroll snap、rAF 活动索引计算、计数和相邻照片状态。
- [ ] 交互视觉验证待 localhost 浏览器授权；静态导出已证明 7 张混合比例素材与页面结构可编译预渲染。

**检查点 A**：鼠标拖动滚动条/触控板原生横向移动后，每张图都能吸附居中；首尾、竖图和方图无跳动。

## 3. 输入、详情与无障碍

- [x] 绑定 non-passive wheel listener，归一化 delta，只在消费横向浏览时阻止默认行为且不拦截缩放。
- [x] 实现方向键、Home/End、ArrowDown、Escape、首尾边界与焦点恢复。
- [x] 保留原生 touch swipe/inertia 与纵向页面滚动，未引入手势库。
- [x] 实现相邻 hover/focus/click 与 reduced-motion（包括 JS scroll behavior）。
- [x] 新增舞台下方详情区和 `aria-expanded` / `aria-controls`。
- [x] 补齐 carousel、slide、live region、focus-visible 与缺字段语义。

**检查点 B**：仅键盘可浏览首尾并进入/离开详情；鼠标 wheel 不形成纵向滚动陷阱；移动触摸模拟保持原生行为。

## 4. Header 隐藏协议

- [x] 新增通用 SiteChrome Provider/hook，接入根布局、SiteHeader 与 Gallery client。
- [x] Header 隐藏只改变 transform/opacity，不改变布局高度或 snap 坐标。
- [x] 浏览意图隐藏；详情、Escape、顶部恢复区和 Header focus 恢复。
- [x] Gallery unmount 释放自己的 reason，Provider 其余页面默认无隐藏请求。
- [x] reduced-motion 无 Header 过渡；React 19 ESLint 通过，无 effect 内同步 mounted/setState guard。

**检查点 C**：连续执行“进入 Gallery → 浏览 → 打开详情 → 返回浏览 → 离开路由”，Header 状态与焦点均正确且页面不位移。

## 5. 使用 imagegen 生成并发布 7 张素材

- [x] 完成统一母版与七个独立 `photorealistic-natural` 场景 prompt。
- [x] 使用内置 `image_gen` 分别生成 7 张，未使用 CLI/API fallback。
- [x] 逐张检查真实感、季节、色调、方向、伪文字/logo/水印、人脸与明显生成瑕疵。
- [x] 七张首轮结果均通过，无需重生成或保留废弃变体。
- [x] 以质量 85 转换并写入 `01.jpg` … `07.jpg`，最终尺寸已记录。
- [x] 生成结果在对话中逐张并列验收；最终 JPEG 用 `file` 复核比例与尺寸，未提交额外接触表。
- [x] 更新 YAML 的 7 个路径/尺寸、中文 alt、caption/note 与叙事顺序。
- [x] 前 5 张占位 JPEG 已直接替换，并新增 06/07；静态导出含全部新资源。
- [x] 最终 prompt 集、原始 PNG 与项目资产映射记录在 `imagegen-prompts.md`。

**建议叙事顺序**：木桥枫林横图 → 竹林竖图 → 池塘倒影横图 → 落叶石径方图 → 寺院建筑竖图 → 庭院细节近方图 → 黄昏桥梁远山横图。

**检查点 D**：YAML 尺寸与文件完全一致，索引 cover 正常，7 张缩略接触表具有统一摄影语言且比例节奏可辨。

## 6. 浏览器视觉验收

- [ ] 使用 `browser:control-in-app-browser` 检查本地页面，不以静态截图替代交互验收。
- [ ] 桌面至少覆盖约 1440×900：触控板/等效横向滚动、鼠标纵向 wheel、键盘、相邻 hover/click、Header 状态、详情展开。
- [ ] 移动至少覆盖约 390×844：左右 swipe、纵向进入详情、竖图/方图尺寸、safe area、控制触达。
- [ ] Light / Dark 分别检查舞台、控制层、focus ring、详情区与 Header 过渡；照片本身不套主题滤镜。
- [ ] 开启 reduced-motion，确认没有平滑位移/scale 动画但功能完整。
- [ ] 检查控制台无 hydration、资源 404、key、passive listener 或无障碍相关错误。
- [ ] 抽查 `/gallery`、`/writing`、`/music`、`/about`，确认 Header 与全局主题无回归。
- [ ] 把关键视口截图或观察记录提供给开发者，等待最终视觉接受；未接受前不归档。

## 7. 自动化质量门

在主工作区运行（不触碰 `.next` 构建缓存）：

```bash
pnpm lint
pnpm exec tsc --noEmit
```

静态导出只在隔离副本中运行：

```bash
VERIFY_DIR=$(mktemp -d /tmp/shiyi-lab-gallery-build.XXXXXX)
rsync -a \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='out' \
  /Users/jiechu/shiyi-lab/ "$VERIFY_DIR"/
cd "$VERIFY_DIR"
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit
pnpm build
test -d out
test -f out/gallery.html
test -f out/gallery/kyoto-autumn.html
test -f out/gallery/kyoto-autumn/01.jpg
test -f out/gallery/kyoto-autumn/07.jpg
```

- [x] ESLint 通过。
- [x] TypeScript 通过（主目录陈旧 `.next` 排除验证；最终隔离构建亦通过 Next TypeScript）。
- [x] `/tmp/shiyi-lab-gallery-final.WfDmR4` 静态导出通过，主工作区未运行 build。
- [x] `out/` 含 Gallery 索引、京都详情与 7 张新媒体。
- [x] YAML 尺寸与最终 JPEG 一致，导出资源完整。

## 8. 完成与提交

- [x] 已运行 `trellis-check`；spec、lint、TypeScript、跨层数据流与静态导出通过，浏览器状态流待 localhost 授权后完成。
- [ ] 仅当产生可复用的新 Gallery/媒体约定且现有 spec 未覆盖时，使用 `trellis-update-spec` 更新英文 frontend spec。
- [ ] 开发者明确通过最终视觉验收后，再按仓库规则创建任务范围内的 work commit；不 push。
- [ ] 使用 `trellis-finish-work` 完成归档与 journal bookkeeping，并与业务 work commit 分开。

## 风险文件与回滚点

- `app/layout.tsx`、`components/layout/site-header.tsx`：全局影响面最大；检查点 C 未通过就先回滚 Provider 接线，不继续素材工作。
- `components/gallery/gallery-experience.tsx`：wheel、snap、touch 与 focus 的集中风险点；检查点 A/B 分开验证。
- `content/gallery/kyoto-autumn.yaml` + `public/gallery/kyoto-autumn/`：必须同批变更；YAML 与最终文件尺寸不一致时构建不一定自动发现，应在检查点 D 显式校验。
- 新媒体体积：若 7 张明显拖慢本地加载，先调整转换尺寸/质量，不改为运行时图片服务。
- 所有源码与旧占位媒体均受 Git 管理，可按文件恢复；不包含数据库或不可逆迁移。
