import { useGraphStore } from '../../store/graphStore'
import {
  ENTITY_CONFIG,
  RELIABILITY_CONFIG, ACCURACY_CONFIG,
  intelGradeColor,
  type SourceReliability, type InfoAccuracy,
} from '../../types/graph'

const RELIABILITY_KEYS: SourceReliability[] = ['A', 'B', 'C', 'D', 'ungraded']
const ACCURACY_KEYS: InfoAccuracy[] = ['1', '2', '3', '4', 'ungraded']

export function EdgePanel() {
  const { nodes, edges, selectedEdgeId, setSelectedEdge, updateEdgeGrade, removeEdge } = useGraphStore()

  const edge = edges.find(e => e.id === selectedEdgeId)
  if (!edge) return null

  const src = nodes.find(n => n.id === edge.source)
  const tgt = nodes.find(n => n.id === edge.target)
  if (!src || !tgt) return null

  const rel = edge.grade.sourceReliability
  const acc = edge.grade.infoAccuracy
  const hasGrade = rel !== 'ungraded' && acc !== 'ungraded'
  const gradeCode = hasGrade ? `${rel}${acc}` : null
  const gradeColor = hasGrade ? intelGradeColor(edge.grade) : 'var(--color-text-muted)'

  const srcCfg = ENTITY_CONFIG[src.type]
  const tgtCfg = ENTITY_CONFIG[tgt.type]

  return (
    <div style={{
      position: 'absolute',
      right: 14,
      top: 14,
      width: 320,
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-soft)',
      borderRadius: 14,
      boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
      overflow: 'hidden',
      animation: 'fadeUp 0.15s ease',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 14px 10px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{
          fontSize: 9.5, fontWeight: 700, color: 'var(--text-tertiary)',
          textTransform: 'uppercase', letterSpacing: '0.1em', flex: 1,
        }}>
          Edge Inspector
        </span>
        {gradeCode && (
          <span style={{
            fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)',
            color: gradeColor,
            padding: '2px 7px', borderRadius: 4,
            background: gradeColor + '22',
            border: `1px solid ${gradeColor}55`,
          }}>
            {gradeCode}
          </span>
        )}
        <button
          onClick={() => setSelectedEdge(null)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--text-muted)', fontSize: 16, lineHeight: 1, padding: '2px 4px',
          }}
        >×</button>
      </div>

      {/* Connection diagram */}
      <div style={{
        padding: '12px 14px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        {/* Source node */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 9, fontWeight: 700, color: srcCfg.color,
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3,
          }}>{srcCfg.label}</div>
          <div style={{
            fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            fontFamily: src.type === 'ip' || src.type === 'domain' || src.type === 'email' || src.type === 'url' || src.type === 'wallet' || src.type === 'hash'
              ? 'var(--font-mono)' : undefined,
          }}>
            {src.value}
          </div>
        </div>

        {/* Arrow + optional label */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
          {edge.label && (
            <span style={{
              fontSize: 9, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)',
              marginBottom: 2, whiteSpace: 'nowrap',
            }}>{edge.label}</span>
          )}
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>→</span>
        </div>

        {/* Target node */}
        <div style={{ flex: 1, minWidth: 0, textAlign: 'right' }}>
          <div style={{
            fontSize: 9, fontWeight: 700, color: tgtCfg.color,
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 3,
          }}>{tgtCfg.label}</div>
          <div style={{
            fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            fontFamily: tgt.type === 'ip' || tgt.type === 'domain' || tgt.type === 'email' || tgt.type === 'url' || tgt.type === 'wallet' || tgt.type === 'hash'
              ? 'var(--font-mono)' : undefined,
          }}>
            {tgt.value}
          </div>
        </div>
      </div>

      {/* Intel grade section */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border-subtle)' }}>
        <div style={{
          fontSize: 9.5, fontWeight: 700, color: 'var(--text-tertiary)',
          textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10,
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          <span>Intel Grade</span>
          <span style={{ fontWeight: 400, color: 'var(--text-muted)', textTransform: 'none', letterSpacing: 0, fontSize: 9 }}>
            NATO STANAG 2511
          </span>
        </div>

        {/* Source reliability */}
        <div style={{ marginBottom: 12 }}>
          <div style={{
            fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6,
          }}>
            Source Reliability
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {RELIABILITY_KEYS.map(key => {
              const cfg = RELIABILITY_CONFIG[key]
              const active = rel === key
              return (
                <button
                  key={key}
                  title={`${key === 'ungraded' ? '?' : key} — ${cfg.label}`}
                  onClick={() => updateEdgeGrade(edge.id, { sourceReliability: key })}
                  style={{
                    flex: 1, padding: '5px 0', borderRadius: 6,
                    background: active ? cfg.color + '22' : 'var(--bg-raised)',
                    border: active ? `1.5px solid ${cfg.color}` : '1px solid var(--border-subtle)',
                    color: active ? cfg.color : 'var(--text-muted)',
                    fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)',
                    cursor: 'pointer', transition: 'all 0.12s',
                  }}
                >
                  {key === 'ungraded' ? '?' : key}
                </button>
              )
            })}
          </div>
          {rel !== 'ungraded' && (
            <div style={{
              marginTop: 5, fontSize: 10.5, color: 'var(--text-tertiary)', lineHeight: 1.4,
            }}>
              <span style={{ color: RELIABILITY_CONFIG[rel].color, fontWeight: 600 }}>{rel}</span>
              {' — '}{RELIABILITY_CONFIG[rel].label}
            </div>
          )}
        </div>

        {/* Information accuracy */}
        <div>
          <div style={{
            fontSize: 10.5, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6,
          }}>
            Information Accuracy
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {ACCURACY_KEYS.map(key => {
              const cfg = ACCURACY_CONFIG[key]
              const active = acc === key
              return (
                <button
                  key={key}
                  title={`${key === 'ungraded' ? '?' : key} — ${cfg.label}`}
                  onClick={() => updateEdgeGrade(edge.id, { infoAccuracy: key })}
                  style={{
                    flex: 1, padding: '5px 0', borderRadius: 6,
                    background: active ? cfg.color + '22' : 'var(--bg-raised)',
                    border: active ? `1.5px solid ${cfg.color}` : '1px solid var(--border-subtle)',
                    color: active ? cfg.color : 'var(--text-muted)',
                    fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-mono)',
                    cursor: 'pointer', transition: 'all 0.12s',
                  }}
                >
                  {key === 'ungraded' ? '?' : key}
                </button>
              )
            })}
          </div>
          {acc !== 'ungraded' && (
            <div style={{
              marginTop: 5, fontSize: 10.5, color: 'var(--text-tertiary)', lineHeight: 1.4,
            }}>
              <span style={{ color: ACCURACY_CONFIG[acc].color, fontWeight: 600 }}>{acc}</span>
              {' — '}{ACCURACY_CONFIG[acc].label}
            </div>
          )}
        </div>
      </div>

      {/* Grade summary */}
      {hasGrade && (
        <div style={{
          margin: '10px 14px',
          padding: '8px 10px',
          background: gradeColor + '11',
          border: `1px solid ${gradeColor}33`,
          borderRadius: 8,
          fontSize: 11, lineHeight: 1.5, color: 'var(--text-secondary)',
        }}>
          <span style={{
            fontWeight: 700, fontFamily: 'var(--font-mono)',
            color: gradeColor, fontSize: 13, marginRight: 6,
          }}>{gradeCode}</span>
          {RELIABILITY_CONFIG[rel].label} source
          {' · '}
          {ACCURACY_CONFIG[acc].label.toLowerCase()} information
        </div>
      )}

      {/* Remove edge */}
      <div style={{ padding: '0 14px 14px' }}>
        <button
          onClick={() => {
            removeEdge(edge.id)
            setSelectedEdge(null)
          }}
          style={{
            width: '100%', padding: '7px 0', borderRadius: 8,
            background: 'transparent',
            border: '1px solid var(--border-subtle)',
            color: 'var(--red)',
            fontSize: 12, fontWeight: 600, cursor: 'pointer',
            transition: 'background 0.12s',
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(239,68,68,0.08)' }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}
        >
          Remove edge
        </button>
      </div>
    </div>
  )
}
