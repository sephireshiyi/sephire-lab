import { getPostBySlug, getPostSlugs } from "@/lib/content";

// 只允许 generateStaticParams 列出的 slug；访问未定义的路由直接 404（不在请求时动态编译）。
export const dynamicParams = false;

// build 时扫 content/posts/ 把每篇 slug 预生成为静态路由。
export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

// "2026-06-07" → "2026 年 6 月 7 日"。按字符串字段格式化，避免 new Date() 的时区把日期推前一天。
function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${year} 年 ${Number(month)} 月 ${Number(day)} 日`;
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // ⚠️ Next 16：params 是 Promise，必须 await，否则拿到 undefined。
  const { slug } = await params;

  // frontmatter：gray-matter 读取 + zod 校验（标题区用）
  const post = getPostBySlug(slug);
  // 正文：动态 import 那一篇 .mdx，@next/mdx 在 build 时已把它编译成 React 组件
  const { default: Content } = await import(`@/content/posts/${slug}.mdx`);

  return (
    <article className="mx-auto max-w-[65ch] px-lg py-4xl font-serif">
      <header className="mb-2xl">
        <h1
          className="text-4xl font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {post.title}
        </h1>
        <time
          dateTime={post.date}
          className="mt-sm block text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          {formatDate(post.date)}
        </time>
        {post.summary ? (
          <p className="mt-md text-lg" style={{ color: "var(--text-secondary)" }}>
            {post.summary}
          </p>
        ) : null}
      </header>

      {/* MDX 正文。排版样式在 globals.css 的 .mdx-body 作用域里统一定义。 */}
      <div className="mdx-body">
        <Content />
      </div>
    </article>
  );
}
