import type { Project } from '../types/project'
import { apiFetch } from './client'

// ── Mapping ───────────────────────────────────────────────────────────────────

function fromApi(d: Record<string, unknown>): Project {
  return {
    id:                d.id                as string,
    name:              d.name              as string,
    caseRef:           (d.case_ref        as string | null) ?? undefined,
    classification:    d.classification    as Project['classification'],
    investigationType: d.investigation_type as Project['investigationType'],
    status:            d.status            as Project['status'],
    riskLevel:         d.risk_level        as Project['riskLevel'],
    nodeCount:         d.node_count        as number,
    edgeCount:         d.edge_count        as number,
    entityCounts:      (d.entity_counts   as Project['entityCounts']) ?? {},
    analystInitials:   d.analyst_initials  as string,
    analystName:       d.analyst_name      as string,
    lastAction:        (d.last_action     as string | null) ?? undefined,
    createdAt:         d.created_at        as string,
    updatedAt:         d.updated_at        as string,
  }
}

function toApi(p: Partial<Project>): Record<string, unknown> {
  const map: Record<keyof Project, string> = {
    id:                'id',
    name:              'name',
    caseRef:           'case_ref',
    classification:    'classification',
    investigationType: 'investigation_type',
    status:            'status',
    riskLevel:         'risk_level',
    nodeCount:         'node_count',
    edgeCount:         'edge_count',
    entityCounts:      'entity_counts',
    analystInitials:   'analyst_initials',
    analystName:       'analyst_name',
    lastAction:        'last_action',
    createdAt:         'created_at',
    updatedAt:         'updated_at',
  }
  return Object.fromEntries(
    (Object.entries(p) as [keyof Project, unknown][])
      .filter(([, v]) => v !== undefined)
      .map(([k, v]) => [map[k] ?? k, v])
  )
}

// ── API calls ─────────────────────────────────────────────────────────────────

export async function fetchProjects(): Promise<Project[]> {
  const resp = await apiFetch('/api/projects')
  if (!resp.ok) throw new Error(`fetchProjects: ${resp.status}`)
  const data = await resp.json() as Record<string, unknown>[]
  return data.map(fromApi)
}

export async function createProjectApi(
  project: Omit<Project, 'id' | 'nodeCount' | 'edgeCount' | 'entityCounts' | 'createdAt' | 'updatedAt'>,
): Promise<Project> {
  const resp = await apiFetch('/api/projects', {
    method: 'POST',
    body: JSON.stringify(toApi(project as Partial<Project>)),
  })
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({})) as { detail?: string }
    throw new Error(err.detail ?? `createProject: ${resp.status}`)
  }
  return fromApi(await resp.json() as Record<string, unknown>)
}

export async function updateProjectApi(id: string, patch: Partial<Project>): Promise<Project> {
  const resp = await apiFetch(`/api/projects/${id}`, {
    method: 'PUT',
    body: JSON.stringify(toApi(patch)),
  })
  if (!resp.ok) throw new Error(`updateProject: ${resp.status}`)
  return fromApi(await resp.json() as Record<string, unknown>)
}

export async function deleteProjectApi(id: string): Promise<void> {
  const resp = await apiFetch(`/api/projects/${id}`, { method: 'DELETE' })
  if (!resp.ok && resp.status !== 204) throw new Error(`deleteProject: ${resp.status}`)
}
