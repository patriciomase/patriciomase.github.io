"use client";

import { useLanguage } from "./LanguageProvider";

/** Every page ends on the same hairline seam, drawn by `footer` in base.css. */
export function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer>
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
