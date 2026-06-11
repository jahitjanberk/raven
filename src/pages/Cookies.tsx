import React from 'react'
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

const COOKIE_TABLE = [
  { name: 'raven-auth',             type: 'Essential',   duration: 'Session',  purpose: 'Stores your authenticated session token. Required for the platform to function.' },
  { name: 'raven-active-project',   type: 'Essential',   duration: '30 days',  purpose: 'Remembers your last open investigation so you can resume where you left off.' },
  { name: '_plausible',             type: 'Analytics',   duration: 'None',     purpose: 'Cookieless analytics via Plausible. No personal data is stored. We record page views and referrers in aggregate only.' },
  { name: 'raven-theme',            type: 'Preferences', duration: '1 year',   purpose: 'Remembers your display preference (light/dark mode).' },
  { name: 'raven-dismissed-banner', type: 'Preferences', duration: '90 days',  purpose: 'Records that you have dismissed a product notification banner.' },
]

const TYPE_COLORS: Record<string, string> = {
  Essential:   '#0a0a0b',
  Analytics:   '#2563eb',
  Preferences: '#059669',
}

export function CookiesPage() {
  const navigate = useNavigate()

  return (
    <div style={{ background: '#fff', color: TEXT1, fontFamily: SANS, WebkitFontSmoothing: 'antialiased', minHeight: '100vh' }}>
      <SiteHeader />

      <section style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(64px,9vw,112px) clamp(20px,4vw,48px) clamp(48px,6vw,72px)' }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: TEXT3, marginBottom: 20 }}>Legal</div>
          <h1 style={{ margin: '0 0 16px', fontWeight: 500, fontSize: 'clamp(32px,4.5vw,56px)', letterSpacing: '-.022em', lineHeight: 1.06 }}>Cookie Policy</h1>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: TEXT3 }}>Last updated: 1 June 2026</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: TEXT3 }}>Raven Technologies Ltd</span>
          </div>
        </div>
      </section>

      <section>
        <div style={{ maxWidth: 880, margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(20px,4vw,48px)' }}>

          {/* Intro */}
          <div style={{ padding: '16px 20px', background: BG2, border: `1px solid ${BORDER}`, marginBottom: 48 }}>
            <p style={{ margin: 0, fontFamily: MONO, fontSize: 11.5, lineHeight: 1.7, color: TEXT2 }}>
              Raven uses a minimal set of cookies. We do not use tracking cookies, advertising cookies, or third-party analytics cookies that set persistent identifiers. This page describes every cookie we set and why.
            </p>
          </div>

          {/* What are cookies */}
          <div style={{ marginBottom: 48, paddingBottom: 48, borderBottom: `1px solid ${BORDER}` }}>
            <h2 style={{ margin: '0 0 16px', fontWeight: 500, fontSize: 20, letterSpacing: '-.01em' }}>What are cookies?</h2>
            <p style={{ margin: '0 0 14px', fontSize: 14.5, lineHeight: 1.75, color: TEXT2 }}>
              Cookies are small text files stored on your device when you visit a website. They allow the website to remember information about your visit — such as your login session or display preferences.
            </p>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.75, color: TEXT2 }}>
              UK law requires us to tell you about the cookies we use and to obtain your consent for non-essential cookies. This policy fulfils that requirement. Where we set non-essential cookies, we ask for your consent the first time you visit.
            </p>
          </div>

          {/* Cookie categories */}
          <div style={{ marginBottom: 48, paddingBottom: 48, borderBottom: `1px solid ${BORDER}` }}>
            <h2 style={{ margin: '0 0 24px', fontWeight: 500, fontSize: 20, letterSpacing: '-.01em' }}>Cookie categories</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {[
                { type: 'Essential', desc: 'Strictly necessary for the platform to function. These cannot be disabled. They are set in response to actions you take — such as logging in.' },
                { type: 'Analytics', desc: 'Help us understand how the platform is used in aggregate. Raven uses Plausible Analytics, which is cookieless and sets no persistent identifiers. No personal data is collected.' },
                { type: 'Preferences', desc: 'Remember your choices about how the platform looks and behaves. You can clear these by clearing your browser\'s local storage.' },
              ].map(c => (
                <div key={c.type} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '.08em', textTransform: 'uppercase', color: '#fff', background: TYPE_COLORS[c.type], padding: '3px 8px', flexShrink: 0, marginTop: 2 }}>{c.type}</span>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.65, color: TEXT2 }}>{c.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Cookie table */}
          <div style={{ marginBottom: 48, paddingBottom: 48, borderBottom: `1px solid ${BORDER}` }}>
            <h2 style={{ margin: '0 0 24px', fontWeight: 500, fontSize: 20, letterSpacing: '-.01em' }}>Cookies we set</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${TEXT1}` }}>
                    {['Cookie name', 'Type', 'Duration', 'Purpose'].map(h => (
                      <th key={h} style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '.1em', textTransform: 'uppercase', color: TEXT3, textAlign: 'left', padding: '0 12px 12px 0', fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COOKIE_TABLE.map((c, i) => (
                    <tr key={c.name} style={{ borderBottom: `1px solid ${BORDER}`, background: i % 2 === 1 ? BG2 : '#fff' }}>
                      <td style={{ padding: '14px 12px 14px 0', fontFamily: MONO, fontSize: 11, color: TEXT1, verticalAlign: 'top', whiteSpace: 'nowrap' }}>{c.name}</td>
                      <td style={{ padding: '14px 12px 14px 0', verticalAlign: 'top' }}>
                        <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '.06em', textTransform: 'uppercase', color: '#fff', background: TYPE_COLORS[c.type], padding: '2px 7px' }}>{c.type}</span>
                      </td>
                      <td style={{ padding: '14px 12px 14px 0', fontFamily: MONO, fontSize: 11, color: TEXT3, verticalAlign: 'top', whiteSpace: 'nowrap' }}>{c.duration}</td>
                      <td style={{ padding: '14px 0 14px 0', color: TEXT2, lineHeight: 1.6, verticalAlign: 'top' }}>{c.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Managing cookies */}
          <div style={{ marginBottom: 48, paddingBottom: 48, borderBottom: `1px solid ${BORDER}` }}>
            <h2 style={{ margin: '0 0 16px', fontWeight: 500, fontSize: 20, letterSpacing: '-.01em' }}>Managing cookies</h2>
            <p style={{ margin: '0 0 14px', fontSize: 14.5, lineHeight: 1.75, color: TEXT2 }}>
              You can control cookies through your browser settings. Most browsers allow you to refuse cookies, delete existing cookies, or receive a warning before a cookie is stored. Disabling essential cookies will prevent you from using the Raven platform.
            </p>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.75, color: TEXT2 }}>
              For detailed guidance on managing cookies in your browser, visit <a href="https://allaboutcookies.org" target="_blank" rel="noopener noreferrer" style={{ color: TEXT1 }}>allaboutcookies.org</a>.
            </p>
          </div>

          {/* Contact */}
          <div>
            <h2 style={{ margin: '0 0 16px', fontWeight: 500, fontSize: 20, letterSpacing: '-.01em' }}>Contact</h2>
            <p style={{ margin: '0 0 14px', fontSize: 14.5, lineHeight: 1.75, color: TEXT2 }}>
              For questions about this policy: <a href="mailto:privacy@raven.app" style={{ color: TEXT1 }}>privacy@raven.app</a>
            </p>
            <div style={{ display: 'flex', gap: 10, marginTop: 24, flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/privacy')} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', background: 'none', color: TEXT3, border: `1px solid ${BORDER}`, cursor: 'pointer', padding: '8px 16px' }}>Privacy Policy →</button>
              <button onClick={() => navigate('/terms')} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', background: 'none', color: TEXT3, border: `1px solid ${BORDER}`, cursor: 'pointer', padding: '8px 16px' }}>Terms of Service →</button>
            </div>
          </div>

        </div>
      </section>
      <SiteFooter />
    </div>
  )
}
