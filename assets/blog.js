/* Language handling for the blog.
 *
 * The portfolio page translates key by key via data-i18n, which suits short
 * strings. Long-form prose is different: instead of a dictionary entry per
 * paragraph, each article carries both languages as whole blocks and we show
 * one. Chrome (nav, footer) still uses data-i18n.
 *
 * The storage key is shared with the portfolio deliberately, so choosing ES on
 * one page keeps ES on the other. */
(function () {
  var STORAGE_KEY = 'portfolio-language';

  var strings = {
    en: {
      'nav.work': 'Work',
      'nav.blog': 'Blog',
      'nav.about': 'About',
      'nav.contact': 'Contact',
      'nav.backHome': 'Back to portfolio',
      'blog.title': 'Blog',
      'blog.note': 'Occasional write-ups about things I build, break, and fix.',
      'blog.back': '← All posts',
      'footer.builtWith': 'Proudly built with Codex and Claude Code.'
    },
    es: {
      'nav.work': 'Trabajo',
      'nav.blog': 'Blog',
      'nav.about': 'Sobre mí',
      'nav.contact': 'Contacto',
      'nav.backHome': 'Volver al portfolio',
      'blog.title': 'Blog',
      'blog.note': 'Notas ocasionales sobre cosas que construyo, rompo y arreglo.',
      'blog.back': '← Todos los posts',
      'footer.builtWith': 'Hecho con orgullo usando Codex y Claude Code.'
    }
  };

  function setLanguage(lang) {
    if (lang !== 'en' && lang !== 'es') lang = 'en';
    var dict = strings[lang];

    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var value = dict[el.dataset.i18n];
      if (value) el.textContent = value;
    });

    // Whole-block prose: show the matching language, hide the other.
    document.querySelectorAll('[data-lang-block]').forEach(function (el) {
      el.hidden = el.dataset.langBlock !== lang;
    });

    // Per-language metadata (title, description) where the page provides it.
    var title = document.querySelector('[data-title-' + lang + ']');
    if (title) document.title = title.getAttribute('data-title-' + lang);

    var desc = document.querySelector('meta[name="description"]');
    var descValue = document.body.getAttribute('data-desc-' + lang);
    if (desc && descValue) desc.setAttribute('content', descValue);

    document.querySelectorAll('[data-lang]').forEach(function (btn) {
      btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
    });

    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* private mode */ }
  }

  document.querySelectorAll('[data-lang]').forEach(function (btn) {
    btn.addEventListener('click', function () { setLanguage(btn.dataset.lang); });
  });

  var stored = null;
  try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  var browser = navigator.language && navigator.language.indexOf('es') === 0 ? 'es' : 'en';
  setLanguage(stored || browser);
})();
