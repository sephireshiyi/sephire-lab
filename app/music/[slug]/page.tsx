import Link from "next/link";
import { getMusicBySlug, getMusicSlugs } from "@/lib/music";

// 只允许 generateStaticParams 列出的 slug；访问未定义专辑直接 404（不在请求时动态生成）。
// 与 app/writing/[slug]/page.tsx 保持一致，满足 output: "export" 的静态导出要求。
export const dynamicParams = false;

// build 时扫 content/music/ 把每张专辑 slug 预生成为静态路由。
export function generateStaticParams() {
  return getMusicSlugs().map((slug) => ({ slug }));
}

export default async function AlbumPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // ⚠️ Next 16：params 是 Promise，必须 await。
  const { slug } = await params;

  // 读取并 zod 校验单张专辑；非法 YAML/schema 会在 build 时直接失败。
  const album = getMusicBySlug(slug);

  return (
    <div
      className="min-h-screen"
      style={{
        background: `radial-gradient(ellipse 60% 50% at 20% 30%, ${album.themeColor}18 0%, var(--bg-primary) 70%)`,
      }}
    >
      <div className="mx-auto max-w-page px-lg py-4xl">
        <Link
          href="/music"
          className="mb-3xl inline-block text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          ← Music
        </Link>

        {/* 首屏：左大封面 + 右核心信息，垂直居中对齐 */}
        <div className="grid grid-cols-1 items-center gap-3xl md:grid-cols-[2fr_3fr] md:gap-4xl">
          {/* 左侧：专辑封面 */}
          <div className="mx-auto w-full max-w-cover md:mx-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={album.cover}
              alt={`${album.title} 专辑封面`}
              className="aspect-square w-full rounded-lg object-cover shadow-2xl"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            />
          </div>

          {/* 右侧：核心信息（垂直居中） */}
          <div className="text-center md:text-left">
            <h1
              className="text-2xl font-bold tracking-tight md:text-3xl lg:text-4xl"
              style={{ color: "var(--text-primary)" }}
            >
              {album.title}
            </h1>
            <p
              className="mt-md text-lg md:text-xl"
              style={{ color: "var(--text-secondary)" }}
            >
              {album.artist}
            </p>

            {/* tags 标签行 */}
            {album.tags && album.tags.length > 0 ? (
              <ul className="mt-lg flex flex-wrap justify-center gap-xs md:justify-start">
                {album.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full px-md py-xs text-sm"
                    style={{
                      border: `1px solid ${album.themeColor}40`,
                      color: "var(--text-primary)",
                      backgroundColor: `${album.themeColor}10`,
                    }}
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        {/* 次级区：note 短评 + 曲目列表 */}
        <div className="mt-5xl max-w-note">
          <p
            className="text-base leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
          >
            {album.note}
          </p>

          {/* 曲目列表（若有） */}
          {album.tracks && album.tracks.length > 0 ? (
            <ol className="mt-2xl flex flex-col gap-xs">
              {album.tracks.map((track, index) => (
                <li
                  key={`${track.title}-${index}`}
                  className="flex items-baseline justify-between border-b py-sm text-sm"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <span style={{ color: "var(--text-primary)" }}>
                    <span
                      className="mr-md tabular-nums"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {index + 1}
                    </span>
                    {track.title}
                  </span>
                  {track.duration ? (
                    <span
                      className="tabular-nums"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      {track.duration}
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          ) : null}
        </div>
      </div>
    </div>
  );
}
