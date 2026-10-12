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
    "Portfolio of Patricio Gabriel Maseda, a software craftsman and product-minded senior engineer who shapes product ideas and team workflows into software built to last: interfaces, internal tools, automation, and AI-assisted processes.",
  "nav.work": "Work",
  "nav.experience": "Experience",
  "nav.process": "Process",
  "nav.blog": "Blog",
  "nav.contact": "Contact",
  "nav.backHome": "Back to portfolio",
  "nav.language": "Language",
  "nav.primary": "Primary navigation",
  "nav.home": "Patricio Gabriel Maseda home",
  "hero.eyebrow": "Software craftsman · Senior engineer · Since 2011",
  "hero.title": "I shape product ideas and team workflows into software",
  "hero.titleHot": "built to last.",
  "hero.lead":
    "Interfaces, internal tools, automation, and AI-assisted processes, made with attention to product feel, maintainable code, and everyday usability.",
  "hero.viewWork": "See the work",
  "hero.contact": "Start a commission",
  "kicker.workshop": "The workshop",
  "kicker.process": "The process",
  "kicker.works": "Forged works",
  "kicker.capabilities": "Capabilities",
  "kicker.marks": "Maker's marks",
  "kicker.commission": "Commission",
  "process.title": "I build things that don't get in the way.",
  "process.intro":
    "I have been building software since 2011, across product, architecture, and implementation details, with a bias toward tools that are clear, fast, and easy to maintain.",
  "process.portrait": "Portrait of Patricio Gabriel Maseda",
  "process.portraitCaption": "The craftsman",
  "process.stepsLabel": "How a build comes together",
  "process.step1.title": "Raw material",
  "process.step1.body":
    "Every build starts with the product and the people using it: the idea, the team's real workflow, and what has to get easier.",
  "process.step2.title": "Architecture",
  "process.step2.body":
    "Designing the system before the first weld: services, data, and clear boundaries, so it stays easy to maintain.",
  "process.step3.title": "Build & weld",
  "process.step3.body":
    "Backend services and interfaces, joined into one product. AI-assisted by default, to shorten feedback loops and get from idea to working software quickly.",
  "process.step4.title": "Temper & test",
  "process.step4.body":
    "Delivery, monitoring, and observability, so it keeps holding up in everyday use.",
  "work.title": "Selected work",
  "work.note":
    "Client systems across ecommerce, media, healthcare, hospitality, and monitoring-heavy internal tooling — plus GastosCasa, a product of my own that I design, build, and run.",
  "work.recent": "Recent",
  "work.ongoing": "Ongoing",
  "work.card1.tag": "Product engineering",
  "work.card1.title": "Building-wide PTAC control",
  "work.card1.body":
    "A dashboard for remotely operating PTAC units, single unit or building-wide.",
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
    "A shared budget manager for households where several family members track expenses together. Everyone can log spending, review clear charts, organize recurring bills, and keep the monthly budget in order from the web or mobile. It also supports credit-card installments, multiple currencies, and inflation tracking.",
  "work.card4.link": "gastoscasa.com",
  "work.card5.title": "Vivaire",
  "work.card5.body":
    "A guided breathing app for web and mobile. People can build custom routines, follow timed sessions with audio and haptic cues, schedule reminders, review streaks and progress, sync their activity, and share sessions by link.",
  "work.card5.link": "vivaire.app",
  "work.card6.title": "FATBEATS.org",
  "work.card6.body":
    "A microphone-driven audiovisual playground that runs entirely in the browser. Live sound from the room drives a dozen visual modes built on the Web Audio API and Canvas, with sensitivity and color presets adjustable while they run. The audio never leaves the browser and is never recorded.",
  "work.card6.link": "fatbeats.org",
  "work.ownMark": "Maker's own",
  "work.specLabel": "Spec",
  "spec.scale": "Scale",
  "spec.control": "Control",
  "spec.access": "Access",
  "spec.handles": "Handles",
  "spec.handsOff": "Hands off to",
  "spec.focus": "Focus",
  "spec.usedBy": "Used by",
  "spec.platform": "Platform",
  "spec.role": "Role",
  "spec.cues": "Cues",
  "spec.runsIn": "Runs in",
  "spec.builtOn": "Built on",
  "spec.modes": "Modes",
  "spec.privacy": "Privacy",
  "work.spec.privateClient": "Private client system",
  "work.spec.webMobile": "Web · Mobile",
  "work.card1.spec.scale": "Single unit → whole building",
  "work.card1.spec.control": "Remote",
  "work.card2.spec.handles": "Partial progress · Validation · Resuming days later",
  "work.card2.spec.handsOff": "Follow-up teams",
  "work.card3.spec.focus": "Fast pages · CMS-driven content · Clean analytics",
  "work.card3.spec.usedBy": "Merchandising and marketing teams",
  "work.card4.spec.handles": "Installments · Multiple currencies · Inflation tracking",
  "work.card4.spec.role": "Designed, built, and run by me",
  "work.card5.spec.cues": "Audio · Haptics",
  "work.card5.spec.handles": "Custom routines · Reminders · Streaks · Sync · Share by link",
  "work.card6.spec.runsIn": "The browser, entirely",
  "work.card6.spec.modes": "A dozen, tunable live",
  "work.card6.spec.privacy": "Audio never leaves the browser",
  "experience.title": "Experience",
  "experience.note":
    "A career building web products end to end: system architecture, product delivery, performance, observability, and shipping across the stack.",
  "experience.utility.role": "Senior Software Engineer",
  "experience.utility.date": "2023-present",
  "experience.mejuri.role": "Senior Software Engineer II",
  "experience.spark.role": "Senior Software Engineer",
  "experience.avalith.role": "PHP Backend Software Engineer",
  "experience.education.role": "Técnico Superior en Programación",
  "skills.productEngineering": "Product engineering",
  "skills.systemArchitecture": "System architecture",
  "skills.aiWorkflows": "AI workflows",
  "skills.teamCollaboration": "Team collaboration",
  "capabilities.title": "What I bring to a build",
  "capabilities.architecture.body":
    "Designing systems end to end, from backend services to the boundaries between them.",
  "capabilities.product.body":
    "Product delivery across the stack: interfaces, internal tools, and the services behind them.",
  "capabilities.ai.body":
    "AI-assisted by default, to shorten feedback loops and refine how a team works.",
  "capabilities.monitoring.title": "Monitoring & performance",
  "capabilities.monitoring.body":
    "Performance and observability, with monitoring owned as part of delivery.",
  "capabilities.team.body": "Owning delivery alongside the team, hiring included.",
  "capabilities.tools": "Tools of the trade",
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
  "contact.orderLabel": "Work order",
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
    "Portfolio de Patricio Gabriel Maseda, artesano de software e ingeniero senior orientado a producto, que transforma ideas de producto y procesos de equipo en software hecho para durar: interfaces, herramientas internas, automatización y procesos asistidos por IA.",
  "nav.work": "Trabajo",
  "nav.experience": "Experiencia",
  "nav.process": "Proceso",
  "nav.blog": "Blog",
  "nav.contact": "Contacto",
  "nav.backHome": "Volver al inicio",
  "nav.language": "Idioma",
  "nav.primary": "Navegación principal",
  "nav.home": "Inicio de Patricio Gabriel Maseda",
  "hero.eyebrow": "Artesano de software · Ingeniero senior · Desde 2011",
  "hero.title":
    "Doy forma a ideas de producto y procesos de equipo hasta convertirlos en software",
  "hero.titleHot": "hecho para durar.",
  "hero.lead":
    "Interfaces, herramientas internas, automatización y procesos asistidos por IA, hechos con atención a la experiencia, la calidad del código y el uso cotidiano.",
  "hero.viewWork": "Ver los trabajos",
  "hero.contact": "Hacer un encargo",
  "kicker.workshop": "El taller",
  "kicker.process": "El proceso",
  "kicker.works": "Obras forjadas",
  "kicker.capabilities": "Capacidades",
  "kicker.marks": "Marcas del oficio",
  "kicker.commission": "Encargo",
  "process.title": "Hago software que resuelve.",
  "process.intro":
    "Desarrollo software desde 2011, en la intersección entre producto, arquitectura e implementación, con preferencia por herramientas claras, rápidas y fáciles de mantener.",
  "process.portrait": "Retrato de Patricio Gabriel Maseda",
  "process.portraitCaption": "El artesano",
  "process.stepsLabel": "Cómo toma forma cada proyecto",
  "process.step1.title": "Materia prima",
  "process.step1.body":
    "Todo empieza por el producto y las personas que lo usan: la idea, la forma real de trabajar del equipo y lo que tiene que volverse más simple.",
  "process.step2.title": "Arquitectura",
  "process.step2.body":
    "Diseñar el sistema antes de la primera soldadura: servicios, datos y límites claros, para que siga siendo fácil de mantener.",
  "process.step3.title": "Construcción y soldadura",
  "process.step3.body":
    "Servicios de backend e interfaces, unidos en un solo producto. Con IA desde el inicio, para acortar los ciclos de validación y pasar de la idea al software funcionando con mayor rapidez.",
  "process.step4.title": "Templado y prueba",
  "process.step4.body":
    "Entrega, monitoreo y observabilidad, para que siga respondiendo en el uso de todos los días.",
  "work.title": "Proyectos destacados",
  "work.note":
    "Sistemas para clientes de comercio electrónico, medios, salud y hotelería; herramientas internas centradas en monitoreo; y GastosCasa, un producto propio que diseño, desarrollo y mantengo.",
  "work.recent": "Reciente",
  "work.ongoing": "En curso",
  "work.card1.tag": "Ingeniería de producto",
  "work.card1.title": "Control de equipos PTAC en edificios completos",
  "work.card1.body":
    "Un panel para operar de forma remota unidades PTAC, por equipo o por edificio.",
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
    "Un gestor de presupuesto para hogares en los que varios integrantes de la familia administran los gastos juntos. Cada persona puede registrar consumos, revisar gráficos claros, organizar gastos recurrentes y mantener el presupuesto mensual en orden desde la web o el celular. También permite administrar cuotas de tarjeta, trabajar con varias monedas y seguir la inflación.",
  "work.card4.link": "gastoscasa.com",
  "work.card5.title": "Vivaire",
  "work.card5.body":
    "Una aplicación de respiración guiada para web y dispositivos móviles. Permite crear rutinas personalizadas, seguir sesiones temporizadas con señales de audio y vibración, programar recordatorios, consultar rachas y avances, sincronizar la actividad y compartir sesiones mediante un enlace.",
  "work.card5.link": "vivaire.app",
  "work.card6.title": "FATBEATS.org",
  "work.card6.body":
    "Un experimento audiovisual que corre en el navegador y responde al micrófono en tiempo real. El sonido del ambiente se convierte en una docena de modos visuales hechos con la Web Audio API y Canvas, y tanto la sensibilidad como la paleta de colores se ajustan sobre la marcha. El audio no sale del navegador ni queda grabado.",
  "work.card6.link": "fatbeats.org",
  "work.ownMark": "Sello propio",
  "work.specLabel": "Ficha",
  "spec.scale": "Escala",
  "spec.control": "Control",
  "spec.access": "Acceso",
  "spec.handles": "Resuelve",
  "spec.handsOff": "Entrega a",
  "spec.focus": "Foco",
  "spec.usedBy": "Lo usan",
  "spec.platform": "Plataforma",
  "spec.role": "Rol",
  "spec.cues": "Señales",
  "spec.runsIn": "Corre en",
  "spec.builtOn": "Hecho con",
  "spec.modes": "Modos",
  "spec.privacy": "Privacidad",
  "work.spec.privateClient": "Sistema privado de un cliente",
  "work.spec.webMobile": "Web · Móvil",
  "work.card1.spec.scale": "Un equipo → el edificio completo",
  "work.card1.spec.control": "Remoto",
  "work.card2.spec.handles": "Avances parciales · Validación · Retomar días después",
  "work.card2.spec.handsOff": "Equipos de seguimiento",
  "work.card3.spec.focus": "Páginas rápidas · Contenido desde un CMS · Datos confiables",
  "work.card3.spec.usedBy": "Equipos comerciales y de marketing",
  "work.card4.spec.handles": "Cuotas · Varias monedas · Seguimiento de la inflación",
  "work.card4.spec.role": "Lo diseño, desarrollo y mantengo",
  "work.card5.spec.cues": "Audio · Vibración",
  "work.card5.spec.handles":
    "Rutinas propias · Recordatorios · Rachas · Sincronización · Enlaces para compartir",
  "work.card6.spec.runsIn": "Solo el navegador",
  "work.card6.spec.modes": "Una docena, ajustables en vivo",
  "work.card6.spec.privacy": "El audio no sale del navegador",
  "experience.title": "Experiencia",
  "experience.note":
    "Una trayectoria creando productos web de punta a punta: arquitectura de sistemas, entrega de producto, rendimiento, observabilidad y desarrollo en todas las capas.",
  "experience.utility.role": "Senior Software Engineer",
  "experience.utility.date": "2023-presente",
  "experience.mejuri.role": "Senior Software Engineer II",
  "experience.spark.role": "Senior Software Engineer",
  "experience.avalith.role": "PHP Backend Software Engineer",
  "experience.education.role": "Técnico Superior en Programación",
  "skills.productEngineering": "Ingeniería de producto",
  "skills.systemArchitecture": "Arquitectura de sistemas",
  "skills.aiWorkflows": "Flujos de trabajo con IA",
  "skills.teamCollaboration": "Trabajo en equipo",
  "capabilities.title": "Lo que aporto a cada proyecto",
  "capabilities.architecture.body":
    "Diseño de sistemas de punta a punta, desde los servicios de backend hasta los límites entre ellos.",
  "capabilities.product.body":
    "Entrega de producto en todas las capas: interfaces, herramientas internas y los servicios que las sostienen.",
  "capabilities.ai.body":
    "IA desde el inicio, para acortar los ciclos de validación y mejorar la forma de trabajar.",
  "capabilities.monitoring.title": "Monitoreo y rendimiento",
  "capabilities.monitoring.body":
    "Rendimiento y observabilidad, con el monitoreo como parte de la entrega.",
  "capabilities.team.body":
    "Me hago cargo de la entrega junto al equipo, incluida la formación de equipos.",
  "capabilities.tools": "Herramientas del oficio",
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
  "contact.orderLabel": "Orden de trabajo",
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
