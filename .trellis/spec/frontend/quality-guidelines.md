# Quality Guidelines

> Code quality standards for frontend development.

---

## Overview

<!--
Document your project's quality standards here.

Questions to answer:
- What patterns are forbidden?
- What linting rules do you enforce?
- What are your testing requirements?
- What code review standards apply?
-->

(To be filled by the team)

---

## Forbidden Patterns

### Don't: `max-w-{2xs…5xl}` for layout container widths

This project defines a custom spacing scale in `app/globals.css`
(`@theme { --spacing-2xs … --spacing-5xl }`). In Tailwind v4, the `max-w-*`
utilities read named values from BOTH the `--container-*` and `--spacing-*`
theme namespaces, and **a same-suffix `--spacing-*` key shadows the built-in
`--container-*` value**. Because our spacing scale reuses the names
`sm / lg / xl / 2xl / 3xl / 4xl / 5xl`, every `max-w-<that-name>` silently
compiles to a tiny spacing value instead of the intended container width — no
error, just a wrong number.

**Proof (compiled CSS):**

```css
/* Names our --spacing-* scale defines → hijacked to spacing values */
.max-w-sm  { max-width: var(--spacing-sm);  }  /* intended 24rem → 0.75rem (12px)  */
.max-w-3xl { max-width: var(--spacing-3xl); }  /* intended 48rem → 3rem   (48px)   */
.max-w-5xl { max-width: var(--spacing-5xl); }  /* intended 64rem → 5rem   (80px)   */

/* Name our scale does NOT define → falls through to the container value ✓ */
.max-w-6xl { max-width: var(--container-6xl); }  /* 72rem, works by luck    */
```

**Real bug this caused:** the `/music/[slug]` hero collapsed into an ~80px
column (`max-w-5xl`) and the cover shrank to a 12px dot (`max-w-sm`), while
`/music` looked fine only because it happened to use `max-w-6xl`. Two nearly
identical lines, opposite fates — the fingerprint of a name collision.

**Forbidden:** `max-w-2xs`, `max-w-xs`, `max-w-sm`, `max-w-md`, `max-w-lg`,
`max-w-xl`, `max-w-2xl`, `max-w-3xl`, `max-w-4xl`, `max-w-5xl` (every suffix our
`--spacing-*` scale occupies). `max-w-6xl` / `max-w-7xl` are technically safe
today but still prefer the semantic tokens below so intent is explicit and no
future `--spacing-6xl` can break them.

**Instead:** use the semantic `--container-*` tokens (see Required Patterns).

---

## Required Patterns

### Convention: page/layout widths use semantic `--container-*` tokens

**What:** Container and column widths are declared as intent-named tokens in a
dedicated `@theme` block in `app/globals.css`, never as scale-numbered
`max-w-*`:

```css
/* app/globals.css */
@theme {
  --container-cover: 24rem;  /* album cover max width on mobile */
  --container-note:  48rem;  /* detail-page note / tracklist column */
  --container-page:  64rem;  /* detail-page outer container */
  --container-wide:  72rem;  /* index / footer wide container */
}
```

```tsx
// Wrong — collides with --spacing-*, compiles to 80px
<div className="mx-auto max-w-5xl px-lg py-4xl">

// Correct — resolves to --container-page (64rem)
<div className="mx-auto max-w-page px-lg py-4xl">
```

**Why:**
1. **Avoids the collision** — no `--spacing-page` exists, so `max-w-page`
   resolves unambiguously to the container value.
2. **Names carry intent** — `page` / `cover` / `note` tell the reader what the
   width is *for*, not which rung of an abstract scale it sits on.
3. **Single source of truth** — every layout width lives in one `@theme` block;
   changing the page width is a one-line edit.

**Gotcha:** newly added `--container-*` tokens are picked up on a normal
`next dev` recompile for JSX changes, but the `next dev` CSS cache can serve a
stale compiled stylesheet for *new theme variables* until the dev server is
restarted. If a new `max-w-<token>` looks like it has no effect, restart
`next dev` before debugging further.

**Related:** the width-token block sits right after the spacing `@theme` block
in `app/globals.css`; the forbidden `max-w-{2xs…5xl}` classes above are the
reason this convention exists.

---

## Testing Requirements

<!-- What level of testing is expected -->

(To be filled by the team)

---

## Code Review Checklist

<!-- What reviewers should check -->

(To be filled by the team)
