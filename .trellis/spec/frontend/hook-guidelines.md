# Hook Guidelines

> How hooks are used in this project.

---

## Overview

<!--
Document your project's hook conventions here.

Questions to answer:
- What custom hooks do you have?
- How do you handle data fetching?
- What are the naming conventions?
- How do you share stateful logic?
-->

(To be filled by the team)

---

## Custom Hook Patterns

<!-- How to create and structure custom hooks -->

(To be filled by the team)

---

## Data Fetching

<!-- How data fetching is handled (React Query, SWR, etc.) -->

(To be filled by the team)

---

## Naming Conventions

<!-- Hook naming rules (use*, etc.) -->

(To be filled by the team)

---

## Common Mistakes

<!-- Hook-related mistakes your team has made -->

### Don't: client-mounted guard via `setState` inside `useEffect`

**Problem**:

```tsx
const [mounted, setMounted] = useState(false);
useEffect(() => {
  setMounted(true); // ❌ react-hooks/set-state-in-effect (lint error)
}, []);
if (!mounted) return null;
```

The lint rule `react-hooks/set-state-in-effect` (React 19 / React Compiler) treats a
synchronous `setState` in an effect body as a cascading-render smell and fails the build.
This pattern commonly appears as a hydration guard for `next-themes` (the resolved theme is
unknown on the server, so theme-dependent UI must not render until the client mounts).

**Instead**: derive "am I mounted" from `useSyncExternalStore`, whose server snapshot is
`false` and client snapshot is `true`. This is hydration-safe and passes the lint rule
without an `eslint-disable`.

```tsx
import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};
function useMounted() {
  return useSyncExternalStore(emptySubscribe, () => true, () => false);
}

// in the component:
const mounted = useMounted();
if (!mounted) return null;
```

**Why**: the store never changes after hydration (empty subscribe), so there is no
post-mount `setState` and no cascading render — the client/server snapshot difference alone
flips `mounted` to `true` on hydration. See `components/theme/theme-dropdown.tsx`.
