import { apiFetch } from './client'

export interface OrgMember {
  user_id: string
  email: string
  name: string
  initials: string
  role: 'owner' | 'admin' | 'member'
}

export async function fetchOrgMembers(): Promise<OrgMember[]> {
  const r = await apiFetch('/api/org/members')
  if (!r.ok) throw new Error('Failed to load members')
  return r.json()
}

export async function updateMemberRole(userId: string, role: string): Promise<void> {
  const r = await apiFetch(`/api/org/members/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  })
  if (!r.ok) throw new Error('Failed to update role')
}

export async function removeMember(userId: string): Promise<void> {
  const r = await apiFetch(`/api/org/members/${userId}`, { method: 'DELETE' })
  if (!r.ok) throw new Error('Failed to remove member')
}
