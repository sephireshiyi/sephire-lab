import Link from "next/link";
import Image from "next/image";
import { getAllGalleries } from "@/lib/gallery";
import { formatDate } from "@/lib/content";

/**
 * /gallery 照片集索引页（基础骨架）。
 *
 * Server Component：在 build（output: "export"）时调用 getAllGalleries() 读取并 zod 校验
 * content/gallery/*.yaml——这样 Gallery YAML 在构建期就被真正消费，无效内容会让 build 失败。
 *
 * 视觉只做克制的封面卡片网格；导航自动隐藏、边缘预览、hover 放大等高保真横向摄影集
 * 交互留到设计稿交付后单独实现。
 */
export default function GalleryListPage() {
  const galleries = getAllGalleries(); // 已按日期降序

  return (
    <div className="mx-auto max-w-[800px] px-lg py-4xl">
      <h1
        className="mb-3xl text-4xl font-bold"
        style={{ color: "var(--text-primary)" }}
      >
        Gallery
      </h1>

      {galleries.length === 0 ? (
        <p style={{ color: "var(--text-secondary)" }}>暂无照片集</p>
      ) : (
        <div className="grid grid-cols-1 gap-2xl sm:grid-cols-2">
          {galleries.map((gallery) => (
            <Link
              key={gallery.slug}
              href={`/gallery/${gallery.slug}`}
              className="group block"
            >
              {/* cover 字段只有路径、没有宽高，所以用「固定比例容器 + fill」统一裁切，
                  避免不同封面尺寸把网格撑乱。bg-hover 作为图片加载前的占位底色。 */}
              <div
                className="relative aspect-[3/2] overflow-hidden rounded-sm"
                style={{ backgroundColor: "var(--bg-hover)" }}
              >
                <Image
                  src={gallery.cover}
                  alt={gallery.title}
                  fill
                  sizes="(min-width: 640px) 400px, 100vw"
                  className="object-cover transition-opacity group-hover:opacity-90"
                />
              </div>

              <h2
                className="mt-md text-2xl font-semibold transition-colors group-hover:opacity-70"
                style={{ color: "var(--text-primary)" }}
              >
                {gallery.title}
              </h2>
              <time
                dateTime={gallery.date}
                className="mt-2xs block text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {formatDate(gallery.date)}
              </time>
              <p
                className="mt-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {gallery.summary}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
