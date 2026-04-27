## syntraq

personal project. still evolving.

most operational tools are glorified spreadsheets. they store data, they show data, and that's about it. syntraq is an attempt at something different: a platform that actually observes how work happens and helps people get better at it over time.

built for teams that operate in the real world. trucking, field services, hydrovac, logistics. the kind of work where a missed shift or a bad schedule costs real money and real time.

---

## what it does

at its core, syntraq combines scheduling, real-time collaboration, behavioral tracking, and workflow automation into one system. but the point isn't just having all of that in one place.

the point is that these things talk to each other. a shift change triggers a notification, updates the timeline, logs the action for replay later, and feeds into analytics. nothing lives in isolation.

---

## key pieces

**roster and scheduling** - drag and drop shift management, timeline view, real-time sync across users, conflict detection. shifts aren't just placed, they're validated and analyzed.

**adaptive tutorials** - the interface teaches itself. highlights elements, walks users through flows step by step, picks up where they left off. no onboarding docs, no training videos.

**replay system** - users can replay past sessions and see exactly what happened, what actions were taken, where time was wasted. this feeds into training, scoring, and guided walkthroughs.

**intelligence layer** - predictive scheduling, anomaly detection (overlaps, idle time, overwork), trend insights. surfaces problems before they become visible.

**ai assistant** - contextual, built into the system. answers questions, explains behavior, generates workflows, helps during replay.

**collaboration** - team chat (global and contextual), inline comments on shifts and workflows, approval flows, escalation. everything ties back to actual operational data.

**real-time updates** - shift changes propagate instantly, activity feeds update live, presence indicators show who's active. runs on a lightweight sse layer.

**workflows** - step-based definitions, ai-generated flows, reusable templates. lets teams standardize how they operate without writing code.

**analytics** - utilization tracking, inefficiency detection, predictive warnings. designed to answer "what should we do next" instead of just "what happened."

**api and automation** - api key system, webhook triggers, event-driven automation. early stage, but the goal is for syntraq to work as infrastructure other tools can plug into.

---

## tech

frontend: nuxt 3 (typescript), tailwindcss, three.js, pinia

backend: nitro server, drizzle orm, sqlite (turso-ready)

auth: lucia auth (email/password, google sso, microsoft sso)

other: stripe billing, resend email, sse for realtime

architecture is strict mvc. controllers handle requests, services handle logic, models handle data. frontend is split into components, modules, composables, and stores. multi-tenant from the ground up.

---

## three.js usage

three.js isn't decoration here. it's used for fleet visualization, interactive scheduling timelines, avatar customization, spatial dashboards. all scenes are lazy loaded and kept low-poly to stay out of the main thread's way.

---

## security

- input validation on every endpoint
- no raw sql (drizzle handles it)
- xss and csrf protection
- rate limiting on sensitive routes
- api keys are hashed
- client input is never trusted

---

## performance

- heavy components are lazy loaded
- three.js scenes are optimized and throttled
- queries are tuned, caching is used where it makes sense
- realtime updates are controlled, not firehosed

---

## current state

the system has a working frontend and backend, real-time layer, intelligence features, collaboration tools, billing, onboarding, and a marketing site. it's deployable and usable, but still being built out.

---

## why

most tools help you do work. very few help you understand it or improve it. syntraq is built around that gap.

---

## setup

install dependencies:

```bash
npm install
```

run the dev server:

```bash
npm run dev
```

build for production:

```bash
npm run build
```

preview the production build:

```bash
npm run preview
```

more info in the [nuxt deployment docs](https://nuxt.com/docs/getting-started/deployment).
