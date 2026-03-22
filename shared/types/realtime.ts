export type RealtimeEventType =
  | 'shift_updated'
  | 'shift_created'
  | 'workflow_updated'
  | 'workflow_created'
  | 'workflow_deleted'
  | 'activity_created'
  | 'presence_update'
  | 'message_created'
  | 'comment_created'
  | 'approval_created'
  | 'approval_updated'
  | 'escalation_created'
  | 'typing_indicator'

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
