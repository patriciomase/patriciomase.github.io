"use client";

import { useLanguage } from "../LanguageProvider";
import { Kicker } from "./Kicker";
import { EXPERIENCE } from "./data";

export function Experience() {
  const { t } = useLanguage();

  return (
    <section id="experience" data-seam>
      <div className="wrap">
        <div className="section-head">
          <div>
            <Kicker index="05">{t("kicker.marks")}</Kicker>
            <h2>{t("experience.title")}</h2>
          </div>
          <p className="section-note">{t("experience.note")}</p>
        </div>
        <ol className="marks">
          {EXPERIENCE.map((item) => (
            <li className="mark-row heatable" key={item.company}>
              <span
                className={item.dark ? "hallmark dark" : "hallmark"}
                aria-hidden="true"
                data-hallmark
              >
                <span>{item.initials}</span>
                {/* Plain <img>: tiny local logos layered over a text
                    fallback, so the optimizer buys nothing here. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.logo} alt="" loading="lazy" />
              </span>
              <div>
                <h3>{t(item.role)}</h3>
                <p>{item.company}</p>
              </div>
              <span className="mark-date">
                {item.dateKey ? t(item.dateKey) : item.date}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
