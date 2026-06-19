import { readFileSync } from "node:fs";
import yaml from "js-yaml";

/**
 * 读取整份 YAML 文件并解析为 `unknown`，再交给各 loader 的 zod schema 做类型收窄。
 *
 * 为什么单独抽这层：Gallery / Music 的内容源是「整份 YAML 文件」，而不是 MDX 的
 * frontmatter 头。`gray-matter`（lib/content.ts 用于文章 frontmatter）面向 frontmatter，
 * 解析整份 YAML 要么强转未公开的 `matter.engines`、要么用 `---` 包裹 hack，都不干净。
 * 所以这里直接用 `js-yaml`——它本就是 gray-matter 底层依赖的同一套解析器，是 YAML 的事实
 * 标准，API 干净，且 v4 自带类型。
 *
 * 无效 YAML 会在 `yaml.load` 抛 `YAMLException`；schema 不匹配由各 loader 的 zod 抛出。
 * 两者都会让 `next build` 直接失败，把问题拦在部署前——与 lib/content.ts 的处理一致。
 */
export function parseYamlFile(filePath: string): unknown {
  const raw = readFileSync(filePath, "utf8");
  return yaml.load(raw);
}
