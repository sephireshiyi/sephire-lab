import Link from "next/link";
import { getAllPosts } from "@/lib/content";

// "2026-06-07" → "2026 年 6 月 7 日"
function formatDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  return `${year} 年 ${Number(month)} 月 ${Number(day)} 日`;
}

// category 枚举到中文标签（后续可能抽到 lib/constants.ts）
const CATEGORY_LABEL: Record<string, string> = {
  tech: "技术",
  thoughts: "思考",
  music: "音乐",
  photo: "摄影",
};

export default function BlogListPage() {
  const posts = getAllPosts(); // 已按日期降序

  return (
    <div className="mx-auto max-w-[800px] px-lg py-4xl">
      <h1
        className="mb-3xl text-4xl font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        博客
      </h1>

      {posts.length === 0 ? (
        <p style={{ color: "var(--text-secondary)" }}>暂无文章</p>
      ) : (
        <div className="space-y-2xl">
          {posts.map((post) => (
            <article
              key={post.slug}
              className="border-b pb-2xl"
              style={{ borderColor: "var(--border-color)" }}
            >
              <Link href={`/blog/${post.slug}`} className="group block">
                <h2
                  className="text-2xl font-semibold transition-colors group-hover:opacity-70"
                  style={{ color: "var(--text-primary)" }}
                >
                  {post.title}
                </h2>
              </Link>

              <div className="mt-sm flex items-center gap-md text-sm">
                <time
                  dateTime={post.date}
                  style={{ color: "var(--text-secondary)" }}
                >
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

              {post.summary && (
                <p
                  className="mt-md leading-relaxed"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {post.summary}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
