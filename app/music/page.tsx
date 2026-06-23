import Link from "next/link";
import { getAllAlbums } from "@/lib/music";

// 专辑墙索引页：build 时消费 getAllAlbums()（已按年份降序）。
// 纯静态、无 client 端能力，所以是 server component（不加 "use client"）。
export default function MusicPage() {
  const albums = getAllAlbums();

  return (
    <div className="container mx-auto max-w-5xl px-lg py-4xl">
      <h1
        className="mb-xl text-4xl font-bold tracking-tight"
        style={{ color: "var(--text-primary)" }}
      >
        Music
      </h1>

      {/* 专辑墙：封面方块网格，每张专辑链到详情页。 */}
      <ul className="grid grid-cols-2 gap-2xl sm:grid-cols-3">
        {albums.map((album) => (
          <li key={album.slug}>
            <Link href={`/music/${album.slug}`} className="block">
              {/* eslint-disable-next-line @next/next/no-img-element --
                  静态导出 + images.unoptimized，封面是预优化静态图，用普通 <img> 即可。 */}
              <img
                src={album.cover}
                alt={`${album.title} 专辑封面`}
                className="aspect-square w-full rounded-lg object-cover"
                style={{ backgroundColor: "var(--bg-secondary)" }}
              />
              <p
                className="mt-md text-sm font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {album.title}
              </p>
              <p
                className="text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                {album.artist} · {album.year}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
