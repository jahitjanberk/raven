import React from 'react'
import { useNavigate } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { SiteFooter } from '../components/SiteFooter'

const MONO = "'IBM Plex Mono',ui-monospace,monospace"
const SANS = "'Helvetica Neue',Helvetica,Arial,sans-serif"
const TEXT1 = '#0a0a0b'
const TEXT2 = '#26262a'
const TEXT3 = '#9a9aa0'
const BORDER = '#ececee'

const TRUST_STATS = [
  { value: 'TLS 1.3',      label: 'Encryption in transit' },
  { value: 'AES-256',      label: 'Encryption at rest' },
  { value: 'Append-only',  label: 'Audit trail' },
  { value: 'UK GDPR',      label: 'Data protection framework' },
]

const PRINCIPLES = [
  {
    slug: '01',
    name: 'Deployment Isolation',
    headline: 'Your investigation data never touches another customer\'s environment.',
    body: 'Every Raven deployment is fully isolated at the infrastructure level. There is no shared compute, no shared storage, and no shared networking between customers. Multi-tenancy is not a configuration option — isolation is the architecture.',
    detail: 'Separate database per deployment. No cross-customer API paths. Network-level isolation enforced at the infrastructure layer.',
    photo: 'photo-1558494949-ef010cbdcc31',
    photoAlt: 'Isolated server infrastructure in a secure data centre environment',
  },
  {
    slug: '02',
    name: 'Encryption',
    headline: 'Data encrypted in transit and at rest, everywhere.',
    body: 'All data in transit is protected by TLS 1.3. Data at rest is encrypted using AES-256 at the host storage layer. Passwords are hashed with bcrypt — plaintext credentials are never stored. Each deployment runs with its own secret key.',
    detail: 'TLS 1.3 everywhere. AES-256 at rest. bcrypt password hashing. Per-deployment secret keys.',
    photo: 'photo-1573804633927-bfcbcd909acd',
    photoAlt: 'Cryptographic security operations and data protection monitoring',
  },
  {
    slug: '03',
    name: 'Security Roadmap',
    headline: 'Honest about where we are and where we\'re going.',
    body: 'Raven does not currently hold third-party security certifications. We are building toward Cyber Essentials Plus, followed by a CREST-accredited penetration test and ISO/IEC 27001. We are transparent about this because a certificate we don\'t hold is a liability, not a credential — and procurement officers will find out.',
    detail: 'Target: Cyber Essentials Plus — H2 2026. Target: CREST pen test — H1 2027. Target: ISO/IEC 27001 — 2027.',
    photo: 'photo-1504384308090-c894fdcc538d',
    photoAlt: 'Secure government-grade technology assessment environment',
  },
  {
    slug: '04',
    name: 'Data Protection',
    headline: 'Privacy is architecture, not a policy document.',
    body: 'Raven is built to UK GDPR and the Data Protection Act 2018 from the ground up. Data minimisation, purpose limitation, and subject rights are built into the platform. A Data Protection Impact Assessment is available for every deployment, covering data flows, lawful basis, and retention controls.',
    detail: 'Purpose-based access controls. Automated data retention enforcement. Subject access request tooling. Full DPIA documentation.',
    photo: 'photo-1451187580459-43490279c0fa',
    photoAlt: 'Global data governance and privacy compliance monitoring',
  },
  {
    slug: '05',
    name: 'Audit & Access Control',
    headline: 'A complete, append-only record of every action.',
    body: 'Every operation in Raven — every node added, every enrichment run, every export generated — is logged with a timestamp, the performing user, and the data value. Audit logs are append-only and cannot be altered or deleted through the application. Access controls enforce the principle of least privilege at query time.',
    detail: 'Append-only audit log. Role-based access control. Complete investigation provenance from first node.',
    photo: 'photo-1526374965328-7f61d4dc18c5',
    photoAlt: 'Audit trail and access control monitoring system',
  },
]

const CURRENT_CONTROLS = [
  { name: 'TLS 1.3',               body: 'All API and browser traffic encrypted in transit. No plain-HTTP endpoints.' },
  { name: 'AES-256 at rest',        body: 'Host-level disk encryption on all deployment environments.' },
  { name: 'bcrypt password hashing',body: 'Passwords are never stored in plaintext. bcrypt with per-password salts.' },
  { name: 'JWT auth (24h expiry)',   body: 'Short-lived bearer tokens. Tokens are invalidated on logout.' },
  { name: 'Append-only audit log',   body: 'Every node, enrichment, and export event logged with user + timestamp. No delete endpoint.' },
  { name: 'UK GDPR / DPA 2018',     body: 'Data minimisation, purpose limitation, and DPIA documentation for every deployment.' },
]

const ROADMAP_CERTS = [
  { name: 'Cyber Essentials Plus',  target: 'H2 2026', body: 'NCSC baseline security controls, independently verified.' },
  { name: 'CREST Pen Test',         target: 'H1 2027', body: 'Annual penetration testing by a CREST-accredited provider.' },
  { name: 'ISO/IEC 27001',          target: '2027',    body: 'Information security management system, independently certified.' },
]

const DISCLOSURE_ROWS = [
  { label: 'Security contact',     value: 'security@raven.app' },
  { label: 'PGP key',              value: 'Available on request' },
  { label: 'Acknowledgement SLA',  value: '2 business days' },
  { label: 'Scope',                value: 'raven.app and all subdomains' },
  { label: 'Out of scope',         value: 'Social engineering, physical access, DDoS' },
  { label: 'Bug bounty',           value: 'Not currently available — researchers acknowledged in release notes' },
]

export function SecurityPage() {
  const navigate = useNavigate()

  return (
    <div style={{ background: '#fff', color: TEXT1, fontFamily: SANS, WebkitFontSmoothing: 'antialiased', lineHeight: 1.5, minHeight: '100vh' }}>
      <SiteHeader active="/security" />

      {/* ── Hero ───────────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', height: 'clamp(480px,65vh,720px)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(135deg,#e9e9eb,#e9e9eb 14px,#f3f3f5 14px,#f3f3f5 28px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9a9aa0' }}>photo · data centre</span>
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(105deg, rgba(4,4,6,0.94) 45%, rgba(4,4,6,0.6) 100%)' }} />
        <div style={{
          position: 'relative', zIndex: 1,
          maxWidth: 1320, margin: '0 auto',
          padding: 'clamp(72px,10vw,130px) clamp(20px,5vw,56px)',
          height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 22 }}>
            Security & Trust
          </div>
          <h1 style={{ margin: '0 0 22px', fontWeight: 500, fontSize: 'clamp(34px,5vw,68px)', lineHeight: 1.05, letterSpacing: '-.025em', color: '#fff', maxWidth: '20ch' }}>
            Security by design, not by addition
          </h1>
          <p style={{ margin: '0 0 36px', fontSize: 'clamp(16px,1.4vw,20px)', lineHeight: 1.6, color: 'rgba(255,255,255,0.58)', maxWidth: '50ch' }}>
            Investigations contain sensitive intelligence — victim identities, suspect networks, and classified case material. Raven is built to handle that data with the controls it requires: isolated deployments, encrypted storage, and an append-only audit trail on every action.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/contact?type=enterprise')}
              style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', background: '#fff', color: TEXT1, border: 'none', cursor: 'pointer', padding: '12px 24px' }}
            >
              Request the security pack →
            </button>
          </div>
        </div>
      </section>

      {/* ── Trust stats ────────────────────────────────────────────────────────── */}
      <section style={{ background: '#0a0a0b' }}>
        <div className="mobile-two-col" style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(24px,3vw,40px) clamp(20px,5vw,56px)', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }}>
          {TRUST_STATS.map((s, i) => (
            <div key={s.label} style={{ padding: 'clamp(12px,2vw,0px) clamp(20px,3vw,40px)', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
              <div style={{ fontFamily: MONO, fontSize: 'clamp(16px,2vw,26px)', fontWeight: 700, letterSpacing: '-.01em', color: '#fff', marginBottom: 4 }}>{s.value}</div>
              <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Principles ─────────────────────────────────────────────────────────── */}
      {PRINCIPLES.map((p, i) => {
        const isReversed = i % 2 === 1
        const TextPane = (
          <div style={{ padding: 'clamp(44px,5.5vw,72px) clamp(20px,5vw,60px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: TEXT3, marginBottom: 18 }}>
              {p.slug} — {p.name}
            </div>
            <h2 style={{ margin: '0 0 16px', fontWeight: 500, fontSize: 'clamp(20px,2.2vw,30px)', lineHeight: 1.2, letterSpacing: '-.012em' }}>
              {p.headline}
            </h2>
            <p style={{ margin: '0 0 24px', fontSize: 15, lineHeight: 1.75, color: TEXT2, maxWidth: '44ch' }}>
              {p.body}
            </p>
            <div style={{ padding: '14px 18px', background: i % 2 === 1 ? '#fff' : '#f8f8fa', borderLeft: '2px solid #d4d4d7' }}>
              <p style={{ margin: 0, fontFamily: MONO, fontSize: 11, lineHeight: 1.7, color: TEXT3 }}>
                {p.detail}
              </p>
            </div>
          </div>
        )
        const PhotoPane = (
          <div style={{ position: 'relative', overflow: 'hidden', minHeight: 'clamp(280px,36vw,520px)' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(135deg,#e9e9eb,#e9e9eb 14px,#f3f3f5 14px,#f3f3f5 28px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9a9aa0' }}>photo · security</span>
            </div>
          </div>
        )
        return (
          <section key={p.slug} style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 1 ? '#f8f8fa' : '#fff' }}>
            <div className="mobile-single-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', maxWidth: 1320, margin: '0 auto' }}>
              {isReversed ? <>{PhotoPane}{TextPane}</> : <>{TextPane}{PhotoPane}</>}
            </div>
          </section>
        )
      })}

      {/* ── Controls in place + Certification roadmap ─────────────────────────── */}
      <section style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(56px,6vw,88px) clamp(20px,5vw,56px)' }}>

          <div style={{ marginBottom: 'clamp(40px,5vw,64px)' }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color: TEXT3, marginBottom: 14 }}>
              Security posture
            </div>
            <h2 style={{ margin: 0, fontWeight: 500, fontSize: 'clamp(24px,2.8vw,40px)', lineHeight: 1.1, letterSpacing: '-.018em' }}>
              Controls in place today
            </h2>
          </div>

          <div className="mobile-single-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(36px,6vw,80px)', alignItems: 'start' }}>

            {/* Current controls */}
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {CURRENT_CONTROLS.map((c, i) => (
                  <div
                    key={c.name}
                    style={{
                      padding: 'clamp(18px,2vw,24px)',
                      background: i % 2 === 0 ? '#f8f8fa' : '#fff',
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} />
                      <div style={{ fontWeight: 500, fontSize: 14, color: TEXT1 }}>{c.name}</div>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: TEXT3, paddingLeft: 16 }}>{c.body}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Certification roadmap */}
            <div>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color: TEXT3, marginBottom: 20 }}>
                Certification roadmap
              </div>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: TEXT2, marginBottom: 28 }}>
                We do not currently hold any third-party security certifications. This is what we are working toward — with honest target dates, not marketing claims.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {ROADMAP_CERTS.map((c, i) => (
                  <div
                    key={c.name}
                    style={{
                      padding: 'clamp(18px,2vw,24px)',
                      background: i % 2 === 0 ? '#f8f8fa' : '#fff',
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                      <div style={{ fontWeight: 500, fontSize: 14, color: TEXT1 }}>{c.name}</div>
                      <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '.08em', textTransform: 'uppercase', color: TEXT3, border: `1px solid ${BORDER}`, padding: '3px 8px', flexShrink: 0, marginLeft: 8 }}>
                        Target {c.target}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.65, color: TEXT3 }}>{c.body}</p>
                  </div>
                ))}
              </div>
              <p style={{ marginTop: 20, fontSize: 12.5, lineHeight: 1.6, color: TEXT3, fontStyle: 'italic' }}>
                Enterprise customers can request our current security documentation — penetration test scope, DPIA, and architecture review — under NDA.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Responsible disclosure ─────────────────────────────────────────────── */}
      <section style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(56px,6vw,88px) clamp(20px,5vw,56px)' }}>
          <div className="mobile-single-col" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'clamp(36px,6vw,96px)', alignItems: 'start' }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color: TEXT3, marginBottom: 18 }}>
                Responsible Disclosure
              </div>
              <h2 style={{ margin: '0 0 16px', fontWeight: 500, fontSize: 'clamp(22px,2.4vw,32px)', lineHeight: 1.18, letterSpacing: '-.012em' }}>
                Report a vulnerability
              </h2>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: TEXT3 }}>
                We operate a responsible disclosure programme and commit to acknowledging reports promptly, providing regular updates, and recognising researchers who help us improve.
              </p>
            </div>
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                {DISCLOSURE_ROWS.map((row, i, arr) => (
                  <div
                    key={row.label}
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
                      padding: '16px 0',
                      borderBottom: i < arr.length - 1 ? `1px solid ${BORDER}` : 'none',
                      borderTop: i === 0 ? `1px solid ${BORDER}` : 'none',
                      flexWrap: 'wrap', gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 14, color: TEXT2, flexShrink: 0 }}>{row.label}</span>
                    <span style={{
                      fontFamily: MONO, fontSize: 11.5,
                      color: row.value.includes('@') ? TEXT1 : TEXT3,
                      maxWidth: '36ch', textAlign: 'right', lineHeight: 1.5,
                    }}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Full-width data centre image ────────────────────────────────────────── */}
      <section style={{ position: 'relative', height: 'clamp(200px,25vw,360px)', overflow: 'hidden', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(135deg,#e9e9eb,#e9e9eb 14px,#f3f3f5 14px,#f3f3f5 28px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9a9aa0' }}>photo · infrastructure</span>
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(4,4,6,0.65)' }} />
        <div style={{
          position: 'relative', zIndex: 1,
          maxWidth: 1320, margin: '0 auto',
          padding: 'clamp(32px,4vw,56px) clamp(20px,5vw,56px)',
          height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24,
        }}>
          <p style={{ margin: 0, fontSize: 'clamp(17px,1.8vw,24px)', fontWeight: 500, color: '#fff', maxWidth: '40ch', lineHeight: 1.4, letterSpacing: '-.01em' }}>
            Full security and compliance documentation is available to Enterprise customers on request.
          </p>
          <button
            onClick={() => navigate('/contact?type=enterprise')}
            style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', background: '#fff', color: TEXT1, border: 'none', cursor: 'pointer', padding: '13px 26px', flexShrink: 0 }}
          >
            Request the security pack →
          </button>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────────── */}
      <section style={{ background: '#0a0a0c', color: '#fff' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(72px,9vw,120px) clamp(20px,5vw,56px)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 32 }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
            Trust & compliance
          </div>
          <h2 style={{ margin: 0, fontWeight: 500, fontSize: 'clamp(28px,4vw,56px)', lineHeight: 1.08, letterSpacing: '-.02em', maxWidth: '24ch' }}>
            Request our full security documentation
          </h2>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/contact?type=enterprise')}
              style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', background: '#fff', color: '#0a0a0b', border: 'none', cursor: 'pointer', padding: '13px 28px' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e8e8e8' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
            >
              Get the security pack →
            </button>
            <button
              onClick={() => navigate('/platform')}
              style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', background: 'transparent', color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer', padding: '13px 28px' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.55)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}
            >
              Back to platform
            </button>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  )
}
