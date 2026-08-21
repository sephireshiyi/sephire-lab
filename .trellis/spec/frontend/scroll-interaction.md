# Scroll & Pointer Interaction Guidelines

> Contracts for hijacking wheel / scroll input. Learned from `components/gallery/gallery-experience.tsx`
> (horizontal photo carousel), task `08-18-gallery-browsing-fixes`.

---

## Overview

Any component that intercepts `wheel` events to drive discrete navigation (carousels, paged
scrollers, snap galleries) must handle **trackpad inertia**. macOS trackpads emit a long,
decaying stream of `wheel` events from a single physical swipe. Browsers expose no
"gesture ended" event, so the component has to reconstruct gesture boundaries itself.

The rules below are what actually shipped after three rounds of real-hardware testing.
Getting any one of them wrong produces a specific, reproducible defect.

---

## Rules

### 1. Never map raw wheel deltas onto `scrollBy` for snap-based paging

```tsx
// ❌ one swipe skips two photos
track.scrollBy({ left: normalizedDelta });
```

Inertia keeps pushing past the first snap point. Accumulate delta instead and call a
discrete `goToPhoto(index)` once a threshold is crossed.

### 2. Split by axis explicitly — do not pick a "dominant delta"

```tsx
// ❌ vertical gestures get hijacked into horizontal paging
const dominant = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
```

Normalize `deltaX` and `deltaY` separately (each still needs `deltaMode` handling for
`DOM_DELTA_LINE` / `DOM_DELTA_PAGE`), then branch: horizontal → page; vertical-down → the
vertical action; vertical-up → do not intercept, let the browser scroll.

### 3. Use a fixed cooldown, not "lock until the gesture goes silent"

Locking until N ms of total wheel silence swallows every event of a sustained fast swipe,
so the UI **stalls** and cannot chain pages. Use a monotonic `performance.now()` cooldown
(~250 ms in the gallery). When it expires, resume accumulating even if the same gesture is
still streaming — sustained swipes then chain at a controlled cadence, while a single
flick's decaying tail cannot re-reach the threshold.

### 4. Keep an authoritative target index separate from the observed active index

A scroll listener that derives "nearest slide to center" rewrites the active index
*continuously during the animation*. Paging off that value reads an intermediate position
and can **jump backwards**.

```tsx
const targetIndexRef = useRef(0); // authoritative — written by goToPhoto
// paging: goToPhoto(targetIndexRef.current + direction)
// re-sync from the observed index only after scrolling settles (~150ms debounce)
```

`scrollend` would be the natural signal but Safari does not support it — debounce the
`scroll` event instead.

### 5. Tune single-flick isolation with threshold + noise floor + direction reset

- Threshold ~100 px of accumulated delta per page.
- Ignore events below a ~2 px noise floor.
- Reset the accumulator when `Math.sign(delta)` flips, so opposing inertia cannot cancel out
  or trigger a wrong-direction page.

### 6. Do not combine CSS `scroll-behavior: smooth` with programmatic smooth scrolling

`scroll-smooth` on a snap track re-smooths snap corrections and fights interrupted
`scrollIntoView({ behavior: "smooth" })` calls. Drop the class and pass `behavior`
explicitly, resolved through a `prefers-reduced-motion` check:

```tsx
function getScrollBehavior(): ScrollBehavior {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}
```

This is also *stricter* for reduced-motion users: CSS `scroll-smooth` would otherwise
animate user-driven scrolls regardless of the media query.

### 7. `preventDefault` requires a non-passive listener

Attach via `addEventListener("wheel", handler, { passive: false })` in an effect. React's
`onWheel` prop is passive in React 19 and cannot call `preventDefault()`.

---

## Chrome (header/nav) visibility coordination

Immersive views coordinate with the site header through `useSiteChrome`'s
`hideHeader(reason)` / `showHeader(reason)`. Contract:

- Hide on mount for an immersive view; **always** restore on unmount
  (`useEffect(() => () => showHeader(reason), [showHeader])`) or the header stays hidden
  after navigating away.
- Every automatic hide needs a discoverable reveal affordance — the gallery reveals on
  `pointermove` within 40 px of the viewport top.
- If an `IntersectionObserver` reveals the header when a section scrolls into view, add the
  symmetric `else` branch to hide it again on exit. Missing this is why the header stuck
  around after scrolling back from the text section.

---

## Common Mistakes

| Symptom | Root cause |
|---|---|
| One swipe advances two items | Raw delta → `scrollBy`; inertia overshoots the snap point |
| Vertical scroll hijacked into paging | "Dominant delta" instead of per-axis branching |
| Fast repeated swipes stall | Lock-until-silence swallows the whole gesture |
| Paging occasionally jumps backwards | Paging off the scroll-observed index instead of an authoritative target ref |
| Header stays visible after leaving a section | `IntersectionObserver` reveals without a symmetric hide branch |
| `preventDefault` warning in console | Listener registered as passive (React's `onWheel`) |
