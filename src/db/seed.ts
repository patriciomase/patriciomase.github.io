import "dotenv/config";
import { db } from "./index";
import { posts } from "./schema";
import seedPosts from "./seed-data/posts.json";

/**
 * Load the posts that were previously hand-written HTML files in /blog.
 *
 * Idempotent: re-running updates the existing row for a slug rather than
 * inserting a duplicate, so this is safe to use to push a content edit.
 */
async function main() {
  for (const post of seedPosts) {
    const values = {
      ...post,
      status: post.status as "draft" | "published",
      publishedAt: new Date(post.publishedAt),
      updatedAt: new Date(),
    };

    await db
      .insert(posts)
      .values(values)
      .onConflictDoUpdate({ target: posts.slug, set: values });

    console.log(`seeded ${post.slug}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
