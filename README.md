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

`body_en` / `body_es` hold markdown authored by the site owner.

### Writing a post

Bodies are GitHub-flavoured **markdown**. `src/lib/markdown.tsx` renders them
to React elements through a component map — nothing is injected as HTML.

| Block           | Markdown                                              |
| --------------- | ----------------------------------------------------- |
| Headings        | `## H2`, `### H3`                                     |
| Emphasis        | `**bold**`, `_italic_`                                |
| Link            | `[text](https://…)`                                   |
| Bullets/numbers | `- item`, `1. item`                                   |
| Quotation       | `> quoted text`                                       |
| Aside / callout | `:::callout` … `:::`                                  |
| Section break   | `---`                                                 |
| Inline code     | `` `code` ``                                          |
| Code block      | ```` ```bash ```` — highlighted, scrolls horizontally |
| Table           | GFM pipe table — wrapped in a scroller automatically  |
| Image           | `![alt](/blog/thing.png)`                             |
| Image + caption | `![alt](/blog/thing.png "The caption")`               |
| Wide image      | `![alt](/blog/thing.png#wide)`                        |

A quote is styled quieter than a callout on purpose, so the two don't compete
for the same visual weight.

Three things the component map does so you don't have to:

- **Tables** are wrapped in `.table-scroll`; you can't forget it any more.
- **Code blocks** go through Shiki on the server. Tag the fence with a language
  (`bash`, `ts`, `json`, `sql`, `python`, `diff`, …) or it renders as plain
  text. No highlighter reaches the browser.
- **Images** become `next/image`, with dimensions read off disk at render, so
  they are optimised and reserve their space without you writing any.

### Images

Put the file in `public/blog/` and reference it as `/blog/<name>`. It is
committed to the repo, so publishing an image does need a deploy — unlike
publishing a post.

```markdown
![A 25-point bed mesh readout](/blog/bed-mesh.png "The mesh survives a power cycle. The flag enabling it does not.")
```

The title slot becomes a `<figcaption>`. A `#wide` fragment lets a screenshot
spill past the reading column above 1040px, which suits wide terminal captures.

If a file can't be measured (a remote URL, or a format `image-size` can't
read), it falls back to a plain `<img>` — the stylesheet still constrains it,
so that degrades in quality, never in layout.

Article links are styled by `.post-prose a`, which matches the rendered body
only. The "All posts" link below the article is a sibling of that element, so
it keeps its own styling.

## Internationalisation

Short strings live in `src/lib/i18n.ts`; long-form article prose lives in the
database as two complete bodies, because a dictionary entry per paragraph is
unworkable for an essay.

The first render is always English on both server and client, then the stored
preference is applied in an effect — the same sequence the static site used, and
it keeps server and client markup in agreement so there is no hydration
mismatch. The choice persists in `localStorage` under `portfolio-language`,
the key the old site used, so a returning visitor keeps their language.
