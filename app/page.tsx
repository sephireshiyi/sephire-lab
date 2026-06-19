import Link from "next/link";
import { getAllPosts } from "@/lib/content";
import { PostCard } from "@/components/blog/post-card";

export default function Home() {
  const recentPosts = getAllPosts().slice(0, 3);

  return (
    <>
      {/* Hero 区：极简居中标题，占满首屏（100dvh），严格遵循设计稿。
          负 mt 抵消 main 的 padding-top，让标题落在视口几何中心（见 task2）。 */}
      <section className="mt-[calc(-1*var(--header-height))] flex min-h-[100dvh] items-center justify-center">
        <h1
          className="text-6xl font-medium tracking-tight md:text-7xl lg:text-8xl"
          style={{ color: "var(--text-primary)" }}
        >
          Sephire Lab
        </h1>
      </section>

      {/* Recent Writing 区：下滚后出现。复用 /writing 的 PostCard，
          容器宽度与 /writing 列表页一致（max-w-[800px]）；py-5xl 比列表页留白更大，
          刻意与上方满屏 Hero 拉开距离。 */}
      <section className="mx-auto max-w-[800px] px-lg py-5xl">
        <h2
          className="mb-3xl text-3xl font-medium"
          style={{ color: "var(--text-primary)" }}
        >
          Recent Writing
        </h2>

        {recentPosts.length === 0 ? (
          <p style={{ color: "var(--text-secondary)" }}>暂无文章</p>
        ) : (
          <div className="space-y-2xl">
            {recentPosts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}

        <div className="mt-3xl text-center">
          <Link
            href="/writing"
            className="text-base underline transition-opacity hover:opacity-70"
            style={{ color: "var(--text-primary)" }}
          >
            查看全部 →
          </Link>
        </div>
      </section>
    </>
  );
}
