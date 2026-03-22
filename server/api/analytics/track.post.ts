export default defineEventHandler(async (event) => {
  // analytics ingestion — fire and forget
  // in production this would write to an analytics store
  // for now we just accept and discard (behavior_events handles detailed tracking)
  const body = await readBody(event)

  if (!body?.events || !Array.isArray(body.events)) {
    return { ok: true }
  }

  // placeholder: log in dev for visibility
  if (process.dev) {
    // eslint-disable-next-line no-console
    console.log(`[analytics] received ${body.events.length} events`)
  }

  return { ok: true }
})
