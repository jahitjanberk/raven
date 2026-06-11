import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { SiteFooter } from '../components/SiteFooter'
import { useIsMobile } from '../hooks/useBreakpoint'

// ── Stripe checkout links — swap in real URLs from your Stripe dashboard ──────
const STRIPE = {
  pro_monthly:  'https://buy.stripe.com/placeholder_pro_monthly',
  pro_annual:   'https://buy.stripe.com/placeholder_pro_annual',
  team_monthly: 'https://buy.stripe.com/placeholder_team_monthly',
  team_annual:  'https://buy.stripe.com/placeholder_team_annual',
}

// ── Design tokens ─────────────────────────────────────────────────────────────
const BG      = '#fff'
const BG2     = '#f8f8fa'
const BORDER  = '#ececee'
const TEXT1   = '#0a0a0b'
const TEXT2   = '#3a3a3f'
const TEXT3   = '#9a9aa0'
const ACCENT  = '#0a0a0b'
const GREEN   = '#16a34a'
const MONO    = "'IBM Plex Mono',ui-monospace,monospace"
const SANS    = "'Helvetica Neue',Helvetica,Arial,sans-serif"

// ── Feature comparison data ───────────────────────────────────────────────────

type Tier = 'free' | 'pro' | 'team'

interface Feature {
  label: string
  group?: string
  free: string | boolean
  pro: string | boolean
  team: string | boolean
  note?: string
}

const FEATURES: Feature[] = [
  // Investigations
  { label: 'Active investigations',   group: 'Investigations', free: '1',            pro: 'Unlimited',  team: 'Unlimited' },
  { label: 'Nodes per graph',                                   free: '20',           pro: 'Unlimited',  team: 'Unlimited' },
  { label: 'Case notes & metadata',                             free: true,           pro: true,         team: true },
  { label: 'Risk & action flagging',                            free: true,           pro: true,         team: true },
  { label: 'Case templates',                                    free: '3 built-in',   pro: 'All 5',      team: 'All + custom' },

  // Enrichment
  { label: 'Transforms per day',      group: 'Enrichment',     free: '10',           pro: '500',        team: 'Unlimited' },
  { label: 'Watch lists',                                       free: false,          pro: '10 watches', team: 'Unlimited' },
  { label: 'Scheduled re-enrichment',                          free: false,          pro: true,         team: true },
  { label: 'OSINT source connectors',                          free: 'Public only',  pro: 'All sources', team: 'All + custom' },

  // Intelligence
  { label: 'NATO intel grading',      group: 'Intelligence',   free: true,           pro: true,         team: true },
  { label: 'Edge annotation',                                   free: true,           pro: true,         team: true },
  { label: 'Confidence scoring',                                free: true,           pro: true,         team: true },
  { label: 'Link analysis tools',                               free: false,          pro: true,         team: true },
  { label: 'Timeline view',                                     free: false,          pro: true,         team: true },

  // Export & sharing
  { label: 'PNG export',              group: 'Export & sharing', free: true,          pro: true,         team: true },
  { label: 'Raven JSON export',                                free: true,           pro: true,         team: true },
  { label: 'STIX 2.1 export',                                   free: false,          pro: true,         team: true, note: 'Compatible with MISP, OpenCTI, Maltego' },
  { label: 'TAXII feed push',                                   free: false,          pro: false,        team: true },
  { label: 'File attachments',                                   free: false,          pro: '20 MB / node', team: 'Unlimited' },

  // Platform
  { label: 'Graph persistence',       group: 'Platform',        free: 'Local only',  pro: 'Cloud sync', team: 'Cloud sync' },
  { label: 'Undo / redo (history)',                              free: '10 steps',    pro: '50 steps',   team: '100 steps' },
  { label: 'Auto-layout algorithms',                             free: true,          pro: true,         team: true },
  { label: 'Audit log',                                          free: false,         pro: false,        team: true },
  { label: 'SSO / SAML',                                         free: false,         pro: false,        team: true },
  { label: 'API access',                                         free: false,         pro: false,        team: true },

  // Support
  { label: 'Support',                 group: 'Support',         free: 'Community',   pro: 'Email',      team: 'Priority + SLA' },
  { label: 'Onboarding session',                                 free: false,         pro: false,        team: true },
  { label: 'Dedicated CSM',                                      free: false,         pro: false,        team: 'On request' },
]

// ── Cell renderer ─────────────────────────────────────────────────────────────

function Cell({ value }: { value: string | boolean }) {
  if (value === true) {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none" style={{ display: 'block', margin: '0 auto' }}>
        <circle cx="9" cy="9" r="8.5" stroke={GREEN} strokeOpacity="0.25" />
        <path d="M5.5 9l2.5 2.5 4.5-5" stroke={GREEN} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }
  if (value === false) {
    return <span style={{ color: '#d4d4d7', fontSize: 18, lineHeight: 1, display: 'block', textAlign: 'center' }}>—</span>
  }
  return <span style={{ fontSize: 12.5, color: TEXT2, display: 'block', textAlign: 'center' }}>{value}</span>
}

// ── Tier card ─────────────────────────────────────────────────────────────────

interface TierCardProps {
  id: Tier
  name: string
  price: { monthly: string; annual: string; annualNote?: string }
  tagline: string
  cta: string
  ctaAction: () => void
  highlighted?: boolean
  badge?: string
  annual: boolean
}

function TierCard({ name, price, tagline, cta, ctaAction, highlighted, badge, annual }: TierCardProps) {
  const [hover, setHover] = useState(false)

  return (
    <div style={{
      flex: 1, minWidth: 0,
      padding: '32px 28px 28px',
      border: `1px solid ${highlighted ? TEXT1 : BORDER}`,
      borderRadius: 2,
      background: highlighted ? TEXT1 : BG,
      color: highlighted ? '#fff' : TEXT1,
      position: 'relative',
      display: 'flex', flexDirection: 'column', gap: 24,
    }}>
      {badge && (
        <div style={{
          position: 'absolute', top: -1, right: 24,
          background: '#0a0a0b', color: '#fff',
          fontFamily: MONO, fontSize: 9, letterSpacing: '.12em',
          textTransform: 'uppercase', padding: '4px 10px',
          ...(highlighted ? { background: '#fff', color: '#0a0a0b' } : {}),
        }}>
          {badge}
        </div>
      )}

      <div>
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: highlighted ? 'rgba(255,255,255,0.5)' : TEXT3, marginBottom: 10 }}>
          {name}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: 42, fontWeight: 500, letterSpacing: '-.02em', lineHeight: 1 }}>
            {annual ? price.annual : price.monthly}
          </span>
          {price.monthly !== 'Free' && (
            <span style={{ fontFamily: MONO, fontSize: 11, color: highlighted ? 'rgba(255,255,255,0.5)' : TEXT3 }}>
              / mo
            </span>
          )}
        </div>
        {annual && price.annualNote && (
          <div style={{ fontFamily: MONO, fontSize: 10, color: highlighted ? 'rgba(255,255,255,0.55)' : GREEN, marginTop: 5, letterSpacing: '.04em' }}>
            {price.annualNote}
          </div>
        )}
        <p style={{ margin: '14px 0 0', fontSize: 13.5, lineHeight: 1.55, color: highlighted ? 'rgba(255,255,255,0.7)' : TEXT2 }}>
          {tagline}
        </p>
      </div>

      <button
        onClick={ctaAction}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          width: '100%', padding: '12px 0',
          border: `1px solid ${highlighted ? 'rgba(255,255,255,0.35)' : TEXT1}`,
          borderRadius: 1,
          background: highlighted
            ? hover ? 'rgba(255,255,255,0.15)' : 'transparent'
            : hover ? TEXT1 : BG,
          color: highlighted ? '#fff' : hover ? '#fff' : TEXT1,
          fontFamily: MONO, fontSize: 11.5, letterSpacing: '.08em', textTransform: 'uppercase',
          cursor: 'pointer', transition: 'background .15s, color .15s',
        }}
      >
        {cta}
      </button>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function PricingPage() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const [annual, setAnnual] = useState(false)

  const openStripe = (url: string) => {
    window.open(url, '_blank', 'noopener')
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, color: TEXT1, fontFamily: SANS, WebkitFontSmoothing: 'antialiased' }}>

      <SiteHeader active="/pricing" />

      <main style={{ maxWidth: 1180, margin: '0 auto', padding: '0 clamp(20px,4vw,48px) 120px' }}>

        {/* ── Header ── */}
        <div style={{ textAlign: 'center', padding: 'clamp(56px,8vw,96px) 0 clamp(40px,5vw,64px)' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: TEXT3, marginBottom: 20 }}>
            Pricing
          </div>
          <h1 style={{ margin: 0, fontWeight: 500, fontSize: 'clamp(34px,5vw,58px)', letterSpacing: '-.022em', lineHeight: 1.08 }}>
            Clear pricing. No surprises.
          </h1>
          <p style={{ margin: '20px auto 0', maxWidth: '44ch', fontSize: 'clamp(15px,1.5vw,18px)', lineHeight: 1.6, color: TEXT2 }}>
            Start free with everything you need to run a single investigation. Upgrade when you need more capacity or your team grows.
          </p>

          {/* Billing toggle */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 14, marginTop: 32, padding: '6px 8px', border: `1px solid ${BORDER}`, borderRadius: 2 }}>
            <button
              onClick={() => setAnnual(false)}
              style={{
                padding: '6px 16px', fontFamily: MONO, fontSize: 10.5, letterSpacing: '.07em', textTransform: 'uppercase',
                background: !annual ? TEXT1 : 'transparent', color: !annual ? '#fff' : TEXT3,
                border: 'none', cursor: 'pointer', borderRadius: 1, transition: 'all .15s',
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              style={{
                padding: '6px 16px', fontFamily: MONO, fontSize: 10.5, letterSpacing: '.07em', textTransform: 'uppercase',
                background: annual ? TEXT1 : 'transparent', color: annual ? '#fff' : TEXT3,
                border: 'none', cursor: 'pointer', borderRadius: 1, transition: 'all .15s',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              Annual
              <span style={{
                background: GREEN, color: '#fff', fontSize: 8.5, fontFamily: MONO,
                letterSpacing: '.07em', padding: '2px 6px', borderRadius: 1,
              }}>
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* ── Tier cards ── */}
        <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 16, marginBottom: 80, alignItems: 'flex-start' }}>
          <TierCard
            id="free"
            name="Free"
            price={{ monthly: 'Free', annual: 'Free' }}
            tagline="One investigation, public transforms, and full graph tooling. No card required."
            cta="Start for free →"
            ctaAction={() => { window.location.href = '/app' }}
            annual={annual}
          />
          <TierCard
            id="pro"
            name="Pro"
            price={{
              monthly: '£49',
              annual: '£39',
              annualNote: 'Billed £468 / year — save £120',
            }}
            tagline="Unlimited investigations, STIX export, watch lists, and file attachments for solo analysts."
            cta="Start Pro →"
            ctaAction={() => openStripe(annual ? STRIPE.pro_annual : STRIPE.pro_monthly)}
            highlighted
            badge="Most popular"
            annual={annual}
          />
          <TierCard
            id="team"
            name="Team"
            price={{
              monthly: '£149',
              annual: '£119',
              annualNote: 'Billed £1,428 / seat / year',
            }}
            tagline="Everything in Pro plus API access, audit logs, SSO, and a dedicated customer success manager."
            cta="Talk to us →"
            ctaAction={() => openStripe(annual ? STRIPE.team_annual : STRIPE.team_monthly)}
            annual={annual}
          />
        </div>

        {/* ── Feature comparison table ── */}
        <div>
          <h2 style={{ fontWeight: 500, fontSize: 24, letterSpacing: '-.015em', marginBottom: 32 }}>
            Compare plans
          </h2>

          <div className="mobile-overflow-x">
          <div style={{ border: `1px solid ${BORDER}`, borderRadius: 2, overflow: 'hidden', minWidth: 560 }}>
            {/* Table header */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 120px 120px 120px',
              background: BG2, borderBottom: `1px solid ${BORDER}`,
              padding: '14px 20px',
            }}>
              <div />
              {(['Free', 'Pro', 'Team'] as const).map(tier => (
                <div key={tier} style={{ textAlign: 'center', fontFamily: MONO, fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', color: TEXT2, fontWeight: 600 }}>
                  {tier}
                </div>
              ))}
            </div>

            {/* Feature rows */}
            {(() => {
              const rows: React.ReactNode[] = []
              let lastGroup = ''
              FEATURES.forEach((feat, i) => {
                if (feat.group && feat.group !== lastGroup) {
                  lastGroup = feat.group
                  rows.push(
                    <div
                      key={`group-${feat.group}`}
                      style={{
                        padding: '10px 20px 8px',
                        background: BG2,
                        borderTop: i > 0 ? `1px solid ${BORDER}` : undefined,
                        fontFamily: MONO, fontSize: 9.5, letterSpacing: '.12em',
                        textTransform: 'uppercase', color: TEXT3,
                      }}
                    >
                      {feat.group}
                    </div>
                  )
                }
                rows.push(
                  <div
                    key={feat.label}
                    style={{
                      display: 'grid', gridTemplateColumns: '1fr 120px 120px 120px',
                      padding: '13px 20px',
                      borderTop: `1px solid ${BORDER}`,
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <span style={{ fontSize: 13.5, color: TEXT1 }}>{feat.label}</span>
                      {feat.note && (
                        <span style={{ marginLeft: 8, fontFamily: MONO, fontSize: 10, color: TEXT3 }}>
                          {feat.note}
                        </span>
                      )}
                    </div>
                    <Cell value={feat.free} />
                    <Cell value={feat.pro} />
                    <Cell value={feat.team} />
                  </div>
                )
              })
              return rows
            })()}

            {/* CTA row */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 120px 120px 120px',
              padding: '20px',
              borderTop: `1px solid ${BORDER}`,
              background: BG2, gap: 10,
              alignItems: 'center',
            }}>
              <div />
              {[
                { label: 'Get started', action: () => { window.location.href = '/app' } },
                { label: 'Start Pro', action: () => openStripe(annual ? STRIPE.pro_annual : STRIPE.pro_monthly) },
                { label: 'Talk to us', action: () => openStripe(annual ? STRIPE.team_annual : STRIPE.team_monthly) },
              ].map(({ label, action }) => (
                <button
                  key={label}
                  onClick={action}
                  style={{
                    width: '100%', padding: '9px 0',
                    border: `1px solid ${TEXT1}`, background: 'transparent',
                    fontFamily: MONO, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase',
                    color: TEXT1, cursor: 'pointer',
                    transition: 'background .12s, color .12s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = TEXT1; (e.currentTarget as HTMLButtonElement).style.color = '#fff' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; (e.currentTarget as HTMLButtonElement).style.color = TEXT1 }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          </div>{/* end mobile-overflow-x */}
        </div>

        {/* ── FAQ ── */}
        <div style={{ marginTop: 80, maxWidth: 680 }}>
          <h2 style={{ fontWeight: 500, fontSize: 24, letterSpacing: '-.015em', marginBottom: 32 }}>
            Questions
          </h2>
          {[
            {
              q: 'Is there a free trial for Pro?',
              a: 'Yes — all new accounts get 14 days of Pro features at no cost. No card required until the trial ends.',
            },
            {
              q: 'What happens if I hit the node or transform limit?',
              a: 'You\'ll see a clear warning before the limit is enforced. Existing data is never deleted — you just can\'t add more until you upgrade or the day resets.',
            },
            {
              q: 'Can I use Raven offline?',
              a: 'The graph canvas and all local enrichment transforms work offline. Cloud sync and API-backed enrichment (AbuseIPDB, Shodan, etc.) require a connection.',
            },
            {
              q: 'Do you offer government / law enforcement pricing?',
              a: 'Yes. Contact us at sales@raven.io and we\'ll discuss volume, air-gap deployment, and framework contract options.',
            },
            {
              q: 'How does Stripe handle my payment data?',
              a: 'All payment processing is handled by Stripe. Raven never stores card numbers. Stripe is PCI DSS Level 1 certified.',
            },
            {
              q: 'Can I export all my data if I leave?',
              a: 'Always. Export any investigation as Raven JSON or STIX 2.1 at any time, on any plan. Your data belongs to you.',
            },
          ].map(({ q, a }) => (
            <div key={q} style={{ padding: '22px 0', borderTop: `1px solid ${BORDER}` }}>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 8, color: TEXT1 }}>{q}</div>
              <div style={{ fontSize: 13.5, lineHeight: 1.65, color: TEXT2 }}>{a}</div>
            </div>
          ))}
        </div>

        {/* ── Footer note ── */}
        <div style={{ marginTop: 80, paddingTop: 32, borderTop: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, color: TEXT3, lineHeight: 1.6 }}>
            Prices shown in GBP and exclude VAT where applicable.<br />
            Annual plans are billed upfront. You can cancel at any time.
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <button onClick={() => navigate('/docs')} style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.07em', color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>
              Documentation
            </button>
            <button onClick={() => navigate('/')} style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.07em', color: TEXT3, background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase' }}>
              raven.io
            </button>
          </div>
        </div>

      </main>
      <SiteFooter />
    </div>
  )
}
