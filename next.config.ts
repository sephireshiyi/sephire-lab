import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  // 让 .md / .mdx 也能作为页面与可导入模块（与默认的 js/jsx/ts/tsx 并列）
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
};

// ⚠️ Turbopack（Next 16 默认打包器）下，remark/rehype 插件只能传「字符串名 + 可序列化选项」，
//    不能传 JS 函数——插件配置要序列化后交给 Rust 侧。详见 mdx-pipeline-decisions.md §5。
const withMDX = createMDX({
  options: {
    remarkPlugins: [
      // 识别并「剥离」YAML frontmatter，避免开头的 --- 块被当成正文渲染（成 <hr> + 文本）。
      // 它只负责从渲染输出里移除 frontmatter；真正「读取」数据由 lib/content.ts 的 gray-matter 负责。
      "remark-frontmatter",
      // GitHub Flavored Markdown：表格 / 删除线 / 任务列表 / 自动链接
      "remark-gfm",
    ],
    rehypePlugins: [
      // 给每个标题加 id（autolink 依赖它）
      "rehype-slug",
      // 给标题包/挂一层锚点 <a>（视觉样式后续再打磨，见 mdx-pipeline-decisions §10）
      "rehype-autolink-headings",
      // 代码高亮（Shiki 内核）。多主题：同一份静态 HTML 给每个 token 注入
      // --shiki-light / --shiki-dark / --shiki-reader 三套 CSS 变量，靠 CSS 切换配色。
      // keepBackground:false —— 不让 Shiki 写死背景色，背景交给我们的主题 token。
      [
        "rehype-pretty-code",
        {
          theme: {
            light: "github-light",
            dark: "github-dark",
            reader: "rose-pine-dawn",
          },
          keepBackground: false,
        },
      ],
    ],
  },
});

export default withMDX(nextConfig);
