# patriciomase.github.io

Personal portfolio and blog. Next.js App Router on Vercel, with Neon Postgres
behind the blog, the contact form, and page view counts.

Previously a hand-written static site served from GitHub Pages; the original
markup is preserved in this repo's history at commit `8e62579`.

## Stack

- Next.js 16 (App Router) / React 19 / TypeScript
- Neon Postgres via `@neondatabase/serverless` + Drizzle ORM
- Plain CSS (`src/app/globals.css`) — no framework, so the original design ports
  across unchanged

## Local development

```bash
npm install
cp .env.example .env   # then fill in DATABASE_URL, or: vercel env pull .env
npm run db:migrate     # apply schema
npm run db:seed        # load posts from src/db/seed-data/posts.json
npm run dev
```

## Database

Three tables (`src/db/schema.ts`):

| Table        | Holds                                                          |
| ------------ | -------------------------------------------------------------- |
| `posts`      | Blog articles, two full language bodies per post (EN + ES)     |
| `messages`   | Contact form submissions                                        |
| `page_views` | Hit counts aggregated per `(path, day)`                        |

Schema changes go through Drizzle:

```bash
npm run db:generate    # write a migration from schema.ts
npm run db:migrate     # apply it
npm run db:studio      # browse the data
```

## Publishing a post

Posts are rows, not files, so a new post does not need a deploy. Insert a row in
`posts` with `status = 'published'`; the blog index and the post page pick it up
within 60 seconds (`revalidate = 60`).

To version a post alongside the code instead, add it to
`src/db/seed-data/posts.json` and run `npm run db:seed` — the seed upserts on
`slug`, so it doubles as a content update.

`body_en` / `body_es` hold article HTML authored by the site owner and are
rendered as-is. They are first-party content and are not sanitised; do not put
anything visitor-supplied in them.

### Article HTML

Bodies are plain HTML, not Markdown. Everything below is styled by
`.post-body` / `.post-prose` in `src/app/globals.css`:

| Block            | Markup                                                |
| ---------------- | ----------------------------------------------------- |
| Headings         | `<h2>`, `<h3>`                                        |
| Paragraph        | `<p>`                                                 |
| Emphasis         | `<strong>`, `<em>`                                    |
| Link             | `<a href="…">` — no class needed                      |
| Bullets/numbers  | `<ul><li>`, `<ol><li>`                                |
| Quotation        | `<blockquote><p>…</p><cite>Name</cite></blockquote>`  |
| Aside / callout  | `<div class="callout"><p>…</p></div>`                 |
| Section break    | `<hr>`                                                |
| Inline code      | `<code>`                                              |
| Code block       | `<pre><code>` — scrolls horizontally, never the page  |
| Table            | `<div class="table-scroll"><table>…</table></div>`    |

A quote is styled quieter than a callout on purpose, so the two don't compete
for the same visual weight.

Article links are styled by `.post-prose a`, which matches the injected body
HTML only. The "All posts" link below the article is a sibling of that element,
so it keeps its own styling.

## Internationalisation

Short strings live in `src/lib/i18n.ts`; long-form article prose lives in the
database as two complete bodies, because a dictionary entry per paragraph is
unworkable for an essay.

The first render is always English on both server and client, then the stored
preference is applied in an effect — the same sequence the static site used, and
it keeps server and client markup in agreement so there is no hydration
mismatch. The choice persists in `localStorage` under `portfolio-language`,
the key the old site used, so a returning visitor keeps their language.
