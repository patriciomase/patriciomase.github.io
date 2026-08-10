"use client";

import Link from "next/link";
import { LOCALES } from "@/lib/i18n";
import { useLanguage } from "./LanguageProvider";

type NavLink = { href: string; labelKey: Parameters<ReturnType<typeof useLanguage>["t"]>[0] };

/** The portfolio's in-page anchors; the blog pages get a shorter set. */
const PORTFOLIO_LINKS: NavLink[] = [
  { href: "/#work", labelKey: "nav.work" },
  { href: "/#experience", labelKey: "nav.experience" },
  { href: "/#about", labelKey: "nav.about" },
  { href: "/blog", labelKey: "nav.blog" },
  { href: "/#contact", labelKey: "nav.contact" },
];

const BLOG_LINKS: NavLink[] = [
  { href: "/blog", labelKey: "nav.blog" },
  { href: "/", labelKey: "nav.backHome" },
];

export function SiteHeader({ variant = "portfolio" }: { variant?: "portfolio" | "blog" }) {
  const { locale, setLocale, t } = useLanguage();
  const links = variant === "blog" ? BLOG_LINKS : PORTFOLIO_LINKS;

  return (
    <header>
      <nav className="wrap" aria-label={t("nav.primary")}>
        <Link className="brand" href="/" aria-label={t("nav.home")}>
          <span className="mark">PM</span>
          <span>Patricio Gabriel Maseda</span>
        </Link>
        <div className="nav-links">
          {links.map((link) => (
            <Link key={link.href + link.labelKey} href={link.href}>
              {t(link.labelKey)}
            </Link>
          ))}
        </div>
        <div className="lang-switch" aria-label={t("nav.language")}>
          {LOCALES.map((code) => (
            <button
              key={code}
              type="button"
              aria-pressed={code === locale}
              onClick={() => setLocale(code)}
            >
              {code.toUpperCase()}
            </button>
          ))}
        </div>
      </nav>
    </header>
  );
}
