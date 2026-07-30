import { sql } from "drizzle-orm";
import { db } from "@/db";
import { pageViews } from "@/db/schema";

/** Only ever count paths this site actually serves. */
const PATH_PATTERN = /^\/(?:blog(?:\/[a-z0-9-]{1,120})?)?$/;

/**
 * Count a page view.
 *
 * Called from the browser rather than from the page render, which keeps the
 * pages themselves statically cacheable and means crawlers and prerenders do
 * not inflate the numbers. Counts are aggregated per (path, day) by upsert, so
 * the table grows by pages-per-day rather than by visits.
 */
export async function POST(request: Request) {
  let path: unknown;
  try {
    ({ path } = await request.json());
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  if (typeof path !== "string" || !PATH_PATTERN.test(path)) {
    return Response.json({ ok: false }, { status: 400 });
  }

  const day = new Date().toISOString().slice(0, 10);

  try {
    await db
      .insert(pageViews)
      .values({ path, day, views: 1 })
      .onConflictDoUpdate({
        target: [pageViews.path, pageViews.day],
        set: { views: sql`${pageViews.views} + 1` },
      });
  } catch (error) {
    // A missed view is not worth failing the request over.
    console.error("Failed to record page view", error);
  }

  return Response.json({ ok: true });
}
