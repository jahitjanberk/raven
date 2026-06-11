import type { GraphNode, GraphEdge } from '../types/graph'
import { apiFetch } from './client'

export interface RemoteGraph {
  projectId: string
  nodes: GraphNode[]
  edges: GraphEdge[]
  caseNotes: string
  savedAt: string
}

export async function loadGraphApi(projectId: string): Promise<RemoteGraph | null> {
  const resp = await apiFetch(`/api/graphs/${projectId}`)
  if (resp.status === 404) return null
  if (!resp.ok) throw new Error(`loadGraph: ${resp.status}`)
  const d = await resp.json() as {
    project_id: string; nodes: GraphNode[]; edges: GraphEdge[]
    case_notes: string; saved_at: string
  }
  return {
    projectId: d.project_id,
    nodes:     d.nodes,
    edges:     d.edges,
    caseNotes: d.case_notes,
    savedAt:   d.saved_at,
  }
}

export async function saveGraphApi(
  projectId: string,
  nodes: GraphNode[],
  edges: GraphEdge[],
  caseNotes: string,
): Promise<void> {
  const resp = await apiFetch(`/api/graphs/${projectId}/save`, {
    method: 'POST',
    body: JSON.stringify({ nodes, edges, case_notes: caseNotes }),
  })
  if (!resp.ok) throw new Error(`saveGraph: ${resp.status}`)
}
