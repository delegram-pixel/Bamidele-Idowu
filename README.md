# Bamidele Idowu — Portfolio

Personal portfolio and lead-generation site for Bamidele Idowu, a remote web developer and
instructor based in Port Harcourt, Nigeria.

**Live:** <!-- add the production URL here -->

---

## Stack

- Next.js 15 (App Router) with React 19
- TypeScript, strict mode
- Tailwind CSS v4
- Framer Motion
- Zod for form and request validation
- Resend for contact-form delivery
- Vitest and Playwright for tests
- Deployed on Vercel

## Running it locally

Node 20.9.0 or newer is required.

```bash
yarn install
cp .env.example .env.local   # then fill it in
yarn dev
```

Then open <http://localhost:3000>.

### Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `SITE_URL` | In production | Canonical origin, used for metadata, `robots.txt`, and `sitemap.xml` |
| `CONTACT_EMAIL_TO` | Yes | Where contact enquiries are delivered |
| `EMAIL_API_KEY` | Yes | Resend API key |
| `EMAIL_FROM` | Yes | Verified sender address |
| `NEXT_PUBLIC_ANALYTICS_SRC` | No | Analytics script URL. Leave empty to disable analytics entirely |
| `NEXT_PUBLIC_ANALYTICS_DOMAIN` | No | Analytics site domain |

Nothing secret belongs in a `NEXT_PUBLIC_` variable — those are inlined into the client bundle.
The email credentials are read only in server-only code.

Without email credentials the contact form still validates and submits, but the endpoint reports a
delivery failure rather than claiming a success that did not happen.

## Scripts

| Command | What it does |
| --- | --- |
| `yarn dev` | Development server |
| `yarn build` | Production build |
| `yarn start` | Serve a completed production build |
| `yarn lint` | ESLint |
| `yarn typecheck` | `tsc --noEmit` |
| `yarn test` | Unit and integration tests |
| `yarn test:watch` | The same, in watch mode |
| `yarn test:e2e` | End-to-end tests |
| `yarn validate:content` | Content checks |
| `yarn format` | Prettier, writing changes |
| `yarn format:check` | Prettier, reporting only |

The production build runs the content checks first and stops on unresolved placeholders in the
site's copy. That is deliberate: it keeps an unconfirmed claim from reaching production. `yarn dev`
works regardless, which is why the end-to-end suite runs against the development server. Install
the browsers once before using it:

```bash
yarn playwright install
yarn test:e2e
```

## Deployment

Deploys to Vercel with no configuration beyond the environment variables above. Set `SITE_URL` to
the production origin and add every variable to the project's environment settings.

## How the content works

The site is content-driven: all copy lives in typed data files under `src/data/`, so adding a
project means adding an entry to `src/data/projects.ts` and, if there is a genuine screenshot, an
image — never restructuring a page.

The site targets WCAG 2.2 AA and honours the operating system's reduced-motion setting.

---

© Bamidele Idowu. All rights reserved.
