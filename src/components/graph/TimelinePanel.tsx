import { useState, useRef, useCallback, useMemo } from 'react'
import { useGraphStore } from '../../store/graphStore'
import { ENTITY_CONFIG } from '../../types/graph'
import { UIIcon } from '../../icons/UIIcon'

interface TimelinePanelProps {
  onClose: () => void
}

const PANEL_H    = 190
const TRACK_Y    = 90   // Y of the axis line within the SVG
const DOT_R      = 7
const MIN_W      = 900
const NODE_PITCH = 80   // minimum px between two consecutive dots

function fmtShort(iso: string) {
  const d = new Date(iso)
  const mo = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]
  return `${d.getDate()} ${mo}`
}
function fmtTime(iso: string) {
  const d = new Date(iso)
  const h = String(d.getHours()).padStart(2,'0')
  const m = String(d.getMinutes()).padStart(2,'0')
  return `${h}:${m}`
}

export function TimelinePanel({ onClose }: TimelinePanelProps) {
  const { nodes, selectedNodeId, setSelectedNode, setFocusedNode } = useGraphStore()
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const sorted = useMemo(
    () => [...nodes].filter(n => n.addedAt).sort((a, b) => new Date(a.addedAt!).getTime() - new Date(b.addedAt!).getTime()),
    [nodes]
  )

  // Cluster nodes added within 500ms of each other so they spread vertically
  const clusters = useMemo(() => {
    const result: { time: number; items: typeof sorted }[] = []
    for (const node of sorted) {
      const t = new Date(node.addedAt!).getTime()
      const last = result[result.length - 1]
      if (last && t - last.time < 500) {
        last.items.push(node)
      } else {
        result.push({ time: t, items: [node] })
      }
    }
    return result
  }, [sorted])

  const totalNodes = sorted.length
  const svgW = Math.max(MIN_W, clusters.length * NODE_PITCH + 120)
  const PAD_L = 60; const PAD_R = 60

  // Map cluster index → X position
  const clusterX = useCallback((i: number): number => {
    if (clusters.length <= 1) return svgW / 2
    return PAD_L + (i / (clusters.length - 1)) * (svgW - PAD_L - PAD_R)
  }, [clusters.length, svgW])

  // Axis ticks — pick 5–8 evenly spaced clusters
  const tickIndices = useMemo(() => {
    if (clusters.length === 0) return []
    const step = Math.max(1, Math.floor(clusters.length / 6))
    const ticks: number[] = []
    for (let i = 0; i < clusters.length; i += step) ticks.push(i)
    if (ticks[ticks.length - 1] !== clusters.length - 1) ticks.push(clusters.length - 1)
    return ticks
  }, [clusters])

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(nodeId)
    setFocusedNode(null)
  }

  if (nodes.length === 0) {
    return (
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: PANEL_H,
        background: 'var(--bg-surface)', borderTop: '1px solid var(--border-soft)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'slideUp var(--dur-slow) var(--ease-out-expo) both',
      }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, marginBottom: 4 }}>No nodes to display</p>
          <p style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>Add nodes to the graph to see a timeline.</p>
        </div>
        <button onClick={onClose} style={{ position: 'absolute', top: 10, right: 12, color: 'var(--text-tertiary)', cursor: 'pointer', padding: 4 }}>
          <UIIcon name="close" size={13} />
        </button>
      </div>
    )
  }

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0, right: 0, height: PANEL_H,
      background: 'var(--bg-surface)', borderTop: '1px solid var(--border-soft)',
      boxShadow: '0 -4px 20px rgba(0,0,0,0.18)',
      animation: 'slideUp var(--dur-slow) var(--ease-out-expo) both',
      display: 'flex', flexDirection: 'column',
      zIndex: 50,
    }}>
      {/* Header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px',
        borderBottom: '1px solid var(--border-subtle)', flexShrink: 0,
      }}>
        <UIIcon name="timeline" size={13} style={{ color: 'var(--accent)' }} />
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Investigation Timeline</span>
        <span style={{ fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
          {totalNodes} node{totalNodes !== 1 ? 's' : ''}
          {clusters.length < totalNodes ? ` · ${clusters.length} time points` : ''}
        </span>
        <div style={{ flex: 1 }} />
        <button
          onClick={onClose}
          style={{ color: 'var(--text-tertiary)', cursor: 'pointer', padding: 4, borderRadius: 'var(--r-xs)', display: 'flex' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)' }}
        >
          <UIIcon name="close" size={13} />
        </button>
      </div>

      {/* Scrollable SVG */}
      <div ref={scrollRef} style={{ flex: 1, overflowX: 'auto', overflowY: 'hidden' }}>
        <svg
          width={svgW}
          height={PANEL_H - 38}
          style={{ display: 'block' }}
        >
          {/* Axis line */}
          <line
            x1={PAD_L - 10} y1={TRACK_Y} x2={svgW - PAD_R + 10} y2={TRACK_Y}
            stroke="var(--border-mid)" strokeWidth={1.5}
          />

          {/* Axis ticks + date labels */}
          {tickIndices.map(i => {
            const x = clusterX(i)
            const c = clusters[i]
            return (
              <g key={i}>
                <line x1={x} y1={TRACK_Y - 4} x2={x} y2={TRACK_Y + 4} stroke="var(--border-mid)" strokeWidth={1.2} />
                <text x={x} y={TRACK_Y + 16} textAnchor="middle" fontSize={9} fill="var(--text-tertiary)" fontFamily="var(--font-mono)">
                  {fmtShort(new Date(c.time).toISOString())}
                </text>
                <text x={x} y={TRACK_Y + 26} textAnchor="middle" fontSize={8.5} fill="var(--text-muted)" fontFamily="var(--font-mono)">
                  {fmtTime(new Date(c.time).toISOString())}
                </text>
              </g>
            )
          })}

          {/* Node dots */}
          {clusters.map((cluster, ci) => {
            const x = clusterX(ci)
            const count = cluster.items.length
            return cluster.items.map((node, ni) => {
              const cfg    = ENTITY_CONFIG[node.type]
              const color  = cfg?.color ?? '#888'
              const isSelected = selectedNodeId === node.id
              const isHovered  = hoveredId === node.id

              // Alternating up/down + spread within cluster
              const side   = (ci % 2 === 0) ? -1 : 1
              const spread = (ni - (count - 1) / 2) * (DOT_R * 2.4)
              const cx = x + spread
              const cy = TRACK_Y - side * 38

              const r = isSelected ? DOT_R + 2 : isHovered ? DOT_R + 1 : DOT_R

              return (
                <g
                  key={node.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleNodeClick(node.id)}
                  onMouseEnter={() => setHoveredId(node.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  {/* Stem */}
                  <line
                    x1={cx} y1={TRACK_Y - side * 2}
                    x2={cx} y2={cy + side * r}
                    stroke={isSelected ? color : 'var(--border-mid)'}
                    strokeWidth={isSelected ? 1.5 : 1}
                    strokeDasharray={isSelected ? '' : '3 2'}
                  />

                  {/* Selection ring */}
                  {isSelected && (
                    <circle cx={cx} cy={cy} r={r + 5} fill="none" stroke={color} strokeWidth={1.5} opacity={0.3} />
                  )}

                  {/* Dot */}
                  <circle
                    cx={cx} cy={cy} r={r}
                    fill={isSelected ? color : isHovered ? color + 'CC' : color + '88'}
                    stroke={color}
                    strokeWidth={1.5}
                  />

                  {/* Label (show on hover or selected) */}
                  {(isHovered || isSelected) && (
                    <text
                      x={cx} y={cy - side * (r + 7)}
                      textAnchor="middle" fontSize={9}
                      fill={isSelected ? color : 'var(--text-secondary)'}
                      fontFamily="var(--font-mono)"
                      style={{ pointerEvents: 'none' }}
                    >
                      {node.value.length > 14 ? node.value.slice(0, 12) + '…' : node.value}
                    </text>
                  )}
                </g>
              )
            })
          })}
        </svg>
      </div>

      {/* Hover detail bar */}
      {hoveredId && (() => {
        const node = nodes.find(n => n.id === hoveredId)
        if (!node) return null
        const cfg = ENTITY_CONFIG[node.type]
        return (
          <div style={{
            position: 'absolute', bottom: PANEL_H + 4, left: '50%', transform: 'translateX(-50%)',
            background: 'var(--bg-raised)', border: '1px solid var(--border-soft)',
            borderRadius: 'var(--r-md)', padding: '5px 12px',
            display: 'flex', alignItems: 'center', gap: 8,
            fontSize: 11.5, color: 'var(--text-secondary)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.25)', pointerEvents: 'none',
            animation: 'fadeIn var(--dur-fast) var(--ease-out-quart) both', zIndex: 60,
          }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: cfg?.color, flexShrink: 0 }} />
            <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{node.value}</span>
            <span style={{ color: 'var(--text-tertiary)' }}>{cfg?.label}</span>
            {node.addedAt && <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', fontSize: 10.5 }}>{fmtShort(node.addedAt)} {fmtTime(node.addedAt)}</span>}
            {node.addedBy && <span style={{ color: 'var(--text-tertiary)' }}>· {node.addedBy}</span>}
          </div>
        )
      })()}
    </div>
  )
}
