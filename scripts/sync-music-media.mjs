// 构建期媒体发布脚本：把 content/music/<slug>/ 里的媒体（除 *.yaml、.DS_Store）
// 镜像到 public/music/<slug>/，让封面和 MP3 进入 Next 静态导出产物（output: "export"
// 下 public/ 会被原样复制到 out/）。
//
// 为什么是「镜像」而不是「复制」：改 slug、删专辑后，public/music/ 里的旧文件必须
// 跟着消失，否则又回到两套真值需要人工同步的老问题。public/music/ 整体 gitignore，
// 删掉可随时重建——它是产物，不是源。
//
// 注意：`next dev` 只在启动时经 predev 跑一次本脚本；dev 途中新增/修改专辑媒体
// 需要重跑 `node scripts/sync-music-media.mjs`（或重启 pnpm dev）。
//
// 纯 Node 无第三方依赖，方便任何环境直接执行。

import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "content", "music");
const DEST = path.join(ROOT, "public", "music");

/** 判断某个源文件名是否要发布：manifest 与系统杂项不进 public/。 */
function isMedia(name) {
  return !name.endsWith(".yaml") && name !== ".DS_Store";
}

let copied = 0;
let removed = 0;

// 1) 收集源侧的专辑目录与各自的媒体文件清单。
const albumDirs = existsSync(SRC)
  ? readdirSync(SRC).filter((name) => statSync(path.join(SRC, name)).isDirectory())
  : [];

// 2) 清理孤儿：public/music/ 下源里已不存在的专辑目录 / 文件。
//    安全性：rmSync 只作用于 DEST（public/music/）内部路径。
if (existsSync(DEST)) {
  for (const entry of readdirSync(DEST)) {
    const destEntry = path.join(DEST, entry);
    const srcDir = path.join(SRC, entry);
    if (!albumDirs.includes(entry) || !statSync(destEntry).isDirectory()) {
      rmSync(destEntry, { recursive: true, force: true });
      removed++;
      continue;
    }
    // 专辑仍存在：逐文件比对，删掉源里没有（或不该发布）的文件。
    for (const file of readdirSync(destEntry)) {
      const srcFile = path.join(srcDir, file);
      if (!isMedia(file) || !existsSync(srcFile)) {
        rmSync(path.join(destEntry, file), { recursive: true, force: true });
        removed++;
      }
    }
  }
}

// 3) 复制媒体（cpSync 覆盖式复制，重复执行结果一致 = 幂等）。
for (const dir of albumDirs) {
  const srcDir = path.join(SRC, dir);
  const destDir = path.join(DEST, dir);
  mkdirSync(destDir, { recursive: true });
  for (const file of readdirSync(srcDir).filter(isMedia)) {
    cpSync(path.join(srcDir, file), path.join(destDir, file));
    copied++;
  }
}

console.log(
  `[sync-music-media] ${albumDirs.length} album(s) mirrored to public/music/ ` +
    `(${copied} file(s) copied, ${removed} orphan(s) removed). ` +
    `Albums added during \`next dev\` require rerunning this script.`,
);
