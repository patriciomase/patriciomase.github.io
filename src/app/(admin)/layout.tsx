import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import "./admin.css";

/**
 * Root layout for the admin panel. It is a sibling of the public site's root
 * layout rather than a child of it: /a wants none of the site chrome, none of
 * its stylesheet, and no PostHog pageviews recording the owner reading his own
 * stats.
 */
export const metadata: Metadata = {
  title: "patriciomase — admin",
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider
      signInUrl="/a/sign-in"
      afterSignOutUrl="/a/sign-in"
      /* Where signing in lands you when nothing else asked for a page --
         someone who opened /a/sign-in directly. Clerk's own default is "/",
         which is the public homepage here. "fallback" rather than "force" so
         that being bounced off /a/stats still returns you to /a/stats. */
      signInFallbackRedirectUrl="/a"
      signUpFallbackRedirectUrl="/a"
    >
      <html lang="en">
        <body>{children}</body>
      </html>
    </ClerkProvider>
  );
}
