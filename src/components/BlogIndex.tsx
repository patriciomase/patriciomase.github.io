"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";

export type PostCard = {
  slug: string;
  /** ISO string: Date objects don't survive the server/client boundary intact. */
  publishedAt: string | null;
  titleEn: string;
  titleEs: string;
  excerptEn: string;
  excerptEs: string;
};

export function BlogIndex({ posts }: { posts: PostCard[] }) {
  const { locale, t } = useLanguage();

  return (
    <>
      <SiteHeader variant="blog" />

      <main>
        <div className="wrap-narrow post-header">
          <p className="eyebrow">{t("blog.title")}</p>
          <h1>{t("blog.heading")}</h1>
          <p className="post-lead">{t("blog.lead")}</p>
        </div>

        <div className="wrap-narrow post-list">
          {posts.length === 0 && <p>{t("blog.empty")}</p>}
          {posts.map((post) => (
            <Link className="post-card" href={`/blog/${post.slug}`} key={post.slug}>
              {/* Cards show the plain ISO day, as the static site did. */}
              <span className="year">{post.publishedAt?.slice(0, 10)}</span>
              <h2>{locale === "es" ? post.titleEs : post.titleEn}</h2>
              <p>{locale === "es" ? post.excerptEs : post.excerptEn}</p>
            </Link>
          ))}
        </div>
      </main>

      <SiteFooter bordered />
    </>
  );
}
