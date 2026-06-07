import type { MDXComponents } from "mdx/types";

/**
 * 全局 MDX 组件映射。
 *
 * ⚠️ @next/mdx 在 App Router 下「必须」有这个文件，否则 MDX 会静默失效。
 *    签名是固定的：导出一个无参数的 useMDXComponents()（Next 16.2.5 文件约定）。
 *
 * 排版样式集中写在 app/globals.css 的 `.article` 作用域里（与既有的 `.reader article`
 * 主题规则同属一套 CSS 体系，三主题统一维护、且能用后代选择器干净处理「标题里的锚点链接」
 * 和「行内 code vs 代码块 code」这类区分）。所以这里先保持最小实现——
 * 等需要用 React 组件替换某个元素时（例如把 <img> 换成 next/image），再来这里加映射。
 */
const components: MDXComponents = {};

export function useMDXComponents(): MDXComponents {
  return components;
}
