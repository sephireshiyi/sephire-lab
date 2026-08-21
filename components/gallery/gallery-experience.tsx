"use client";

import Image from "next/image";
import Link from "next/link";
import {
  type CSSProperties,
  type KeyboardEvent,
  type TouchEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useSiteChrome } from "@/components/layout/site-chrome-context";
import type { Gallery, Photo } from "@/lib/gallery";

const HEADER_REASON = "gallery-browsing";
const GALLERY_GAP = "clamp(1.5rem, 6vw, 5rem)";
const WHEEL_PAGE_THRESHOLD = 100;
const WHEEL_PAGE_COOLDOWN = 250;
const WHEEL_NOISE_FLOOR = 2;
const SCROLL_SETTLE_DELAY = 150;

type GalleryExperienceProps = {
  gallery: Gallery;
  formattedDate: string;
};

type GallerySlideStyle = CSSProperties & {
  "--gallery-mobile-width": string;
  "--gallery-desktop-width": string;
};

type GallerySpacerStyle = CSSProperties & {
  "--gallery-mobile-spacer": string;
  "--gallery-desktop-spacer": string;
};

function getSlideStyle(photo: Photo): GallerySlideStyle {
  const aspectRatio = photo.width / photo.height;

  return {
    aspectRatio: `${photo.width} / ${photo.height}`,
    "--gallery-mobile-width": `min(88vw, ${68 * aspectRatio}dvh)`,
    "--gallery-desktop-width": `min(78vw, ${74 * aspectRatio}dvh)`,
  };
}

function getSpacerStyle(photo: Photo): GallerySpacerStyle {
  const aspectRatio = photo.width / photo.height;

  return {
    "--gallery-mobile-spacer": `max(0px, calc(50vw - min(44vw, ${34 * aspectRatio}dvh) - ${GALLERY_GAP}))`,
    "--gallery-desktop-spacer": `max(0px, calc(50vw - min(39vw, ${37 * aspectRatio}dvh) - ${GALLERY_GAP}))`,
  };
}

function normalizeWheelDelta(
  delta: number,
  deltaMode: number,
  pageSize: number,
) {
  if (deltaMode === WheelEvent.DOM_DELTA_LINE) {
    return delta * 16;
  }

  if (deltaMode === WheelEvent.DOM_DELTA_PAGE) {
    return delta * pageSize;
  }

  return delta;
}

function getScrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}

export function GalleryExperience({
  gallery,
  formattedDate,
}: GalleryExperienceProps) {
  const { hideHeader, showHeader } = useSiteChrome();
  const trackRef = useRef<HTMLDivElement>(null);
  const detailsRef = useRef<HTMLElement>(null);
  const slideRefs = useRef<Array<HTMLElement | null>>([]);
  const touchOriginRef = useRef<{ x: number; y: number } | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const activeIndexRef = useRef(activeIndex);
  useEffect(() => {
    activeIndexRef.current = activeIndex;
  }, [activeIndex]);

  // 翻页的权威位置：连续翻页基于它推进，避免读到滚动中途的临时索引
  const targetIndexRef = useRef(0);

  const activePhoto = gallery.photos[activeIndex];

  const markBrowsing = useCallback(() => {
    hideHeader(HEADER_REASON);
  }, [hideHeader]);

  const revealHeader = useCallback(() => {
    showHeader(HEADER_REASON);
  }, [showHeader]);

  const goToPhoto = useCallback(
    (index: number) => {
      const boundedIndex = Math.max(
        0,
        Math.min(index, gallery.photos.length - 1),
      );

      markBrowsing();
      targetIndexRef.current = boundedIndex;
      setActiveIndex(boundedIndex);
      slideRefs.current[boundedIndex]?.scrollIntoView({
        behavior: getScrollBehavior(),
        block: "nearest",
        inline: "center",
      });
      trackRef.current?.focus({ preventScroll: true });
    },
    [gallery.photos.length, markBrowsing],
  );

  const openDetails = useCallback(() => {
    revealHeader();
    setDetailsVisible(true);
    detailsRef.current?.scrollIntoView({
      behavior: getScrollBehavior(),
      block: "start",
    });
  }, [revealHeader]);

  const returnToGallery = useCallback(() => {
    revealHeader();
    setDetailsVisible(false);
    trackRef.current?.scrollIntoView({
      behavior: getScrollBehavior(),
      block: "start",
    });
    trackRef.current?.focus({ preventScroll: true });
  }, [revealHeader]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          goToPhoto(activeIndex - 1);
          break;
        case "ArrowRight":
          event.preventDefault();
          goToPhoto(activeIndex + 1);
          break;
        case "Home":
          event.preventDefault();
          goToPhoto(0);
          break;
        case "End":
          event.preventDefault();
          goToPhoto(gallery.photos.length - 1);
          break;
        case "ArrowDown":
          event.preventDefault();
          openDetails();
          break;
        case "Escape":
          event.preventDefault();
          if (detailsVisible) {
            returnToGallery();
          } else {
            revealHeader();
          }
          break;
      }
    },
    [
      activeIndex,
      detailsVisible,
      gallery.photos.length,
      goToPhoto,
      openDetails,
      returnToGallery,
      revealHeader,
    ],
  );

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const touch = event.touches[0];
    touchOriginRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    const origin = touchOriginRef.current;
    const touch = event.touches[0];

    if (!origin || !touch) {
      return;
    }

    const horizontalDistance = Math.abs(touch.clientX - origin.x);
    const verticalDistance = Math.abs(touch.clientY - origin.y);

    if (horizontalDistance > 12 && horizontalDistance > verticalDistance) {
      markBrowsing();
      touchOriginRef.current = null;
    }
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    let animationFrame = 0;
    let settleTimer = 0;

    const updateActivePhoto = () => {
      animationFrame = 0;
      const trackCenter = track.getBoundingClientRect().left + track.clientWidth / 2;
      let nearestIndex = 0;
      let nearestDistance = Number.POSITIVE_INFINITY;

      slideRefs.current.forEach((slide, index) => {
        if (!slide) {
          return;
        }

        const bounds = slide.getBoundingClientRect();
        const distance = Math.abs(bounds.left + bounds.width / 2 - trackCenter);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = index;
        }
      });

      setActiveIndex((current) =>
        current === nearestIndex ? current : nearestIndex,
      );
    };

    const handleScroll = () => {
      if (!animationFrame) {
        animationFrame = requestAnimationFrame(updateActivePhoto);
      }
      // 滚动停稳后把翻页基准同步到实际停靠的照片
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(() => {
        targetIndexRef.current = activeIndexRef.current;
      }, SCROLL_SETTLE_DELAY);
    };

    track.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", handleScroll);
      window.clearTimeout(settleTimer);
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) {
      return;
    }

    let accumulatedDelta = 0;
    let cooldownUntil = 0;

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey || detailsVisible) {
        return;
      }

      const now = performance.now();
      const deltaX = normalizeWheelDelta(
        event.deltaX,
        event.deltaMode,
        track.clientWidth,
      );
      const deltaY = normalizeWheelDelta(
        event.deltaY,
        event.deltaMode,
        track.clientHeight,
      );

      if (Math.abs(deltaX) <= Math.abs(deltaY)) {
        // 纵向占主导：向下滚进入文字区，向上滚不拦截
        if (deltaY <= 0) {
          return;
        }

        event.preventDefault();
        if (now >= cooldownUntil) {
          accumulatedDelta = 0;
          cooldownUntil = now + WHEEL_PAGE_COOLDOWN;
          openDetails();
        }
        return;
      }

      // 横向翻页：首/末张继续向外划时放行，交给页面默认行为
      const maximumScroll = track.scrollWidth - track.clientWidth;
      const movingPastStart = deltaX < 0 && track.scrollLeft <= 1;
      const movingPastEnd = deltaX > 0 && track.scrollLeft >= maximumScroll - 1;

      if (movingPastStart || movingPastEnd) {
        return;
      }

      event.preventDefault();

      // 冷却期内吞掉惯性事件；到期后即使同一手势仍在输出也恢复累积，
      // 使持续快划能按节奏连续翻页，而单次轻扫的惯性尾巴够不到阈值
      if (now < cooldownUntil) {
        return;
      }

      if (Math.abs(deltaX) < WHEEL_NOISE_FLOOR) {
        return;
      }

      // 方向反转时重新累积，避免正负抵消或误翻
      if (
        accumulatedDelta !== 0 &&
        Math.sign(deltaX) !== Math.sign(accumulatedDelta)
      ) {
        accumulatedDelta = 0;
      }

      accumulatedDelta += deltaX;
      if (Math.abs(accumulatedDelta) >= WHEEL_PAGE_THRESHOLD) {
        const direction = accumulatedDelta > 0 ? 1 : -1;
        accumulatedDelta = 0;
        cooldownUntil = now + WHEEL_PAGE_COOLDOWN;
        goToPhoto(targetIndexRef.current + direction);
      }
    };

    track.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      track.removeEventListener("wheel", handleWheel);
    };
  }, [detailsVisible, goToPhoto, openDetails]);

  useEffect(() => {
    const details = detailsRef.current;
    if (!details) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setDetailsVisible(entry.isIntersecting);
        if (entry.isIntersecting) {
          revealHeader();
        } else {
          // 滚回照片区即恢复沉浸浏览
          markBrowsing();
        }
      },
      { threshold: 0.18 },
    );

    observer.observe(details);
    return () => observer.disconnect();
  }, [markBrowsing, revealHeader]);

  // 挂载后立即隐藏 header，直接进入沉浸浏览
  useEffect(() => {
    hideHeader(HEADER_REASON);
  }, [hideHeader]);

  useEffect(() => () => revealHeader(), [revealHeader]);

  return (
    <article
      className="mt-[calc(-1*var(--header-height))]"
      onPointerMove={(event) => {
        if (event.clientY <= 40) {
          revealHeader();
        }
      }}
    >
      <h1 className="sr-only">{gallery.title}</h1>

      <section className="relative h-[100dvh] overflow-hidden">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-10"
        />

        <div
          ref={trackRef}
          aria-label={`${gallery.title}，共 ${gallery.photos.length} 张照片`}
          aria-roledescription="carousel"
          className="gallery-track flex h-full snap-x snap-mandatory items-center gap-[var(--gallery-gap)] overflow-x-auto overscroll-x-contain focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-[var(--accent-color)]"
          onKeyDown={handleKeyDown}
          onTouchEnd={() => {
            touchOriginRef.current = null;
          }}
          onTouchMove={handleTouchMove}
          onTouchStart={handleTouchStart}
          role="region"
          style={{
            "--gallery-gap": GALLERY_GAP,
            touchAction: "pan-x pan-y",
          } as CSSProperties}
          tabIndex={0}
        >
          <div
            aria-hidden="true"
            className="w-[var(--gallery-mobile-spacer)] shrink-0 md:w-[var(--gallery-desktop-spacer)]"
            style={getSpacerStyle(gallery.photos[0])}
          />

          {gallery.photos.map((photo, index) => {
            const isActive = index === activeIndex;
            const isAdjacent = Math.abs(index - activeIndex) === 1;

            return (
              <figure
                key={photo.src}
                ref={(node) => {
                  slideRefs.current[index] = node;
                }}
                aria-label={`${index + 1} / ${gallery.photos.length}：${photo.alt}`}
                aria-roledescription="slide"
                className="group m-0 w-[var(--gallery-mobile-width)] shrink-0 snap-center snap-always md:w-[var(--gallery-desktop-width)]"
                role="group"
                style={getSlideStyle(photo)}
              >
                <button
                  aria-current={isActive ? "true" : undefined}
                  aria-label={
                    isActive
                      ? `当前照片：${photo.alt}`
                      : `查看第 ${index + 1} 张照片：${photo.alt}`
                  }
                  className={`block h-auto w-full overflow-hidden rounded-sm transition-[opacity,transform] duration-300 ease-out focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-color)] motion-reduce:transition-none ${
                    isActive
                      ? "cursor-default opacity-100"
                      : isAdjacent
                        ? "cursor-pointer opacity-35 hover:scale-[1.02] hover:opacity-65 focus-visible:scale-[1.02] focus-visible:opacity-65 motion-reduce:hover:scale-100 motion-reduce:focus-visible:scale-100"
                        : "cursor-pointer opacity-20 hover:opacity-45 focus-visible:opacity-45"
                  }`}
                  onClick={() => {
                    if (!isActive) {
                      goToPhoto(index);
                    }
                  }}
                  tabIndex={isAdjacent ? 0 : -1}
                  type="button"
                >
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    width={photo.width}
                    height={photo.height}
                    priority={index === 0}
                    sizes="(min-width: 768px) 78vw, 88vw"
                    className="h-auto w-full object-contain"
                  />
                </button>
                <figcaption className="sr-only">
                  {[photo.caption, photo.note].filter(Boolean).join("。") ||
                    photo.alt}
                </figcaption>
              </figure>
            );
          })}

          <div
            aria-hidden="true"
            className="w-[var(--gallery-mobile-spacer)] shrink-0 md:w-[var(--gallery-desktop-spacer)]"
            style={getSpacerStyle(gallery.photos.at(-1) ?? gallery.photos[0])}
          />
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-[max(var(--spacing-lg),env(safe-area-inset-bottom))] z-10 flex items-center justify-center gap-lg text-xs tracking-[0.14em]">
          <Link
            className="pointer-events-auto rounded-full px-sm py-xs transition-opacity hover:opacity-65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]"
            href="/gallery"
            style={{
              backgroundColor: "color-mix(in srgb, var(--bg-primary) 82%, transparent)",
              color: "var(--text-primary)",
            }}
          >
            ← 影集
          </Link>
          <span
            aria-live="polite"
            className="rounded-full px-sm py-xs"
            style={{
              backgroundColor: "color-mix(in srgb, var(--bg-primary) 82%, transparent)",
              color: "var(--text-secondary)",
            }}
          >
            {String(activeIndex + 1).padStart(2, "0")} /{" "}
            {String(gallery.photos.length).padStart(2, "0")}
          </span>
          <button
            aria-controls="gallery-details"
            aria-expanded={detailsVisible}
            className="pointer-events-auto rounded-full px-sm py-xs transition-opacity hover:opacity-65 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent-color)]"
            onClick={openDetails}
            style={{
              backgroundColor: "color-mix(in srgb, var(--bg-primary) 82%, transparent)",
              color: "var(--text-primary)",
            }}
            type="button"
          >
            文字 ↓
          </button>
        </div>
      </section>

      <section
        ref={detailsRef}
        id="gallery-details"
        aria-labelledby="gallery-details-title"
        className="mx-auto flex min-h-[78dvh] max-w-note flex-col justify-center px-lg py-5xl"
      >
        <div className="flex items-baseline justify-between gap-lg">
          <h2
            id="gallery-details-title"
            className="text-3xl font-semibold tracking-tight"
            style={{ color: "var(--text-primary)" }}
          >
            {gallery.title}
          </h2>
          <span className="text-sm" style={{ color: "var(--text-secondary)" }}>
            {String(activeIndex + 1).padStart(2, "0")} /{" "}
            {String(gallery.photos.length).padStart(2, "0")}
          </span>
        </div>

        <time
          dateTime={gallery.date}
          className="mt-sm block text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          {formattedDate}
        </time>
        <p
          className="mt-xl text-lg leading-relaxed"
          style={{ color: "var(--text-secondary)" }}
        >
          {gallery.summary}
        </p>

        {(activePhoto.caption || activePhoto.note) && (
          <div
            className="mt-3xl border-t pt-xl"
            style={{ borderColor: "var(--border-color)" }}
          >
            {activePhoto.caption && (
              <p
                className="text-lg font-medium"
                style={{ color: "var(--text-primary)" }}
              >
                {activePhoto.caption}
              </p>
            )}
            {activePhoto.note && (
              <p
                className="mt-sm leading-relaxed"
                style={{ color: "var(--text-secondary)" }}
              >
                {activePhoto.note}
              </p>
            )}
          </div>
        )}

        <div className="mt-3xl flex items-center gap-xl">
          <button
            className="text-sm tracking-wide transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-color)]"
            onClick={returnToGallery}
            style={{ color: "var(--text-primary)" }}
            type="button"
          >
            返回影集 ↑
          </button>
          <Link
            className="text-sm tracking-wide transition-opacity hover:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--accent-color)]"
            href="/gallery"
            style={{ color: "var(--text-secondary)" }}
          >
            ← 返回影集列表
          </Link>
        </div>
      </section>
    </article>
  );
}
