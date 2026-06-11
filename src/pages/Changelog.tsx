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

type ChangeType = 'New' | 'Improved' | 'Fixed' | 'Security'

const TYPE_COLORS: Record<ChangeType, { bg: string; color: string }> = {
  New:      { bg: '#0a0a0b', color: '#fff' },
  Improved: { bg: '#2563eb', color: '#fff' },
  Fixed:    { bg: '#059669', color: '#fff' },
  Security: { bg: '#dc2626', color: '#fff' },
}

interface Change {
  type: ChangeType
  text: string
}

interface Release {
  version: string
  date: string
  headline: string
  summary: string
  changes: Change[]
}

const RELEASES: Release[] = [
  {
    version: '1.4.0',
    date: '4 June 2026',
    headline: 'STIX 2.1 export and cross-entity enrichment',
    summary: 'Major release adding full STIX 2.1 bundle export, batch enrichment across all entities in a graph, and improved link provenance — including the ability to attach multiple source references to a single link.',
    changes: [
      { type: 'New',      text: 'STIX 2.1 export — any graph can now be exported as a structured STIX bundle with all entity types, relationships, intelligence grades, and analyst notes preserved.' },
      { type: 'New',      text: 'Batch enrichment — run a selected transform across all entities of a matching type in a graph in a single action. Results are queued and surface inline with a status indicator.' },
      { type: 'New',      text: 'Multi-source links — each relationship can now carry up to 10 source references. Add bank statement, company registry, and witness account references to the same link.' },
      { type: 'Improved', text: 'Classification export — PNG export now embeds case reference, classification level, and export timestamp in the image metadata as well as the visible overlay.' },
      { type: 'Improved', text: 'Entity search — graph-level entity search now supports partial matching on all string fields, not just the entity name.' },
      { type: 'Fixed',    text: 'Graph edge labels were not updated when the source or target entity was renamed. Now fixed — label text updates immediately on rename.' },
      { type: 'Security', text: 'Audit log events for STIX export now include the bundle hash to support integrity verification at the receiving end.' },
    ],
  },
  {
    version: '1.3.2',
    date: '14 May 2026',
    headline: 'Performance and enrichment stability',
    summary: 'Patch release addressing graph rendering performance on large entity sets and intermittent timeout errors from the IPinfo and URLscan transforms.',
    changes: [
      { type: 'Improved', text: 'Graph canvas rendering — entity render time reduced by 60% on graphs with >200 entities, using virtualization for off-viewport nodes.' },
      { type: 'Fixed',    text: 'IPinfo geolocation transform was timing out on high-concurrency enrichment batches. Retry logic and connection pool tuning applied.' },
      { type: 'Fixed',    text: 'URLscan.io transform occasionally returned a 200 with an empty result set, causing a graph node to be created with no data attached. Now handled correctly — empty results produce no node.' },
      { type: 'Fixed',    text: 'Team members with Viewer permissions could see enrichment result detail that should have been restricted to Analyst role and above. Now fixed.' },
    ],
  },
  {
    version: '1.3.0',
    date: '28 April 2026',
    headline: 'Team workspaces and shared investigations',
    summary: 'Introduces team workspaces allowing multiple analysts to collaborate on the same investigation. Includes access controls, activity feed, and shared annotation.',
    changes: [
      { type: 'New',      text: 'Team workspaces — create a shared workspace where multiple analysts can view and contribute to the same graph. Changes are synced in near-real-time.' },
      { type: 'New',      text: 'Analyst roles and permissions — three role levels: Admin, Analyst, and Viewer. Admins manage membership; Viewers can read and export but cannot add entities or enrich.' },
      { type: 'New',      text: 'Activity feed — per-investigation changelog showing which analyst added which entity, ran which enrichment, and applied which annotation, with timestamps.' },
      { type: 'New',      text: 'Shared case notes — analysts can add case-level notes visible to all team members, separate from entity-level annotation.' },
      { type: 'Improved', text: 'Invite flow redesigned — team admins can now invite by email and assign a role before the invite is accepted. Invites expire after 7 days.' },
      { type: 'Security', text: 'All workspace events are logged to the organisation-level audit trail. Logs are immutable and cannot be deleted by workspace members.' },
    ],
  },
  {
    version: '1.2.1',
    date: '10 April 2026',
    headline: 'Admiralty grading and HaveIBeenPwned transform',
    summary: 'Adds the Admiralty source and information grading system to all entity links, and introduces the HaveIBeenPwned email compromise check transform.',
    changes: [
      { type: 'New',      text: 'Admiralty grading — every link can now carry a source reliability grade (A–F) and an information credibility grade (1–6), following the Admiralty system as used in UK law enforcement intelligence.' },
      { type: 'New',      text: 'NATO STANAG 2511 grading — alternative grading scheme available for defence and intelligence community users. Toggle per-organisation in settings.' },
      { type: 'New',      text: 'HaveIBeenPwned transform — check email addresses against known breach databases. Returns breach names, dates, and compromised data categories. Enterprise licence required for volume use.' },
      { type: 'Improved', text: 'Enrichment result cards now show the source API name, query timestamp, and data version alongside results.' },
      { type: 'Fixed',    text: 'crt.sh certificate transparency transform was occasionally returning duplicate domain entries when a certificate covered multiple SANs. Deduplication now applied at parse time.' },
    ],
  },
  {
    version: '1.2.0',
    date: '25 March 2026',
    headline: 'OSINT transform library and Shodan integration',
    summary: 'First release of the Raven OSINT enrichment library, including Shodan, IPinfo, crt.sh, and URLscan.io. Transforms are accessible from any entity node via right-click context menu.',
    changes: [
      { type: 'New',      text: 'Shodan IP lookup — retrieve open ports, services, banners, CVEs, and geographic information for any IPv4 address.' },
      { type: 'New',      text: 'IPinfo geolocation — IP geolocation, ASN, and carrier data for any IPv4 or IPv6 address.' },
      { type: 'New',      text: 'crt.sh certificate transparency — enumerate subdomains and certificate history for any registered domain.' },
      { type: 'New',      text: 'URLscan.io — submit URLs for safe analysis. Returns screenshot, DOM content, network requests, and linked indicators.' },
      { type: 'New',      text: 'WHOIS lookup — retrieve registrar, registrant, and date information for any domain.' },
      { type: 'Improved', text: 'Entity context menu redesigned with transform categories, keyboard shortcut hints, and a recently-used section.' },
      { type: 'Security', text: 'All enrichment requests are proxied through Raven infrastructure. Your IP address and investigation context are never exposed to third-party enrichment providers.' },
    ],
  },
  {
    version: '1.1.0',
    date: '5 March 2026',
    headline: 'Graph canvas launch and entity types',
    summary: 'First public release of the Raven graph canvas with support for 17 entity types, manual link creation, classification marking, and PNG export.',
    changes: [
      { type: 'New',      text: 'Graph canvas — visual entity relationship graph with pan, zoom, and grouping. Supports graphs with up to 500 entities without performance degradation.' },
      { type: 'New',      text: '17 entity types — Person, Organisation, Address, Phone, Email, Domain, IP Address, URL, Financial Account, Vehicle, Vessel, Aircraft, Cryptocurrency Address, Document, Event, Location, and Custom.' },
      { type: 'New',      text: 'Manual link creation — drag from any entity to another to create a directed relationship. Set type, direction, and annotation.' },
      { type: 'New',      text: 'Classification marking — set a classification level on any investigation. Level is displayed in the canvas chrome and embedded in all exports.' },
      { type: 'New',      text: 'PNG export — export the visible canvas as a PNG file with case reference, classification, and timestamp overlay.' },
    ],
  },
]

function TypeBadge({ type }: { type: ChangeType }) {
  const { bg, color } = TYPE_COLORS[type]
  return (
    <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', background: bg, color, padding: '2px 7px', flexShrink: 0 }}>{type}</span>
  )
}

export function ChangelogPage() {
  const navigate = useNavigate()
  const [expanded, setExpanded] = useState<Record<string, boolean>>({ [RELEASES[0].version]: true })

  const toggle = (v: string) => setExpanded(prev => ({ ...prev, [v]: !prev[v] }))

  return (
    <div style={{ background: '#fff', color: TEXT1, fontFamily: SANS, WebkitFontSmoothing: 'antialiased', minHeight: '100vh' }}>
      <SiteHeader />

      {/* Hero */}
      <section style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(64px,9vw,112px) clamp(20px,4vw,48px) clamp(40px,5vw,64px)' }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: TEXT3, marginBottom: 20 }}>Changelog</div>
          <h1 style={{ margin: '0 0 16px', fontWeight: 500, fontSize: 'clamp(32px,4.5vw,56px)', letterSpacing: '-.022em', lineHeight: 1.06 }}>What's new in Raven</h1>
          <p style={{ margin: '0 0 28px', fontSize: 'clamp(15px,1.4vw,18px)', lineHeight: 1.65, color: TEXT2, maxWidth: 520 }}>
            Every release, documented. Follow this page to track new features, improvements, and security updates.
          </p>
          <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {Object.entries(TYPE_COLORS).map(([type, { bg, color }]) => (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', background: bg, color, padding: '2px 7px' }}>{type}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Releases */}
      <section>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(20px,4vw,48px)' }}>
          <div className="mobile-single-col" style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 'clamp(32px,5vw,72px)', alignItems: 'start' }}>

            {/* Version nav */}
            <nav style={{ position: 'sticky', top: 80 }}>
              <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '.1em', textTransform: 'uppercase', color: TEXT3, marginBottom: 14 }}>Versions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {RELEASES.map(r => (
                  <a key={r.version} href={`#v${r.version}`} style={{ fontFamily: MONO, fontSize: 11, color: TEXT3, textDecoration: 'none', padding: '5px 0 5px 8px', borderLeft: '2px solid transparent', transition: 'color .12s, border-color .12s' }}
                    onMouseEnter={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.color = TEXT1; a.style.borderLeftColor = TEXT1 }}
                    onMouseLeave={e => { const a = e.currentTarget as HTMLAnchorElement; a.style.color = TEXT3; a.style.borderLeftColor = 'transparent' }}
                  >
                    {r.version}
                    <div style={{ fontSize: 9.5, color: TEXT3, marginTop: 1 }}>{r.date}</div>
                  </a>
                ))}
              </div>
            </nav>

            {/* Release list */}
            <div>
              {RELEASES.map((r, i) => (
                <div key={r.version} id={`v${r.version}`} style={{ borderBottom: `1px solid ${BORDER}`, paddingBottom: 40, marginBottom: 40 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
                        <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: TEXT1 }}>v{r.version}</span>
                        {i === 0 && (
                          <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '.1em', textTransform: 'uppercase', background: '#2563eb', color: '#fff', padding: '2px 8px' }}>Latest</span>
                        )}
                        <span style={{ fontFamily: MONO, fontSize: 10.5, color: TEXT3 }}>{r.date}</span>
                      </div>
                      <h2 style={{ margin: '0 0 10px', fontWeight: 500, fontSize: 'clamp(18px,1.8vw,22px)', letterSpacing: '-.012em', lineHeight: 1.25 }}>{r.headline}</h2>
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: TEXT2, maxWidth: 600 }}>{r.summary}</p>
                    </div>
                    <button
                      onClick={() => toggle(r.version)}
                      style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '.1em', textTransform: 'uppercase', background: 'none', color: TEXT3, border: `1px solid ${BORDER}`, cursor: 'pointer', padding: '8px 14px', flexShrink: 0, marginTop: 4 }}
                    >
                      {expanded[r.version] ? 'Collapse' : 'Show all'}
                    </button>
                  </div>

                  {expanded[r.version] && (
                    <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
                      {r.changes.map((c, j) => (
                        <div key={j} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                          <TypeBadge type={c.type} />
                          <span style={{ fontSize: 13.5, lineHeight: 1.65, color: TEXT2 }}>{c.text}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: '#0a0a0c', borderTop: '1px solid #1c1c22' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(20px,4vw,48px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 500, color: '#f2f2f4', marginBottom: 6 }}>See it in action</div>
            <div style={{ fontFamily: MONO, fontSize: 12, color: '#9a9aa0' }}>Request access to the current build — available to verified teams</div>
          </div>
          <button
            onClick={() => navigate('/request-access')}
            style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', background: '#fff', color: '#0a0a0b', border: 'none', cursor: 'pointer', padding: '13px 26px', flexShrink: 0 }}
          >
            Request Access
          </button>
        </div>
      </section>
      <SiteFooter />
    </div>
  )
}
