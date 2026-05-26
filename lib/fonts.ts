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
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  preload: false,  // 关键：不全站 preload，按需触发
});

export const fontVariables = `${mavenPro.variable} ${geistMono.variable}`;
