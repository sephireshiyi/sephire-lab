import { readdirSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { parseYamlFile } from "@/lib/yaml";

/** 所有 Gallery 照片集 .yaml 文件所在目录（绝对路径，相对项目根解析）。 */
export const GALLERY_DIR = path.join(process.cwd(), "content", "gallery");

/**
 * 单张照片的 schema。基础 MVP 只记录「网页优化图」所需的展示字段：
 * - `src`：以 `/gallery/<slug>/...` 开头的公开路径（媒体放在 `public/gallery/<slug>/`）。
 * - `width` / `height`：预先优化好的静态图的真实像素尺寸。静态导出下没有运行时图片
 *   优化器，组件必须知道原始尺寸才能避免布局抖动（CLS）。
 * - `alt`：必填，无障碍与图片加载失败的兜底文案。
 * - `caption` / `note`：可选的展示文字，详情页下滑/展开时再露出，不抢占默认视觉。
 *
 * 不记录原图 / 高分辨率下载字段——基础 MVP 明确不提供高分辨率下载入口。
 */
export const PhotoSchema = z.object({
  src: z.string(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  alt: z.string(),
  caption: z.string().optional(),
  note: z.string().optional(),
});

/**
 * 照片集 schema。`cover` 是索引页用的封面路径；`photos` 至少一张。
 * `date` 用 z.iso.date()（zod 4 API），要求 "YYYY-MM-DD" 字符串——与 lib/content.ts
 * 的文章 frontmatter 约定一致，YAML 里必须加引号（date: "2025-11-12"）。
 */
export const GallerySchema = z.object({
  slug: z.string(),
  title: z.string(),
  date: z.iso.date(),
  cover: z.string(),
  summary: z.string(),
  photos: z.array(PhotoSchema).min(1),
});

/** 照片 / 照片集类型，从 zod schema 派生（不要再手写一份 interface）。 */
export type Photo = z.infer<typeof PhotoSchema>;
export type Gallery = z.infer<typeof GallerySchema>;

/**
 * 读单个照片集 .yaml，先用 js-yaml 解析、再用 zod 校验。
 * 校验失败时抛错并指名文件——next build 时直接失败，把问题拦在部署前。
 */
export function parseGallery(filePath: string): Gallery {
  const data = parseYamlFile(filePath);
  const result = GallerySchema.safeParse(data);
  if (!result.success) {
    throw new Error(
      `Invalid gallery YAML in ${filePath}:\n${z.prettifyError(result.error)}`,
    );
  }
  return result.data;
}

/**
 * 扫 content/gallery/ 列出所有照片集 slug（文件名去掉 .yaml 后缀）。
 * 供 generateStaticParams 预生成 `/gallery/[slug]` 路由用。
 */
export function getGallerySlugs(): string[] {
  return readdirSync(GALLERY_DIR)
    .filter((name) => name.endsWith(".yaml"))
    .map((name) => name.replace(/\.yaml$/, ""));
}

/** 按 slug 读取并校验单个照片集（详情页用）。 */
export function getGalleryBySlug(slug: string): Gallery {
  return parseGallery(path.join(GALLERY_DIR, `${slug}.yaml`));
}

/**
 * 扫 content/gallery/ 读取所有照片集并按日期降序排序（新系列在前）。
 * 供索引页 `/gallery` 用。
 */
export function getAllGalleries(): Gallery[] {
  return getGallerySlugs()
    .map((slug) => getGalleryBySlug(slug))
    .sort((a, b) => (a.date > b.date ? -1 : 1));
}
