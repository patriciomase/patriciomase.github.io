import "dotenv/config";
import { writeFile, readdir, readFile, unlink } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";

const CONTENT_TYPE_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

/**
 * Generate a cover image for a post via Pollinations.ai's free image API
 * (no API key, no account, nothing to leak) and drop it in public/blog/.
 *
 * Usage:
 *   npm run generate-cover -- <slug>
 *   npm run generate-cover -- <slug> --force            overwrite existing file
 *   npm run generate-cover -- <slug> --prompt "..."      override the prompt
 */

const CONTENT_DIR = path.join(process.cwd(), "content", "posts");
const OUTPUT_DIR = path.join(process.cwd(), "public", "blog");
const WIDTH = 1200;
const HEIGHT = 630;

const STYLE =
  "Minimal, modern editorial illustration for a software engineering blog. " +
  "Clean geometric shapes, limited muted color palette, plenty of negative " +
  "space, no text or letters in the image, no logos, no photorealistic faces.";

async function existingCover(slug: string): Promise<string | undefined> {
  const files = await readdir(OUTPUT_DIR).catch(() => []);
  return files.find((f) => f.startsWith(`${slug}-cover.`));
}

async function main() {
  const args = process.argv.slice(2);
  const slug = args.find((a) => !a.startsWith("--"));
  const force = args.includes("--force");
  const promptFlagIndex = args.indexOf("--prompt");
  const customPrompt =
    promptFlagIndex !== -1 ? args[promptFlagIndex + 1] : undefined;

  if (!slug) {
    console.error('Usage: npm run generate-cover -- <slug> [--force] [--prompt "..."]');
    process.exit(1);
  }

  const mdPath = path.join(CONTENT_DIR, `${slug}.en.md`);
  const raw = await readFile(mdPath, "utf8").catch(() => {
    throw new Error(`${mdPath} not found`);
  });
  const { data } = matter(raw);

  const existing = await existingCover(slug);
  if (!force && existing) {
    console.error(`public/blog/${existing} already exists. Pass --force to overwrite.`);
    process.exit(1);
  }

  const prompt =
    customPrompt ??
    `${STYLE}\n\nSubject: a cover image for a blog post titled "${data.title}". ` +
      `${data.lead ?? data.excerpt ?? ""}`;

  const url = new URL(`https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}`);
  url.searchParams.set("width", String(WIDTH));
  url.searchParams.set("height", String(HEIGHT));
  // Keeps the prompt (and this post's title) out of Pollinations' public feed.
  url.searchParams.set("private", "true");

  console.log(`Generating cover for "${slug}" via Pollinations.ai...`);
  console.log(`Prompt: ${prompt}\n`);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Pollinations.ai returned ${response.status}: ${await response.text()}`);
  }
  const bytes = Buffer.from(await response.arrayBuffer());
  const contentType = response.headers.get("content-type")?.split(";")[0] ?? "";
  const extension = CONTENT_TYPE_EXTENSIONS[contentType];
  if (!extension) {
    throw new Error(`Unexpected content-type from Pollinations.ai: "${contentType}"`);
  }

  if (existing && existing !== `${slug}-cover.${extension}`) {
    await unlink(path.join(OUTPUT_DIR, existing));
  }

  const outputPath = path.join(OUTPUT_DIR, `${slug}-cover.${extension}`);
  await writeFile(outputPath, bytes);

  const relPath = `/blog/${slug}-cover.${extension}`;
  console.log(`Saved ${relPath}`);
  console.log(
    `\nNote: anonymous requests may carry a watermark. Open the file and check before committing.`,
  );
  console.log(`\nMarkdown snippet:\n![${data.title}](${relPath} "${data.title}")`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
