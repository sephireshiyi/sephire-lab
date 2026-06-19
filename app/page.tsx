import Link from "next/link";
import { CursorInteractionLayer } from "@/components/home/cursor-interaction-layer";

/**
 * 首页四模块入口。展示名沿用全站导航的英文模块名（Writing / Music / Gallery / About），
 * 并列结构体现站点定位，而不再只突出 Recent Writing。
 */
const modules = [
  { href: "/writing", title: "Writing", description: "文章、随笔与记录。" },
  { href: "/music", title: "Music", description: "听过、喜欢的专辑墙。" },
  { href: "/gallery", title: "Gallery", description: "照片与摄影系列。" },
  { href: "/about", title: "About", description: "关于这个站点与我。" },
];

export default function Home() {
  return (
    <CursorInteractionLayer>
      {/* Hero 区：极简居中标题，占满首屏（100dvh），严格遵循设计稿。
          负 mt 抵消 main 的 padding-top，让标题落在视口几何中心（见 task2）。 */}
      <section className="mt-[calc(-1*var(--header-height))] flex min-h-[100dvh] items-center justify-center">
        <h1
          className="text-6xl font-medium tracking-tight md:text-7xl lg:text-8xl"
          style={{ color: "var(--text-primary)" }}
        >
          Sephire Lab
        </h1>
      </section>

      {/* 四模块入口区：下滚后出现，体现 Writing / Music / Gallery / About 的并列结构。
          容器宽度与内页一致（max-w-[800px]）；py-5xl 与上方满屏 Hero 拉开距离。 */}
      <section className="mx-auto max-w-[800px] px-lg py-5xl">
        <div className="grid grid-cols-1 gap-px sm:grid-cols-2">
          {modules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className="group block rounded-sm px-lg py-2xl transition-opacity hover:opacity-70"
            >
              <h2
                className="text-3xl font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {m.title}
              </h2>
              <p
                className="mt-sm text-base"
                style={{ color: "var(--text-secondary)" }}
              >
                {m.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </CursorInteractionLayer>
  );
}
