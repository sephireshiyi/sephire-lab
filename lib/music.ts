import { readdirSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { parseYamlFile } from "@/lib/yaml";

/** 所有 Music 专辑 .yaml 文件所在目录（绝对路径，相对项目根解析）。 */
export const MUSIC_DIR = path.join(process.cwd(), "content", "music");

/**
 * 单首曲目（可选）。基础 MVP 不播放音频，`tracks` 只承载展示信息：
 * - `title`：曲目名。
 * - `duration`：可选时长字符串（如 "3:45"），保持展示态，不做播放计算。
 */
export const TrackSchema = z.object({
  title: z.string(),
  duration: z.string().optional(),
});

/**
 * 专辑 schema。
 * - `cover`：以 `/music/<slug>/cover.jpg` 开头的公开路径（媒体放在 `public/music/<slug>/`）。
 * - `themeColor`：专辑封面主题色，用于详情页 fading 背景的基础 MVP 数据。必须是 `#RRGGBB`，
 *   在 YAML 里因 `#` 是注释符，必须加引号（themeColor: "#7a1f1f"）。
 * - `note`：专辑短评。
 * - `tracks` / `playbackPlaceholder`：可选。`playbackPlaceholder` 是详情页非交互播放占位
 *   的文案/提示，基础 MVP 不放假播放按钮、不接入音频。
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
  playbackPlaceholder: z.string().optional(),
});

/** 曲目 / 专辑类型，从 zod schema 派生（不要再手写一份 interface）。 */
export type Track = z.infer<typeof TrackSchema>;
export type Album = z.infer<typeof MusicSchema>;

/**
 * 读单个专辑 .yaml，先用 js-yaml 解析、再用 zod 校验。
 * 校验失败时抛错并指名文件——next build 时直接失败，把问题拦在部署前。
 */
export function parseMusic(filePath: string): Album {
  const data = parseYamlFile(filePath);
  const result = MusicSchema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `Invalid music YAML in ${filePath}:\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}

/**
 * 扫 content/music/ 列出所有专辑 slug（文件名去掉 .yaml 后缀）。
 * 供 generateStaticParams 预生成 `/music/[slug]` 路由用。
 */
export function getMusicSlugs(): string[] {
  return readdirSync(MUSIC_DIR)
    .filter((name) => name.endsWith(".yaml"))
    .map((name) => name.replace(/\.yaml$/, ""));
}

/** 按 slug 读取并校验单个专辑（详情页用）。 */
export function getMusicBySlug(slug: string): Album {
  return parseMusic(path.join(MUSIC_DIR, `${slug}.yaml`));
}

/**
 * 扫 content/music/ 读取所有专辑并按年份降序排序（新专辑在前）。
 * 供索引页 `/music` 用。
 */
export function getAllAlbums(): Album[] {
  return getMusicSlugs()
    .map((slug) => getMusicBySlug(slug))
    .sort((a, b) => b.year - a.year);
}
