import { useState, useMemo } from 'react'
import { ENTITY_CONFIG, CONFIDENCE_CONFIG } from '../../types/graph'
import type { GraphNode } from '../../types/graph'

interface MergeModalProps {
  nodes: GraphNode[]           // all selected nodes to merge
  onConfirm: (primaryId: string, secondaryIds: string[], primaryValue: string) => void
  onClose: () => void
}

export function MergeModal({ nodes, onConfirm, onClose }: MergeModalProps) {
  const [primaryId, setPrimaryId] = useState(nodes[0]?.id ?? '')
  const [editedValue, setEditedValue] = useState(nodes[0]?.value ?? '')

  // When user picks a different primary, seed the value field from that node
  const handlePickPrimary = (id: string) => {
    setPrimaryId(id)
    setEditedValue(nodes.find(n => n.id === id)?.value ?? '')
  }

  const primaryNode = nodes.find(n => n.id === primaryId)
  const secondaryIds = nodes.filter(n => n.id !== primaryId).map(n => n.id)

  // Preview merged metadata
  const mergedMeta = useMemo(() => {
    const merged: Record<string, { value: string; from: string }> = {}
    for (const node of nodes) {
      if (!node.metadata) continue
      for (const [k, v] of Object.entries(node.metadata)) {
        if (!merged[k]) merged[k] = { value: v, from: node.value }
      }
    }
    return merged
  }, [nodes])

  const totalEdges = (() => {
    // approximate — just show counts from the nodes themselves
    return secondaryIds.length
  })()

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 600, animation: 'fadeIn var(--dur-normal) var(--ease-out-quart) both',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: 480, maxHeight: '85vh',
          background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
          borderRadius: 'var(--r-lg)', boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
          display: 'flex', flexDirection: 'column', overflow: 'hidden',
          animation: 'slideUp 0.2s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
              Merge {nodes.length} nodes
            </h2>
            <button onClick={onClose} style={{ color: 'var(--text-tertiary)', cursor: 'pointer', padding: 2 }}>✕</button>
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>
            Pick which node to keep as primary. All edges from secondary nodes will be rewired to it, and metadata will be merged.
          </p>
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>

          {/* Node picker */}
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
              Select primary node
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {nodes.map(node => {
                const cfg = ENTITY_CONFIG[node.type]
                const isPrimary = node.id === primaryId
                const conf = CONFIDENCE_CONFIG[node.confidence ?? 'ungraded']
                return (
                  <button
                    key={node.id}
                    onClick={() => handlePickPrimary(node.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 12px', borderRadius: 'var(--r-md)', textAlign: 'left', cursor: 'pointer',
                      border: `1px solid ${isPrimary ? cfg.color + '66' : 'var(--border-subtle)'}`,
                      background: isPrimary ? cfg.color + '0D' : 'var(--bg-base)',
                      transition: 'all 0.1s',
                    }}
                  >
                    {/* Color dot */}
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />

                    {/* Type + value */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 10, color: cfg.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>
                        {cfg.label}
                      </div>
                      <div style={{ fontSize: 12.5, fontFamily: 'var(--font-mono)', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {node.value}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>
                        {node.riskFlag !== 'NONE' ? `Risk: ${node.riskFlag}  ·  ` : ''}
                        <span style={{ color: conf.color }}>{conf.label}</span>
                        {node.metadata && Object.keys(node.metadata).length > 0 ? `  ·  ${Object.keys(node.metadata).length} fields` : ''}
                      </div>
                    </div>

                    {/* Primary badge */}
                    {isPrimary && (
                      <span style={{
                        fontSize: 9, fontWeight: 700, padding: '2px 6px',
                        borderRadius: 'var(--r-xs)', background: cfg.color + '22',
                        color: cfg.color, border: `1px solid ${cfg.color}44`,
                        flexShrink: 0, letterSpacing: '0.05em', textTransform: 'uppercase',
                      }}>
                        Primary
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Value editor */}
          {primaryNode && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                Merged node value
              </div>
              <input
                value={editedValue}
                onChange={e => setEditedValue(e.target.value)}
                style={{
                  width: '100%', padding: '8px 10px',
                  background: 'var(--bg-base)', border: '1px solid var(--accent-border)',
                  borderRadius: 'var(--r-sm)', color: 'var(--text-primary)',
                  fontSize: 12.5, fontFamily: 'var(--font-mono)', outline: 'none',
                }}
              />
            </div>
          )}

          {/* Merged metadata preview */}
          {Object.keys(mergedMeta).length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
                Merged metadata ({Object.keys(mergedMeta).length} fields)
              </div>
              <div style={{
                borderRadius: 'var(--r-md)', border: '1px solid var(--border-subtle)',
                overflow: 'hidden', fontSize: 11.5,
              }}>
                {Object.entries(mergedMeta).map(([key, { value, from }]) => (
                  <div
                    key={key}
                    style={{ display: 'flex', gap: 8, padding: '5px 10px', borderBottom: '1px solid var(--border-subtle)' }}
                  >
                    <span style={{ color: 'var(--text-tertiary)', minWidth: 80, flexShrink: 0 }}>{key}</span>
                    <span style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)', fontSize: 11, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: 9.5, flexShrink: 0, fontStyle: 'italic' }}>from {from.slice(0, 14)}{from.length > 14 ? '…' : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Summary */}
          <div style={{
            padding: '10px 12px', borderRadius: 'var(--r-md)',
            background: 'var(--bg-base)', border: '1px solid var(--border-subtle)',
            fontSize: 11.5, color: 'var(--text-tertiary)', lineHeight: 1.7,
          }}>
            <strong style={{ color: 'var(--text-secondary)' }}>What happens:</strong><br />
            ✓ {secondaryIds.length} node{secondaryIds.length !== 1 ? 's' : ''} will be deleted<br />
            ✓ All their edges will be rewired to <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-primary)' }}>{editedValue || primaryNode?.value}</span><br />
            ✓ Metadata fields merged (primary takes precedence on conflicts)<br />
            ✓ Action undoable with Cmd+Z
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px', borderRadius: 'var(--r-sm)', fontSize: 12.5,
              background: 'transparent', border: '1px solid var(--border-soft)',
              color: 'var(--text-secondary)', cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(primaryId, secondaryIds, editedValue || primaryNode?.value || ''); onClose() }}
            disabled={!primaryId || secondaryIds.length === 0}
            style={{
              padding: '8px 20px', borderRadius: 'var(--r-sm)', fontSize: 12.5, fontWeight: 600,
              background: 'var(--accent)', color: 'var(--bg-base)', cursor: 'pointer', border: 'none',
              opacity: (!primaryId || secondaryIds.length === 0) ? 0.5 : 1,
            }}
          >
            Merge nodes
          </button>
        </div>
      </div>
    </div>
  )
}
