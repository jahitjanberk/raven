import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { SiteFooter } from '../components/SiteFooter'

const MONO  = "'IBM Plex Mono',ui-monospace,monospace"
const SANS  = "'Helvetica Neue',Helvetica,Arial,sans-serif"
const TEXT1 = '#0a0a0b'
const TEXT2 = '#3a3a3f'
const TEXT3 = '#9a9aa0'
const BORDER = '#ececee'
const BG2   = '#f8f8fa'
const BG_INK = '#0a0a0c'

const ROLES = [
  {
    title: 'Senior Software Engineer — Platform',
    team: 'Engineering',
    location: 'London / Remote',
    type: 'Full-time',
    description: 'Own core graph engine features, OSINT enrichment transforms, and data pipeline work. We use Python (FastAPI), TypeScript (React), and PostgreSQL. Experience with graph data structures or intelligence tooling is a plus.',
  },
  {
    title: 'Product Designer',
    team: 'Design',
    location: 'London / Remote',
    type: 'Full-time',
    description: 'Design the core investigative experience — graph canvas, entity panels, enrichment flows, and case export. You\'ll work directly with intelligence analysts and law enforcement users. Portfolio showing complex information design is essential.',
  },
  {
    title: 'Intelligence Analyst — Product',
    team: 'Product',
    location: 'London',
    type: 'Full-time',
    description: 'Bridge between professional investigators and the product team. Document investigative workflows, validate new features against real-world use cases, and represent the analyst voice in product decisions. OSINT or law enforcement background preferred.',
  },
  {
    title: 'Sales Engineer',
    team: 'Revenue',
    location: 'London / Remote',
    type: 'Full-time',
    description: 'Deliver technical demonstrations, lead proof-of-concept engagements with financial crime and law enforcement buyers, and own the technical relationship through to close. Prior experience selling to financial services or public sector is a plus.',
  },
  {
    title: 'Customer Success Manager',
    team: 'Customer Success',
    location: 'London',
    type: 'Full-time',
    description: 'Own deployment success and long-term retention across our financial crime and law enforcement accounts. Define onboarding programmes, surface usage patterns, and work with the product team to close the feedback loop from deployed analysts.',
  },
]

const VALUES = [
  {
    tag: '01',
    title: 'Build for the analyst, not the demo',
    body: 'Our users are conducting real investigations — financial crime cases, fraud prosecutions, intelligence operations. The tools we build need to work in that context, not just look good on a screen share.',
  },
  {
    tag: '02',
    title: 'Ship with confidence',
    body: 'We prefer fewer features that work exactly as documented over a longer list of capabilities with rough edges. Quality over velocity, always.',
  },
  {
    tag: '03',
    title: 'Stay small and specific',
    body: 'We are not trying to build a general-purpose tool. The sharper the focus, the more valuable the product. We actively resist scope creep — including from ourselves.',
  },
  {
    tag: '04',
    title: 'Trust the people you hire',
    body: 'Raven has no unnecessary process. No status update meetings, no check-in rituals. We hire people who know what they are doing and get out of the way.',
  },
  {
    tag: '05',
    title: 'Security is not a feature',
    body: 'We serve customers who handle sensitive intelligence. Security is a core commitment — not a checkbox, not a roadmap item.',
  },
  {
    tag: '06',
    title: 'Take the hard problem seriously',
    body: 'Link analysis for intelligence work is a genuinely difficult product problem. We engage with that difficulty rather than defaulting to familiar patterns.',
  },
]

function RoleCard({ role }: { role: typeof ROLES[0] }) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  return (
    <div style={{ borderBottom: `1px solid ${BORDER}` }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', padding: '28px 0', textAlign: 'left', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}
      >
        <div>
          <div style={{ fontSize: 17, fontWeight: 500, color: TEXT1, marginBottom: 8, letterSpacing: '-.01em' }}>{role.title}</div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {[role.team, role.location, role.type].map(tag => (
              <span key={tag} style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '.08em', textTransform: 'uppercase', color: TEXT3 }}>{tag}</span>
            ))}
          </div>
        </div>
        <span style={{ fontFamily: MONO, fontSize: 16, color: TEXT3, flexShrink: 0, transition: 'transform .15s', display: 'block', transform: open ? 'rotate(45deg)' : 'none', marginTop: 2 }}>+</span>
      </button>
      {open && (
        <div style={{ paddingBottom: 28, paddingRight: 40 }}>
          <p style={{ margin: '0 0 20px', fontSize: 14.5, lineHeight: 1.75, color: TEXT2 }}>{role.description}</p>
          <button
            onClick={() => navigate(`/contact?type=careers&role=${encodeURIComponent(role.title)}`)}
            style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', background: TEXT1, color: '#fff', border: 'none', cursor: 'pointer', padding: '11px 22px' }}
          >
            Apply for this role
          </button>
        </div>
      )}
    </div>
  )
}

export function CareersPage() {
  const navigate = useNavigate()

  return (
    <div style={{ background: '#fff', color: TEXT1, fontFamily: SANS, WebkitFontSmoothing: 'antialiased', minHeight: '100vh' }}>
      <SiteHeader />

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', background: BG_INK }}>
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(135deg,#2a2a2c,#2a2a2c 14px,#222224 14px,#222224 28px)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>photo · team office</span>
        </div>
        <div style={{ position: 'relative', maxWidth: 1180, margin: '0 auto', padding: 'clamp(80px,11vw,140px) clamp(20px,4vw,48px)' }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.45)', marginBottom: 20 }}>Careers at Raven</div>
          <h1 style={{ margin: '0 0 20px', fontWeight: 500, fontSize: 'clamp(34px,5vw,64px)', letterSpacing: '-.024em', lineHeight: 1.04, color: '#f2f2f4', maxWidth: 740 }}>
            Work on a hard problem that matters.
          </h1>
          <p style={{ margin: '0 0 36px', fontSize: 'clamp(15px,1.6vw,18px)', lineHeight: 1.65, color: 'rgba(255,255,255,0.6)', maxWidth: 580 }}>
            Raven is a small, focused team building link analysis tools for the intelligence and financial crime community. We move carefully, build for real investigators, and care deeply about security and quality.
          </p>
          <div style={{ fontFamily: MONO, fontSize: 11.5, color: 'rgba(255,255,255,0.4)' }}>
            {ROLES.length} open roles · London &amp; Remote
          </div>
        </div>
      </section>

      {/* Open roles */}
      <section style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(64px,8vw,96px) clamp(20px,4vw,48px)' }}>
          <div className="mobile-single-col" style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 'clamp(32px,5vw,72px)', alignItems: 'start' }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: TEXT3, marginBottom: 16 }}>Open roles</div>
              <h2 style={{ margin: '0 0 16px', fontWeight: 500, fontSize: 'clamp(24px,2.5vw,32px)', letterSpacing: '-.016em', lineHeight: 1.2 }}>Current openings</h2>
              <p style={{ margin: '0 0 24px', fontSize: 14, lineHeight: 1.7, color: TEXT2 }}>We hire for depth. Each person owns a meaningful part of the product and works directly with customers.</p>
              <button
                onClick={() => navigate('/contact?type=careers')}
                style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '.1em', textTransform: 'uppercase', background: 'none', color: TEXT3, border: `1px solid ${BORDER}`, cursor: 'pointer', padding: '9px 18px' }}
              >
                Don't see your role?
              </button>
            </div>
            <div style={{ borderTop: `1px solid ${BORDER}` }}>
              {ROLES.map(r => <RoleCard key={r.title} role={r} />)}
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section style={{ background: BG2, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(64px,8vw,96px) clamp(20px,4vw,48px)' }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: TEXT3, marginBottom: 16 }}>How we work</div>
          <h2 style={{ margin: '0 0 48px', fontWeight: 500, fontSize: 'clamp(24px,2.8vw,36px)', letterSpacing: '-.018em', lineHeight: 1.15, maxWidth: 560 }}>Things we genuinely believe about building software.</h2>
          <div className="mobile-two-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1px', background: BORDER }}>
            {VALUES.map(v => (
              <div key={v.tag} style={{ background: BG2, padding: '32px 28px' }}>
                <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '.1em', textTransform: 'uppercase', color: TEXT3, marginBottom: 14 }}>{v.tag}</div>
                <div style={{ fontSize: 15, fontWeight: 500, color: TEXT1, marginBottom: 10, lineHeight: 1.35, letterSpacing: '-.01em' }}>{v.title}</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.7, color: TEXT2 }}>{v.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(64px,8vw,96px) clamp(20px,4vw,48px)' }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: TEXT3, marginBottom: 16 }}>Benefits</div>
          <h2 style={{ margin: '0 0 40px', fontWeight: 500, fontSize: 'clamp(24px,2.8vw,36px)', letterSpacing: '-.018em', lineHeight: 1.15 }}>What we offer</h2>
          <div className="mobile-two-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 2, background: BORDER }}>
            {[
              ['Salary', 'Competitive salary benchmarked at 75th percentile for London. We pay fairly and transparently.'],
              ['Equity', 'Meaningful equity stake with standard 4-year vesting. Early employees own a real piece of Raven.'],
              ['Remote', 'Hybrid model — London office available but not required. Remote roles genuinely remote.'],
              ['Equipment', 'MacBook Pro and any peripherals you need to do your best work. No approval required.'],
              ['Health', 'Private health insurance (Bupa) from day one, including dental and optical.'],
              ['Learning', 'Annual learning budget for conferences, courses, and books — spent at your discretion.'],
              ['Pension', 'Company pension with 5% employer contribution via Nest.'],
              ['Leave', '28 days holiday plus UK bank holidays. Flexible around personal commitments.'],
            ].map(([label, desc]) => (
              <div key={label} style={{ background: '#fff', padding: '24px 24px' }}>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: TEXT1, marginBottom: 8, fontWeight: 500 }}>{label}</div>
                <div style={{ fontSize: 13.5, lineHeight: 1.65, color: TEXT2 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Photo strip */}
      <section style={{ height: 'clamp(200px,24vw,380px)', overflow: 'hidden', position: 'relative', borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(135deg,#e9e9eb,#e9e9eb 14px,#f3f3f5 14px,#f3f3f5 28px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9a9aa0' }}>photo · team in the field</span>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: BG_INK }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(64px,8vw,96px) clamp(20px,4vw,48px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 32 }}>
          <div>
            <div style={{ fontSize: 'clamp(22px,2.5vw,32px)', fontWeight: 500, color: '#f2f2f4', marginBottom: 10, letterSpacing: '-.016em', lineHeight: 1.2 }}>
              Don't see what you're looking for?
            </div>
            <div style={{ fontFamily: MONO, fontSize: 12, color: '#9a9aa0' }}>Send a speculative application — we read them all.</div>
          </div>
          <button
            onClick={() => navigate('/contact?type=careers')}
            style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', background: '#fff', color: '#0a0a0b', border: 'none', cursor: 'pointer', padding: '14px 28px', flexShrink: 0 }}
          >
            Get in touch
          </button>
        </div>
      </section>
      <SiteFooter />
    </div>
  )
}
