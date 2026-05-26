# Sephire Lab

## 项目定位

这是一个部署在 sephire.xyz 上的个人实验型博客网站。

它不是单纯的博客模板，而是一个个人主站，用来承载：

- 个人写作
- 项目展示
- 在线小工具
- 技术实验记录
- 未来作品集内容

第一阶段目标是完成一个可运行、可部署、可继续扩展的 MVP。

---

## 当前开发者背景

项目开发者是大学生，有一些 React / Vue / Django 接触经验，但没有完整从零开发全栈项目的经验。

这个项目同时承担两个目标：

1. 做出一个可以长期使用和展示的个人站。
2. 通过项目学习完整的全栈开发流程。

开发时请优先保持结构清晰、可理解、可扩展，避免一开始引入过重架构。

---

## MVP 目标

第一版 MVP 需要完成：

- 首页 `/`
- 文章列表页 `/blog` (Writing)
- 文章详情页 `/blog/[slug]`
- 音乐页 `/music` (Music)
- 工具集合页 `/tools` (Tools)
- 一个工具详情页 `/tools/model-checker`
- 关于页 `/about` (About)
- 主题切换：light / dark / reader
- MDX 文章系统
- 部署到 Vercel
- 绑定域名 sephire.xyz

## MVP 暂不做

第一版不要做：

- 用户系统
- 评论系统
- 数据库
- 后台管理
- 文章在线编辑器
- 复杂权限系统
- 访问统计
- 工具历史记录
- 独立 Django / FastAPI 后端
- 项目展示页（暂时不做，预留扩展空间）

如果某个功能必须保存数据，先用静态文件或前端状态模拟。

---

## 技术栈

使用：

- Next.js App Router
- React
- TypeScript
- Tailwind CSS
- MDX
- next-themes
- shadcn/ui，可后续引入
- Framer Motion，可后续引入
- Recharts，可后续引入
- Vercel 部署

第一版尽量不要引入数据库。

---

## 技术分工理解

Next.js 负责：

- 页面结构
- 路由
- 服务端渲染
- 静态生成
- 简单 API routes / route handlers

React 负责：

- UI 组件
- 交互状态
- 表单输入
- 工具页面交互逻辑

TypeScript 负责：

- 文章数据类型
- 项目数据类型
- 工具输入输出类型
- 组件 props 类型

Tailwind CSS 负责：

- 页面布局
- 颜色
- 间距
- 字体大小
- 响应式设计
- 暗色模式样式

MDX 负责：

- 博客文章
- 项目长文
- 可以嵌入 React 组件的内容页

next-themes 负责：

- light / dark / reader 主题切换
- 记住用户选择

Vercel 负责：

- 构建
- 部署
- HTTPS
- 自定义域名绑定

---

## 第一阶段页面结构

建议目录结构：

    app/
      page.tsx
      layout.tsx
      globals.css
      blog/
        page.tsx
        [slug]/
          page.tsx
      music/
        page.tsx
      tools/
        page.tsx
        model-checker/
          page.tsx
      about/
        page.tsx
      api/
        model-checker/
          route.ts
    
    components/
      layout/
      blog/
      music/
      tools/
      theme/
      ui/
    
    content/
      posts/
      music/
    
    lib/
      mdx.ts
      posts.ts
      music.ts
      utils.ts

---

## 页面内容要求

首页需要包含：

- 网站名称：Sephire Lab
- 极简设计，只显示居中的标题
- 大量留白

文章页（Writing）需要包含：

- 文章列表
- 文章标题
- 日期
- 摘要
- 标签
- 文章详情渲染

音乐页（Music）需要包含：

- 音乐作品展示
- 预留扩展空间

工具页（Tools）需要包含：

- 工具卡片列表

关于页（About）需要包含：

- 个人介绍
- 联系方式

## 主题系统

第一版主题：

- light ![](/Users/jiechu/shiyi-lab/design/Home%20-%20Light.png)

- dark
  
  ![](/Users/jiechu/shiyi-lab/design/Home%20-%20Dark.png)

- reader
  
  ![](/Users/jiechu/shiyi-lab/design/Home%20-%20Read.png)

实现思路：

- 使用 next-themes 管理主题
- 使用 CSS variables 定义颜色
- Headless UI作为第三方组件库
- Tailwind 使用变量
- reader 模式使用更适合长文阅读的背景、文字颜色、行距和字体风格

## 设计风格

整体风格：

- 极简的黑白风格
- 留白较多
- 避免太模板化
- 动效轻，不要过度炫技
- 阅读体验优先

首页文案可以先用英文或中英混合，但代码结构保持英文命名。

## 设计稿参考

项目在 `design/` 目录下维护 Figma 设计稿的导出图片，作为前端样式的参考。

### 当前设计稿

- `Home - Light.png` - 首页浅色主题
- `Home - Dark.png` - 首页深色主题
- `Home - Read.png` - 首页阅读主题
- `Selection.png` - 设计说明和规范

### 设计规范

**导航栏：**

- 左侧：Logo 预留出来logo空间，我后续设计好之后补充上，暂定为svg格式
- 中间：Writing、Music、Tools、About 导航链接
- 右侧：主题切换图标 + 语言切换图标
- 悬停效果：鼠标悬停时，对应栏目文字上方显示黑色短矩形指示条，宽度与文字等宽，带淡入淡出动画

**主题配色：**

- 浅色主题：背景 #F9F9F9，文字 #000000
- 深色主题：背景 #1E1E1E，文字 #FFFFFF
- 阅读主题：背景 #EAE5D4，文字 #1E1907

**字体：**

- 主字体：Maven Pro

**首页设计：**

- 极简风格，只显示居中的 "Sephire Lab" 标题
- 页眉与中心内容比例贴合设计图

**图标库：**

- 主题切换：下拉栏（通过headless ui实现）显示：太阳图标（浅色）、月亮图标（深色）、书本图标（阅读）
- 语言切换：语言图标

### 开发要求

- 严格按照设计稿实现样式
- 保持设计稿中的留白和间距
- 使用设计稿中指定的颜色值
- 实现悬停效果和交互动画

## 开发原则

请按阶段推进，不要一次性做所有功能。

优先顺序：

1. 初始化项目结构
2. 搭建基础 layout 和导航
3. 完成首页静态 UI
4. 完成主题切换
5. 完成 `/blog` 和 `/blog/[slug]`
6. 接入 MDX
7. 完成 `/projects`
8. 完成 `/tools`
9. 完成 `/tools/model-checker`
10. 增加 `/api/model-checker`
11. 整理 README
12. 准备部署 Vercel

每完成一个阶段，请保证：

- 可以 `pnpm dev` 正常运行
- 没有明显 TypeScript 错误
- 页面路由可访问
- 代码结构清晰

## 与 Claude Code 协作方式

开发时请先阅读本文件。

每次开始新任务前，先简短说明要改哪些文件。

修改后请说明：

- 把每次的进度写入 @

- 完成了什么

- 改了哪些文件

- 如何本地验证

- 下一步建议

不要在没有必要时引入大型依赖。

不要擅自加入数据库、登录、后台管理、评论系统。

如果某个功能有多种实现方式，请优先选择适合新手理解、可维护、后续可扩展的方案。

## 开发日志要求

本项目需要维护一个开发进度日志文件：

    LOG.md

该文件用于按时间顺序记录每一轮与 Claude Code 协作后的开发进展，方便后续追溯项目历史、理解代码变化原因、恢复上下文。

### 记录时机

每完成一轮明确的开发任务后，都需要更新 `LOG.md`。

一轮开发任务可以是：

- 完成一个页面
- 新增一个组件
- 修改一组样式
- 接入一个依赖
- 修复一个 bug
- 重构某个目录或模块
- 完成一次部署相关配置
- 调整项目结构或开发计划

如果只是查看文件、解释代码、讨论方案，且没有实际修改项目文件，可以不更新日志。

### 记录顺序

日志需要按照时间顺序追加，新的记录放在文件底部。

不要覆盖旧记录。

不要删除历史记录，除非用户明确要求整理或重写日志。

### 每条日志的推荐格式

每条日志建议包含：

- 日期与时间
- 本轮目标
- 修改文件
- 完成内容
- 验证方式
- 遗留问题
- 下一步建议

格式示例：

    ## 2026-05-07 14:30
    
    ### 本轮目标
    
    完成基础导航栏和首页结构。
    
    ### 修改文件
    
    - `app/page.tsx`
    - `app/layout.tsx`
    - `components/layout/site-header.tsx`
    - `components/layout/site-footer.tsx`
    
    ### 完成内容
    
    - 清理了 Next.js 默认首页。
    - 新增站点导航栏。
    - 搭建首页 Hero 区域。
    - 添加 Writing、Projects、Tools 三个预览入口。
    - 调整了全局页面布局。
    
    ### 验证方式
    
    - 已运行 `pnpm dev`。
    - 已确认 `/` 可以正常访问。
    - 已确认导航链接可以跳转到对应页面。
    
    ### 遗留问题
    
    - `/blog`、`/projects`、`/tools` 页面目前仍是占位内容。
    - 主题切换功能尚未实现。
    
    ### 下一步建议
    
    继续完成 Milestone 1 中的基础页面占位结构，然后进入主题系统开发。

### 写日志时的要求

日志内容要具体，避免只写“完成了一些修改”。

如果本轮有代码改动，请尽量列出实际修改过的文件。

如果本轮引入了新依赖，请记录依赖名称和用途。

如果本轮遇到错误并修复，请记录错误现象和修复方式。

如果某个问题没有解决，请记录在“遗留问题”中。

### 与 Claude Code 协作时的要求

每次完成文件修改后，Claude Code 都应该检查是否需要更新 `LOG.md`。

如果用户没有特别说明，也应该主动维护该日志。

完成任务后的回复中需要简短说明：

- 本轮是否更新了 `LOG.md`
- 新增日志记录的大致内容
- 下一步可以继续做什么

不要把完整日志内容重复输出到聊天中，除非用户明确要求查看。
