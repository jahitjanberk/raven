import React, { useState } from 'react'
import { useGraphStore } from '../../store/graphStore'
import { ENTITY_CONFIG, RISK_COLORS } from '../../types/graph'
import type { HistoryEvent } from '../../store/graphStore'
import { UIIcon } from '../../icons/UIIcon'

type Tab = 'timeline' | 'log'

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  const h = Math.floor(m / 60)
  const d = Math.floor(h / 24)
  if (d > 0)  return `${d}d ago`
  if (h > 0)  return `${h}h ago`
  if (m > 0)  return `${m}m ago`
  return 'just now'
}

function dateLabel(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString())     return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

const EVENT_ICONS: Record<string, string> = {
  'node:add':    'plus',
  'node:remove': 'close',
  'node:risk':   'filter',
  'node:action': 'sort',
  'node:note':   'list',
  'node:enrich': 'search',
  'edge:add':    'arrowRight',
  'edge:remove': 'close',
  'graph:load':  'grid',
}

const EVENT_COLORS: Record<string, string> = {
  'node:add':    'var(--green)',
  'node:remove': 'var(--red)',
  'node:risk':   'var(--amber)',
  'node:action': 'var(--purple)',
  'node:note':   'var(--text-tertiary)',
  'node:enrich': 'var(--accent)',
  'edge:add':    'var(--accent)',
  'edge:remove': 'var(--red)',
  'graph:load':  'var(--text-tertiary)',
}

interface HistoryPanelProps {
  onClose: () => void
}

export function HistoryPanel({ onClose }: HistoryPanelProps) {
  const { nodes, history, clearHistory, setSelectedNode } = useGraphStore()
  const [tab, setTab] = useState<Tab>('timeline')

  const sortedNodes = [...nodes].sort((a, b) =>
    new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()
  )

  // Group log events by date
  const groupedLog = [...history].reverse().reduce<{ label: string; events: HistoryEvent[] }[]>((acc, evt) => {
    const label = dateLabel(evt.timestamp)
    const existing = acc.find(g => g.label === label)
    if (existing) existing.events.push(evt)
    else acc.push({ label, events: [evt] })
    return acc
  }, [])

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: 'absolute', top: 0, left: 0, bottom: 0,
        width: 276, zIndex: 20,
        display: 'flex', flexDirection: 'column',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        borderRight: '1px solid var(--glass-border)',
        boxShadow: '12px 0 40px rgba(0,0,0,0.08)',
        animation: 'slideInLeft var(--dur-slow) var(--ease-out-expo) both',
      }}
    >
      {/* Header */}
      <div style={{
        padding: '14px 14px 0',
        borderBottom: '1px solid var(--border-subtle)',
        flexShrink: 0,
        background: 'var(--glass-inner)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            {tab === 'timeline' ? 'Timeline' : 'Audit log'}
          </span>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            {tab === 'log' && history.length > 0 && (
              <button
                onClick={clearHistory}
                style={{ fontSize: 11, color: 'var(--text-tertiary)', cursor: 'pointer', padding: '2px 6px', borderRadius: 'var(--r-xs)', border: '1px solid var(--border-subtle)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'var(--red-border)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              style={{ color: 'var(--text-tertiary)', display: 'flex', padding: 2, cursor: 'pointer', borderRadius: 'var(--r-xs)' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)' }}
            >
              <UIIcon name="close" size={13} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0 }}>
          {(['timeline', 'log'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                flex: 1, padding: '6px 0', fontSize: 11.5, fontWeight: tab === t ? 600 : 400,
                color: tab === t ? 'var(--accent)' : 'var(--text-tertiary)',
                borderBottom: `2px solid ${tab === t ? 'var(--accent)' : 'transparent'}`,
                cursor: 'pointer', textTransform: 'capitalize',
                transition: 'all 0.12s',
              }}
              onMouseEnter={(e) => { if (tab !== t) e.currentTarget.style.color = 'var(--text-secondary)' }}
              onMouseLeave={(e) => { if (tab !== t) e.currentTarget.style.color = 'var(--text-tertiary)' }}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 14px' }}>

        {/* ── Timeline tab ── */}
        {tab === 'timeline' && (
          <>
            {sortedNodes.length === 0 ? (
              <Empty label="No entities added yet" />
            ) : (
              <>
                <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 14 }}>
                  {sortedNodes.length} {sortedNodes.length === 1 ? 'entity' : 'entities'} · oldest first
                </div>
                <div style={{ position: 'relative' }}>
                  {/* Vertical track */}
                  <div style={{
                    position: 'absolute', left: 10, top: 6, bottom: 6,
                    width: 1, background: 'var(--border-subtle)',
                  }} />

                  {sortedNodes.map((node, i) => {
                    const cfg = ENTITY_CONFIG[node.type]
                    const isLast = i === sortedNodes.length - 1
                    return (
                      <div
                        key={node.id}
                        style={{ display: 'flex', gap: 14, marginBottom: isLast ? 0 : 16, position: 'relative' }}
                      >
                        {/* Node dot on track */}
                        <div style={{
                          width: 21, flexShrink: 0, display: 'flex', justifyContent: 'center',
                        }}>
                          <div style={{
                            width: 10, height: 10, borderRadius: '50%', marginTop: 3,
                            background: cfg.color,
                            border: '2px solid var(--bg-surface)',
                            boxShadow: `0 0 0 1px ${cfg.color}44`,
                            zIndex: 1, position: 'relative',
                          }} />
                        </div>

                        {/* Content */}
                        <button
                          onClick={() => setSelectedNode(node.id)}
                          style={{
                            flex: 1, textAlign: 'left', cursor: 'pointer',
                            padding: '4px 8px', borderRadius: 'var(--r-sm)',
                            background: 'transparent',
                          }}
                          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 1 }}>
                            <span style={{ fontSize: 10, fontWeight: 600, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                              {cfg.label}
                            </span>
                            <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                              {relativeTime(node.addedAt)}
                            </span>
                          </div>
                          <div style={{
                            fontSize: 11.5, color: 'var(--text-primary)',
                            fontFamily: 'var(--font-mono)',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                          }}>
                            {node.value}
                          </div>
                          {node.riskFlag !== 'NONE' && (
                            <div style={{ fontSize: 10, color: RISK_COLORS[node.riskFlag], marginTop: 2 }}>
                              ● {node.riskFlag}
                            </div>
                          )}
                          <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>
                            by {node.addedBy}
                          </div>
                        </button>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </>
        )}

        {/* ── Log tab ── */}
        {tab === 'log' && (
          <>
            {groupedLog.length === 0 ? (
              <Empty label="No activity recorded" />
            ) : (
              groupedLog.map(({ label, events }) => (
                <div key={label} style={{ marginBottom: 18 }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    marginBottom: 8,
                  }}>
                    {label}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {events.map(evt => (
                      <LogEntry key={evt.id} event={evt} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  )
}

function LogEntry({ event }: { event: HistoryEvent }) {
  const iconName = EVENT_ICONS[event.type] ?? 'node'
  const color = EVENT_COLORS[event.type] ?? 'var(--text-tertiary)'
  const time = new Date(event.timestamp).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })

  return (
    <div style={{
      display: 'flex', alignItems: 'flex-start', gap: 8,
      padding: '5px 7px', borderRadius: 'var(--r-sm)',
    }}>
      <div style={{
        width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
        background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginTop: 0,
      }}>
        <UIIcon name={iconName} size={11} style={{ color }} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 11.5, color: 'var(--text-primary)',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          lineHeight: 1.4,
        }}>
          {event.label}
        </div>
      </div>
      <span style={{ fontSize: 10, color: 'var(--text-tertiary)', flexShrink: 0, paddingTop: 2 }}>
        {time}
      </span>
    </div>
  )
}

function Empty({ label }: { label: string }) {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      paddingTop: 48, color: 'var(--text-tertiary)',
    }}>
      <UIIcon name="clock" size={28} strokeWidth={1.2} />
      <span style={{ marginTop: 12, fontSize: 12 }}>{label}</span>
    </div>
  )
}
