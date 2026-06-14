import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";

/** 所有文章 .mdx 文件所在目录（绝对路径，相对项目根解析）。 */
export const POSTS_DIR = path.join(process.cwd(), "content", "posts");

/**
 * frontmatter 的「唯一事实源」：schema 定义一次，TS 类型由 z.infer 派生。
 * 这样运行时校验与编译期类型永不漂移（见 doc/ai/architecture/decisions/blog-mdx-pipeline.md §4）。
 *
 * 注意 date 用 z.iso.date()（zod 4 API）：要求是 "YYYY-MM-DD" 字符串，
 * 所以 frontmatter 里日期必须加引号（date: "2026-06-07"）；写成不带引号的
 * 2026-06-07 会被 YAML 解析成 Date 对象，校验会失败——这是有意的，用来强制约定。
 */
export const PostSchema = z.object({
  type: z.literal("post"),
  title: z.string(),
  date: z.iso.date(),
  category: z.enum(["tech", "thoughts", "music", "photo"]),
  tags: z.array(z.string()).optional(),
  summary: z.string().optional(),
  cover: z.string().optional(),
});

/** 文章 frontmatter 类型，从 zod schema 派生（不要再手写一份 interface）。 */
export type Post = z.infer<typeof PostSchema>;

/**
 * 读单篇 .mdx 的 frontmatter 并用 zod 校验。
 * gray-matter 只切 YAML 头部、不编译正文，所以很轻。
 * 校验失败时抛错并指名文件——next build 时会直接失败，把问题拦在部署前。
 */
export function parsePost(filePath: string): Post {
  const raw = readFileSync(filePath, "utf8");
  const { data } = matter(raw);
  const result = PostSchema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `Invalid frontmatter in ${filePath}:\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}

/**
 * 扫 content/posts/ 列出所有文章 slug（文件名去掉 .mdx 后缀）。
 * 供 generateStaticParams 预生成路由用。
 */
export function getPostSlugs(): string[] {
  return readdirSync(POSTS_DIR)
    .filter((name) => name.endsWith(".mdx"))
    .map((name) => name.replace(/\.mdx$/, ""));
}

/** 按 slug 读取并校验单篇 frontmatter（详情页标题区用）。 */
export function getPostBySlug(slug: string): Post & { slug: string } {
  const post = parsePost(path.join(POSTS_DIR, `${slug}.mdx`));
  return { ...post, slug };
}

/**
 * 扫 content/posts/ 读取所有文章的 frontmatter（不编译正文）并按日期降序排序。
 * 供列表页 `/blog` 用——gray-matter 只切 YAML 头，即使有上百篇也很轻。
 */
export function getAllPosts(): Array<Post & { slug: string }> {
  const slugs = getPostSlugs();
  const posts = slugs.map((slug) => {
    const post = parsePost(path.join(POSTS_DIR, `${slug}.mdx`));
    return { ...post, slug };
  });
  // 按 date 降序（新文章在前）
  return posts.sort((a, b) => (a.date > b.date ? -1 : 1));
}
