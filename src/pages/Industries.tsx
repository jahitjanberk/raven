import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { SiteFooter } from '../components/SiteFooter'

const MONO = "'IBM Plex Mono',ui-monospace,monospace"
const SANS = "'Helvetica Neue',Helvetica,Arial,sans-serif"
const TEXT1 = '#0a0a0b'
const TEXT2 = '#26262a'
const TEXT3 = '#9a9aa0'
const BORDER = '#ececee'

const SECTORS = [
  {
    slug: '01',
    name: 'Law Enforcement',
    headline: 'Build the network map that holds up in court.',
    body: 'Police forces, the NCA, and national agencies use Raven to map serious and organised crime networks and build evidential-quality entity pictures. Intelligence grades, classification markings, and full audit trails are built in from the first node.',
    path: '/industries/law-enforcement',
    photo: 'photo-1590856029826-c7a73142bbf1',
    tag: 'Police, NCA & national agencies',
  },
  {
    slug: '02',
    name: 'Financial Crime',
    headline: 'Trace the APP fraud chain. Map the mule network.',
    body: 'Fraud and financial crime teams at banks use Raven to trace authorised push payment fraud chains and map mule account networks. See the full graph, not just the alert.',
    path: '/industries/financial-crime',
    photo: 'photo-1554224155-8d04cb21cd6c',
    tag: 'Banks, PSPs & payment firms',
  },
  {
    slug: '03',
    name: 'Financial Intel Units',
    headline: 'From suspicious activity to a shareable entity picture.',
    body: 'FIUs and MLRO teams use Raven to build the entity picture behind SARs, investigate patterns across cases, and share structured intelligence with law enforcement via STIX 2.1.',
    path: '/industries/financial-intel-units',
    photo: 'photo-1460925895917-afdab827c52f',
    tag: 'FIUs, MLROs & financial intelligence',
  },
  {
    slug: '04',
    name: 'Counter-Fraud',
    headline: 'Detect identity fraud rings. Coordinate the response.',
    body: 'Government counter-fraud units at HMRC, DWP, and local authorities use Raven to map identity fraud networks and coordinate intelligence across departments.',
    path: '/industries/counter-fraud',
    photo: 'photo-1450101499163-c8848c66ca85',
    tag: 'HMRC, DWP & local authorities',
  },
  {
    slug: '05',
    name: 'Cyber & Threat Intel',
    headline: 'From indicator to infrastructure map in one session.',
    body: 'Threat intelligence and incident response teams use Raven to map attacker infrastructure, correlate IOCs across campaigns, and produce STIX 2.1 bundles for community sharing.',
    path: '/industries/cyber-threat-intel',
    photo: 'photo-1526374965328-7f61d4dc18c5',
    tag: 'Threat intelligence & incident response',
  },
  {
    slug: '06',
    name: 'Intelligence Agencies',
    headline: 'Adversary networks. Graded. Classified. On your terms.',
    body: 'Analysts at national and regional intelligence agencies use Raven to build adversary network maps with classification markings and NATO grading encoded in the data — not applied at export time.',
    path: '/industries/intelligence-agencies',
    photo: 'photo-1451187580459-43490279c0fa',
    tag: 'National & regional intelligence',
  },
  {
    slug: '07',
    name: 'Insurance',
    headline: 'Map organised fraud rings. Build the case for recovery.',
    body: 'Fraud investigation units at insurers use Raven to map organised fraud rings, identify shared infrastructure across staged claims, and build structured cases for prosecution or civil recovery.',
    path: '/industries/insurance',
    photo: 'photo-1507679799987-c73779587ccf',
    tag: 'Insurance fraud & SIU teams',
  },
  {
    slug: '08',
    name: 'Legal & Compliance',
    headline: 'Entity diagrams for the boardroom and the courtroom.',
    body: 'Financial crime law firms and in-house compliance teams use Raven to build court-ready entity relationship diagrams and share structured findings across the case team.',
    path: '/industries/legal-compliance',
    photo: 'photo-1589829545856-d10d557cf95f',
    tag: 'Law firms & compliance teams',
  },
]

const DIFFERENTIATORS = [
  {
    index: '01',
    title: 'Graph-native from day one',
    body: 'Raven was built for graph analysis — not adapted from a flat case management tool. The canvas, the data model, and the export formats are all designed around entity networks.',
  },
  {
    index: '02',
    title: 'STIX 2.1 throughout',
    body: 'Every investigation can be exported as a properly-formed STIX 2.1 bundle. Entity types, relationships, and grading all map to STIX vocabulary — no manual translation required.',
  },
  {
    index: '03',
    title: 'Intel grading in the data model',
    body: 'NATO STANAG 2511 source evaluation and information reliability grades are required fields — not optional annotations. The picture that leaves Raven is honest about what is known versus assessed.',
  },
]

function SectorCard({ sector, onNavigate }: { sector: typeof SECTORS[0]; onNavigate: (p: string) => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={() => onNavigate(sector.path)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', overflow: 'hidden', cursor: 'pointer',
        aspectRatio: '4/3',
        transition: 'box-shadow .2s ease',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.18)' : 'none',
      }}
    >
      {/* Photo */}
      <div style={{
        position: 'absolute', inset: 0,
        background: 'repeating-linear-gradient(135deg,#e9e9eb,#e9e9eb 14px,#f3f3f5 14px,#f3f3f5 28px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transition: 'transform .4s ease',
        transform: hovered ? 'scale(1.04)' : 'scale(1)',
      }}>
        <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9a9aa0' }}>photo · {sector.name.toLowerCase()}</span>
      </div>
      {/* Gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: hovered
          ? 'linear-gradient(175deg, rgba(4,4,6,0.28) 0%, rgba(4,4,6,0.88) 100%)'
          : 'linear-gradient(175deg, rgba(4,4,6,0.18) 0%, rgba(4,4,6,0.82) 100%)',
        transition: 'background .25s ease',
      }} />
      {/* Content */}
      <div style={{ position: 'absolute', inset: 0, padding: 'clamp(16px,2vw,24px)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)' }}>
            {sector.slug}
          </span>
          <span style={{
            fontFamily: MONO, fontSize: 9, letterSpacing: '.08em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.2)',
            padding: '3px 7px',
            opacity: hovered ? 1 : 0, transition: 'opacity .2s',
          }}>
            View →
          </span>
        </div>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 6 }}>
            {sector.tag}
          </div>
          <h3 style={{ margin: '0 0 8px', fontWeight: 500, fontSize: 'clamp(15px,1.6vw,19px)', lineHeight: 1.25, letterSpacing: '-.01em', color: '#fff' }}>
            {sector.name}
          </h3>
          <p style={{
            margin: 0, fontSize: 12.5, lineHeight: 1.55, color: 'rgba(255,255,255,0.65)',
            maxHeight: hovered ? 80 : 0, overflow: 'hidden',
            transition: 'max-height .3s ease, opacity .25s ease',
            opacity: hovered ? 1 : 0,
          }}>
            {sector.headline}
          </p>
        </div>
      </div>
    </div>
  )
}

export function IndustriesPage() {
  const navigate = useNavigate()

  return (
    <div style={{ background: '#fff', color: TEXT1, fontFamily: SANS, WebkitFontSmoothing: 'antialiased', lineHeight: 1.5, minHeight: '100vh' }}>
      <SiteHeader active="/industries" />

      {/* ── Hero ───────────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', height: 'clamp(500px,70vh,760px)', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(135deg,#e9e9eb,#e9e9eb 14px,#f3f3f5 14px,#f3f3f5 28px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9a9aa0' }}>photo · investigation team</span>
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg, rgba(4,4,6,0.92) 40%, rgba(4,4,6,0.55) 100%)' }} />
        <div style={{
          position: 'relative', zIndex: 1,
          maxWidth: 1320, margin: '0 auto',
          padding: 'clamp(72px,10vw,130px) clamp(20px,5vw,56px)',
          height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center',
        }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: 22 }}>
            Industries
          </div>
          <h1 style={{ margin: '0 0 22px', fontWeight: 500, fontSize: 'clamp(34px,5vw,68px)', lineHeight: 1.05, letterSpacing: '-.025em', color: '#fff', maxWidth: '20ch' }}>
            Built for every team that investigates fraud
          </h1>
          <p style={{ margin: '0 0 36px', fontSize: 'clamp(16px,1.4vw,20px)', lineHeight: 1.6, color: 'rgba(255,255,255,0.6)', maxWidth: '48ch' }}>
            Law enforcement, financial crime teams, intelligence analysts, and legal professionals — anywhere the work is to map connections between entities and produce a picture that holds up under scrutiny.
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/contact?type=enterprise')}
              style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', background: '#fff', color: TEXT1, border: 'none', cursor: 'pointer', padding: '12px 24px' }}
            >
              Request a briefing →
            </button>
            <button
              onClick={() => navigate('/platform')}
              style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', background: 'transparent', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.22)', cursor: 'pointer', padding: '12px 24px' }}
            >
              See the platform
            </button>
          </div>
        </div>
      </section>

      {/* ── Sector card grid ───────────────────────────────────────────────────── */}
      <section style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(20px,5vw,56px)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'clamp(28px,3.5vw,44px)', flexWrap: 'wrap', gap: 16 }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color: TEXT3, marginBottom: 12 }}>
                Eight investigative disciplines
              </div>
              <h2 style={{ margin: 0, fontWeight: 500, fontSize: 'clamp(24px,2.8vw,40px)', lineHeight: 1.1, letterSpacing: '-.02em' }}>
                Who uses Raven
              </h2>
            </div>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.65, color: TEXT3, maxWidth: '40ch' }}>
              Click any sector to see how Raven is used, what challenges it addresses, and the specific workflows it supports.
            </p>
          </div>

          {/* 4×2 grid */}
          <div className="mobile-two-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 2 }}>
            {SECTORS.map(s => (
              <SectorCard key={s.slug} sector={s} onNavigate={navigate} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Full-width feature photo ────────────────────────────────────────────── */}
      <section style={{ position: 'relative', height: 'clamp(300px,40vw,520px)', overflow: 'hidden', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(135deg,#e9e9eb,#e9e9eb 14px,#f3f3f5 14px,#f3f3f5 28px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9a9aa0' }}>photo · intelligence infrastructure</span>
        </div>
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(4,4,6,0.72)' }} />
        <div style={{
          position: 'relative', zIndex: 1,
          maxWidth: 1320, margin: '0 auto',
          padding: 'clamp(40px,5vw,72px) clamp(20px,5vw,56px)',
          height: '100%', display: 'flex', alignItems: 'center',
        }}>
          <div className="mobile-single-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'clamp(24px,4vw,56px)', width: '100%' }}>
            {[
              { value: '17', label: 'Entity types covering every investigation domain' },
              { value: 'STIX 2.1', label: 'Native export for law enforcement and ISAC sharing' },
              { value: 'STANAG 2511', label: 'Intel grading encoded in every relationship' },
            ].map((s, i) => (
              <div key={i} style={{ paddingLeft: i > 0 ? 'clamp(20px,3vw,40px)' : 0, borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}>
                <div style={{ fontFamily: MONO, fontSize: 'clamp(20px,2.8vw,40px)', fontWeight: 700, color: '#fff', marginBottom: 8, letterSpacing: '-.01em' }}>
                  {s.value}
                </div>
                <div style={{ fontSize: 13.5, color: 'rgba(255,255,255,0.55)', lineHeight: 1.55 }}>
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Differentiators ────────────────────────────────────────────────────── */}
      <section style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(56px,7vw,88px) clamp(20px,5vw,56px)' }}>
          <div style={{ marginBottom: 'clamp(32px,4vw,48px)' }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color: TEXT3, marginBottom: 12 }}>
              Why Raven
            </div>
            <h2 style={{ margin: 0, fontWeight: 500, fontSize: 'clamp(24px,2.8vw,38px)', lineHeight: 1.12, letterSpacing: '-.018em', maxWidth: '28ch' }}>
              What makes Raven different from case management and spreadsheets
            </h2>
          </div>
          <div className="mobile-single-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0 }}>
            {DIFFERENTIATORS.map((d, i) => (
              <div key={d.index} style={{ padding: 'clamp(24px,3vw,40px)', borderTop: `2px solid ${TEXT1}`, borderLeft: i > 0 ? `1px solid ${BORDER}` : 'none' }}>
                <div style={{ fontFamily: MONO, fontSize: 10, color: TEXT3, letterSpacing: '.08em', marginBottom: 14 }}>{d.index}</div>
                <h3 style={{ margin: '0 0 12px', fontWeight: 500, fontSize: 17, lineHeight: 1.3, letterSpacing: '-.008em' }}>{d.title}</h3>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: TEXT2 }}>{d.body}</p>
              </div>
            ))}
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
            Talk to us about your team's investigation workflow
          </h2>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/contact?type=enterprise')}
              style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', background: '#fff', color: '#0a0a0b', border: 'none', cursor: 'pointer', padding: '13px 28px' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e8e8e8' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
            >
              Request a briefing →
            </button>
            <button
              onClick={() => navigate('/platform')}
              style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', background: 'transparent', color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer', padding: '13px 28px' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.55)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}
            >
              See the platform
            </button>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  )
}
