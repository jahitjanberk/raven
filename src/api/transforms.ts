import type { EntityType } from '../types/graph'
import { BASE_URL, authHeaders } from './client'

// ─── Wire types ───────────────────────────────────────────────────────────────

export interface Transform {
  name: string
  slug: string
  description: string
  accepts: string[]
  returns: string[]
  requires_key: boolean
  tier: 'free' | 'pro'
  category: string
}

export interface ResultNode {
  type: string
  value: string
  source_url?: string | null
  note?: string | null
}

export interface ResultEdge {
  source: number   // 0-based index into result nodes
  target: number
  label?: string | null
}

export interface TransformResult {
  nodes: ResultNode[]
  edges: ResultEdge[]
  error?: string | null
}

export class UpgradeRequiredError extends Error {
  constructor(public readonly transform: string) {
    super('This transform requires a Pro plan.')
    this.name = 'UpgradeRequiredError'
  }
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function fetchTransforms(): Promise<Transform[]> {
  const resp = await fetch(`${BASE_URL}/api/transforms`, { headers: authHeaders() })
  if (!resp.ok) throw new Error(`fetchTransforms: ${resp.status} ${resp.statusText}`)
  return resp.json() as Promise<Transform[]>
}

export async function runTransform(
  slug: string,
  value: string,
  apiKey?: string,
  projectId?: string,
  nodeId?: string,
  entityType?: string,
): Promise<TransformResult> {
  const resp = await fetch(`${BASE_URL}/api/transforms/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...authHeaders() },
    body: JSON.stringify({
      slug,
      value,
      api_key: apiKey ?? null,
      project_id: projectId ?? null,
      node_id: nodeId ?? null,
      entity_type: entityType ?? null,
    }),
  })
  if (!resp.ok) {
    if (resp.status === 402) {
      let transform = slug
      try {
        const body = await resp.json() as { detail?: { transform?: string } }
        if (body.detail?.transform) transform = body.detail.transform
      } catch { /* ignore */ }
      throw new UpgradeRequiredError(transform)
    }
    let detail = resp.statusText
    try {
      const body = await resp.json() as { detail?: string }
      if (body.detail) detail = typeof body.detail === 'string' ? body.detail : JSON.stringify(body.detail)
    } catch { /* ignore parse errors */ }
    throw new Error(detail)
  }
  return resp.json() as Promise<TransformResult>
}

// ─── Dispatch helper ──────────────────────────────────────────────────────────
// Adds transform result nodes/edges to the graph store and wires them back to
// the source node. Returns the number of nodes actually added (deduped).

export interface AddNodeFn {
  (
    type: EntityType,
    value: string,
    note?: string,
    metadata?: Record<string, string>,
    addedByOverride?: string,
    sourceUrl?: string,
  ): { id: string }
}

export interface AddEdgeFn {
  (source: string, target: string, label?: string): void
}

export function applyTransformResult(
  result: TransformResult,
  sourceNodeId: string,
  transformName: string,
  addNode: AddNodeFn,
  addEdge: AddEdgeFn,
  existingNodes: { id: string; value: string; type: string }[],
): number {
  // Map each result node index → graph node id (existing or newly created)
  const idByIndex: string[] = []
  // Track what we've added in this call to avoid duplicate adds within the batch
  const addedByKey = new Map<string, string>()  // "type:value" → node id

  for (const rn of result.nodes) {
    const key = `${rn.type}:${rn.value}`

    // Check already-in-batch duplicates first
    const batchId = addedByKey.get(key)
    if (batchId) {
      idByIndex.push(batchId)
      continue
    }

    // Check existing graph nodes
    const existing = existingNodes.find(
      n => n.value === rn.value && n.type === rn.type,
    )
    if (existing) {
      idByIndex.push(existing.id)
      addedByKey.set(key, existing.id)
      continue
    }

    // Add new node
    const newNode = addNode(
      rn.type as EntityType,
      rn.value,
      rn.note ?? undefined,
      undefined,
      `Transform: ${transformName}`,
      rn.source_url ?? undefined,
    )
    idByIndex.push(newNode.id)
    addedByKey.set(key, newNode.id)
  }

  // Result-internal edges (between result nodes)
  for (const edge of result.edges) {
    const srcId = idByIndex[edge.source]
    const tgtId = idByIndex[edge.target]
    if (srcId && tgtId) {
      addEdge(srcId, tgtId, edge.label ?? undefined)
    }
  }

  // Connect every added node back to the queried source node
  const uniqueAdded = [...new Set(idByIndex)]
  for (const id of uniqueAdded) {
    if (id !== sourceNodeId) {
      addEdge(sourceNodeId, id, transformName)
    }
  }

  // Count truly-new nodes (not pre-existing)
  const existingIds = new Set(existingNodes.map(n => n.id))
  return uniqueAdded.filter(id => !existingIds.has(id)).length
}
