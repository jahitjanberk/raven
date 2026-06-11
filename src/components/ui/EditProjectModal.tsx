import React, { useState, useEffect } from 'react'
import type { Classification, InvestigationType, RiskLevel, ProjectStatus, Project } from '../../types/project'
import { UIIcon } from '../../icons/UIIcon'
import { Button } from './Button'

interface EditProjectModalProps {
  project: Project
  onClose: () => void
  onSave: (patch: Partial<Project>) => void
}

const CLASSIFICATIONS: Classification[] = ['OFFICIAL', 'OFFICIAL-SENSITIVE', 'CUSTOM']
const INVESTIGATION_TYPES: InvestigationType[] = [
  'Fraud / Financial crime', 'Cyber / Infrastructure', 'OSINT / Research',
  'Counter-terrorism', 'Organised crime', 'Other',
]
const RISK_LEVELS: RiskLevel[] = ['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN']
const STATUSES: ProjectStatus[] = ['active', 'paused', 'closed']

const RISK_COLORS: Record<RiskLevel, string> = {
  HIGH: 'var(--red)', MEDIUM: 'var(--amber)', LOW: 'var(--green)', UNKNOWN: 'var(--text-tertiary)',
}
const STATUS_LABELS: Record<ProjectStatus, string> = {
  active: '● Active', paused: '⏸ Paused', closed: '✓ Closed',
}
const STATUS_COLORS: Record<ProjectStatus, string> = {
  active: 'var(--green)', paused: 'var(--amber)', closed: 'var(--text-tertiary)',
}

function inputStyle(focused: boolean): React.CSSProperties {
  return {
    width: '100%', padding: '9px 12px', boxSizing: 'border-box',
    background: 'var(--bg-base)', border: `1px solid ${focused ? 'var(--accent-border)' : 'var(--border-soft)'}`,
    borderRadius: 'var(--r-md)', color: 'var(--text-primary)', fontSize: 13,
    outline: 'none', transition: 'border-color 0.12s',
  }
}

export function EditProjectModal({ project, onClose, onSave }: EditProjectModalProps) {
  const [name, setName] = useState(project.name)
  const [caseRef, setCaseRef] = useState(project.caseRef ?? '')
  const [classification, setClassification] = useState<Classification>(project.classification)
  const [investigationType, setInvestigationType] = useState<InvestigationType>(project.investigationType)
  const [status, setStatus] = useState<ProjectStatus>(project.status)
  const [riskLevel, setRiskLevel] = useState<RiskLevel>(project.riskLevel)
  const [nameFocused, setNameFocused] = useState(false)
  const [caseRefFocused, setCaseRefFocused] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSave = () => {
    if (!name.trim()) return
    onSave({
      name: name.trim(),
      caseRef: caseRef.trim() || undefined,
      classification,
      investigationType,
      status,
      riskLevel,
    })
    onClose()
  }

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        opacity: mounted ? 1 : 0, transition: 'opacity 0.15s ease',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
          borderRadius: 'var(--r-xl)', padding: '28px 28px 24px',
          width: '100%', maxWidth: 480, maxHeight: '92vh', overflowY: 'auto',
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          transform: mounted ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.98)',
          transition: 'transform 0.15s ease',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Edit investigation</h2>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Changes apply immediately and are persisted.</p>
          </div>
          <button
            onClick={onClose}
            style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--r-sm)', color: 'var(--text-tertiary)', border: '1px solid var(--border-subtle)', background: 'var(--bg-raised)' }}
          >
            <UIIcon name="close" size={13} />
          </button>
        </div>

        {/* Name */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
            Graph name <span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
            style={inputStyle(nameFocused)}
          />
        </div>

        {/* Case ref */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
            Case reference{' '}
            <span style={{ fontSize: 10, fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--text-tertiary)' }}>optional</span>
          </label>
          <input
            value={caseRef}
            onChange={(e) => setCaseRef(e.target.value)}
            placeholder="e.g. NFIB-2026-0892"
            onFocus={() => setCaseRefFocused(true)}
            onBlur={() => setCaseRefFocused(false)}
            style={{ ...inputStyle(caseRefFocused), fontFamily: 'var(--font-mono)' }}
          />
        </div>

        {/* Classification */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Classification</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {CLASSIFICATIONS.map((cls) => (
              <button key={cls} onClick={() => setClassification(cls)} style={{
                padding: '8px 6px', borderRadius: 'var(--r-md)', cursor: 'pointer', textAlign: 'center',
                border: `1px solid ${classification === cls ? 'var(--accent-border)' : 'var(--border-soft)'}`,
                background: classification === cls ? 'var(--accent-soft)' : 'var(--bg-base)',
                color: classification === cls ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', transition: 'all 0.12s',
              }}>
                {cls === 'OFFICIAL-SENSITIVE' ? 'OFF-SENS' : cls}
              </button>
            ))}
          </div>
        </div>

        {/* Investigation type */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Investigation type</label>
          <select
            value={investigationType}
            onChange={(e) => setInvestigationType(e.target.value as InvestigationType)}
            style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-base)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-md)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', cursor: 'pointer' }}
          >
            {INVESTIGATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Status */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Status</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {STATUSES.map((s) => (
              <button key={s} onClick={() => setStatus(s)} style={{
                padding: '8px 6px', borderRadius: 'var(--r-md)', cursor: 'pointer', textAlign: 'center',
                border: `1px solid ${status === s ? STATUS_COLORS[s] : 'var(--border-soft)'}`,
                background: status === s ? `${STATUS_COLORS[s]}18` : 'var(--bg-base)',
                color: status === s ? STATUS_COLORS[s] : 'var(--text-secondary)',
                fontSize: 11.5, fontWeight: 600, transition: 'all 0.12s',
              }}>
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Risk level */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Risk level</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6 }}>
            {RISK_LEVELS.map((r) => (
              <button key={r} onClick={() => setRiskLevel(r)} style={{
                padding: '7px 4px', borderRadius: 'var(--r-md)', cursor: 'pointer', textAlign: 'center',
                border: `1px solid ${riskLevel === r ? RISK_COLORS[r] : 'var(--border-soft)'}`,
                background: riskLevel === r ? `${RISK_COLORS[r]}18` : 'var(--bg-base)',
                color: riskLevel === r ? RISK_COLORS[r] : 'var(--text-secondary)',
                fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', transition: 'all 0.12s',
              }}>
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={!name.trim()}>Save changes</Button>
        </div>
      </div>
    </div>
  )
}
