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
      // themeColor 背景：封面主题色以左上（大致对齐封面位置）为中心向外淡出到
      // var(--bg-primary)。用 var(--bg-primary) 作渐变终点让 light/dark 自动适配
      // （无需 dark: 变体、无需 per-theme alpha）。光晕用 ~25% alpha，不压文字。
      style={{
        background: `radial-gradient(ellipse 90% 70% at 22% 18%, ${album.themeColor}40 0%, var(--bg-primary) 72%)`,
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

        {/* 首屏：左大封面 + 右核心信息（标题 / 艺术家·年份 / tags）。 */}
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

          {/* 右侧：核心信息（首屏主信息） */}
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

            {/* tags 标签行：用 themeColor 低 alpha 做底/边，与专辑主题色呼应；
                文字用 var(--text-primary) 保证 light/dark 可读。索引页不渲染 tags。 */}
            {album.tags && album.tags.length > 0 ? (
              <ul className="mt-lg flex flex-wrap gap-xs">
                {album.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full px-sm py-2xs text-xs"
                    style={{
                      border: `1px solid ${album.themeColor}66`,
                      color: "var(--text-primary)",
                      backgroundColor: `${album.themeColor}1a`,
                    }}
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        {/* 次级区：note 短评 + 播放占位 + 曲目列表。
            放到两栏布局之下的全宽次级区，视觉更次级，不压首屏。 */}
        <div className="mt-3xl">
          <p
            className="text-base leading-relaxed"
            style={{ color: "var(--text-secondary)" }}
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
  );
}
