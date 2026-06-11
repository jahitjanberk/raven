// Background watch scheduler — polls when the app is open.
// True background scheduling (service worker / push) is not implemented here;
// watches only fire while the tab is active.

import { useWatchStore } from '../store/watchStore'
import { useGraphStore } from '../store/graphStore'
import { runTransform } from '../api/transforms'
import type { ResultNode } from '../api/transforms'

// ── Stable hash of a transform result set ────────────────────────────────────

function hashResults(nodes: ResultNode[]): string {
  const key = [...nodes]
    .map(n => `${n.type}:${n.value}`)
    .sort()
    .join('|')
  // djb2-ish 32-bit hash, hex-encoded
  let h = 5381
  for (let i = 0; i < key.length; i++) {
    h = ((h * 33) ^ key.charCodeAt(i)) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

// ── Single watch run ──────────────────────────────────────────────────────────

async function runWatch(watchId: string) {
  const store   = useWatchStore.getState()
  const entry   = store.entries.find(e => e.id === watchId)
  if (!entry || !entry.enabled) return

  const apiKey  = store.apiKeys[watchId] ?? undefined

  // If transform requires a key and we don't have one, skip silently
  if (entry.requiresKey && !apiKey) return

  let result: Awaited<ReturnType<typeof runTransform>>
  try {
    result = await runTransform(entry.transformSlug, entry.nodeValue, apiKey)
  } catch {
    // Network / backend error — reschedule, don't alert
    store.updateRunResult(watchId, null, false)
    return
  }

  if (result.error) {
    store.updateRunResult(watchId, null, false)
    return
  }

  const newHash = hashResults(result.nodes)
  const changed = entry.lastResultHash !== null && entry.lastResultHash !== newHash
  const isFirst = entry.lastResultHash === null

  store.updateRunResult(watchId, newHash, true)

  if (changed) {
    // Apply new nodes to the graph — this is the "auto-enrichment" step
    const graphStore = useGraphStore.getState()
    const sourceNode = graphStore.nodes.find(n => n.id === entry.nodeId)
    if (sourceNode) {
      // applyTransformResult logic inline (to avoid circular imports)
      for (const rn of result.nodes) {
        const alreadyExists = graphStore.nodes.some(
          n => n.type === rn.type && n.value === rn.value,
        )
        if (!alreadyExists) {
          const added = graphStore.addNode(
            rn.type as Parameters<typeof graphStore.addNode>[0],
            rn.value,
            rn.note ?? undefined,
            undefined,
            `Watch: ${entry.transformName}`,
            rn.source_url ?? undefined,
          )
          graphStore.addEdge(entry.nodeId, added.id, entry.transformName)
        }
      }
    }

    store.addAlert({
      watchId,
      summary: `${entry.transformName} on ${entry.nodeValue} — ${result.nodes.length} result(s) changed`,
      newNodeCount: result.nodes.length,
      read: false,
    })
  } else if (isFirst) {
    // First successful run — baseline established, no alert
  }
}

// ── Scheduler ─────────────────────────────────────────────────────────────────

let _running = false

export async function checkDueWatches() {
  if (_running) return
  _running = true
  try {
    const { entries } = useWatchStore.getState()
    const now = Date.now()
    const due = entries.filter(e => {
      if (!e.enabled) return false
      if (!e.nextRunAt) return true
      return new Date(e.nextRunAt).getTime() <= now
    })
    // Run sequentially to avoid hammering the backend
    for (const entry of due) {
      await runWatch(entry.id)
    }
  } finally {
    _running = false
  }
}
