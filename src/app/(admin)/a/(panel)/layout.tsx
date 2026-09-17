import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { requireAdmin } from "@/lib/admin";

/**
 * The panel chrome, and the first allowlist check. The pages under it check
 * again -- a layout guard alone is not a guard, since Next.js can render a
 * page without re-running its layout.
 */
export default async function PanelLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  await requireAdmin();

  return (
    <div className="shell">
      <nav className="nav">
        <span className="brand">patriciomase admin</span>
        <Link href="/a/messages">Messages</Link>
        <Link href="/a/stats">Stats</Link>
        <UserButton />
      </nav>
      <main>{children}</main>
    </div>
  );
}
