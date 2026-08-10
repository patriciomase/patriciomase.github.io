"use client";

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "./LanguageProvider";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { ContactForm } from "./ContactForm";
import type { MessageKey } from "@/lib/i18n";

/**
 * Selected-work cards. Copy lives in the dictionary; only shape lives here.
 * `href` is set only on work that is publicly visitable — the client systems
 * are behind logins and not attributable, so they stay unlinked.
 */
const WORK_CARDS: {
  tag: MessageKey;
  when: MessageKey;
  title: MessageKey;
  body: MessageKey;
  href?: string;
  hrefLabel?: MessageKey;
  icon?: string;
}[] = [
  {
    tag: "work.card1.tag",
    when: "work.ongoing",
    title: "work.card1.title",
    body: "work.card1.body",
  },
  {
    tag: "work.card2.tag",
    when: "work.recent",
    title: "work.card2.title",
    body: "work.card2.body",
  },
  {
    tag: "work.card3.tag",
    when: "work.recent",
    title: "work.card3.title",
    body: "work.card3.body",
  },
  {
    tag: "work.card4.tag",
    when: "work.ongoing",
    title: "work.card4.title",
    body: "work.card4.body",
    href: "https://gastoscasa.com",
    hrefLabel: "work.card4.link",
    icon: "/logos/gastoscasa.png",
  },
  {
    tag: "work.card4.tag",
    when: "work.ongoing",
    title: "work.card5.title",
    body: "work.card5.body",
    href: "https://vivaire.app",
    hrefLabel: "work.card5.link",
    icon: "/logos/vivaire.svg",
  },
];

/**
 * Career history. `date` is a literal except for the current role, whose
 * "present"/"presente" has to translate. `dark` marks logos that are drawn
 * light-on-dark and so need the ink backdrop.
 */
const EXPERIENCE: {
  initials: string;
  logo: string;
  dark?: boolean;
  role: MessageKey;
  company: string;
  date?: string;
  dateKey?: MessageKey;
}[] = [
  {
    initials: "UT",
    logo: "/logos/utility.svg",
    dark: true,
    role: "experience.utility.role",
    company: "Utility",
    dateKey: "experience.utility.date",
  },
  {
    initials: "MJ",
    logo: "/logos/mejuri.svg",
    role: "experience.mejuri.role",
    company: "Mejuri",
    date: "2019-2023",
  },
  {
    initials: "SD",
    logo: "/logos/spark-digital.png",
    role: "experience.spark.role",
    company: "Spark Digital",
    date: "2014-2019",
  },
  {
    initials: "AV",
    logo: "/logos/avalith.png",
    role: "experience.avalith.role",
    company: "Avalith",
    date: "2012-2014",
  },
  {
    initials: "UTN",
    logo: "/logos/utn.svg",
    dark: true,
    role: "experience.education.role",
    company: "Universidad Tecnológica Nacional",
    date: "2008-2012",
  },
];

/** Skills chips. Product names stay untranslated; the rest are dictionary keys. */
const SKILLS: (MessageKey | { literal: string })[] = [
  { literal: "React" },
  { literal: "Next.js" },
  { literal: "Node.js" },
  { literal: "AWS" },
  "skills.monitoring",
  "skills.productEngineering",
  "skills.systemArchitecture",
  "skills.aiWorkflows",
  "skills.teamCollaboration",
];

export function PortfolioPage() {
  const { t } = useLanguage();

  return (
    <>
      <SiteHeader />

      <main id="top">
        <div className="wrap hero">
          <div>
            <p className="eyebrow">{t("hero.eyebrow")}</p>
            <h1>{t("hero.title")}</h1>
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
          <div className="portrait" aria-label={t("hero.portrait")}>
            <Image
              src="/pmaseda.jpg"
              alt="Patricio Gabriel Maseda"
              width={640}
              height={800}
              priority
            />
          </div>
        </div>

        <section id="work">
          <div className="wrap">
            <div className="section-head">
              <h2>{t("work.title")}</h2>
              <p className="section-note">{t("work.note")}</p>
            </div>
            <div className="grid">
              {WORK_CARDS.map((card) => (
                <article className="card" key={card.title}>
                  <div className="card-top">
                    <span className="tag">{t(card.tag)}</span>
                    <span className="year">{t(card.when)}</span>
                  </div>
                  <h3>
                    {/* Plain <img>: a tiny local product mark, decorative
                        next to the title it already names. */}
                    {card.icon ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img className="card-icon" src={card.icon} alt="" />
                    ) : null}
                    {t(card.title)}
                  </h3>
                  <p>{t(card.body)}</p>
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

        <section id="experience">
          <div className="wrap">
            <div className="section-head">
              <h2>{t("experience.title")}</h2>
              <p className="section-note">{t("experience.note")}</p>
            </div>
            <div className="experience-list">
              {EXPERIENCE.map((item) => (
                <article className="experience-item" key={item.company}>
                  <div className="experience-main">
                    <span
                      className={item.dark ? "company-logo dark" : "company-logo"}
                      aria-hidden="true"
                    >
                      <span>{item.initials}</span>
                      {/* Plain <img>: these are tiny local logos layered over a
                          text fallback, so the optimizer buys nothing here. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.logo} alt="" />
                    </span>
                    <div>
                      <h3>{t(item.role)}</h3>
                      <p>{item.company}</p>
                    </div>
                  </div>
                  <span className="experience-date">
                    {item.dateKey ? t(item.dateKey) : item.date}
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="about">
          <div className="wrap about">
            <div>
              <p className="eyebrow">{t("about.eyebrow")}</p>
              <h2>{t("about.title")}</h2>
            </div>
            <div className="about-panel">
              <p>{t("about.body1")}</p>
              <p>{t("about.body2")}</p>
              <div className="skills" aria-label={t("skills.label")}>
                {SKILLS.map((skill) =>
                  typeof skill === "string" ? (
                    <span className="skill" key={skill}>
                      {t(skill)}
                    </span>
                  ) : (
                    <span className="skill" key={skill.literal}>
                      {skill.literal}
                    </span>
                  ),
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="contact">
          <div className="wrap">
            <div className="contact">
              <div>
                <h2>{t("contact.title")}</h2>
                <p>{t("contact.body")}</p>
              </div>
              <ContactForm />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
