import "dotenv/config";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { eq } from "drizzle-orm";
import { db } from "../src/db";
import { posts, type NewPost } from "../src/db/schema";

/**
 * Publish the markdown in content/posts/ to the database.
 *
 * Files are the source of truth; the posts table is the serving layer. That
 * split is deliberate: prose belongs in git where it can be diffed, reviewed
 * and reverted, while the database is what lets a published post appear
 * without a deploy.
 *
 * Usage:
 *   npm run publish              every post
 *   npm run publish -- <slug>    one post
 *   npm run publish -- --dry-run report changes, write nothing
 */

const CONTENT_DIR = path.join(process.cwd(), "content", "posts");

/** Fields that describe the post itself; they live in the .en.md file. */
type SharedFrontmatter = {
  publishedAt: string;
  readMinutes: number;
  status: "draft" | "published";
};

/** Fields that exist once per language. */
const LANGUAGE_FIELDS = [
  "eyebrow",
  "title",
  "lead",
  "excerpt",
  "metaDescription",
] as const;

type LanguageFrontmatter = Record<(typeof LANGUAGE_FIELDS)[number], string>;

class ContentError extends Error {}

function requireString(
  data: Record<string, unknown>,
  key: string,
  file: string,
): string {
  const value = data[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new ContentError(`${file}: missing or empty "${key}"`);
  }
  return value;
}

async function readLanguageFile(slug: string, lang: "en" | "es") {
  const file = `${slug}.${lang}.md`;
  let raw: string;
  try {
    raw = await readFile(path.join(CONTENT_DIR, file), "utf8");
  } catch {
    throw new ContentError(`${file}: not found (every post needs en and es)`);
  }

  const { data, content } = matter(raw);
  const body = content.trim();
  if (!body) throw new ContentError(`${file}: body is empty`);

  const fields = Object.fromEntries(
    LANGUAGE_FIELDS.map((key) => [key, requireString(data, key, file)]),
  ) as LanguageFrontmatter;

  return { data, body, fields, file };
}

async function loadPost(slug: string): Promise<NewPost> {
  const en = await readLanguageFile(slug, "en");
  const es = await readLanguageFile(slug, "es");

  // Shared fields live in the English file only, so the two languages cannot
  // drift into disagreeing about when a post was published.
  for (const key of ["publishedAt", "readMinutes", "status"]) {
    if (key in es.data) {
      throw new ContentError(
        `${es.file}: "${key}" belongs in ${slug}.en.md, not here`,
      );
    }
  }

  const status = en.data.status;
  if (status !== "draft" && status !== "published") {
    throw new ContentError(`${en.file}: status must be "draft" or "published"`);
  }

  const readMinutes = Number(en.data.readMinutes);
  if (!Number.isInteger(readMinutes) || readMinutes < 1) {
    throw new ContentError(`${en.file}: readMinutes must be a positive integer`);
  }

  // gray-matter parses an unquoted YYYY-MM-DD into a Date already.
  const publishedAt = new Date(en.data.publishedAt as string | Date);
  if (Number.isNaN(publishedAt.getTime())) {
    throw new ContentError(`${en.file}: publishedAt is not a valid date`);
  }

  const shared: SharedFrontmatter = {
    publishedAt: publishedAt.toISOString(),
    readMinutes,
    status,
  };

  return {
    slug,
    status: shared.status,
    publishedAt,
    readMinutes: shared.readMinutes,
    eyebrowEn: en.fields.eyebrow,
    eyebrowEs: es.fields.eyebrow,
    titleEn: en.fields.title,
    titleEs: es.fields.title,
    leadEn: en.fields.lead,
    leadEs: es.fields.lead,
    excerptEn: en.fields.excerpt,
    excerptEs: es.fields.excerpt,
    metaDescriptionEn: en.fields.metaDescription,
    metaDescriptionEs: es.fields.metaDescription,
    bodyEn: en.body,
    bodyEs: es.body,
    updatedAt: new Date(),
  };
}

/** Which fields differ from what is already stored. */
function changedFields(next: NewPost, current: Record<string, unknown>) {
  const ignore = new Set(["updatedAt", "createdAt", "id"]);
  return Object.entries(next)
    .filter(([key]) => !ignore.has(key))
    .filter(([key, value]) => {
      const existing = current[key];
      if (value instanceof Date && existing instanceof Date) {
        return value.getTime() !== existing.getTime();
      }
      return existing !== value;
    })
    .map(([key]) => key);
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const only = args.find((a) => !a.startsWith("--"));

  const files = await readdir(CONTENT_DIR);
  let slugs = [...new Set(files.filter((f) => f.endsWith(".en.md")).map((f) => f.slice(0, -6)))].sort();

  if (only) {
    if (!slugs.includes(only)) {
      throw new ContentError(`no content for slug "${only}"`);
    }
    slugs = [only];
  }

  if (slugs.length === 0) {
    console.log("No posts found in content/posts/.");
    return;
  }

  console.log(
    `${dryRun ? "Checking" : "Publishing"} ${slugs.length} post(s)${only ? "" : " from content/posts"}\n`,
  );

  let created = 0;
  let updated = 0;
  let unchanged = 0;

  for (const slug of slugs) {
    const post = await loadPost(slug);
    const [current] = await db
      .select()
      .from(posts)
      .where(eq(posts.slug, slug))
      .limit(1);

    if (!current) {
      created++;
      console.log(`  + ${slug}  (new, ${post.status})`);
    } else {
      const changed = changedFields(post, current);
      if (changed.length === 0) {
        unchanged++;
        console.log(`  = ${slug}  (unchanged)`);
        continue;
      }
      updated++;
      console.log(`  ~ ${slug}  (${changed.join(", ")})`);
    }

    if (!dryRun) {
      await db
        .insert(posts)
        .values(post)
        .onConflictDoUpdate({ target: posts.slug, set: post });
    }
  }

  const summary = `${created} new, ${updated} updated, ${unchanged} unchanged`;
  console.log(
    dryRun
      ? `\nDry run: ${summary}. Nothing was written.`
      : `\nDone: ${summary}.`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    if (error instanceof ContentError) {
      console.error(`\nContent error — ${error.message}`);
    } else {
      console.error(error);
    }
    process.exit(1);
  });
