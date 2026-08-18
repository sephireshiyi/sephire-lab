import { GalleryExperience } from "@/components/gallery/gallery-experience";
import { formatDate } from "@/lib/content";
import { getGalleryBySlug, getGallerySlugs } from "@/lib/gallery";

// 只允许 generateStaticParams 列出的 slug；访问未定义路由直接 404（不在请求时动态编译）。
// 与 /writing/[slug] 一致，也是 output: "export" 的硬性要求。
export const dynamicParams = false;

// build 时扫 content/gallery/ 把每个照片集 slug 预生成为静态路由。
export function generateStaticParams() {
  return getGallerySlugs().map((slug) => ({ slug }));
}

/**
 * /gallery/[slug] 的构建期数据边界。
 *
 * YAML 与文件系统读取留在 Server Component；客户端只接收已经过 zod 校验、
 * 可序列化的 Gallery 数据，用于横向浏览、Header 状态和文字区交互。
 */
export default async function GalleryDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // ⚠️ Next 16：params 是 Promise，必须 await，否则拿到 undefined。
  const { slug } = await params;
  const gallery = getGalleryBySlug(slug);

  return (
    <GalleryExperience gallery={gallery} formattedDate={formatDate(gallery.date)} />
  );
}
