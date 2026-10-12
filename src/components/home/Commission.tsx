"use client";

import { useLanguage } from "../LanguageProvider";
import { ContactForm } from "../ContactForm";
import { Kicker } from "./Kicker";

export function Commission() {
  const { t } = useLanguage();

  return (
    <section id="contact" data-seam>
      <div className="wrap commission">
        <div className="commission-intro">
          <Kicker index="06">{t("kicker.commission")}</Kicker>
          <h2>{t("contact.title")}</h2>
          <p>{t("contact.body")}</p>
        </div>
        <div className="work-order plate">
          <p className="work-order-head">{t("contact.orderLabel")}</p>
          <ContactForm />
        </div>
      </div>
    </section>
  );
}
