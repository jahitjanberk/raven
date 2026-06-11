import { apiFetch } from './client'

export interface AuditEventPayload {
  project_id?: string | null
  event_type: string
  entity_type?: string | null
  entity_value?: string | null
  node_id?: string | null
  detail?: string | null
}

/** Fire-and-forget audit log. Errors are swallowed — never block user actions. */
export function logAuditEvent(payload: AuditEventPayload): void {
  apiFetch('/api/audit', {
    method: 'POST',
    body: JSON.stringify(payload),
  }).catch(() => { /* offline or unauthed — silently drop */ })
}
