# patriciomase admin

Internal panel to read the `messages` (contact form) and `page_views` tables
that the main site (`patriciomase-web`) writes to. Read-only, no auth code of
its own — access control is Vercel's own login gate ("Vercel Authentication" /
SSO deployment protection), not anything in this app.

Live at: https://patriciomase-admin-preview.vercel.app (log in with the
`patriciomase` Vercel account to view it).

## Why a preview deployment, not production

On the Hobby plan, Vercel Authentication actually blocks unauthenticated
requests to **preview** deployment URLs (including a friendly alias pointing
at one), but does **not** enforce it on a project's assigned **production**
domain or alias — that requires a paid plan. So this project is deliberately
never promoted to production. Deploying with `--prod` (or aliasing anything
to a production deployment) would make the panel publicly readable with no
login. Don't do it — deploy as preview and re-point the alias instead.

## Deploy / redeploy

```bash
cd admin
vercel deploy --yes --project patriciomase-admin      # preview deploy, prints a new URL
vercel alias set <printed-preview-url> patriciomase-admin-preview.vercel.app
```

`DATABASE_URL` is already set on the project (Production-scoped; Vercel falls
back to it for Preview when no Preview-specific value exists).

## Local dev

```bash
cd admin
vercel env pull .env       # pulls DATABASE_URL
npm install
npm run dev
```
