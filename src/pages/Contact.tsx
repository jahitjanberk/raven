import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { SiteFooter } from '../components/SiteFooter'

// ── Design tokens (matches landing / pricing aesthetic) ───────────────────────
const BG     = '#fff'
const BG2    = '#f8f8fa'
const BORDER = '#ececee'
const TEXT1  = '#0a0a0b'
const TEXT2  = '#3a3a3f'
const TEXT3  = '#9a9aa0'
const MONO   = "'IBM Plex Mono',ui-monospace,monospace"
const SANS   = "'Helvetica Neue',Helvetica,Arial,sans-serif"

// ── Enquiry types ─────────────────────────────────────────────────────────────

const ENQUIRY_TYPES = [
  {
    id: 'enterprise',
    label: 'Enterprise licensing',
    desc: 'Volume seats, air-gap deployment, framework contracts, or white-labelling.',
  },
  {
    id: 'law-enforcement',
    label: 'Law enforcement',
    desc: 'Accredited access for policing, national agencies, and prosecution services.',
  },
  {
    id: 'partnership',
    label: 'Partnership',
    desc: 'Integration, reseller, academic research, or data provider collaboration.',
  },
  {
    id: 'general',
    label: 'General enquiry',
    desc: 'Anything else — press, investor, or a question not covered above.',
  },
] as const

type EnquiryType = (typeof ENQUIRY_TYPES)[number]['id']

// ── Field component ───────────────────────────────────────────────────────────

function Field({
  label, required, hint, children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div style={{ marginBottom: 22 }}>
      <label style={{
        display: 'block', fontFamily: MONO, fontSize: 10, letterSpacing: '.1em',
        textTransform: 'uppercase', color: TEXT3, marginBottom: 8,
      }}>
        {label}
        {required && <span style={{ color: '#dc2626', marginLeft: 4 }}>*</span>}
      </label>
      {children}
      {hint && (
        <p style={{ margin: '6px 0 0', fontSize: 12, color: TEXT3, lineHeight: 1.5 }}>{hint}</p>
      )}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '11px 14px', fontSize: 14,
  background: BG2, border: `1px solid ${BORDER}`,
  color: TEXT1, outline: 'none', fontFamily: SANS,
  transition: 'border-color .15s',
}

function Input({ value, onChange, placeholder, type = 'text' }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string
}) {
  const [focused, setFocused] = useState(false)
  return (
    <input
      type={type} value={value} placeholder={placeholder}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...inputStyle, borderColor: focused ? TEXT1 : BORDER }}
    />
  )
}

function Textarea({ value, onChange, placeholder, rows = 5 }: {
  value: string; onChange: (v: string) => void; placeholder?: string; rows?: number
}) {
  const [focused, setFocused] = useState(false)
  return (
    <textarea
      value={value} placeholder={placeholder} rows={rows}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{ ...inputStyle, borderColor: focused ? TEXT1 : BORDER, resize: 'vertical', lineHeight: 1.6 }}
    />
  )
}

function Select({ value, onChange, options }: {
  value: string; onChange: (v: string) => void; options: { value: string; label: string }[]
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ ...inputStyle, cursor: 'pointer', appearance: 'none',
        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239a9aa0' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 14px center',
      }}
    >
      {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  )
}

// ── Thank you state ───────────────────────────────────────────────────────────

function ThankYou({ type }: { type: EnquiryType }) {
  const navigate = useNavigate()
  const next: Record<EnquiryType, { line: string; cta: string; ctaAction: () => void }> = {
    enterprise:      { line: 'A member of our enterprise team will be in touch within one business day.', cta: 'View pricing',  ctaAction: () => navigate('/pricing') },
    'law-enforcement': { line: 'Our public sector team will verify your details and respond within two business days.', cta: 'Read the docs', ctaAction: () => navigate('/docs') },
    partnership:     { line: 'Our partnerships team will review your submission and respond within three business days.', cta: 'Learn more', ctaAction: () => navigate('/about') },
    general:         { line: 'We read every message and will get back to you as soon as we can.', cta: 'Back to home', ctaAction: () => navigate('/') },
  }
  const { line, cta, ctaAction } = next[type]

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: SANS }}>
      <SiteHeader active="/contact" />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: 'clamp(80px,12vw,140px) clamp(20px,4vw,48px)', textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', border: `1.5px solid ${TEXT1}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10l4 4 8-8" stroke={TEXT1} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h1 style={{ fontWeight: 500, fontSize: 32, letterSpacing: '-.02em', marginBottom: 16, color: TEXT1 }}>Message received</h1>
        <p style={{ fontSize: 16, color: TEXT2, lineHeight: 1.65, marginBottom: 36 }}>{line}</p>
        <button
          onClick={ctaAction}
          style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.09em', textTransform: 'uppercase', padding: '12px 28px', border: `1px solid ${TEXT1}`, background: 'transparent', color: TEXT1, cursor: 'pointer', transition: 'all .15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = TEXT1; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = TEXT1 }}
        >
          {cta} →
        </button>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function ContactPage() {
  const [searchParams] = useSearchParams()
  const initialType = (searchParams.get('type') as EnquiryType) ?? 'enterprise'

  const [enquiryType, setEnquiryType] = useState<EnquiryType>(
    ENQUIRY_TYPES.some(t => t.id === initialType) ? initialType : 'enterprise'
  )
  const [submitted, setSubmitted] = useState(false)

  // Form fields
  const [name,        setName]        = useState('')
  const [org,         setOrg]         = useState('')
  const [email,       setEmail]       = useState('')
  const [role,        setRole]        = useState('')
  const [teamSize,    setTeamSize]    = useState('')
  const [jurisdiction, setJurisdiction] = useState('')
  const [badgeRef,    setBadgeRef]    = useState('')
  const [message,     setMessage]     = useState('')
  const [errors,      setErrors]      = useState<Record<string, string>>({})

  const validate = () => {
    const e: Record<string, string> = {}
    if (!name.trim())    e.name  = 'Name is required'
    if (!org.trim())     e.org   = 'Organisation is required'
    if (!email.trim())   e.email = 'Email is required'
    else if (!email.includes('@')) e.email = 'Enter a valid email address'
    if (!message.trim()) e.message = 'Please add a message so we can respond usefully'
    if (enquiryType === 'law-enforcement' && !jurisdiction.trim()) e.jurisdiction = 'Jurisdiction is required for law enforcement requests'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validate()) setSubmitted(true)
    // In production: POST to /api/contact or a Formspree / Resend endpoint
  }

  if (submitted) return <ThankYou type={enquiryType} />

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: SANS, WebkitFontSmoothing: 'antialiased', color: TEXT1 }}>
      <SiteHeader active="/contact" />

      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(20px,4vw,48px) 100px' }}>

        {/* Header */}
        <div style={{ padding: 'clamp(48px,7vw,88px) 0 clamp(36px,5vw,60px)' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: TEXT3, marginBottom: 18 }}>Contact</div>
          <h1 style={{ fontWeight: 500, fontSize: 'clamp(30px,4.5vw,52px)', letterSpacing: '-.022em', lineHeight: 1.08, margin: '0 0 18px', maxWidth: '18ch' }}>
            Get in touch with the right team
          </h1>
          <p style={{ fontSize: 'clamp(15px,1.5vw,18px)', color: TEXT2, lineHeight: 1.6, maxWidth: '46ch', margin: 0 }}>
            Select what brings you here and we'll route your request to the right people. We respond to every genuine enquiry.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 'clamp(40px,6vw,80px)', alignItems: 'start' }}>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>

            {/* Enquiry type selector */}
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: TEXT3, marginBottom: 14 }}>
                Enquiry type <span style={{ color: '#dc2626' }}>*</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {ENQUIRY_TYPES.map(t => {
                  const active = enquiryType === t.id
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setEnquiryType(t.id)}
                      style={{
                        padding: '14px 16px', textAlign: 'left', cursor: 'pointer',
                        border: `1px solid ${active ? TEXT1 : BORDER}`,
                        background: active ? TEXT1 : BG2,
                        transition: 'all .12s',
                      }}
                    >
                      <div style={{ fontSize: 13.5, fontWeight: 600, color: active ? '#fff' : TEXT1, marginBottom: 4 }}>
                        {t.label}
                      </div>
                      <div style={{ fontSize: 12, color: active ? 'rgba(255,255,255,0.6)' : TEXT3, lineHeight: 1.45 }}>
                        {t.desc}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Core fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
              <Field label="Full name" required>
                <Input value={name} onChange={setName} placeholder="Jane Smith" />
                {errors.name && <p style={{ margin: '5px 0 0', fontSize: 12, color: '#dc2626' }}>{errors.name}</p>}
              </Field>
              <Field label="Organisation" required>
                <Input value={org} onChange={setOrg} placeholder="ACME Intelligence Ltd" />
                {errors.org && <p style={{ margin: '5px 0 0', fontSize: 12, color: '#dc2626' }}>{errors.org}</p>}
              </Field>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
              <Field label="Work email" required>
                <Input type="email" value={email} onChange={setEmail} placeholder="jane@example.gov" />
                {errors.email && <p style={{ margin: '5px 0 0', fontSize: 12, color: '#dc2626' }}>{errors.email}</p>}
              </Field>
              <Field label="Role / title">
                <Input value={role} onChange={setRole} placeholder="Senior Intelligence Analyst" />
              </Field>
            </div>

            {/* Conditional: team size for enterprise */}
            {enquiryType === 'enterprise' && (
              <Field label="Estimated team size" hint="Helps us quote the right volume pricing.">
                <Select
                  value={teamSize}
                  onChange={setTeamSize}
                  options={[
                    { value: '',      label: 'Select…' },
                    { value: '1-5',   label: '1–5 analysts' },
                    { value: '6-20',  label: '6–20 analysts' },
                    { value: '21-50', label: '21–50 analysts' },
                    { value: '51-200',label: '51–200 analysts' },
                    { value: '200+',  label: '200+ analysts' },
                  ]}
                />
              </Field>
            )}

            {/* Conditional: law enforcement fields */}
            {enquiryType === 'law-enforcement' && (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 20px' }}>
                  <Field label="Jurisdiction / agency" required hint="Force, agency, or prosecution service name.">
                    <Input value={jurisdiction} onChange={setJurisdiction} placeholder="Metropolitan Police / NFIB" />
                    {errors.jurisdiction && <p style={{ margin: '5px 0 0', fontSize: 12, color: '#dc2626' }}>{errors.jurisdiction}</p>}
                  </Field>
                  <Field label="Warrant / badge reference" hint="Optional — helps us verify your request faster.">
                    <Input value={badgeRef} onChange={setBadgeRef} placeholder="PC 12345" />
                  </Field>
                </div>
                <div style={{
                  padding: '12px 16px', background: '#eff6ff', border: '1px solid #bfdbfe',
                  marginBottom: 22, fontSize: 13, color: '#1e40af', lineHeight: 1.6,
                }}>
                  <strong>Verification required.</strong> Law enforcement access requires a valid work email on a force or agency domain and a signed data processing agreement. Our public sector team will guide you through this.
                </div>
              </>
            )}

            {/* Message */}
            <Field label="Message" required hint={
              enquiryType === 'partnership'
                ? 'Tell us about the integration or collaboration you have in mind.'
                : enquiryType === 'law-enforcement'
                ? 'Describe the investigation context and what you need access to.'
                : 'Anything else that helps us respond usefully.'
            }>
              <Textarea
                value={message}
                onChange={setMessage}
                placeholder={
                  enquiryType === 'enterprise'      ? 'We run a fraud intelligence team of about 30 analysts and need…'
                  : enquiryType === 'law-enforcement' ? 'We are investigating a series of APP fraud cases and require…'
                  : enquiryType === 'partnership'     ? 'We are a threat intelligence data provider and would like to…'
                  : 'Hi, I wanted to ask about…'
                }
                rows={6}
              />
              {errors.message && <p style={{ margin: '5px 0 0', fontSize: 12, color: '#dc2626' }}>{errors.message}</p>}
            </Field>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
              <p style={{ margin: 0, fontSize: 12, color: TEXT3, maxWidth: '34ch', lineHeight: 1.5 }}>
                We will not add you to a mailing list or share your details with third parties.
              </p>
              <button
                type="submit"
                style={{
                  fontFamily: MONO, fontSize: 11.5, letterSpacing: '.08em', textTransform: 'uppercase',
                  padding: '13px 28px', background: TEXT1, color: '#fff', border: 'none',
                  cursor: 'pointer', transition: 'opacity .15s', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.opacity = '.82' }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
              >
                Send message →
              </button>
            </div>
          </form>

          {/* Right panel: contact details + context */}
          <aside style={{ paddingTop: 8 }}>

            {/* Direct contacts */}
            <div style={{ marginBottom: 36 }}>
              <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '.12em', textTransform: 'uppercase', color: TEXT3, marginBottom: 16 }}>
                Direct contacts
              </div>
              {[
                { role: 'Enterprise sales',   email: 'sales@raven.io',         note: 'Volume, framework, white-label' },
                { role: 'Law enforcement',    email: 'lex@raven.io',            note: 'Accredited access & DPA queries' },
                { role: 'Partnerships',       email: 'partners@raven.io',       note: 'Integrations & data providers' },
                { role: 'Press & media',      email: 'press@raven.io',          note: 'Interviews & background requests' },
                { role: 'Technical support',  email: 'support@raven.io',        note: 'Existing customers' },
              ].map(c => (
                <div key={c.role} style={{ paddingBottom: 14, marginBottom: 14, borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '.07em', textTransform: 'uppercase', color: TEXT3, marginBottom: 4 }}>
                    {c.role}
                  </div>
                  <a href={`mailto:${c.email}`} style={{ fontSize: 13.5, color: TEXT1, textDecoration: 'none', display: 'block', marginBottom: 2 }}>
                    {c.email}
                  </a>
                  <div style={{ fontSize: 12, color: TEXT3 }}>{c.note}</div>
                </div>
              ))}
            </div>

            {/* Response times */}
            <div style={{ padding: '18px 20px', background: BG2, border: `1px solid ${BORDER}` }}>
              <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '.12em', textTransform: 'uppercase', color: TEXT3, marginBottom: 14 }}>
                Response times
              </div>
              {[
                { label: 'Enterprise',        time: '1 business day' },
                { label: 'Law enforcement',   time: '2 business days' },
                { label: 'Partnership',       time: '3 business days' },
                { label: 'General enquiry',   time: 'Best efforts' },
              ].map(r => (
                <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontSize: 13, color: TEXT2 }}>{r.label}</span>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: TEXT3 }}>{r.time}</span>
                </div>
              ))}
            </div>

            {/* Office */}
            <div style={{ marginTop: 24, fontSize: 13, color: TEXT3, lineHeight: 1.7 }}>
              <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 8 }}>
                Registered office
              </div>
              Raven Technologies Inc.<br />
              One Canada Square, Level 39<br />
              Canary Wharf, London E14 5AB<br />
              United Kingdom
            </div>
          </aside>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
