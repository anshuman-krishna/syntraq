## syntraq

this is a personal project.
(nuxt guilde at the last)

most operational tools exist to track things,
very few actually help people understand what they are doing.

syntraq is an attempt to bridge that gap,
it is an operational layer that observes, guides, and improves workflows over time.

---

## what this actually is

syntraq is a full stack operational intelligence platform

it combines

* scheduling
* real-time systems
* behavioral tracking
* replay systems
* ai-assisted workflows
* collaboration tools


it is designed for teams that mostly operate in the real world
trucking, field services, logistics, and similar environments

---

## core idea

instead of building tools that only store data

syntraq focuses on

* guiding users while they work
* learning from behavior
* improving workflows automatically

the system is meant to feel like it is thinking alongside the user

---

## core features

### roster and scheduling

a full scheduling system with

* drag and drop shift management
* timeline view
* real-time updates across users
* validation and conflict prevention

shifts are actively analyzed and improved

---

### adaptive tutorial system

the interface teaches itself

* highlights ui elements
* step-by-step guidance
* triggered automatically based on behavior
* resumable and context-aware

this removes the need for traditional onboarding

---

### replay system

one of the core differentiators

users can replay sessions and see

* what actions were taken
* how workflows were executed
* where inefficiencies occurred

this evolves into

* training mode
* performance scoring
* guided explanations

---

### intelligence layer

includes

* predictive scheduling suggestions
* anomaly detection (overlaps, idle time, overwork)
* trend insights
* workflow recommendations

the system surfaces problems before users notice them (generally)

---

### ai assistant

a contextual assistant built into the system

can

* answer questions
* explain system behavior
* generate workflows
* assist during replay and training


---

### collaboration layer

teams can operate inside the system

includes

* team chat (global and contextual)
* inline comments on shifts and workflows
* approval flows
* escalation system

everything is tied to actual operational entities

---

### real-time system

the platform updates live

* shift updates propagate instantly
* activity feed updates in real time
* presence indicators show active users

built on a lightweight sse system

---

### workflow system

custom workflows can be created and managed

* step-based definitions
* ai-generated workflows
* reusable templates

this allows teams to standardize operations

---

### analytics and insights

* utilization tracking
* inefficiency detection
* anomaly surfacing
* predictive warnings

designed to answer “what should we do next” (one of the biggest issues out there)

---

### api and automation (expanding)

the system is designed to extend outward

* api key system
* webhook triggers
* event-driven automation (early stage)

this allows syntraq to act as infrastructure

---

## technical overview

this is a modern full stack system

frontend

* nuxt 3 (typescript)
* tailwindcss (glass morphism design system)
* three.js (interactive 3d systems)
* pinia (state management)

backend

* nitro server
* drizzle orm
* sqlite (turso-ready)

additional systems

* lucia auth
* stripe billing
* resend email
* sse realtime layer

architecture follows strict mvc separation

---

## architecture notes

the system is structured around

* controllers (request handling)
* services (business logic)
* models (database access)

frontend is modular

* components
* modules
* composables
* stores

multi-tenant architecture is enforced at all levels

---

## security

security is treated as a first-class concern

* input validation on all endpoints
* no raw sql queries
* xss protection
* csrf protection
* rate limiting on sensitive routes
* api key hashing

no client input is trusted

---

## performance

the system is optimized for real-world usage

* lazy loading of heavy components
* optimized three.js scenes
* query optimization
* caching (where applicable)
* minimal re-renders

realtime updates are throttled and controlled

---

## developer experience

the project is structured for clarity

* consistent naming
* strict typing
* minimal but meaningful comments
* clean separation of concerns

scripts exist for

* seeding data
* development setup
* build validation

---

## current state

it includes

* full frontend and backend
* real-time systems
* intelligence layer
* collaboration features
* billing and onboarding
* marketing site

it is deployable and usable

---

## why this exists

most tools help you do work,
very few help you understand and improve it,
syntraq is built around that idea.

---

## final note

this is still evolving
but the goal is clear:

build a system that does not just support operations but actively makes them better.

---

## Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
