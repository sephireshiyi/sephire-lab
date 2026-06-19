<!-- TRELLIS:START -->
# Trellis Instructions

These instructions are for AI assistants working in this project.

This project is managed by Trellis. The working knowledge you need lives under `.trellis/`:

- `.trellis/workflow.md` — development phases, when to create tasks, skill routing
- `.trellis/spec/` — package- and layer-scoped coding guidelines (read before writing code in a given layer)
- `.trellis/workspace/` — per-developer journals and session traces
- `.trellis/tasks/` — active and archived tasks (PRDs, research, jsonl context)

If a Trellis command is available on your platform (e.g. `/trellis:finish-work`, `/trellis:continue`), prefer it over manual steps. Not every platform exposes every command.

If you're using Codex or another agent-capable tool, additional project-scoped helpers may live in:
- `.agents/skills/` — reusable Trellis skills
- `.codex/agents/` — optional custom subagents

Managed by Trellis. Edits outside this block are preserved; edits inside may be overwritten by a future `trellis update`.

<!-- TRELLIS:END -->

## Project-Specific Trellis Completion Rules

For Sephire Lab Trellis child tasks, the user grants standing approval for the agent to create a task-scoped work commit after the task is implemented and verified.

- Commit only after task acceptance checks have been run and reported.
- Commit only files that clearly belong to the active Trellis task.
- Do not include unrelated or unrecognized dirty files. If any dirty file is not clearly task-scoped, stop and ask before staging.
- Learn commit style from recent history with `git log --oneline -5`; this project currently uses short English imperative messages such as `Add ...`, `Change ...`, `Fix ...`, `Remove ...`, `Refine ...`, without `feat:` prefixes.
- Do not push.
- Keep Trellis archive/journal bookkeeping separate from work commits.
- The main working directory may have a long-running local service on port 3000 that depends on `.next`. Do not run `pnpm build` in the main working directory. If build/static export verification is needed, copy the repo to `/tmp` excluding `.git`, `node_modules`, `.next`, and `out`, then run build checks only in that copy.
