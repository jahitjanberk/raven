import { type LayoutAlgorithm } from '../../lib/layout'

interface Option {
  algo: LayoutAlgorithm
  label: string
  desc: string
  icon: string
}

const OPTIONS: Option[] = [
  {
    algo: 'force',
    label: 'Force-directed',
    desc: 'Spring-based. Pulls connected nodes together, pushes unconnected ones apart. Best general-purpose layout.',
    icon: '⬡',
  },
  {
    algo: 'hierarchical',
    label: 'Hierarchical',
    desc: 'BFS layers from the most-connected root. Best for tree-shaped or parent→child investigation chains.',
    icon: '⌥',
  },
  {
    algo: 'radial',
    label: 'Radial',
    desc: 'Root at centre, neighbours in concentric rings. Good for ego-network exploration around a seed entity.',
    icon: '◎',
  },
  {
    algo: 'cluster',
    label: 'Type cluster',
    desc: 'Groups nodes by entity type into named clusters. Good for seeing what categories of data you have collected.',
    icon: '▣',
  },
]

interface Props {
  active: LayoutAlgorithm | null
  running: boolean
  onSelect: (algo: LayoutAlgorithm) => void
  onClose: () => void
}

export function LayoutPicker({ active, running, onSelect, onClose }: Props) {
  return (
    <>
      {/* Backdrop */}
      <div
        style={{ position: 'fixed', inset: 0, zIndex: 79 }}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        style={{
          position: 'fixed',
          top: 60,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 80,
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.45)',
          width: 380,
          overflow: 'hidden',
        }}
      >
        <div style={{
          padding: '12px 16px 8px',
          borderBottom: '1px solid var(--color-border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text-primary)' }}>
            Auto Layout
          </span>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--color-text-muted)', fontSize: 16, lineHeight: 1,
              padding: '2px 4px', borderRadius: 4,
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: 8 }}>
          {OPTIONS.map(opt => {
            const isActive = active === opt.algo
            return (
              <button
                key={opt.algo}
                onClick={() => !running && onSelect(opt.algo)}
                disabled={running}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%',
                  background: isActive ? 'rgba(99,102,241,0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(99,102,241,0.45)' : '1px solid transparent',
                  borderRadius: 8, padding: '10px 12px', cursor: running ? 'default' : 'pointer',
                  textAlign: 'left', transition: 'background 0.15s, border-color 0.15s',
                  opacity: running && !isActive ? 0.45 : 1,
                }}
              >
                <span style={{
                  fontSize: 20, lineHeight: 1, marginTop: 1,
                  color: isActive ? '#818CF8' : 'var(--color-text-muted)',
                  flexShrink: 0,
                }}>
                  {opt.icon}
                </span>
                <div>
                  <div style={{
                    fontSize: 13, fontWeight: 600,
                    color: isActive ? '#818CF8' : 'var(--color-text-primary)',
                    marginBottom: 3,
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    {opt.label}
                    {running && isActive && (
                      <span style={{
                        fontSize: 10, fontFamily: 'var(--font-mono)',
                        color: '#818CF8', opacity: 0.8,
                        animation: 'pulse 1s ease-in-out infinite',
                      }}>
                        running…
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--color-text-muted)', lineHeight: 1.45 }}>
                    {opt.desc}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <div style={{
          padding: '8px 16px 12px',
          fontSize: 11, color: 'var(--color-text-muted)',
          borderTop: '1px solid var(--color-border)',
        }}>
          Undo (Ctrl+Z) restores previous positions.
        </div>
      </div>
    </>
  )
}
