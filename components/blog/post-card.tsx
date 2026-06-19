import Link from "next/link";
import { CATEGORY_LABEL, formatDate, type Post } from "@/lib/content";

interface PostCardProps {
  post: Post & { slug: string };
  /** 是否展示摘要。默认 true；需要更紧凑的列表时可关掉。 */
  showSummary?: boolean;
}

/**
 * 文章卡片：标题链接 + 日期 + category chip +（可选）摘要。
 * `/writing` 列表页与首页 Recent Writing 区共用，保证两处视觉一致。
 * 样式整体抽自原 Writing 列表页的内联卡片（底部分隔线风格），抽取时未改动。
 * 纯展示、无交互，保持 Server Component（不加 "use client"）。
 */
export function PostCard({ post, showSummary = true }: PostCardProps) {
  return (
    <article
      className="border-b pb-2xl"
      style={{ borderColor: "var(--border-color)" }}
    >
      <Link href={`/writing/${post.slug}`} className="group block">
        <h2
          className="text-2xl font-semibold transition-colors group-hover:opacity-70"
          style={{ color: "var(--text-primary)" }}
        >
          {post.title}
        </h2>
      </Link>

      <div className="mt-sm flex items-center gap-md text-sm">
        <time dateTime={post.date} style={{ color: "var(--text-secondary)" }}>
          {formatDate(post.date)}
        </time>
        <span
          className="rounded-full px-md py-2xs text-xs"
          style={{
            backgroundColor: "var(--bg-hover)",
            color: "var(--text-secondary)",
          }}
        >
          {CATEGORY_LABEL[post.category] || post.category}
        </span>
      </div>

      {showSummary && post.summary && (
        <p
          className="mt-md leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {post.summary}
        </p>
      )}
    </article>
  );
}
