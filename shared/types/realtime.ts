export type RealtimeEventType =
  | 'shift_updated'
  | 'shift_created'
  | 'workflow_updated'
  | 'workflow_created'
  | 'workflow_deleted'
  | 'activity_created'
  | 'presence_update'

export interface RealtimeEvent {
  type: RealtimeEventType
  payload: Record<string, unknown>
  userId: string
  userName: string
  companyId: string
  timestamp: string
}

export interface PresenceInfo {
  userId: string
  userName: string
  route: string
  entityId?: string
  action: 'viewing' | 'editing'
  lastSeen: string
}
