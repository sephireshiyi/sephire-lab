import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { parseYamlFile } from "@/lib/yaml";

/** 所有专辑文件夹所在目录（绝对路径，相对项目根解析）。每张专辑一个子目录。 */
export const MUSIC_DIR = path.join(process.cwd(), "content", "music");

/** 每个专辑目录里 manifest 的固定文件名。固定名让 slug 只有一个来源（目录名）。 */
const MANIFEST_NAME = "album.yaml";

/** slug 字符集：小写 ASCII + 数字 + 连字符。纯 ASCII 的 URL 不需要 percent-encode。 */
const SLUG_PATTERN = /^[a-z0-9-]+$/;

/** 封面允许的扩展名。只关心「浏览器能直接显示」，不区分 jpg / jpeg。 */
const COVER_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp"]);

/**
 * 单首曲目。
 * - `title`：曲目名。
 * - `duration`：可选时长字符串（如 "3:45"），保持展示态，不做播放计算。
 * - `audio`：可选、显式的音频文件名（相对专辑目录，如 "flume.mp3"）。
 *   没有该字段就没有播放器——绝不从目录里的文件名去「猜」哪首歌有音频。
 */
export const TrackSchema = z.object({
  title: z.string(),
  duration: z.string().optional(),
  audio: z.string().optional(),
});

/**
 * 专辑 schema（对应每个专辑目录里的 album.yaml）。
 * - `cover`：相对专辑目录的封面文件名（如 "cover.jpeg"），不是公开 URL——
 *   公开 URL 由 loader 派生（见 toPublicUrl），内容不耦合发布路径。
 * - `themeColor`：专辑主题色，用于详情页 fading 背景。必须是 `#RRGGBB`，
 *   在 YAML 里因 `#` 是注释符，必须加引号（themeColor: "#7a1f1f"）。
 * - `note`：专辑短评。
 * - `tags`：可选类型/标签数组，详情页渲染为小标签，索引页不显示。
 *
 * `year` 用整数而非 ISO 日期：专辑以年份为粒度，没有精确到日的产品意义。
 */
export const MusicSchema = z.object({
  slug: z.string(),
  title: z.string(),
  artist: z.string(),
  year: z.number().int().min(1900).max(2100),
  cover: z.string(),
  themeColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "themeColor 必须是 #RRGGBB 格式"),
  note: z.string(),
  tracks: z.array(TrackSchema).optional(),
  tags: z.array(z.string()).optional(),
});

/** YAML 原始形状，从 zod schema 派生（不要再手写一份 interface）。 */
export type MusicYaml = z.infer<typeof MusicSchema>;

/**
 * 页面消费的类型 = YAML 数据 + loader 派生的公开 URL。
 * 派生字段不进 YAML：内容只存相对文件名，URL 拼接规则集中在 loader 一处。
 */
export type Track = z.infer<typeof TrackSchema> & { audioUrl?: string };
export type Album = Omit<MusicYaml, "tracks"> & {
  coverUrl: string;
  tracks?: Track[];
};

/**
 * 相对文件名 → 公开 URL 的唯一拼接点。
 * 媒体由 scripts/sync-music-media.mjs 镜像到 public/music/<slug>/，
 * 所以 URL 恒为 /music/<slug>/<file>。slug 已限定纯 ASCII，无需编码；
 * 将来若引入非 ASCII 文件名，只需要改这一个函数。
 */
function toPublicUrl(slug: string, fileName: string): string {
  return `/music/${slug}/${fileName}`;
}

/**
 * 校验 YAML 里引用的媒体文件：必须真实存在，且 resolve 后仍在专辑目录内。
 * 后者拒绝 "../xxx" 这类越界引用——内容文件是数据，不该能触碰目录外的文件。
 */
function resolveMediaFile(
  albumDir: string,
  dirName: string,
  fileName: string,
  kind: string,
): string {
  const resolved = path.resolve(albumDir, fileName);
  if (!resolved.startsWith(albumDir + path.sep)) {
    throw new Error(
      `Invalid album "${dirName}": ${kind} "${fileName}" 越出了专辑目录（不允许 ../ 等路径穿越）`,
    );
  }
  if (!existsSync(resolved)) {
    throw new Error(
      `Invalid album "${dirName}": ${kind} "${fileName}" 在专辑目录中不存在`,
    );
  }
  return resolved;
}

/**
 * 读取并校验单个专辑目录，返回带派生 URL 的 Album。
 * 所有错误都指名目录（Invalid album "<dir>": ...），在 build 时直接失败，
 * 把问题拦在部署前。
 */
function loadAlbumDir(dirName: string): Album {
  const albumDir = path.join(MUSIC_DIR, dirName);

  // manifest 固定名 album.yaml，且目录里不允许出现别的 .yaml——
  // 多一份 YAML 就多一份「哪个才是真值」的歧义。
  const yamlFiles = readdirSync(albumDir).filter((name) =>
    name.endsWith(".yaml"),
  );
  if (yamlFiles.length !== 1 || yamlFiles[0] !== MANIFEST_NAME) {
    throw new Error(
      `Invalid album "${dirName}": 目录必须恰好包含一个名为 ${MANIFEST_NAME} 的 manifest，实际找到 [${yamlFiles.join(", ") || "无"}]`,
    );
  }

  const manifestPath = path.join(albumDir, MANIFEST_NAME);
  const parsed = MusicSchema.safeParse(parseYamlFile(manifestPath));
  if (!parsed.success) {
    throw new Error(
      `Invalid album "${dirName}": schema 校验失败\n${z.prettifyError(parsed.error)}`,
    );
  }
  const data = parsed.data;

  // slug 的唯一真值是目录名；YAML 里的 slug 只是显式确认，两者必须一致。
  if (data.slug !== dirName) {
    throw new Error(
      `Invalid album "${dirName}": YAML slug "${data.slug}" 与目录名不一致`,
    );
  }
  if (!SLUG_PATTERN.test(data.slug)) {
    throw new Error(
      `Invalid album "${dirName}": slug 必须匹配 ^[a-z0-9-]+$（小写 ASCII）`,
    );
  }

  // 封面：文件必须存在、在目录内、扩展名是浏览器可显示的图片格式。
  resolveMediaFile(albumDir, dirName, data.cover, "cover");
  const coverExt = path.extname(data.cover).toLowerCase();
  if (!COVER_EXTENSIONS.has(coverExt)) {
    throw new Error(
      `Invalid album "${dirName}": cover "${data.cover}" 扩展名必须是 jpg/jpeg/png/webp`,
    );
  }

  // 曲目音频：显式声明的 audio 必须存在且是 .mp3；无 audio 的曲目完全合法。
  const tracks: Track[] | undefined = data.tracks?.map((track) => {
    if (!track.audio) return track;
    resolveMediaFile(albumDir, dirName, track.audio, `track audio`);
    if (path.extname(track.audio).toLowerCase() !== ".mp3") {
      throw new Error(
        `Invalid album "${dirName}": track audio "${track.audio}" 必须是 .mp3 文件`,
      );
    }
    return { ...track, audioUrl: toPublicUrl(data.slug, track.audio) };
  });

  return {
    ...data,
    tracks,
    coverUrl: toPublicUrl(data.slug, data.cover),
  };
}

/**
 * 扫 content/music/ 一级子目录列出所有专辑 slug（= 目录名）。
 * 供 generateStaticParams 预生成 `/music/[slug]` 路由用。
 * 根下散落的 .yaml 是旧扁平结构的残留，直接报错提示迁移，而不是静默忽略。
 */
export function getMusicSlugs(): string[] {
  const entries = readdirSync(MUSIC_DIR);

  const strayYaml = entries.filter((name) => name.endsWith(".yaml"));
  if (strayYaml.length > 0) {
    throw new Error(
      `content/music/ 根下发现散落的 YAML：[${strayYaml.join(", ")}]。` +
        `专辑已改为目录结构，请迁移为 content/music/<slug>/${MANIFEST_NAME}`,
    );
  }

  // 只取目录，忽略 .DS_Store 之类的杂项文件。
  return entries
    .filter((name) => statSync(path.join(MUSIC_DIR, name)).isDirectory())
    .sort();
}

/** 按 slug 读取并校验单个专辑（详情页用）。 */
export function getMusicBySlug(slug: string): Album {
  return loadAlbumDir(slug);
}

/**
 * 读取所有专辑并按年份降序排序（新专辑在前），供索引页 `/music` 用。
 * 顺带做全站 slug 唯一性检查——目录名天然唯一，这里防的是
 * 大小写不敏感文件系统等边界情况，属于便宜的保险。
 */
export function getAllAlbums(): Album[] {
  const slugs = getMusicSlugs();
  const seen = new Set<string>();
  for (const slug of slugs) {
    if (seen.has(slug)) {
      throw new Error(`Invalid album "${slug}": slug 重复`);
    }
    seen.add(slug);
  }
  return slugs.map((slug) => getMusicBySlug(slug)).sort((a, b) => b.year - a.year);
}
