import React, { useState, useEffect } from 'react'
import type { EntityType } from '../../types/graph'
import { ENTITY_CONFIG } from '../../types/graph'
import { UIIcon } from '../../icons/UIIcon'

interface AddNodeModalProps {
  onClose: () => void
  onAdd: (type: EntityType, value: string, note?: string, metadata?: Record<string, string>) => void
}

const ENTITY_TYPES = Object.entries(ENTITY_CONFIG) as [EntityType, typeof ENTITY_CONFIG[EntityType]][]

const PLACEHOLDERS: Record<EntityType, string> = {
  ip:          '185.220.101.47',
  domain:      'malicious-update.net',
  email:       'threat@actor.io',
  person:      'John Doe',
  org:         'ACME Corp Ltd',
  phone:       '+44 7700 900000',
  wallet:      '1A1zP1eP5QGefi2DMPTfTL5SLmv7Divf...',
  url:         'https://example.com/path',
  bank:        'GB82WEST12345698765432',
  cert:        'sha256:aa:bb:cc:dd... or example.com',
  social:      '@username',
  company:     'Acme Trading Ltd',
  transaction: 'TXN-20260415-001 or £5,000.00',
  takedown:    'phishing-site.com or 185.220.101.47',
  location:    '123 High Street, London, EC1A 1BB',
  fraudreport: 'NFIB2026/12345 or AF-2026-123456',
  hash:        'sha256:aabbcc... or md5:aabb...',
}


const SOCIAL_PLATFORMS   = ['Telegram', 'Instagram', 'X / Twitter', 'LinkedIn', 'TikTok', 'Facebook', 'YouTube', 'Discord']
const JURISDICTIONS      = ['UK', 'US', 'EU', 'Other']
const CURRENCIES         = ['GBP', 'USD', 'EUR', 'BTC', 'ETH']
const TX_CHANNELS        = ['Faster Payments', 'CHAPS', 'SWIFT', 'BACS', 'Cash', 'Card']
const TAKEDOWN_URGENCY   = ['Low', 'Medium', 'High', 'Critical']
const TAKEDOWN_STATUS    = ['Draft', 'Submitted', 'Acknowledged', 'Resolved']
const REPORT_SOURCES     = ['NFIB', 'Action Fraud', 'CIFAS', 'NCA', 'Other']
const REPORT_STATUS      = ['Open', 'Under investigation', 'Closed']

function detectEntityType(value: string): EntityType | null {
  const v = value.trim()
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(v)) return 'ip'
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'email'
  if (/^https?:\/\//.test(v)) return 'url'
  if (/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(v) || /^0x[a-fA-F0-9]{40}$/.test(v)) return 'wallet'
  if (/^[A-Z]{2}\d{2}[A-Z0-9]{4}\d{7}([A-Z0-9]?){0,16}$/.test(v.replace(/\s/g, ''))) return 'bank'
  if (/^[+\d\s\-()]{7,}$/.test(v)) return 'phone'
  if (/^([a-z0-9-]+\.)+[a-z]{2,}$/i.test(v)) return 'domain'
  return null
}

// Extra structured fields shown only for the 4 new entity types
function MetaFields({
  type,
  metadata,
  onChange,
}: {
  type: EntityType
  metadata: Record<string, string>
  onChange: (key: string, value: string) => void
}) {
  const fieldStyle: React.CSSProperties = {
    width: '100%', padding: '8px 10px',
    background: 'var(--bg-base)', border: '1px solid var(--border-soft)',
    borderRadius: 'var(--r-sm)', color: 'var(--text-primary)',
    fontSize: 12.5, fontFamily: 'var(--font-mono)', outline: 'none',
  }
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 10.5, fontWeight: 600,
    color: 'var(--text-tertiary)', marginBottom: 4,
  }

  if (type === 'bank') return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <div>
          <label style={labelStyle}>Sort code</label>
          <input value={metadata.sortCode ?? ''} onChange={e => onChange('sortCode', e.target.value)}
            placeholder="20-71-06" style={fieldStyle}
            onFocus={e => { e.currentTarget.style.borderColor = ENTITY_CONFIG.bank.color + '66' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-soft)' }}
          />
        </div>
        <div>
          <label style={labelStyle}>Account no.</label>
          <input value={metadata.accountNo ?? ''} onChange={e => onChange('accountNo', e.target.value)}
            placeholder="12345678" style={fieldStyle}
            onFocus={e => { e.currentTarget.style.borderColor = ENTITY_CONFIG.bank.color + '66' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-soft)' }}
          />
        </div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>Bank name</label>
        <input value={metadata.bankName ?? ''} onChange={e => onChange('bankName', e.target.value)}
          placeholder="Barclays Bank UK PLC" style={{ ...fieldStyle, fontFamily: 'var(--font-sans)' }}
          onFocus={e => { e.currentTarget.style.borderColor = ENTITY_CONFIG.bank.color + '66' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-soft)' }}
        />
      </div>
    </>
  )

  if (type === 'cert') return (
    <>
      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>SHA-256 fingerprint</label>
        <input value={metadata.fingerprint ?? ''} onChange={e => onChange('fingerprint', e.target.value)}
          placeholder="aa:bb:cc:dd:ee:ff:00:11..." style={fieldStyle}
          onFocus={e => { e.currentTarget.style.borderColor = ENTITY_CONFIG.cert.color + '66' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-soft)' }}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <div>
          <label style={labelStyle}>Issuer</label>
          <input value={metadata.issuer ?? ''} onChange={e => onChange('issuer', e.target.value)}
            placeholder="Let's Encrypt R3" style={{ ...fieldStyle, fontFamily: 'var(--font-sans)' }}
            onFocus={e => { e.currentTarget.style.borderColor = ENTITY_CONFIG.cert.color + '66' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-soft)' }}
          />
        </div>
        <div>
          <label style={labelStyle}>Common name</label>
          <input value={metadata.cn ?? ''} onChange={e => onChange('cn', e.target.value)}
            placeholder="*.example.com" style={fieldStyle}
            onFocus={e => { e.currentTarget.style.borderColor = ENTITY_CONFIG.cert.color + '66' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-soft)' }}
          />
        </div>
      </div>
    </>
  )

  if (type === 'social') return (
    <>
      <div style={{ marginBottom: 10 }}>
        <label style={labelStyle}>Platform</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {SOCIAL_PLATFORMS.map(p => {
            const active = (metadata.platform ?? '') === p
            return (
              <button key={p} onClick={() => onChange('platform', p)} style={{
                padding: '4px 9px', borderRadius: 'var(--r-sm)', fontSize: 11, cursor: 'pointer',
                border: `1px solid ${active ? ENTITY_CONFIG.social.color + '66' : 'var(--border-subtle)'}`,
                background: active ? ENTITY_CONFIG.social.color + '1A' : 'var(--bg-raised)',
                color: active ? ENTITY_CONFIG.social.color : 'var(--text-tertiary)',
                fontWeight: active ? 600 : 400, transition: 'all 0.1s',
              }}>
                {p}
              </button>
            )
          })}
        </div>
      </div>
    </>
  )

  if (type === 'transaction') return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <div>
          <label style={labelStyle}>Amount</label>
          <input value={metadata.amount ?? ''} onChange={e => onChange('amount', e.target.value)}
            placeholder="5000.00" style={fieldStyle}
            onFocus={e => { e.currentTarget.style.borderColor = ENTITY_CONFIG.transaction.color + '66' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-soft)' }}
          />
        </div>
        <div>
          <label style={labelStyle}>Currency</label>
          <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
            {CURRENCIES.map(c => {
              const active = (metadata.currency ?? '') === c
              return (
                <button key={c} onClick={() => onChange('currency', c)} style={{
                  padding: '4px 6px', borderRadius: 'var(--r-sm)', fontSize: 10, cursor: 'pointer',
                  border: `1px solid ${active ? ENTITY_CONFIG.transaction.color + '66' : 'var(--border-subtle)'}`,
                  background: active ? ENTITY_CONFIG.transaction.color + '1A' : 'var(--bg-raised)',
                  color: active ? ENTITY_CONFIG.transaction.color : 'var(--text-tertiary)',
                  fontWeight: active ? 600 : 400, transition: 'all 0.1s',
                }}>{c}</button>
              )
            })}
          </div>
        </div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>Channel</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {TX_CHANNELS.map(ch => {
            const active = (metadata.channel ?? '') === ch
            return (
              <button key={ch} onClick={() => onChange('channel', ch)} style={{
                padding: '4px 8px', borderRadius: 'var(--r-sm)', fontSize: 10.5, cursor: 'pointer',
                border: `1px solid ${active ? ENTITY_CONFIG.transaction.color + '66' : 'var(--border-subtle)'}`,
                background: active ? ENTITY_CONFIG.transaction.color + '1A' : 'var(--bg-raised)',
                color: active ? ENTITY_CONFIG.transaction.color : 'var(--text-tertiary)',
                fontWeight: active ? 600 : 400, transition: 'all 0.1s',
              }}>{ch}</button>
            )
          })}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <div>
          <label style={labelStyle}>Date</label>
          <input value={metadata.date ?? ''} onChange={e => onChange('date', e.target.value)}
            placeholder="2026-04-15" style={fieldStyle}
            onFocus={e => { e.currentTarget.style.borderColor = ENTITY_CONFIG.transaction.color + '66' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-soft)' }}
          />
        </div>
        <div>
          <label style={labelStyle}>Reference</label>
          <input value={metadata.reference ?? ''} onChange={e => onChange('reference', e.target.value)}
            placeholder="REF123456" style={fieldStyle}
            onFocus={e => { e.currentTarget.style.borderColor = ENTITY_CONFIG.transaction.color + '66' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-soft)' }}
          />
        </div>
      </div>
    </>
  )

  if (type === 'takedown') return (
    <>
      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>Hosting provider / registrar</label>
        <input value={metadata.provider ?? ''} onChange={e => onChange('provider', e.target.value)}
          placeholder="Cloudflare, Inc." style={{ ...fieldStyle, fontFamily: 'var(--font-sans)' }}
          onFocus={e => { e.currentTarget.style.borderColor = ENTITY_CONFIG.takedown.color + '66' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-soft)' }}
        />
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>Abuse contact email</label>
        <input value={metadata.abuseEmail ?? ''} onChange={e => onChange('abuseEmail', e.target.value)}
          placeholder="abuse@cloudflare.com" style={fieldStyle}
          onFocus={e => { e.currentTarget.style.borderColor = ENTITY_CONFIG.takedown.color + '66' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-soft)' }}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <div>
          <label style={labelStyle}>Urgency</label>
          <div style={{ display: 'flex', gap: 3 }}>
            {TAKEDOWN_URGENCY.map(u => {
              const active = (metadata.urgency ?? '') === u
              return (
                <button key={u} onClick={() => onChange('urgency', u)} style={{
                  flex: 1, padding: '5px 0', borderRadius: 'var(--r-sm)', fontSize: 10, cursor: 'pointer',
                  border: `1px solid ${active ? ENTITY_CONFIG.takedown.color + '66' : 'var(--border-subtle)'}`,
                  background: active ? ENTITY_CONFIG.takedown.color + '1A' : 'var(--bg-raised)',
                  color: active ? ENTITY_CONFIG.takedown.color : 'var(--text-tertiary)',
                  fontWeight: active ? 600 : 400, transition: 'all 0.1s',
                }}>{u}</button>
              )
            })}
          </div>
        </div>
        <div>
          <label style={labelStyle}>Status</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {TAKEDOWN_STATUS.map(s => {
              const active = (metadata.status ?? '') === s
              return (
                <button key={s} onClick={() => onChange('status', s)} style={{
                  padding: '4px 6px', borderRadius: 'var(--r-sm)', fontSize: 10, cursor: 'pointer', textAlign: 'left',
                  border: `1px solid ${active ? ENTITY_CONFIG.takedown.color + '66' : 'var(--border-subtle)'}`,
                  background: active ? ENTITY_CONFIG.takedown.color + '1A' : 'var(--bg-raised)',
                  color: active ? ENTITY_CONFIG.takedown.color : 'var(--text-tertiary)',
                  fontWeight: active ? 600 : 400, transition: 'all 0.1s',
                }}>{s}</button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )

  if (type === 'location') return (
    <>
      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>Full address</label>
        <input value={metadata.address ?? ''} onChange={e => onChange('address', e.target.value)}
          placeholder="123 High Street" style={{ ...fieldStyle, fontFamily: 'var(--font-sans)' }}
          onFocus={e => { e.currentTarget.style.borderColor = ENTITY_CONFIG.location.color + '66' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-soft)' }}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <div>
          <label style={labelStyle}>Postcode</label>
          <input value={metadata.postcode ?? ''} onChange={e => onChange('postcode', e.target.value)}
            placeholder="EC1A 1BB" style={fieldStyle}
            onFocus={e => { e.currentTarget.style.borderColor = ENTITY_CONFIG.location.color + '66' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-soft)' }}
          />
        </div>
        <div>
          <label style={labelStyle}>City</label>
          <input value={metadata.city ?? ''} onChange={e => onChange('city', e.target.value)}
            placeholder="London" style={{ ...fieldStyle, fontFamily: 'var(--font-sans)' }}
            onFocus={e => { e.currentTarget.style.borderColor = ENTITY_CONFIG.location.color + '66' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-soft)' }}
          />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <div>
          <label style={labelStyle}>Country</label>
          <div style={{ display: 'flex', gap: 3 }}>
            {JURISDICTIONS.map(j => {
              const active = (metadata.country ?? '') === j
              return (
                <button key={j} onClick={() => onChange('country', j)} style={{
                  flex: 1, padding: '5px 0', borderRadius: 'var(--r-sm)', fontSize: 10, cursor: 'pointer',
                  border: `1px solid ${active ? ENTITY_CONFIG.location.color + '66' : 'var(--border-subtle)'}`,
                  background: active ? ENTITY_CONFIG.location.color + '1A' : 'var(--bg-raised)',
                  color: active ? ENTITY_CONFIG.location.color : 'var(--text-tertiary)',
                  fontWeight: active ? 600 : 400, transition: 'all 0.1s',
                }}>{j}</button>
              )
            })}
          </div>
        </div>
        <div>
          <label style={labelStyle}>Coordinates (lat, lng)</label>
          <input value={metadata.coords ?? ''} onChange={e => onChange('coords', e.target.value)}
            placeholder="51.5074, -0.1278" style={fieldStyle}
            onFocus={e => { e.currentTarget.style.borderColor = ENTITY_CONFIG.location.color + '66' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-soft)' }}
          />
        </div>
      </div>
    </>
  )

  if (type === 'fraudreport') return (
    <>
      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>Source</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {REPORT_SOURCES.map(s => {
            const active = (metadata.reportType ?? '') === s
            return (
              <button key={s} onClick={() => onChange('reportType', s)} style={{
                padding: '4px 9px', borderRadius: 'var(--r-sm)', fontSize: 11, cursor: 'pointer',
                border: `1px solid ${active ? ENTITY_CONFIG.fraudreport.color + '66' : 'var(--border-subtle)'}`,
                background: active ? ENTITY_CONFIG.fraudreport.color + '1A' : 'var(--bg-raised)',
                color: active ? ENTITY_CONFIG.fraudreport.color : 'var(--text-tertiary)',
                fontWeight: active ? 600 : 400, transition: 'all 0.1s',
              }}>{s}</button>
            )
          })}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <div>
          <label style={labelStyle}>Date reported</label>
          <input value={metadata.reportedDate ?? ''} onChange={e => onChange('reportedDate', e.target.value)}
            placeholder="2026-04-15" style={fieldStyle}
            onFocus={e => { e.currentTarget.style.borderColor = ENTITY_CONFIG.fraudreport.color + '66' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-soft)' }}
          />
        </div>
        <div>
          <label style={labelStyle}>Status</label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {REPORT_STATUS.map(s => {
              const active = (metadata.caseStatus ?? '') === s
              return (
                <button key={s} onClick={() => onChange('caseStatus', s)} style={{
                  padding: '4px 6px', borderRadius: 'var(--r-sm)', fontSize: 10, cursor: 'pointer', textAlign: 'left',
                  border: `1px solid ${active ? ENTITY_CONFIG.fraudreport.color + '66' : 'var(--border-subtle)'}`,
                  background: active ? ENTITY_CONFIG.fraudreport.color + '1A' : 'var(--bg-raised)',
                  color: active ? ENTITY_CONFIG.fraudreport.color : 'var(--text-tertiary)',
                  fontWeight: active ? 600 : 400, transition: 'all 0.1s',
                }}>{s}</button>
              )
            })}
          </div>
        </div>
      </div>
      <div style={{ marginBottom: 8 }}>
        <label style={labelStyle}>Force / reporting body</label>
        <input value={metadata.force ?? ''} onChange={e => onChange('force', e.target.value)}
          placeholder="Metropolitan Police Service" style={{ ...fieldStyle, fontFamily: 'var(--font-sans)' }}
          onFocus={e => { e.currentTarget.style.borderColor = ENTITY_CONFIG.fraudreport.color + '66' }}
          onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-soft)' }}
        />
      </div>
    </>
  )

  if (type === 'company') return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 8 }}>
        <div>
          <label style={labelStyle}>Jurisdiction</label>
          <div style={{ display: 'flex', gap: 4 }}>
            {JURISDICTIONS.map(j => {
              const active = (metadata.jurisdiction ?? '') === j
              return (
                <button key={j} onClick={() => onChange('jurisdiction', j)} style={{
                  flex: 1, padding: '6px 0', borderRadius: 'var(--r-sm)', fontSize: 11, cursor: 'pointer',
                  border: `1px solid ${active ? ENTITY_CONFIG.company.color + '66' : 'var(--border-subtle)'}`,
                  background: active ? ENTITY_CONFIG.company.color + '1A' : 'var(--bg-raised)',
                  color: active ? ENTITY_CONFIG.company.color : 'var(--text-tertiary)',
                  fontWeight: active ? 600 : 400, transition: 'all 0.1s',
                }}>
                  {j}
                </button>
              )
            })}
          </div>
        </div>
        <div>
          <label style={labelStyle}>Reg. number</label>
          <input value={metadata.regNo ?? ''} onChange={e => onChange('regNo', e.target.value)}
            placeholder="12345678" style={fieldStyle}
            onFocus={e => { e.currentTarget.style.borderColor = ENTITY_CONFIG.company.color + '66' }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--border-soft)' }}
          />
        </div>
      </div>
    </>
  )

  return null
}

const EXTENDED_TYPES = new Set<EntityType>(['bank', 'cert', 'social', 'company', 'transaction', 'takedown', 'location', 'fraudreport'])

export function AddNodeModal({ onClose, onAdd }: AddNodeModalProps) {
  const [selectedType, setSelectedType] = useState<EntityType>('ip')
  const [value, setValue] = useState('')
  const [note, setNote] = useState('')
  const [metadata, setMetadata] = useState<Record<string, string>>({})
  const [mounted, setMounted] = useState(false)
  const [autoDetected, setAutoDetected] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  const handleTypeSelect = (type: EntityType) => {
    setSelectedType(type)
    setAutoDetected(false)
    setMetadata({})
  }

  const handleValueChange = (v: string) => {
    setValue(v)
    const detected = detectEntityType(v)
    if (detected) { setSelectedType(detected); setAutoDetected(true) }
    else setAutoDetected(false)
  }

  const handleMetaChange = (key: string, val: string) => {
    setMetadata(prev => ({ ...prev, [key]: val }))
  }

  const handleAdd = () => {
    if (!value.trim()) return
    const cleanMeta = Object.fromEntries(Object.entries(metadata).filter(([, v]) => v.trim()))
    onAdd(selectedType, value.trim(), note.trim() || undefined, Object.keys(cleanMeta).length ? cleanMeta : undefined)
    onClose()
  }

  const cfg = ENTITY_CONFIG[selectedType]

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        opacity: mounted ? 1 : 0, transition: 'opacity 0.12s',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
          borderRadius: 'var(--r-xl)', padding: '24px',
          width: '100%', maxWidth: 480,
          boxShadow: '0 8px 40px rgba(0,0,0,0.7)',
          transform: mounted ? 'translateY(0)' : 'translateY(10px)',
          transition: 'transform 0.12s',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Add entity</h2>
          <button onClick={onClose} style={{ color: 'var(--text-tertiary)', display: 'flex', padding: 4, borderRadius: 'var(--r-sm)' }}>
            <UIIcon name="close" size={14} />
          </button>
        </div>

        {/* Entity type grid — 4 columns, 3 rows */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 6, marginBottom: 16 }}>
          {ENTITY_TYPES.map(([type, ecfg]) => (
            <button
              key={type}
              onClick={() => handleTypeSelect(type)}
              style={{
                padding: '8px 4px', borderRadius: 'var(--r-md)',
                border: `1px solid ${selectedType === type ? ecfg.color + '66' : 'var(--border-subtle)'}`,
                background: selectedType === type ? ecfg.color + '18' : 'var(--bg-raised)',
                color: selectedType === type ? ecfg.color : 'var(--text-tertiary)',
                fontSize: 10.5, fontWeight: 500, cursor: 'pointer',
                textAlign: 'center', transition: 'all 0.1s',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
              }}
            >
              <UIIcon name={type} size={16} strokeWidth={1.5} />
              {ecfg.label}
            </button>
          ))}
        </div>

        {autoDetected && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '5px 10px', marginBottom: 10,
            background: 'var(--accent-soft)', border: '1px solid var(--accent-border)',
            borderRadius: 'var(--r-sm)', fontSize: 11.5, color: 'var(--accent)',
          }}>
            <UIIcon name="sparkle" size={12} />
            Auto-detected as {cfg.label}
          </div>
        )}

        {/* Primary value */}
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
            {selectedType === 'bank' ? 'IBAN / Account identifier' :
             selectedType === 'cert' ? 'Domain or fingerprint' :
             selectedType === 'social' ? 'Username / handle' :
             selectedType === 'company' ? 'Company name' :
             selectedType === 'transaction' ? 'Reference or amount' :
             selectedType === 'takedown' ? 'Target (domain / IP / URL)' :
             selectedType === 'location' ? 'Address or place name' :
             selectedType === 'fraudreport' ? 'Report reference number' : 'Value'}
            {' '}<span style={{ color: 'var(--red)' }}>*</span>
          </label>
          <input
            autoFocus
            value={value}
            onChange={(e) => handleValueChange(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !EXTENDED_TYPES.has(selectedType)) handleAdd() }}
            placeholder={PLACEHOLDERS[selectedType]}
            style={{
              width: '100%', padding: '9px 12px',
              background: 'var(--bg-base)', border: '1px solid var(--border-soft)',
              borderRadius: 'var(--r-md)', color: 'var(--text-primary)',
              fontSize: 13, fontFamily: 'var(--font-mono)', outline: 'none',
              transition: 'border-color 0.12s',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = cfg.color + '66' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-soft)' }}
          />
        </div>

        {/* Entity-specific structured fields */}
        {EXTENDED_TYPES.has(selectedType) && (
          <div style={{
            marginBottom: 12, padding: '12px 12px 4px',
            background: 'var(--bg-base)', borderRadius: 'var(--r-md)',
            border: `1px solid ${cfg.color}22`,
          }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 10 }}>
              {selectedType === 'bank' ? 'Account details' :
               selectedType === 'cert' ? 'Certificate details' :
               selectedType === 'social' ? 'Profile details' :
               selectedType === 'transaction' ? 'Transaction details' :
               selectedType === 'takedown' ? 'Report details' :
               selectedType === 'location' ? 'Location details' :
               selectedType === 'fraudreport' ? 'Case details' : 'Registration details'}
            </div>
            <MetaFields type={selectedType} metadata={metadata} onChange={handleMetaChange} />
          </div>
        )}

        {/* Note */}
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 5 }}>
            Note <span style={{ fontSize: 10, fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: 'var(--text-tertiary)' }}>optional</span>
          </label>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd() }}
            placeholder="Context or analyst note…"
            style={{
              width: '100%', padding: '9px 12px',
              background: 'var(--bg-base)', border: '1px solid var(--border-soft)',
              borderRadius: 'var(--r-md)', color: 'var(--text-primary)',
              fontSize: 13, outline: 'none', transition: 'border-color 0.12s',
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-border)' }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-soft)' }}
          />
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={onClose}
            style={{ padding: '7px 14px', borderRadius: 'var(--r-sm)', border: '1px solid var(--border-soft)', background: 'var(--bg-raised)', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer' }}
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!value.trim()}
            style={{
              padding: '7px 16px', borderRadius: 'var(--r-sm)',
              border: 'none', fontSize: 13, fontWeight: 500, cursor: value.trim() ? 'pointer' : 'not-allowed',
              background: value.trim() ? cfg.color : 'var(--bg-overlay)',
              color: value.trim() ? '#fff' : 'var(--text-tertiary)',
              transition: 'all 0.12s', opacity: value.trim() ? 1 : 0.5,
            }}
          >
            Add to graph
          </button>
        </div>
      </div>
    </div>
  )
}
