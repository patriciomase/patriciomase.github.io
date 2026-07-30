"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitContact, type ContactState } from "@/app/actions";
import { useLanguage } from "./LanguageProvider";

const INITIAL: ContactState = { status: "idle" };

function SubmitButton() {
  const { t } = useLanguage();
  const { pending } = useFormStatus();

  return (
    <button className="btn" type="submit" disabled={pending}>
      {pending ? t("contact.sending") : t("contact.send")}
    </button>
  );
}

/**
 * Replaces the static site's mailto: button, which needed a configured mail
 * client to do anything and left no record of who wrote in.
 */
export function ContactForm() {
  const { locale, t } = useLanguage();
  const [state, formAction] = useActionState(submitContact, INITIAL);

  return (
    <form className="contact-form" action={formAction}>
      <input type="hidden" name="locale" value={locale} />
      {/* Honeypot -- hidden from people, irresistible to bots. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        style={{ display: "none" }}
      />

      <label>
        {t("contact.name")}
        <input
          type="text"
          name="name"
          required
          maxLength={120}
          autoComplete="name"
          placeholder={t("contact.namePlaceholder")}
        />
      </label>

      <label>
        {t("contact.emailField")}
        <input
          type="email"
          name="email"
          required
          maxLength={200}
          autoComplete="email"
          placeholder={t("contact.emailPlaceholder")}
        />
      </label>

      <label>
        {t("contact.message")}
        <textarea
          name="body"
          required
          maxLength={5000}
          placeholder={t("contact.messagePlaceholder")}
        />
      </label>

      <SubmitButton />

      {state.status === "success" && (
        <p className="form-status ok" role="status">
          {t("contact.success")}
        </p>
      )}
      {state.status === "invalid" && (
        <p className="form-status error" role="alert">
          {t("contact.invalid")}
        </p>
      )}
      {state.status === "error" && (
        <p className="form-status error" role="alert">
          {t("contact.error")}
        </p>
      )}
    </form>
  );
}
