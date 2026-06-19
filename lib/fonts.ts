import { Maven_Pro } from "next/font/google";
import { Geist_Mono } from "next/font/google";
import { Noto_Serif_SC } from "next/font/google";

export const mavenPro = Maven_Pro({
  variable: "--font-maven-pro",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const notoSerifSC = Noto_Serif_SC({
  variable: "--font-noto-serif-sc",
  subsets: ["latin"],   // 无害：只控制 preload（已关）；Noto Serif SC 无简中子集可选
  weight: "variable",   // 可变字体（wght 200–900，已核实）：一个轴覆盖所有字重，比 ["400","700"] 更轻
  display: "swap",
  preload: false,       // 必须：CJK 无法 preload（无简中子集），见 font-decisions §3
});

// 只挂 Maven Pro + Geist Mono 到全站 <html>。
// 故意不含 notoSerifSC.variable —— 思源宋体在 app/writing/layout.tsx 局部挂载，
// 避免非文章页面触发 CJK 字体下载（见 font-decisions §5）。请勿往这里加。
export const fontVariables = `${mavenPro.variable} ${geistMono.variable}`;
