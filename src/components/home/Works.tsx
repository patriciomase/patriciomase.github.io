"use client";

import { useLanguage } from "../LanguageProvider";
import { Kicker } from "./Kicker";
import { WORK_CARDS, textOf } from "./data";

export function Works() {
  const { t } = useLanguage();

  return (
    <section id="work" data-seam>
      <div className="wrap">
        <div className="section-head">
          <div>
            <Kicker index="03">{t("kicker.works")}</Kicker>
            <h2>{t("work.title")}</h2>
          </div>
          <p className="section-note">{t("work.note")}</p>
        </div>
        <div className="works">
          {WORK_CARDS.map((card) => (
            <article className="work-card plate heatable" key={card.title} data-card>
              <div className="card-top">
                <span className="tag">{t(card.tag)}</span>
                {card.own ? <span className="maker-stamp">{t("work.ownMark")}</span> : null}
                <span className={card.when === "work.ongoing" ? "status is-hot" : "status"}>
                  {t(card.when)}
                </span>
              </div>
              <h3>
                {/* Plain <img>: a tiny local product mark, decorative
                    next to the title it already names. */}
                {card.icon ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img className="card-icon" src={card.icon} alt="" loading="lazy" />
                ) : null}
                {t(card.title)}
              </h3>
              <p>{t(card.body)}</p>
              <p className="spec-label">{t("work.specLabel")}</p>
              <dl className="spec">
                {card.spec.map((row) => (
                  <div className="spec-row" key={row.label}>
                    <dt>{t(row.label)}</dt>
                    <dd>{textOf(t, row.value)}</dd>
                  </div>
                ))}
              </dl>
              {card.href && card.hrefLabel ? (
                <a
                  className="card-link"
                  href={card.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t(card.hrefLabel)}
                </a>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
