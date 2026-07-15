# Music Content Model & Media Publishing

> Executable contract for the Music album-bundle content model and the media
> publishing pipeline that makes it work under `output: "export"`.
> Source of truth: `lib/music.ts`, `scripts/sync-music-media.mjs`.

---

## Scope / Trigger

Cross-layer contract: content authoring (`content/music/`) → loader
(`lib/music.ts`) → build-time media sync (`scripts/sync-music-media.mjs`) →
static export (`out/`) → pages (`app/music/**`). Read before adding an album,
changing the media pipeline, or touching the loader.

---

## Convention: one album = one self-contained folder

**What**: Every album is a directory under `content/music/<slug>/` containing:

```
content/music/<slug>/
  album.yaml          # the ONLY manifest; fixed filename
  cover.<ext>         # jpg | jpeg | png | webp
  <track>.mp3         # optional, one per playable track
```

`content/music/` is the single content source. There is **no** second,
hand-maintained media directory.

**Why**:
- The old model split YAML (`content/music/<slug>.yaml`) from covers
  (`public/music/<slug>/cover.jpg`) — two truths to keep in sync, which drifted
  (a manifest said `cover.jpg` while the file was `cover.jpeg`).
- The directory name is the single source of the slug; the manifest's fixed
  name `album.yaml` means "exactly one manifest" is a mere existence check.

---

## Signatures (`lib/music.ts`)

```ts
// YAML shape (what an album.yaml must contain)
MusicSchema = {
  slug: string; title: string; artist: string;
  year: int [1900..2100];
  cover: string;              // RELATIVE filename, e.g. "cover.jpeg" — NOT a URL
  themeColor: "#RRGGBB";      // quote in YAML: `#` starts a comment
  note: string;
  tags?: string[];
  tracks?: { title: string; duration?: string; audio?: string }[];
                              // audio = RELATIVE mp3 filename, e.g. "flume.mp3"
}

// Loader output (YAML + loader-derived public URLs)
type Track = TrackYaml & { audioUrl?: string };
type Album = MusicYaml (minus tracks) & { coverUrl: string; tracks?: Track[] };

getMusicSlugs(): string[]            // dir names; feeds generateStaticParams
getMusicBySlug(slug): Album          // full validation for one album
getAllAlbums(): Album[]              // all albums, year DESC, uniqueness check
```

**Derived-URL rule**: YAML stores only relative filenames. The loader derives
the public URL in ONE place — `toPublicUrl(slug, file) => /music/<slug>/<file>`.
Content never encodes the publish path; the join/encoding rule lives in a single
function. Pages consume `coverUrl` / `audioUrl`, never raw `cover` / `audio`.

---

## Contracts & Validation Matrix (`lib/music.ts`)

All errors are thrown at build time (fail before deploy), prefixed
`Invalid album "<dir>": ...`.

| Condition | Error |
|---|---|
| dir has ≠1 `.yaml`, or the one isn't `album.yaml` | manifest count/name error |
| stray `*.yaml` directly under `content/music/` root | migration-hint error (from `getMusicSlugs`) |
| YAML fails `MusicSchema` | schema error with `z.prettifyError` |
| `slug !== dirName` | slug/dir mismatch |
| slug ∉ `^[a-z0-9-]+$` | slug charset error |
| duplicate slug across albums | duplicate-slug error (from `getAllAlbums`) |
| `cover` / `audio` file missing | media-not-found |
| `cover` / `audio` resolves outside album dir (`../`) | path-traversal rejected (`resolved.startsWith(albumDir + path.sep)`) |
| cover ext ∉ {jpg,jpeg,png,webp} | cover-extension error |
| track `audio` ext ≠ `.mp3` | audio-extension error |

**Slug rule**: lowercase ASCII only. Non-ASCII album names (e.g. Chinese) get an
ASCII slug (`万能青年旅店-冀西南林路行` → `omnipotent-youth-society-inside-the-cable-temple`);
the Chinese stays in `title` / `artist`. Rationale: ASCII URLs avoid static-host
filename-encoding and macOS/Linux Unicode-normalization pitfalls. `toPublicUrl`
is still the single place to add encoding if non-ASCII filenames ever return.

---

## Media publishing: `scripts/sync-music-media.mjs`

**What**: Mirrors each `content/music/<slug>/` media file (everything except
`*.yaml` and `.DS_Store`) into `public/music/<slug>/`. Runs automatically via
`predev` / `prebuild` npm hooks in `package.json`. `output: "export"` copies
`public/` verbatim into `out/`, so covers and MP3s land in the static export at
stable, predictable URLs.

**Mirror (not copy) semantics**: orphan files/dirs under `public/music/` that no
longer exist in source are deleted, so renaming a slug or removing an album
leaves no stale files. `rmSync` targets are always built via
`path.join(DEST, ...)` — deletions never touch source or paths outside
`public/music/`.

**`public/music/` is a build artifact, not source**: it is gitignored
(`/public/music/`) and fully rebuildable. Never hand-edit it or commit it.

### Design Decision: build-time sync over the alternatives

**Context**: media lives in `content/`, but static export only publishes
`public/`. **Chosen**: a `predev`/`prebuild` mirror script. Rejected:
- hand-maintained `public/music/` → the double-truth we're eliminating;
- runtime route handler → no server under `output: "export"`;
- bundler `import` of assets → hashed filenames break stable/predictable URLs;
- symlink `public/music -> content` → export symlink-copy unguaranteed, and it
  would publish the YAML too.

> **Warning**: `next dev` runs the sync once at startup (via `predev`). Adding or
> changing album media mid-session requires rerunning
> `node scripts/sync-music-media.mjs` (or restarting `pnpm dev`).

---

## Player contract (`app/music/[slug]/page.tsx`)

Only tracks with a derived `audioUrl` render a player. Native element, no
third-party player, page stays a server component:

```tsx
<audio controls preload="metadata" src={track.audioUrl}
       aria-label={`播放 ${track.title} 片段`} className="mt-sm w-full" />
```

- No `autoplay`. `preload="metadata"` fetches duration only, not the audio body.
- Tracks without `audio` render unchanged — no empty/broken player.
- Long track titles truncate on one line: title span uses `min-w-0 flex-1
  truncate`, duration column uses `shrink-0` so it is never squeezed.

---

## Good / Base / Bad Cases

- **Good (playable)**: `bon-iver-for-emma-forever-ago/` with `album.yaml`,
  `cover.jpeg`, `flume.mp3`; the `Flume` track has `audio: flume.mp3` → one
  player renders.
- **Base (no audio)**: a track with no `audio` field → renders as a plain row,
  no player; an album with zero MP3s is fully valid.
- **Bad**: manifest named `<slug>.yaml` instead of `album.yaml`; `cover` points
  at a missing/`.gif` file; slug has uppercase or non-ASCII; `audio: ../x.mp3` →
  each throws a dir-named build error.
