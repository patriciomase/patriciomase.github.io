import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostArticle } from "@/components/PostArticle";
import { TrackView } from "@/components/TrackView";
import { getPublishedPost, listPublishedPosts } from "@/lib/posts";
import { renderMarkdown } from "@/lib/markdown";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

/**
 * Prerender the posts that exist at build time. A post published straight into
 * the database afterwards still renders on demand and is cached from then on.
 */
export async function generateStaticParams() {
  const posts = await listPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedPost(slug);

  if (!post) {
    return { title: "Not found — Patricio Gabriel Maseda" };
  }

  return {
    title: `${post.titleEn} — Patricio Gabriel Maseda`,
    description: post.metaDescriptionEn,
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <>
      <TrackView path={`/blog/${post.slug}`} />
      <PostArticle
        post={{
          slug: post.slug,
          publishedAt: post.publishedAt?.toISOString() ?? null,
          readMinutes: post.readMinutes,
          eyebrowEn: post.eyebrowEn,
          eyebrowEs: post.eyebrowEs,
          titleEn: post.titleEn,
          titleEs: post.titleEs,
          leadEn: post.leadEn,
          leadEs: post.leadEs,
        }}
        /* Rendered here, in a Server Component, so the markdown parser and
           Shiki never ship to the browser. */
        bodyEn={renderMarkdown(post.bodyEn)}
        bodyEs={renderMarkdown(post.bodyEs)}
      />
    </>
  );
}
