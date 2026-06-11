// ── Layout algorithms for the graph canvas ────────────────────────────────────
// All algorithms return {id, x, y}[] in world coordinates.
// Inputs are the current node positions + edges (source/target by id).

export interface LayoutNode {
  id: string
  x: number
  y: number
  type?: string
}

export interface LayoutEdge {
  source: string
  target: string
}

export type LayoutAlgorithm = 'force' | 'hierarchical' | 'radial' | 'cluster'

// ── Helpers ───────────────────────────────────────────────────────────────────

function centerPositions(
  positions: LayoutNode[],
  targetCx: number,
  targetCy: number,
): LayoutNode[] {
  if (positions.length === 0) return positions
  const minX = Math.min(...positions.map(p => p.x))
  const maxX = Math.max(...positions.map(p => p.x))
  const minY = Math.min(...positions.map(p => p.y))
  const maxY = Math.max(...positions.map(p => p.y))
  const dx = targetCx - (minX + maxX) / 2
  const dy = targetCy - (minY + maxY) / 2
  return positions.map(p => ({ ...p, x: p.x + dx, y: p.y + dy }))
}

function buildAdj(nodeIds: string[], edges: LayoutEdge[]): Map<string, string[]> {
  const adj = new Map<string, string[]>()
  nodeIds.forEach(id => adj.set(id, []))
  edges.forEach(e => {
    if (adj.has(e.source) && adj.has(e.target)) {
      adj.get(e.source)!.push(e.target)
      adj.get(e.target)!.push(e.source)
    }
  })
  return adj
}

function bfsLayers(startId: string, adj: Map<string, string[]>): Map<string, number> {
  const layers = new Map<string, number>()
  const queue = [startId]
  layers.set(startId, 0)
  while (queue.length > 0) {
    const curr = queue.shift()!
    const layer = layers.get(curr)!
    for (const neighbor of (adj.get(curr) ?? [])) {
      if (!layers.has(neighbor)) {
        layers.set(neighbor, layer + 1)
        queue.push(neighbor)
      }
    }
  }
  return layers
}

// ── Force-directed (Fruchterman-Reingold) ─────────────────────────────────────
// O(n² × iterations). Fast enough for ≤ 500 nodes.

export function forceLayout(
  nodes: LayoutNode[],
  edges: LayoutEdge[],
  cx = 700,
  cy = 450,
): LayoutNode[] {
  if (nodes.length === 0) return []
  if (nodes.length === 1) return [{ ...nodes[0], x: cx, y: cy }]

  const W = 1400
  const H = 900
  const ITER = 160
  const k = Math.sqrt((W * H) / nodes.length) * 0.9

  // Initialise: spread current positions; if already spread use them, else random scatter
  const xs = nodes.map(n => n.x)
  const ys = nodes.map(n => n.y)
  const spread = Math.max(...xs) - Math.min(...xs) + Math.max(...ys) - Math.min(...ys)
  const useRandom = spread < 10

  const pos = new Map<string, { x: number; y: number }>()
  nodes.forEach((n, i) => {
    if (useRandom) {
      const angle = (i / nodes.length) * Math.PI * 2
      const r = k * 2 + Math.random() * k
      pos.set(n.id, { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) })
    } else {
      // Jitter slightly to break exact overlaps
      pos.set(n.id, {
        x: n.x + (Math.random() - 0.5) * 2,
        y: n.y + (Math.random() - 0.5) * 2,
      })
    }
  })

  let temp = Math.sqrt(W * H) * 0.08

  for (let iter = 0; iter < ITER; iter++) {
    const disp = new Map<string, { x: number; y: number }>()
    nodes.forEach(n => disp.set(n.id, { x: 0, y: 0 }))

    // Repulsion — O(n²)
    for (let i = 0; i < nodes.length; i++) {
      const uid = nodes[i].id
      const pu = pos.get(uid)!
      for (let j = i + 1; j < nodes.length; j++) {
        const vid = nodes[j].id
        const pv = pos.get(vid)!
        let dx = pu.x - pv.x
        let dy = pu.y - pv.y
        let dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 1) { dx = Math.random() - 0.5; dy = Math.random() - 0.5; dist = 0.5 }
        const f = (k * k) / dist
        const nx = (dx / dist) * f
        const ny = (dy / dist) * f
        disp.get(uid)!.x += nx
        disp.get(uid)!.y += ny
        disp.get(vid)!.x -= nx
        disp.get(vid)!.y -= ny
      }
    }

    // Attraction — edges
    for (const e of edges) {
      const pu = pos.get(e.source)
      const pv = pos.get(e.target)
      if (!pu || !pv) continue
      let dx = pu.x - pv.x
      let dy = pu.y - pv.y
      const dist = Math.max(Math.sqrt(dx * dx + dy * dy), 0.1)
      const f = (dist * dist) / k
      const nx = (dx / dist) * f
      const ny = (dy / dist) * f
      disp.get(e.source)!.x -= nx
      disp.get(e.source)!.y -= ny
      disp.get(e.target)!.x += nx
      disp.get(e.target)!.y += ny
    }

    // Apply displacements, clamp to temperature
    for (const node of nodes) {
      const d = disp.get(node.id)!
      const p = pos.get(node.id)!
      const dlen = Math.sqrt(d.x * d.x + d.y * d.y)
      if (dlen > 0) {
        const scale = Math.min(dlen, temp) / dlen
        p.x += d.x * scale
        p.y += d.y * scale
      }
    }

    temp *= 0.93
  }

  const raw = nodes.map(n => ({ ...n, ...pos.get(n.id)! }))
  return centerPositions(raw, cx, cy)
}

// ── Hierarchical (BFS layers) ─────────────────────────────────────────────────

export function hierarchicalLayout(
  nodes: LayoutNode[],
  edges: LayoutEdge[],
  rootId?: string,
  cx = 700,
  cy = 450,
): LayoutNode[] {
  if (nodes.length === 0) return []
  if (nodes.length === 1) return [{ ...nodes[0], x: cx, y: cy }]

  const adj = buildAdj(nodes.map(n => n.id), edges)

  // Pick root: provided id, or highest-degree node
  const root = rootId && adj.has(rootId)
    ? rootId
    : nodes.reduce((best, n) =>
        (adj.get(n.id)?.length ?? 0) > (adj.get(best.id)?.length ?? 0) ? n : best
      , nodes[0]).id

  // BFS from root
  const layers = bfsLayers(root, adj)

  // Handle disconnected nodes (assign to a synthetic last layer)
  const maxLayer = Math.max(0, ...layers.values())
  nodes.forEach(n => {
    if (!layers.has(n.id)) layers.set(n.id, maxLayer + 1)
  })

  // Group by layer
  const byLayer = new Map<number, string[]>()
  layers.forEach((layer, id) => {
    if (!byLayer.has(layer)) byLayer.set(layer, [])
    byLayer.get(layer)!.push(id)
  })

  const numLayers = Math.max(...byLayer.keys()) + 1
  const H_SPAN = 800
  const V_SPAN = 700
  const layerGap = numLayers > 1 ? V_SPAN / (numLayers - 1) : 0

  const result = new Map<string, { x: number; y: number }>()

  byLayer.forEach((ids, layer) => {
    const y = -V_SPAN / 2 + layer * layerGap
    // Sort nodes in each layer by their parent's x to reduce crossings
    const sorted = ids.sort((a, b) => {
      const aParent = [...adj.get(a)!].find(p => (layers.get(p) ?? Infinity) < layer)
      const bParent = [...adj.get(b)!].find(p => (layers.get(p) ?? Infinity) < layer)
      const ax = aParent ? (result.get(aParent)?.x ?? 0) : 0
      const bx = bParent ? (result.get(bParent)?.x ?? 0) : 0
      return ax - bx
    })
    const xGap = sorted.length > 1 ? H_SPAN / (sorted.length - 1) : 0
    const startX = sorted.length > 1 ? -H_SPAN / 2 : 0
    sorted.forEach((id, i) => {
      result.set(id, { x: startX + i * xGap, y })
    })
  })

  const raw = nodes.map(n => ({ ...n, ...result.get(n.id)! }))
  return centerPositions(raw, cx, cy)
}

// ── Radial (concentric rings from root) ───────────────────────────────────────

export function radialLayout(
  nodes: LayoutNode[],
  edges: LayoutEdge[],
  rootId?: string,
  cx = 700,
  cy = 450,
): LayoutNode[] {
  if (nodes.length === 0) return []
  if (nodes.length === 1) return [{ ...nodes[0], x: cx, y: cy }]

  const adj = buildAdj(nodes.map(n => n.id), edges)

  const root = rootId && adj.has(rootId)
    ? rootId
    : nodes.reduce((best, n) =>
        (adj.get(n.id)?.length ?? 0) > (adj.get(best.id)?.length ?? 0) ? n : best
      , nodes[0]).id

  const rings = bfsLayers(root, adj)
  const maxRing = Math.max(0, ...rings.values())
  nodes.forEach(n => { if (!rings.has(n.id)) rings.set(n.id, maxRing + 1) })

  const byRing = new Map<number, string[]>()
  rings.forEach((ring, id) => {
    if (!byRing.has(ring)) byRing.set(ring, [])
    byRing.get(ring)!.push(id)
  })

  const totalRings = Math.max(...byRing.keys()) + 1
  const MAX_R = Math.min(cx, cy) * 0.82
  const ringStep = totalRings > 1 ? MAX_R / (totalRings - 1) : MAX_R

  const result = new Map<string, { x: number; y: number }>()

  byRing.forEach((ids, ring) => {
    if (ring === 0) {
      result.set(ids[0], { x: 0, y: 0 })
      return
    }
    const r = ring * ringStep
    // Start angle offset per ring to avoid radial alignment (looks better)
    const startAngle = ring % 2 === 0 ? -Math.PI / 2 : -Math.PI / 2 + Math.PI / ids.length
    ids.forEach((id, i) => {
      const angle = startAngle + (i / ids.length) * Math.PI * 2
      result.set(id, { x: r * Math.cos(angle), y: r * Math.sin(angle) })
    })
  })

  const raw = nodes.map(n => {
    const r = result.get(n.id) ?? { x: 0, y: 0 }
    return { ...n, x: cx + r.x, y: cy + r.y }
  })
  return raw
}

// ── Type cluster (group nodes by entity type) ─────────────────────────────────

export function clusterLayout(
  nodes: LayoutNode[],
  _edges: LayoutEdge[],
  cx = 700,
  cy = 450,
): LayoutNode[] {
  if (nodes.length === 0) return []
  if (nodes.length === 1) return [{ ...nodes[0], x: cx, y: cy }]

  // Group by type
  const byType = new Map<string, LayoutNode[]>()
  nodes.forEach(n => {
    const t = n.type ?? 'unknown'
    if (!byType.has(t)) byType.set(t, [])
    byType.get(t)!.push(n)
  })

  // Sort types by count descending so larger clusters get more space
  const types = [...byType.entries()].sort((a, b) => b[1].length - a[1].length).map(e => e[0])
  const numTypes = types.length

  // Place type centroids in a circle or grid
  const CENTROID_R = Math.min(cx, cy) * 0.62
  const result: LayoutNode[] = []

  types.forEach((type, ti) => {
    // Centroid position
    const centAngle = (ti / numTypes) * Math.PI * 2 - Math.PI / 2
    const tcx = numTypes === 1 ? cx : cx + CENTROID_R * Math.cos(centAngle)
    const tcy = numTypes === 1 ? cy : cy + CENTROID_R * Math.sin(centAngle)

    const typeNodes = byType.get(type)!
    const count = typeNodes.length

    if (count === 1) {
      result.push({ ...typeNodes[0], x: tcx, y: tcy })
      return
    }

    // Spread within cluster — small circle, radius proportional to count
    const innerR = Math.max(35, Math.min(120, count * 18))
    typeNodes.forEach((n, ni) => {
      const angle = (ni / count) * Math.PI * 2 - Math.PI / 2
      result.push({ ...n, x: tcx + innerR * Math.cos(angle), y: tcy + innerR * Math.sin(angle) })
    })
  })

  return result
}

// ── Dispatch ──────────────────────────────────────────────────────────────────

export function runLayout(
  algorithm: LayoutAlgorithm,
  nodes: LayoutNode[],
  edges: LayoutEdge[],
  rootId?: string,
  cx?: number,
  cy?: number,
): LayoutNode[] {
  switch (algorithm) {
    case 'force':       return forceLayout(nodes, edges, cx, cy)
    case 'hierarchical':return hierarchicalLayout(nodes, edges, rootId, cx, cy)
    case 'radial':      return radialLayout(nodes, edges, rootId, cx, cy)
    case 'cluster':     return clusterLayout(nodes, edges, cx, cy)
  }
}
