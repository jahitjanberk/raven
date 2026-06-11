import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { SiteFooter } from '../components/SiteFooter'

const MONO   = "'IBM Plex Mono',ui-monospace,monospace"
const SANS   = "'Helvetica Neue',Helvetica,Arial,sans-serif"
const TEXT1  = '#0a0a0b'
const TEXT2  = '#3a3a3f'
const TEXT3  = '#9a9aa0'
const BORDER = '#ececee'
const BG2    = '#f8f8fa'

const SECTORS = [
  'Law enforcement',
  'Intelligence agency',
  'Financial crime compliance',
  'Fraud / SIU',
  'Financial intelligence unit',
  'Counter-fraud',
  'Cyber / threat intelligence',
  'Insurance',
  'Legal / compliance',
  'Other',
]

const TEAM_SIZES = ['1–5', '6–25', '26–100', '100+']

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <label style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: TEXT1 }}>
        {label}{required && <span style={{ color: '#dc2626', marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 13,
  padding: '10px 14px',
  border: `1px solid ${BORDER}`,
  outline: 'none',
  color: TEXT1,
  background: '#fff',
  width: '100%',
  boxSizing: 'border-box',
}

const selectStyle: React.CSSProperties = {
  ...inputStyle,
  appearance: 'none',
  WebkitAppearance: 'none',
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239a9aa0' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'right 12px center',
  paddingRight: 32,
  cursor: 'pointer',
}

export function RequestAccessPage() {
  const navigate = useNavigate()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    organisation: '',
    role: '',
    sector: '',
    teamSize: '',
    use: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [field]: e.target.value }))

  const validate = () => {
    const errs: Record<string, string> = {}
    if (!form.name.trim()) errs.name = 'Required'
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid email required'
    if (!form.organisation.trim()) errs.organisation = 'Required'
    if (!form.sector) errs.sector = 'Required'
    if (!form.use.trim()) errs.use = 'Required'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    // In production this would POST to /api/request-access
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div style={{ background: '#fff', color: TEXT1, fontFamily: SANS, WebkitFontSmoothing: 'antialiased', minHeight: '100vh' }}>
        <SiteHeader />
        <div style={{ maxWidth: 600, margin: '0 auto', padding: 'clamp(80px,12vw,160px) clamp(20px,4vw,48px)', textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h1 style={{ margin: '0 0 16px', fontWeight: 500, fontSize: 'clamp(28px,3.5vw,40px)', letterSpacing: '-.018em', lineHeight: 1.1 }}>
            Application received
          </h1>
          <p style={{ margin: '0 0 8px', fontSize: 16, lineHeight: 1.7, color: TEXT2 }}>
            We review every access request against our eligibility criteria and usually respond within 2 business days.
          </p>
          <p style={{ margin: '0 0 40px', fontSize: 14.5, lineHeight: 1.7, color: TEXT3 }}>
            We'll contact you at <strong style={{ color: TEXT1 }}>{form.email}</strong>
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/')}
              style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', background: TEXT1, color: '#fff', border: 'none', cursor: 'pointer', padding: '11px 22px' }}
            >
              Back to home
            </button>
            <button
              onClick={() => navigate('/platform')}
              style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', background: 'none', color: TEXT3, border: `1px solid ${BORDER}`, cursor: 'pointer', padding: '11px 22px' }}
            >
              Explore the platform
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ background: '#fff', color: TEXT1, fontFamily: SANS, WebkitFontSmoothing: 'antialiased', minHeight: '100vh' }}>
      <SiteHeader />

      <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(48px,7vw,96px) clamp(20px,4vw,48px)' }}>
        <div className="mobile-single-col" style={{ display: 'grid', gridTemplateColumns: '1fr 480px', gap: 'clamp(48px,6vw,96px)', alignItems: 'start' }}>

          {/* Left — context */}
          <div>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: TEXT3, marginBottom: 20 }}>Early access</div>
            <h1 style={{ margin: '0 0 20px', fontWeight: 500, fontSize: 'clamp(30px,4vw,52px)', letterSpacing: '-.022em', lineHeight: 1.06 }}>
              Request access to Raven.
            </h1>
            <p style={{ margin: '0 0 36px', fontSize: 'clamp(15px,1.4vw,18px)', lineHeight: 1.65, color: TEXT2 }}>
              Raven is currently available by application to verified teams in the financial crime, law enforcement, and intelligence community. We review each application against our eligibility criteria and onboard in cohorts.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0, borderTop: `1px solid ${BORDER}` }}>
              {[
                { step: '01', title: 'Submit application', body: 'Tell us about your team, sector, and intended use. Takes around 3 minutes.' },
                { step: '02', title: 'Review', body: 'We review every application. We typically respond within 2 business days.' },
                { step: '03', title: 'Onboarding call', body: 'A short call with the Raven team to configure your workspace and walk through the platform.' },
                { step: '04', title: 'Access granted', body: 'Your team gets access to a fully-provisioned workspace with a 30-day evaluation period.' },
              ].map(s => (
                <div key={s.step} style={{ display: 'flex', gap: 20, padding: '22px 0', borderBottom: `1px solid ${BORDER}`, alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.08em', color: TEXT3, flexShrink: 0, paddingTop: 3 }}>{s.step}</span>
                  <div>
                    <div style={{ fontWeight: 500, fontSize: 15, color: TEXT1, marginBottom: 4, letterSpacing: '-.01em' }}>{s.title}</div>
                    <div style={{ fontSize: 13.5, color: TEXT2, lineHeight: 1.6 }}>{s.body}</div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 36, padding: '20px 20px', background: BG2, border: `1px solid ${BORDER}` }}>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: TEXT3, marginBottom: 8 }}>Eligibility</div>
              <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.7, color: TEXT2 }}>
                Raven is available to organisations with a defined need for investigative link analysis — financial crime compliance, law enforcement, intelligence, fraud investigation, and related disciplines. We do not currently offer access to individuals without organisational affiliation.
              </p>
            </div>
          </div>

          {/* Right — form */}
          <div style={{ position: 'sticky', top: 80 }}>
            <form onSubmit={submit} style={{ border: `1px solid ${BORDER}`, padding: 'clamp(24px,3vw,40px)', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: TEXT3, marginBottom: 4 }}>Access application</div>

              <Field label="Full name" required>
                <input value={form.name} onChange={set('name')} placeholder="Jane Smith" style={{ ...inputStyle, borderColor: errors.name ? '#dc2626' : BORDER }} />
                {errors.name && <span style={{ fontFamily: MONO, fontSize: 10, color: '#dc2626' }}>{errors.name}</span>}
              </Field>

              <Field label="Work email" required>
                <input type="email" value={form.email} onChange={set('email')} placeholder="jane@organisation.com" style={{ ...inputStyle, borderColor: errors.email ? '#dc2626' : BORDER }} />
                {errors.email && <span style={{ fontFamily: MONO, fontSize: 10, color: '#dc2626' }}>{errors.email}</span>}
              </Field>

              <Field label="Organisation" required>
                <input value={form.organisation} onChange={set('organisation')} placeholder="Organisation name" style={{ ...inputStyle, borderColor: errors.organisation ? '#dc2626' : BORDER }} />
                {errors.organisation && <span style={{ fontFamily: MONO, fontSize: 10, color: '#dc2626' }}>{errors.organisation}</span>}
              </Field>

              <Field label="Your role">
                <input value={form.role} onChange={set('role')} placeholder="e.g. Senior Analyst, SIU Manager" style={inputStyle} />
              </Field>

              <Field label="Sector" required>
                <select value={form.sector} onChange={set('sector')} style={{ ...selectStyle, borderColor: errors.sector ? '#dc2626' : BORDER }}>
                  <option value="">Select sector</option>
                  {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.sector && <span style={{ fontFamily: MONO, fontSize: 10, color: '#dc2626' }}>{errors.sector}</span>}
              </Field>

              <Field label="Team size">
                <select value={form.teamSize} onChange={set('teamSize')} style={selectStyle}>
                  <option value="">Select range</option>
                  {TEAM_SIZES.map(s => <option key={s} value={s}>{s} analysts</option>)}
                </select>
              </Field>

              <Field label="Intended use" required>
                <textarea
                  value={form.use}
                  onChange={set('use')}
                  placeholder="Briefly describe the investigation type or use case you'd like to use Raven for."
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical', borderColor: errors.use ? '#dc2626' : BORDER }}
                />
                {errors.use && <span style={{ fontFamily: MONO, fontSize: 10, color: '#dc2626' }}>{errors.use}</span>}
              </Field>

              <button
                type="submit"
                style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', background: TEXT1, color: '#fff', border: 'none', cursor: 'pointer', padding: '13px 20px', marginTop: 4 }}
              >
                Submit application
              </button>

              <p style={{ margin: 0, fontFamily: MONO, fontSize: 10, color: TEXT3, lineHeight: 1.6 }}>
                By submitting, you agree to our{' '}
                <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => navigate('/privacy')}>Privacy Policy</span>
                {' '}and{' '}
                <span style={{ textDecoration: 'underline', cursor: 'pointer' }} onClick={() => navigate('/terms')}>Terms of Service</span>.
              </p>
            </form>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
