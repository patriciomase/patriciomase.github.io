import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "patriciomase — admin",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="shell">
          <nav className="nav">
            <span className="brand">patriciomase admin</span>
            <Link href="/messages">Messages</Link>
            <Link href="/stats">Stats</Link>
          </nav>
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
