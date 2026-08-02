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
    "Portfolio de Patricio Gabriel Maseda, senior software engineer con mentalidad de producto que construye software práctico para productos, equipos, automatización y flujos de trabajo con IA.",
  "nav.work": "Trabajo",
  "nav.experience": "Experiencia",
  "nav.about": "Sobre mí",
  "nav.blog": "Blog",
  "nav.contact": "Contacto",
  "nav.backHome": "Volver al portfolio",
  "nav.language": "Idioma",
  "nav.primary": "Navegación principal",
  "nav.home": "Inicio de Patricio Gabriel Maseda",
  "hero.eyebrow": "Senior software engineer con mentalidad de producto",
  "hero.title":
    "Convierto ideas de producto y procesos de equipo en software útil.",
  "hero.lead":
    "Trabajo en interfaces, herramientas internas, automatización y procesos asistidos por IA, cuidando la experiencia, el código mantenible y la usabilidad diaria.",
  "hero.viewWork": "Ver trabajo",
  "hero.contact": "Contactarme",
  "hero.portrait": "Retrato de Patricio Gabriel Maseda",
  "work.title": "Trabajo seleccionado",
  "work.note":
    "Sistemas para clientes en ecommerce, medios, salud, hospitality y herramientas internas con foco fuerte en monitoreo — más GastosCasa, un producto propio que diseño, construyo y mantengo.",
  "work.recent": "Reciente",
  "work.ongoing": "Actual",
  "work.card1.tag": "Product engineering",
  "work.card1.title": "Control de PTAC a escala de edificio",
  "work.card1.body":
    "Un panel para operar las unidades PTAC de edificios enteros de alquiler. Los operadores disparan acciones remotas sobre una unidad o una propiedad completa, programan cambios de estado con anticipación, sacan reportes de uso y gestionan el acceso por cuenta a cada edificio. Los dispositivos reportan por AWS IoT, así que la interfaz tiene que ser fiel a un estado de flota que llega de forma asincrónica.",
  "work.card2.tag": "Aplicaciones",
  "work.card2.title": "Intake guiado y seguimiento",
  "work.card2.body":
    "Aplicaciones de varios pasos que guían a las personas por formularios largos, capturan datos estructurados y los entregan a los equipos que hacen el seguimiento. Casi todo el trabajo es estado: progreso parcial, validación y retomar días después sin perder nada.",
  "work.card3.tag": "Plataformas web",
  "work.card3.title": "Storefronts y plataformas de contenido",
  "work.card3.body":
    "Plataformas públicas de ecommerce y editoriales donde el render es el producto: páginas rápidas, contenido gestionado por CMS y analítica lo bastante limpia como para que los equipos de negocio actúen sobre ella.",
  "work.card4.tag": "Producto propio",
  "work.card4.title": "GastosCasa",
  "work.card4.body":
    "Un gestor de gastos del hogar pensado para economías con inflación. Los miembros cargan gastos en una moneda y los leen en una segunda, con el tipo de cambio congelado en el momento de la carga: así, un súper de 2024 sigue mostrando lo que realmente costó. Maneja cuotas de tarjeta, gastos recurrentes y reportes mensuales, en web y mobile.",
  "work.card4.link": "gastoscasa.com",
  "experience.title": "Experiencia",
  "experience.note":
    "Una carrera construyendo productos web de punta a punta: arquitectura de sistemas, entrega de producto, performance, observabilidad y desarrollo en todo el stack.",
  "experience.utility.role": "Senior Software Engineer",
  "experience.utility.date": "2023-presente",
  "experience.mejuri.role": "Senior Software Engineer II",
  "experience.spark.role": "Senior Software Engineer",
  "experience.avalith.role": "PHP Backend Software Engineer",
  "experience.education.role": "Técnico Superior en Programación",
  "about.eyebrow": "Sobre mí",
  "about.title": "Me gusta el software que no estorba.",
  "about.body1":
    "Trabajo entre producto, arquitectura e implementación, con una inclinación por herramientas claras, rápidas y fáciles de mantener. Construyo software desde 2011: diseñando sistemas, escribiendo servicios backend, construyendo interfaces y haciéndome cargo de la entrega, el monitoreo y el hiring.",
  "about.body2":
    "Mi enfoque actual es asistido por IA por defecto: uso herramientas modernas de desarrollo para acortar ciclos de feedback, afinar procesos y pasar de una idea a software funcionando lo más rápido posible.",
  "skills.label": "Habilidades",
  "skills.monitoring": "Monitoreo",
  "skills.productEngineering": "Product engineering",
  "skills.systemArchitecture": "Arquitectura de sistemas",
  "skills.aiWorkflows": "Flujos de trabajo con IA",
  "skills.teamCollaboration": "Colaboración en equipo",
  "contact.title": "¿Tenés algo útil para construir?",
  "contact.body":
    "Contactame por ideas de producto, herramientas internas, automatización, flujos de trabajo con IA o software práctico para usuarios reales.",
  "contact.email": "Escribime",
  "contact.name": "Nombre",
  "contact.namePlaceholder": "Tu nombre",
  "contact.emailField": "Email",
  "contact.emailPlaceholder": "vos@ejemplo.com",
  "contact.message": "Mensaje",
  "contact.messagePlaceholder": "¿Qué estás construyendo?",
  "contact.send": "Enviar mensaje",
  "contact.sending": "Enviando…",
  "contact.success": "Gracias — mensaje recibido. Te respondo pronto.",
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
  "footer.builtWith": "Hecho con orgullo usando Codex y Claude Code.",
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
