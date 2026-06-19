import { getAllPosts } from "@/lib/content";
import { PostCard } from "@/components/blog/post-card";

export default function WritingListPage() {
  const posts = getAllPosts(); // 已按日期降序

  return (
    <div className="mx-auto max-w-[800px] px-lg py-4xl">
      <h1
        className="mb-3xl text-4xl font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        Writing
      </h1>

      {posts.length === 0 ? (
        <p style={{ color: "var(--text-secondary)" }}>暂无文章</p>
      ) : (
        <div className="space-y-2xl">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
