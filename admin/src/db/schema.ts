import { pgTable, uuid, text, integer, timestamp, date, unique } from "drizzle-orm/pg-core";

/**
 * Mirrors the `messages` and `page_views` tables owned by the main site
 * (patriciomase-web/src/db/schema.ts). This app only reads them, so it
 * keeps its own minimal copy rather than depending across projects.
 */

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  body: text("body").notNull(),
  locale: text("locale").notNull().default("en"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

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
