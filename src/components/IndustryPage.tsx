import React from 'react'
import { useNavigate } from 'react-router-dom'
import { SiteHeader } from './SiteHeader'
import { SiteFooter } from './SiteFooter'

const MONO = "'IBM Plex Mono',ui-monospace,monospace"
const SANS = "'Helvetica Neue',Helvetica,Arial,sans-serif"
const TEXT1 = '#0a0a0b'
const TEXT2 = '#26262a'
const TEXT3 = '#9a9aa0'
const BORDER = '#ececee'

export interface IndustryStat     { value: string; label: string }
export interface IndustryChallenge { title: string; body: string }
export interface IndustryCapability {
  tag: string
  title: string
  body: string
  photo: string
  photoAlt: string
}
export interface IndustryUseCase    { title: string; body: string }
export interface RelatedSector      { name: string; path: string }

export interface IndustryConfig {
  index: string
  name: string
  tagline: string
  headline: string
  subheadline: string
  coverPhoto: string
  coverPhotoAlt: string
  stats: [IndustryStat, IndustryStat, IndustryStat]
  challengeIntro: string
  challenges: [IndustryChallenge, IndustryChallenge, IndustryChallenge]
  capabilities: [IndustryCapability, IndustryCapability, IndustryCapability]
  useCases: IndustryUseCase[]
  related: RelatedSector[]
}

function PhotoPlaceholder({ label, style }: { label: string; style?: React.CSSProperties }) {
  return (
    <div style={{
      width: '100%', height: '100%',
      background: 'repeating-linear-gradient(135deg,#e9e9eb,#e9e9eb 14px,#f3f3f5 14px,#f3f3f5 28px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      ...style,
    }}>
      <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9a9aa0' }}>
        photo · {label}
      </span>
    </div>
  )
}

export function IndustryPage({ config }: { config: IndustryConfig }) {
  const navigate = useNavigate()

  return (
    <div style={{ background: '#fff', color: TEXT1, fontFamily: SANS, WebkitFontSmoothing: 'antialiased', lineHeight: 1.5, minHeight: '100vh' }}>
      <SiteHeader active="/industries" />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section style={{ position: 'relative', height: 'clamp(580px,88vh,960px)', overflow: 'hidden' }}>
        <PhotoPlaceholder label="industry hero" style={{ position: 'absolute', inset: 0 }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(110deg, rgba(4,4,6,0.93) 45%, rgba(4,4,6,0.5) 100%)' }} />
        <div style={{
          position: 'relative', zIndex: 1,
          maxWidth: 1320, margin: '0 auto',
          padding: 'clamp(80px,10vw,140px) clamp(20px,5vw,56px) clamp(56px,7vw,80px)',
          height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        }}>
          <div
            style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
            onClick={() => navigate('/industries')}
          >
            <span>Industries</span>
            <span style={{ opacity: 0.5 }}>/</span>
            <span style={{ color: 'rgba(255,255,255,0.6)' }}>{config.name}</span>
          </div>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 18 }}>
            {config.index} — {config.tagline}
          </div>
          <h1 style={{ margin: '0 0 22px', fontWeight: 500, fontSize: 'clamp(32px,5vw,70px)', lineHeight: 1.05, letterSpacing: '-.025em', color: '#fff', maxWidth: '18ch' }}>
            {config.headline}
          </h1>
          <p style={{ margin: '0 0 44px', fontSize: 'clamp(16px,1.35vw,20px)', lineHeight: 1.6, color: 'rgba(255,255,255,0.62)', maxWidth: '48ch' }}>
            {config.subheadline}
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={() => navigate('/contact?type=enterprise')}
              style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', background: '#fff', color: TEXT1, border: 'none', cursor: 'pointer', padding: '13px 26px' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#e8e8e8' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff' }}
            >
              Request a briefing →
            </button>
            <button
              onClick={() => navigate('/platform')}
              style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.09em', textTransform: 'uppercase', background: 'transparent', color: 'rgba(255,255,255,0.65)', border: '1px solid rgba(255,255,255,0.25)', cursor: 'pointer', padding: '13px 26px' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.55)'; e.currentTarget.style.color = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = 'rgba(255,255,255,0.65)' }}
            >
              See the platform
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────────────────────── */}
      <section style={{ background: '#0a0a0b' }}>
        <div className="mobile-single-col" style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(28px,3.5vw,44px) clamp(20px,5vw,56px)', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0 }}>
          {config.stats.map((s, i) => (
            <div key={i} style={{ padding: 'clamp(12px,2vw,0px) clamp(20px,3vw,44px)', borderLeft: i > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
              <div style={{ fontFamily: MONO, fontSize: 'clamp(20px,2.8vw,36px)', fontWeight: 700, letterSpacing: '-.02em', color: '#fff', marginBottom: 5 }}>
                {s.value}
              </div>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.38)', lineHeight: 1.5 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── The Challenge ────────────────────────────────────────────────── */}
      <section style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,56px)' }}>
          <div className="mobile-single-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1.65fr', gap: 'clamp(36px,6vw,100px)', alignItems: 'start' }}>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color: TEXT3, marginBottom: 20 }}>
                The challenge
              </div>
              <h2 style={{ margin: '0 0 20px', fontWeight: 500, fontSize: 'clamp(22px,2.4vw,34px)', lineHeight: 1.15, letterSpacing: '-.015em' }}>
                Why {config.name.toLowerCase()} needs graph analysis
              </h2>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.75, color: TEXT2 }}>
                {config.challengeIntro}
              </p>
            </div>
            <div>
              {config.challenges.map((c, i) => (
                <div key={i} style={{ padding: 'clamp(18px,2.2vw,28px) 0', borderTop: `1px solid ${BORDER}` }}>
                  <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.08em', color: TEXT3, marginBottom: 9 }}>
                    {String(i + 1).padStart(2, '0')}
                  </div>
                  <div style={{ fontWeight: 500, fontSize: 15.5, marginBottom: 7, color: TEXT1, lineHeight: 1.3 }}>{c.title}</div>
                  <div style={{ fontSize: 14, lineHeight: 1.68, color: TEXT2 }}>{c.body}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Capabilities ─────────────────────────────────────────────────── */}
      {config.capabilities.map((cap, i) => {
        const isReversed = i % 2 === 1
        const TextPane = (
          <div style={{
            padding: 'clamp(48px,6vw,80px) clamp(20px,5vw,60px)',
            display: 'flex', flexDirection: 'column', justifyContent: 'center',
            maxWidth: '100%',
          }}>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: TEXT3, marginBottom: 20 }}>
              {cap.tag}
            </div>
            <h3 style={{ margin: '0 0 18px', fontWeight: 500, fontSize: 'clamp(20px,2.2vw,30px)', lineHeight: 1.18, letterSpacing: '-.01em', color: TEXT1 }}>
              {cap.title}
            </h3>
            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.75, color: TEXT2, maxWidth: '44ch' }}>
              {cap.body}
            </p>
          </div>
        )
        const PhotoPane = (
          <div style={{ position: 'relative', overflow: 'hidden', minHeight: 'clamp(300px,42vw,580px)' }}>
            <PhotoPlaceholder label="capability" style={{ position: 'absolute', inset: 0 }} />
          </div>
        )
        return (
          <section key={i} style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 1 ? '#f8f8fa' : '#fff' }}>
            <div className="mobile-single-col" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', maxWidth: 1320, margin: '0 auto' }}>
              {isReversed ? <>{PhotoPane}{TextPane}</> : <>{TextPane}{PhotoPane}</>}
            </div>
          </section>
        )
      })}

      {/* ── Use cases grid ───────────────────────────────────────────────── */}
      <section style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(56px,7vw,96px) clamp(20px,5vw,56px)' }}>
          <div style={{ marginBottom: 'clamp(32px,4vw,52px)' }}>
            <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color: TEXT3, marginBottom: 14 }}>
              Workflows
            </div>
            <h2 style={{ margin: 0, fontWeight: 500, fontSize: 'clamp(24px,2.8vw,40px)', lineHeight: 1.1, letterSpacing: '-.02em' }}>
              How {config.name.toLowerCase()} teams use Raven
            </h2>
          </div>
          <div className="mobile-single-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 0 }}>
            {config.useCases.map((uc, i) => (
              <div
                key={i}
                style={{
                  padding: 'clamp(20px,2.5vw,36px)',
                  borderTop: `1px solid ${BORDER}`,
                  borderLeft: i % 3 !== 0 ? `1px solid ${BORDER}` : 'none',
                }}
              >
                <div style={{ fontFamily: MONO, fontSize: 10.5, color: TEXT3, marginBottom: 12, letterSpacing: '.06em' }}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div style={{ fontWeight: 500, fontSize: 14.5, color: TEXT1, marginBottom: 9, lineHeight: 1.35 }}>{uc.title}</div>
                <div style={{ fontSize: 13, lineHeight: 1.68, color: TEXT2 }}>{uc.body}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Related sectors ──────────────────────────────────────────────── */}
      <section style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div style={{
          maxWidth: 1320, margin: '0 auto',
          padding: 'clamp(24px,3vw,36px) clamp(20px,5vw,56px)',
          display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12,
        }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: TEXT3, flexShrink: 0, marginRight: 4 }}>
            Also used by
          </div>
          {config.related.map((r, i) => (
            <button
              key={i}
              onClick={() => navigate(r.path)}
              style={{
                fontFamily: MONO, fontSize: 10, letterSpacing: '.07em', textTransform: 'uppercase',
                background: 'none', color: TEXT2, border: `1px solid ${BORDER}`,
                cursor: 'pointer', padding: '7px 13px', transition: 'all .12s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = TEXT1; e.currentTarget.style.color = TEXT1 }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = BORDER; e.currentTarget.style.color = TEXT2 }}
            >
              {r.name} →
            </button>
          ))}
          <button
            onClick={() => navigate('/industries')}
            style={{
              fontFamily: MONO, fontSize: 10, letterSpacing: '.07em', textTransform: 'uppercase',
              background: 'none', color: TEXT3, border: 'none',
              cursor: 'pointer', padding: '7px 0', marginLeft: 4,
            }}
          >
            View all industries →
          </button>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section style={{ background: '#0a0a0c', color: '#fff' }}>
        <div style={{
          maxWidth: 1320, margin: '0 auto',
          padding: 'clamp(72px,9vw,120px) clamp(20px,5vw,56px)',
          display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 32,
        }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)' }}>
            Get started
          </div>
          <h2 style={{ margin: 0, fontWeight: 500, fontSize: 'clamp(28px,4vw,56px)', lineHeight: 1.08, letterSpacing: '-.02em', maxWidth: '22ch' }}>
            Talk to us about your {config.name.toLowerCase()} investigation workflow
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
