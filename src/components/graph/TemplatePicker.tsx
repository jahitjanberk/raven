import { useState } from 'react'
import { CASE_TEMPLATES, type CaseTemplate } from '../../data/caseTemplates'
import { ENTITY_CONFIG } from '../../types/graph'
import { UIIcon } from '../../icons/UIIcon'

interface Props {
  onApply: (template: CaseTemplate) => void
  onClose: () => void
  hasExistingNodes: boolean
}

export function TemplatePicker({ onApply, onClose, hasExistingNodes }: Props) {
  const [selected, setSelected] = useState<CaseTemplate | null>(null)
  const [confirmOverwrite, setConfirmOverwrite] = useState(false)

  const handleApply = () => {
    if (hasExistingNodes && !confirmOverwrite) {
      setConfirmOverwrite(true)
      return
    }
    if (selected) onApply(selected)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 500, animation: 'fadeIn var(--dur-normal) var(--ease-out-quart) both',
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
          borderRadius: 16, width: 720, maxHeight: '85vh',
          display: 'flex', flexDirection: 'column',
          boxShadow: '0 12px 48px rgba(0,0,0,0.4)',
          animation: 'fadeUp var(--dur-slow) var(--ease-out-expo) both',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{
                fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em',
                color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4,
              }}>
                Case Templates
              </div>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
                Start from a template
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 4 }}>
                Pre-built node structures for common investigation types. Edit placeholders after loading.
              </p>
            </div>
            <button
              onClick={onClose}
              style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, padding: '2px 6px' }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Two-column layout: template cards (left) + preview (right) */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>

          {/* Template cards */}
          <div style={{
            width: 280, flexShrink: 0, overflowY: 'auto',
            padding: '14px 0', borderRight: '1px solid var(--border-subtle)',
          }}>
            {CASE_TEMPLATES.map(tmpl => (
              <button
                key={tmpl.id}
                onClick={() => { setSelected(tmpl); setConfirmOverwrite(false) }}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  width: '100%', padding: '10px 18px', textAlign: 'left',
                  background: selected?.id === tmpl.id ? 'rgba(99,102,241,0.1)' : 'transparent',
                  borderLeft: `3px solid ${selected?.id === tmpl.id ? 'var(--accent)' : 'transparent'}`,
                  border: 'none',
                  borderTop: '1px solid transparent',
                  borderBottom: '1px solid transparent',
                  cursor: 'pointer', transition: 'background 0.12s',
                }}
                onMouseEnter={e => {
                  if (selected?.id !== tmpl.id)
                    (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-raised)'
                }}
                onMouseLeave={e => {
                  if (selected?.id !== tmpl.id)
                    (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                }}
              >
                <span style={{
                  width: 30, height: 30, borderRadius: 7, flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: selected?.id === tmpl.id ? tmpl.categoryColor + '22' : 'var(--bg-overlay)',
                  color: selected?.id === tmpl.id ? tmpl.categoryColor : 'var(--text-tertiary)',
                  transition: 'background var(--dur-normal) var(--ease-out-quart), color var(--dur-normal) var(--ease-out-quart)',
                }}>
                  <UIIcon name={tmpl.icon} size={15} strokeWidth={1.75} />
                </span>
                <div style={{ minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600,
                    color: selected?.id === tmpl.id ? 'var(--accent)' : 'var(--text-primary)',
                    marginBottom: 2,
                  }}>
                    {tmpl.name}
                  </div>
                  <div style={{
                    fontSize: 9.5, fontWeight: 700, letterSpacing: '0.06em',
                    color: tmpl.categoryColor, textTransform: 'uppercase',
                  }}>
                    {tmpl.categoryLabel}
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Preview pane */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
            {!selected ? (
              <div style={{
                height: '100%', display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)', textAlign: 'center',
              }}>
                <span style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>←</span>
                <span style={{ fontSize: 13 }}>Select a template to preview</span>
              </div>
            ) : (
              <div>
                {/* Title + description */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                  <span style={{
                    width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: selected.categoryColor + '1A',
                    color: selected.categoryColor,
                  }}>
                    <UIIcon name={selected.icon} size={20} strokeWidth={1.6} />
                  </span>
                  <div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                      {selected.name}
                    </h3>
                    <div style={{
                      display: 'inline-block', fontSize: 9.5, fontWeight: 700,
                      color: selected.categoryColor, letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}>
                      {selected.categoryLabel}
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 18 }}>
                  {selected.tagline}
                </p>

                {/* Meta */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 18 }}>
                  {[
                    { label: 'Classification', value: selected.classification },
                    { label: 'Case ref prefix', value: `${selected.caseRefPrefix}-YYYY-XXXX` },
                  ].map(({ label, value }) => (
                    <div key={label} style={{
                      flex: 1, background: 'var(--bg-raised)',
                      border: '1px solid var(--border-subtle)', borderRadius: 8,
                      padding: '8px 10px',
                    }}>
                      <div style={{ fontSize: 9.5, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>{label}</div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'var(--font-mono)' }}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* Nodes preview */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{
                    fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)',
                    textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8,
                  }}>
                    Starting nodes ({selected.nodes.length})
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {selected.nodes.map(n => {
                      const cfg = ENTITY_CONFIG[n.type]
                      return (
                        <div key={n.localId} style={{
                          display: 'flex', alignItems: 'center', gap: 8,
                          padding: '6px 10px', borderRadius: 7,
                          background: 'var(--bg-base)', border: '1px solid var(--border-subtle)',
                        }}>
                          <span style={{
                            width: 8, height: 8, borderRadius: '50%',
                            background: cfg?.color ?? '#888', flexShrink: 0,
                          }} />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <span style={{
                              fontSize: 9.5, fontWeight: 700, color: cfg?.color ?? '#888',
                              textTransform: 'uppercase', letterSpacing: '0.06em',
                              marginRight: 8,
                            }}>
                              {cfg?.label ?? n.type}
                            </span>
                            <span style={{
                              fontSize: 11, color: 'var(--text-secondary)',
                              fontFamily: 'var(--font-mono)',
                            }}>
                              {n.value}
                            </span>
                          </div>
                          {n.riskFlag !== 'NONE' && (
                            <span style={{
                              fontSize: 9, padding: '1px 5px', borderRadius: 3,
                              background: n.riskFlag === 'HIGH' ? 'rgba(239,68,68,0.12)' : 'rgba(201,138,46,0.12)',
                              color: n.riskFlag === 'HIGH' ? '#E05252' : '#C98A2E',
                              fontWeight: 700, flexShrink: 0,
                            }}>
                              {n.riskFlag}
                            </span>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Suggested transforms */}
                {selected.suggestedTransforms.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{
                      fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)',
                      textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7,
                    }}>
                      Suggested transforms
                    </div>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {selected.suggestedTransforms.map(slug => (
                        <span key={slug} style={{
                          fontSize: 10.5, padding: '3px 8px', borderRadius: 5,
                          background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.25)',
                          color: 'var(--accent)', fontFamily: 'var(--font-mono)', fontWeight: 500,
                        }}>
                          {slug}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Confirm overwrite warning */}
                {confirmOverwrite && (
                  <div style={{
                    padding: '10px 12px', borderRadius: 8, marginBottom: 14,
                    background: 'rgba(212,153,34,0.08)', border: '1px solid rgba(212,153,34,0.3)',
                    fontSize: 12, color: '#D29922', lineHeight: 1.5,
                  }}>
                    <strong>Canvas is not empty.</strong> Template nodes will be added alongside your existing nodes — nothing will be deleted.
                    Click "Load template" again to confirm.
                  </div>
                )}

                {/* Apply button */}
                <button
                  onClick={handleApply}
                  style={{
                    width: '100%', padding: '10px 0', borderRadius: 9,
                    background: 'var(--accent)', color: 'var(--bg-base)', border: 'none',
                    fontSize: 13.5, fontWeight: 700, cursor: 'pointer',
                    transition: 'filter 0.12s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.filter = 'brightness(1.1)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.filter = '' }}
                >
                  Load template — {selected.name}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
