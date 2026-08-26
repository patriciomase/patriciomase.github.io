import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { LanguageProvider } from "@/components/LanguageProvider";
import { messages } from "@/lib/i18n";
import "./globals.css";

/**
 * The design has always asked for Inter -- it was first in the font stack --
 * but nothing ever loaded it, so the site fell back to whatever sans the
 * reader's OS provides. next/font self-hosts it at build time, so there is no
 * runtime request to Google and no flash of unstyled text.
 */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://patriciomase.com"),
  title: "Patricio Gabriel Maseda",
  description: messages.en.metaDescription,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
