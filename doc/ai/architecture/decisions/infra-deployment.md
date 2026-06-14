# 部署决策（Vercel）

> 记录 Sephire Lab 部署到 Vercel + 绑定 sephire.xyz 的流程、配置、检查清单。
>
> **状态**：✅ 已确认（2026-06-13）
>
> **更新历史**：
> - 2026-06-13：初版。基于 MVP 要求 + Next.js 16 + Vercel 最佳实践。

---

## 1. 部署目标

### 1.1 MVP 部署清单

- [x] Next.js 16 App Router 项目可 build 通过
- [x] 博客系统（详情页 + 列表页）已跑通
- [ ] 首页（Hero + Recent Writing）已完成
- [ ] Model Checker 工具已完成
- [ ] 三主题切换正常工作
- [ ] 所有页面响应式（桌面 + 移动端）
- [ ] 推送到 GitHub
- [ ] 导入 Vercel 并绑定 sephire.xyz
- [ ] 生产环境验证（性能 / a11y / 移动端）

### 1.2 非 MVP（可延后）

- Music 页面内容
- Gallery 功能
- About 页面详细内容
- 评论系统
- 访问统计

---

## 2. 部署前检查清单

### 2.1 代码质量

| 检查项 | 命令 | 标准 |
|---|---|---|
| **TypeScript 检查** | `pnpm run build`（内含 tsc） | ✅ 无类型错误 |
| **Lint** | `pnpm lint` | ✅ 无阻塞性错误（KI-1 已知问题可延后） |
| **Build 成功** | `pnpm build` | ✅ exit 0，所有页面标记 `○` 或 `●` |
| **本地预览** | `pnpm start`（build 后） | ✅ 所有路由可访问 |

### 2.2 内容检查

- [ ] 至少 1 篇博客文章（`content/posts/hello-world.mdx` 已有）
- [ ] 首页 Recent Writing 区有内容
- [ ] Model Checker 表单可用（后端 API 正常）
- [ ] 三主题切换无闪烁
- [ ] 移动端导航栏正常（当前是横向，可能需要 hamburger menu）

### 2.3 SEO 与 Metadata

```tsx
// app/layout.tsx
export const metadata = {
  title: {
    default: "Sephire Lab",
    template: "%s | Sephire Lab",
  },
  description: "个人实验型站点，承载写作、摄影、音乐介绍与在线小工具。",
  keywords: ["博客", "全栈开发", "工具"],
  authors: [{ name: "Sephire" }],
  openGraph: {
    type: "website",
    locale: "zh_CN",
    url: "https://sephire.xyz",
    siteName: "Sephire Lab",
  },
};
```

每个页面可覆盖 title / description（如 `app/blog/[slug]/page.tsx` 的 `generateMetadata`）。

### 2.4 性能优化

- [x] 字体已用 `next/font`（task1 已完成，本地加载）
- [ ] 图片用 `next/image`（切片 C 待做，MVP 可用 `<img>`）
- [x] 代码高亮在 build 时完成（Shiki，切片 A 已验证）
- [x] 列表页不编译正文（切片 B 已验证）

---

## 3. Git 与 GitHub

### 3.1 推送前整理

```bash
# 检查当前状态
git status

# 提交未提交的改动（首页 + Model Checker）
git add .
git commit -m "Add homepage with Recent Writing + Model Checker tool"

# 推送到 GitHub
git push origin main
```

### 3.2 .gitignore 检查

```
# .gitignore（应已有）
.next/
node_modules/
.env.local
.DS_Store
*.log
```

**不要提交**：
- `.env.local`（环境变量，若有）
- `node_modules/`
- `.next/` build 产物

### 3.3 README.md 更新

```markdown
# Sephire Lab

个人实验型站点，承载写作、技术实验与在线小工具。

## 技术栈

- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS v4
- MDX
- Vercel (部署)

## 本地运行

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

访问 http://localhost:3000

## 部署

主分支自动部署到 [sephire.xyz](https://sephire.xyz)

## License

MIT
```

---

## 4. Vercel 部署流程

### 4.1 导入项目

1. 访问 [vercel.com](https://vercel.com)，登录 GitHub 账号
2. 点击 "Add New Project"
3. 选择 `shiyi-lab` 仓库
4. **Framework Preset**：Next.js（自动识别）
5. **Root Directory**：`.`（默认）
6. **Build Command**：`pnpm build`（或默认 `next build`）
7. **Output Directory**：`.next`（默认）
8. **Install Command**：`pnpm install`（Vercel 自动识别 `pnpm-lock.yaml`）

### 4.2 环境变量（若需要）

**MVP 阶段无需环境变量**（Model Checker 用户提供自己的 API Key）

若后续加功能需要：
- Settings → Environment Variables → 添加 `KEY=value`
- 生产/预览/开发环境分别配置

### 4.3 部署触发

- **首次部署**：点击 "Deploy"
- **后续部署**：`git push origin main` 自动触发
- **预览部署**：PR 自动生成预览链接

### 4.4 绑定域名

1. Vercel 项目 → Settings → Domains
2. 添加 `sephire.xyz`
3. 按提示在域名注册商（如 Cloudflare / Namecheap）配置 DNS：
   ```
   Type: A
   Name: @
   Value: 76.76.21.21  （Vercel IP，以实际为准）

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. 等待 DNS 生效（最多 48h，通常几分钟）
5. Vercel 自动签发 SSL 证书（Let's Encrypt）

---

## 5. 部署后验证

### 5.1 功能验证

| 页面/功能 | URL | 检查项 |
|---|---|---|
| 首页 | `/` | Hero 区 + Recent Writing 区正常 |
| 博客列表 | `/blog` | 文章卡片显示、链接可点击 |
| 博客详情 | `/blog/hello-world` | MDX 渲染、代码高亮、宋体正文 |
| Model Checker | `/tools/model-checker` | 表单提交、API 调用、结果展示 |
| 工具索引 | `/tools` | 工具卡片显示 |
| About | `/about` | 占位页显示 |
| 主题切换 | 全站 | Light / Dark / Reader 三主题正常 |

### 5.2 性能验证

**Lighthouse 审计**（Chrome DevTools）：
- Performance：≥ 90（目标）
- Accessibility：≥ 95
- Best Practices：≥ 95
- SEO：≥ 95

**Core Web Vitals**（部署后 Vercel Analytics 自动收集）：
- LCP（Largest Contentful Paint）：< 2.5s
- FID（First Input Delay）：< 100ms
- CLS（Cumulative Layout Shift）：< 0.1

若不达标，按 `doc/ai/review/perf-baseline.md`（部署后创建）记录基线并逐步优化。

### 5.3 移动端验证

**设备测试**（Chrome DevTools → Device Mode）：
- iPhone SE（375px）
- iPhone 14 Pro（393px）
- iPad（768px）

**检查项**：
- 导航栏不换行 / 或响应式菜单正常
- 文章正文宽度适配（不超出屏幕）
- 表单输入框不被键盘遮挡
- 三主题切换正常

### 5.4 三主题视觉验证

**手工过目**（部署后真实浏览器，对照设计稿）：
- Light 主题：背景 #F9F9F9，文字 #000000
- Dark 主题：背景 #1E1E1E，文字 #FFFFFF
- Reader 主题：背景 #EAE5D4，文字 #1E1907，博客正文宋体
- 代码块语法高亮：github-light / github-dark / rose-pine-dawn

---

## 6. 部署后待办

### 6.1 监控与分析（可选）

**Vercel Analytics**（免费）：
- 自动收集 Core Web Vitals
- 每周发邮件报告
- Settings → Analytics → Enable

**Google Analytics**（可选）：
- 访问统计、来源分析
- 在 `app/layout.tsx` 加 GA script

### 6.2 已知问题处理

按 `doc/ai/review/known-issues.md` 优先级：
- **KI-1（🟡）**：`pnpm lint` 失败（theme-dropdown effect 规则）→ 部署前修（或加 `eslint-disable`）
- **KI-2（🟡）**：`--header-height` 魔法值 → 改 header 样式时注意同步
- **KI-3（🟡）**：reader 主题配色重叠 → 按 `blog-reader-theme.md` 收窄旧规则

### 6.3 SEO 提交（可选）

- Google Search Console：提交 sitemap（`/sitemap.xml`，Next.js 可自动生成）
- 百度站长工具：提交站点
- robots.txt：允许爬虫

---

## 7. 回滚与故障处理

### 7.1 回滚到上一版本

Vercel 项目 → Deployments → 选择之前的成功部署 → "Promote to Production"

### 7.2 常见故障

| 故障 | 原因 | 解法 |
|---|---|---|
| Build 失败 | TypeScript 错误 / 依赖缺失 | 本地 `pnpm build` 复现，修复后推送 |
| 页面 404 | 路由配置错误 / `dynamicParams` 问题 | 检查 `generateStaticParams` |
| API 超时 | Serverless Function 超时（默认 10s） | 优化代码或调整 Vercel 配置 |
| 环境变量未生效 | Vercel 未配置或拼写错误 | Settings → Environment Variables 检查 |
| DNS 未生效 | 配置错误或未等够 | `nslookup sephire.xyz` 检查 A/CNAME 记录 |

### 7.3 紧急禁用

若线上出现严重 bug，暂时回退到占位页：
```tsx
// app/page.tsx（临时）
export default function Home() {
  return <div>站点维护中，请稍后访问</div>;
}
```

推送后自动部署，修复完再恢复。

---

## 8. 持续集成（CI）建议（非 MVP）

**GitHub Actions**（后续可加）：
```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm build
```

每次推送自动跑 lint + build，失败则提醒。

---

## 9. 成本估算

### Vercel 免费额度（Hobby Plan）

| 资源 | 额度 | 足够吗 |
|---|---|---|
| **Bandwidth** | 100 GB/月 | ✅ 个人站绰绰有余 |
| **Serverless Function 执行时间** | 100 GB-Hours/月 | ✅ Model Checker API 够用 |
| **Build 时长** | 6000 分钟/月 | ✅ 每次 build ~2 分钟，一天推 10 次也够 |
| **自定义域名** | 1 个 | ✅ sephire.xyz |

**结论**：Hobby Plan（免费）完全满足 MVP 需求。

---

## 10. 与其他文档的关系

- **根 `CLAUDE.md`**：MVP 要求"部署到 Vercel + 绑定 sephire.xyz"——本文档是完整部署方案
- **`homepage-design.md` / `tools-model-checker.md`**：这两个功能完成后才能部署（路径 A 顺序）
- **`doc/ai/review/known-issues.md`**：部署前需处理 🔴 阻塞项，🟡 可延后
- **TODO.md Milestone 6**：本设计覆盖全部部署任务
