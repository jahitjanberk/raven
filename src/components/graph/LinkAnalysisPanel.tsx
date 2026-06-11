import { useState, useMemo } from 'react'
import { useGraphStore } from '../../store/graphStore'
import { ENTITY_CONFIG } from '../../types/graph'
import { UIIcon } from '../../icons/UIIcon'

interface LinkAnalysisPanelProps {
  onClose: () => void
}

// ── Graph algorithms ──────────────────────────────────────────────────────────

function buildAdj(nodeIds: string[], edges: { source: string; target: string }[]): Map<string, string[]> {
  const adj = new Map<string, string[]>()
  for (const id of nodeIds) adj.set(id, [])
  for (const e of edges) {
    adj.get(e.source)?.push(e.target)
    adj.get(e.target)?.push(e.source)   // undirected traversal
  }
  return adj
}

function bfsPath(adj: Map<string, string[]>, srcId: string, tgtId: string): string[] | null {
  if (srcId === tgtId) return [srcId]
  const visited = new Set([srcId])
  const parent  = new Map<string, string>()
  const queue   = [srcId]

  while (queue.length > 0) {
    const cur = queue.shift()!
    for (const nb of adj.get(cur) ?? []) {
      if (visited.has(nb)) continue
      visited.add(nb)
      parent.set(nb, cur)
      if (nb === tgtId) {
        const path: string[] = []
        let n: string | undefined = tgtId
        while (n !== undefined) { path.unshift(n); n = parent.get(n) }
        return path
      }
      queue.push(nb)
    }
  }
  return null
}

function degreeCentrality(nodeIds: string[], edges: { source: string; target: string }[]): Map<string, number> {
  const deg = new Map<string, number>()
  for (const id of nodeIds) deg.set(id, 0)
  for (const e of edges) {
    deg.set(e.source, (deg.get(e.source) ?? 0) + 1)
    deg.set(e.target, (deg.get(e.target) ?? 0) + 1)
  }
  return deg
}

function betweennessCentrality(nodeIds: string[], adj: Map<string, string[]>): Map<string, number> {
  const bc = new Map<string, number>()
  for (const id of nodeIds) bc.set(id, 0)

  for (const s of nodeIds) {
    const stack: string[] = []
    const pred  = new Map<string, string[]>(nodeIds.map(v => [v, []]))
    const sigma = new Map<string, number>(nodeIds.map(v => [v, v === s ? 1 : 0]))
    const dist  = new Map<string, number>(nodeIds.map(v => [v, v === s ? 0 : -1]))
    const queue = [s]

    while (queue.length > 0) {
      const v = queue.shift()!
      stack.push(v)
      for (const w of adj.get(v) ?? []) {
        if (dist.get(w) === -1) {
          queue.push(w)
          dist.set(w, (dist.get(v) ?? 0) + 1)
        }
        if (dist.get(w) === (dist.get(v) ?? 0) + 1) {
          sigma.set(w, (sigma.get(w) ?? 0) + (sigma.get(v) ?? 0))
          pred.get(w)!.push(v)
        }
      }
    }

    const delta = new Map<string, number>(nodeIds.map(v => [v, 0]))
    while (stack.length > 0) {
      const w = stack.pop()!
      for (const v of pred.get(w) ?? []) {
        const d = ((sigma.get(v) ?? 0) / (sigma.get(w) ?? 1)) * (1 + (delta.get(w) ?? 0))
        delta.set(v, (delta.get(v) ?? 0) + d)
      }
      if (w !== s) bc.set(w, (bc.get(w) ?? 0) + (delta.get(w) ?? 0))
    }
  }

  // Normalise by max (simpler than standard formula for display)
  const max = Math.max(...bc.values(), 1)
  for (const [id, val] of bc) bc.set(id, val / max)

  return bc
}

// ─────────────────────────────────────────────────────────────────────────────

type Tab = 'path' | 'centrality'

export function LinkAnalysisPanel({ onClose }: LinkAnalysisPanelProps) {
  const {
    nodes, edges, selectedNodeId,
    setSelectedNode, setFocusedNode, setMultiSelectedNodes,
  } = useGraphStore()

  const [tab,      setTab]      = useState<Tab>('path')
  const [srcId,    setSrcId]    = useState<string | null>(null)
  const [tgtId,    setTgtId]    = useState<string | null>(null)
  const [path,     setPath]     = useState<string[] | null>(null)
  const [noPath,   setNoPath]   = useState(false)
  const [picking,  setPicking]  = useState<'src' | 'tgt' | null>(null)

  const nodeIds = useMemo(() => nodes.map(n => n.id), [nodes])
  const adj     = useMemo(() => buildAdj(nodeIds, edges), [nodeIds, edges])

  // Respond to canvas node selection when picking
  useMemo(() => {
    if (!picking || !selectedNodeId) return
    if (picking === 'src') { setSrcId(selectedNodeId); setPicking(null) }
    else                   { setTgtId(selectedNodeId); setPicking(null) }
  }, [selectedNodeId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleFindPath = () => {
    if (!srcId || !tgtId) return
    setNoPath(false)
    const found = bfsPath(adj, srcId, tgtId)
    setPath(found)
    setNoPath(!found)
    if (found) {
      setMultiSelectedNodes(found)
      setSelectedNode(found[found.length - 1])
    }
  }

  // Centrality — computed on demand when tab switches
  const centrality = useMemo(() => {
    if (tab !== 'centrality' || nodes.length === 0) return null
    const deg = degreeCentrality(nodeIds, edges)
    const btw = betweennessCentrality(nodeIds, adj)
    return { deg, btw }
  }, [tab, nodes.length, nodeIds, edges, adj])

  const topByDegree = useMemo(() => {
    if (!centrality) return []
    return [...nodes]
      .sort((a, b) => (centrality.deg.get(b.id) ?? 0) - (centrality.deg.get(a.id) ?? 0))
      .slice(0, 10)
  }, [centrality, nodes])

  const topByBtw = useMemo(() => {
    if (!centrality) return []
    return [...nodes]
      .sort((a, b) => (centrality.btw.get(b.id) ?? 0) - (centrality.btw.get(a.id) ?? 0))
      .slice(0, 10)
  }, [centrality, nodes])

  const nodeLabel = (id: string | null) => {
    if (!id) return null
    const n = nodes.find(n => n.id === id)
    if (!n) return null
    return { value: n.value, type: n.type, color: ENTITY_CONFIG[n.type]?.color ?? '#888' }
  }

  const srcInfo = nodeLabel(srcId)
  const tgtInfo = nodeLabel(tgtId)

  const selectorStyle = (active: boolean, picking2: boolean): React.CSSProperties => ({
    flex: 1, padding: '7px 10px', borderRadius: 'var(--r-sm)',
    border: picking2 ? '1px solid var(--accent)' : '1px solid var(--border-soft)',
    background: picking2 ? 'var(--accent-soft)' : 'var(--bg-raised)',
    cursor: 'pointer', fontSize: 11.5, textAlign: 'left',
    color: active ? 'var(--text-primary)' : 'var(--text-tertiary)',
    display: 'flex', alignItems: 'center', gap: 6,
    animation: picking2 ? 'pulse 1s ease-in-out infinite' : 'none',
  })

  const barW = (score: number) => `${Math.round(score * 100)}%`

  return (
    <div
      style={{
        position: 'absolute', top: 14, right: 14,
        width: 310, background: 'var(--bg-surface)',
        border: '1px solid var(--border-soft)', borderRadius: 'var(--r-xl)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
        animation: 'fadeIn var(--dur-normal) var(--ease-out-quart) both', zIndex: 100,
        display: 'flex', flexDirection: 'column', maxHeight: 'calc(100vh - 110px)',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '12px 14px 0', gap: 8 }}>
        <UIIcon name="path" size={14} style={{ color: 'var(--accent)' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>Link Analysis</span>
        <button onClick={onClose} style={{ color: 'var(--text-tertiary)', cursor: 'pointer', padding: 4, borderRadius: 'var(--r-xs)', display: 'flex' }}>
          <UIIcon name="close" size={13} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, padding: '10px 14px 0' }}>
        {(['path', 'centrality'] as Tab[]).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1, padding: '5px 0', borderRadius: 'var(--r-sm)',
              fontSize: 11.5, fontWeight: 500, cursor: 'pointer',
              background: tab === t ? 'var(--accent)' : 'transparent',
              color: tab === t ? '#fff' : 'var(--text-tertiary)',
              border: 'none',
            }}
          >
            {t === 'path' ? 'Path Finder' : 'Centrality'}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 14px 14px' }}>

        {/* ── Path Finder tab ──────────────────────────────────────────────── */}
        {tab === 'path' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <p style={{ fontSize: 11.5, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
              Find the shortest connection between two entities. Click "Pick" then select a node on the graph.
            </p>

            {/* Source picker */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Source</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  style={selectorStyle(!!srcInfo, picking === 'src')}
                  onClick={() => setPicking(picking === 'src' ? null : 'src')}
                >
                  {srcInfo
                    ? <><span style={{ width: 7, height: 7, borderRadius: '50%', background: srcInfo.color, flexShrink: 0 }} />{srcInfo.value.length > 22 ? srcInfo.value.slice(0, 20) + '…' : srcInfo.value}</>
                    : picking === 'src' ? <><span style={{ width: 7, height: 7, borderRadius: '50%', border: '1.5px solid var(--accent)', flexShrink: 0, animation: 'pulse 1s ease-in-out infinite' }} />Click a node…</> : 'Pick source node'
                  }
                </button>
                {srcId && (
                  <button onClick={() => { setSrcId(null); setPath(null); setNoPath(false) }}
                    style={{ padding: '0 6px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: 12 }}>
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Target picker */}
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Target</div>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  style={selectorStyle(!!tgtInfo, picking === 'tgt')}
                  onClick={() => setPicking(picking === 'tgt' ? null : 'tgt')}
                >
                  {tgtInfo
                    ? <><span style={{ width: 7, height: 7, borderRadius: '50%', background: tgtInfo.color, flexShrink: 0 }} />{tgtInfo.value.length > 22 ? tgtInfo.value.slice(0, 20) + '…' : tgtInfo.value}</>
                    : picking === 'tgt' ? <><span style={{ width: 7, height: 7, borderRadius: '50%', border: '1.5px solid var(--accent)', flexShrink: 0, animation: 'pulse 1s ease-in-out infinite' }} />Click a node…</> : 'Pick target node'
                  }
                </button>
                {tgtId && (
                  <button onClick={() => { setTgtId(null); setPath(null); setNoPath(false) }}
                    style={{ padding: '0 6px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: 12 }}>
                    ✕
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={handleFindPath}
              disabled={!srcId || !tgtId}
              style={{
                padding: '8px', borderRadius: 'var(--r-md)',
                background: srcId && tgtId ? 'var(--accent)' : 'var(--bg-raised)',
                color: srcId && tgtId ? '#fff' : 'var(--text-muted)',
                border: 'none', fontSize: 13, fontWeight: 500,
                cursor: srcId && tgtId ? 'pointer' : 'default',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <UIIcon name="path" size={13} />
              Find Shortest Path
            </button>

            {noPath && (
              <div style={{ padding: '10px', background: 'var(--red-soft)', borderRadius: 'var(--r-md)', border: '1px solid var(--red-border)', fontSize: 12, color: 'var(--red)', textAlign: 'center' }}>
                No path found between these nodes.
              </div>
            )}

            {path && path.length > 0 && (
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                  Path — {path.length} hop{path.length !== 1 ? 's' : ''}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {path.map((nodeId, i) => {
                    const n = nodes.find(n => n.id === nodeId)
                    if (!n) return null
                    const cfg = ENTITY_CONFIG[n.type]
                    return (
                      <div key={nodeId}>
                        <button
                          onClick={() => { setSelectedNode(n.id); setFocusedNode(null) }}
                          style={{
                            width: '100%', textAlign: 'left', padding: '5px 8px',
                            borderRadius: 'var(--r-sm)', cursor: 'pointer',
                            background: selectedNodeId === n.id ? 'var(--accent-soft)' : 'var(--bg-raised)',
                            border: `1px solid ${selectedNodeId === n.id ? 'var(--accent-border)' : 'transparent'}`,
                            display: 'flex', alignItems: 'center', gap: 7,
                          }}
                          onMouseEnter={e => { if (selectedNodeId !== n.id) e.currentTarget.style.background = 'var(--bg-hover)' }}
                          onMouseLeave={e => { if (selectedNodeId !== n.id) e.currentTarget.style.background = 'var(--bg-raised)' }}
                        >
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg?.color ?? '#888', flexShrink: 0 }} />
                          <span style={{ flex: 1, fontSize: 11.5, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.value}</span>
                          <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{cfg?.label}</span>
                        </button>
                        {i < path.length - 1 && (
                          <div style={{ paddingLeft: 12, color: 'var(--text-muted)', fontSize: 10 }}>↓</div>
                        )}
                      </div>
                    )
                  })}
                </div>
                <p style={{ fontSize: 10.5, color: 'var(--text-tertiary)', marginTop: 8, textAlign: 'center' }}>
                  Path nodes are highlighted on the graph
                </p>
              </div>
            )}
          </div>
        )}

        {/* ── Centrality tab ───────────────────────────────────────────────── */}
        {tab === 'centrality' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {nodes.length < 2 ? (
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', paddingTop: 20 }}>
                Add at least two connected nodes to calculate centrality.
              </p>
            ) : (
              <>
                {/* Degree centrality */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                    Degree — Most connected
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {topByDegree.map(node => {
                      const deg  = centrality?.deg.get(node.id) ?? 0
                      const maxD = centrality?.deg.get(topByDegree[0]?.id ?? '') ?? 1
                      const cfg  = ENTITY_CONFIG[node.type]
                      return (
                        <button
                          key={node.id}
                          onClick={() => { setSelectedNode(node.id); setFocusedNode(null) }}
                          style={{ width: '100%', textAlign: 'left', padding: '5px 6px', borderRadius: 'var(--r-sm)', cursor: 'pointer', background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', gap: 3 }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg?.color ?? '#888', flexShrink: 0 }} />
                            <span style={{ flex: 1, fontSize: 11.5, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.value}</span>
                            <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', flexShrink: 0 }}>{deg}</span>
                          </div>
                          <div style={{ height: 3, background: 'var(--bg-raised)', borderRadius: 2 }}>
                            <div style={{ height: '100%', width: barW(maxD > 0 ? deg / maxD : 0), background: cfg?.color ?? 'var(--accent)', borderRadius: 2, transition: 'width 0.3s' }} />
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Betweenness centrality */}
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>
                    Betweenness — Bridge nodes
                  </div>
                  <p style={{ fontSize: 10.5, color: 'var(--text-tertiary)', marginBottom: 8, lineHeight: 1.5 }}>
                    Nodes that appear on the most shortest paths — removing these would fragment the graph most.
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {topByBtw.filter(n => (centrality?.btw.get(n.id) ?? 0) > 0).slice(0, 8).map(node => {
                      const score = centrality?.btw.get(node.id) ?? 0
                      const cfg   = ENTITY_CONFIG[node.type]
                      return (
                        <button
                          key={node.id}
                          onClick={() => { setSelectedNode(node.id); setFocusedNode(null) }}
                          style={{ width: '100%', textAlign: 'left', padding: '5px 6px', borderRadius: 'var(--r-sm)', cursor: 'pointer', background: 'transparent', border: 'none', display: 'flex', flexDirection: 'column', gap: 3 }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-hover)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg?.color ?? '#888', flexShrink: 0 }} />
                            <span style={{ flex: 1, fontSize: 11.5, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{node.value}</span>
                            <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', flexShrink: 0 }}>{(score * 100).toFixed(0)}%</span>
                          </div>
                          <div style={{ height: 3, background: 'var(--bg-raised)', borderRadius: 2 }}>
                            <div style={{ height: '100%', width: barW(score), background: 'var(--purple, #7c3aed)', borderRadius: 2, transition: 'width 0.3s' }} />
                          </div>
                        </button>
                      )
                    })}
                    {topByBtw.filter(n => (centrality?.btw.get(n.id) ?? 0) > 0).length === 0 && (
                      <p style={{ fontSize: 11.5, color: 'var(--text-tertiary)', textAlign: 'center', padding: '8px 0' }}>
                        No bridge nodes — graph may not be fully connected.
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
