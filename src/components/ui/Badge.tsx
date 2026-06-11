import React from 'react'
import type { RiskLevel, Classification } from '../../types/project'

interface RiskBadgeProps { level: RiskLevel }

const RISK_CONFIG: Record<RiskLevel, { color: string; bg: string; border: string }> = {
  HIGH:    { color: 'var(--red)',          bg: 'var(--red-soft)',    border: 'var(--red-border)'   },
  MEDIUM:  { color: 'var(--amber)',        bg: 'var(--amber-soft)',  border: 'var(--amber-border)' },
  LOW:     { color: 'var(--green)',        bg: 'var(--green-soft)',  border: 'var(--green-border)' },
  UNKNOWN: { color: 'var(--text-tertiary)',bg: 'var(--bg-overlay)',  border: 'var(--border-subtle)' },
}

export function RiskBadge({ level }: RiskBadgeProps) {
  const cfg = RISK_CONFIG[level]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '2px 8px', borderRadius: 'var(--r-xs)',
      border: `1px solid ${cfg.border}`, background: cfg.bg, color: cfg.color,
      fontSize: 10, fontWeight: 600, fontFamily: 'var(--font-mono)', letterSpacing: '0.06em',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
      {level}
    </span>
  )
}

interface ClassificationBadgeProps { level: Classification }

const CLASS_CONFIG: Record<Classification, { label: string; color: string; bg: string; border: string }> = {
  'OFFICIAL':           { label: 'OFFICIAL', color: 'var(--accent)', bg: 'var(--accent-soft)', border: 'var(--accent-border)' },
  'OFFICIAL-SENSITIVE': { label: 'OFF-SENS', color: 'var(--amber)',  bg: 'var(--amber-soft)',  border: 'var(--amber-border)'  },
  'CUSTOM':             { label: 'CUSTOM',   color: 'var(--purple)', bg: 'var(--purple-soft)', border: 'rgba(139,110,216,0.25)' },
}

export function ClassificationBadge({ level }: ClassificationBadgeProps) {
  const cfg = CLASS_CONFIG[level]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '1px 6px', borderRadius: 'var(--r-xs)',
      border: `1px solid ${cfg.border}`, background: cfg.bg, color: cfg.color,
      fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-mono)', letterSpacing: '0.08em',
    }}>
      {cfg.label}
    </span>
  )
}

interface StatusDotProps { status: 'active' | 'paused' | 'closed' }

const STATUS_COLORS: Record<string, string> = {
  active: 'var(--green)',
  paused: 'var(--amber)',
  closed: 'var(--text-tertiary)',
}

export function StatusDot({ status }: StatusDotProps) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLORS[status], display: 'inline-block' }} />
      {status === 'active' && (
        <span style={{
          position: 'absolute', inset: -3, borderRadius: '50%',
          border: `1px solid ${STATUS_COLORS[status]}`,
          animation: 'pulse 2s ease-out infinite', opacity: 0.5,
        }} />
      )}
    </span>
  )
}
