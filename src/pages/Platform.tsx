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

const CAPABILITIES = [
  { value: '17',         label: 'Entity types' },
  { value: '8',          label: 'OSINT sources' },
  { value: 'STIX 2.1',  label: 'Native export' },
  { value: 'STANAG 2511', label: 'Intel grading' },
]

const PILLARS = [
  {
    slug: '01',
    name: 'Graph Canvas',
    headline: 'Map the network. Follow the money.',
    body: 'Raven\'s interactive canvas lets you build and interrogate complex entity networks — placing nodes, drawing relationships, and navigating a living picture of a fraud or infrastructure investigation. Multiple auto-layout algorithms and a map view for geolocation work handle thousands of entities without performance degradation.',
    points: [
      'Drag-and-drop canvas with auto-layout algorithms',
      'Map view for geolocated entities and infrastructure',
      'Node clustering, filtering, and full-text search',
      'Timeline panel for chronological case analysis',
    ],
    photo: 'photo-1504384308090-c894fdcc538d',
    photoAlt: 'Multi-screen investigation workstation showing complex network data',
  },
  {
    slug: '02',
    name: 'Entity Types',
    headline: 'Every entity a financial crime investigator encounters.',
    body: 'Seventeen entity types cover the complete investigation surface: IP addresses, domains, email addresses, persons, organisations, phone numbers, crypto wallets, bank accounts, SSL certificates, social profiles, company registrations, transactions, takedowns, locations, fraud reports, and file hashes. Each node carries risk flags, action flags, and analyst-assigned confidence levels.',
    points: [
      '17 entity types across digital and financial domains',
      'Risk flags: HIGH / MEDIUM / LOW per node',
      'Action flags: suspect, victim, witness, confirmed',
      'Analyst confidence grading per node and relationship',
    ],
    photo: 'photo-1551288049-bebda4e38f71',
    photoAlt: 'Data analytics dashboard showing categorised entity intelligence',
  },
  {
    slug: '03',
    name: 'Intel Grading',
    headline: 'NATO-standard grading built into the data model.',
    body: 'Every relationship in Raven carries a STANAG 2511 intelligence grade — source reliability (A through D) and information accuracy (1 through 4). Grades are encoded in the graph, travel with exports, and are visible on every edge in the canvas. You don\'t retrofit standards onto output — they\'re part of the model from the first node.',
    points: [
      'STANAG 2511 source reliability grades A–D',
      'Information accuracy grading 1–4',
      'Grade visualised on every relationship edge',
      'Grades preserved in STIX 2.1 export and audit trail',
    ],
    photo: 'photo-1573804633927-bfcbcd909acd',
    photoAlt: 'Intelligence analyst working with graded assessment data on screen',
  },
  {
    slug: '04',
    name: 'OSINT Enrichment',
    headline: 'One click from indicator to intelligence.',
    body: 'Select any entity and enrich it instantly against a curated set of open-source intelligence sources. Raven surfaces reputation data, associated infrastructure, company records, and linked entities — and proposes them for addition to the graph. Enrichment sends only the entity value to the provider, never your graph or case notes.',
    points: [
      'IP, domain, email, wallet, and company enrichment',
      'Auto-discovered linked entities proposed for graph',
      'Source attribution on every enrichment field',
      'Privacy-preserving: only the indicator value is sent',
    ],
    photo: 'photo-1526374965328-7f61d4dc18c5',
    photoAlt: 'Code and data streams representing open-source intelligence gathering',
  },
  {
    slug: '05',
    name: 'Case Output',
    headline: 'Start with the right shape. Finish with a classified export.',
    body: 'Pre-built case templates for the most common fraud patterns — APP fraud, phishing, BEC, and romance scam — pre-populate the graph so analysts focus on filling specifics rather than building from scratch. Export as STIX 2.1 for TAXII sharing, classified PNG for briefings, or Raven JSON for team handoff.',
    points: [
      'APP fraud, phishing, BEC, romance scam templates',
      'STIX 2.1 bundle export for TAXII and ISAC feeds',
      'Classified PNG with case markings for briefings',
      'Watchlist monitoring across active investigations',
    ],
    photo: 'photo-1507679799987-c73779587ccf',
    photoAlt: 'Professional analyst preparing structured case output documentation',
  },
]

const INTEGRATIONS = [
  'Shodan', 'WHOIS / RDAP', 'VirusTotal', 'Have I Been Pwned',
  'Companies House', 'Blockchain explorers', 'AbuseIPDB',
  'URLScan.io', 'IPinfo.io', 'crt.sh', 'STIX / TAXII', 'CSV bulk import',
]

function AppMockup() {
  return (
    <div style={{
      position: 'relative',
      borderRadius: 10,
      overflow: 'hidden',
      boxShadow: '0 48px 96px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)',
      background: '#1a1a1c',
    }}>
      {/* Chrome bar */}
      <div style={{
        height: 38, background: '#232326',
        display: 'flex', alignItems: 'center',
        padding: '0 14px', gap: 8,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
      }}>
        <div style={{ display: 'flex', gap: 6 }}>
          {['#ff5f56','#ffbd2e','#27c93f'].map(c => (
            <div key={c} style={{ width: 11, height: 11, borderRadius: '50%', background: c, opacity: 0.9 }} />
          ))}
        </div>
        <div style={{ flex: 1, height: 20, background: '#1a1a1c', borderRadius: 4, margin: '0 12px', display: 'flex', alignItems: 'center', paddingLeft: 10 }}>
          <span style={{ fontFamily: MONO, fontSize: 9, color: 'rgba(255,255,255,0.25)', letterSpacing: '.04em' }}>raven.app/app</span>
        </div>
      </div>
      {/* Screenshot */}
      <div style={{ width: '100%', height: 520, background: 'repeating-linear-gradient(135deg,#1a1a1c,#1a1a1c 14px,#141416 14px,#141416 28px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>photo · app screenshot</span>
      </div>
      {/* Overlay label */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        background: 'linear-gradient(transparent, rgba(4,4,6,0.88))',
        padding: '32px 20px 18px',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', marginBottom: 4 }}>Active case</div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: 'rgba(255,255,255,0.75)' }}>Operation Hartfield — APP Fraud Network</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[
            { n: '24', l: 'entities' },
            { n: '31', l: 'links' },
            { n: 'B2',  l: 'grade' },
          ].map(s => (
            <div key={s.l} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.06)', padding: '6px 10px', borderRadius: 4 }}>
              <div style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: '#fff', lineHeight: 1 }}>{s.n}</div>
              <div style={{ fontFamily: MONO, fontSize: 8, color: 'rgba(255,255,255,0.38)', letterSpacing: '.08em', textTransform: 'uppercase', marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function PlatformPage() {
  const navigate = useNavigate()

  return (
    <div style={{ background: '#fff', color: TEXT1, fontFamily: SANS, WebkitFontSmoothing: 'antialiased', lineHeight: 1.5, minHeight: '100vh' }}>
      <SiteHeader active="/platform" />

      {/* ── Hero ───────────────────────────────────────────────────────────────── */}
      <section style={{ background: '#0a0a0b', overflow: 'hidden' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(72px,9vw,120px) clamp(20px,5vw,56px) 0' }}>
          <div className="mobile-single-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr', gap: 'clamp(40px,5vw,72px)', alignItems: 'center' }}>

            {/* Text */}
            <div style={{ paddingBottom: 'clamp(56px,7vw,96px)' }}>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 24 }}>
                The Platform
              </div>
              <h1 style={{ margin: '0 0 24px', fontWeight: 500, fontSize: 'clamp(32px,4.5vw,62px)', lineHeight: 1.06, letterSpacing: '-.025em', color: '#fff', maxWidth: '16ch' }}>
                Graph-native link analysis for fraud investigation
              </h1>
              <p style={{ margin: '0 0 40px', fontSize: 'clamp(16px,1.3vw,19px)', lineHeight: 1.6, color: 'rgba(255,255,255,0.55)', maxWidth: '44ch' }}>
                Map entity networks, enrich indicators against eight OSINT sources, grade every link to NATO standard, and export classified outputs — in a single investigation workflow.
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <button
                  onClick={() => navigate('/contact?type=enterprise')}
                  style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', background: '#fff', color: TEXT1, border: 'none', cursor: 'pointer', padding: '13px 26px' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#e8e8e8' }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
                >
                  Request a demo →
                </button>
                <button
                  onClick={() => navigate('/docs')}
                  style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', background: 'transparent', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer', padding: '13px 26px' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)' }}
                >
                  Read the docs
                </button>
              </div>
            </div>

            {/* App mockup — slides up from bottom */}
            <div style={{ alignSelf: 'flex-end', paddingTop: 40 }}>
              <AppMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ── Capability strip ───────────────────────────────────────────────────── */}
      <section style={{ background: '#f8f8fa', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(28px,3.5vw,44px) clamp(20px,5vw,56px)' }}>
          <div className="mobile-two-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 0 }}>
            {CAPABILITIES.map((c, i) => (
              <div key={c.label} style={{ padding: 'clamp(12px,2vw,20px) clamp(16px,2.5vw,32px)', borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none' }}>
                <div style={{ fontFamily: MONO, fontSize: 'clamp(18px,2.2vw,28px)', fontWeight: 700, letterSpacing: '-.02em', color: TEXT1, marginBottom: 4 }}>
                  {c.value}
                </div>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: TEXT3 }}>
                  {c.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pillars ────────────────────────────────────────────────────────────── */}
      {PILLARS.map((p, i) => {
        const isReversed = i % 2 === 1
        const TextPane = (
          <div style={{ padding: 'clamp(48px,6vw,80px) clamp(20px,5vw,60px)', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: TEXT3, marginBottom: 20 }}>
              {p.slug} — {p.name}
            </div>
            <h2 style={{ margin: '0 0 18px', fontWeight: 500, fontSize: 'clamp(22px,2.4vw,34px)', lineHeight: 1.14, letterSpacing: '-.015em' }}>
              {p.headline}
            </h2>
            <p style={{ margin: '0 0 32px', fontSize: 15, lineHeight: 1.75, color: TEXT2, maxWidth: '44ch' }}>
              {p.body}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {p.points.map((pt, j) => (
                <div key={j} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '11px 0', borderTop: `1px solid ${BORDER}` }}>
                  <span style={{ fontFamily: MONO, fontSize: 10, color: TEXT3, marginTop: 3, flexShrink: 0 }}>→</span>
                  <span style={{ fontSize: 14, color: TEXT2, lineHeight: 1.5 }}>{pt}</span>
                </div>
              ))}
            </div>
          </div>
        )
        const PhotoPane = (
          <div style={{ position: 'relative', overflow: 'hidden', minHeight: 'clamp(300px,40vw,560px)' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(135deg,#e9e9eb,#e9e9eb 14px,#f3f3f5 14px,#f3f3f5 28px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9a9aa0' }}>photo · product feature</span>
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

      {/* ── Integrations ───────────────────────────────────────────────────────── */}
      <section style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(56px,6vw,88px) clamp(20px,5vw,56px)' }}>
          <div className="mobile-single-col" style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 'clamp(36px,6vw,96px)', alignItems: 'start' }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color: TEXT3, marginBottom: 18 }}>
                Integrations
              </div>
              <h2 style={{ margin: '0 0 16px', fontWeight: 500, fontSize: 'clamp(22px,2.4vw,34px)', lineHeight: 1.15, letterSpacing: '-.012em' }}>
                OSINT sources built in. CSV for everything else.
              </h2>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: TEXT3 }}>
                Push and pull STIX 2.1 bundles over TAXII, or import any structured data via CSV.
              </p>
            </div>
            <div>
              <p style={{ margin: '0 0 28px', fontSize: 'clamp(15px,1.2vw,17px)', lineHeight: 1.7, color: TEXT2 }}>
                Raven ships with enrichment integrations to the OSINT sources investigators actually use — reputation feeds, infrastructure registries, blockchain explorers, and company databases. No API keys required for standard enrichment; bring your own for increased rate limits.
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {INTEGRATIONS.map(name => (
                  <span key={name} style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.03em', color: TEXT2, border: `1px solid ${BORDER}`, padding: '7px 13px', background: '#f8f8fa' }}>
                    {name}
                  </span>
                ))}
                <span style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.03em', color: TEXT3, border: `1px dashed ${BORDER}`, padding: '7px 13px' }}>
                  + more via roadmap
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Security note ──────────────────────────────────────────────────────── */}
      <section style={{ borderBottom: `1px solid ${BORDER}`, background: '#f8f8fa' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(40px,5vw,64px) clamp(20px,5vw,56px)' }}>
          <div className="mobile-single-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'clamp(24px,4vw,48px)' }}>
            {[
              { label: 'Data isolation',     body: 'Every deployment is fully isolated. Your data is never co-mingled with another customer\'s.' },
              { label: 'Encrypted at rest',      body: 'Data is encrypted at rest at the host storage layer. Credentials are never stored in plaintext.' },
              { label: 'Full audit trail',   body: 'Every node added, every enrichment run, every export — logged with timestamp, user, and data value.' },
            ].map(s => (
              <div key={s.label} style={{ paddingTop: 'clamp(16px,2vw,24px)', borderTop: `2px solid ${BORDER}` }}>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: TEXT3, marginBottom: 10 }}>{s.label}</div>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: TEXT2 }}>{s.body}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/security')}
              style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.09em', textTransform: 'uppercase', background: 'none', color: TEXT3, border: `1px solid ${BORDER}`, cursor: 'pointer', padding: '7px 14px' }}
            >
              Full security documentation →
            </button>
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────────── */}
      <section style={{ background: '#0a0a0c', color: '#fff' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(72px,9vw,120px) clamp(20px,5vw,56px)', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 32 }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
            Get started
          </div>
          <h2 style={{ margin: 0, fontWeight: 500, fontSize: 'clamp(28px,4vw,56px)', lineHeight: 1.08, letterSpacing: '-.02em', maxWidth: '22ch' }}>
            Start a free investigation today, or talk to us about your team
          </h2>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/contact?type=enterprise')}
              style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', background: '#fff', color: '#0a0a0b', border: 'none', cursor: 'pointer', padding: '13px 28px' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e8e8e8' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
            >
              Request a demo →
            </button>
            <button
              onClick={() => navigate('/docs')}
              style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', background: 'transparent', color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer', padding: '13px 28px' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.55)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}
            >
              Read the docs
            </button>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  )
}
