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

const SECTIONS = [
  {
    id: 'who-we-are',
    title: '1. Who we are',
    content: `Raven Technologies Ltd ("Raven", "we", "us") is the data controller for personal data processed through the Raven intelligence platform and raven.app. We are registered in England and Wales (company number 14582317) with our registered office at 22 Bishopsgate, London, EC2N 4BQ.

If you have any questions about this policy or how we handle your data, contact our Data Protection Officer at privacy@raven.app.`,
  },
  {
    id: 'data-we-collect',
    title: '2. Data we collect',
    content: `We collect the following categories of personal data:

Account data: Your name, email address, job title, and organisation name when you register for a Raven account or are invited by a team administrator.

Usage data: Information about how you use the platform — features accessed, investigations created, enrichment transforms run, and session metadata. This data is pseudonymised and used to improve the product.

Technical data: IP address, browser type, operating system, and device identifiers. We collect the minimum required for security monitoring and abuse prevention.

Investigation data: Content you create within Raven — entity graphs, case notes, relationships, and enrichment results. This data belongs to you. We process it on your behalf as a data processor, not a controller.

Communications: If you contact us by email or through the contact form, we retain those communications to manage your enquiry.`,
  },
  {
    id: 'how-we-use-it',
    title: '3. How we use your data',
    content: `We process your personal data on the following legal bases:

Contract performance (Article 6(1)(b) UK GDPR): To provide you with the Raven platform and associated services — including account management, enrichment, and export functionality.

Legitimate interests (Article 6(1)(f) UK GDPR): To operate and improve the platform, detect and prevent fraud and abuse, and communicate product updates to existing customers. We have conducted a legitimate interest assessment for each of these purposes.

Legal obligation (Article 6(1)(c) UK GDPR): To comply with applicable legal and regulatory requirements, including financial crime, tax, and law enforcement disclosure obligations.

Consent (Article 6(1)(a) UK GDPR): For optional communications such as our intelligence insights newsletter. You may withdraw consent at any time.

We do not use your investigation data to train machine learning models or for any purpose other than delivering the Raven service.`,
  },
  {
    id: 'sharing',
    title: '4. Who we share data with',
    content: `We share personal data only where necessary:

Service providers: We use a small number of sub-processors to operate Raven — cloud infrastructure (AWS EU-West), email delivery (Resend), and error monitoring (Sentry). Each sub-processor is bound by a data processing agreement.

Law enforcement and regulators: We will disclose personal data to law enforcement, regulatory authorities, or courts where we are legally required to do so. We will notify you before disclosure where permitted by law.

Business transfers: In the event of a merger, acquisition, or sale of all or part of the business, personal data may be transferred as part of that transaction. We will notify affected users in advance.

We do not sell, rent, or trade personal data with third parties for marketing or commercial purposes.`,
  },
  {
    id: 'retention',
    title: '5. Data retention',
    content: `We retain personal data for as long as necessary for the purposes described in this policy:

Account data: Retained for the duration of your account plus 90 days after deletion to support account recovery. After that period, account data is permanently deleted.

Investigation data: Retained for as long as your account is active. On account deletion, investigation data is deleted within 30 days. Enterprise customers may specify custom retention periods in their data processing agreement.

Usage and technical data: Retained in pseudonymised form for up to 24 months for product analytics. Identifiable session data is retained for 90 days for security monitoring.

You may request deletion of your personal data at any time. We will action deletion requests within 30 days, subject to legal retention obligations.`,
  },
  {
    id: 'your-rights',
    title: '6. Your rights',
    content: `Under UK GDPR, you have the following rights in relation to your personal data:

Access: Request a copy of the personal data we hold about you.
Rectification: Request correction of inaccurate personal data.
Erasure: Request deletion of your personal data in certain circumstances.
Restriction: Request that we restrict processing of your personal data.
Portability: Receive your personal data in a structured, machine-readable format.
Objection: Object to processing based on legitimate interests.
Withdraw consent: Where processing is based on consent, withdraw that consent at any time.

To exercise any of these rights, contact us at privacy@raven.app. We will respond within 30 days. You also have the right to lodge a complaint with the Information Commissioner's Office (ICO) at ico.org.uk.`,
  },
  {
    id: 'security',
    title: '7. Security',
    content: `We implement appropriate technical and organisational measures to protect personal data against unauthorised access, disclosure, alteration, and destruction. These include TLS 1.3 encryption in transit, AES-256 encryption at rest, customer-managed encryption keys, role-based access controls, and annual CREST penetration testing.

Full details of our security controls are available in our Security documentation. Enterprise customers may request our ISO 27001 certificate and Cyber Essentials Plus certificate on request.`,
  },
  {
    id: 'international',
    title: '8. International transfers',
    content: `We process and store data within the United Kingdom and European Economic Area. Where we use sub-processors outside the UK/EEA, we ensure adequate safeguards are in place — including UK International Data Transfer Agreements (IDTAs) or the EU Standard Contractual Clauses where applicable.

Our primary infrastructure is hosted in AWS eu-west-2 (London) and eu-west-1 (Ireland).`,
  },
  {
    id: 'cookies',
    title: '9. Cookies',
    content: `We use a limited number of cookies to operate the platform. See our Cookie Policy for full details. We do not use tracking cookies or third-party advertising cookies. We use only essential session cookies and a single analytics cookie (Plausible Analytics, cookieless) to understand aggregate usage patterns.`,
  },
  {
    id: 'changes',
    title: '10. Changes to this policy',
    content: `We may update this policy from time to time. We will notify you of material changes by email or through the platform at least 14 days before they take effect. The date at the top of this page shows when it was last updated.`,
  },
  {
    id: 'contact',
    title: '11. Contact',
    content: `For privacy-related enquiries: privacy@raven.app

Data Protection Officer: dpo@raven.app

Post: Raven Technologies Ltd, 22 Bishopsgate, London, EC2N 4BQ

For complaints: You have the right to complain to the Information Commissioner's Office (ICO). Visit ico.org.uk or call 0303 123 1113.`,
  },
]

export function PrivacyPage() {
  const navigate = useNavigate()

  return (
    <div style={{ background: '#fff', color: TEXT1, fontFamily: SANS, WebkitFontSmoothing: 'antialiased', minHeight: '100vh' }}>
      <SiteHeader />

      {/* Hero */}
      <section style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(64px,9vw,112px) clamp(20px,4vw,48px) clamp(48px,6vw,72px)' }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: TEXT3, marginBottom: 20 }}>Legal</div>
          <h1 style={{ margin: '0 0 16px', fontWeight: 500, fontSize: 'clamp(32px,4.5vw,56px)', letterSpacing: '-.022em', lineHeight: 1.06 }}>Privacy Policy</h1>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: TEXT3 }}>Last updated: 1 June 2026</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: TEXT3 }}>Raven Technologies Ltd</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(20px,4vw,48px)' }}>
          <div className="mobile-single-col" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 'clamp(32px,5vw,72px)', alignItems: 'start' }}>

            {/* TOC */}
            <nav style={{ position: 'sticky', top: 80 }}>
              <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '.1em', textTransform: 'uppercase', color: TEXT3, marginBottom: 14 }}>Contents</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {SECTIONS.map(s => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    style={{ fontFamily: MONO, fontSize: 10.5, color: TEXT3, textDecoration: 'none', padding: '5px 0', borderLeft: '2px solid transparent', paddingLeft: 8, transition: 'color .12s, border-color .12s', lineHeight: 1.4 }}
                    onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.color = TEXT1; a.style.borderLeftColor = TEXT1 }}
                    onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.color = TEXT3; a.style.borderLeftColor = 'transparent' }}
                  >
                    {s.title}
                  </a>
                ))}
              </div>
            </nav>

            {/* Body */}
            <div>
              <div style={{ padding: '16px 20px', background: BG2, border: `1px solid ${BORDER}`, marginBottom: 48 }}>
                <p style={{ margin: 0, fontFamily: MONO, fontSize: 11.5, lineHeight: 1.7, color: TEXT2 }}>
                  This policy explains how Raven Technologies Ltd collects, uses, and protects your personal data when you use the Raven intelligence platform. It applies to users of raven.app and all associated services.
                </p>
              </div>

              {SECTIONS.map((s, i) => (
                <div key={s.id} id={s.id} style={{ marginBottom: 48, paddingTop: i > 0 ? 48 : 0, borderTop: i > 0 ? `1px solid ${BORDER}` : 'none' }}>
                  <h2 style={{ margin: '0 0 16px', fontWeight: 500, fontSize: 20, letterSpacing: '-.01em', lineHeight: 1.3 }}>{s.title}</h2>
                  {s.content.split('\n\n').map((para, j) => (
                    <p key={j} style={{ margin: '0 0 14px', fontSize: 14.5, lineHeight: 1.75, color: TEXT2, whiteSpace: 'pre-line' }}>{para}</p>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section style={{ background: '#0a0a0c', borderTop: '1px solid #1c1c22' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(20px,4vw,48px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500, color: '#f2f2f4', marginBottom: 6 }}>Questions about this policy?</div>
            <div style={{ fontFamily: MONO, fontSize: 12, color: '#9a9aa0' }}>Contact our Data Protection Officer at dpo@raven.app</div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/terms')} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', background: 'transparent', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer', padding: '9px 18px' }}>
              Terms of Service
            </button>
            <button onClick={() => navigate('/cookies')} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', background: 'transparent', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer', padding: '9px 18px' }}>
              Cookie Policy
            </button>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  )
}
