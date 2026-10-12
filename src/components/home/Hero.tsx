"use client";

import Link from "next/link";
import { useLanguage } from "../LanguageProvider";
import { Kicker } from "./Kicker";
import { HeroPoster } from "./HeroPoster";

export function Hero() {
  const { t } = useLanguage();

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-stage" aria-hidden="true">
        <HeroPoster />
      </div>
      <div className="wrap hero-copy">
        <Kicker index="01">{t("kicker.workshop")}</Kicker>
        <p className="eyebrow">{t("hero.eyebrow")}</p>
        <h1 id="hero-title">
          {t("hero.title")} <span className="hot">{t("hero.titleHot")}</span>
        </h1>
        <p className="lead">{t("hero.lead")}</p>
        <div className="actions">
          <Link className="btn" href="#work">
            {t("hero.viewWork")}
          </Link>
          <Link className="btn secondary" href="#contact">
            {t("hero.contact")}
          </Link>
        </div>
      </div>
    </section>
  );
}
