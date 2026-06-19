"use client";

import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { ThemeDropdown } from "@/components/theme/theme-dropdown";
import { LanguageDropdown } from "@/components/theme/language-dropdown";

export function SiteHeader() {
  return (
    <header
      className="fixed top-0 left-0 right-0 z-50"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="mx-auto max-w-full px-[4.5rem] py-3xl">
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

          {/* Theme & Language Dropdown - 右侧 */}
          <div className="flex items-center gap-[1.125rem]">
            <ThemeDropdown />
            <LanguageDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}
