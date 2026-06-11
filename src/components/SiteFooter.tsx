import React from 'react'
import { RavenLogo } from './RavenLogo'

const MONO = "'IBM Plex Mono',ui-monospace,monospace"

const COLUMNS = [
  {
    heading: 'Product',
    links: [
      { label: 'Platform overview', href: '/platform' },
      { label: 'Industries',        href: '/industries' },
      { label: 'Pricing',           href: '/pricing' },
      { label: 'Changelog',         href: '/changelog' },
      { label: 'Docs',              href: '/docs' },
      { label: 'Status',            href: '/status' },
      { label: 'Sign in',           href: '/app' },
    ],
  },
  {
    heading: 'Use cases',
    links: [
      { label: 'Law Enforcement',      href: '/industries/law-enforcement' },
      { label: 'Financial Crime',      href: '/industries/financial-crime' },
      { label: 'Counter-Fraud',        href: '/industries/counter-fraud' },
      { label: 'Cyber & Threat Intel', href: '/industries/cyber-threat-intel' },
      { label: 'Financial Intel Units',href: '/industries/financial-intel-units' },
      { label: 'Intelligence Agencies',href: '/industries/intelligence-agencies' },
      { label: 'Insurance',            href: '/industries/insurance' },
      { label: 'Legal & Compliance',   href: '/industries/legal-compliance' },
    ],
  },
  {
    heading: 'Resources',
    links: [
      { label: 'Intelligence Insights', href: '/blog' },
      { label: 'Request access',        href: '/request-access' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { label: 'About',    href: '/about' },
      { label: 'Contact',  href: '/contact' },
      { label: 'Security', href: '/security' },
      { label: 'Careers',  href: '/careers' },
      { label: 'Partners', href: '/partners' },
    ],
  },
  {
    heading: 'Legal',
    links: [
      { label: 'Privacy policy',         href: '/privacy' },
      { label: 'Terms of service',       href: '/terms' },
      { label: 'Cookie policy',          href: '/cookies' },
      { label: 'Responsible disclosure', href: '/security' },
    ],
  },
]

export function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer style={{ borderTop: '1px solid #ececee', background: '#fff' }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: 'clamp(48px,5vw,72px) clamp(20px,5vw,56px) clamp(40px,4vw,56px)' }}>
        <div className="mobile-single-col" style={{ display: 'grid', gridTemplateColumns: '1.6fr repeat(5,1fr)', gap: 'clamp(24px,3vw,48px)' }}>

          {/* Brand column */}
          <div>
            <div style={{ marginBottom: 16 }}>
              <RavenLogo height={24} forceTheme="light" />
            </div>
            <p style={{ fontFamily: MONO, fontSize: 11, lineHeight: 1.75, color: '#9a9aa0', margin: '0 0 20px', maxWidth: '26ch' }}>
              Graph-based link analysis for financial crime, law enforcement, and intelligence teams.
            </p>
            <div style={{ fontFamily: MONO, fontSize: 11, color: '#c4c4c8', marginBottom: 20 }}>
              © {year} Raven Technologies Ltd.
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {[
                { label: 'LinkedIn', href: '#' },
                { label: 'X',        href: '#' },
                { label: 'GitHub',   href: '#' },
              ].map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', textDecoration: 'none', color: '#6a6a72', border: '1px solid #e2e2e5', padding: '6px 11px', transition: 'color .15s, border-color .15s' }}
                  onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.color = '#0a0a0b'; a.style.borderColor = '#0a0a0b' }}
                  onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.color = '#6a6a72'; a.style.borderColor = '#e2e2e5' }}
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {COLUMNS.map(col => (
            <div key={col.heading}>
              <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9a9aa0', marginBottom: 16 }}>
                {col.heading}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {col.links.map(link => (
                  <a
                    key={link.label}
                    href={link.href}
                    style={{ fontSize: 13, textDecoration: 'none', color: '#5a5a62', transition: 'color .12s' }}
                    onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#0a0a0b' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#5a5a62' }}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ marginTop: 'clamp(32px,4vw,52px)', paddingTop: 20, borderTop: '1px solid #ececee', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, color: '#b0b0b8', letterSpacing: '.04em' }}>
            Built for financial crime investigators, law enforcement, and intelligence analysts.
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            {[
              { label: 'Security', href: '/security' },
              { label: 'Privacy',  href: '/privacy' },
              { label: 'Status',   href: '/status' },
            ].map(l => (
              <a
                key={l.label}
                href={l.href}
                style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: '#9a9aa0', textDecoration: 'none', transition: 'color .12s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#0a0a0b' }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.color = '#9a9aa0' }}
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
