import {
  pgTable,
  uuid,
  text,
  integer,
  timestamp,
  date,
  index,
  unique,
  pgEnum,
} from "drizzle-orm/pg-core";

/**
 * Whether a Post is publicly visible. Drafts stay in the table so they can be
 * written and previewed without a deploy, but never reach the blog index.
 */
export const postStatus = pgEnum("post_status", ["draft", "published"]);

/**
 * Post — a blog article. The site is bilingual and every article exists as two
 * complete prose bodies rather than a dictionary of translated fragments, which
 * is how the original static site handled long-form content: one `<div
 * data-lang-block>` per language, one shown at a time. Body columns hold
 * sanitised HTML authored by the site owner, rendered as-is.
 */
export const posts = pgTable(
  "posts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull().unique(),
    status: postStatus("status").notNull().default("draft"),
    /** When the post goes live; also the date shown in the post meta line. */
    publishedAt: timestamp("published_at", { withTimezone: true }),
    /** Minutes of reading, shown next to the date. Same figure in both languages. */
    readMinutes: integer("read_minutes").notNull().default(5),

    /** Kicker above the title, e.g. "AI workflows · Tooling". */
    eyebrowEn: text("eyebrow_en").notNull(),
    eyebrowEs: text("eyebrow_es").notNull(),
    titleEn: text("title_en").notNull(),
    titleEs: text("title_es").notNull(),
    /** Standfirst under the title, reused as the card blurb on the blog index. */
    leadEn: text("lead_en").notNull(),
    leadEs: text("lead_es").notNull(),
    /** Short blurb for the blog index card. */
    excerptEn: text("excerpt_en").notNull(),
    excerptEs: text("excerpt_es").notNull(),
    /**
     * Full article body as markdown, one complete copy per language.
     * Rendered to React elements by `src/lib/markdown.tsx` -- GitHub-flavoured
     * markdown plus `:::callout` directives. Not HTML: these were HTML until
     * the renderer landed, and nothing injects them into the DOM any more.
     */
    bodyEn: text("body_en").notNull(),
    bodyEs: text("body_es").notNull(),
    /** <meta name="description"> per language. */
    metaDescriptionEn: text("meta_description_en").notNull(),
    metaDescriptionEs: text("meta_description_es").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("posts_status_published_at_idx").on(table.status, table.publishedAt),
  ],
);

/**
 * Message — a contact form submission. Replaces the old mailto: link, which
 * relied on the visitor having a mail client configured and left no record.
 */
export const messages = pgTable(
  "messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    email: text("email").notNull(),
    body: text("body").notNull(),
    /** Language the visitor was reading the site in when they wrote. */
    locale: text("locale").notNull().default("en"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("messages_created_at_idx").on(table.createdAt)],
);

/**
 * PageView — daily hit counts per path, aggregated rather than one row per
 * request. A personal site does not need per-visit granularity, and an upsert
 * on (path, day) keeps the table small enough to stay free forever.
 */
export const pageViews = pgTable(
  "page_views",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    path: text("path").notNull(),
    day: date("day").notNull(),
    views: integer("views").notNull().default(0),
  },
  (table) => [unique("page_views_path_day_key").on(table.path, table.day)],
);

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Message = typeof messages.$inferSelect;
