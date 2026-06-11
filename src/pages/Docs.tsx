import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { SiteFooter } from '../components/SiteFooter'

// ── Design tokens ─────────────────────────────────────────────────────────────
const BG      = '#fff'
const BG2     = '#f8f8fa'
const BORDER  = '#ececee'
const TEXT1   = '#0a0a0b'
const TEXT2   = '#3a3a3f'
const TEXT3   = '#9a9aa0'
const ACCENT  = '#2563eb'
const MONO    = "'IBM Plex Mono',ui-monospace,monospace"
const SANS    = "'Helvetica Neue',Helvetica,Arial,sans-serif"

// ── Content ───────────────────────────────────────────────────────────────────

const ENTITY_TYPES = [
  { type: 'ip',          color: '#60A5FA', label: 'IP Address',       desc: 'IPv4 or IPv6 address. Raven auto-detects v4/v6 for STIX patterns and enrichment routing.', examples: '185.220.101.5, 2001:db8::1', transforms: 'AbuseIPDB, Shodan, VirusTotal, Tor Exit Check, ASN Lookup' },
  { type: 'domain',      color: '#34D399', label: 'Domain',           desc: 'A registered domain or hostname. Does not include protocol or path — those go in URL nodes.', examples: 'nexuslink.io, mail.example.co.uk', transforms: 'WHOIS, DNS Resolve, Passive DNS, VirusTotal, Shodan' },
  { type: 'email',       color: '#FBBF24', label: 'Email Address',    desc: 'An email address used in the investigation — victim, suspect, or infrastructure.', examples: 'j.hassan@proton.me', transforms: 'HaveIBeenPwned, Email Header Parse, WHOIS (domain part)' },
  { type: 'url',         color: '#F97316', label: 'URL',              desc: 'A full URL including protocol and optional path. Use for phishing pages, payload hosts, or C2 endpoints.', examples: 'https://evil.io/payload?id=1', transforms: 'VirusTotal URL Scan, URLScan.io, Screenshot' },
  { type: 'hash',        color: '#C084FC', label: 'File Hash',        desc: 'MD5 (32 chars), SHA-1 (40), SHA-256 (64), or SHA-512 (128). Raven auto-detects algorithm for STIX.', examples: '3b4c... (SHA-256)', transforms: 'VirusTotal Hash Lookup, MalwareBazaar, NSRL Check' },
  { type: 'phone',       color: '#22D3EE', label: 'Phone Number',     desc: 'Any phone number in international or local format. Used in fraud, social engineering, and identity investigations.', examples: '+44 7700 900123', transforms: 'Carrier Lookup, NumVerify, Truecaller (where licensed)' },
  { type: 'person',      color: '#A78BFA', label: 'Person',           desc: 'A named individual — victim, suspect, or associate. Maps to STIX identity (individual).', examples: 'James T. Hassan', transforms: 'Social Media Search, PEP/Sanctions Check' },
  { type: 'org',         color: '#F87171', label: 'Organisation',     desc: 'A company, institution, or group. Maps to STIX identity (organization).', examples: 'Nexus Financial Ltd', transforms: 'Companies House, WHOIS Org, Sanctions List' },
  { type: 'wallet',      color: '#FCD34D', label: 'Crypto Wallet',    desc: 'A cryptocurrency wallet address. Raven detects BTC, ETH, LTC, XMR by address format.', examples: '3FZbgi29cpjq2GjdwV8eyHuJJnkLtktZc5', transforms: 'Blockchain Explorer, Chainalysis (licensed), Reactor' },
  { type: 'social',      color: '#FB7185', label: 'Social Profile',   desc: 'A social media handle or profile URL. Include platform prefix for clarity.', examples: 'twitter:@handle, t.me/channel', transforms: 'Profile Scrape, Follower Analysis' },
  { type: 'location',    color: '#86EFAC', label: 'Location',         desc: 'A physical place — country, city, or lat/lon coordinate. Maps to STIX location.', examples: 'Lagos, Nigeria · 51.5074,-0.1278', transforms: 'Reverse Geocode, IP → Location' },
  { type: 'cert',        color: '#67E8F9', label: 'TLS Certificate',  desc: 'An X.509 certificate identified by fingerprint, CN, or SAN. Maps to STIX infrastructure.', examples: 'SHA1: ab:cd:ef...', transforms: 'Censys Cert Search, crt.sh Lookup' },
  { type: 'transaction', color: '#FDE68A', label: 'Transaction',      desc: 'A financial transaction — bank transfer, card payment, or crypto tx. Link between wallets or accounts.', examples: 'TXN-2024-88821 · £4,200', transforms: 'Blockchain TX Lookup' },
  { type: 'takedown',    color: '#FCA5A5', label: 'Takedown',         desc: 'A takedown request or enforcement action targeting infrastructure in the graph.', examples: 'Abuse report to Cloudflare AS13335', transforms: 'Generate Abuse Report' },
  { type: 'fraudreport', color: '#D8B4FE', label: 'Fraud Report',     desc: 'A filed fraud report — Action Fraud, IC3, or internal case. Links victims to suspect entities.', examples: 'Action Fraud #NFRC240001234', transforms: 'NFIB Lookup (licensed)' },
]

const SHORTCUTS = [
  { group: 'Canvas',     key: 'Scroll',       action: 'Zoom in / out' },
  { group: 'Canvas',     key: 'Space + drag', action: 'Pan canvas' },
  { group: 'Canvas',     key: 'Cmd/Ctrl + A', action: 'Select all nodes' },
  { group: 'Canvas',     key: 'Escape',       action: 'Deselect / close panels' },
  { group: 'Canvas',     key: 'Delete / Backspace', action: 'Remove selected nodes' },
  { group: 'Canvas',     key: 'Shift + click', action: 'Multi-select nodes' },
  { group: 'History',    key: 'Cmd/Ctrl + Z', action: 'Undo' },
  { group: 'History',    key: 'Cmd/Ctrl + Shift + Z', action: 'Redo' },
  { group: 'Nodes',      key: 'Double-click node', action: 'Open entity panel' },
  { group: 'Nodes',      key: 'Click + drag',      action: 'Move node' },
  { group: 'Edges',      key: 'Click edge',   action: 'Open edge inspector / intel grading' },
  { group: 'Export',     key: 'Cmd/Ctrl + E', action: 'Open export / report modal' },
  { group: 'Search',     key: 'Cmd/Ctrl + F', action: 'Focus node search' },
]

// ── Section components ────────────────────────────────────────────────────────

function H2({ children }: { children: React.ReactNode }) {
  return <h2 style={{ fontSize: 26, fontWeight: 500, letterSpacing: '-.015em', margin: '0 0 20px', color: TEXT1 }}>{children}</h2>
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 style={{ fontSize: 16, fontWeight: 600, margin: '28px 0 10px', color: TEXT1 }}>{children}</h3>
}

function P({ children }: { children: React.ReactNode }) {
  return <p style={{ margin: '0 0 16px', fontSize: 14.5, lineHeight: 1.7, color: TEXT2 }}>{children}</p>
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ padding: '12px 16px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 4, marginBottom: 20 }}>
      <span style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.08em', color: ACCENT, textTransform: 'uppercase', marginRight: 8 }}>Note</span>
      <span style={{ fontSize: 13.5, color: '#1e40af', lineHeight: 1.6 }}>{children}</span>
    </div>
  )
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
      <div style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', background: TEXT1, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontSize: 11, fontWeight: 600, marginTop: 1 }}>
        {n}
      </div>
      <div>
        <div style={{ fontSize: 14.5, fontWeight: 600, color: TEXT1, marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 14, lineHeight: 1.65, color: TEXT2 }}>{children}</div>
      </div>
    </div>
  )
}

function Code({ children }: { children: React.ReactNode }) {
  return <code style={{ fontFamily: MONO, fontSize: 12, background: BG2, border: `1px solid ${BORDER}`, borderRadius: 3, padding: '1px 5px', color: TEXT1 }}>{children}</code>
}

// ── Doc sections ──────────────────────────────────────────────────────────────

function GettingStarted() {
  return (
    <div>
      <H2>Getting started</H2>
      <P>
        Raven is a graph-native workspace for building, enriching, and classifying entity networks for intelligence investigations.
        This guide walks you from a blank canvas to a classified, exportable investigation in under 10 minutes.
      </P>

      <H3>1. Create a project</H3>
      <P>From the Projects screen, click <strong>New investigation</strong>. Give it a case reference, select a classification marking, and choose a risk level. These values appear on every export.</P>
      <Note>Classification markings (OFFICIAL, OFFICIAL-SENSITIVE, SECRET) are for your records — Raven does not enforce access controls between users on a shared device.</Note>

      <Step n={1} title="Open a project">
        Click any project card to enter the graph canvas. A fresh project starts empty. Projects with seed data show a pre-built example network.
      </Step>
      <Step n={2} title="Add your first node">
        Click <strong>+ Add node</strong> in the toolbar (or press <Code>N</Code>). Select an entity type, enter the value, and optionally add a note. The node appears at the centre of the canvas.
      </Step>
      <Step n={3} title="Connect nodes">
        Hover a node until the connector ring appears, then drag to another node. A dialogue will prompt for an edge label — for example "associated with" or "owns".
      </Step>
      <Step n={4} title="Enrich a node">
        Click a node to open the <strong>Entity panel</strong>, then go to the <strong>Transforms</strong> tab. Click any transform to run it. Results appear as new nodes connected to the source.
      </Step>
      <Step n={5} title="Export your findings">
        Click the <strong>Report</strong> button (top-right) to export as PNG for dissemination or STIX 2.1 for tool-to-tool sharing.
      </Step>

      <H3>Auto-layout</H3>
      <P>
        Click the layout icon in the toolbar to access four algorithms:
      </P>
      <ul style={{ margin: '0 0 20px', paddingLeft: 22 }}>
        {[
          ['Force', 'Physics simulation — nodes repel each other, edges act as springs. Best for general-purpose graphs.'],
          ['Hierarchical', 'BFS from the highest-degree node. Best for showing chains of ownership or command.'],
          ['Radial', 'Concentric rings from a central node. Best for showing reach from a single entity.'],
          ['Cluster', 'Groups nodes by entity type. Best for spotting patterns across large graphs.'],
        ].map(([name, desc]) => (
          <li key={name} style={{ fontSize: 14, lineHeight: 1.65, color: TEXT2, marginBottom: 8 }}>
            <strong>{name}</strong> — {desc}
          </li>
        ))}
      </ul>

      <H3>Saving your work</H3>
      <P>
        Raven saves automatically on every change. You do not need to press a save button.
        Your graphs are stored locally in your browser — they survive refresh and browser restarts.
        Switching projects or logging out does not delete your data.
      </P>
    </div>
  )
}

function EntityReference() {
  return (
    <div>
      <H2>Entity type reference</H2>
      <P>
        Every node in Raven has a type that determines its colour, icon, available transforms, and STIX 2.1 object mapping.
        Choose the type that most accurately reflects the entity — it affects enrichment routing.
      </P>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: 24 }}>
        {ENTITY_TYPES.map(e => (
          <div key={e.type} style={{ border: `1px solid ${BORDER}`, borderRadius: 4, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: BG2 }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: e.color, flexShrink: 0, display: 'inline-block' }} />
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.06em', textTransform: 'uppercase', color: e.color, fontWeight: 600, minWidth: 110 }}>{e.type}</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: TEXT1 }}>{e.label}</span>
            </div>
            <div style={{ padding: '12px 18px 14px', borderTop: `1px solid ${BORDER}` }}>
              <p style={{ margin: '0 0 10px', fontSize: 13.5, lineHeight: 1.6, color: TEXT2 }}>{e.desc}</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                <div>
                  <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '.1em', textTransform: 'uppercase', color: TEXT3, display: 'block', marginBottom: 4 }}>Examples</span>
                  <span style={{ fontFamily: MONO, fontSize: 11.5, color: TEXT2 }}>{e.examples}</span>
                </div>
                <div>
                  <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '.1em', textTransform: 'uppercase', color: TEXT3, display: 'block', marginBottom: 4 }}>Transforms</span>
                  <span style={{ fontSize: 12.5, color: TEXT2 }}>{e.transforms}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function TransformGuide() {
  return (
    <div>
      <H2>Transform guide</H2>
      <P>
        Transforms are automated lookups that enrich a node with data from external sources.
        Running a transform adds new nodes to the graph, connected to the source by a labelled edge.
      </P>

      <H3>How transforms work</H3>
      <Step n={1} title="Select a node">Open the entity panel by clicking any node, then go to the Transforms tab.</Step>
      <Step n={2} title="Choose a transform">Each transform shows its source, what it returns, and whether it requires an API key. Greyed-out transforms are unavailable for this entity type.</Step>
      <Step n={3} title="Review results">New nodes appear connected to the source. Review each one — transforms return data, not conclusions. Apply risk flags and notes as appropriate.</Step>
      <Step n={4} title="Set up a watch">On Pro and above, click <strong>Watch this transform</strong> to run it automatically every 6h, 12h, 24h, 2d, or 1w. You'll receive an in-app alert if results change.</Step>

      <H3>API keys</H3>
      <P>
        Some transforms require a personal API key from the data provider. Keys are entered per-session in the transform panel and are never stored to disk or sent to Raven's servers — they're held in memory only and cleared on page refresh.
      </P>
      <Note>
        You need accounts with the relevant providers separately. Raven does not resell data — it provides the integration layer.
      </Note>

      <H3>Transform index</H3>
      <div style={{ marginTop: 16 }}>
        {[
          { name: 'AbuseIPDB',         types: ['ip'],                 key: true,  returns: 'Abuse confidence score, report count, ISP, country, usage type' },
          { name: 'Shodan',            types: ['ip', 'domain'],       key: true,  returns: 'Open ports, banners, CVEs, geolocation, ASN, hostnames' },
          { name: 'VirusTotal',        types: ['ip','domain','url','hash'], key: true, returns: 'Detection ratio, malicious vendors, community score' },
          { name: 'WHOIS',             types: ['domain'],             key: false, returns: 'Registrar, registrant org, creation / expiry dates, nameservers' },
          { name: 'Passive DNS',       types: ['domain','ip'],        key: false, returns: 'Historical A/AAAA/MX/NS records with first/last seen timestamps' },
          { name: 'ASN Lookup',        types: ['ip'],                 key: false, returns: 'ASN number, organisation, country, route prefix' },
          { name: 'Tor Exit Check',    types: ['ip'],                 key: false, returns: 'Whether the IP is a current or recent Tor exit node' },
          { name: 'URLScan.io',        types: ['url','domain'],       key: false, returns: 'Screenshot, DOM hash, linked domains, IP, TLS cert, verdict' },
          { name: 'HaveIBeenPwned',    types: ['email'],              key: true,  returns: 'Data breaches the address appears in, paste exposure' },
          { name: 'MalwareBazaar',     types: ['hash'],               key: false, returns: 'Malware family, tags, first seen, YARA hits, download URL' },
          { name: 'Blockchain Explorer', types: ['wallet'],           key: false, returns: 'Balance, tx count, first / last activity, linked addresses' },
          { name: 'DNS Resolve',       types: ['domain'],             key: false, returns: 'Current A, AAAA, MX, TXT, NS records' },
          { name: 'crt.sh Lookup',     types: ['domain','cert'],      key: false, returns: 'TLS certificates issued for the domain and subdomains' },
          { name: 'Companies House',   types: ['org'],                key: false, returns: 'Registered address, director names, filing history, SIC code' },
        ].map(t => (
          <div key={t.name} style={{ display: 'grid', gridTemplateColumns: '180px 140px 60px 1fr', gap: 12, padding: '12px 0', borderBottom: `1px solid ${BORDER}`, alignItems: 'start' }}>
            <div style={{ fontWeight: 600, fontSize: 13.5, color: TEXT1 }}>{t.name}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {t.types.map(ty => (
                <span key={ty} style={{ fontFamily: MONO, fontSize: 9.5, padding: '2px 6px', background: BG2, border: `1px solid ${BORDER}`, color: TEXT2 }}>{ty}</span>
              ))}
            </div>
            <div>
              {t.key
                ? <span style={{ fontFamily: MONO, fontSize: 9.5, color: '#b45309', background: '#fffbeb', border: '1px solid #fde68a', padding: '2px 6px' }}>Key needed</span>
                : <span style={{ fontFamily: MONO, fontSize: 9.5, color: '#166534', background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '2px 6px' }}>Free</span>
              }
            </div>
            <div style={{ fontSize: 12.5, color: TEXT3, lineHeight: 1.5 }}>{t.returns}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function KeyboardShortcuts() {
  let lastGroup = ''
  return (
    <div>
      <H2>Keyboard shortcuts</H2>
      <P>All shortcuts work while the graph canvas is focused. Modifier key is Cmd on macOS, Ctrl on Windows/Linux.</P>

      <div style={{ border: `1px solid ${BORDER}`, borderRadius: 4, overflow: 'hidden', marginTop: 24 }}>
        {SHORTCUTS.map((s, i) => {
          const showGroup = s.group !== lastGroup
          lastGroup = s.group
          return (
            <React.Fragment key={s.key + s.action}>
              {showGroup && (
                <div style={{ padding: '8px 18px', background: BG2, borderTop: i > 0 ? `1px solid ${BORDER}` : undefined, fontFamily: MONO, fontSize: 9.5, letterSpacing: '.12em', textTransform: 'uppercase', color: TEXT3 }}>
                  {s.group}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '11px 18px', borderTop: `1px solid ${BORDER}` }}>
                <span style={{ fontSize: 14, color: TEXT2 }}>{s.action}</span>
                <kbd style={{ fontFamily: MONO, fontSize: 11.5, background: BG2, border: `1px solid ${BORDER}`, borderRadius: 3, padding: '3px 10px', color: TEXT1, boxShadow: '0 1px 0 rgba(0,0,0,0.1)', whiteSpace: 'nowrap' }}>
                  {s.key}
                </kbd>
              </div>
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}

function FAQ() {
  const [open, setOpen] = useState<number | null>(null)
  const items = [
    {
      q: 'Where is my data stored?',
      a: 'All graph data is stored in your browser\'s localStorage. Nothing is sent to a server by default. On Pro and above, cloud sync is available. Enrichment transforms send only the specific entity value to the data provider — not your full graph.',
    },
    {
      q: 'Can I use Raven for classified investigations?',
      a: 'Raven supports classification markings up to SECRET in the UI. However, running on an unaccredited device or network for material above OFFICIAL is your organisation\'s call. Raven does not enforce security boundaries between users sharing a device.',
    },
    {
      q: 'What is NATO STANAG 2511 intel grading?',
      a: 'STANAG 2511 is the allied standard for grading intelligence reliability. Every edge in Raven can be graded on two dimensions: Source Reliability (A = completely reliable, D = not usually reliable) and Information Accuracy (1 = confirmed, 4 = doubtful). The combination (e.g. B2) is shown on the edge and exported in STIX bundles.',
    },
    {
      q: 'How does STIX 2.1 export work?',
      a: 'Raven maps each entity type to a STIX SDO (indicator, identity, location, course-of-action, etc.) and each edge to a STIX relationship SRO. The bundle includes a report object listing all objects. Intel grades are stored in a custom x_raven_intel_grade extension. The resulting file is compatible with MISP, OpenCTI, Maltego, and any TAXII 2.1 feed.',
    },
    {
      q: 'What happens to my watch lists when I close the tab?',
      a: 'Watch entries are persisted to localStorage and survive refresh. However, the scheduler only runs while the tab is open — watches do not fire in the background. When you reopen Raven, overdue watches run on the next check cycle (every 5 minutes).',
    },
    {
      q: 'Can I import an existing graph?',
      a: 'Yes. Use File → Import from the Projects screen to load a Raven JSON file. STIX 2.1 import is on the roadmap for a future release.',
    },
    {
      q: 'How do case templates work?',
      a: 'Templates pre-populate the graph with typed placeholder nodes and suggested edges for common investigation patterns (APP fraud, phishing, romance fraud, BEC, infrastructure recon). Placeholder values like [VICTIM EMAIL] are meant to be replaced with real data. Loading a template into a non-empty canvas adds nodes alongside existing ones — nothing is deleted.',
    },
    {
      q: 'Is there a mobile version?',
      a: 'The canvas is not designed for touchscreen use. Raven is optimised for desktop browsers (Chrome, Firefox, Safari, Edge). A read-only mobile view is on the roadmap.',
    },
  ]

  return (
    <div>
      <H2>Frequently asked questions</H2>
      <P>Can't find the answer here? Email <a href="mailto:support@raven.io" style={{ color: ACCENT }}>support@raven.io</a></P>

      <div style={{ marginTop: 24 }}>
        {items.map((item, i) => (
          <div key={i} style={{ borderTop: `1px solid ${BORDER}` }}>
            <button
              onClick={() => setOpen(open === i ? null : i)}
              style={{
                width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '18px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 16,
              }}
            >
              <span style={{ fontSize: 15, fontWeight: 500, color: TEXT1 }}>{item.q}</span>
              <span style={{ color: TEXT3, fontSize: 18, flexShrink: 0, transform: open === i ? 'rotate(45deg)' : 'none', transition: 'transform .15s' }}>+</span>
            </button>
            {open === i && (
              <div style={{ paddingBottom: 20 }}>
                <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: TEXT2 }}>{item.a}</p>
              </div>
            )}
          </div>
        ))}
        <div style={{ borderTop: `1px solid ${BORDER}` }} />
      </div>
    </div>
  )
}

// ── Sidebar nav ───────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'getting-started', label: 'Getting started' },
  { id: 'entity-reference', label: 'Entity types' },
  { id: 'transforms',       label: 'Transforms' },
  { id: 'shortcuts',        label: 'Keyboard shortcuts' },
  { id: 'faq',              label: 'FAQ' },
]

// ── Main component ────────────────────────────────────────────────────────────

export function DocsPage() {
  const navigate = useNavigate()
  const location = useLocation()

  const currentSection = (() => {
    const hash = location.hash.replace('#', '')
    return SECTIONS.find(s => s.id === hash)?.id ?? 'getting-started'
  })()

  const setSection = (id: string) => {
    navigate(`/docs#${id}`, { replace: true })
    window.scrollTo({ top: 0 })
  }

  const content: Record<string, React.ReactNode> = {
    'getting-started': <GettingStarted />,
    'entity-reference': <EntityReference />,
    'transforms':       <TransformGuide />,
    'shortcuts':        <KeyboardShortcuts />,
    'faq':              <FAQ />,
  }

  return (
    <div style={{ minHeight: '100vh', background: BG, fontFamily: SANS, WebkitFontSmoothing: 'antialiased' }}>

      <SiteHeader active="/docs" />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(16px,3vw,40px)', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 56, paddingTop: 48, paddingBottom: 96 }}>

        {/* ── Sidebar ── */}
        <aside style={{ position: 'sticky', top: 72, height: 'fit-content' }}>
          <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '.12em', textTransform: 'uppercase', color: TEXT3, marginBottom: 12 }}>
            Contents
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {SECTIONS.map(s => {
              const active = s.id === currentSection
              return (
                <button
                  key={s.id}
                  onClick={() => setSection(s.id)}
                  style={{
                    textAlign: 'left', padding: '8px 12px',
                    background: active ? BG2 : 'transparent',
                    border: 'none', borderLeft: `2px solid ${active ? TEXT1 : 'transparent'}`,
                    fontSize: 13.5, color: active ? TEXT1 : TEXT2,
                    fontWeight: active ? 600 : 400,
                    cursor: 'pointer', transition: 'all .1s',
                    borderRadius: '0 3px 3px 0',
                  }}
                >
                  {s.label}
                </button>
              )
            })}
          </nav>

          <div style={{ marginTop: 32, paddingTop: 24, borderTop: `1px solid ${BORDER}` }}>
            <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '.12em', textTransform: 'uppercase', color: TEXT3, marginBottom: 10 }}>
              Support
            </div>
            <a href="mailto:support@raven.io" style={{ display: 'block', fontSize: 13, color: ACCENT, textDecoration: 'none', marginBottom: 6 }}>
              support@raven.io
            </a>
            <button onClick={() => navigate('/pricing')} style={{ display: 'block', fontSize: 13, color: TEXT2, background: 'none', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
              View pricing →
            </button>
          </div>
        </aside>

        {/* ── Content ── */}
        <main style={{ minWidth: 0 }}>
          {content[currentSection] ?? <GettingStarted />}
        </main>
      </div>
      <SiteFooter />
    </div>
  )
}
