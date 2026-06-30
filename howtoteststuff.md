# How to test Syntraq

This is the guide to running, reading, and writing tests for the project. It assumes the app already runs on your machine. If it does not, start with `howtorunstuff.md` first.

There are three layers of tests here, and they answer different questions:

- **Unit tests** check a single service or utility in isolation. Fast, no database in most cases.
- **Integration tests** check controllers and services against a real SQLite database, so they catch wiring and query problems.
- **End to end (e2e) tests** drive a real browser through the running app, so they catch the things only a user would notice.

Unit and integration tests both run under Vitest. The e2e tests run under Playwright. They are separate on purpose, and the configs keep them from stepping on each other.

## The quick version

If you just want to know whether things are healthy, run these three in order. This is the same sequence CI runs on every push and pull request:

```bash
npm run lint
npm run typecheck
npm run test
```

If all three pass, you match what CI checks. The e2e suite is the one extra layer beyond CI, covered later in this guide.

## Running the unit and integration tests

Both live under `tests/` and run together with Vitest.

Run the whole suite once:

```bash
npm run test
```

This runs everything in `tests/unit/` and `tests/integration/` a single time and reports pass or fail. The e2e folder is excluded from this run automatically, so you will not accidentally launch a browser here.

While you are actively writing code, watch mode is nicer. It re-runs only the affected tests as you save:

```bash
npm run test:watch
```

To run a single file, pass its path:

```bash
npx vitest run tests/unit/blogService.test.ts
```

To run only the tests whose names match a phrase, use `-t`:

```bash
npx vitest run -t "returns related posts"
```

### How the test database works

You do not need to set anything up for tests that touch the database. The setup file at `tests/setup.ts` runs before every test run and points `DATABASE_URL` at a fresh temporary SQLite file in your system temp directory. It also sets a throwaway `AUTH_SECRET` and forces `NODE_ENV=test`.

The practical takeaway: tests never touch your real `db.sqlite`. Each run starts clean, and individual integration suites can still spin up their own isolated databases on top of that. So you can run the tests as many times as you like without worrying about polluting your dev data.

The integration files are the ones named `*.sqlite.test.ts`. That naming is a hint that they exercise the real database layer rather than mocking it.

## Coverage

To see how much of the code the tests actually exercise:

```bash
npm run test:coverage
```

This runs the full suite and produces a report. You get a quick text summary in the terminal, plus an HTML report and an lcov file. Open the HTML report in a browser to click through file by file:

```
coverage/index.html
```

Coverage is measured against the service and utility layers (`server/services/**` and `server/utils/**`), since that is where the real logic lives. Test files themselves are excluded from the count.

## Running the end to end tests

The e2e tests use Playwright and drive a real Chromium browser against the app.

The first time you run them, you need the browser binary. Install it once:

```bash
npx playwright install chromium
```

Then run the suite:

```bash
npm run test:e2e
```

Here is the part that trips people up the first time, so it is worth being clear: you do not need to start the dev server yourself. The Playwright config boots `npm run dev` automatically and waits for `http://localhost:3000` before running. If a dev server is already running on that port, it reuses it instead of starting a second one. So either way works, just do not be surprised when it launches the server for you.

The e2e specs live in `tests/e2e/`. Right now that covers the authentication flow. Because these tests are slower and heavier than the others, they are not part of the default `npm run test` run and not part of CI.

A few useful variations:

```bash
# watch the browser instead of running headless
npx playwright test --headed

# run a single spec
npx playwright test tests/e2e/auth.spec.ts

# open the last HTML report after a run
npx playwright show-report
```

## Writing a new test

A few conventions to keep new tests consistent with what is already here.

**Where it goes.**
- Testing one service or utility in isolation? Put it in `tests/unit/` as `<thing>.test.ts`.
- Testing a controller or anything that hits the database? Put it in `tests/integration/` as `<thing>.sqlite.test.ts`. The `.sqlite` in the name signals it uses the real database.
- Testing a full user journey through the browser? Put it in `tests/e2e/` as `<thing>.spec.ts`.

**The shape of a unit test.**
Vitest runs with globals turned off, so import what you use. A minimal unit test looks like this:

```ts
import { describe, it, expect } from 'vitest'
import { listSummaries } from '../../server/services/blogService'

describe('blogService', () => {
  it('returns every post as a summary', () => {
    const summaries = listSummaries()
    expect(summaries.length).toBeGreaterThan(0)
  })
})
```

Look at `tests/unit/blogService.test.ts` for a complete, real example to copy from.

**Importing shared types.**
The `@shared` alias is wired into the Vitest config, so you can import shared types in tests exactly as the app does, for example `import type { BlogPost } from '@shared/types/blog'`.

**Database tests.**
You do not wire up the database by hand. Rely on the temp database from `tests/setup.ts`, and look at the existing `*.sqlite.test.ts` files plus the helper in `tests/fixtures/db.ts` for the established pattern.

**Keep it deterministic.**
Tests should pass the same way every time, in any order. Avoid depending on real dates, network calls, or the order another test ran in. If you need a fixed point in time or a fake external service, stub it inside the test.

## When something fails

- **A test fails only sometimes.** That is almost always a determinism problem: a real timestamp, a shared bit of state, or an ordering assumption. Make the input fixed.
- **Type errors show up in the test run.** Run `npm run typecheck` on its own to see them clearly, since it is a cleaner signal than the test output.
- **An e2e test hangs or times out.** Confirm nothing else is already holding port 3000, and that the browser is installed (`npx playwright install chromium`). The trace from a failed run helps; open it with `npx playwright show-report`.
- **A database test sees unexpected data.** Each run is supposed to start clean. If it does not, you may be reading from the real `db.sqlite` instead of the temp one, which usually means a test imported the database client before `tests/setup.ts` had a chance to set `DATABASE_URL`. Make sure your imports follow the same pattern as the existing suites.

## The short summary

For everyday work, `npm run test:watch` while you code and `npm run test` before you commit will cover almost everything. Run `npm run test:e2e` when you change something a user touches directly, like login or navigation. And remember the CI gate is just three commands: lint, typecheck, test. If those pass locally, you are in good shape.
