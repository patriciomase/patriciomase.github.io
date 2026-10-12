"use client";

import { useCallback, useRef, useState } from "react";
import { useLanguage } from "../LanguageProvider";
import { ContactForm } from "../ContactForm";
import { useMotion } from "../forge/MotionProvider";
import { Kicker } from "./Kicker";

export function Commission() {
  const { t } = useLanguage();
  const { burst } = useMotion();
  const orderRef = useRef<HTMLDivElement>(null);
  const [welds, setWelds] = useState(0);

  /* Each successful send mounts a fresh ring (keyed by count), so the weld
     runs again for a second message rather than staying finished. */
  const onSent = useCallback(() => {
    setWelds((n) => n + 1);
    const r = orderRef.current?.getBoundingClientRect();
    if (r) burst(r.left + r.width / 2, r.top, 1.2);
  }, [burst]);

  return (
    <section id="contact" data-seam>
      <div className="wrap commission">
        <div className="commission-intro">
          <Kicker index="06">{t("kicker.commission")}</Kicker>
          <h2>{t("contact.title")}</h2>
          <p>{t("contact.body")}</p>
        </div>
        <div className="work-order plate" ref={orderRef}>
          {welds > 0 ? <span className="weld-ring" key={welds} aria-hidden="true" /> : null}
          <p className="work-order-head">{t("contact.orderLabel")}</p>
          <ContactForm onSent={onSent} />
        </div>
      </div>
    </section>
  );
}
