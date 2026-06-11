import { useState, useEffect, useMemo, useRef, useCallback } from 'react'
import { GraphCanvas } from '../components/graph/GraphCanvas'
import { MapView } from '../components/map/MapView'
import type { GraphCanvasHandle } from '../components/graph/GraphCanvas'
import { GraphSidebar } from '../components/graph/GraphSidebar'
import { EntityPanel } from '../components/graph/EntityPanel'
import { AddNodeModal } from '../components/graph/AddNodeModal'
import { CSVImportModal } from '../components/graph/CSVImportModal'
import { FilterPanel } from '../components/graph/FilterPanel'
import { HistoryPanel } from '../components/graph/HistoryPanel'
import { ShortcutsModal } from '../components/ui/ShortcutsModal'
import { ReportModal } from '../components/graph/ReportModal'
import { EdgePanel } from '../components/graph/EdgePanel'
import { TimelinePanel } from '../components/graph/TimelinePanel'
import { LinkAnalysisPanel } from '../components/graph/LinkAnalysisPanel'
import { useProjectStore } from '../store/projectStore'
import { UIIcon } from '../icons/UIIcon'
import { useGraphStore } from '../store/graphStore'
import { saveGraphApi } from '../api/graphs'
import type { EntityType, RiskFlag } from '../types/graph'
import { RISK_COLORS, ENTITY_CONFIG } from '../types/graph'
import { LayoutPicker } from '../components/graph/LayoutPicker'
import { runLayout, type LayoutAlgorithm } from '../lib/layout'
import { WatchlistPanel } from '../components/watch/WatchlistPanel'
import { TemplatePicker } from '../components/graph/TemplatePicker'
import { RavenIcon } from '../components/RavenLogo'
import { useWatchStore } from '../store/watchStore'
import { checkDueWatches } from '../lib/watchRunner'
import type { CaseTemplate } from '../data/caseTemplates'

interface GraphPageProps {
  projectId?: string
  projectName?: string
  caseRef?: string
  classification?: string
  riskLevel?: string
  status?: string
  onBack?: () => void
  onOpenSettings?: () => void
}

export function GraphPage({
  projectId,
  projectName = 'Operation Glasshouse',
  caseRef = 'NFIB-2026-0441',
  classification = 'OFFICIAL-SENSITIVE',
  riskLevel = 'HIGH',
  status = 'active',
  onBack,
  onOpenSettings,
}: GraphPageProps) {
  const [viewMode, setViewMode] = useState<'graph' | 'map'>('graph')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const [showAddNode, setShowAddNode] = useState(false)
  const [showCSVImport, setShowCSVImport] = useState(false)
  const [showFilter, setShowFilter] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showShortcuts,    setShowShortcuts]    = useState(false)
  const [showReport,       setShowReport]       = useState(false)
  const [showTimeline,     setShowTimeline]     = useState(false)
  const [showLinkAnalysis, setShowLinkAnalysis] = useState(false)
  const [showLayoutPicker, setShowLayoutPicker] = useState(false)
  const [activeLayout, setActiveLayout] = useState<LayoutAlgorithm | null>(null)
  const [layoutRunning, setLayoutRunning]   = useState(false)
  const [showWatchlist, setShowWatchlist]   = useState(false)
  const [showTemplatePicker, setShowTemplatePicker] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [exporting, setExporting] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const canvasRef = useRef<GraphCanvasHandle>(null)
  const { addNode, nodes, edges, selectedNodeId, selectedEdgeId, filters, saveState, setSaveState } = useGraphStore()
  const watchUnread = useWatchStore(s => s.unreadCount())
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeFilterCount =
    filters.types.length + filters.risks.length +
    filters.actions.length + (filters.enrichedOnly ? 1 : 0)

  const matchCount = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return nodes.length
    return nodes.filter(n => n.value.toLowerCase().includes(q) || n.type.includes(q)).length
  }, [searchQuery, nodes])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === '?' && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        setShowShortcuts(v => !v)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Auto-save graph: localStorage immediately via graphStore subscriber; backend debounced 2s
  useEffect(() => {
    if (!projectId) return
    const unsubscribe = useGraphStore.subscribe((state, prev) => {
      // Only trigger when graph data actually changes (not UI selection/hover state)
      if (
        state.nodes === prev.nodes &&
        state.edges === prev.edges &&
        state.caseNotes === prev.caseNotes
      ) return

      setSaveState('saving')
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(async () => {
        const { nodes: n, edges: e, caseNotes } = useGraphStore.getState()
        // Always write to localStorage cache
        useProjectStore.getState().saveGraph(projectId, n, e, caseNotes)
        // Write to backend; update indicator
        try {
          await saveGraphApi(projectId, n, e, caseNotes)
          useGraphStore.getState().setSaveState('saved')
        } catch {
          useGraphStore.getState().setSaveState('offline')
        }
      }, 2000)
    })
    return () => {
      unsubscribe()
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [projectId, setSaveState])

  const handleAddNode = (type: EntityType, value: string, note?: string, metadata?: Record<string, string>) => {
    addNode(type, value, note, metadata)
  }

  const handleExport = async () => {
    if (exporting || !canvasRef.current || nodes.length === 0) return
    setExporting(true)
    try {
      const slug = projectName.replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-').toLowerCase()
      await canvasRef.current.exportToPNG(slug)
    } finally {
      setExporting(false)
    }
  }

  const handleLayout = useCallback((algo: LayoutAlgorithm) => {
    const { nodes: currentNodes, edges: currentEdges, pushUndoSnapshot, batchSetPositions } = useGraphStore.getState()
    if (currentNodes.length === 0) return

    setActiveLayout(algo)
    setLayoutRunning(true)

    // Push undo before mutating positions
    pushUndoSnapshot()

    const W = typeof window !== 'undefined' ? window.innerWidth : 1400
    const H = typeof window !== 'undefined' ? window.innerHeight - 76 : 900

    const layoutNodes = currentNodes.map(n => ({
      id: n.id,
      x: n.position.x,
      y: n.position.y,
      type: n.type,
    }))
    const layoutEdges = currentEdges.map(e => ({ source: e.source, target: e.target }))

    // Run layout (synchronous computation)
    const targets = runLayout(algo, layoutNodes, layoutEdges, undefined, W / 2, H / 2)
    const targetMap = new Map(targets.map(t => [t.id, { x: t.x, y: t.y }]))

    // Start positions from current store state
    const startMap = new Map(currentNodes.map(n => [n.id, { ...n.position }]))

    const DURATION = 550
    const start = performance.now()

    function easeInOut(t: number) {
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t
    }

    function frame(now: number) {
      const elapsed = now - start
      const raw = Math.min(elapsed / DURATION, 1)
      const t = easeInOut(raw)

      const positions = currentNodes.map(n => {
        const s = startMap.get(n.id) ?? n.position
        const tgt = targetMap.get(n.id) ?? n.position
        return {
          id: n.id,
          x: s.x + (tgt.x - s.x) * t,
          y: s.y + (tgt.y - s.y) * t,
        }
      })
      batchSetPositions(positions)

      if (raw < 1) {
        requestAnimationFrame(frame)
      } else {
        setLayoutRunning(false)
        setShowLayoutPicker(false)
        canvasRef.current?.fitToView()
      }
    }

    requestAnimationFrame(frame)
  }, [])

  // Watch scheduler — check due watches every 5 min while the tab is open
  useEffect(() => {
    checkDueWatches()
    const id = setInterval(checkDueWatches, 5 * 60 * 1000)
    return () => clearInterval(id)
  }, [])

  const handleApplyTemplate = useCallback((template: CaseTemplate) => {
    const { addNode: storeAddNode, addEdge } = useGraphStore.getState()
    const cx = window.innerWidth  / 2
    const cy = (window.innerHeight - 76) / 2

    // Map localId → real graph node id
    const idMap = new Map<string, string>()
    for (const tn of template.nodes) {
      const node = storeAddNode(
        tn.type,
        tn.value,
        tn.note,
        undefined,
        undefined,
        undefined,
      )
      idMap.set(tn.localId, node.id)
      // Position relative to canvas centre
      useGraphStore.getState().updateNodePosition(
        node.id,
        cx + tn.posOffset.x,
        cy + tn.posOffset.y,
      )
      // Set risk / action after creation
      if (tn.riskFlag !== 'NONE') useGraphStore.getState().updateNodeRisk(node.id, tn.riskFlag)
      if (tn.actionFlag !== 'unknown') useGraphStore.getState().updateNodeAction(node.id, tn.actionFlag)
    }
    for (const te of template.edges) {
      const src = idMap.get(te.from)
      const tgt = idMap.get(te.to)
      if (src && tgt) addEdge(src, tgt, te.label)
    }
    setShowTemplatePicker(false)
  }, [])

  const handleToggleSearch = () => {
    if (searchOpen) {
      setSearchOpen(false)
      setSearchQuery('')
    } else {
      setSearchOpen(true)
      setTimeout(() => searchInputRef.current?.focus(), 50)
    }
  }

  const threatLabel =
    riskLevel === 'HIGH' && status === 'active' ? 'ACTIVE THREAT' :
    riskLevel === 'MEDIUM' && status === 'active' ? 'MONITORING' :
    status === 'paused' ? 'PAUSED' :
    status === 'closed' ? 'CLOSED' : 'ACTIVE'

  const threatColor =
    riskLevel === 'HIGH' && status === 'active' ? '#E05252' :
    riskLevel === 'MEDIUM' ? '#C98A2E' :
    status !== 'active' ? 'var(--text-tertiary)' : 'var(--green)'

  const riskCounts = nodes.reduce((acc, n) => {
    if (n.riskFlag !== 'NONE') acc[n.riskFlag] = (acc[n.riskFlag] ?? 0) + 1
    return acc
  }, {} as Partial<Record<RiskFlag, number>>)

  const entityCounts = nodes.reduce((acc, n) => {
    acc[n.type] = (acc[n.type] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const floatingPanelStyle: React.CSSProperties = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border-soft)',
    borderRadius: 'var(--r-xl)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
    padding: '12px 14px',
    minWidth: 170,
  }

  return (
    <div style={{ height: '100vh', position: 'relative', overflow: 'hidden', background: 'var(--bg-base)' }}>

      {/* ── Canvas / Map — fills entire viewport ── */}
      <div style={{ position: 'absolute', inset: 0, display: viewMode === 'graph' ? 'block' : 'none' }}>
        <GraphCanvas
          ref={canvasRef}
          onAddNode={() => setShowAddNode(true)}
          onImportCSV={() => setShowCSVImport(true)}
          searchQuery={searchQuery}
        />
      </div>
      {viewMode === 'map' && (
        <div style={{ position: 'absolute', inset: 0, top: 76 }}>
          <MapView />
        </div>
      )}

      {/* ── Floating header ── */}
      <header style={{
        position: 'absolute', top: 14, left: 14, right: 14, height: 48, zIndex: 50,
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 14px',
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-soft)',
        borderRadius: 14,
        boxShadow: '0 4px 20px rgba(0,0,0,0.14)',
      }}>
        {/* Brand icon */}
        <RavenIcon size={22} style={{ flexShrink: 0, opacity: 0.85 }} />

        <div style={{ width: 1, height: 20, background: 'var(--border-subtle)', flexShrink: 0 }} />

        {/* Back to projects */}
        <button
          onClick={onBack}
          title="All projects"
          style={{
            width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 'var(--r-sm)', border: '1px solid var(--border-subtle)',
            background: 'var(--bg-raised)', color: 'var(--text-tertiary)', cursor: 'pointer', flexShrink: 0,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent-border)' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
        >
          <UIIcon name="grid" size={13} />
        </button>

        {/* Project name */}
        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
          {projectName}
        </span>

        {/* Threat badge */}
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '2px 8px', borderRadius: 'var(--r-xs)',
          background: threatColor + '1A', border: `1px solid ${threatColor}44`,
          color: threatColor, fontSize: 9.5, fontWeight: 700,
          fontFamily: 'var(--font-mono)', letterSpacing: '0.07em', whiteSpace: 'nowrap',
        }}>
          ● {threatLabel}
        </span>

        <div style={{ flex: 1 }} />

        {/* Toolbar — icon only */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {[
            { icon: 'search',         label: 'Search nodes (Ctrl+F)', action: handleToggleSearch,           accent: searchOpen,  gradient: false, disabled: false,                  badge: 0 },
            { icon: 'uploadFilled',   label: 'Import CSV',            action: () => setShowCSVImport(true), accent: false,       gradient: false, disabled: false,                  badge: 0 },
            { icon: 'downloadFilled', label: exporting ? 'Exporting…' : 'Export PNG', action: handleExport, accent: false,      gradient: false, disabled: exporting || nodes.length === 0, badge: 0 },
            { icon: 'report',         label: 'Report & Export',       action: () => setShowReport(v => !v),          accent: showReport,       gradient: false, disabled: nodes.length === 0, badge: 0 },
            { icon: 'map',            label: 'Map view',              action: () => setViewMode(v => v === 'map' ? 'graph' : 'map'), accent: viewMode === 'map', gradient: false, disabled: nodes.filter(n => n.type === 'location').length === 0, badge: 0 },
            { icon: 'timeline',       label: 'Timeline',              action: () => setShowTimeline(v => !v),        accent: showTimeline,     gradient: false, disabled: nodes.length === 0, badge: 0 },
            { icon: 'path',           label: 'Link Analysis',         action: () => setShowLinkAnalysis(v => !v),    accent: showLinkAnalysis, gradient: false, disabled: nodes.length < 2, badge: 0 },
            { icon: 'sort',           label: 'Auto Layout',           action: () => setShowLayoutPicker(v => !v), accent: showLayoutPicker || layoutRunning, gradient: false, disabled: nodes.length < 2, badge: 0 },
            { icon: 'clock',          label: 'History',               action: () => setShowHistory(v => !v), accent: showHistory, gradient: false, disabled: false,                badge: 0 },
            { icon: 'filter',         label: 'Filter',                action: () => setShowFilter(v => !v),  accent: showFilter || activeFilterCount > 0, gradient: false, disabled: false, badge: activeFilterCount },
            { icon: 'template',       label: 'Case Templates',         action: () => setShowTemplatePicker(v => !v), accent: showTemplatePicker, gradient: false, disabled: false, badge: 0 },
            { icon: 'bell',           label: 'Watchlist',              action: () => setShowWatchlist(v => !v), accent: showWatchlist, gradient: false, disabled: false, badge: watchUnread },
            { icon: 'help',           label: 'Shortcuts (?)',          action: () => setShowShortcuts(v => !v), accent: false, gradient: false, disabled: false, badge: 0 },
          ].map(({ icon, label, action, accent, gradient, disabled, badge }) => (
            <div key={label} style={{ position: 'relative' }}>
              <button
                onClick={disabled ? undefined : action}
                title={label}
                disabled={disabled}
                style={{
                  width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  borderRadius: 'var(--r-sm)',
                  background: gradient ? 'var(--accent-gradient)' : accent ? 'var(--accent)' : 'transparent',
                  color: disabled ? 'var(--text-muted)' : accent ? '#fff' : 'var(--text-tertiary)',
                  cursor: disabled ? 'default' : 'pointer', border: 'none',
                  opacity: disabled ? 0.5 : 1,
                  transition: 'filter 0.12s ease',
                }}
                onMouseEnter={(e) => {
                  if (gradient && !disabled) { e.currentTarget.style.filter = 'brightness(1.15)'; return }
                  if (!accent && !disabled) { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-raised)' }
                }}
                onMouseLeave={(e) => {
                  if (gradient && !disabled) { e.currentTarget.style.filter = ''; return }
                  if (!accent && !disabled) { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'transparent' }
                }}
              >
                <UIIcon name={icon} size={14} />
              </button>
              {badge > 0 && (
                <span style={{
                  position: 'absolute', top: 3, right: 3,
                  width: 8, height: 8, borderRadius: '50%',
                  background: 'var(--accent)', border: '1.5px solid var(--bg-surface)',
                  pointerEvents: 'none',
                }} />
              )}
            </div>
          ))}
        </div>

        {/* Save state indicator */}
        {projectId && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '3px 8px', borderRadius: 'var(--r-sm)',
            background: 'var(--bg-base)', border: '1px solid var(--border-subtle)',
          }}>
            {saveState === 'saving' ? (
              <>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--amber)', flexShrink: 0, animation: 'pulse 1s ease-in-out infinite' }} />
                <span style={{ fontSize: 10.5, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>Saving…</span>
              </>
            ) : saveState === 'offline' ? (
              <>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--red)', flexShrink: 0 }} />
                <span style={{ fontSize: 10.5, color: 'var(--red)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>Offline</span>
              </>
            ) : (
              <>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
                <span style={{ fontSize: 10.5, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>Saved</span>
              </>
            )}
          </div>
        )}

      </header>

      {/* ── Floating left sidebar ── */}
      <div style={{
        position: 'absolute', left: 14, top: 76, bottom: 14,
        display: 'flex', alignItems: 'center', zIndex: 30,
      }}>
        <GraphSidebar
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed((v) => !v)}
          onAddNode={() => setShowAddNode(true)}
          caseName={projectName}
          caseRef={caseRef}
          classification={classification}
          onOpenSettings={onOpenSettings}
        />
      </div>

      {/* ── Right floating panels ── */}
      <div style={{
        position: 'absolute', top: 76, right: 14, zIndex: 10,
        display: 'flex', flexDirection: 'column', gap: 8,
      }}>

        {/* Risk flags */}
        {!selectedNodeId && nodes.length > 0 && !showFilter && (
          <div style={floatingPanelStyle}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
              Risk Flags
            </div>
            {([
              { flag: 'HIGH' as RiskFlag,   label: 'High',   color: RISK_COLORS.HIGH   },
              { flag: 'MEDIUM' as RiskFlag, label: 'Medium', color: RISK_COLORS.MEDIUM },
              { flag: 'LOW' as RiskFlag,    label: 'Low',    color: RISK_COLORS.LOW    },
            ]).map(({ flag, label, color }) => (
              <div key={flag} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
                <span style={{ color, fontSize: 11 }}>●</span>
                <span style={{ flex: 1, fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: riskCounts[flag] ? 'var(--text-primary)' : 'var(--text-tertiary)', fontWeight: 600 }}>
                  {riskCounts[flag] ?? 0}
                </span>
              </div>
            ))}
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', flexShrink: 0 }} />
              <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Audit log active</span>
            </div>
          </div>
        )}

        {/* Entity types */}
        {!selectedNodeId && nodes.length > 0 && !showFilter && (
          <div style={floatingPanelStyle}>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
              Entity Types
            </div>
            {Object.entries(ENTITY_CONFIG).map(([type, cfg]) => {
              const count = entityCounts[type]
              if (!count) return null
              return (
                <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '3px 0' }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                  <span style={{ flex: 1, fontSize: 12, color: 'var(--text-secondary)' }}>{cfg.label}</span>
                  <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>{count}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Canvas-area overlays (positioned below floating header) ── */}
      {/* pointerEvents none so the transparent area never blocks canvas interaction */}
      <div style={{ position: 'absolute', top: 76, left: 0, right: 0, bottom: 0, overflow: 'hidden', zIndex: 20, pointerEvents: 'none' }}>

        {showHistory && (
          <div style={{ pointerEvents: 'all' }}>
            <HistoryPanel onClose={() => setShowHistory(false)} />
          </div>
        )}
        {showFilter && (
          <div style={{ pointerEvents: 'all' }}>
            <FilterPanel onClose={() => setShowFilter(false)} />
          </div>
        )}

        {/* Floating search bar */}
        {searchOpen && (
          <div style={{
            pointerEvents: 'all',
            position: 'absolute', top: 14, left: '50%', transform: 'translateX(-50%)',
            zIndex: 20, background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
            borderRadius: 'var(--r-md)', padding: '6px 10px',
            display: 'flex', alignItems: 'center', gap: 8,
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            minWidth: 300, animation: 'fadeIn 0.12s ease',
          }}>
            <UIIcon name="search" size={13} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
            <input
              ref={searchInputRef}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Escape') { setSearchOpen(false); setSearchQuery('') }
              }}
              placeholder="Search nodes by value or type…"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: 'var(--text-primary)', fontSize: 12.5,
              }}
            />
            {searchQuery.trim() && (
              <span style={{
                fontSize: 11, color: matchCount > 0 ? 'var(--text-tertiary)' : 'var(--red)',
                fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap', flexShrink: 0,
              }}>
                {matchCount} of {nodes.length}
              </span>
            )}
            <button
              onClick={() => { setSearchOpen(false); setSearchQuery('') }}
              style={{ color: 'var(--text-tertiary)', display: 'flex', padding: 2, cursor: 'pointer', flexShrink: 0 }}
              onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)' }}
            >
              <UIIcon name="close" size={12} />
            </button>
          </div>
        )}

        {/* Empty search state */}
        {searchOpen && searchQuery.trim() && matchCount === 0 && (
          <div style={{
            position: 'absolute', inset: 0, zIndex: 8,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none',
          }}>
            <div style={{
              pointerEvents: 'all', textAlign: 'center',
              background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
              borderRadius: 'var(--r-lg)', padding: '28px 32px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
              animation: 'fadeUp 0.15s ease',
            }}>
              <UIIcon name="search" size={28} style={{ color: 'var(--text-muted)', display: 'block', margin: '0 auto 14px' }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                No nodes match&nbsp;
                <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
                  "{searchQuery.length > 24 ? searchQuery.slice(0, 22) + '…' : searchQuery}"
                </span>
              </p>
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 18, lineHeight: 1.6 }}>
                Try a shorter term, or search by entity type<br />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>ip · domain · email · person · org · phone · wallet · url</span>
              </p>
              <button
                onClick={() => { setSearchQuery(''); searchInputRef.current?.focus() }}
                style={{
                  padding: '7px 16px', borderRadius: 'var(--r-md)',
                  background: 'var(--bg-raised)', border: '1px solid var(--border-soft)',
                  fontSize: 12.5, color: 'var(--text-secondary)', cursor: 'pointer',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-overlay)' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-raised)' }}
              >
                Clear search
              </button>
            </div>
          </div>
        )}

        {/* Entity panel */}
        {selectedNodeId && (
          <div style={{ pointerEvents: 'all' }}>
            <EntityPanel onViewMap={() => setViewMode('map')} />
          </div>
        )}

        {/* Edge panel */}
        {selectedEdgeId && !selectedNodeId && (
          <div style={{ pointerEvents: 'all' }}>
            <EdgePanel />
          </div>
        )}

        {/* Watchlist panel */}
        {showWatchlist && !selectedNodeId && !selectedEdgeId && (
          <div style={{ pointerEvents: 'all' }}>
            <WatchlistPanel onClose={() => setShowWatchlist(false)} />
          </div>
        )}

        {/* Timeline panel */}
        {showTimeline && (
          <div style={{ pointerEvents: 'all' }}>
            <TimelinePanel onClose={() => setShowTimeline(false)} />
          </div>
        )}

        {/* Link analysis panel */}
        {showLinkAnalysis && (
          <div style={{ pointerEvents: 'all' }}>
            <LinkAnalysisPanel onClose={() => setShowLinkAnalysis(false)} />
          </div>
        )}
      </div>

      {/* ── Modals ── */}
      {showAddNode && (
        <AddNodeModal
          onClose={() => setShowAddNode(false)}
          onAdd={handleAddNode}
        />
      )}
      {showCSVImport && (
        <CSVImportModal onClose={() => setShowCSVImport(false)} />
      )}
      {showShortcuts && <ShortcutsModal onClose={() => setShowShortcuts(false)} />}
      {showTemplatePicker && (
        <TemplatePicker
          hasExistingNodes={nodes.length > 0}
          onApply={handleApplyTemplate}
          onClose={() => setShowTemplatePicker(false)}
        />
      )}
      {showLayoutPicker && (
        <LayoutPicker
          active={activeLayout}
          running={layoutRunning}
          onSelect={handleLayout}
          onClose={() => setShowLayoutPicker(false)}
        />
      )}
      {showReport && (
        <ReportModal
          projectName={projectName}
          caseRef={caseRef}
          classification={classification}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  )
}
