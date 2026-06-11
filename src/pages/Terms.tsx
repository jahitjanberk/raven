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
    id: 'acceptance',
    title: '1. Acceptance',
    content: `By creating a Raven account, accessing raven.app, or using any Raven service, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, do not use the service.

If you are using Raven on behalf of an organisation, you represent that you have authority to bind that organisation to these terms. In that case, "you" refers to your organisation.

These terms are governed by the laws of England and Wales. Any disputes will be subject to the exclusive jurisdiction of the courts of England and Wales.`,
  },
  {
    id: 'services',
    title: '2. The service',
    content: `Raven provides a graph-based link analysis platform for intelligence and fraud investigation. The service includes the web application at raven.app, associated APIs, OSINT enrichment functionality, and related documentation.

We reserve the right to modify, suspend, or discontinue any part of the service at any time with reasonable notice. We will not be liable for any modification, suspension, or discontinuation.

We provide service level commitments to Team and Enterprise customers under separate agreements. Free and Pro tier users acknowledge that the service is provided without uptime guarantees.`,
  },
  {
    id: 'account',
    title: '3. Accounts and access',
    content: `Raven accounts are issued by invitation. You are responsible for maintaining the confidentiality of your credentials and for all activity that occurs under your account. You must notify us immediately at security@raven.app of any unauthorised access.

You must be at least 18 years old to use Raven. You must not use the service if you are located in a jurisdiction subject to UK, US, or EU sanctions, or if you are on any sanctions list.

We reserve the right to suspend or terminate accounts that violate these terms, without notice where we reasonably believe there is a risk to other users or the platform.`,
  },
  {
    id: 'acceptable-use',
    title: '4. Acceptable use',
    content: `You may use Raven only for lawful investigative and intelligence analysis purposes. You must not:

— Use the platform to investigate individuals without a lawful basis for doing so
— Process personal data in a manner inconsistent with your organisation's data protection obligations
— Attempt to reverse engineer, decompile, or extract source code from the platform
— Use the service to transmit malicious code, conduct denial-of-service attacks, or interfere with other users
— Resell, sublicense, or make the service available to third parties without our written consent
— Use automated means to access or scrape the platform beyond what the API explicitly permits

Raven is used in law enforcement, intelligence, and financial crime contexts. You are responsible for ensuring your use of the platform complies with applicable law — including data protection law, human rights law, and any authorisation requirements applicable to your role.`,
  },
  {
    id: 'data',
    title: '5. Your data',
    content: `You own all investigation data, graphs, case notes, and content you create in Raven. You grant us a limited, non-exclusive licence to process that data solely to deliver the service.

We act as a data processor in relation to personal data you input into Raven. You are the data controller. Our data processing obligations are set out in the Data Processing Agreement, which forms part of these terms for Team and Enterprise customers.

On account termination, your investigation data is retained for 30 days to allow for export. After that period it is permanently deleted. We do not use your investigation data to train models or for any purpose beyond providing the service.`,
  },
  {
    id: 'ip',
    title: '6. Intellectual property',
    content: `Raven and all associated technology, documentation, marks, and content are the property of Raven Technologies Ltd or our licensors. These terms do not grant you any intellectual property rights in the platform.

Any feedback, suggestions, or improvements you provide may be used by us without obligation to you.`,
  },
  {
    id: 'liability',
    title: '7. Limitation of liability',
    content: `To the maximum extent permitted by applicable law:

We are not liable for indirect, incidental, special, consequential, or punitive damages — including loss of profits, data, or business — arising from your use of or inability to use Raven.

Our aggregate liability to you for any claim arising under these terms shall not exceed the greater of: (a) the amount you paid us in the 12 months preceding the claim, or (b) £100.

Nothing in these terms excludes or limits liability for death or personal injury caused by our negligence, fraud, or fraudulent misrepresentation, or any other liability that cannot be excluded by English law.`,
  },
  {
    id: 'confidentiality',
    title: '8. Confidentiality',
    content: `Each party agrees to keep confidential any non-public information disclosed by the other party in connection with the service, and to use such information only to perform obligations under these terms. This obligation does not apply to information that is publicly available, independently developed, or required to be disclosed by law.`,
  },
  {
    id: 'termination',
    title: '9. Termination',
    content: `You may cancel your account at any time through the account settings. We may terminate or suspend your access immediately if you breach these terms, without liability to you.

On termination, your right to use the service ends. Sections relating to ownership, liability, and governing law survive termination.`,
  },
  {
    id: 'changes',
    title: '10. Changes',
    content: `We may update these terms from time to time. We will give you at least 30 days' notice of material changes by email or through the platform. Continued use of the service after the effective date constitutes acceptance of the updated terms.`,
  },
  {
    id: 'contact',
    title: '11. Contact',
    content: `Legal enquiries: legal@raven.app

Raven Technologies Ltd
22 Bishopsgate
London, EC2N 4BQ
United Kingdom`,
  },
]

export function TermsPage() {
  const navigate = useNavigate()

  return (
    <div style={{ background: '#fff', color: TEXT1, fontFamily: SANS, WebkitFontSmoothing: 'antialiased', minHeight: '100vh' }}>
      <SiteHeader />

      <section style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(64px,9vw,112px) clamp(20px,4vw,48px) clamp(48px,6vw,72px)' }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: TEXT3, marginBottom: 20 }}>Legal</div>
          <h1 style={{ margin: '0 0 16px', fontWeight: 500, fontSize: 'clamp(32px,4.5vw,56px)', letterSpacing: '-.022em', lineHeight: 1.06 }}>Terms of Service</h1>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: TEXT3 }}>Last updated: 1 June 2026</span>
            <span style={{ fontFamily: MONO, fontSize: 11, color: TEXT3 }}>Raven Technologies Ltd</span>
          </div>
        </div>
      </section>

      <section>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(20px,4vw,48px)' }}>
          <div className="mobile-single-col" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 'clamp(32px,5vw,72px)', alignItems: 'start' }}>
            <nav style={{ position: 'sticky', top: 80 }}>
              <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '.1em', textTransform: 'uppercase', color: TEXT3, marginBottom: 14 }}>Contents</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {SECTIONS.map(s => (
                  <a key={s.id} href={`#${s.id}`} style={{ fontFamily: MONO, fontSize: 10.5, color: TEXT3, textDecoration: 'none', padding: '5px 0', borderLeft: '2px solid transparent', paddingLeft: 8, transition: 'color .12s, border-color .12s', lineHeight: 1.4 }}
                    onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.color = TEXT1; a.style.borderLeftColor = TEXT1 }}
                    onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.color = TEXT3; a.style.borderLeftColor = 'transparent' }}
                  >{s.title}</a>
                ))}
              </div>
            </nav>
            <div>
              <div style={{ padding: '16px 20px', background: BG2, border: `1px solid ${BORDER}`, marginBottom: 48 }}>
                <p style={{ margin: 0, fontFamily: MONO, fontSize: 11.5, lineHeight: 1.7, color: TEXT2 }}>
                  These terms govern your use of the Raven intelligence platform and all associated services provided by Raven Technologies Ltd. Please read them carefully before using the service.
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

      <section style={{ background: '#0a0a0c', borderTop: '1px solid #1c1c22' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(20px,4vw,48px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500, color: '#f2f2f4', marginBottom: 6 }}>Legal enquiries</div>
            <div style={{ fontFamily: MONO, fontSize: 12, color: '#9a9aa0' }}>legal@raven.app · Raven Technologies Ltd, 22 Bishopsgate, London EC2N 4BQ</div>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/privacy')} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', background: 'transparent', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer', padding: '9px 18px' }}>Privacy Policy</button>
            <button onClick={() => navigate('/cookies')} style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', background: 'transparent', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.18)', cursor: 'pointer', padding: '9px 18px' }}>Cookie Policy</button>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  )
}
