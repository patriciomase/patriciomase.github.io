import { and, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { posts, type Post } from "@/db/schema";

/** Every published post, newest first. */
export async function listPublishedPosts(): Promise<Post[]> {
  return db
    .select()
    .from(posts)
    .where(eq(posts.status, "published"))
    .orderBy(desc(posts.publishedAt));
}

/** A single published post, or undefined if the slug is unknown or a draft. */
export async function getPublishedPost(slug: string): Promise<Post | undefined> {
  const [post] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.status, "published")))
    .limit(1);

  return post;
}
