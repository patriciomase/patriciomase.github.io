"use client";

import Image from "next/image";
import { useLanguage } from "../LanguageProvider";
import { Kicker } from "./Kicker";
import { PROCESS_STEPS } from "./data";

export function Process() {
  const { t } = useLanguage();

  return (
    <section id="about" className="has-grid" data-seam data-process>
      <div className="wrap process">
        <div className="process-intro">
          <Kicker index="02">{t("kicker.process")}</Kicker>
          <h2>{t("process.title")}</h2>
          <p>{t("process.intro")}</p>
          <figure className="portrait-plate plate heatable">
            <Image
              src="/pmaseda.jpg"
              alt={t("process.portrait")}
              width={640}
              height={800}
              sizes="(max-width: 860px) 70vw, 300px"
            />
            <figcaption>{t("process.portraitCaption")}</figcaption>
          </figure>
        </div>
        <div className="process-track">
          <span className="process-rail" aria-hidden="true">
            <span className="process-rail-fill" data-rail />
          </span>
          <ol className="process-steps" aria-label={t("process.stepsLabel")}>
            {PROCESS_STEPS.map((step, i) => (
              <li className="process-step plate heatable" key={step.title} data-step>
                <span className="step-node" aria-hidden="true" />
                <span className="step-index">{String(i + 1).padStart(2, "0")}</span>
                <h3>{t(step.title)}</h3>
                <p>{t(step.body)}</p>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
