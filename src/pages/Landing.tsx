import React, { useRef, useState, useEffect, useCallback } from 'react'
import { HeroGraph } from '../components/HeroGraph'
import { useIsMobile } from '../hooks/useBreakpoint'
import { SiteFooter } from '../components/SiteFooter'
import { RavenLogo } from '../components/RavenLogo'

const MONO = "'IBM Plex Mono',ui-monospace,monospace"
const SANS = "'Helvetica Neue',Helvetica,Arial,sans-serif"

// ── Hero canvas particle network ─────────────────────────────────────────────

function useHeroCanvas(canvasRef: React.RefObject<HTMLCanvasElement>) {
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    let w = 0, h = 0
    let nodes: { x: number; y: number; vx: number; vy: number }[] = []
    const mouse = { x: -9999, y: -9999 }
    let rafId = 0

    const resize = () => {
      const r = canvas.parentElement!.getBoundingClientRect()
      w = r.width; h = r.height
      canvas.width = w * dpr; canvas.height = h * dpr
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const count = Math.max(40, Math.min(130, Math.floor((w * h) / 11000)))
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.28, vy: (Math.random() - 0.5) * 0.28,
      }))
    }
    resize()

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top
    }
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999 }
    const parent = canvas.parentElement!
    parent.addEventListener('mousemove', onMove)
    parent.addEventListener('mouseleave', onLeave)
    window.addEventListener('resize', resize)

    const D = 132
    const loop = () => {
      ctx.clearRect(0, 0, w, h)
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy
        if (n.x < 0 || n.x > w) n.vx *= -1
        if (n.y < 0 || n.y > h) n.vy *= -1
        const dx = n.x - mouse.x, dy = n.y - mouse.y, md = Math.hypot(dx, dy)
        if (md < 150 && md > 0.001) {
          const f = (150 - md) / 150 * 0.6
          n.x += (dx / md) * f; n.y += (dy / md) * f
        }
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j]
          const dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy)
          if (d < D) {
            const o = (1 - d / D) * 0.16
            ctx.strokeStyle = `rgba(180,190,212,${o})`
            ctx.lineWidth = 1
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke()
          }
        }
      }
      for (const n of nodes) {
        const dx = n.x - mouse.x, dy = n.y - mouse.y, d = Math.hypot(dx, dy)
        if (d < 175) {
          const o = (1 - d / 175) * 0.5
          ctx.strokeStyle = `rgba(120,158,255,${o})`
          ctx.lineWidth = 1
          ctx.beginPath(); ctx.moveTo(n.x, n.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke()
        }
      }
      for (const n of nodes) {
        ctx.fillStyle = 'rgba(206,214,234,0.72)'
        ctx.beginPath(); ctx.arc(n.x, n.y, 1.3, 0, 6.2832); ctx.fill()
      }
      rafId = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', resize)
      parent.removeEventListener('mousemove', onMove)
      parent.removeEventListener('mouseleave', onLeave)
    }
  }, [canvasRef])
}

// ── Scroll reveal ─────────────────────────────────────────────────────────────

function useScrollReveal(rootRef: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const els = root.querySelectorAll<HTMLElement>('[data-reveal]')
    if (!window.IntersectionObserver) {
      els.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none' })
      return
    }
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          ;(e.target as HTMLElement).style.opacity = '1';
          ;(e.target as HTMLElement).style.transform = 'none'
          io.unobserve(e.target)
        }
      })
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.04 })
    els.forEach(el => io.observe(el))
    const fb = setTimeout(() => {
      els.forEach(el => { el.style.opacity = '1'; el.style.transform = 'none' })
    }, 2400)
    return () => { io.disconnect(); clearTimeout(fb) }
  }, [rootRef])
}

// ── Header scroll state ───────────────────────────────────────────────────────

function useHeaderScroll(
  headerRef: React.RefObject<HTMLElement>,
  heroRef: React.RefObject<HTMLElement>,
): boolean {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const header = headerRef.current
    const hero = heroRef.current
    const onScroll = () => {
      if (!header) return
      const threshold = hero ? hero.offsetHeight - 90 : 500
      const past = window.scrollY > threshold
      setScrolled(past)
      if (past) {
        header.style.background = 'rgba(255,255,255,0.88)'
        header.style.backdropFilter = 'blur(20px) saturate(180%)'
        ;(header.style as CSSStyleDeclaration & { webkitBackdropFilter: string }).webkitBackdropFilter = 'blur(20px) saturate(180%)'
        header.style.color = '#0a0a0b'
        header.style.borderBottomColor = 'rgba(236,236,238,0.7)'
        header.style.boxShadow = '0 1px 0 rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.04)'
      } else {
        header.style.background = 'transparent'
        header.style.backdropFilter = 'none'
        ;(header.style as CSSStyleDeclaration & { webkitBackdropFilter: string }).webkitBackdropFilter = 'none'
        header.style.color = '#fff'
        header.style.borderBottomColor = 'transparent'
        header.style.boxShadow = 'none'
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [headerRef, heroRef])

  return scrolled
}

// ── Industries data ───────────────────────────────────────────────────────────

const INDUSTRIES = [
  { label: 'Law Enforcement', desc: 'Police forces, the NCA, and national agencies use Raven to map serious and organised crime networks, trace digital infrastructure, and build evidential-quality entity pictures.' },
  { label: 'Financial Crime Teams', desc: 'Fraud and financial crime teams at banks and building societies use Raven to trace APP fraud chains, map mule networks, and identify the infrastructure behind repeat offenders.' },
  { label: 'Financial Intelligence', desc: 'FIUs and MLRO teams use Raven to build the entity picture behind SARs, investigate suspicious patterns, and share structured intelligence with law enforcement in STIX 2.1.' },
  { label: 'Counter-Fraud', desc: 'Government counter-fraud units at HMRC, DWP, and local authorities use Raven to detect benefit fraud, trace identity networks, and coordinate investigations across agencies.' },
  { label: 'Insurance', desc: 'Fraud investigation units at insurers use Raven to map organised fraud rings, trace shared infrastructure, and build cases for prosecution or civil recovery.' },
  { label: 'Cyber Security', desc: 'Threat intelligence and incident response teams use Raven to map attacker infrastructure, correlate indicators of compromise, and produce shareable STIX 2.1 bundles.' },
  { label: 'Intelligence Agencies', desc: 'Analysts at national and regional intelligence agencies use Raven to build adversary network maps and apply NATO-standard STANAG 2511 grading to every link in the picture.' },
  { label: 'Legal & Compliance', desc: 'Financial crime law firms and in-house legal teams use Raven to build court-ready entity diagrams, organise evidence, and share structured findings across the case team.' },
]

const BLOG_POSTS = [
  { cat: 'Investigation', title: 'Mapping a £3.2M APP fraud network: how graph analysis revealed 14 connected mule accounts in under an hour' },
  { cat: 'Product', title: 'STANAG 2511 grading in Raven: why we built NATO intel grading into the data model from day one' },
  { cat: 'Engineering', title: 'Building a graph canvas that holds 5,000 nodes: what 18 months of real investigations taught us' },
  { cat: 'Field Notes', title: 'OSINT enrichment at scale: what we learned from 200 investigations across Shodan, WHOIS, and Companies House' },
]

// ── Main component ────────────────────────────────────────────────────────────

export function LandingPage({ onSignIn }: { onSignIn: () => void }) {
  const rootRef   = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLElement>(null)
  const heroRef   = useRef<HTMLElement>(null)

  const [demoEmail, setDemoEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [menuOpen,  setMenuOpen]  = useState(false)
  const isMobile = useIsMobile(900)

  useScrollReveal(rootRef)
  const headerScrolled = useHeaderScroll(headerRef, heroRef)

  // Close menu when resizing to desktop
  useEffect(() => { if (!isMobile) setMenuOpen(false) }, [isMobile])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const handleDemoSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (demoEmail.trim()) setSubmitted(true)
  }, [demoEmail])

  const year = new Date().getFullYear()

  return (
    <div
      ref={rootRef}
      className="raven-landing"
      style={{ background: '#fff', color: '#0a0a0b', fontFamily: SANS, WebkitFontSmoothing: 'antialiased', lineHeight: 1.5 }}
    >

      {/* ===== HEADER ===== */}
      <header
        ref={headerRef}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
          color: '#fff', borderBottom: '1px solid transparent',
          transition: 'background .35s ease, color .35s ease, border-color .35s ease, box-shadow .35s ease, backdrop-filter .35s ease',
        }}
      >
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '16px clamp(20px,5vw,56px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24 }}>
          <a href="#top" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            <RavenLogo height={24} forceTheme={headerScrolled ? 'light' : 'dark'} />
          </a>

          {/* Desktop nav */}
          {!isMobile && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
              {([['Platform', '/platform'], ['Industries', '/industries'], ['Security', '/security'], ['Pricing', '/pricing'], ['Docs', '/docs'], ['About', '/about']] as const).map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', textDecoration: 'none', color: 'inherit', opacity: 0.82 }}
                >
                  {label}
                </a>
              ))}
              <button
                onClick={onSignIn}
                style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.35)', cursor: 'pointer', padding: '8px 16px', whiteSpace: 'nowrap', color: 'inherit', transition: 'background .2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.22)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.12)' }}
              >
                Sign in →
              </button>
            </nav>
          )}

          {/* Mobile hamburger */}
          {isMobile && (
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              style={{
                display: 'flex', flexDirection: 'column', justifyContent: 'center',
                gap: 5, width: 40, height: 40, padding: 8,
                background: 'none', border: 'none', cursor: 'pointer', color: 'inherit',
              }}
            >
              <span style={{ display: 'block', height: 1.5, background: 'currentColor', transform: menuOpen ? 'translateY(6.5px) rotate(45deg)' : 'none', transition: 'transform 0.2s ease' }} />
              <span style={{ display: 'block', height: 1.5, background: 'currentColor', opacity: menuOpen ? 0 : 1, transition: 'opacity 0.15s ease' }} />
              <span style={{ display: 'block', height: 1.5, background: 'currentColor', transform: menuOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none', transition: 'transform 0.2s ease' }} />
            </button>
          )}
        </div>
      </header>

      {/* Mobile nav overlay */}
      {isMobile && menuOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99,
          background: '#08080a', paddingTop: 64,
          display: 'flex', flexDirection: 'column',
          animation: 'fadeIn 0.15s ease', overflowY: 'auto',
        }}>
          <nav style={{ padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            {([['Platform', '/platform'], ['Industries', '/industries'], ['Security', '/security'], ['Pricing', '/pricing'], ['Docs', '/docs'], ['About', '/about']] as const).map(([label, href]) => (
              <a
                key={label}
                href={href}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center', width: '100%',
                  padding: '18px clamp(20px,5vw,40px)',
                  fontFamily: MONO, fontSize: 13, letterSpacing: '.12em', textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.85)', textDecoration: 'none',
                  borderBottom: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                {label}
              </a>
            ))}
          </nav>
          <div style={{ padding: '20px clamp(20px,5vw,40px)' }}>
            <button
              onClick={() => { setMenuOpen(false); onSignIn() }}
              style={{
                display: 'block', width: '100%', padding: '16px',
                fontFamily: MONO, fontSize: 12, letterSpacing: '.09em', textTransform: 'uppercase',
                background: '#fff', color: '#0a0a0b', border: 'none', cursor: 'pointer',
              }}
            >
              Sign in →
            </button>
          </div>
        </div>
      )}

      {/* ===== HERO ===== */}
      <section id="top" ref={heroRef} style={{ position: 'relative', height: '100vh', minHeight: 640, background: '#08080a', overflow: 'hidden' }}>
        {/* Graph mockup — right side */}
        <HeroGraph />
        {/* Left-side text protection gradient */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, #08080a 38%, rgba(8,8,10,0.7) 58%, rgba(8,8,10,0) 80%), linear-gradient(180deg, rgba(8,8,10,0.5) 0%, rgba(8,8,10,0) 20%, rgba(8,8,10,0.8) 92%)', pointerEvents: 'none', zIndex: 1 }} />
        <div style={{ position: 'relative', zIndex: 2, height: '100%', maxWidth: 1320, margin: '0 auto', padding: '0 clamp(20px,5vw,56px)', display: 'flex', flexDirection: 'column', justifyContent: 'center', pointerEvents: 'none' }}>
          <div style={{ fontFamily: MONO, fontSize: 12, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.62)', marginBottom: 26 }}>
            Raven — Link Analysis Platform
          </div>
          <h1 style={{ margin: 0, color: '#fff', fontWeight: 500, fontSize: 'clamp(38px,6vw,90px)', lineHeight: 1.03, letterSpacing: '-.025em', maxWidth: '17ch' }}>
            Graph-based link analysis for financial crime investigators
          </h1>
          <p style={{ margin: '30px 0 0', color: 'rgba(255,255,255,.7)', fontSize: 'clamp(16px,1.5vw,20px)', maxWidth: '46ch', lineHeight: 1.55 }}>
            Map fraud networks, trace digital infrastructure, and turn raw indicators into a graded, classified, shareable entity picture — in the time it used to take to open a spreadsheet.
          </p>
        </div>
        <a href="#platform" style={{ position: 'absolute', zIndex: 2, left: 'clamp(20px,5vw,56px)', bottom: 40, display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', color: 'rgba(255,255,255,.7)', fontFamily: MONO, fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase' }}>
          <span style={{ display: 'inline-flex', animation: 'scrollNudge 1.8s ease-in-out infinite' }}>↓</span>
          Scroll to next
        </a>
      </section>

      {/* ===== BIG STATEMENT ===== */}
      <section id="platform" style={{ scrollMarginTop: 80, borderTop: '1px solid #ececee' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(72px,10vw,140px) clamp(20px,5vw,56px) clamp(56px,7vw,96px)' }}>
          <h2
            data-reveal
            style={{ opacity: 0, transform: 'translateY(22px)', transition: 'opacity .8s cubic-bezier(.2,.7,.2,1),transform .8s cubic-bezier(.2,.7,.2,1)', margin: 0, fontWeight: 500, fontSize: 'clamp(28px,4.4vw,58px)', lineHeight: 1.08, letterSpacing: '-.018em', maxWidth: '20ch' }}
          >
            The graph-native investigation tool trusted by fraud analysts, financial intelligence units, and law enforcement to map the connections that matter.
          </h2>
        </div>
      </section>

      {/* ===== INDUSTRIES GRID ===== */}
      <section id="industries" style={{ scrollMarginTop: 80, borderTop: '1px solid #ececee' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(48px,5vw,72px) clamp(20px,5vw,56px) clamp(64px,8vw,110px)' }}>
          <div
            data-reveal
            className="mobile-two-col"
            style={{ opacity: 0, transform: 'translateY(22px)', transition: 'opacity .8s cubic-bezier(.2,.7,.2,1),transform .8s cubic-bezier(.2,.7,.2,1)', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', columnGap: 'clamp(20px,3vw,44px)', rowGap: 'clamp(40px,5vw,64px)' }}
          >
            {INDUSTRIES.map(ind => (
              <div key={ind.label} style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ width: 1, height: 30, background: '#d4d4d7', marginBottom: 20 }} />
                <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9a9aa0', marginBottom: 14 }}>
                  {ind.label}
                </div>
                <p style={{ margin: '0 0 18px', fontSize: 15, lineHeight: 1.5, color: '#26262a', maxWidth: '30ch' }}>{ind.desc}</p>
                <a
                  href="#demo"
                  className="hover-border"
                  style={{ marginTop: 'auto', fontFamily: MONO, fontSize: 11.5, letterSpacing: '.04em', textDecoration: 'none', color: '#0a0a0b', borderBottom: '1px solid #cfcfd2', paddingBottom: 3, width: 'fit-content', whiteSpace: 'nowrap', transition: 'border-color .2s' }}
                >
                  → Ask for demo
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SECURITY ===== */}
      <section id="security" style={{ scrollMarginTop: 80, borderTop: '1px solid #ececee' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(64px,8vw,120px) clamp(20px,5vw,56px)' }}>
          <div
            data-reveal
            className="mobile-single-col"
            style={{ opacity: 0, transform: 'translateY(22px)', transition: 'opacity .8s cubic-bezier(.2,.7,.2,1),transform .8s cubic-bezier(.2,.7,.2,1)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(36px,6vw,96px)', alignItems: 'start' }}
          >
            <div>
              <h2 style={{ margin: 0, fontWeight: 500, fontSize: 'clamp(24px,2.6vw,38px)', lineHeight: 1.15, letterSpacing: '-.012em', maxWidth: '18ch' }}>
                Our commitment to data security and privacy →
              </h2>
            </div>
            <div>
              <p style={{ margin: '0 0 24px', fontSize: 'clamp(16px,1.4vw,19px)', lineHeight: 1.55, color: '#26262a' }}>
                Investigations contain sensitive intelligence. Raven is built to UK GDPR and OFFICIAL-SENSITIVE classification standards — your case data stays within the boundaries you set, and enrichment transforms send only the specific entity value, never your graph or case notes.
              </p>
              <p style={{ margin: 0, fontSize: 'clamp(16px,1.4vw,19px)', lineHeight: 1.55, color: '#26262a' }}>
                On the Free tier, nothing leaves your browser. On Pro and Enterprise, each deployment is fully isolated with encrypted storage and a full read/write audit trail.
              </p>
            </div>
          </div>

          <div
            data-reveal
            className="mobile-single-col"
            style={{ opacity: 0, transform: 'translateY(22px)', transition: 'opacity .8s cubic-bezier(.2,.7,.2,1),transform .8s cubic-bezier(.2,.7,.2,1)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(36px,6vw,96px)', marginTop: 'clamp(48px,6vw,80px)', alignItems: 'start' }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                'Cloud Security Principles',
                'Data Protection toolkit',
                'Independently assured by Government',
                'Privacy & civil liberties engineering',
                'Customers stay in complete control of their data',
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '16px 0', borderBottom: '1px solid #ececee' }}>
                  <span style={{ fontSize: 15, color: '#26262a' }}>{item}</span>
                  <span style={{ fontFamily: MONO, fontSize: 11, color: '#9a9aa0' }}>0{i + 1}</span>
                </div>
              ))}
            </div>
            <div>
              <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9a9aa0', marginBottom: 16 }}>
                How the platform implements it
              </div>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: '#26262a', maxWidth: '42ch' }}>
                The Raven foundation implements recognised cloud security principles end to end — encryption in transit and at rest, granular purpose-based access, full audit of every read and write, and continuous monitoring — so trust is provable, not promised.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FULL BLEED PHOTO ===== */}
      <section style={{ borderTop: '1px solid #ececee', width: '100%', overflow: 'hidden' }}>
        <div style={{ width: '100%', aspectRatio: '16/6', minHeight: 220, background: 'repeating-linear-gradient(135deg,#e9e9eb,#e9e9eb 14px,#f3f3f5 14px,#f3f3f5 28px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 'clamp(9px,1.2vw,12px)', letterSpacing: '.1em', textTransform: 'uppercase', color: '#9a9aa0' }}>photo · team building in the field</span>
        </div>
      </section>

      {/* ===== CAREERS ===== */}
      <section id="careers" style={{ scrollMarginTop: 80, borderTop: '1px solid #ececee' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(64px,8vw,120px) clamp(20px,5vw,56px)' }}>
          <div
            data-reveal
            className="mobile-single-col"
            style={{ opacity: 0, transform: 'translateY(22px)', transition: 'opacity .8s cubic-bezier(.2,.7,.2,1),transform .8s cubic-bezier(.2,.7,.2,1)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(36px,6vw,96px)', alignItems: 'start' }}
          >
            <h2 style={{ margin: 0, fontWeight: 500, fontSize: 'clamp(30px,4.4vw,60px)', lineHeight: 1.05, letterSpacing: '-.02em' }}>
              There is so much left to build
            </h2>
            <div>
              <p style={{ margin: '0 0 28px', fontSize: 'clamp(16px,1.5vw,20px)', lineHeight: 1.55, color: '#26262a', maxWidth: '40ch' }}>
                At Raven, we work with the institutions advancing shared values — within our own walls and across the world. If that's the work you want to do, we should talk.
              </p>
              <a
                href="#"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 10, fontFamily: MONO, fontSize: 12, letterSpacing: '.06em', textTransform: 'uppercase', textDecoration: 'none', color: '#0a0a0b', borderBottom: '1px solid #0a0a0b', paddingBottom: 5 }}
              >
                Explore careers →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ===== BLOG ===== */}
      <section id="blog" style={{ scrollMarginTop: 80, borderTop: '1px solid #ececee' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(56px,6vw,96px) clamp(20px,5vw,56px) clamp(64px,8vw,110px)' }}>
          <h2
            data-reveal
            style={{ opacity: 0, transform: 'translateY(22px)', transition: 'opacity .8s cubic-bezier(.2,.7,.2,1),transform .8s cubic-bezier(.2,.7,.2,1)', margin: '0 0 clamp(36px,4vw,56px)', fontWeight: 500, fontSize: 'clamp(26px,3.2vw,44px)', letterSpacing: '-.015em' }}
          >
            From our blog
          </h2>
          <div
            data-reveal
            className="mobile-two-col"
            style={{ opacity: 0, transform: 'translateY(22px)', transition: 'opacity .8s cubic-bezier(.2,.7,.2,1),transform .8s cubic-bezier(.2,.7,.2,1)', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', columnGap: 'clamp(20px,3vw,44px)', rowGap: 40 }}
          >
            {BLOG_POSTS.map(post => (
              <article key={post.title} style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid #0a0a0b', paddingTop: 18 }}>
                <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9a9aa0', marginBottom: 16 }}>{post.cat}</div>
                <h3 style={{ margin: '0 0 22px', fontWeight: 500, fontSize: 16, lineHeight: 1.32 }}>{post.title}</h3>
                <a
                  href="#"
                  className="hover-border"
                  style={{ marginTop: 'auto', fontFamily: MONO, fontSize: 11.5, textDecoration: 'none', color: '#0a0a0b', borderBottom: '1px solid #cfcfd2', paddingBottom: 3, width: 'fit-content', whiteSpace: 'nowrap' }}
                >
                  → Read more
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ===== DEMO ===== */}
      <section id="demo" style={{ scrollMarginTop: 80, borderTop: '1px solid #ececee', background: '#0a0a0c', color: '#fff' }}>
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(80px,11vw,160px) clamp(20px,5vw,56px)', textAlign: 'center' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,.5)', marginBottom: 28 }}>
            Get started
          </div>
          <h2 style={{ margin: '0 0 40px', fontWeight: 500, fontSize: 'clamp(34px,5vw,68px)', letterSpacing: '-.02em' }}>
            Start your first investigation free
          </h2>
          {submitted ? (
            <div style={{ fontFamily: MONO, fontSize: 14, letterSpacing: '.04em', color: '#fff', border: '1px solid rgba(255,255,255,.25)', padding: '20px 28px', display: 'inline-block' }}>
              ✓ Thank you — a member of our team will be in touch.
            </div>
          ) : (
            <form
              onSubmit={handleDemoSubmit}
              className="mobile-form-stack"
              style={{ display: 'flex', gap: 0, maxWidth: 520, margin: '0 auto', border: '1px solid rgba(255,255,255,.28)' }}
            >
              <input
                type="email"
                required
                value={demoEmail}
                onChange={e => setDemoEmail(e.target.value)}
                placeholder="Work email"
                style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: 15, padding: '18px 20px', fontFamily: SANS }}
              />
              <button
                type="submit"
                style={{ background: '#fff', color: '#0a0a0b', border: 'none', cursor: 'pointer', fontFamily: MONO, fontSize: 12, letterSpacing: '.08em', textTransform: 'uppercase', padding: '0 28px', whiteSpace: 'nowrap', transition: 'opacity .2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '.85' }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.opacity = '1' }}
              >
                Get started →
              </button>
            </form>
          )}
        </div>
      </section>
      <SiteFooter />

    </div>
  )
}
