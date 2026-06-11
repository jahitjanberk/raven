import { create } from 'zustand'
import type { GraphNode, GraphEdge, EntityType, RiskFlag, ActionFlag, Confidence, EnrichmentResult, IntelGrade } from '../types/graph'
import { useSettingsStore } from './settingsStore'
import { logAuditEvent } from '../api/audit'

// ── History ───────────────────────────────────────────────────────────────────

export type HistoryEventType =
  | 'node:add'
  | 'node:remove'
  | 'node:risk'
  | 'node:action'
  | 'node:note'
  | 'node:enrich'
  | 'edge:add'
  | 'edge:remove'
  | 'graph:load'

export interface HistoryEvent {
  id: string
  type: HistoryEventType
  timestamp: string
  label: string
  entityType?: EntityType
  entityValue?: string
  nodeId?: string
}

function makeEvent(
  type: HistoryEventType,
  label: string,
  meta?: Partial<Pick<HistoryEvent, 'entityType' | 'entityValue' | 'nodeId'>>
): HistoryEvent {
  return {
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    type,
    label,
    ...meta,
  }
}

// ── Transform history ─────────────────────────────────────────────────────────

export interface TransformHistoryEntry {
  slug: string
  name: string
  ranAt: string
  addedCount: number
}

// ── Filters ───────────────────────────────────────────────────────────────────

export interface ActiveFilters {
  types: EntityType[]
  risks: RiskFlag[]
  actions: ActionFlag[]
  enrichedOnly: boolean
}

const DEFAULT_FILTERS: ActiveFilters = {
  types: [],
  risks: [],
  actions: [],
  enrichedOnly: false,
}

// ── Undo snapshot ─────────────────────────────────────────────────────────────

interface Snapshot {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

const MAX_UNDO = 50

// ── Store interface ───────────────────────────────────────────────────────────

export type SaveState = 'saved' | 'saving' | 'offline'

interface GraphStore {
  nodes: GraphNode[]
  edges: GraphEdge[]
  activeProjectId: string | null
  selectedNodeId: string | null
  selectedEdgeId: string | null
  hoveredNodeId: string | null
  focusedNodeId: string | null
  multiSelectedIds: string[]
  filters: ActiveFilters
  history: HistoryEvent[]
  caseNotes: string
  undoStack: Snapshot[]
  redoStack: Snapshot[]
  transformHistory: Record<string, TransformHistoryEntry[]>
  saveState: SaveState

  setActiveProjectId: (id: string | null) => void
  loadGraph: (nodes: GraphNode[], edges: GraphEdge[], caseNotes?: string) => void
  clearGraph: () => void
  addNode: (
    type: EntityType,
    value: string,
    note?: string,
    metadata?: Record<string, string>,
    addedByOverride?: string,
    sourceUrl?: string,
  ) => GraphNode
  addEdge: (source: string, target: string, label?: string) => void
  removeEdge: (id: string) => void
  removeNode: (id: string) => void
  removeNodes: (ids: string[]) => void
  updateNodePosition: (id: string, x: number, y: number) => void
  moveNodes: (ids: string[], dx: number, dy: number) => void
  batchSetPositions: (positions: { id: string; x: number; y: number }[]) => void
  setSelectedNode: (id: string | null) => void
  setSelectedEdge: (id: string | null) => void
  updateEdgeGrade: (id: string, patch: Partial<IntelGrade>) => void
  setHoveredNode: (id: string | null) => void
  setFocusedNode: (id: string | null) => void
  setMultiSelectedNodes: (ids: string[]) => void
  toggleMultiSelect: (id: string) => void
  clearMultiSelect: () => void
  updateNodeRisk: (id: string, risk: RiskFlag) => void
  updateNodesRisk: (ids: string[], risk: RiskFlag) => void
  updateNodeAction: (id: string, flag: ActionFlag) => void
  updateNodesAction: (ids: string[], flag: ActionFlag) => void
  updateNodeNote: (id: string, note: string) => void
  updateNodeConfidence: (id: string, confidence: Confidence) => void
  updateNodesConfidence: (ids: string[], confidence: Confidence) => void
  mergeNodes: (primaryId: string, secondaryIds: string[], primaryValue?: string) => void
  setEnriching: (id: string, enriching: boolean) => void
  setEnrichmentData: (id: string, data: EnrichmentResult) => void
  updateNodeMetadata: (id: string, patch: Record<string, string>) => void
  recordTransformRun: (nodeId: string, entry: TransformHistoryEntry) => void

  setFilters: (f: Partial<ActiveFilters>) => void
  clearFilters: () => void
  clearHistory: () => void
  setCaseNotes: (notes: string) => void
  setSaveState: (s: SaveState) => void
  pushUndoSnapshot: () => void
  undo: () => void
  redo: () => void
}

// ─────────────────────────────────────────────────────────────────────────────

let nodeCounter = 1

function randomCanvasPosition() {
  const cx = typeof window !== 'undefined' ? window.innerWidth  / 2 : 600
  const cy = typeof window !== 'undefined' ? window.innerHeight / 2 : 400
  return {
    x: cx - 180 + Math.random() * 360,
    y: cy - 120 + Math.random() * 240,
  }
}

function pushSnapshot(undoStack: Snapshot[], nodes: GraphNode[], edges: GraphEdge[]): Snapshot[] {
  return [...undoStack.slice(-(MAX_UNDO - 1)), { nodes, edges }]
}

export const useGraphStore = create<GraphStore>((set, get) => ({
  nodes: [],
  edges: [],
  activeProjectId: null,
  selectedNodeId: null,
  selectedEdgeId: null,
  hoveredNodeId: null,
  focusedNodeId: null,
  multiSelectedIds: [],
  filters: DEFAULT_FILTERS,
  history: [],
  caseNotes: '',
  undoStack: [],
  redoStack: [],
  transformHistory: {},
  saveState: 'saved',

  setActiveProjectId: (id) => {
    set({ activeProjectId: id })
    if (id) {
      localStorage.setItem('raven-active-project', id)
    } else {
      localStorage.removeItem('raven-active-project')
    }
  },

  loadGraph: (nodes, edges, caseNotes = '') => {
    set(s => ({
      nodes, edges,
      selectedNodeId: null, selectedEdgeId: null, hoveredNodeId: null, focusedNodeId: null,
      multiSelectedIds: [],
      filters: DEFAULT_FILTERS,
      history: [makeEvent('graph:load', `Case loaded — ${nodes.length} nodes, ${edges.length} edges`)],
      caseNotes,
      undoStack: pushSnapshot(s.undoStack, s.nodes, s.edges),
      redoStack: [],
    }))
  },

  clearGraph: () => {
    set(s => ({
      nodes: [], edges: [],
      selectedNodeId: null, selectedEdgeId: null, hoveredNodeId: null, focusedNodeId: null,
      multiSelectedIds: [],
      filters: DEFAULT_FILTERS, history: [], caseNotes: '',
      undoStack: pushSnapshot(s.undoStack, s.nodes, s.edges),
      redoStack: [],
    }))
  },

  addNode: (type, value, note, metadata, addedByOverride, sourceUrl) => {
    const pos = randomCanvasPosition()
    const { analystName } = useSettingsStore.getState()
    const node: GraphNode = {
      id: `node-${Date.now()}-${nodeCounter++}`,
      type, value, note, metadata,
      riskFlag: 'NONE',
      actionFlag: 'unknown',
      confidence: 'ungraded',
      addedAt: new Date().toISOString(),
      addedBy: addedByOverride ?? analystName,
      sourceUrl,
      position: pos,
    }
    set(s => ({
      nodes: [...s.nodes, node],
      undoStack: pushSnapshot(s.undoStack, s.nodes, s.edges),
      redoStack: [],
      history: [...s.history, makeEvent('node:add', `Added ${type} · ${value}`, { entityType: type, entityValue: value, nodeId: node.id })],
    }))
    const { activeProjectId } = get()
    if (activeProjectId && !addedByOverride) {
      logAuditEvent({ project_id: activeProjectId, event_type: 'entity:add', entity_type: type, entity_value: value, node_id: node.id })
    }
    return node
  },

  addEdge: (source, target, label) => {
    const already = get().edges.some(e => e.source === source && e.target === target)
    if (already) return
    const { nodes } = get()
    const srcNode = nodes.find(n => n.id === source)
    const tgtNode = nodes.find(n => n.id === target)
    const edge: GraphEdge = {
      id: `edge-${Date.now()}`,
      source, target, label,
      grade: { sourceReliability: 'ungraded', infoAccuracy: 'ungraded' },
      addedAt: new Date().toISOString(),
    }
    const srcVal = srcNode?.value ?? source
    const tgtVal = tgtNode?.value ?? target
    set(s => ({
      edges: [...s.edges, edge],
      undoStack: pushSnapshot(s.undoStack, s.nodes, s.edges),
      redoStack: [],
      history: [...s.history, makeEvent('edge:add', `${srcVal} → ${tgtVal}`)],
    }))
  },

  removeEdge: (id) => {
    const edge = get().edges.find(e => e.id === id)
    const { nodes } = get()
    const srcVal = nodes.find(n => n.id === edge?.source)?.value ?? '?'
    const tgtVal = nodes.find(n => n.id === edge?.target)?.value ?? '?'
    set(s => ({
      edges: s.edges.filter((e) => e.id !== id),
      undoStack: pushSnapshot(s.undoStack, s.nodes, s.edges),
      redoStack: [],
      history: [...s.history, makeEvent('edge:remove', `Edge removed: ${srcVal} → ${tgtVal}`)],
    }))
  },

  removeNode: (id) => {
    const node = get().nodes.find(n => n.id === id)
    set(s => ({
      nodes: s.nodes.filter((n) => n.id !== id),
      edges: s.edges.filter((e) => e.source !== id && e.target !== id),
      selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
      focusedNodeId:  s.focusedNodeId  === id ? null : s.focusedNodeId,
      multiSelectedIds: s.multiSelectedIds.filter(i => i !== id),
      undoStack: pushSnapshot(s.undoStack, s.nodes, s.edges),
      redoStack: [],
      history: [...s.history, makeEvent('node:remove',
        `Removed ${node?.type ?? 'node'}  ·  ${node?.value ?? id}`,
        { entityType: node?.type, entityValue: node?.value }
      )],
    }))
    const { activeProjectId } = get()
    if (activeProjectId) {
      logAuditEvent({ project_id: activeProjectId, event_type: 'entity:delete', entity_type: node?.type, entity_value: node?.value, node_id: id })
    }
  },

  removeNodes: (ids) => {
    const idSet = new Set(ids)
    set(s => ({
      nodes: s.nodes.filter(n => !idSet.has(n.id)),
      edges: s.edges.filter(e => !idSet.has(e.source) && !idSet.has(e.target)),
      selectedNodeId: idSet.has(s.selectedNodeId ?? '') ? null : s.selectedNodeId,
      focusedNodeId:  idSet.has(s.focusedNodeId  ?? '') ? null : s.focusedNodeId,
      multiSelectedIds: [],
      undoStack: pushSnapshot(s.undoStack, s.nodes, s.edges),
      redoStack: [],
      history: [...s.history, makeEvent('node:remove', `Removed ${ids.length} nodes`)],
    }))
  },

  updateNodePosition: (id, x, y) => {
    set(s => ({
      nodes: s.nodes.map((n) => n.id === id ? { ...n, position: { x, y } } : n),
    }))
  },

  moveNodes: (ids, dx, dy) => {
    const idSet = new Set(ids)
    set(s => ({
      nodes: s.nodes.map(n =>
        idSet.has(n.id)
          ? { ...n, position: { x: n.position.x + dx, y: n.position.y + dy } }
          : n
      ),
    }))
  },

  batchSetPositions: (positions) => {
    const posMap = new Map(positions.map(p => [p.id, { x: p.x, y: p.y }]))
    set(s => ({
      nodes: s.nodes.map(n => {
        const pos = posMap.get(n.id)
        return pos ? { ...n, position: pos } : n
      }),
    }))
  },

  setSelectedNode: (id) => set({ selectedNodeId: id, selectedEdgeId: null }),
  setSelectedEdge: (id) => set({ selectedEdgeId: id, selectedNodeId: null }),
  updateEdgeGrade: (id, patch) => {
    set(s => ({
      edges: s.edges.map(e =>
        e.id === id ? { ...e, grade: { ...e.grade, ...patch } } : e
      ),
    }))
  },
  setHoveredNode:  (id) => set({ hoveredNodeId: id }),
  setFocusedNode:  (id) => set({ focusedNodeId: id }),

  setMultiSelectedNodes: (ids) => set({ multiSelectedIds: ids }),

  toggleMultiSelect: (id) => set(s => ({
    multiSelectedIds: s.multiSelectedIds.includes(id)
      ? s.multiSelectedIds.filter(i => i !== id)
      : [...s.multiSelectedIds, id],
  })),

  clearMultiSelect: () => set({ multiSelectedIds: [] }),

  updateNodeRisk: (id, risk) => {
    const node = get().nodes.find(n => n.id === id)
    set(s => ({
      nodes: s.nodes.map((n) => n.id === id ? { ...n, riskFlag: risk } : n),
      undoStack: pushSnapshot(s.undoStack, s.nodes, s.edges),
      redoStack: [],
      history: [...s.history, makeEvent('node:risk',
        `Risk → ${risk}  ·  ${node?.value ?? id}`,
        { entityType: node?.type, entityValue: node?.value, nodeId: id }
      )],
    }))
    const { activeProjectId } = get()
    if (activeProjectId) {
      logAuditEvent({ project_id: activeProjectId, event_type: 'entity:risk', entity_type: node?.type, entity_value: node?.value, node_id: id, detail: risk })
    }
  },

  updateNodesRisk: (ids, risk) => {
    const idSet = new Set(ids)
    set(s => ({
      nodes: s.nodes.map(n => idSet.has(n.id) ? { ...n, riskFlag: risk } : n),
      undoStack: pushSnapshot(s.undoStack, s.nodes, s.edges),
      redoStack: [],
      history: [...s.history, makeEvent('node:risk', `Risk → ${risk}  ·  ${ids.length} nodes`)],
    }))
  },

  updateNodeAction: (id, flag) => {
    const node = get().nodes.find(n => n.id === id)
    set(s => ({
      nodes: s.nodes.map((n) => n.id === id ? { ...n, actionFlag: flag } : n),
      undoStack: pushSnapshot(s.undoStack, s.nodes, s.edges),
      redoStack: [],
      history: [...s.history, makeEvent('node:action',
        `Marked ${flag}  ·  ${node?.value ?? id}`,
        { entityType: node?.type, entityValue: node?.value, nodeId: id }
      )],
    }))
    const { activeProjectId } = get()
    if (activeProjectId) {
      logAuditEvent({ project_id: activeProjectId, event_type: 'entity:action', entity_type: node?.type, entity_value: node?.value, node_id: id, detail: flag })
    }
  },

  updateNodesAction: (ids, flag) => {
    const idSet = new Set(ids)
    set(s => ({
      nodes: s.nodes.map(n => idSet.has(n.id) ? { ...n, actionFlag: flag } : n),
      undoStack: pushSnapshot(s.undoStack, s.nodes, s.edges),
      redoStack: [],
      history: [...s.history, makeEvent('node:action', `Marked ${flag}  ·  ${ids.length} nodes`)],
    }))
  },

  updateNodeNote: (id, note) => {
    const node = get().nodes.find(n => n.id === id)
    set(s => ({
      nodes: s.nodes.map((n) => n.id === id ? { ...n, note } : n),
      undoStack: pushSnapshot(s.undoStack, s.nodes, s.edges),
      redoStack: [],
      history: [...s.history, makeEvent('node:note',
        `Note updated  ·  ${node?.value ?? id}`,
        { entityType: node?.type, entityValue: node?.value, nodeId: id }
      )],
    }))
  },

  updateNodeConfidence: (id, confidence) => {
    const node = get().nodes.find(n => n.id === id)
    set(s => ({
      nodes: s.nodes.map(n => n.id === id ? { ...n, confidence } : n),
      undoStack: pushSnapshot(s.undoStack, s.nodes, s.edges),
      redoStack: [],
      history: [...s.history, makeEvent('node:action',
        `Confidence → ${confidence}  ·  ${node?.value ?? id}`,
        { entityType: node?.type, entityValue: node?.value, nodeId: id }
      )],
    }))
  },

  updateNodesConfidence: (ids, confidence) => {
    const idSet = new Set(ids)
    set(s => ({
      nodes: s.nodes.map(n => idSet.has(n.id) ? { ...n, confidence } : n),
      undoStack: pushSnapshot(s.undoStack, s.nodes, s.edges),
      redoStack: [],
      history: [...s.history, makeEvent('node:action', `Confidence → ${confidence}  ·  ${ids.length} nodes`)],
    }))
  },

  mergeNodes: (primaryId, secondaryIds, primaryValue) => {
    const { nodes, edges } = get()
    const primary = nodes.find(n => n.id === primaryId)
    if (!primary) return
    const secondarySet = new Set(secondaryIds)

    // Union metadata from all secondaries
    const mergedMetadata: Record<string, string> = { ...primary.metadata }
    for (const secId of secondaryIds) {
      const sec = nodes.find(n => n.id === secId)
      if (sec?.metadata) {
        for (const [k, v] of Object.entries(sec.metadata)) {
          if (!mergedMetadata[k]) mergedMetadata[k] = v
        }
      }
    }

    // Build updated edges: rewire secondary refs to primary, drop self-loops
    const existingEdgeKeys = new Set(
      edges
        .filter(e => !secondarySet.has(e.source) && !secondarySet.has(e.target))
        .map(e => `${e.source}→${e.target}`)
    )
    const rewiredEdges: typeof edges = []
    for (const edge of edges) {
      if (secondarySet.has(edge.source) && secondarySet.has(edge.target)) continue
      const src = secondarySet.has(edge.source) ? primaryId : edge.source
      const tgt = secondarySet.has(edge.target) ? primaryId : edge.target
      if (src === tgt) continue
      const key = `${src}→${tgt}`
      if (existingEdgeKeys.has(key)) continue
      existingEdgeKeys.add(key)
      rewiredEdges.push({ ...edge, id: `edge-${Date.now()}-${Math.random().toString(36).slice(2,6)}`, source: src, target: tgt })
    }

    const keptEdges = edges.filter(e => !secondarySet.has(e.source) && !secondarySet.has(e.target))

    set(s => ({
      nodes: s.nodes
        .filter(n => !secondarySet.has(n.id))
        .map(n => n.id === primaryId ? { ...n, value: primaryValue ?? n.value, metadata: mergedMetadata } : n),
      edges: [...keptEdges, ...rewiredEdges],
      selectedNodeId: primaryId,
      multiSelectedIds: [],
      undoStack: pushSnapshot(s.undoStack, s.nodes, s.edges),
      redoStack: [],
      history: [...s.history, makeEvent('node:remove',
        `Merged ${secondaryIds.length + 1} nodes → ${primaryValue ?? primary.value}`,
        { entityType: primary.type, entityValue: primaryValue ?? primary.value, nodeId: primaryId }
      )],
    }))
  },

  setEnriching: (id, enriching) => {
    set(s => ({ nodes: s.nodes.map((n) => n.id === id ? { ...n, enriching } : n) }))
  },

  setEnrichmentData: (id, data) => {
    const node = get().nodes.find(n => n.id === id)
    set(s => ({
      nodes: s.nodes.map((n) => n.id === id ? { ...n, enrichmentData: data, enriching: false } : n),
      undoStack: pushSnapshot(s.undoStack, s.nodes, s.edges),
      redoStack: [],
      history: [...s.history, makeEvent('node:enrich',
        `Enriched  ·  ${node?.value ?? id}  (${data.sources.join(', ')})`,
        { entityType: node?.type, entityValue: node?.value, nodeId: id }
      )],
    }))
    const { activeProjectId } = get()
    if (activeProjectId) {
      logAuditEvent({ project_id: activeProjectId, event_type: 'entity:enrich', entity_type: node?.type, entity_value: node?.value, node_id: id, detail: data.sources.join(', ') })
    }
  },

  updateNodeMetadata: (id, patch) => {
    set(s => ({
      nodes: s.nodes.map(n =>
        n.id === id ? { ...n, metadata: { ...n.metadata, ...patch } } : n
      ),
    }))
  },

  recordTransformRun: (nodeId, entry) => {
    set(s => ({
      transformHistory: {
        ...s.transformHistory,
        [nodeId]: [...(s.transformHistory[nodeId] ?? []), entry].slice(-20),
      },
    }))
    const { activeProjectId } = get()
    if (activeProjectId) {
      logAuditEvent({ project_id: activeProjectId, event_type: 'transform:run', node_id: nodeId, detail: `${entry.name} (+${entry.addedCount})` })
    }
  },

  setFilters: (f) => set((s) => ({ filters: { ...s.filters, ...f } })),
  clearFilters: () => set({ filters: DEFAULT_FILTERS }),
  clearHistory: () => set({ history: [] }),
  setCaseNotes: (notes) => set({ caseNotes: notes }),
  setSaveState: (s) => set({ saveState: s }),

  pushUndoSnapshot: () => {
    set(s => ({
      undoStack: pushSnapshot(s.undoStack, s.nodes, s.edges),
      redoStack: [],
    }))
  },

  undo: () => {
    set(s => {
      if (s.undoStack.length === 0) return s
      const prev = s.undoStack[s.undoStack.length - 1]
      return {
        ...s,
        nodes: prev.nodes,
        edges: prev.edges,
        undoStack: s.undoStack.slice(0, -1),
        redoStack: [...s.redoStack.slice(-(MAX_UNDO - 1)), { nodes: s.nodes, edges: s.edges }],
        selectedNodeId: null,
        multiSelectedIds: [],
      }
    })
  },

  redo: () => {
    set(s => {
      if (s.redoStack.length === 0) return s
      const next = s.redoStack[s.redoStack.length - 1]
      return {
        ...s,
        nodes: next.nodes,
        edges: next.edges,
        redoStack: s.redoStack.slice(0, -1),
        undoStack: [...s.undoStack.slice(-(MAX_UNDO - 1)), { nodes: s.nodes, edges: s.edges }],
        selectedNodeId: null,
        multiSelectedIds: [],
      }
    })
  },
}))

