import type { Metadata } from "next";
import { IBM_Plex_Sans, Merriweather } from "next/font/google";
import { LiveBackground } from "@/components/live-background";
import { SiteNav } from "@/components/site-nav";
import "./globals.css";

const bodyFont = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"]
});

const headingFont = Merriweather({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "700", "900"]
});

export const metadata: Metadata = {
  title: "Thabiso Seleke | Java, Angular & AI-Enabled Development",
  description:
    "Portfolio and AI assistant for Thabiso Seleke. Ask questions about experience, skills, and project capabilities.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${headingFont.variable}`}>
        <LiveBackground />
        <SiteNav />
        <div className="relative z-10 pt-20 md:pt-24">{children}</div>
      </body>
    </html>
  );
}
