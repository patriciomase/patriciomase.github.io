/**
 * Site copy, in both languages.
 *
 * The static site kept two dictionaries -- one inline in index.html for the
 * portfolio, one in assets/blog.js for the blog chrome -- with overlapping keys
 * that had to be edited in tandem. They are merged into one here.
 *
 * Long-form prose is deliberately *not* in this dictionary. Articles carry two
 * complete bodies in the database (posts.body_en / posts.body_es), because a
 * dictionary entry per paragraph is unworkable for an essay.
 */

export const LOCALES = ["en", "es"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

/** Shared with the static site's key so an existing visitor's choice survives. */
export const LOCALE_STORAGE_KEY = "portfolio-language";

export function isLocale(value: unknown): value is Locale {
  return value === "en" || value === "es";
}

const en = {
  metaDescription:
    "Portfolio of Patricio Gabriel Maseda, product-minded senior software engineer building practical software for products, teams, automation, and AI-enabled workflows.",
  "nav.work": "Work",
  "nav.experience": "Experience",
  "nav.about": "About",
  "nav.blog": "Blog",
  "nav.contact": "Contact",
  "nav.backHome": "Back to portfolio",
  "nav.language": "Language",
  "nav.primary": "Primary navigation",
  "nav.home": "Patricio Gabriel Maseda home",
  "hero.eyebrow": "Product-minded senior software engineer",
  "hero.title": "I turn product ideas and team workflows into useful software.",
  "hero.lead":
    "I work across interfaces, internal tools, automation, and AI-assisted processes, with attention to product feel, maintainable code, and everyday usability.",
  "hero.viewWork": "View work",
  "hero.contact": "Get in touch",
  "hero.portrait": "Portrait of Patricio Gabriel Maseda",
  "work.title": "Selected work",
  "work.note":
    "Client systems across ecommerce, media, healthcare, hospitality, and monitoring-heavy internal tooling — plus GastosCasa, a product of my own that I design, build, and run.",
  "work.recent": "Recent",
  "work.ongoing": "Ongoing",
  "work.card1.tag": "Product engineering",
  "work.card1.title": "Building-wide PTAC control",
  "work.card1.body":
    "A dashboard for operating the PTAC units across entire rental buildings. Operators trigger remote actions on a unit or a whole property, schedule device state changes ahead of time, pull usage reports, and manage account-level access to each building. Devices report over AWS IoT, so the interface has to stay honest about fleet state that arrives asynchronously.",
  "work.card2.tag": "Applications",
  "work.card2.title": "Guided intake and follow-up",
  "work.card2.body":
    "Multi-step applications that walk people through long forms, capture structured data, and hand it to the teams doing follow-up. Most of the work is state: partial progress, validation, and resuming days later without losing anything.",
  "work.card3.tag": "Web platforms",
  "work.card3.title": "Storefronts and content platforms",
  "work.card3.body":
    "Public ecommerce and editorial platforms where the render path is the product — fast pages, CMS-driven content, and analytics clean enough for merchandising and marketing teams to act on.",
  "work.card4.tag": "Personal product",
  "work.card4.title": "GastosCasa",
  "work.card4.body":
    "A shared household expense tracker built for inflationary economies. Members log spending in one currency and read it in a second, with the exchange rate frozen at the moment of entry — so a grocery run from 2024 still shows what it actually cost. Handles credit-card installments, recurring bills, and monthly reports, on web and mobile.",
  "work.card4.link": "gastoscasa.com",
  "experience.title": "Experience",
  "experience.note":
    "A career building web products end to end: system architecture, product delivery, performance, observability, and shipping across the stack.",
  "experience.utility.role": "Senior Software Engineer",
  "experience.utility.date": "2023-present",
  "experience.mejuri.role": "Senior Software Engineer II",
  "experience.spark.role": "Senior Software Engineer",
  "experience.avalith.role": "PHP Backend Software Engineer",
  "experience.education.role": "Técnico Superior en Programación",
  "about.eyebrow": "About",
  "about.title": "I like software that gets out of the way.",
  "about.body1":
    "I work across product, architecture, and implementation details, with a bias toward tools that are clear, fast, and easy to maintain. I have been building software since 2011: designing systems, writing backend services, building interfaces, and owning delivery, monitoring, and hiring.",
  "about.body2":
    "My current approach is AI-assisted by default: I use modern development tools to shorten feedback loops, refine processes, and move from idea to working software as quickly as possible.",
  "skills.label": "Skills",
  "skills.monitoring": "Monitoring",
  "skills.productEngineering": "Product engineering",
  "skills.systemArchitecture": "System architecture",
  "skills.aiWorkflows": "AI workflows",
  "skills.teamCollaboration": "Team collaboration",
  "contact.title": "Have something useful to build?",
  "contact.body":
    "Reach out about product ideas, internal tools, automation, AI-enabled workflows, or practical software for real users.",
  "contact.email": "Email me",
  "contact.name": "Name",
  "contact.namePlaceholder": "Your name",
  "contact.emailField": "Email",
  "contact.emailPlaceholder": "you@example.com",
  "contact.message": "Message",
  "contact.messagePlaceholder": "What are you building?",
  "contact.send": "Send message",
  "contact.sending": "Sending…",
  "contact.success": "Thanks — message received. I'll get back to you.",
  "contact.error": "Something went wrong. Please try again.",
  "contact.invalid": "Please fill in your name, a valid email, and a message.",
  "blog.title": "Blog",
  "blog.heading": "Things I build, break, and fix.",
  "blog.lead":
    "Occasional write-ups. Mostly practical: what broke, what I measured, and what turned out to be the actual cause.",
  "blog.note": "Occasional write-ups about things I build, break, and fix.",
  "blog.back": "← All posts",
  "blog.empty": "No posts yet. Check back soon.",
  "blog.readTime": "min read",
  "footer.builtWith": "Proudly built with Codex and Claude Code.",
} as const;

export type MessageKey = keyof typeof en;

const es: Record<MessageKey, string> = {
  metaDescription:
    "Portfolio de Patricio Gabriel Maseda, ingeniero de software senior orientado a producto, especializado en crear soluciones prácticas, automatizaciones y flujos de trabajo con IA.",
  "nav.work": "Trabajo",
  "nav.experience": "Experiencia",
  "nav.about": "Sobre mí",
  "nav.blog": "Blog",
  "nav.contact": "Contacto",
  "nav.backHome": "Volver al inicio",
  "nav.language": "Idioma",
  "nav.primary": "Navegación principal",
  "nav.home": "Inicio de Patricio Gabriel Maseda",
  "hero.eyebrow": "Ingeniero de software senior orientado a producto",
  "hero.title":
    "Transformo ideas de producto y formas de trabajo en software útil.",
  "hero.lead":
    "Trabajo con interfaces, herramientas internas, automatización y procesos asistidos por IA, con especial atención a la experiencia, la calidad del código y el uso cotidiano.",
  "hero.viewWork": "Ver proyectos",
  "hero.contact": "Hablemos",
  "hero.portrait": "Retrato de Patricio Gabriel Maseda",
  "work.title": "Proyectos destacados",
  "work.note":
    "Sistemas para clientes de comercio electrónico, medios, salud y hotelería; herramientas internas centradas en monitoreo; y GastosCasa, un producto propio que diseño, desarrollo y mantengo.",
  "work.recent": "Reciente",
  "work.ongoing": "En curso",
  "work.card1.tag": "Ingeniería de producto",
  "work.card1.title": "Control de equipos PTAC en edificios completos",
  "work.card1.body":
    "Un panel para controlar las unidades PTAC de edificios completos destinados a alquiler. Los operadores pueden ejecutar acciones remotas sobre un equipo o todo un edificio, programar cambios de estado, consultar informes de uso y administrar el acceso de cada cuenta. Los dispositivos se comunican mediante AWS IoT, por lo que la interfaz debe reflejar con claridad un estado de flota que se actualiza de forma asincrónica.",
  "work.card2.tag": "Aplicaciones",
  "work.card2.title": "Formularios guiados y seguimiento",
  "work.card2.body":
    "Aplicaciones que acompañan a las personas a través de formularios extensos, recopilan datos estructurados y los ponen a disposición de los equipos encargados del seguimiento. El desafío principal está en manejar el estado: guardar avances parciales, validar la información y permitir que alguien retome el proceso días después sin perder nada.",
  "work.card3.tag": "Plataformas web",
  "work.card3.title": "Tiendas y plataformas de contenido",
  "work.card3.body":
    "Plataformas públicas de comercio electrónico y contenidos donde la experiencia depende directamente de cómo se construye cada página: buena velocidad, contenido administrado desde un CMS y datos confiables para que los equipos comerciales y de marketing puedan tomar decisiones.",
  "work.card4.tag": "Producto propio",
  "work.card4.title": "GastosCasa",
  "work.card4.body":
    "Un gestor de gastos compartidos pensado para economías con inflación. Los integrantes registran consumos en una moneda y pueden consultarlos en otra, con el tipo de cambio fijado al momento de cada carga. Así, una compra del supermercado de 2024 sigue mostrando cuánto costó realmente. Incluye cuotas de tarjeta, gastos recurrentes e informes mensuales, tanto en la web como en dispositivos móviles.",
  "work.card4.link": "gastoscasa.com",
  "experience.title": "Experiencia",
  "experience.note":
    "Una trayectoria creando productos web de punta a punta: arquitectura de sistemas, entrega de producto, rendimiento, observabilidad y desarrollo en todas las capas.",
  "experience.utility.role": "Senior Software Engineer",
  "experience.utility.date": "2023-presente",
  "experience.mejuri.role": "Senior Software Engineer II",
  "experience.spark.role": "Senior Software Engineer",
  "experience.avalith.role": "PHP Backend Software Engineer",
  "experience.education.role": "Técnico Superior en Programación",
  "about.eyebrow": "Sobre mí",
  "about.title": "Me gusta el software que no se interpone.",
  "about.body1":
    "Trabajo en la intersección entre producto, arquitectura e implementación, con preferencia por herramientas claras, rápidas y fáciles de mantener. Desarrollo software desde 2011: diseño sistemas, escribo servicios de backend, construyo interfaces y me hago cargo de la entrega, el monitoreo y la formación de equipos.",
  "about.body2":
    "Hoy incorporo la IA desde el inicio del proceso: uso herramientas modernas de desarrollo para acortar los ciclos de validación, mejorar la forma de trabajar y convertir ideas en software funcional con mayor rapidez.",
  "skills.label": "Habilidades",
  "skills.monitoring": "Monitoreo",
  "skills.productEngineering": "Ingeniería de producto",
  "skills.systemArchitecture": "Arquitectura de sistemas",
  "skills.aiWorkflows": "Flujos de trabajo con IA",
  "skills.teamCollaboration": "Trabajo en equipo",
  "contact.title": "¿Tenés algo útil en mente?",
  "contact.body":
    "Escribime si querés conversar sobre ideas de producto, herramientas internas, automatización, flujos de trabajo con IA o software pensado para resolver problemas reales.",
  "contact.email": "Escribime",
  "contact.name": "Nombre",
  "contact.namePlaceholder": "Tu nombre",
  "contact.emailField": "Email",
  "contact.emailPlaceholder": "vos@ejemplo.com",
  "contact.message": "Mensaje",
  "contact.messagePlaceholder": "¿Qué estás construyendo?",
  "contact.send": "Enviar mensaje",
  "contact.sending": "Enviando…",
  "contact.success": "Gracias, recibí tu mensaje. Te respondo pronto.",
  "contact.error": "Algo salió mal. Probá de nuevo.",
  "contact.invalid": "Completá tu nombre, un email válido y un mensaje.",
  "blog.title": "Blog",
  "blog.heading": "Cosas que construyo, rompo y arreglo.",
  "blog.lead":
    "Notas ocasionales. Sobre todo prácticas: qué se rompió, qué medí y cuál resultó ser la causa real.",
  "blog.note": "Notas ocasionales sobre cosas que construyo, rompo y arreglo.",
  "blog.back": "← Todos los posts",
  "blog.empty": "Todavía no hay posts. Volvé pronto.",
  "blog.readTime": "min de lectura",
  "footer.builtWith": "Creado con orgullo junto a Codex y Claude Code.",
};

export const messages: Record<Locale, Record<MessageKey, string>> = { en, es };

export function translate(locale: Locale, key: MessageKey): string {
  return messages[locale][key] ?? messages[DEFAULT_LOCALE][key];
}

/**
 * Format a post date the way each language writes it: "30 July 2026" against
 * "30 de julio de 2026". Uses UTC so the displayed day matches the stored date
 * regardless of where the reader is.
 */
export function formatPostDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
