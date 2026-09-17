import { currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";

/**
 * Who is allowed into /a, as a comma-separated ADMIN_EMAILS list.
 *
 * Clerk authenticates, it doesn't authorise: anyone who reaches the sign-in
 * page can create an account. This list is the real gate, and it is checked
 * server-side in every admin page and server action rather than once in a
 * layout or in the proxy -- Next.js re-renders a page without re-running its
 * layout, and a server action never touches either.
 */
function allowlist(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

/**
 * Sends anyone not signed in to the sign-in page, and 404s anyone who is
 * signed in but not on the list -- rather than a "forbidden" page, which would
 * confirm to a stranger that the panel is really there.
 */
export async function requireAdmin(): Promise<void> {
  const user = await currentUser();
  if (!user) redirect("/a/sign-in");

  const emails = allowlist();
  const allowed = user.emailAddresses.some(
    (address) =>
      address.verification?.status === "verified" &&
      emails.includes(address.emailAddress.toLowerCase()),
  );

  if (!allowed) notFound();
}
