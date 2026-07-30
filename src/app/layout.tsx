import type { Metadata } from "next";
import { LanguageProvider } from "@/components/LanguageProvider";
import { messages } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: "Patricio Gabriel Maseda",
  description: messages.en.metaDescription,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
