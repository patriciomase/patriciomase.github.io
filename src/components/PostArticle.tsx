"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageProvider";
import { SiteHeader } from "./SiteHeader";
import { SiteFooter } from "./SiteFooter";
import { formatPostDate } from "@/lib/i18n";

export type PostView = {
  slug: string;
  publishedAt: string | null;
  readMinutes: number;
  eyebrowEn: string;
  eyebrowEs: string;
  titleEn: string;
  titleEs: string;
  leadEn: string;
  leadEs: string;
  bodyEn: string;
  bodyEs: string;
};

export function PostArticle({ post }: { post: PostView }) {
  const { locale, t } = useLanguage();
  const es = locale === "es";

  const eyebrow = es ? post.eyebrowEs : post.eyebrowEn;
  const title = es ? post.titleEs : post.titleEn;
  const lead = es ? post.leadEs : post.leadEn;
  const body = es ? post.bodyEs : post.bodyEn;

  const meta = post.publishedAt
    ? `${formatPostDate(new Date(post.publishedAt), locale)} · ${post.readMinutes} ${t("blog.readTime")}`
    : null;

  return (
    <>
      <SiteHeader variant="blog" />

      <main>
        <div className="wrap-narrow post-header">
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {meta && <p className="post-meta">{meta}</p>}
          <p className="post-lead">{lead}</p>
        </div>

        <article className="wrap-narrow post-body">
          {/* Article HTML is authored by the site owner and stored in the posts
              table -- it is first-party content, not visitor input. */}
          <div dangerouslySetInnerHTML={{ __html: body }} />
          <Link className="back-link" href="/blog">
            {t("blog.back")}
          </Link>
        </article>
      </main>

      <SiteFooter bordered />
    </>
  );
}
