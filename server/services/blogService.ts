import type { BlogPost, BlogPostSummary } from '../../shared/types/blog'

// editorial content lives in code: no cms, no db migration, fully versioned with
// the app. the public marketing surface reads it through the blog controller.
const posts: BlogPost[] = [
  {
    slug: 'why-field-service-scheduling-breaks-at-scale',
    title: 'why field-service scheduling breaks at scale',
    excerpt:
      'a roster that works for ten crews quietly falls apart at fifty. the failure is rarely the schedule itself, it is everything the schedule is supposed to be connected to.',
    tag: 'operations',
    accent: 'sky',
    cover: 0,
    readMinutes: 6,
    publishedAt: '2026-06-18',
    author: { name: 'sarah mitchell', role: 'operations lead' },
    sections: [
      {
        body: [
          'every field-service company starts with a schedule that fits on a whiteboard. one dispatcher holds the whole operation in their head, and it works. the trouble starts the day the operation outgrows the person holding it.',
          'scaling a roster is not about adding more rows. it is about the number of relationships between those rows growing faster than anyone can track by hand.',
        ],
      },
      {
        heading: 'the schedule is never the real problem',
        body: [
          'when a shift moves, a dozen other things have to move with it. the crew has to know. the vehicle assignment has to hold. the compliance window has to stay valid. billing has to reflect what actually happened, not what was planned.',
          'on a whiteboard, a person reconciles all of that instinctively. in a spreadsheet, those connections simply do not exist, so they get reconciled late, by phone, after something has already gone wrong.',
        ],
      },
      {
        heading: 'where the cracks show first',
        body: [
          'double-booked vehicles. crews who show up to a job that was rescheduled an hour ago. inspections that lapse because nobody owned the reminder. each one looks like a small mistake. together they are a structural one.',
          'the tell is always the same: more of the day is spent confirming the schedule than executing it.',
        ],
      },
      {
        heading: 'what actually fixes it',
        body: [
          'the fix is not a better spreadsheet. it is making the schedule the single source of truth that every other system listens to. a shift change should propagate to the crew, the vehicle board, the compliance log, and the activity feed without anyone re-keying it.',
          'that is the difference between software that stores your schedule and software that runs on it.',
        ],
      },
    ],
  },
  {
    slug: 'the-hidden-cost-of-radio-call-dispatching',
    title: 'the hidden cost of radio-call dispatching',
    excerpt:
      'the radio feels free because nobody invoices for it. but every status call is a tax on two people at once, and the bill comes due in hours you never get back.',
    tag: 'dispatch',
    accent: 'mint',
    cover: 1,
    readMinutes: 5,
    publishedAt: '2026-06-11',
    author: { name: 'marcus cole', role: 'fleet director' },
    sections: [
      {
        body: [
          'ask any dispatcher how they know where a crew is, and the honest answer is usually: they call and ask. the radio is the most trusted tool in the building precisely because it has never let anyone down. it also never scales.',
        ],
      },
      {
        heading: 'a tax paid twice',
        body: [
          'a status call costs the dispatcher a minute and the crew a minute. at any real volume that is hours a day, spent entirely on finding out what is already true somewhere.',
          'worse, the information has a shelf life measured in minutes. by the time it is relayed and written down, the crew has moved on. the dispatcher is always working from a picture that is slightly out of date.',
        ],
      },
      {
        heading: 'the picture should come to you',
        body: [
          'live status flips the model. instead of pulling information out of the field one call at a time, the field pushes it up automatically as work happens. the dispatcher reads a board, not a phone.',
          'the radio does not disappear. it goes back to being for the things radios are actually good at: judgment calls, exceptions, and the human moments a status field can never capture.',
        ],
      },
    ],
  },
  {
    slug: 'predictive-maintenance-before-the-road-finds-out',
    title: 'predictive maintenance, before the road finds out',
    excerpt:
      'a breakdown is never really a surprise. it is a signal that was available days earlier, sitting in data nobody was watching closely enough.',
    tag: 'maintenance',
    accent: 'peach',
    cover: 2,
    readMinutes: 7,
    publishedAt: '2026-06-04',
    author: { name: 'priya sharma', role: 'maintenance manager' },
    sections: [
      {
        body: [
          'the most expensive failure in field service is the one that happens with a crew and a customer waiting. it is not just the repair bill. it is the cancelled job, the idle crew, the reshuffled schedule, and the trust that takes months to rebuild.',
        ],
      },
      {
        heading: 'failures announce themselves',
        body: [
          'equipment rarely fails without warning. usage creeps up, intervals stretch, a pattern of small notes accumulates in the maintenance log. the warning is almost always there. the question is whether anyone is positioned to act on it.',
          'reactive maintenance waits for the warning to become an emergency. predictive maintenance reads the same signals while they are still cheap to address.',
        ],
      },
      {
        heading: 'turning the log into a forecast',
        body: [
          'a maintenance log is a record of the past. on its own it answers what happened. connect it to usage and scheduling data and it starts answering something more useful: what is about to happen, and what to do about it now.',
          'an inspection coming due, a vehicle trending toward an interval, a unit logging more hours than its peers. each becomes an alert with enough lead time to schedule the work on your terms, not the road\'s.',
        ],
      },
      {
        heading: 'the quiet payoff',
        body: [
          'done well, predictive maintenance is invisible. there is no dramatic save, because the failure that would have happened simply does not. the only evidence is a fleet that keeps running and a schedule that stops getting blown up by surprises.',
        ],
      },
    ],
  },
  {
    slug: 'a-real-time-operations-picture-your-team-trusts',
    title: 'a real-time operations picture your team trusts',
    excerpt:
      'a dashboard nobody believes is worse than no dashboard at all. trust is built on one thing: the screen and reality never disagree.',
    tag: 'realtime',
    accent: 'sky',
    cover: 3,
    readMinutes: 6,
    publishedAt: '2026-05-27',
    author: { name: 'daniel reyes', role: 'head of product' },
    sections: [
      {
        body: [
          'every operations team has lived through the dashboard that lied. it showed a crew as available who had clocked out an hour ago, or a job as open that had already closed. it took one bad reading to teach everyone to stop trusting the screen and pick up the phone again.',
        ],
      },
      {
        heading: 'latency is a trust problem',
        body: [
          'the gap between something happening and the screen showing it is not a technical detail. it is the entire question. a board that updates on refresh trains people to assume it is stale. a board that updates the instant work happens trains them to believe it.',
          'real-time is not a feature you add for flair. it is the precondition for anyone relying on what they see.',
        ],
      },
      {
        heading: 'one picture, every seat',
        body: [
          'the dispatcher, the manager, and the crew should be looking at the same truth from different angles. when a shift changes, presence indicators, activity feeds, and status all move together, so there is no version of events that depends on who you ask.',
          'that shared picture is what lets a team stop coordinating about the work and start doing it.',
        ],
      },
    ],
  },
  {
    slug: 'from-spreadsheets-to-operational-intelligence',
    title: 'from spreadsheets to operational intelligence',
    excerpt:
      'most operational tools just store and display data. the leap that matters is software that observes how work happens and helps you get better at it.',
    tag: 'product',
    accent: 'mint',
    cover: 4,
    readMinutes: 8,
    publishedAt: '2026-05-19',
    author: { name: 'sarah mitchell', role: 'operations lead' },
    sections: [
      {
        body: [
          'spreadsheets are the most successful operational software ever built, and that is exactly the problem. they are so flexible that they let a growing operation postpone every hard decision about how its systems should actually fit together.',
        ],
      },
      {
        heading: 'three eras of operational tooling',
        body: [
          'the first era stores data. a spreadsheet, a shared drive, a filing cabinet with a login. it remembers things so people do not have to.',
          'the second era displays data. dashboards and reports turn the stored numbers into charts. useful, but still fundamentally a rear-view mirror.',
          'the third era observes the work itself. it notices the overlapping shift, the idle window, the inspection about to lapse, and surfaces the problem before it becomes visible to anyone downstream.',
        ],
      },
      {
        heading: 'what changes when software understands the work',
        body: [
          'the questions get better. instead of asking what happened last week, a team starts asking what should happen next, and getting an answer grounded in their own operational data.',
          'anomalies stop hiding in plain sight. trends become visible early enough to act on. the tool stops being a place you go to record work and becomes part of how the work gets done.',
        ],
      },
      {
        heading: 'the gap worth building for',
        body: [
          'most tools help you do work. very few help you understand it or improve it. that gap, between recording operations and actually getting better at them, is the whole reason a platform like this exists.',
        ],
      },
    ],
  },
  {
    slug: 'what-session-replay-teaches-you',
    title: 'what session replay teaches you about real work',
    excerpt:
      'people describe their workflow as the version that makes sense. replay shows the version they actually live. the distance between the two is where the time goes.',
    tag: 'replay',
    accent: 'peach',
    cover: 5,
    readMinutes: 5,
    publishedAt: '2026-05-12',
    author: { name: 'daniel reyes', role: 'head of product' },
    sections: [
      {
        body: [
          'ask someone to walk you through how they do a task and they will give you the clean version: the steps in order, the way the process is supposed to go. it is honest and it is almost never what actually happens.',
        ],
      },
      {
        heading: 'the map is not the territory',
        body: [
          'real work is full of detours nobody mentions because they have stopped noticing them. the screen they check twice to be sure. the field they always tab past and come back to. the small recoveries from a layout that fights them.',
          'replay records the territory, not the map. it shows the actual path, including every step the description quietly left out.',
        ],
      },
      {
        heading: 'from playback to improvement',
        body: [
          'watching a real session is the fastest way to find where time leaks. it turns vague friction into a specific moment you can point at and fix. it makes training concrete, because a new hire learns from what experienced people actually do.',
          'the goal is not surveillance. it is the same instinct behind reviewing game footage: you cannot improve a process you have never actually watched.',
        ],
      },
    ],
  },
]

export const blogService = {
  listSummaries(): BlogPostSummary[] {
    return [...posts]
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .map(({ sections: _sections, ...summary }) => summary)
  },

  getBySlug(slug: string): BlogPost | undefined {
    return posts.find(p => p.slug === slug)
  },

  // related posts for the footer of an article: most recent others, excluding self
  related(slug: string, limit = 3): BlogPostSummary[] {
    return this.listSummaries()
      .filter(p => p.slug !== slug)
      .slice(0, limit)
  },
}
