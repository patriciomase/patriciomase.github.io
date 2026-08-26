import path from "node:path";
import { readdir, readFile } from "node:fs/promises";
import { imageSize } from "image-size";

const BLOG_DIR = path.join(process.cwd(), "public", "blog");

export type CoverImage = { path: string; width: number; height: number };

/**
 * A post's cover image, if `scripts/generate-cover.ts` produced one.
 *
 * There's no database column for this — the file's existence at
 * `public/blog/<slug>-cover.*` is the source of truth, same convention the
 * generator script uses.
 */
export async function getCoverImage(slug: string): Promise<CoverImage | null> {
  const files = await readdir(BLOG_DIR).catch(() => []);
  const file = files.find((f) => f.startsWith(`${slug}-cover.`));
  if (!file) return null;

  try {
    const bytes = await readFile(path.join(BLOG_DIR, file));
    const { width, height } = imageSize(bytes);
    if (!width || !height) return null;
    return { path: `/blog/${file}`, width, height };
  } catch {
    return null;
  }
}
