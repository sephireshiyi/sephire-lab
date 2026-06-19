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
      // 基础 MVP 的 themeColor 背景：封面主题色自顶向下淡出。
      // 用 8 位 hex（#RRGGBB + "1f" alpha）做克制的渐隐，留待设计稿出来再做高保真 Apple Music 式背景。
      style={{
        background: `linear-gradient(180deg, ${album.themeColor}1f 0%, transparent 60%)`,
      }}
    >
      <div className="container mx-auto max-w-4xl px-lg py-4xl">
        <Link
          href="/music"
          className="mb-2xl inline-block text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          ← Music
        </Link>

        <div className="flex flex-col gap-2xl sm:flex-row sm:items-start">
          {/* 左侧：专辑封面 */}
          <div className="w-full sm:w-2/5 sm:flex-shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element --
                静态导出 + images.unoptimized，封面是预优化静态图，用普通 <img> 即可。 */}
            <img
              src={album.cover}
              alt={`${album.title} 专辑封面`}
              className="aspect-square w-full rounded-lg object-cover"
              style={{ backgroundColor: "var(--bg-secondary)" }}
            />
          </div>

          {/* 右侧：专辑信息、短评、（占位）播放区域、曲目 */}
          <div className="flex-1">
            <h1
              className="text-4xl font-bold tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              {album.title}
            </h1>
            <p
              className="mt-sm text-lg"
              style={{ color: "var(--text-secondary)" }}
            >
              {album.artist} · {album.year}
            </p>

            <p
              className="mt-lg leading-relaxed"
              style={{ color: "var(--text-primary)" }}
            >
              {album.note}
            </p>

            {/* 非交互播放占位：纯静态视觉，没有可点击但不能播放的假按钮。
                MVP 不接入音频；最终播放区域视觉等设计稿再做。 */}
            <div
              className="mt-xl rounded-md px-md py-md text-sm"
              style={{
                border: "1px dashed var(--border-color)",
                color: "var(--text-secondary)",
              }}
            >
              {album.playbackPlaceholder ?? "音乐片段播放能力将在后续阶段接入"}
            </div>

            {/* 曲目列表（若有）：纯展示，不做播放计算。 */}
            {album.tracks && album.tracks.length > 0 ? (
              <ol className="mt-xl flex flex-col gap-xs">
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
    </div>
  );
}
