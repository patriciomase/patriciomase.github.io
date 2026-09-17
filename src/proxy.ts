import { clerkMiddleware } from "@clerk/nextjs/server";

/**
 * Makes the Clerk session available to /a. It deliberately does no gating of
 * its own: path-matching in a proxy can drift from how Next.js actually routes
 * a request, so the real checks live next to the data, in `requireAdmin`.
 *
 * Scoped to /a on purpose -- the public site is static, bot-protected and has
 * no notion of a user, so there is no reason to run auth on it.
 */
export default clerkMiddleware({ signInUrl: "/a/sign-in" });

export const config = {
  matcher: ["/a", "/a/(.*)"],
};
