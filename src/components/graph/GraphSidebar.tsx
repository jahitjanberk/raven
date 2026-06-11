import { useState } from 'react'
import { useGraphStore } from '../../store/graphStore'
import { ENTITY_CONFIG } from '../../types/graph'
import { UIIcon } from '../../icons/UIIcon'
import { useTheme } from '../../context/ThemeContext'
import { useSettingsStore } from '../../store/settingsStore'

interface GraphSidebarProps {
  collapsed: boolean
  onToggle: () => void
  onAddNode: () => void
  caseName: string
  caseRef?: string
  classification: string
  onOpenSettings?: () => void
}

export function GraphSidebar({ collapsed, onToggle, onAddNode, caseName, caseRef, classification, onOpenSettings }: GraphSidebarProps) {
  const { nodes, selectedNodeId, setSelectedNode, caseNotes, setCaseNotes } = useGraphStore()
  const { theme, toggleTheme } = useTheme()
  const { analystInitials } = useSettingsStore()
  const [expandNodes, setExpandNodes] = useState(true)
  const [sidebarTab, setSidebarTab] = useState<'nodes' | 'notes'>('nodes')


  const classColor = classification === 'OFFICIAL-SENSITIVE' ? 'var(--amber)'
    : classification === 'OFFICIAL' ? 'var(--accent)' : 'var(--purple)'

  return (
    <aside style={{
      width: collapsed ? 48 : 220,
      flexShrink: 0,
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-soft)',
      borderRadius: 'var(--r-xl)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.16)',
      display: 'flex',
      flexDirection: 'column',
      transition: 'width 0.2s ease',
      overflow: 'hidden',
      maxHeight: 'calc(100vh - 104px)',
    }}>

      {/* ── Collapsed: icon strip ── */}
      {collapsed && (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 10, paddingBottom: 12, gap: 3 }}>

          {/* Expand toggle */}
          <button
            onClick={onToggle}
            title="Expand sidebar"
            style={{
              width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 'var(--r-sm)', border: 'none',
              background: 'transparent', color: 'var(--text-tertiary)', cursor: 'pointer', flexShrink: 0,
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-raised)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'transparent' }}
          >
            <UIIcon name="chevronRight" size={12} />
          </button>

          {/* Add node */}
          <button
            onClick={onAddNode}
            title="Add node"
            style={{
              width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 'var(--r-sm)', border: 'none',
              background: 'var(--accent-gradient)', color: 'var(--bg-base)', cursor: 'pointer', flexShrink: 0,
              transition: 'filter 0.12s ease',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.15)' }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = '' }}
          >
            <UIIcon name="plus" size={13} />
          </button>

          {/* Bottom: settings + theme toggle + user avatar */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <button
              onClick={onOpenSettings}
              title="Settings"
              style={{
                width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 'var(--r-sm)', border: 'none',
                background: 'transparent', color: 'var(--text-tertiary)', cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-raised)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'transparent' }}
            >
              <UIIcon name="settings" size={14} />
            </button>
            <button
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              style={{
                width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 'var(--r-sm)', border: 'none',
                background: 'transparent', color: 'var(--text-tertiary)', cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-raised)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'transparent' }}
            >
              <UIIcon name={theme === 'light' ? 'moon' : 'sun'} size={14} />
            </button>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9.5, fontWeight: 700, color: 'var(--bg-base)', flexShrink: 0, letterSpacing: '0.02em' }}>
              {analystInitials}
            </div>
          </div>
        </div>
      )}

      {/* ── Expanded: full content ── */}
      {!collapsed && (
        <>
          {/* Toggle row */}
          <div style={{
            height: 44, display: 'flex', alignItems: 'center',
            padding: '0 12px', borderBottom: '1px solid var(--border-subtle)',
            justifyContent: 'space-between', flexShrink: 0,
          }}>
            <button
              onClick={toggleTheme}
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              style={{
                width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 'var(--r-sm)', border: 'none',
                background: 'transparent', color: 'var(--text-tertiary)', cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-raised)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.background = 'transparent' }}
            >
              <UIIcon name={theme === 'light' ? 'moon' : 'sun'} size={13} />
            </button>
            <button
              onClick={onToggle}
              title="Collapse sidebar"
              style={{
                width: 26, height: 26, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 'var(--r-sm)', border: '1px solid var(--border-subtle)',
                background: 'var(--bg-raised)', color: 'var(--text-tertiary)', cursor: 'pointer',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)' }}
            >
              <UIIcon name="chevronLeft" size={13} />
            </button>
          </div>

          {/* Tab bar */}
          <div style={{
            display: 'flex', borderBottom: '1px solid var(--border-subtle)', flexShrink: 0,
          }}>
            {(['nodes', 'notes'] as const).map(t => (
              <button
                key={t}
                onClick={() => setSidebarTab(t)}
                style={{
                  flex: 1, padding: '7px 0', fontSize: 11.5,
                  fontWeight: sidebarTab === t ? 600 : 400,
                  color: sidebarTab === t ? 'var(--accent)' : 'var(--text-tertiary)',
                  borderBottom: `2px solid ${sidebarTab === t ? 'var(--accent)' : 'transparent'}`,
                  cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.12s',
                }}
                onMouseEnter={(e) => { if (sidebarTab !== t) e.currentTarget.style.color = 'var(--text-secondary)' }}
                onMouseLeave={(e) => { if (sidebarTab !== t) e.currentTarget.style.color = 'var(--text-tertiary)' }}
              >
                {t === 'nodes' ? `Nodes ${nodes.length > 0 ? `(${nodes.length})` : ''}` : 'Notes'}
              </button>
            ))}
          </div>

          {/* ── Nodes tab ── */}
          {sidebarTab === 'nodes' && (
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 12px' }}>

              {/* Case info */}
              <div style={{ marginBottom: 18 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                  Case
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 3, lineHeight: 1.4 }}>
                  {caseName}
                </div>
                {caseRef && (
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--text-tertiary)', marginBottom: 4 }}>
                    {caseRef}
                  </div>
                )}
                <span style={{
                  display: 'inline-flex', padding: '1px 6px', borderRadius: 'var(--r-xs)',
                  border: `1px solid ${classColor}44`, background: classColor + '14',
                  color: classColor, fontSize: 9, fontWeight: 700,
                  fontFamily: 'var(--font-mono)', letterSpacing: '0.07em',
                }}>
                  {classification === 'OFFICIAL-SENSITIVE' ? 'OFF-SENS' : classification}
                </span>
              </div>

              {/* Node list */}
              {nodes.length > 0 && (
                <div>
                  <button
                    onClick={() => setExpandNodes((v) => !v)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5, width: '100%',
                      fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)',
                      textTransform: 'uppercase', letterSpacing: '0.07em',
                      marginBottom: 8, cursor: 'pointer',
                    }}
                  >
                    <UIIcon name={expandNodes ? 'chevronDown' : 'chevronRight'} size={10} />
                    Nodes ({nodes.length})
                  </button>
                  {expandNodes && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {nodes.map((node) => {
                        const cfg = ENTITY_CONFIG[node.type]
                        const isSelected = selectedNodeId === node.id
                        return (
                          <button
                            key={node.id}
                            onClick={() => setSelectedNode(isSelected ? null : node.id)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 7,
                              padding: '5px 7px', borderRadius: 'var(--r-sm)',
                              background: isSelected ? cfg.color + '18' : 'transparent',
                              border: `1px solid ${isSelected ? cfg.color + '44' : 'transparent'}`,
                              cursor: 'pointer', textAlign: 'left', width: '100%',
                              transition: 'all 0.1s',
                            }}
                            onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'var(--bg-hover)' }}
                            onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = 'transparent' }}
                          >
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
                            <span style={{
                              fontSize: 11.5, color: isSelected ? cfg.color : 'var(--text-secondary)',
                              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              fontFamily: 'var(--font-mono)',
                            }}>
                              {node.value.length > 18 ? node.value.slice(0, 16) + '…' : node.value}
                            </span>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Graph stats */}
              {nodes.length > 0 && (
                <div style={{
                  marginTop: 18, padding: '10px', borderRadius: 'var(--r-md)',
                  background: 'var(--bg-base)', border: '1px solid var(--border-subtle)',
                }}>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.9, fontFamily: 'var(--font-mono)' }}>
                    <div>{nodes.length} nodes</div>
                    <div>{useGraphStore.getState().edges.length} edges</div>
                    <div style={{ color: 'var(--green)', fontSize: 10 }}>● Audit log active</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Notes tab ── */}
          {sidebarTab === 'notes' && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '12px' }}>
              <textarea
                value={caseNotes}
                onChange={(e) => setCaseNotes(e.target.value)}
                placeholder={'Investigation notes, findings, hypotheses…\n\nTip: use plain text or markdown-style formatting'}
                style={{
                  flex: 1, width: '100%', resize: 'none',
                  background: 'var(--bg-base)', border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--r-md)', padding: '10px 11px',
                  color: 'var(--text-primary)', fontSize: 11.5,
                  fontFamily: 'var(--font-mono)', lineHeight: 1.7,
                  outline: 'none',
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-border)' }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
              />
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                marginTop: 8,
              }}>
                <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                  {caseNotes.length > 0 ? `${caseNotes.length} chars · ${caseNotes.split('\n').length} lines` : 'No notes yet'}
                </span>
                {caseNotes.length > 0 && (
                  <button
                    onClick={() => setCaseNotes('')}
                    style={{ fontSize: 10, color: 'var(--text-tertiary)', cursor: 'pointer', padding: '2px 6px', borderRadius: 'var(--r-xs)', border: '1px solid var(--border-subtle)' }}
                    onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--red)'; e.currentTarget.style.borderColor = 'var(--red-border)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </aside>
  )
}
