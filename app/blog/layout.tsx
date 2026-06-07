import { notoSerifSC } from "@/lib/fonts";

/**
 * /blog 子树布局。
 *
 * 唯一职责：把思源宋体的 CSS 变量 --font-noto-serif-sc「局部挂载」到 /blog 子树
 * （不挂到全站 <html>，这样非博客页面不会触发 CJK 字体下载）。见 font-decisions.md §5。
 *
 * 注意：这里只「提供」变量，不强制 font-serif——具体哪个容器用宋体由页面自己决定
 * （例如文章正文容器用 className="font-serif"），列表页 UI 仍走默认无衬线。
 */
export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className={notoSerifSC.variable}>{children}</div>;
}
