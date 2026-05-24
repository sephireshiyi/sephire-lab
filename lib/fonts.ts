import { Maven_Pro } from "next/font/google";
import { Geist_Mono } from "next/font/google";

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

export const fontVariables = `${mavenPro.variable} ${geistMono.variable}`;
