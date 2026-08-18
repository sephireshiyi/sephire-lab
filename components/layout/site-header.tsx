"use client";

import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { useSiteChrome } from "@/components/layout/site-chrome-context";
import { ThemeDropdown } from "@/components/theme/theme-dropdown";

export function SiteHeader() {
  const { headerHidden, revealHeader } = useSiteChrome();

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none"
      data-site-header-hidden={headerHidden ? "true" : "false"}
      onFocusCapture={revealHeader}
      style={{
        backgroundColor: "var(--bg-primary)",
        opacity: headerHidden ? 0 : 1,
        transform: headerHidden
          ? "translateY(calc(-100% - var(--spacing-xl)))"
          : "translateY(0)",
      }}
    >
      <div className="mx-auto max-w-full px-[4.5rem] py-2xl">
        <div className="flex items-center justify-between">
          {/* Logo - 点击回首页 */}
          <Link
            href="/"
            className="inline-flex items-center transition-opacity"
            aria-label="Sephire Lab Home"
          >
            <Logo />
          </Link>

          {/* Navigation - 居中 */}
          <nav className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-[3.75rem]">
            <Link
              href="/writing"
              className="group relative text-xl font-normal transition-opacity hover:opacity-70"
              style={{ color: "var(--text-primary)" }}
            >
              Writing
              <span
                className="absolute left-0 right-0 -top-[1.125rem] h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ backgroundColor: "var(--accent-color)" }}
              />
            </Link>
            <Link
              href="/music"
              className="group relative text-xl font-normal transition-opacity hover:opacity-70"
              style={{ color: "var(--text-primary)" }}
            >
              Music
              <span
                className="absolute left-0 right-0 -top-[1.125rem] h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ backgroundColor: "var(--accent-color)" }}
              />
            </Link>
            <Link
              href="/gallery"
              className="group relative text-xl font-normal transition-opacity hover:opacity-70"
              style={{ color: "var(--text-primary)" }}
            >
              Gallery
              <span
                className="absolute left-0 right-0 -top-[1.125rem] h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ backgroundColor: "var(--accent-color)" }}
              />
            </Link>
            <Link
              href="/about"
              className="group relative text-xl font-normal transition-opacity hover:opacity-70"
              style={{ color: "var(--text-primary)" }}
            >
              About
              <span
                className="absolute left-0 right-0 -top-[1.125rem] h-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ backgroundColor: "var(--accent-color)" }}
              />
            </Link>
          </nav>

          {/* Theme Dropdown - 右侧。语言切换控件按基础 MVP 决策隐藏（i18n 留作未来任务，
              组件 components/theme/language-dropdown.tsx 暂保留不挂载）。 */}
          <div className="flex items-center gap-[1.125rem]">
            <ThemeDropdown />
          </div>
        </div>
      </div>

      {/* 固定在 Header 下方，让滚入顶部的全站内容逐渐融入当前主题背景。 */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-full h-xl"
        style={{
          background:
            "linear-gradient(to bottom, var(--bg-primary), transparent)",
        }}
      />
    </header>
  );
}
