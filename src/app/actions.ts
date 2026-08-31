"use server";

import { checkBotId } from "botid/server";
import { recordContactSubmission, type ContactStatus } from "@/lib/contact";

export type ContactState = {
  status: "idle" | ContactStatus;
};

/**
 * Server Action wrapper around the contact rules.
 *
 * Returns a coarse status rather than field-level errors: the form is three
 * fields long and the client already applies `required` plus `type="email"`,
 * so anything reaching the invalid branch is either a scripted post or a
 * browser without validation.
 */
export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  // Same trick as the honeypot in recordContactSubmission: pretend it
  // worked so the bot doesn't retry with a different shape.
  const { isBot } = await checkBotId();
  if (isBot) {
    return { status: "success" };
  }

  const status = await recordContactSubmission({
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    body: String(formData.get("body") ?? ""),
    locale: String(formData.get("locale") ?? "en"),
    company: String(formData.get("company") ?? ""),
  });

  return { status };
}
