import type { Metadata } from "next";
import { BlogIndex } from "@/components/BlogIndex";
import { TrackView } from "@/components/TrackView";
import { listPublishedPosts } from "@/lib/posts";
import { messages } from "@/lib/i18n";

/** Posts can be published straight into the database, so don't cache forever. */
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog — Patricio Gabriel Maseda",
  description: messages.en["blog.note"],
};

export default async function BlogPage() {
  const posts = await listPublishedPosts();

  return (
    <>
      <TrackView path="/blog" />
      <BlogIndex
        posts={posts.map((post) => ({
          slug: post.slug,
          publishedAt: post.publishedAt?.toISOString() ?? null,
          titleEn: post.titleEn,
          titleEs: post.titleEs,
          excerptEn: post.excerptEn,
          excerptEs: post.excerptEs,
        }))}
      />
    </>
  );
}
