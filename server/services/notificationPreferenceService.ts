import { notificationPreferenceModel } from '../models/notificationPreferenceModel'

// the notification types a user can opt out of. defaults to all enabled.
export const NOTIFICATION_TYPES = [
  'shift',
  'approval',
  'escalation',
  'message',
  'comment',
  'automation',
  'billing',
  'system',
] as const

export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

function parse(raw: string | undefined): Record<string, boolean> {
  if (!raw) return {}
  try {
    return JSON.parse(raw) as Record<string, boolean>
  } catch {
    return {}
  }
}

export const notificationPreferenceService = {
  get(userId: string) {
    const row = notificationPreferenceModel.find(userId)
    const stored = parse(row?.preferences)
    // present a complete map so the ui always has every toggle
    const preferences: Record<string, boolean> = {}
    for (const type of NOTIFICATION_TYPES) {
      preferences[type] = stored[type] !== false
    }
    return { preferences }
  },

  update(userId: string, companyId: string, input: Record<string, boolean>) {
    const next: Record<string, boolean> = {}
    for (const type of NOTIFICATION_TYPES) {
      if (type in input) next[type] = input[type] === true
    }
    notificationPreferenceModel.upsert(userId, companyId, JSON.stringify(next))
    return this.get(userId)
  },

  // a type with no stored preference is enabled by default.
  isEnabled(userId: string, type: string): boolean {
    const row = notificationPreferenceModel.find(userId)
    if (!row) return true
    return parse(row.preferences)[type] !== false
  },
}
