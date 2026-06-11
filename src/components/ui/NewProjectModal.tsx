import React, { useState, useEffect } from 'react'
import type { Classification, InvestigationType } from '../../types/project'
import { UIIcon } from '../../icons/UIIcon'
import { Button } from './Button'

interface NewProjectModalProps {
  onClose: () => void
  onCreate: (data: { name: string; caseRef: string; classification: Classification; investigationType: InvestigationType }) => void
  defaultClassification?: Classification
  defaultInvestigationType?: InvestigationType
}

const CLASSIFICATIONS: Classification[] = ['OFFICIAL', 'OFFICIAL-SENSITIVE', 'CUSTOM']
const INVESTIGATION_TYPES: InvestigationType[] = [
  'Fraud / Financial crime', 'Cyber / Infrastructure', 'OSINT / Research',
  'Counter-terrorism', 'Organised crime', 'Other',
]
const CLASS_DESCRIPTIONS: Record<Classification, string> = {
  'OFFICIAL':           'Standard government information',
  'OFFICIAL-SENSITIVE': 'Limited distribution — handle with care',
  'CUSTOM':             'Define your own classification',
}

export function NewProjectModal({ onClose, onCreate, defaultClassification = 'OFFICIAL', defaultInvestigationType = 'Fraud / Financial crime' }: NewProjectModalProps) {
  const [name, setName] = useState('')
  const [caseRef, setCaseRef] = useState('')
  const [classification, setClassification] = useState<Classification>(defaultClassification)
  const [investigationType, setInvestigationType] = useState<InvestigationType>(defaultInvestigationType)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleCreate = () => {
    if (!name.trim()) return
    onCreate({ name: name.trim(), caseRef, classification, investigationType })
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
          width: '100%', maxWidth: 480,
          boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
          transform: mounted ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.98)',
          transition: 'transform 0.15s ease',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Create new graph</h2>
            <p style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>Audit log starts from this moment.</p>
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
            onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
            placeholder="e.g. Operation Nightfall"
            style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-base)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-md)', color: 'var(--text-primary)', fontSize: 13, outline: 'none' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-border)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-soft)' }}
          />
        </div>

        {/* Case ref */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>
            Case reference <span style={{ fontSize: 10, fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--text-tertiary)' }}>optional</span>
          </label>
          <input
            value={caseRef}
            onChange={(e) => setCaseRef(e.target.value)}
            placeholder="e.g. NFIB-2026-0892"
            style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-base)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-md)', color: 'var(--text-primary)', fontSize: 13, fontFamily: 'var(--font-mono)', outline: 'none' }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-border)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-soft)' }}
          />
        </div>

        {/* Classification */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Classification</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6 }}>
            {CLASSIFICATIONS.map((cls) => (
              <button
                key={cls}
                onClick={() => setClassification(cls)}
                style={{
                  padding: '8px 6px', borderRadius: 'var(--r-md)', cursor: 'pointer', textAlign: 'center',
                  border: `1px solid ${classification === cls ? 'var(--accent-border)' : 'var(--border-soft)'}`,
                  background: classification === cls ? 'var(--accent-soft)' : 'var(--bg-base)',
                  color: classification === cls ? 'var(--accent)' : 'var(--text-secondary)',
                  fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-mono)', letterSpacing: '0.04em', transition: 'all 0.12s',
                }}
              >
                {cls === 'OFFICIAL-SENSITIVE' ? 'OFF-SENS' : cls}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 5 }}>{CLASS_DESCRIPTIONS[classification]}</p>
        </div>

        {/* Investigation type */}
        <div style={{ marginBottom: 24 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>Investigation type</label>
          <select
            value={investigationType}
            onChange={(e) => setInvestigationType(e.target.value as InvestigationType)}
            style={{ width: '100%', padding: '9px 12px', background: 'var(--bg-base)', border: '1px solid var(--border-soft)', borderRadius: 'var(--r-md)', color: 'var(--text-primary)', fontSize: 13, outline: 'none', cursor: 'pointer' }}
          >
            {INVESTIGATION_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleCreate} disabled={!name.trim()} icon="arrowRight" iconPosition="right">Create graph</Button>
        </div>
      </div>
    </div>
  )
}
