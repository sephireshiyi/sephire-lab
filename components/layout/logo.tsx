"use client";

import Image from "next/image";

/**
 * 站点 Logo —— 根据当前主题展示对应渲染的图。
 *
 * 实现方式：渲染三张 <Image>，用 CSS 祖先选择器（`.dark`、`.reader` 由 next-themes
 * 挂在 <html> 上）控制显示哪一张。优点：无需 JS 状态、不会有 hydration 闪烁、
 * 主题切换瞬时；缺点：浏览器会预加载三张图，但 Next.js Image 会优化体积。
 *
 * 三个图文件预期渲染对应主题背景下的玻璃色散效果：
 * - /logo-light.png   背景 #F9F9F9 烘焙
 * - /logo-dark.png    背景 #1E1E1E 烘焙
 * - /logo-reader.png  背景 #EAE5D4 烘焙
 *
 * 目前三个文件是同一张占位图，待 Figma 导出变体后替换即可。
 */
const LOGO_WIDTH = 1968;
const LOGO_HEIGHT = 928;

interface LogoProps {
  /** 控制尺寸的 Tailwind 类，默认 h-9 w-auto */
  className?: string;
}

export function Logo({ className = "h-9 w-auto" }: LogoProps) {
  return (
    <span className="inline-flex">
      <Image
        src="/logo-light.png"
        alt=""
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        className={`${className} block [.dark_&]:hidden [.reader_&]:hidden`}
        priority
      />
      <Image
        src="/logo-dark.png"
        alt=""
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        className={`${className} hidden [.dark_&]:block`}
        priority
      />
      <Image
        src="/logo-read.png"
        alt=""
        width={LOGO_WIDTH}
        height={LOGO_HEIGHT}
        className={`${className} hidden [.reader_&]:block`}
        priority
      />
    </span>
  );
}
