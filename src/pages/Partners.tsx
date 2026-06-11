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
const BG_INK = '#0a0a0c'

const TIERS = [
  {
    name: 'Referral',
    tag: 'Entry',
    description: 'Refer qualified opportunities and earn a commission on first-year ARR. No certification required. Best for consultants and independent advisors who encounter Raven use cases in their existing client work.',
    commission: '10% first-year ARR',
    items: [
      'Referral link and deal registration portal',
      'Sales collateral and battle cards',
      'Access to Raven partner Slack channel',
      'Dedicated channel account manager',
    ],
    cta: 'Apply as referral partner',
  },
  {
    name: 'Reseller',
    tag: 'Standard',
    description: 'Transact Raven licences directly and carry them on your paper. Full margin on resale. Appropriate for systems integrators and technology resellers already serving financial crime, law enforcement, or intelligence community customers.',
    commission: '20–25% margin',
    items: [
      'Everything in Referral',
      'Authorised reseller status and co-brand rights',
      'Quarterly product briefings and roadmap access',
      'Joint go-to-market planning',
      'Demo environment and NFR licences',
      'Partner portal with deal tracking and commission reports',
    ],
    cta: 'Apply as reseller',
    highlight: true,
  },
  {
    name: 'Strategic',
    tag: 'Premier',
    description: 'Deep integration and go-to-market alignment for partners with significant penetration into Raven\'s target verticals. Includes joint product development, co-selling, and executive alignment. Applications reviewed on a case-by-case basis.',
    commission: 'Negotiated',
    items: [
      'Everything in Reseller',
      'Joint product integration and technical roadmap access',
      'Named Raven account team',
      'Co-invested marketing activities and event participation',
      'Executive sponsor relationship',
      'Dedicated sandbox environment',
    ],
    cta: 'Enquire about strategic partnership',
  },
]

const PARTNER_TYPES = [
  {
    photo: 'photo-1600880292203-757bb62b4baf',
    title: 'Systems integrators',
    body: 'Partners who deploy Raven as part of broader financial crime, intelligence, or compliance technology stacks. We work with integrators who have established relationships at financial institutions, law enforcement agencies, and intelligence organisations.',
  },
  {
    photo: 'photo-1551434678-e076c223a692',
    title: 'Technology vendors',
    body: 'Complementary technology providers — transaction monitoring, case management, fraud detection, and threat intelligence platforms — who want to embed Raven\'s graph analysis capability as part of their own offering or integrate at a data level.',
  },
  {
    photo: 'photo-1600880292203-757bb62b4baf',
    title: 'Advisory and consulting',
    body: 'Financial crime advisory firms, forensic accountants, intelligence consultancies, and specialist law firms who recommend and deploy analytical tooling as part of their service delivery.',
  },
  {
    photo: 'photo-1460925895917-afdab827c52f',
    title: 'Training and certification',
    body: 'Accredited training providers who want to incorporate Raven into investigative skills programmes, OSINT tradecraft courses, or financial crime compliance qualifications.',
  },
]

function TierCard({ tier }: { tier: typeof TIERS[0] }) {
  const navigate = useNavigate()
  return (
    <div style={{
      background: tier.highlight ? TEXT1 : '#fff',
      border: `1px solid ${tier.highlight ? TEXT1 : BORDER}`,
      padding: 'clamp(28px,3vw,40px)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '.1em', textTransform: 'uppercase', color: tier.highlight ? 'rgba(255,255,255,0.4)' : TEXT3, marginBottom: 6 }}>{tier.tag}</div>
          <div style={{ fontSize: 22, fontWeight: 500, color: tier.highlight ? '#f2f2f4' : TEXT1, letterSpacing: '-.015em' }}>{tier.name}</div>
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: tier.highlight ? 'rgba(255,255,255,0.5)' : TEXT3, textAlign: 'right' }}>{tier.commission}</div>
      </div>
      <p style={{ margin: '0 0 24px', fontSize: 13.5, lineHeight: 1.7, color: tier.highlight ? 'rgba(255,255,255,0.65)' : TEXT2, flexGrow: 1 }}>{tier.description}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
        {tier.items.map(item => (
          <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: tier.highlight ? 'rgba(255,255,255,0.4)' : TEXT3, flexShrink: 0, marginTop: 1 }}>→</span>
            <span style={{ fontSize: 13, lineHeight: 1.55, color: tier.highlight ? 'rgba(255,255,255,0.7)' : TEXT2 }}>{item}</span>
          </div>
        ))}
      </div>
      <button
        onClick={() => navigate('/contact?type=partners')}
        style={{
          fontFamily: MONO,
          fontSize: 10,
          letterSpacing: '.1em',
          textTransform: 'uppercase',
          background: tier.highlight ? '#fff' : TEXT1,
          color: tier.highlight ? TEXT1 : '#fff',
          border: 'none',
          cursor: 'pointer',
          padding: '11px 20px',
        }}
      >
        {tier.cta}
      </button>
    </div>
  )
}

export function PartnersPage() {
  const navigate = useNavigate()

  return (
    <div style={{ background: '#fff', color: TEXT1, fontFamily: SANS, WebkitFontSmoothing: 'antialiased', minHeight: '100vh' }}>
      <SiteHeader />

      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', background: BG_INK }}>
        <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(135deg,#2a2a2c,#2a2a2c 14px,#222224 14px,#222224 28px)', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.5 }}>
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>photo · partner collaboration</span>
        </div>
        <div style={{ position: 'relative', maxWidth: 1180, margin: '0 auto', padding: 'clamp(80px,11vw,140px) clamp(20px,4vw,48px)' }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: 20 }}>Partner Programme</div>
          <h1 style={{ margin: '0 0 20px', fontWeight: 500, fontSize: 'clamp(34px,5vw,64px)', letterSpacing: '-.024em', lineHeight: 1.04, color: '#f2f2f4', maxWidth: 760 }}>
            Build a practice around intelligence-grade link analysis.
          </h1>
          <p style={{ margin: '0 0 40px', fontSize: 'clamp(15px,1.6vw,18px)', lineHeight: 1.65, color: 'rgba(255,255,255,0.55)', maxWidth: 560 }}>
            Raven's partner programme connects us with systems integrators, resellers, and consulting firms serving the financial crime, law enforcement, and intelligence communities.
          </p>
          <button
            onClick={() => navigate('/contact?type=partners')}
            style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', background: '#fff', color: TEXT1, border: 'none', cursor: 'pointer', padding: '13px 26px' }}
          >
            Enquire about partnership
          </button>
        </div>
      </section>

      {/* Who we work with */}
      <section style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(64px,8vw,96px) clamp(20px,4vw,48px)' }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: TEXT3, marginBottom: 16 }}>Who we work with</div>
          <h2 style={{ margin: '0 0 48px', fontWeight: 500, fontSize: 'clamp(24px,2.8vw,36px)', letterSpacing: '-.018em', lineHeight: 1.15, maxWidth: 560 }}>Partners who serve the intelligence and financial crime community.</h2>
          <div className="mobile-two-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '1px', background: BORDER }}>
            {PARTNER_TYPES.map(p => (
              <div key={p.title} style={{ background: '#fff', display: 'flex', gap: 24, padding: '32px 28px', alignItems: 'flex-start' }}>
                <div style={{ flexShrink: 0, width: 48, height: 48, background: BG2, border: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 20, height: 20, background: TEXT3, borderRadius: '50%' }} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 500, color: TEXT1, marginBottom: 8, letterSpacing: '-.01em' }}>{p.title}</div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.7, color: TEXT2 }}>{p.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tier cards */}
      <section style={{ background: BG2, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(64px,8vw,96px) clamp(20px,4vw,48px)' }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: TEXT3, marginBottom: 16 }}>Programme tiers</div>
          <h2 style={{ margin: '0 0 48px', fontWeight: 500, fontSize: 'clamp(24px,2.8vw,36px)', letterSpacing: '-.018em', lineHeight: 1.15 }}>Three ways to partner with Raven.</h2>
          <div className="mobile-single-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 2, background: BORDER }}>
            {TIERS.map(t => <TierCard key={t.name} tier={t} />)}
          </div>
        </div>
      </section>

      {/* Photo + benefit strip */}
      <section style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(64px,8vw,96px) clamp(20px,4vw,48px)' }}>
          <div className="mobile-single-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(32px,5vw,72px)', alignItems: 'center' }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: TEXT3, marginBottom: 16 }}>Why Raven</div>
              <h2 style={{ margin: '0 0 20px', fontWeight: 500, fontSize: 'clamp(22px,2.2vw,30px)', letterSpacing: '-.016em', lineHeight: 1.2 }}>A differentiated product in an underserved market.</h2>
              <p style={{ margin: '0 0 32px', fontSize: 14.5, lineHeight: 1.75, color: TEXT2 }}>
                Graph-based link analysis for financial crime and intelligence is a genuine gap in the market. Most investigative teams are running case management systems with bolt-on diagramming — not a purpose-built graph canvas with native OSINT enrichment and classified export. Raven addresses that gap directly.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  'Growing market — financial crime compliance spend is increasing across all regulated sectors',
                  'No direct equivalent — Raven competes with general-purpose tools, not specialist ones',
                  'Sticky product — investigation graphs persist and grow, driving long-term retention',
                  'Enterprise-grade security makes it viable inside regulated institutions and government',
                ].map(item => (
                  <div key={item} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                    <span style={{ fontFamily: MONO, fontSize: 11, color: TEXT3, flexShrink: 0 }}>→</span>
                    <span style={{ fontSize: 13.5, lineHeight: 1.55, color: TEXT2 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ width: '100%', aspectRatio: '700/520', background: 'repeating-linear-gradient(135deg,#e9e9eb,#e9e9eb 14px,#f3f3f5 14px,#f3f3f5 28px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9a9aa0' }}>photo · partnership meeting</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: BG_INK }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(64px,8vw,96px) clamp(20px,4vw,48px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 32 }}>
          <div>
            <div style={{ fontSize: 'clamp(22px,2.5vw,32px)', fontWeight: 500, color: '#f2f2f4', marginBottom: 10, letterSpacing: '-.016em', lineHeight: 1.2 }}>
              Ready to start a conversation?
            </div>
            <div style={{ fontFamily: MONO, fontSize: 12, color: '#9a9aa0' }}>partners@raven.app — we respond within 2 business days</div>
          </div>
          <button
            onClick={() => navigate('/contact?type=partners')}
            style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', background: '#fff', color: TEXT1, border: 'none', cursor: 'pointer', padding: '14px 28px', flexShrink: 0 }}
          >
            Contact partner team
          </button>
        </div>
      </section>
      <SiteFooter />
    </div>
  )
}
