# How to run Syntraq

This is the practical guide to getting the app running on your machine, from a fresh clone to a working dev server. No prior context assumed. If you hit a snag, the troubleshooting section near the bottom covers the usual suspects.

## What you need first

- **Node.js 20 or newer.** The CI pins Node 20, so that is the safest version to match. Check with `node -v`.
- **npm.** It ships with Node, so if you have Node you have npm.
- A terminal and roughly 5 minutes.

You do not need a separate database server. The app uses a local SQLite file for development, so there is nothing to install or start on the side.

## Step 1: install dependencies

From the project root:

```bash
npm install
```

This pulls down everything in `package.json`. It also runs a `postinstall` step (`nuxt prepare`) that generates Nuxt's type stubs and the `.nuxt` folder. That step is what makes editor autocomplete and typechecking work, so let it finish.

If you ever see weird import or type errors later, re-running `npm install` (or just `npx nuxt prepare`) regenerates those stubs and usually clears it up.

## Step 2: set up your environment file

Copy the template and fill in what you need:

```bash
cp .env.example .env
```

Open `.env`. The good news is that for plain local development, the defaults already work. The two values that matter to get going are:

- `DATABASE_URL=file:./db.sqlite` (leave as is)
- `AUTH_SECRET=...` (set this to any random string for local use)

For a real secret, generate one with:

```bash
openssl rand -hex 32
```

Everything else in `.env.example` is commented out and optional. Stripe, Google and Microsoft OAuth, email sending, and the Anthropic AI assistant all degrade gracefully when their keys are missing. For example, with no `ANTHROPIC_API_KEY` the assistant falls back to a built in heuristic responder and makes no external calls. So you can wire those up later, only when you actually want to test that specific feature.

## Step 3: set up the database

Create the database tables from the schema:

```bash
npm run db:push
```

This uses Drizzle Kit to push the current schema into your SQLite file. Run it once on a fresh clone, and again any time the schema changes.

To get some data to look at, seed it:

```bash
npm run db:seed
```

This populates the database with sample records so the dashboard, rosters, and dispatch views have something to show. If you ever want a clean slate, delete `db.sqlite`, then run `db:push` and `db:seed` again.

## Step 4: start the dev server

```bash
npm run dev
```

Wait for it to print the local URL, then open:

```
http://localhost:3000
```

You should land on the marketing site. The dev server has hot reload, so saving a file updates the browser without a manual refresh. Leave it running while you work.

To stop it, press `Ctrl+C` in that terminal.

### Logging in

The public pages (home, features, pricing, about, blog) are open to everyone. Anything under the app itself, like `/dashboard`, requires a login and will bounce you to `/login` if you are signed out. Register a new account from `/register`, or use a seeded account if the seed script printed credentials.

## Running a production build locally

When you want to check the real, optimized build rather than the dev server:

```bash
npm run build
npm run preview
```

`build` compiles the app into `.output`. `preview` then serves that build, again on `http://localhost:3000`. This is the closest thing to what runs in production, so it is worth doing before you ship anything significant.

For a fully static export instead, there is `npm run generate`, but the standard path for this app is `build` plus `preview`.

## The full command reference

Every script below comes straight from `package.json`.

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with hot reload on port 3000. |
| `npm run build` | Build the production bundle into `.output`. |
| `npm run preview` | Serve the production build locally. |
| `npm run generate` | Produce a static site export. |
| `npm run db:push` | Apply the Drizzle schema to your database. |
| `npm run db:seed` | Load sample data into the database. |
| `npm run lint` | Run ESLint across the project. |
| `npm run typecheck` | Prepare Nuxt types, then run the TypeScript compiler with no emit. |
| `npm run test` | Run the unit and integration tests once. |
| `npm run test:watch` | Run tests in watch mode. |
| `npm run test:coverage` | Run tests and produce a coverage report. |
| `npm run test:e2e` | Run the Playwright end to end tests. |

Testing is covered in detail in `howtoteststuff.md`.

## Optional integrations and when to bother

You only need these if you are working on the matching feature.

- **Stripe (billing).** Set `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, and `STRIPE_WEBHOOK_SECRET`. The webhook secret is required for verifying incoming Stripe events.
- **OAuth login.** Set the Google or Microsoft client id and secret pairs. The callback URLs are listed as comments next to each key in `.env.example`.
- **Email.** Set `EMAIL_PROVIDER`, `EMAIL_API_KEY`, and `EMAIL_FROM`. With these blank, the app logs emails to the console instead of sending them, which is fine for development.
- **AI assistant.** Set `ANTHROPIC_API_KEY` to use the real model. Leave it blank to use the offline fallback.
- **Production database (Turso).** For deploying, set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` instead of the local SQLite file.

## Troubleshooting

**The app loads but every page is blank.**
This usually means Nuxt's generated files are stale or mismatched. Stop the server, delete the `.nuxt` folder, then start again:

```bash
rm -rf .nuxt
npm run dev
```

**Port 3000 is already in use.**
Something else is on that port, often a dev server you forgot to stop. Find and stop it, or start on a different port:

```bash
npm run dev -- --port 3001
```

**Type or import errors right after cloning.**
Run `npx nuxt prepare` to regenerate the type stubs, then reopen your editor.

**Database errors or missing tables.**
You probably skipped the schema push. Run `npm run db:push`, and `npm run db:seed` if you also want data.

**A feature complains about a missing key.**
Check the relevant section in `.env.example`. Most integrations are optional and have a fallback, so confirm whether you actually need that key for what you are doing.

**Changes to `.env` are not taking effect.**
Environment variables are read at startup. Stop the dev server and start it again after editing `.env`.

That is the whole loop: install, configure, push the schema, seed, and run. Once it is up, you rarely touch anything but `npm run dev`.
