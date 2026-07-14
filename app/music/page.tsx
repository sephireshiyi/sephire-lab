import Link from "next/link";
import { getAllAlbums } from "@/lib/music";

// 专辑墙索引页：build 时消费 getAllAlbums()（已按年份降序）。
// 纯静态、无 client 端能力，所以是 server component（不加 "use client"）。
export default function MusicPage() {
  const albums = getAllAlbums();

  return (
    <div className="mx-auto max-w-wide px-lg py-4xl">
      {/* 专辑墙：纯封面网格，参考设计图无标题无文字信息。 */}
      <ul className="grid grid-cols-2 gap-3xl md:grid-cols-3 lg:grid-cols-4">
        {albums.map((album) => (
          <li key={album.slug}>
            <Link href={`/music/${album.slug}`} className="block">
              {/* eslint-disable-next-line @next/next/no-img-element --
                  静态导出 + images.unoptimized，封面是预优化静态图，用普通 <img> 即可。 */}
              <img
                src={album.cover}
                alt={`${album.title} 专辑封面`}
                className="aspect-square w-full rounded-lg object-cover transition-transform hover:scale-105"
                style={{ backgroundColor: "var(--bg-secondary)" }}
              />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
