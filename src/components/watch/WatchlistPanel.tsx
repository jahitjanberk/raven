import { useState } from 'react'
import { useWatchStore, INTERVAL_LABELS, type WatchInterval } from '../../store/watchStore'
import { ENTITY_CONFIG } from '../../types/graph'

function relativeTime(iso: string | null): string {
  if (!iso) return 'never'
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1)   return 'just now'
  if (mins < 60)  return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24)   return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function countdown(iso: string | null): string {
  if (!iso) return '—'
  const diff = new Date(iso).getTime() - Date.now()
  if (diff <= 0) return 'due now'
  const hrs  = Math.floor(diff / 3600000)
  const mins = Math.floor((diff % 3600000) / 60000)
  if (hrs > 0) return `in ${hrs}h ${mins}m`
  return `in ${mins}m`
}

interface Props {
  onClose: () => void
}

export function WatchlistPanel({ onClose }: Props) {
  const {
    entries, alerts,
    removeWatch, toggleWatch, markAllRead, setApiKey, apiKeys,
  } = useWatchStore()

  const [keyInputs, setKeyInputs] = useState<Record<string, string>>({})
  const [expandedAlert, setExpandedAlert] = useState<string | null>(null)

  const unreadAlerts = alerts.filter(a => !a.read)
  const recentAlerts = alerts.slice(0, 30)

  return (
    <div style={{
      position: 'absolute',
      right: 14,
      top: 14,
      width: 360,
      maxHeight: 'calc(100vh - 100px)',
      display: 'flex',
      flexDirection: 'column',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-soft)',
      borderRadius: 14,
      boxShadow: '0 4px 24px rgba(0,0,0,0.22)',
      overflow: 'hidden',
      animation: 'fadeUp 0.15s ease',
    }}>

      {/* Header */}
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', gap: 8,
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', flex: 1 }}>
          Watchlist
          {entries.length > 0 && (
            <span style={{
              marginLeft: 8, fontSize: 10.5, fontFamily: 'var(--font-mono)',
              color: 'var(--text-muted)', fontWeight: 400,
            }}>
              {entries.filter(e => e.enabled).length}/{entries.length} active
            </span>
          )}
        </span>
        {unreadAlerts.length > 0 && (
          <button
            onClick={markAllRead}
            style={{
              fontSize: 10.5, color: 'var(--accent)', background: 'none',
              border: 'none', cursor: 'pointer', fontWeight: 600,
            }}
          >
            Mark all read
          </button>
        )}
        <button
          onClick={onClose}
          style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '2px 4px' }}
        >
          ×
        </button>
      </div>

      <div style={{ overflowY: 'auto', flex: 1 }}>

        {/* ── Alerts section ── */}
        {recentAlerts.length > 0 && (
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
            <div style={{
              fontSize: 9.5, fontWeight: 700, color: 'var(--text-tertiary)',
              textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8,
            }}>
              Recent alerts
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {recentAlerts.map(alert => (
                <div
                  key={alert.id}
                  style={{
                    padding: '7px 9px', borderRadius: 8,
                    background: alert.read ? 'var(--bg-base)' : 'rgba(99,102,241,0.08)',
                    border: `1px solid ${alert.read ? 'var(--border-subtle)' : 'rgba(99,102,241,0.3)'}`,
                    cursor: 'pointer',
                  }}
                  onClick={() => setExpandedAlert(expandedAlert === alert.id ? null : alert.id)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{
                      width: 6, height: 6, borderRadius: '50%', flexShrink: 0,
                      background: alert.read ? 'var(--text-muted)' : 'var(--accent)',
                    }} />
                    <span style={{
                      fontSize: 11.5, color: 'var(--text-primary)', flex: 1,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>
                      {alert.summary}
                    </span>
                    <span style={{ fontSize: 10, color: 'var(--text-muted)', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>
                      {relativeTime(alert.detectedAt)}
                    </span>
                  </div>
                  {expandedAlert === alert.id && (
                    <div style={{ marginTop: 5, paddingLeft: 12, fontSize: 10.5, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
                      {alert.newNodeCount} node{alert.newNodeCount !== 1 ? 's' : ''} added to graph automatically.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Watch entries ── */}
        <div style={{ padding: '10px 14px' }}>
          <div style={{
            fontSize: 9.5, fontWeight: 700, color: 'var(--text-tertiary)',
            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8,
          }}>
            Monitored entities
          </div>

          {entries.length === 0 && (
            <div style={{
              padding: '24px 0', textAlign: 'center',
              color: 'var(--text-muted)', fontSize: 12,
            }}>
              <div style={{ fontSize: 24, marginBottom: 8, opacity: 0.4 }}>👁</div>
              No entities being watched.
              <div style={{ fontSize: 10.5, marginTop: 6, lineHeight: 1.5, opacity: 0.7 }}>
                Open a node in the Entity panel, go to Transforms,<br />
                and click the eye icon next to any transform.
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {entries.map(entry => {
              const cfg = ENTITY_CONFIG[entry.nodeType as keyof typeof ENTITY_CONFIG]
              const needsKey = entry.requiresKey && !apiKeys[entry.id]

              return (
                <div
                  key={entry.id}
                  style={{
                    borderRadius: 10,
                    border: `1px solid ${entry.enabled ? 'var(--border-soft)' : 'var(--border-subtle)'}`,
                    background: entry.enabled ? 'var(--bg-raised)' : 'var(--bg-base)',
                    overflow: 'hidden',
                    opacity: entry.enabled ? 1 : 0.6,
                  }}
                >
                  {/* Main row */}
                  <div style={{ padding: '9px 11px', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    {/* Type dot */}
                    <span style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: cfg?.color ?? '#888', flexShrink: 0, marginTop: 4,
                    }} />

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        fontFamily: ['ip','domain','email','url','wallet','hash'].includes(entry.nodeType)
                          ? 'var(--font-mono)' : undefined,
                      }}>
                        {entry.nodeValue}
                      </div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-tertiary)', marginTop: 2 }}>
                        {entry.transformName}
                        {' · '}
                        {INTERVAL_LABELS[entry.intervalHours]}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, display: 'flex', gap: 8 }}>
                        <span>Last: {relativeTime(entry.lastRunAt)}</span>
                        <span>Next: {entry.enabled ? countdown(entry.nextRunAt) : 'paused'}</span>
                      </div>
                    </div>

                    {/* Enable toggle */}
                    <button
                      onClick={() => toggleWatch(entry.id)}
                      title={entry.enabled ? 'Pause watch' : 'Resume watch'}
                      style={{
                        background: entry.enabled ? 'rgba(99,102,241,0.12)' : 'var(--bg-base)',
                        border: `1px solid ${entry.enabled ? 'rgba(99,102,241,0.4)' : 'var(--border-subtle)'}`,
                        borderRadius: 6, padding: '3px 7px', cursor: 'pointer',
                        fontSize: 10.5, color: entry.enabled ? 'var(--accent)' : 'var(--text-muted)',
                        fontWeight: 600, flexShrink: 0,
                      }}
                    >
                      {entry.enabled ? '● ON' : '○ OFF'}
                    </button>

                    {/* Remove */}
                    <button
                      onClick={() => removeWatch(entry.id)}
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: 'var(--text-muted)', fontSize: 14, lineHeight: 1, padding: '2px 3px',
                        flexShrink: 0,
                      }}
                      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--red)' }}
                      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)' }}
                    >
                      ×
                    </button>
                  </div>

                  {/* Key required prompt */}
                  {needsKey && entry.enabled && (
                    <div style={{
                      padding: '6px 11px 8px',
                      borderTop: '1px solid var(--border-subtle)',
                      background: 'rgba(212,153,34,0.06)',
                    }}>
                      <div style={{ fontSize: 10.5, color: '#D29922', marginBottom: 5, fontWeight: 600 }}>
                        API key needed to run
                      </div>
                      <div style={{ display: 'flex', gap: 5 }}>
                        <input
                          type="password"
                          placeholder="Paste API key…"
                          value={keyInputs[entry.id] ?? ''}
                          onChange={e => setKeyInputs(p => ({ ...p, [entry.id]: e.target.value }))}
                          style={{
                            flex: 1, fontSize: 11, padding: '4px 7px',
                            background: 'var(--bg-base)', border: '1px solid var(--border-soft)',
                            borderRadius: 5, color: 'var(--text-primary)', outline: 'none',
                            fontFamily: 'var(--font-mono)',
                          }}
                        />
                        <button
                          onClick={() => {
                            const k = keyInputs[entry.id]
                            if (k) {
                              setApiKey(entry.id, k)
                              setKeyInputs(p => { const n = { ...p }; delete n[entry.id]; return n })
                            }
                          }}
                          style={{
                            fontSize: 11, padding: '4px 9px', borderRadius: 5,
                            background: 'var(--accent)', color: 'var(--bg-base)',
                            border: 'none', cursor: 'pointer', fontWeight: 600,
                          }}
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer hint */}
        <div style={{
          padding: '8px 14px 12px',
          fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.5,
          borderTop: entries.length > 0 ? '1px solid var(--border-subtle)' : 'none',
        }}>
          Watches run while the app is open. API keys are session-only and never saved to disk.
        </div>
      </div>
    </div>
  )
}
