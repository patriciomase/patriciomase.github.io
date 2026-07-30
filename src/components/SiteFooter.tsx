"use client";

import { useLanguage } from "./LanguageProvider";

/**
 * `bordered` draws the top rule the blog pages need. The homepage's final
 * section already ends in one, so it would double up there.
 */
export function SiteFooter({ bordered = false }: { bordered?: boolean }) {
  const { t } = useLanguage();

  return (
    <footer className={bordered ? "bordered" : undefined}>
      <div className="wrap">
        <div className="footer-inner">
          <span>© 2026 Patricio Gabriel Maseda</span>
          <div className="footer-links">
            <a
              href="https://www.linkedin.com/in/patricio-gabriel-maseda-1424b845"
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
            <a
              href="https://github.com/patriciomase?tab=repositories"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
          </div>
        </div>
        <div className="built-with">{t("footer.builtWith")}</div>
      </div>
    </footer>
  );
}
