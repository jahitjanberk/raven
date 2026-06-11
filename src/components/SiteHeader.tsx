import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useIsMobile } from '../hooks/useBreakpoint'
import { RavenLogo } from './RavenLogo'

const MONO = "'IBM Plex Mono',ui-monospace,monospace"
const TEXT1 = '#0a0a0b'
const TEXT3 = '#9a9aa0'
const BORDER = '#ececee'

const NAV: { label: string; path: string }[] = [
  { label: 'Platform',   path: '/platform' },
  { label: 'Industries', path: '/industries' },
  { label: 'Security',   path: '/security' },
  { label: 'Pricing',    path: '/pricing' },
  { label: 'Docs',       path: '/docs' },
  { label: 'Status',     path: '/status' },
  { label: 'About',      path: '/about' },
]

interface SiteHeaderProps {
  active?: string
}

export function SiteHeader({ active }: SiteHeaderProps) {
  const navigate = useNavigate()
  const isMobile = useIsMobile(900)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Close menu on resize back to desktop
  useEffect(() => {
    if (!isMobile) setMenuOpen(false)
  }, [isMobile])

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const goTo = (path: string) => {
    setMenuOpen(false)
    navigate(path)
  }

  return (
    <>
      <header style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrolled ? 'rgba(255,255,255,0.88)' : 'rgba(255,255,255,1)',
        backdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(20px) saturate(180%)' : 'none',
        borderBottom: scrolled ? `1px solid rgba(236,236,238,0.7)` : `1px solid ${BORDER}`,
        boxShadow: scrolled ? '0 1px 0 rgba(0,0,0,0.04), 0 4px 24px rgba(0,0,0,0.04)' : 'none',
        transition: 'background 0.3s ease, backdrop-filter 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
      }}>
        <div style={{
          maxWidth: 1320, margin: '0 auto',
          padding: '0 clamp(20px,5vw,56px)',
          height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24,
        }}>

          {/* Logo */}
          <button
            onClick={() => goTo('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0 }}
          >
            <RavenLogo height={22} forceTheme="light" />
          </button>

          {/* Desktop nav */}
          {!isMobile && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
              {NAV.map(({ label, path }) => {
                const isActive = active === path
                return (
                  <button
                    key={path}
                    onClick={() => goTo(path)}
                    style={{
                      fontFamily: MONO, fontSize: 10.5, letterSpacing: '.09em',
                      textTransform: 'uppercase', background: 'none', border: 'none',
                      cursor: 'pointer', padding: 0,
                      color: isActive ? TEXT1 : TEXT3,
                      fontWeight: isActive ? 600 : 400,
                      borderBottom: isActive ? `1px solid ${TEXT1}` : '1px solid transparent',
                      paddingBottom: 1,
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = TEXT1 }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = TEXT3 }}
                  >
                    {label}
                  </button>
                )
              })}

              <button
                onClick={() => { window.location.href = '/app' }}
                style={{
                  fontFamily: MONO, fontSize: 10.5, letterSpacing: '.09em',
                  textTransform: 'uppercase', color: TEXT1,
                  background: 'none', border: `1px solid ${TEXT1}`,
                  cursor: 'pointer', padding: '7px 15px', whiteSpace: 'nowrap',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = TEXT1; e.currentTarget.style.color = '#fff' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = TEXT1 }}
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
                gap: 5, width: 36, height: 36, padding: 8,
                background: 'none', border: 'none', cursor: 'pointer',
              }}
            >
              <span style={{
                display: 'block', height: 1.5, background: TEXT1,
                transform: menuOpen ? 'translateY(6.5px) rotate(45deg)' : 'none',
                transition: 'transform 0.2s ease',
                transformOrigin: 'center',
              }} />
              <span style={{
                display: 'block', height: 1.5, background: TEXT1,
                opacity: menuOpen ? 0 : 1,
                transition: 'opacity 0.15s ease',
              }} />
              <span style={{
                display: 'block', height: 1.5, background: TEXT1,
                transform: menuOpen ? 'translateY(-6.5px) rotate(-45deg)' : 'none',
                transition: 'transform 0.2s ease',
                transformOrigin: 'center',
              }} />
            </button>
          )}
        </div>
      </header>

      {/* Mobile menu overlay */}
      {isMobile && menuOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 99,
          background: '#fff', paddingTop: 56,
          display: 'flex', flexDirection: 'column',
          animation: 'fadeIn var(--dur-normal) var(--ease-out-quart) both',
          overflowY: 'auto',
        }}>
          <nav style={{ padding: '8px 0', borderBottom: `1px solid ${BORDER}` }}>
            {NAV.map(({ label, path }) => {
              const isActive = active === path
              return (
                <button
                  key={path}
                  onClick={() => goTo(path)}
                  style={{
                    display: 'flex', alignItems: 'center', width: '100%',
                    padding: '16px clamp(20px,5vw,40px)',
                    fontFamily: MONO, fontSize: 12, letterSpacing: '.1em', textTransform: 'uppercase',
                    color: isActive ? TEXT1 : TEXT3,
                    fontWeight: isActive ? 600 : 400,
                    background: 'none', border: 'none', cursor: 'pointer',
                    borderBottom: `1px solid ${BORDER}`,
                    textAlign: 'left',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </nav>
          <div style={{ padding: '20px clamp(20px,5vw,40px)' }}>
            <button
              onClick={() => { window.location.href = '/app' }}
              style={{
                display: 'block', width: '100%', padding: '14px',
                fontFamily: MONO, fontSize: 11, letterSpacing: '.09em', textTransform: 'uppercase',
                background: TEXT1, color: '#fff', border: 'none', cursor: 'pointer',
              }}
            >
              Sign in →
            </button>
          </div>
        </div>
      )}
    </>
  )
}
