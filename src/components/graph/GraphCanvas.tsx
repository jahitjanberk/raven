import React, { useRef, useState, useCallback, useEffect, useMemo, forwardRef, useImperativeHandle } from 'react'
import type { GraphNode, GraphEdge, Confidence } from '../../types/graph'
import { ENTITY_CONFIG, RISK_COLORS, CONFIDENCE_CONFIG, intelGradeColor } from '../../types/graph'
import { useGraphStore } from '../../store/graphStore'
import { useSettingsStore } from '../../store/settingsStore'
import { UIIcon } from '../../icons/UIIcon'
import { exportGraphToPNG } from '../../lib/exportPNG'
import {
  fetchTransforms,
  runTransform,
  applyTransformResult,
} from '../../api/transforms'
import type { Transform } from '../../api/transforms'
import { MergeModal } from './MergeModal'

interface ContextMenu {
  x: number; y: number; nodeId: string
}

interface Toast {
  message: string
  type: 'success' | 'error'
}

interface Lasso {
  sx: number; sy: number   // world coords where drag started
  ex: number; ey: number   // current world coords of mouse
}

interface GraphCanvasProps {
  onAddNode: () => void
  onImportCSV: () => void
  searchQuery?: string
}

export interface GraphCanvasHandle {
  exportToPNG: (filename: string) => Promise<void>
  fitToView: () => void
}

const NODE_RADIUS = 28

const ENTITY_ICON: Record<string, React.ReactNode> = {
  ip:          <><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M12 12h.01M8 12h.01M16 12h.01" /></>,
  domain:      <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></>,
  email:       <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></>,
  person:      <><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></>,
  org:         <><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18" /><path d="M6 12H4a2 2 0 0 0-2 2v8h20v-8a2 2 0 0 0-2-2h-2" /><rect x="10" y="6" width="4" height="4" /></>,
  phone:       <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 9.8 19.79 19.79 0 0 1 1.05 1.17 2 2 0 0 1 3 .01h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 14.92z" />,
  wallet:      <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /><circle cx="16" cy="15" r="1" /></>,
  url:         <><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></>,
  bank:        <><line x1="3" y1="22" x2="21" y2="22" /><line x1="6" y1="18" x2="6" y2="11" /><line x1="10" y1="18" x2="10" y2="11" /><line x1="14" y1="18" x2="14" y2="11" /><line x1="18" y1="18" x2="18" y2="11" /><polygon points="12 2 20 7 4 7" /></>,
  cert:        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
  social:      <><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></>,
  company:     <><rect x="9" y="2" width="6" height="4" rx="1" /><path d="M8 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2h-2" /><path d="m9 12 2 2 4-4" /></>,
  transaction: <><path d="m16 3 4 4-4 4" /><path d="M20 7H4" /><path d="m8 21-4-4 4-4" /><path d="M4 17h16" /></>,
  takedown:    <><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" /><line x1="4" y1="22" x2="4" y2="15" /></>,
  location:    <><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
  fraudreport: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 9h6" /><path d="M9 13h6" /><path d="M9 17h4" /></>,
  hash:        <><line x1="4" y1="9" x2="20" y2="9" /><line x1="4" y1="15" x2="20" y2="15" /><line x1="10" y1="3" x2="8" y2="21" /><line x1="16" y1="3" x2="14" y2="21" /></>,
}

// ── EdgeLine ──────────────────────────────────────────────────────────────────

function EdgeLine({
  edge, nodes, selected, onSelect, dimOpacity, focusHighlighted,
}: {
  edge: GraphEdge
  nodes: GraphNode[]
  selected: boolean
  onSelect: () => void
  dimOpacity?: number
  focusHighlighted?: boolean
}) {
  const [hovered, setHovered] = useState(false)
  const src = nodes.find((n) => n.id === edge.source)
  const tgt = nodes.find((n) => n.id === edge.target)
  if (!src || !tgt) return null

  const dx = tgt.position.x - src.position.x
  const dy = tgt.position.y - src.position.y
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const ux = dx / len; const uy = dy / len

  const x1 = src.position.x + ux * (NODE_RADIUS + 2)
  const y1 = src.position.y + uy * (NODE_RADIUS + 2)
  const x2 = tgt.position.x - ux * (NODE_RADIUS + 8)
  const y2 = tgt.position.y - uy * (NODE_RADIUS + 8)
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2

  const isActive = selected || hovered
  const strokeColor = selected
    ? 'var(--accent)'
    : hovered
      ? 'rgba(99,102,241,0.7)'
      : focusHighlighted ? 'var(--accent)' : 'var(--border-mid)'
  const strokeWidth = selected ? 2.2 : hovered ? 1.8 : focusHighlighted ? 2 : 1.2
  const marker = selected
    ? 'url(#arrowhead-accent)'
    : hovered ? 'url(#arrowhead-accent)' : focusHighlighted ? 'url(#arrowhead-accent)' : 'url(#arrowhead)'

  // Grade badge — show when both reliability and accuracy are graded
  const rel = edge.grade.sourceReliability
  const acc = edge.grade.infoAccuracy
  const hasGrade = rel !== 'ungraded' && acc !== 'ungraded'
  const gradeCode = hasGrade ? `${rel}${acc}` : null
  const gradeColor = hasGrade ? intelGradeColor(edge.grade) : '#4B5563'

  return (
    <g style={{ opacity: dimOpacity ?? 1, transition: 'opacity 0.2s' }}>
      {/* Wide transparent hit area */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        stroke="transparent" strokeWidth={12}
        style={{ cursor: 'pointer' }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={(e) => { e.stopPropagation(); onSelect() }}
      />
      {/* Visible edge line */}
      <line
        x1={x1} y1={y1} x2={x2} y2={y2}
        style={{ stroke: strokeColor, pointerEvents: 'none', transition: 'stroke 0.15s' }}
        strokeWidth={strokeWidth}
        markerEnd={marker}
      />
      {/* Selected glow */}
      {selected && (
        <line
          x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="var(--accent)" strokeWidth={6} opacity={0.12}
          style={{ pointerEvents: 'none' }}
        />
      )}
      {/* Edge label */}
      {edge.label && (
        <text
          x={mx} y={my - (gradeCode ? 14 : 6)}
          textAnchor="middle" fontSize={9}
          style={{ fill: isActive ? 'var(--accent)' : 'var(--text-tertiary)', pointerEvents: 'none' }}
          fontFamily="var(--font-mono)"
        >{edge.label}</text>
      )}
      {/* Intel grade badge */}
      {gradeCode && (
        <g transform={`translate(${mx}, ${my})`} style={{ pointerEvents: 'none' }}>
          <rect x={-11} y={-8} width={22} height={14} rx={3}
            fill="var(--bg-surface)" stroke={gradeColor} strokeWidth={1}
            opacity={isActive ? 1 : 0.85}
          />
          <text
            textAnchor="middle" dominantBaseline="middle" y={1}
            fontSize={8.5} fontFamily="var(--font-mono)" fontWeight="700"
            fill={gradeColor}
          >{gradeCode}</text>
        </g>
      )}
    </g>
  )
}

// ── NodeCircle ────────────────────────────────────────────────────────────────

function NodeCircle({
  node, selected, hovered, isMultiSelected,
  connectingFrom, isPendingTarget,
  dimOpacity, focused, neighborOfFocus,
  onMouseDown, onMouseEnter, onMouseLeave, onClick, onContextMenu, onStartConnect,
}: {
  node: GraphNode
  selected: boolean
  hovered: boolean
  isMultiSelected: boolean
  connectingFrom: string | null
  isPendingTarget: boolean
  dimOpacity?: number
  focused?: boolean
  neighborOfFocus?: boolean
  onMouseDown: (e: React.MouseEvent) => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  onClick: (e: React.MouseEvent) => void
  onContextMenu: (e: React.MouseEvent) => void
  onStartConnect: (e: React.MouseEvent) => void
}) {
  const cfg = ENTITY_CONFIG[node.type]
  const riskColor = RISK_COLORS[node.riskFlag]
  const size = selected ? NODE_RADIUS + 4 : hovered ? NODE_RADIUS + 2 : NODE_RADIUS
  const isSource = connectingFrom === node.id

  const cursor = connectingFrom
    ? (isSource ? 'grabbing' : 'crosshair')
    : 'grab'

  return (
    <g
      transform={`translate(${node.position.x}, ${node.position.y})`}
      style={{ cursor, opacity: dimOpacity ?? 1, transition: 'opacity 0.2s' }}
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
      onContextMenu={onContextMenu}
    >
      {/* Multi-select indicator — dashed accent ring */}
      {isMultiSelected && !focused && (
        <circle
          r={size + 10} fill="var(--accent)" fillOpacity={0.06}
          stroke="var(--accent)" strokeWidth={1.5}
          strokeDasharray="5 3" opacity={0.9}
          style={{ pointerEvents: 'none' }}
        />
      )}
      {focused && (
        <circle
          r={size + 10} fill="none" stroke="var(--accent)" strokeWidth={2} opacity={0.75}
          style={{ animation: 'pulse 1.5s ease-in-out infinite' }}
        />
      )}
      {neighborOfFocus && !focused && !isMultiSelected && (
        <circle
          r={size + 7} fill="none" stroke="var(--accent)" strokeWidth={1.2}
          opacity={0.35} strokeDasharray="4 3"
        />
      )}
      {isPendingTarget && (
        <circle
          r={size + 10} fill="none" stroke="var(--accent)" strokeWidth={2} opacity={0.5}
          style={{ animation: 'pulse 0.8s ease-in-out infinite' }}
        />
      )}
      {selected && (
        <circle r={size + 6} fill="none" stroke={cfg.color} strokeWidth={1.5} opacity={0.3} />
      )}
      {node.riskFlag !== 'NONE' && (
        <circle r={size + 3} fill="none" stroke={riskColor} strokeWidth={1.5} opacity={0.6} />
      )}
      {/* Confidence indicator — outer dashed ring, only when not ungraded */}
      {(node.confidence && node.confidence !== 'ungraded') && (() => {
        const conf = CONFIDENCE_CONFIG[node.confidence]
        return (
          <circle
            r={size + 7}
            fill="none"
            stroke={conf.color}
            strokeWidth={1.2}
            strokeDasharray={conf.dash === 'none' ? undefined : conf.dash}
            opacity={selected || hovered ? 0.75 : 0.45}
            style={{ pointerEvents: 'none' }}
          />
        )
      })()}
      <circle
        r={size}
        style={{
          fill: isPendingTarget
            ? 'var(--accent-soft)'
            : selected ? cfg.color + '18'
            : hovered  ? cfg.color + '0D'
            : 'var(--bg-surface)',
          stroke: isPendingTarget ? 'var(--accent)'
            : focused   ? 'var(--accent)'
            : selected  ? cfg.color
            : isMultiSelected ? 'var(--accent)'
            : hovered   ? cfg.color + 'BB'
            : cfg.color + '66',
          strokeWidth: (isPendingTarget || selected || focused || isMultiSelected) ? 2 : 1.5,
          transition: 'all 0.12s',
        }}
      />
      <svg
        x={-8} y={-8} width={16} height={16}
        viewBox="0 0 24 24"
        fill="none"
        stroke={cfg.color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={selected ? 1 : 0.75}
        style={{ pointerEvents: 'none' }}
      >
        {ENTITY_ICON[node.type]}
      </svg>
      {node.enriching && (
        <circle r={size + 8} fill="none" stroke={cfg.color} strokeWidth={1} opacity={0.4}
          style={{ animation: 'pulse 1.5s ease-in-out infinite' }} />
      )}
      <text
        textAnchor="middle" dominantBaseline="middle"
        fontSize={9} fontFamily="var(--font-mono)"
        style={{ fill: focused ? 'var(--accent)' : selected ? cfg.color : 'var(--text-secondary)', pointerEvents: 'none', userSelect: 'none' }}
        y={size + 14}
      >
        {node.value.length > 18 ? node.value.slice(0, 16) + '…' : node.value}
      </text>
      {hovered && !connectingFrom && (
        <g
          onMouseDown={(e) => { e.stopPropagation(); onStartConnect(e) }}
          onClick={(e) => e.stopPropagation()}
          style={{ cursor: 'crosshair' }}
        >
          <circle cx={size + 5} cy={0} r={10} fill="transparent" />
          <circle
            cx={size + 5} cy={0} r={6}
            fill={cfg.color} stroke="var(--bg-surface)" strokeWidth={2}
          />
          <text
            x={size + 5} y={0.5}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={9} fontWeight="700"
            style={{ fill: '#fff', pointerEvents: 'none', userSelect: 'none' }}
          >+</text>
        </g>
      )}
    </g>
  )
}

// ── GraphCanvas ───────────────────────────────────────────────────────────────

export const GraphCanvas = forwardRef<GraphCanvasHandle, GraphCanvasProps>(
function GraphCanvas({ onAddNode, onImportCSV, searchQuery }, ref) {
  const {
    nodes, edges,
    selectedNodeId, selectedEdgeId, hoveredNodeId, focusedNodeId, multiSelectedIds,
    filters,
    setSelectedNode, setSelectedEdge, setHoveredNode, setFocusedNode,
    setMultiSelectedNodes, toggleMultiSelect, clearMultiSelect,
    updateNodePosition, moveNodes,
    addNode, addEdge, removeEdge,
    updateNodeRisk, updateNodesRisk,
    updateNodeAction, updateNodesAction,
    updateNodesConfidence,
    removeNode, removeNodes, mergeNodes,
    undoStack, redoStack, undo, redo,
  } = useGraphStore()
  const { showGrid } = useSettingsStore()

  const svgRef = useRef<SVGSVGElement>(null)

  useImperativeHandle(ref, () => ({
    exportToPNG: async (filename: string) => {
      if (svgRef.current) await exportGraphToPNG(svgRef.current, filename)
    },
    fitToView: () => {
      if (!svgRef.current || nodes.length === 0) return
      const { width, height } = svgRef.current.getBoundingClientRect()
      const minX = Math.min(...nodes.map(n => n.position.x)) - NODE_RADIUS
      const maxX = Math.max(...nodes.map(n => n.position.x)) + NODE_RADIUS
      const minY = Math.min(...nodes.map(n => n.position.y)) - NODE_RADIUS
      const maxY = Math.max(...nodes.map(n => n.position.y)) + NODE_RADIUS
      const graphW = maxX - minX + 80
      const graphH = maxY - minY + 80
      const newZoom = Math.min(width / graphW, height / graphH, 1.5)
      const cx = (minX + maxX) / 2
      const cy = (minY + maxY) / 2
      setZoom(newZoom)
      setPan({ x: width / 2 - cx * newZoom, y: height / 2 - cy * newZoom })
    },
  }))

  // ── Transform Hub ────────────────────────────────────────────────────────────
  const [transforms, setTransforms]             = useState<Transform[]>([])
  const [runningTransform, setRunningTransform] = useState<string | null>(null)
  const [toast, setToast]                       = useState<Toast | null>(null)

  useEffect(() => {
    fetchTransforms()
      .then(setTransforms)
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  // ── Search / focus / filter ──────────────────────────────────────────────────
  const matchingIds = useMemo(() => {
    const q = searchQuery?.trim().toLowerCase()
    if (!q) return null
    return new Set(
      nodes
        .filter(n => n.value.toLowerCase().includes(q) || n.type.includes(q))
        .map(n => n.id)
    )
  }, [searchQuery, nodes])

  const focusNeighborIds = useMemo(() => {
    if (!focusedNodeId) return null
    const ids = new Set<string>()
    edges.forEach(e => {
      if (e.source === focusedNodeId) ids.add(e.target)
      if (e.target === focusedNodeId) ids.add(e.source)
    })
    return ids
  }, [focusedNodeId, edges])

  const focusedNode = focusedNodeId ? nodes.find(n => n.id === focusedNodeId) : null

  const isFilteredOut = useCallback((node: GraphNode): boolean => {
    if (filters.types.length   > 0 && !filters.types.includes(node.type))        return true
    if (filters.risks.length   > 0 && !filters.risks.includes(node.riskFlag))    return true
    if (filters.actions.length > 0 && !filters.actions.includes(node.actionFlag)) return true
    if (filters.enrichedOnly && !node.enrichmentData) return true
    return false
  }, [filters])

  const nodeMap = useMemo(() => new Map(nodes.map(n => [n.id, n])), [nodes])

  const multiSelectedSet = useMemo(() => new Set(multiSelectedIds), [multiSelectedIds])

  const nodeOpacity = useCallback((node: GraphNode): number => {
    const searchDim = matchingIds !== null && !matchingIds.has(node.id)
    const focusDim  = focusedNodeId !== null && node.id !== focusedNodeId && !(focusNeighborIds?.has(node.id))
    const filterDim = isFilteredOut(node)
    if (focusDim)  return 0.06
    if (filterDim) return 0.05
    if (searchDim) return 0.12
    return 1
  }, [matchingIds, focusedNodeId, focusNeighborIds, isFilteredOut])

  const edgeOpacity = useCallback((edge: GraphEdge): number => {
    const src = nodeMap.get(edge.source)
    const tgt = nodeMap.get(edge.target)
    const searchDim = matchingIds !== null && !matchingIds.has(edge.source) && !matchingIds.has(edge.target)
    const focusDim  = focusedNodeId !== null && edge.source !== focusedNodeId && edge.target !== focusedNodeId
    const filterDim = (src && isFilteredOut(src)) || (tgt && isFilteredOut(tgt))
    if (focusDim)  return 0.05
    if (filterDim) return 0.04
    if (searchDim) return 0.08
    return 1
  }, [matchingIds, focusedNodeId, nodeMap, isFilteredOut])

  const isFocusEdge = useCallback((edge: GraphEdge): boolean => {
    return focusedNodeId !== null &&
      (edge.source === focusedNodeId || edge.target === focusedNodeId)
  }, [focusedNodeId])

  // ── Pan & zoom ───────────────────────────────────────────────────────────────
  const [pan,  setPan]  = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const isPanning   = useRef(false)
  const panStart    = useRef({ x: 0, y: 0 })
  const panOrigin   = useRef({ x: 0, y: 0 })

  const draggingId      = useRef<string | null>(null)
  const dragOffset      = useRef({ x: 0, y: 0 })
  const lastDragWorld   = useRef<{ x: number; y: number } | null>(null)

  const [connectingFrom, setConnectingFrom] = useState<string | null>(null)
  const [ghostPos,       setGhostPos]       = useState<{ x: number; y: number } | null>(null)
  const [contextMenu,    setContextMenu]    = useState<ContextMenu | null>(null)
  const [lasso,          setLasso]          = useState<Lasso | null>(null)
  const isLassoing = useRef(false)

  // Context menu — key-required transforms inline input
  const [contextApiKeys,  setContextApiKeys]  = useState<Record<string, string>>({})
  const [expandedKeySlug, setExpandedKeySlug] = useState<string | null>(null)

  // Merge modal
  const [showMerge, setShowMerge] = useState(false)

  // Batch transforms panel
  const [showBatchPanel,    setShowBatchPanel]    = useState(false)
  const [batchRunning,      setBatchRunning]       = useState(false)
  const [batchSelectedSlug, setBatchSelectedSlug] = useState<string | null>(null)
  const [batchApiKey,       setBatchApiKey]        = useState('')
  const [batchToast,        setBatchToast]         = useState<string | null>(null)

  const pendingTargetId = useMemo(() => {
    if (!connectingFrom || !ghostPos) return null
    const hit = nodes.find(
      (n) => n.id !== connectingFrom &&
        Math.sqrt((n.position.x - ghostPos.x) ** 2 + (n.position.y - ghostPos.y) ** 2) <= NODE_RADIUS + 14
    )
    return hit?.id ?? null
  }, [connectingFrom, ghostPos, nodes])

  const clientToWorld = useCallback((cx: number, cy: number) => {
    const rect = svgRef.current!.getBoundingClientRect()
    return {
      x: (cx - rect.left - pan.x) / zoom,
      y: (cy - rect.top  - pan.y) / zoom,
    }
  }, [pan, zoom])

  // Pan to focused node
  useEffect(() => {
    if (!focusedNodeId || !svgRef.current) return
    const n = nodes.find(n => n.id === focusedNodeId)
    if (!n) return
    const { width, height } = svgRef.current.getBoundingClientRect()
    setPan({
      x: width  / 2 - n.position.x * zoom,
      y: height / 2 - n.position.y * zoom,
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusedNodeId])

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const inInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement

      // Undo / redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault(); undo(); return
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault(); redo(); return
      }

      if (e.key === 'Escape') {
        if (connectingFrom) { setConnectingFrom(null); setGhostPos(null); return }
        if (multiSelectedIds.length > 0) { clearMultiSelect(); return }
        if (focusedNodeId) { setFocusedNode(null); return }
      }

      if (e.key === 'f' && selectedNodeId && !e.ctrlKey && !e.metaKey && !inInput) {
        setFocusedNode(focusedNodeId === selectedNodeId ? null : selectedNodeId)
      }

      // Delete / backspace to remove selected node(s)
      if ((e.key === 'Delete' || e.key === 'Backspace') && !inInput) {
        if (multiSelectedIds.length > 1) {
          removeNodes(multiSelectedIds)
        } else if (selectedNodeId) {
          removeNode(selectedNodeId)
          setSelectedNode(null)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [connectingFrom, focusedNodeId, selectedNodeId, multiSelectedIds, undo, redo, clearMultiSelect, setFocusedNode, removeNode, removeNodes, setSelectedNode])

  useEffect(() => {
    const close = () => setContextMenu(null)
    window.addEventListener('click', close)
    return () => window.removeEventListener('click', close)
  }, [])

  // ── Mouse handlers ────────────────────────────────────────────────────────────

  const handleSVGMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (connectingFrom) { setConnectingFrom(null); setGhostPos(null); return }
    if ((e.target as SVGElement).closest('.node-group')) return
    setContextMenu(null)

    if (e.shiftKey) {
      // Start lasso
      const world = clientToWorld(e.clientX, e.clientY)
      setLasso({ sx: world.x, sy: world.y, ex: world.x, ey: world.y })
      isLassoing.current = true
      return
    }

    // Start pan
    setSelectedNode(null)
    setSelectedEdge(null)
    setFocusedNode(null)
    clearMultiSelect()
    isPanning.current = true
    panStart.current  = { x: e.clientX, y: e.clientY }
    panOrigin.current = { ...pan }
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (connectingFrom) { setGhostPos(clientToWorld(e.clientX, e.clientY)); return }

    if (isLassoing.current) {
      const world = clientToWorld(e.clientX, e.clientY)
      setLasso(l => l ? { ...l, ex: world.x, ey: world.y } : null)
      return
    }

    if (draggingId.current) {
      const { x, y } = clientToWorld(e.clientX, e.clientY)

      if (multiSelectedSet.has(draggingId.current) && multiSelectedIds.length > 1) {
        // Move entire selection as a group
        const prev = lastDragWorld.current
        if (prev) {
          moveNodes(multiSelectedIds, x - prev.x, y - prev.y)
        }
        lastDragWorld.current = { x, y }
      } else {
        updateNodePosition(draggingId.current, x - dragOffset.current.x, y - dragOffset.current.y)
      }
      return
    }

    if (isPanning.current) {
      setPan({
        x: panOrigin.current.x + (e.clientX - panStart.current.x),
        y: panOrigin.current.y + (e.clientY - panStart.current.y),
      })
    }
  }

  const handleMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
    if (connectingFrom) {
      const world = clientToWorld(e.clientX, e.clientY)
      const target = nodes.find(
        (n) => n.id !== connectingFrom &&
          Math.sqrt((n.position.x - world.x) ** 2 + (n.position.y - world.y) ** 2) <= NODE_RADIUS + 14
      )
      if (target) addEdge(connectingFrom, target.id)
      setConnectingFrom(null)
      setGhostPos(null)
      return
    }

    if (isLassoing.current && lasso) {
      const minX = Math.min(lasso.sx, lasso.ex)
      const maxX = Math.max(lasso.sx, lasso.ex)
      const minY = Math.min(lasso.sy, lasso.ey)
      const maxY = Math.max(lasso.sy, lasso.ey)
      const inBox = nodes
        .filter(n => n.position.x >= minX && n.position.x <= maxX && n.position.y >= minY && n.position.y <= maxY)
        .map(n => n.id)
      if (inBox.length > 0) {
        setMultiSelectedNodes(inBox)
        setSelectedNode(inBox[0])
      }
      setLasso(null)
      isLassoing.current = false
      return
    }

    isPanning.current    = false
    draggingId.current   = null
    lastDragWorld.current = null
  }

  const handleMouseLeave = () => {
    if (connectingFrom) { setConnectingFrom(null); setGhostPos(null); return }
    if (isLassoing.current) { setLasso(null); isLassoing.current = false; return }
    isPanning.current    = false
    draggingId.current   = null
    lastDragWorld.current = null
  }

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault()
    setZoom((z) => Math.min(3, Math.max(0.2, z * (e.deltaY < 0 ? 1.1 : 0.9))))
  }

  const handleNodeMouseDown = (e: React.MouseEvent, node: GraphNode) => {
    e.stopPropagation()
    if (connectingFrom) return
    setContextMenu(null)
    const { x, y } = clientToWorld(e.clientX, e.clientY)
    draggingId.current    = node.id
    dragOffset.current    = { x: x - node.position.x, y: y - node.position.y }
    lastDragWorld.current = { x, y }
  }

  const handleStartConnect = useCallback((nodeId: string) => {
    setConnectingFrom(nodeId)
    const src = nodes.find((n) => n.id === nodeId)
    if (src) setGhostPos({ x: src.position.x, y: src.position.y })
  }, [nodes])

  const handleNodeContextMenu = (e: React.MouseEvent, nodeId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedNode(nodeId)
    setContextMenu({ x: e.clientX, y: e.clientY, nodeId })
  }

  const handleNodeClick = (e: React.MouseEvent, node: GraphNode) => {
    if (connectingFrom) return
    if (e.shiftKey) {
      // Add/remove from multi-select
      toggleMultiSelect(node.id)
      setSelectedNode(node.id)
    } else {
      // Single select — clear multi-select if no shift
      clearMultiSelect()
      setSelectedNode(selectedNodeId === node.id ? null : node.id)
    }
  }

  // ── Transform execution ───────────────────────────────────────────────────────
  const handleContextTransform = async (t: Transform, nodeId: string) => {
    const targetNode = nodes.find(n => n.id === nodeId)
    if (!targetNode) return
    setContextMenu(null)
    setRunningTransform(t.slug)
    try {
      const result = await runTransform(t.slug, targetNode.value)
      if (result.error) throw new Error(result.error)
      const addedCount = applyTransformResult(result, nodeId, t.name, addNode, addEdge, nodes)
      setToast({
        message: addedCount === 0
          ? `${t.name}: no new nodes`
          : `${t.name}: +${addedCount} node${addedCount !== 1 ? 's' : ''}`,
        type: 'success',
      })
    } catch (e: unknown) {
      setToast({
        message: `${t.name} failed: ${e instanceof Error ? e.message : 'Unknown error'}`,
        type: 'error',
      })
    } finally {
      setRunningTransform(null)
    }
  }

  const handleContextTransformKeyed = async (t: Transform, nodeId: string, apiKey: string) => {
    const targetNode = nodes.find(n => n.id === nodeId)
    if (!targetNode) return
    setExpandedKeySlug(null)
    setContextMenu(null)
    setRunningTransform(t.slug)
    try {
      const result = await runTransform(t.slug, targetNode.value, apiKey || undefined)
      if (result.error) throw new Error(result.error)
      const addedCount = applyTransformResult(result, nodeId, t.name, addNode, addEdge, nodes)
      setToast({
        message: addedCount === 0 ? `${t.name}: no new nodes` : `${t.name}: +${addedCount} node${addedCount !== 1 ? 's' : ''}`,
        type: 'success',
      })
    } catch (e: unknown) {
      setToast({ message: `${t.name} failed: ${e instanceof Error ? e.message : 'Unknown error'}`, type: 'error' })
    } finally {
      setRunningTransform(null)
    }
  }

  const handleBatchRun = async (t: Transform) => {
    const targetNodes = nodes.filter(n => multiSelectedIds.includes(n.id) && t.accepts.includes(n.type))
    if (targetNodes.length === 0) return
    setBatchRunning(true)
    let totalAdded = 0
    for (const targetNode of targetNodes) {
      try {
        const result = await runTransform(t.slug, targetNode.value, batchApiKey || undefined)
        if (!result.error) {
          totalAdded += applyTransformResult(result, targetNode.id, t.name, addNode, addEdge, nodes)
        }
      } catch { /* continue on per-node failure */ }
    }
    setBatchRunning(false)
    setBatchToast(`${t.name} on ${targetNodes.length} nodes → +${totalAdded} added`)
    setTimeout(() => setBatchToast(null), 3500)
    setShowBatchPanel(false)
    setBatchSelectedSlug(null)
    setBatchApiKey('')
  }

  const isEmpty     = nodes.length === 0
  const connectSrc  = connectingFrom ? nodes.find((n) => n.id === connectingFrom) : null
  const hasMultiSel = multiSelectedIds.length > 1

  const menuItemStyle: React.CSSProperties = {
    width: '100%', padding: '7px 10px', borderRadius: 'var(--r-sm)',
    display: 'flex', alignItems: 'center', gap: 8,
    color: 'var(--text-secondary)', fontSize: 12.5, textAlign: 'left', cursor: 'pointer',
    background: 'transparent',
  }

  const barBtnStyle: React.CSSProperties = {
    padding: '4px 10px', borderRadius: 'var(--r-sm)',
    fontSize: 12, fontWeight: 500, cursor: 'pointer',
    border: '1px solid var(--border-soft)',
    background: 'var(--bg-surface)',
    color: 'var(--text-secondary)',
    display: 'flex', alignItems: 'center', gap: 5,
  }

  return (
    <div style={{
      width: '100%', height: '100%', position: 'relative', overflow: 'hidden',
      background: 'var(--bg-base)',
      backgroundImage: 'radial-gradient(circle, var(--border-soft) 1.2px, transparent 1.2px)',
      backgroundSize: '24px 24px',
    }}>

      {/* Grid overlay */}
      {showGrid && (
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} aria-hidden="true">
          <defs>
            <pattern id="grid" width={40 * zoom} height={40 * zoom} patternUnits="userSpaceOnUse"
              x={pan.x % (40 * zoom)} y={pan.y % (40 * zoom)}>
              <path d={`M ${40 * zoom} 0 L 0 0 0 ${40 * zoom}`} style={{ fill: 'none', stroke: 'var(--border-subtle)', strokeWidth: '0.8' }} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      )}

      {/* Main SVG */}
      <svg
        ref={svgRef}
        style={{ width: '100%', height: '100%', cursor: connectingFrom ? 'crosshair' : isLassoing.current ? 'crosshair' : 'default' }}
        onMouseDown={handleSVGMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      >
        <defs>
          <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" style={{ fill: 'var(--border-mid)' }} />
          </marker>
          <marker id="arrowhead-accent" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" style={{ fill: 'var(--accent)' }} />
          </marker>
          <marker id="arrowhead-del" markerWidth="8" markerHeight="6" refX="8" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" style={{ fill: 'var(--red)' }} />
          </marker>
        </defs>

        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
          {edges.map((edge) => (
            <EdgeLine
              key={edge.id}
              edge={edge}
              nodes={nodes}
              selected={selectedEdgeId === edge.id}
              onSelect={() => setSelectedEdge(selectedEdgeId === edge.id ? null : edge.id)}
              dimOpacity={edgeOpacity(edge)}
              focusHighlighted={isFocusEdge(edge)}
            />
          ))}

          {connectSrc && ghostPos && (() => {
            const dx = ghostPos.x - connectSrc.position.x
            const dy = ghostPos.y - connectSrc.position.y
            const len = Math.sqrt(dx * dx + dy * dy) || 1
            const ux = dx / len; const uy = dy / len
            const x1 = connectSrc.position.x + ux * (NODE_RADIUS + 6)
            const y1 = connectSrc.position.y + uy * (NODE_RADIUS + 6)
            return (
              <line
                x1={x1} y1={y1} x2={ghostPos.x} y2={ghostPos.y}
                style={{ stroke: 'var(--accent)', strokeWidth: '1.5', strokeDasharray: '6,4', opacity: '0.8', pointerEvents: 'none' }}
                markerEnd="url(#arrowhead-accent)"
              />
            )
          })()}

          {/* Lasso rectangle */}
          {lasso && (
            <rect
              x={Math.min(lasso.sx, lasso.ex)}
              y={Math.min(lasso.sy, lasso.ey)}
              width={Math.abs(lasso.ex - lasso.sx)}
              height={Math.abs(lasso.ey - lasso.sy)}
              fill="var(--accent)"
              fillOpacity={0.05}
              stroke="var(--accent)"
              strokeWidth={1 / zoom}
              strokeDasharray={`${5 / zoom} ${3 / zoom}`}
              style={{ pointerEvents: 'none' }}
            />
          )}

          {nodes.map((node) => (
            <g key={node.id} className="node-group">
              <NodeCircle
                node={node}
                selected={selectedNodeId === node.id}
                hovered={hoveredNodeId === node.id}
                isMultiSelected={multiSelectedSet.has(node.id)}
                connectingFrom={connectingFrom}
                isPendingTarget={pendingTargetId === node.id}
                dimOpacity={nodeOpacity(node)}
                focused={focusedNodeId === node.id}
                neighborOfFocus={focusNeighborIds?.has(node.id) ?? false}
                onMouseDown={(e) => handleNodeMouseDown(e, node)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={(e) => handleNodeClick(e, node)}
                onContextMenu={(e) => handleNodeContextMenu(e, node.id)}
                onStartConnect={() => handleStartConnect(node.id)}
              />
            </g>
          ))}
        </g>
      </svg>

      {/* ── Multi-select bar ──────────────────────────────────────────────────── */}
      {hasMultiSel && (
        <div style={{
          position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--bg-raised)', border: '1px solid var(--border-soft)',
          borderRadius: 'var(--r-md)', padding: '5px 8px',
          display: 'flex', alignItems: 'center', gap: 6,
          boxShadow: '0 4px 16px rgba(0,0,0,0.10)', zIndex: 200,
          animation: 'fadeIn 0.15s ease', whiteSpace: 'nowrap',
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', paddingRight: 2 }}>
            {multiSelectedIds.length} selected
          </span>
          <div style={{ width: 1, height: 16, background: 'var(--border-soft)', margin: '0 2px' }} />
          <button
            style={barBtnStyle}
            onClick={() => updateNodesRisk(multiSelectedIds, 'HIGH')}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'var(--red)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-soft)' }}
          >Flag HIGH</button>
          <button
            style={barBtnStyle}
            onClick={() => updateNodesRisk(multiSelectedIds, 'MEDIUM')}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--amber)'; e.currentTarget.style.borderColor = 'var(--amber)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-soft)' }}
          >Flag MEDIUM</button>
          <button
            style={barBtnStyle}
            onClick={() => updateNodesAction(multiSelectedIds, 'suspect')}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
          >Suspect</button>
          <button
            style={barBtnStyle}
            onClick={() => updateNodesAction(multiSelectedIds, 'victim')}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
          >Victim</button>
          <div style={{ width: 1, height: 16, background: 'var(--border-soft)', margin: '0 2px' }} />
          <button
            style={barBtnStyle}
            onClick={() => setShowMerge(true)}
            title="Merge selected nodes into one"
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent-border)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-soft)' }}
          >
            ⊕ Merge
          </button>
          <button
            style={{ ...barBtnStyle, color: showBatchPanel ? 'var(--accent)' : 'var(--text-secondary)', borderColor: showBatchPanel ? 'var(--accent-border)' : 'var(--border-soft)', background: showBatchPanel ? 'var(--accent-soft)' : 'var(--bg-surface)' }}
            onClick={() => { setShowBatchPanel(v => !v); setBatchSelectedSlug(null) }}
            onMouseEnter={e => { if (!showBatchPanel) { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent-border)' } }}
            onMouseLeave={e => { if (!showBatchPanel) { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-soft)' } }}
          >
            <UIIcon name="arrowRight" size={11} />
            Batch run
          </button>
          <div style={{ width: 1, height: 16, background: 'var(--border-soft)', margin: '0 2px' }} />
          <button
            style={{ ...barBtnStyle, color: 'var(--red)', borderColor: 'transparent' }}
            onClick={() => removeNodes(multiSelectedIds)}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--red-soft)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-surface)' }}
          >
            <UIIcon name="close" size={11} />
            Delete {multiSelectedIds.length}
          </button>
          <button
            style={{ ...barBtnStyle, borderColor: 'transparent', background: 'transparent', color: 'var(--text-tertiary)', padding: '4px 6px' }}
            onClick={clearMultiSelect}
            title="Clear selection (Esc)"
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)' }}
          >✕</button>
        </div>
      )}

      {/* ── Batch transforms panel ─────────────────────────────────────────────── */}
      {hasMultiSel && showBatchPanel && (() => {
        const selectedTypes = [...new Set(multiSelectedIds.map(id => nodes.find(n => n.id === id)?.type).filter(Boolean) as string[])]
        const batchTransforms = transforms.filter(t => t.accepts.some(a => selectedTypes.includes(a)))
        const selectedTransform = batchTransforms.find(t => t.slug === batchSelectedSlug)
        return (
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute', top: 52, left: '50%', transform: 'translateX(-50%)',
              background: 'var(--bg-raised)', border: '1px solid var(--border-soft)',
              borderRadius: 'var(--r-md)', padding: 10, minWidth: 280,
              boxShadow: '0 4px 16px rgba(0,0,0,0.12)', zIndex: 200,
              animation: 'fadeIn 0.12s ease',
            }}
          >
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>
              Batch transform — {multiSelectedIds.length} nodes
            </div>
            {batchTransforms.length === 0 ? (
              <p style={{ fontSize: 11.5, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No transforms match selected node types.</p>
            ) : (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginBottom: 8 }}>
                  {batchTransforms.map(t => {
                    const eligible = nodes.filter(n => multiSelectedIds.includes(n.id) && t.accepts.includes(n.type)).length
                    return (
                      <button
                        key={t.slug}
                        onClick={() => setBatchSelectedSlug(batchSelectedSlug === t.slug ? null : t.slug)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          padding: '6px 9px', borderRadius: 'var(--r-sm)', textAlign: 'left', cursor: 'pointer',
                          background: batchSelectedSlug === t.slug ? 'var(--accent-soft)' : 'var(--bg-base)',
                          border: `1px solid ${batchSelectedSlug === t.slug ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
                          color: batchSelectedSlug === t.slug ? 'var(--accent)' : 'var(--text-secondary)',
                        }}
                      >
                        <span style={{ fontSize: 12, fontWeight: 500 }}>{t.name}</span>
                        <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', opacity: 0.7 }}>
                          {t.requires_key ? '🔑 ' : ''}{eligible} node{eligible !== 1 ? 's' : ''}
                        </span>
                      </button>
                    )
                  })}
                </div>
                {selectedTransform?.requires_key && (
                  <input
                    type="password"
                    value={batchApiKey}
                    onChange={e => setBatchApiKey(e.target.value)}
                    placeholder={`${selectedTransform.name} API key…`}
                    style={{
                      width: '100%', padding: '6px 9px', marginBottom: 8,
                      background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
                      borderRadius: 'var(--r-sm)', color: 'var(--text-primary)',
                      fontSize: 11.5, fontFamily: 'var(--font-mono)', outline: 'none',
                    }}
                  />
                )}
                <button
                  disabled={!batchSelectedSlug || batchRunning}
                  onClick={() => selectedTransform && handleBatchRun(selectedTransform)}
                  style={{
                    width: '100%', padding: '8px 0', borderRadius: 'var(--r-sm)',
                    background: (!batchSelectedSlug || batchRunning) ? 'var(--bg-overlay)' : 'var(--accent)',
                    color: (!batchSelectedSlug || batchRunning) ? 'var(--text-tertiary)' : '#fff',
                    fontSize: 12, fontWeight: 600, cursor: (!batchSelectedSlug || batchRunning) ? 'not-allowed' : 'pointer',
                    border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  {batchRunning ? (
                    <>
                      <div style={{ width: 11, height: 11, borderRadius: '50%', border: '2px solid var(--text-tertiary)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
                      Running…
                    </>
                  ) : batchSelectedSlug ? `Run on ${nodes.filter(n => multiSelectedIds.includes(n.id) && selectedTransform?.accepts.includes(n.type)).length} nodes` : 'Select a transform'}
                </button>
              </>
            )}
          </div>
        )
      })()}

      {/* ── Batch toast ────────────────────────────────────────────────────────── */}
      {batchToast && (
        <div style={{
          position: 'absolute', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--green-soft)', border: '1px solid var(--green-border)',
          borderRadius: 'var(--r-md)', padding: '8px 16px',
          color: 'var(--green)', fontSize: 12, fontWeight: 500,
          boxShadow: '0 2px 10px rgba(0,0,0,0.18)', zIndex: 250,
          animation: 'fadeIn 0.15s ease', whiteSpace: 'nowrap',
        }}>
          ✓ {batchToast}
        </div>
      )}

      {/* ── Focus mode banner ─────────────────────────────────────────────────── */}
      {focusedNode && (
        <div style={{
          position: 'absolute', bottom: 20, left: 14,
          background: 'var(--bg-surface)', border: '1px solid var(--accent-border)',
          borderRadius: 'var(--r-md)', padding: '6px 10px 6px 12px',
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 12, color: 'var(--accent)', fontWeight: 500,
          boxShadow: 'var(--shadow-sm)', animation: 'fadeIn 0.15s ease',
          zIndex: 10, maxWidth: 340,
        }}>
          <UIIcon name="crosshair" size={13} style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {focusedNode.value.length > 32 ? focusedNode.value.slice(0, 30) + '…' : focusedNode.value}
          </span>
          <span style={{ color: 'var(--text-tertiary)', fontSize: 11, flexShrink: 0 }}>
            {focusNeighborIds?.size ?? 0} neighbour{focusNeighborIds?.size !== 1 ? 's' : ''}
          </span>
          <button
            onClick={() => setFocusedNode(null)}
            style={{ color: 'var(--text-tertiary)', display: 'flex', padding: 2, cursor: 'pointer', flexShrink: 0, borderRadius: 'var(--r-xs)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)' }}
            title="Exit focus (Esc)"
          >
            <UIIcon name="close" size={11} />
          </button>
        </div>
      )}

      {/* Connecting hint */}
      {connectingFrom && (
        <div style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--bg-surface)', border: '1px solid var(--accent-border)',
          borderRadius: 'var(--r-md)', padding: '6px 14px',
          fontSize: 12, color: 'var(--accent)', fontWeight: 500,
          boxShadow: 'var(--shadow-sm)', pointerEvents: 'none',
          animation: 'fadeIn 0.15s ease',
        }}>
          Click a node to connect · Esc to cancel
        </div>
      )}

      {/* Lasso hint */}
      {lasso && !connectingFrom && (
        <div style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--bg-surface)', border: '1px solid var(--accent-border)',
          borderRadius: 'var(--r-md)', padding: '6px 14px',
          fontSize: 12, color: 'var(--accent)', fontWeight: 500,
          boxShadow: 'var(--shadow-sm)', pointerEvents: 'none',
          animation: 'fadeIn 0.15s ease',
        }}>
          Release to select
        </div>
      )}

      {/* Transform running indicator */}
      {runningTransform && (
        <div style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--bg-surface)', border: '1px solid var(--accent-border)',
          borderRadius: 'var(--r-md)', padding: '6px 14px',
          display: 'flex', alignItems: 'center', gap: 8,
          fontSize: 12, color: 'var(--accent)', fontWeight: 500,
          boxShadow: 'var(--shadow-sm)', pointerEvents: 'none',
          animation: 'fadeIn 0.15s ease',
        }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
          Running transform…
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <div style={{
          position: 'absolute', bottom: 20, right: 60,
          background: 'var(--bg-surface)',
          border: `1px solid ${toast.type === 'success' ? 'var(--green-border)' : 'var(--red-border)'}`,
          borderRadius: 'var(--r-md)', padding: '7px 14px',
          fontSize: 12,
          color: toast.type === 'success' ? 'var(--green)' : 'var(--red)',
          fontWeight: 500, boxShadow: 'var(--shadow-sm)',
          animation: 'fadeIn 0.15s ease', pointerEvents: 'none',
          maxWidth: 280,
        }}>
          {toast.message}
        </div>
      )}

      {/* Empty state */}
      {isEmpty && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          pointerEvents: 'none', animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'var(--bg-surface)', border: '1px dashed var(--border-mid)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-tertiary)', marginBottom: 14,
          }}>
            <UIIcon name="node" size={24} />
          </div>
          <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6 }}>
            Graph is empty
          </p>
          <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginBottom: 20, textAlign: 'center', lineHeight: 1.6 }}>
            Add your first entity or import a<br />list of known indicators
          </p>
          <div style={{ display: 'flex', gap: 8, pointerEvents: 'all' }}>
            <button
              onClick={onAddNode}
              style={{
                padding: '8px 16px', borderRadius: 'var(--r-md)',
                background: 'var(--accent)', color: 'var(--bg-base)',
                fontSize: 13, fontWeight: 500, cursor: 'pointer',
                border: 'none', display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <UIIcon name="plus" size={14} />
              Add first node
            </button>
            <button
              onClick={onImportCSV}
              style={{
                padding: '8px 14px', borderRadius: 'var(--r-md)',
                background: 'var(--bg-raised)', color: 'var(--text-secondary)',
                fontSize: 13, cursor: 'pointer', border: '1px solid var(--border-soft)',
              }}
            >
              Import CSV
            </button>
          </div>
        </div>
      )}

      {/* ── Controls: undo/redo + zoom ────────────────────────────────────────── */}
      <div style={{ position: 'absolute', bottom: 20, right: 20, display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Undo / redo */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 2 }}>
          {[
            { title: '⟲ Undo (⌘Z)',  disabled: undoStack.length === 0, action: undo,  label: '⟲' },
            { title: '⟳ Redo (⌘⇧Z)', disabled: redoStack.length === 0, action: redo, label: '⟳' },
          ].map(({ title, disabled, action, label }) => (
            <button
              key={label}
              onClick={action}
              disabled={disabled}
              title={title}
              style={{
                flex: 1, height: 32, borderRadius: 'var(--r-sm)',
                background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
                color: disabled ? 'var(--text-disabled)' : 'var(--text-secondary)',
                fontSize: 16, cursor: disabled ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                opacity: disabled ? 0.45 : 1,
              }}
              onMouseEnter={e => { if (!disabled) e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.color = disabled ? 'var(--text-disabled)' : 'var(--text-secondary)' }}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Zoom */}
        {[
          { label: '+', title: 'Zoom in',  action: () => setZoom((z) => Math.min(3, z * 1.2)) },
          { label: '⊙', title: 'Reset',   action: () => { setZoom(1); setPan({ x: 0, y: 0 }) } },
          { label: '−', title: 'Zoom out', action: () => setZoom((z) => Math.max(0.2, z * 0.8)) },
        ].map(({ label, title, action }) => (
          <button
            key={label}
            onClick={action}
            title={title}
            style={{
              width: 32, height: 32, borderRadius: 'var(--r-sm)',
              background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
              color: 'var(--text-secondary)', fontSize: 16, cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)' }}
          >
            {label}
          </button>
        ))}
        <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textAlign: 'center', fontFamily: 'var(--font-mono)', marginTop: 2 }}>
          {Math.round(zoom * 100)}%
        </div>
      </div>

      {/* ── Context menu ─────────────────────────────────────────────────────── */}
      {contextMenu && (() => {
        const menuNode = nodes.find(n => n.id === contextMenu.nodeId)
        const nodeTransforms = menuNode
          ? transforms.filter(t => t.accepts.includes(menuNode.type) && !t.requires_key)
          : []
        const keyedTransforms = menuNode
          ? transforms.filter(t => t.accepts.includes(menuNode.type) && t.requires_key)
          : []

        return (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'fixed', left: contextMenu.x, top: contextMenu.y,
              background: 'var(--bg-raised)', border: '1px solid var(--border-soft)',
              borderRadius: 'var(--r-md)', padding: 4, minWidth: 200,
              boxShadow: '0 4px 16px rgba(0,0,0,0.10), 0 2px 6px rgba(0,0,0,0.07)', zIndex: 300,
              animation: 'fadeIn 0.1s ease',
            }}
          >
            <button
              onClick={() => {
                const isFocused = focusedNodeId === contextMenu.nodeId
                setFocusedNode(isFocused ? null : contextMenu.nodeId)
                setSelectedNode(contextMenu.nodeId)
                setContextMenu(null)
              }}
              style={{
                ...menuItemStyle,
                color: focusedNodeId === contextMenu.nodeId ? 'var(--accent)' : 'var(--text-secondary)',
                background: focusedNodeId === contextMenu.nodeId ? 'var(--accent-soft)' : 'transparent',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = focusedNodeId === contextMenu.nodeId ? 'var(--accent-soft)' : 'transparent'
                e.currentTarget.style.color = focusedNodeId === contextMenu.nodeId ? 'var(--accent)' : 'var(--text-secondary)'
              }}
            >
              <UIIcon name="crosshair" size={13} />
              {focusedNodeId === contextMenu.nodeId ? 'Exit focus' : 'Focus node'}
            </button>

            {[
              { label: 'Connect from here', icon: 'node',   action: () => { handleStartConnect(contextMenu.nodeId); setContextMenu(null) } },
              { label: 'Flag — HIGH',       icon: 'filter', action: () => { updateNodeRisk(contextMenu.nodeId, 'HIGH');   setContextMenu(null) } },
              { label: 'Flag — MEDIUM',     icon: 'filter', action: () => { updateNodeRisk(contextMenu.nodeId, 'MEDIUM'); setContextMenu(null) } },
              { label: 'Mark suspect',      icon: 'sort',   action: () => { updateNodeAction(contextMenu.nodeId, 'suspect'); setContextMenu(null) } },
              { label: 'Mark victim',       icon: 'sort',   action: () => { updateNodeAction(contextMenu.nodeId, 'victim');  setContextMenu(null) } },
            ].map(({ label, icon, action }) => (
              <button
                key={label} onClick={action}
                style={menuItemStyle}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
              >
                <UIIcon name={icon} size={13} />
                {label}
              </button>
            ))}

            {(nodeTransforms.length > 0 || keyedTransforms.length > 0) && (
              <>
                <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />
                <div style={{ fontSize: 9.5, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '4px 10px 2px' }}>
                  Transforms
                </div>
                {nodeTransforms.map((t) => (
                  <button
                    key={t.slug}
                    onClick={() => handleContextTransform(t, contextMenu.nodeId)}
                    style={menuItemStyle}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                  >
                    <UIIcon name="arrowRight" size={13} />
                    {t.name}
                  </button>
                ))}
                {keyedTransforms.map((t) => (
                  <div key={t.slug}>
                    <button
                      onClick={() => setExpandedKeySlug(expandedKeySlug === t.slug ? null : t.slug)}
                      style={{ ...menuItemStyle, justifyContent: 'space-between' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <UIIcon name="arrowRight" size={13} />
                        {t.name}
                      </span>
                      <span style={{ fontSize: 9, opacity: 0.55, fontFamily: 'var(--font-mono)' }}>key</span>
                    </button>
                    {expandedKeySlug === t.slug && (
                      <div style={{ padding: '4px 10px 6px', display: 'flex', gap: 5 }} onClick={(e) => e.stopPropagation()}>
                        <input
                          autoFocus
                          type="password"
                          value={contextApiKeys[t.slug] ?? ''}
                          onChange={(e) => setContextApiKeys(prev => ({ ...prev, [t.slug]: e.target.value }))}
                          placeholder="API key…"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleContextTransformKeyed(t, contextMenu.nodeId, contextApiKeys[t.slug] ?? '')
                          }}
                          style={{
                            flex: 1, padding: '5px 8px', fontSize: 11, fontFamily: 'var(--font-mono)',
                            background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
                            borderRadius: 'var(--r-xs)', color: 'var(--text-primary)', outline: 'none',
                          }}
                        />
                        <button
                          onClick={() => handleContextTransformKeyed(t, contextMenu.nodeId, contextApiKeys[t.slug] ?? '')}
                          style={{
                            padding: '5px 9px', borderRadius: 'var(--r-xs)', fontSize: 11, fontWeight: 600,
                            background: 'var(--accent)', color: 'var(--bg-base)', cursor: 'pointer', border: 'none', flexShrink: 0,
                          }}
                        >
                          Run
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </>
            )}

            <div style={{ borderTop: '1px solid var(--border-subtle)', margin: '4px 0' }} />
            <button
              onClick={() => { removeNode(contextMenu.nodeId); setContextMenu(null) }}
              style={{ ...menuItemStyle, color: 'var(--red)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--red-soft)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
            >
              <UIIcon name="close" size={13} />
              Remove node
            </button>
          </div>
        )
      })()}

      {/* ── Merge modal ───────────────────────────────────────────────────────── */}
      {showMerge && multiSelectedIds.length >= 2 && (
        <MergeModal
          nodes={nodes.filter(n => multiSelectedIds.includes(n.id))}
          onConfirm={(primaryId, secondaryIds, primaryValue) => {
            mergeNodes(primaryId, secondaryIds, primaryValue)
          }}
          onClose={() => setShowMerge(false)}
        />
      )}
    </div>
  )
})
