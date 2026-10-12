import type { MessageKey } from "@/lib/i18n";

/** A dictionary key, or a literal that reads the same in both languages (product names, APIs). */
export type Text = MessageKey | { literal: string };

export function textOf(t: (key: MessageKey) => string, text: Text): string {
  return typeof text === "string" ? t(text) : text.literal;
}

export type SpecRow = { label: MessageKey; value: Text };

/**
 * Selected-work cards. Copy lives in the dictionary; only shape lives here.
 * `href` is set only on work that is publicly visitable -- the client systems
 * are behind logins and not attributable, so they stay unlinked. Spec rows
 * restate facts the card copy already gives; they never add disclosure.
 */
export const WORK_CARDS: {
  tag: MessageKey;
  when: Extract<MessageKey, "work.ongoing" | "work.recent">;
  title: MessageKey;
  body: MessageKey;
  spec: SpecRow[];
  own?: boolean;
  href?: string;
  hrefLabel?: MessageKey;
  icon?: string;
}[] = [
  {
    tag: "work.card1.tag",
    when: "work.ongoing",
    title: "work.card1.title",
    body: "work.card1.body",
    spec: [
      { label: "spec.scale", value: "work.card1.spec.scale" },
      { label: "spec.control", value: "work.card1.spec.control" },
      { label: "spec.access", value: "work.spec.privateClient" },
    ],
  },
  {
    tag: "work.card2.tag",
    when: "work.recent",
    title: "work.card2.title",
    body: "work.card2.body",
    spec: [
      { label: "spec.handles", value: "work.card2.spec.handles" },
      { label: "spec.handsOff", value: "work.card2.spec.handsOff" },
      { label: "spec.access", value: "work.spec.privateClient" },
    ],
  },
  {
    tag: "work.card3.tag",
    when: "work.recent",
    title: "work.card3.title",
    body: "work.card3.body",
    spec: [
      { label: "spec.focus", value: "work.card3.spec.focus" },
      { label: "spec.usedBy", value: "work.card3.spec.usedBy" },
    ],
  },
  {
    tag: "work.card4.tag",
    when: "work.ongoing",
    title: "work.card4.title",
    body: "work.card4.body",
    own: true,
    href: "https://gastoscasa.com",
    hrefLabel: "work.card4.link",
    icon: "/logos/gastoscasa.png",
    spec: [
      { label: "spec.platform", value: "work.spec.webMobile" },
      { label: "spec.handles", value: "work.card4.spec.handles" },
      { label: "spec.role", value: "work.card4.spec.role" },
    ],
  },
  {
    tag: "work.card4.tag",
    when: "work.ongoing",
    title: "work.card5.title",
    body: "work.card5.body",
    own: true,
    href: "https://vivaire.app",
    hrefLabel: "work.card5.link",
    icon: "/logos/vivaire.svg",
    spec: [
      { label: "spec.platform", value: "work.spec.webMobile" },
      { label: "spec.cues", value: "work.card5.spec.cues" },
      { label: "spec.handles", value: "work.card5.spec.handles" },
    ],
  },
  {
    tag: "work.card4.tag",
    when: "work.ongoing",
    title: "work.card6.title",
    body: "work.card6.body",
    own: true,
    href: "https://fatbeats.org",
    hrefLabel: "work.card6.link",
    spec: [
      { label: "spec.runsIn", value: "work.card6.spec.runsIn" },
      { label: "spec.builtOn", value: { literal: "Web Audio API · Canvas" } },
      { label: "spec.modes", value: "work.card6.spec.modes" },
      { label: "spec.privacy", value: "work.card6.spec.privacy" },
    ],
  },
];

/** The four strikes of the Process section, in order. */
export const PROCESS_STEPS: { title: MessageKey; body: MessageKey }[] = [
  { title: "process.step1.title", body: "process.step1.body" },
  { title: "process.step2.title", body: "process.step2.body" },
  { title: "process.step3.title", body: "process.step3.body" },
  { title: "process.step4.title", body: "process.step4.body" },
];

/** The old skill chips, each grown into a block. Titles reuse the chip labels. */
export const CAPABILITIES: { title: MessageKey; body: MessageKey }[] = [
  { title: "skills.systemArchitecture", body: "capabilities.architecture.body" },
  { title: "skills.productEngineering", body: "capabilities.product.body" },
  { title: "skills.aiWorkflows", body: "capabilities.ai.body" },
  { title: "capabilities.monitoring.title", body: "capabilities.monitoring.body" },
  { title: "skills.teamCollaboration", body: "capabilities.team.body" },
];

/** Product names, untranslated. */
export const TOOLS = ["React", "Next.js", "Node.js", "AWS"];

/**
 * Career history. `date` is a literal except for the current role, whose
 * "present"/"presente" has to translate. `dark` marks logos that are drawn
 * light-on-dark and so need the dark backdrop.
 */
export const EXPERIENCE: {
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
