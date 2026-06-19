# Task Completion Guide

Use this guide before finishing any Trellis child task in this project.

## Commit Policy

- A Trellis child task should finish with a task-scoped work commit after implementation and verification.
- The user has granted standing approval for these task-scoped commits.
- Do not ask for commit approval again when all dirty files are clearly part of the active task.
- Stop and ask if there are unrecognized dirty files, unrelated files, or a failed verification that the task claims to satisfy.
- Do not push.

## Commit Message Style

Follow recent project history:

```bash
git log --oneline -5
```

Current style:

- Short English imperative sentence.
- Prefer `Add`, `Change`, `Fix`, `Remove`, or `Refine`.
- No `feat:` / `fix:` prefix unless the recent history changes to that convention.

Examples for the current Sephire Lab MVP tasks:

- `Add gallery skeleton pages`
- `Add music skeleton pages`
- `Refine home about header and themes`

## Staging Rules

Before committing:

```bash
git status --short
git diff --stat
```

Stage only files that belong to the active task. Never stage broad workspace noise or unknown generated folders.

Keep work commits separate from Trellis bookkeeping:

- Work commit first.
- Archive/journal commits later through Trellis finish-work/archive flow.

## Local Service Build Constraint

The main working directory may have a `nohup` service on port 3000 that depends on its `.next` directory.

Do not run commands that rebuild or clear `.next` / `out` in the main working directory, including:

- `pnpm build`
- `next build`
- `rm -rf .next`
- `rm -rf out`

### Gotcha: stale `.next` type errors in the main working directory

Running `pnpm tsc --noEmit` (or any IDE type-check) in the main working
directory can report errors from `.next/types/validator.ts` for routes that no
longer exist — e.g. `Type '"/blog"' is not assignable to type 'LayoutRoutes'`
or `Cannot find module '../../app/tools/page.js'`. These are **false
positives**: the long-running port-3000 service keeps an outdated `.next`
(typed routes from before `/blog` and `/tools` were deleted), and we must not
rebuild `.next` in the main working directory to refresh it.

- Treat such errors as stale-artifact noise as long as none of them point at
  files you actually changed.
- The authoritative type-check is the `pnpm build` run in the `/tmp` copy,
  which regenerates `.next` from scratch (`next build` runs TypeScript there).
- `pnpm lint` in the main working directory is unaffected and remains a valid
  local check.

If build/static export verification is needed, use a temporary copy:

```bash
VERIFY_DIR="/tmp/shiyi-lab-verify-$(date +%Y%m%d%H%M%S)"

rsync -a --delete \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='out' \
  /Users/jiechu/shiyi-lab/ "$VERIFY_DIR"/

cd "$VERIFY_DIR"
pnpm install --frozen-lockfile
pnpm lint
pnpm build
test -d out
```

Report clearly that build verification happened in `/tmp`, not in the main working directory.
