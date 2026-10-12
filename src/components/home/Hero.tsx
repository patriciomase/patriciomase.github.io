"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useLanguage } from "../LanguageProvider";
import { useMotion } from "../forge/MotionProvider";
import { Kicker } from "./Kicker";
import { HeroPoster } from "./HeroPoster";

export function Hero() {
  const { t } = useLanguage();
  const { tier, setAmbientSource } = useMotion();
  const stageRef = useRef<HTMLDivElement>(null);

  /* Embers rise off the gear side of the stage while the hero is on screen. */
  useEffect(() => {
    const stage = stageRef.current;
    if (tier !== "full" || !stage) return;
    const source = () => {
      const r = stage.getBoundingClientRect();
      return new DOMRect(r.left + r.width * 0.45, r.top, r.width * 0.55, r.height);
    };
    const observer = new IntersectionObserver(([entry]) =>
      setAmbientSource(entry.isIntersecting ? source : null),
    );
    observer.observe(stage);
    return () => {
      observer.disconnect();
      setAmbientSource(null);
    };
  }, [tier, setAmbientSource]);

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-stage" ref={stageRef} aria-hidden="true">
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
