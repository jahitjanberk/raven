import React from 'react'
import { useGraphStore } from '../../store/graphStore'
import { ENTITY_CONFIG, RISK_COLORS } from '../../types/graph'
import type { EntityType, RiskFlag, ActionFlag } from '../../types/graph'
import { UIIcon } from '../../icons/UIIcon'

const ACTION_OPTIONS: { value: ActionFlag; label: string }[] = [
  { value: 'suspect',   label: 'Suspect'   },
  { value: 'victim',    label: 'Victim'    },
  { value: 'witness',   label: 'Witness'   },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'unknown',   label: 'Unknown'   },
]

const RISK_OPTIONS: { value: RiskFlag; label: string }[] = [
  { value: 'HIGH',   label: 'High'   },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'LOW',    label: 'Low'    },
  { value: 'NONE',   label: 'None'   },
]

interface FilterPanelProps {
  onClose: () => void
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: 9.5, fontWeight: 700, color: 'var(--text-tertiary)',
      textTransform: 'uppercase', letterSpacing: '0.08em',
      marginBottom: 7, marginTop: 14,
    }}>
      {children}
    </div>
  )
}

function Chip({
  active, color, onClick, children,
}: {
  active: boolean
  color?: string
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '3px 8px', borderRadius: 'var(--r-xs)',
        border: `1px solid ${active ? (color ?? 'var(--accent)') + '66' : 'var(--border-subtle)'}`,
        background: active ? (color ?? 'var(--accent)') + '18' : 'var(--bg-raised)',
        color: active ? (color ?? 'var(--accent)') : 'var(--text-secondary)',
        fontSize: 11, fontWeight: active ? 600 : 400,
        cursor: 'pointer', transition: 'all 0.1s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={(e) => { if (!active) e.currentTarget.style.borderColor = 'var(--border-mid)' }}
      onMouseLeave={(e) => { if (!active) e.currentTarget.style.borderColor = 'var(--border-subtle)' }}
    >
      {children}
    </button>
  )
}

export function FilterPanel({ onClose }: FilterPanelProps) {
  const { filters, setFilters, clearFilters, nodes } = useGraphStore()

  const activeCount =
    filters.types.length + filters.risks.length +
    filters.actions.length + (filters.enrichedOnly ? 1 : 0)

  const toggle = <T extends string>(key: 'types' | 'risks' | 'actions', val: T) => {
    const arr = filters[key] as T[]
    setFilters({ [key]: arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val] })
  }

  // Live counts for each filter option
  const typeCounts = nodes.reduce((acc, n) => { acc[n.type] = (acc[n.type] ?? 0) + 1; return acc }, {} as Record<string, number>)
  const riskCounts = nodes.reduce((acc, n) => { acc[n.riskFlag] = (acc[n.riskFlag] ?? 0) + 1; return acc }, {} as Record<string, number>)
  const actionCounts = nodes.reduce((acc, n) => { acc[n.actionFlag] = (acc[n.actionFlag] ?? 0) + 1; return acc }, {} as Record<string, number>)
  const enrichedCount = nodes.filter(n => !!n.enrichmentData).length

  return (
    <div
      style={{
        position: 'absolute', top: 14, right: 14,
        width: 234, zIndex: 25,
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        border: '1px solid var(--glass-border)',
        borderRadius: 'var(--r-lg)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.14)',
        animation: 'fadeIn var(--dur-normal) var(--ease-out-quart) both',
      }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '11px 13px 11px',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
          <UIIcon name="filter" size={13} style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-primary)' }}>Filters</span>
          {activeCount > 0 && (
            <span style={{
              padding: '1px 5px', borderRadius: 'var(--r-xs)',
              background: 'var(--accent)', color: 'var(--bg-base)',
              fontSize: 10, fontWeight: 700,
            }}>
              {activeCount}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {activeCount > 0 && (
            <button
              onClick={clearFilters}
              style={{
                fontSize: 11, color: 'var(--text-tertiary)', cursor: 'pointer',
                padding: '2px 6px', borderRadius: 'var(--r-xs)', border: '1px solid var(--border-subtle)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)' }}
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            style={{ color: 'var(--text-tertiary)', display: 'flex', padding: 2, cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)' }}
          >
            <UIIcon name="close" size={12} />
          </button>
        </div>
      </div>

      <div style={{ padding: '0 13px 13px' }}>

        {/* Entity type */}
        <SectionLabel>Entity type</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {(Object.entries(ENTITY_CONFIG) as [EntityType, { label: string; color: string }][]).map(([type, cfg]) => (
            <Chip
              key={type}
              active={filters.types.includes(type)}
              color={cfg.color}
              onClick={() => toggle('types', type)}
            >
              {cfg.label}
              {typeCounts[type] ? <span style={{ marginLeft: 4, opacity: 0.65 }}>{typeCounts[type]}</span> : null}
            </Chip>
          ))}
        </div>

        {/* Risk level */}
        <SectionLabel>Risk level</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {RISK_OPTIONS.map(({ value, label }) => (
            <Chip
              key={value}
              active={filters.risks.includes(value)}
              color={value === 'NONE' ? undefined : RISK_COLORS[value]}
              onClick={() => toggle('risks', value)}
            >
              {label}
              {riskCounts[value] ? <span style={{ marginLeft: 4, opacity: 0.65 }}>{riskCounts[value]}</span> : null}
            </Chip>
          ))}
        </div>

        {/* Action flag */}
        <SectionLabel>Action flag</SectionLabel>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {ACTION_OPTIONS.map(({ value, label }) => (
            <Chip
              key={value}
              active={filters.actions.includes(value)}
              onClick={() => toggle('actions', value)}
            >
              {label}
              {actionCounts[value] ? <span style={{ marginLeft: 4, opacity: 0.65 }}>{actionCounts[value]}</span> : null}
            </Chip>
          ))}
        </div>

        {/* Enriched only toggle */}
        <div style={{
          marginTop: 14, paddingTop: 12,
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Enriched nodes only</span>
            <span style={{ fontSize: 11, color: 'var(--text-tertiary)', marginLeft: 6 }}>
              {enrichedCount}/{nodes.length}
            </span>
          </div>
          <button
            onClick={() => setFilters({ enrichedOnly: !filters.enrichedOnly })}
            style={{
              width: 34, height: 20, borderRadius: 10,
              background: filters.enrichedOnly ? 'var(--accent)' : 'var(--border-mid)',
              position: 'relative', cursor: 'pointer', flexShrink: 0,
              transition: 'background 0.15s',
            }}
          >
            <span style={{
              position: 'absolute', top: 2,
              left: filters.enrichedOnly ? 16 : 2,
              width: 16, height: 16, borderRadius: '50%',
              background: '#fff', transition: 'left 0.15s',
            }} />
          </button>
        </div>
      </div>
    </div>
  )
}
