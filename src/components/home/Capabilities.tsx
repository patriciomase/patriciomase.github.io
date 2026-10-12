"use client";

import { useLanguage } from "../LanguageProvider";
import { Kicker } from "./Kicker";
import { CAPABILITIES, TOOLS } from "./data";

export function Capabilities() {
  const { t } = useLanguage();

  return (
    <section id="capabilities" className="has-grid" data-seam>
      <div className="wrap">
        <div className="section-head">
          <div>
            <Kicker index="04">{t("kicker.capabilities")}</Kicker>
            <h2>{t("capabilities.title")}</h2>
          </div>
        </div>
        <div className="capabilities">
          {CAPABILITIES.map((capability, i) => (
            <article
              className="capability plate heatable"
              key={capability.title}
              data-card
            >
              <span className="capability-index">C/{String(i + 1).padStart(2, "0")}</span>
              <h3>{t(capability.title)}</h3>
              <p>{t(capability.body)}</p>
            </article>
          ))}
        </div>
        <div className="tools">
          <span className="tools-label">{t("capabilities.tools")}</span>
          <ul className="tool-marks">
            {TOOLS.map((tool) => (
              <li className="tool-mark" key={tool}>
                {tool}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
