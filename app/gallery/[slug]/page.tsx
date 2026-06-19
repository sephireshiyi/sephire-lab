import Image from "next/image";
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
 * /gallery/[slug] 照片集详情页（基础骨架）。
 *
 * 调用 getGalleryBySlug() 读取并 zod 校验单个照片集 YAML，纵向铺开全部网页优化图，
 * 用来验证内容模型 + 动态路由预生成 + 静态导出链路是否跑通。
 *
 * 非目标（留到设计稿后）：横向摄影集浏览、导航自动隐藏、边缘低透明预览、hover 放大、
 * 文字下滑/展开、原图或高分辨率下载。
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
    <div className="mx-auto max-w-[1000px] px-lg py-4xl">
      <header className="mb-3xl">
        <h1
          className="text-4xl font-bold tracking-tight"
          style={{ color: "var(--text-primary)" }}
        >
          {gallery.title}
        </h1>
        <time
          dateTime={gallery.date}
          className="mt-sm block text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          {formatDate(gallery.date)}
        </time>
        <p className="mt-md text-lg" style={{ color: "var(--text-secondary)" }}>
          {gallery.summary}
        </p>
      </header>

      {/* 基础骨架：纵向排列全部照片。每张图用 YAML 里记录的真实 width/height，
          配合 h-auto w-full 保持宽高比，静态导出下没有运行时优化器也不会布局抖动（CLS）。 */}
      <div className="space-y-3xl">
        {gallery.photos.map((photo, i) => (
          <figure key={`${photo.src}-${i}`}>
            <Image
              src={photo.src}
              alt={photo.alt}
              width={photo.width}
              height={photo.height}
              className="h-auto w-full rounded-sm"
            />
            {(photo.caption || photo.note) && (
              <figcaption className="mt-md text-sm leading-relaxed">
                {photo.caption && (
                  <span
                    className="font-medium"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {photo.caption}
                  </span>
                )}
                {photo.note && (
                  <span
                    className="block"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {photo.note}
                  </span>
                )}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
    </div>
  );
}
