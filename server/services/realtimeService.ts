import type { RealtimeEvent, PresenceInfo } from '../../shared/types/realtime'

type Listener = (event: RealtimeEvent) => void

interface Connection {
  userId: string
  userName: string
  companyId: string
  listener: Listener
}

const connections = new Map<string, Connection>()
const presence = new Map<string, PresenceInfo>()

// clean stale presence entries every 30s
setInterval(() => {
  const cutoff = Date.now() - 60_000
  for (const [key, info] of presence) {
    if (new Date(info.lastSeen).getTime() < cutoff) {
      presence.delete(key)
    }
  }
}, 30_000)

export const realtimeService = {
  subscribe(connectionId: string, userId: string, userName: string, companyId: string, listener: Listener) {
    connections.set(connectionId, { userId, userName, companyId, listener })
  },

  unsubscribe(connectionId: string) {
    const conn = connections.get(connectionId)
    if (conn) {
      // remove presence for this connection
      presence.delete(conn.userId)
    }
    connections.delete(connectionId)
  },

  broadcast(event: RealtimeEvent) {
    for (const [, conn] of connections) {
      if (conn.companyId !== event.companyId) continue
      try {
        conn.listener(event)
      } catch {
        // listener error — ignore
      }
    }
  },

  updatePresence(info: PresenceInfo, companyId: string) {
    presence.set(info.userId, info)

    this.broadcast({
      type: 'presence_update',
      payload: { presence: this.getCompanyPresence(companyId) },
      userId: info.userId,
      userName: info.userName,
      companyId,
      timestamp: new Date().toISOString(),
    })
  },

  getCompanyPresence(companyId: string): PresenceInfo[] {
    const result: PresenceInfo[] = []
    for (const [, conn] of connections) {
      if (conn.companyId !== companyId) {
        continue
      }
      const info = presence.get(conn.userId)
      if (info) result.push(info)
    }
    return result
  },

  getConnectionCount(companyId: string): number {
    let count = 0
    for (const [, conn] of connections) {
      if (conn.companyId === companyId) count++
    }
    return count
  },
}
