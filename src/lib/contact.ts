import { db } from "@/db";
import { messages } from "@/db/schema";
import { isLocale } from "./i18n";

export type ContactStatus = "success" | "error" | "invalid";

/** Generous caps that still stop someone pasting a novel into the table. */
export const LIMITS = { name: 120, email: 200, body: 5000 } as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type ContactSubmission = {
  name: string;
  email: string;
  body: string;
  locale: string;
  /** Honeypot field: any value means a bot filled a field people cannot see. */
  company?: string;
};

/**
 * Validate and store a contact submission.
 *
 * Kept apart from the Server Action wrapper so the rules can be exercised
 * directly, without having to drive React's form encoding to reach them.
 */
export async function recordContactSubmission(
  input: ContactSubmission,
): Promise<ContactStatus> {
  // Accept the bot's post silently: it sees success and does not retry with a
  // different shape, and nothing is written.
  if (input.company) {
    return "success";
  }

  const name = input.name.trim();
  const email = input.email.trim();
  const body = input.body.trim();
  const locale = isLocale(input.locale) ? input.locale : "en";

  const valid =
    name.length > 0 &&
    name.length <= LIMITS.name &&
    email.length <= LIMITS.email &&
    EMAIL_PATTERN.test(email) &&
    body.length > 0 &&
    body.length <= LIMITS.body;

  if (!valid) {
    return "invalid";
  }

  try {
    await db.insert(messages).values({ name, email, body, locale });
    return "success";
  } catch (error) {
    console.error("Failed to store contact message", error);
    return "error";
  }
}
