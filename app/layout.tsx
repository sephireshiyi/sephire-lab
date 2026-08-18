import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteChromeProvider } from "@/components/layout/site-chrome-context";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { fontVariables } from "@/lib/fonts";

export const metadata: Metadata = {
  title: "Sephire Lab",
  description: "Writing, music, and photography by Sephire.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontVariables} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="flex min-h-full flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          themes={["light", "dark"]}
          enableSystem={false}
          disableTransitionOnChange
        >
          <SiteChromeProvider>
            <SiteHeader />
            <main
              className="flex-1"
              style={{ paddingTop: "var(--header-height)" }}
            >
              {children}
            </main>
          </SiteChromeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
