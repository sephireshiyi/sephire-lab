import Link from "next/link";

/**
 * 极简个人说明页：一段个人说明、几个链接/联系方式、一句站点说明。
 * 不做长履历或时间线。基础 MVP 不挂全局 footer，链接与联系方式集中放在这里。
 *
 * 下方链接为占位，站点所有者后续替换为真实地址。
 */
const links = [
  { label: "Email", href: "mailto:hello@example.com" },
  { label: "GitHub", href: "https://github.com/" },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[800px] px-lg py-4xl">
      <h1
        className="mb-xl text-4xl font-bold tracking-tight"
        style={{ color: "var(--text-primary)" }}
      >
        About
      </h1>

      <p
        className="text-lg leading-relaxed"
        style={{ color: "var(--text-secondary)" }}
      >
        我是 Sephire，一个喜欢写字、听音乐和拍照片的人。这里随手记录一些
        想法、片段和作品。
      </p>

      <div className="mt-2xl flex flex-wrap gap-lg">
        {links.map((link) => (
          <Link
            key={link.label}
            href={link.href}
            className="text-base underline transition-opacity hover:opacity-70"
            style={{ color: "var(--text-primary)" }}
          >
            {link.label}
          </Link>
        ))}
      </div>

      <p
        className="mt-3xl text-sm"
        style={{ color: "var(--text-secondary)" }}
      >
        Sephire Lab 是一个纯静态的个人站点，汇集写作、音乐与摄影。
      </p>
    </div>
  );
}
