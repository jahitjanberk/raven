import React from 'react'
import { useNavigate } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { SiteFooter } from '../components/SiteFooter'

// ── Design tokens ─────────────────────────────────────────────────────────────
const BG     = '#fff'
const BG2    = '#f8f8fa'
const BG_INK = '#0a0a0c'
const BORDER = '#ececee'
const TEXT1  = '#0a0a0b'
const TEXT2  = '#3a3a3f'
const TEXT3  = '#9a9aa0'
const MONO   = "'IBM Plex Mono',ui-monospace,monospace"
const SANS   = "'Helvetica Neue',Helvetica,Arial,sans-serif"


// ── Divider ───────────────────────────────────────────────────────────────────

function Divider() {
  return <div style={{ borderTop: `1px solid ${BORDER}`, margin: '0' }} />
}

// ── Section wrapper ───────────────────────────────────────────────────────────

function Section({ children, dark }: { children: React.ReactNode; dark?: boolean }) {
  return (
    <section style={{ background: dark ? BG_INK : BG, color: dark ? '#fff' : TEXT1, borderTop: `1px solid ${dark ? '#1c1c22' : BORDER}` }}>
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(64px,8vw,112px) clamp(20px,4vw,48px)' }}>
        {children}
      </div>
    </section>
  )
}

// ── Team member ───────────────────────────────────────────────────────────────

function TeamMember({ initials, name, role, bio }: { initials: string; name: string; role: string; bio: string }) {
  return (
    <div>
      <div style={{
        width: 48, height: 48, borderRadius: '50%',
        background: BG2, border: `1px solid ${BORDER}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: MONO, fontSize: 13, color: TEXT2, fontWeight: 600,
        marginBottom: 14,
      }}>
        {initials}
      </div>
      <div style={{ fontSize: 15, fontWeight: 600, color: TEXT1, marginBottom: 2 }}>{name}</div>
      <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.08em', textTransform: 'uppercase', color: TEXT3, marginBottom: 12 }}>{role}</div>
      <p style={{ margin: 0, fontSize: 13.5, color: TEXT2, lineHeight: 1.65 }}>{bio}</p>
    </div>
  )
}

// ── Timeline entry ────────────────────────────────────────────────────────────

function TimelineEntry({ date, event, detail }: { date: string; event: string; detail: string }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 24, paddingBottom: 28, borderBottom: `1px solid #1c1c22`, marginBottom: 28 }}>
      <div style={{ fontFamily: MONO, fontSize: 11, color: '#6f6f78', paddingTop: 3 }}>{date}</div>
      <div>
        <div style={{ fontSize: 15, fontWeight: 500, color: '#f2f2f4', marginBottom: 4 }}>{event}</div>
        <div style={{ fontSize: 13, color: '#83838c', lineHeight: 1.55 }}>{detail}</div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function AboutPage() {
  const navigate = useNavigate()

  return (
    <div style={{ fontFamily: SANS, WebkitFontSmoothing: 'antialiased' }}>
      <SiteHeader active="/about" />

      {/* ── Hero ── */}
      <section style={{ background: BG, borderTop: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(72px,10vw,128px) clamp(20px,4vw,48px) clamp(56px,7vw,96px)' }}>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.16em', textTransform: 'uppercase', color: TEXT3, marginBottom: 22 }}>
            About Raven
          </div>
          <h1 style={{ fontWeight: 500, fontSize: 'clamp(34px,5.5vw,72px)', letterSpacing: '-.025em', lineHeight: 1.04, margin: '0 0 28px', maxWidth: '20ch', color: TEXT1 }}>
            Built for the people who can't afford to be wrong
          </h1>
          <p style={{ fontSize: 'clamp(16px,1.6vw,20px)', color: TEXT2, lineHeight: 1.65, maxWidth: '46ch', margin: 0 }}>
            Intelligence analysts, fraud investigators, and security teams work in high-stakes environments where a missed connection or a misclassified entity has real consequences. Raven exists to give them the tooling that matches the weight of that work.
          </p>
        </div>
      </section>

      {/* ── Problem ── */}
      <Section>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(40px,6vw,96px)', alignItems: 'start' }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: TEXT3, marginBottom: 18 }}>
              The problem
            </div>
            <h2 style={{ fontWeight: 500, fontSize: 'clamp(24px,2.8vw,38px)', letterSpacing: '-.015em', lineHeight: 1.15, margin: '0 0 24px', color: TEXT1 }}>
              Intelligence work was still being done in spreadsheets
            </h2>
            <p style={{ fontSize: 15, color: TEXT2, lineHeight: 1.7, margin: '0 0 20px' }}>
              When we started Raven, analysts at financial intelligence units, fraud teams, and policing agencies were managing complex entity networks in Excel, Maltego (expensive, hard to share), or hand-drawn diagrams photographed on phones.
            </p>
            <p style={{ fontSize: 15, color: TEXT2, lineHeight: 1.7, margin: 0 }}>
              The problem wasn't skill or effort — it was tooling. Graph-native analysis was locked behind enterprise price tags, complex deployment requirements, and UX designed for a different era. The work suffered for it.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              { stat: '£1.2B',  label: 'Lost to APP fraud in the UK in 2023 alone',  src: 'UK Finance' },
              { stat: '6.7%',   label: 'Of global GDP is estimated to flow through illicit networks', src: 'FATF / IMF' },
              { stat: '72 hrs', label: 'Average time to build a complete entity picture without specialist tooling', src: 'Internal research' },
              { stat: '3×',     label: 'More connections found per investigation when using graph analysis', src: 'Internal research' },
            ].map(({ stat, label, src }) => (
              <div key={stat} style={{ padding: '18px 20px', background: BG2, border: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-.02em', color: TEXT1, marginBottom: 4 }}>{stat}</div>
                <div style={{ fontSize: 13.5, color: TEXT2, marginBottom: 6, lineHeight: 1.45 }}>{label}</div>
                <div style={{ fontFamily: MONO, fontSize: 10, color: TEXT3 }}>Source: {src}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── Mission ── */}
      <Section dark>
        <div style={{ maxWidth: 720 }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: '#6f6f78', marginBottom: 22 }}>
            Our mission
          </div>
          <p style={{ fontSize: 'clamp(22px,2.8vw,36px)', fontWeight: 500, lineHeight: 1.25, letterSpacing: '-.012em', color: '#f2f2f4', margin: '0 0 28px' }}>
            Make professional-grade intelligence analysis available to every team that needs it — not just those with seven-figure software budgets.
          </p>
          <p style={{ fontSize: 16, color: '#9a9aa0', lineHeight: 1.7, margin: 0 }}>
            That means a graph canvas that works the way analysts think, enrichment that runs with one click, classification markings baked in from day one, and export formats that speak the language of every receiving system — STIX 2.1, MISP, OpenCTI, TAXII.
          </p>
        </div>
      </Section>

      {/* ── Why Raven ── */}
      <Section>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'clamp(40px,6vw,96px)', alignItems: 'start' }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: TEXT3, marginBottom: 18 }}>
              Why Raven?
            </div>
            <h2 style={{ fontWeight: 500, fontSize: 'clamp(24px,2.8vw,38px)', letterSpacing: '-.015em', lineHeight: 1.15, margin: '0 0 24px', color: TEXT1 }}>
              Named for one of the most intelligent animals on earth
            </h2>
            <p style={{ fontSize: 15, color: TEXT2, lineHeight: 1.7, margin: '0 0 20px' }}>
              Ravens are among the very few non-human animals known to reason about the future, use tools, and form long-term social strategies. What sets them apart isn't brute strength — it's pattern recognition. A raven observes, remembers, connects, and acts with a precision that consistently outsmarts animals many times its size.
            </p>
            <p style={{ fontSize: 15, color: TEXT2, lineHeight: 1.7, margin: '0 0 20px' }}>
              That's the work of an intelligence analyst. Not the loudest voice in the room, but the one who sees the thread running through an apparently unconnected set of events — the dormant account reactivated two days before a fraud spike, the shared IP address buried in a thousand rows, the corporate structure that exists only to obscure a beneficial owner.
            </p>
            <p style={{ fontSize: 15, color: TEXT2, lineHeight: 1.7, margin: 0 }}>
              We named the platform after the bird because the best investigators share the raven's defining trait: the ability to hold a complex picture in mind, find the pattern inside the noise, and act on what they've found before anyone else has even noticed something's wrong.
            </p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {[
              {
                trait: 'Pattern recognition',
                detail: 'Ravens can recognise individual human faces and remember them years later — distinguishing friend from threat across time and context. Fraud investigators do the same with entities, accounts, and networks.',
              },
              {
                trait: 'Associative memory',
                detail: 'Ravens recall where they hid food and who was watching when they hid it. The platform mirrors this: every entity, connection, and inference is stored and queryable — nothing is forgotten.',
              },
              {
                trait: 'Theory of mind',
                detail: "Ravens can model what other birds know and will do — anticipating behaviour before it happens. That's the goal of link analysis: not just mapping what has occurred, but surfacing what's likely to follow.",
              },
              {
                trait: 'Collaborative intelligence',
                detail: 'Ravens hunt in coordinated groups, sharing information across the flock. Raven\'s shared workspaces, classified exports, and STIX bundles are built on the same principle: intelligence should travel.',
              },
            ].map(({ trait, detail }) => (
              <div key={trait} style={{ padding: '18px 20px', background: BG2, border: `1px solid ${BORDER}` }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: TEXT1, marginBottom: 6, letterSpacing: '-.01em' }}>{trait}</div>
                <div style={{ fontSize: 13, color: TEXT2, lineHeight: 1.6 }}>{detail}</div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* ── What makes Raven different ── */}
      <Section>
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: TEXT3, marginBottom: 32 }}>
          What makes Raven different
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2 }}>
          {[
            {
              n: '01',
              title: 'Graph-native from day one',
              body: 'Raven was designed around the graph, not the spreadsheet. Every feature — enrichment, classification, export — is designed to work with a network of entities, not a list of rows.',
            },
            {
              n: '02',
              title: 'Standards-compliant by default',
              body: 'STIX 2.1 export, NATO STANAG 2511 grading, and UK Government classification markings are built in. You don\'t need to retrofit standards onto output — they\'re encoded in the data model.',
            },
            {
              n: '03',
              title: 'Private by design',
              body: 'Enrichment transforms send only the specific entity value to the provider — not your graph, not your case notes, not your analyst profile. On Free, nothing leaves your browser.',
            },
            {
              n: '04',
              title: 'Priced for real teams',
              body: 'At £49/mo per analyst, Pro is an order of magnitude cheaper than legacy tools. We don\'t charge by API call or node count at the Pro tier. Unlimited means unlimited.',
            },
            {
              n: '05',
              title: 'Built for dissemination',
              body: 'Every investigation can be exported as a classified PNG for briefings, a STIX 2.1 bundle for TAXII feeds, or a Raven JSON for team handoff. The output is the point.',
            },
            {
              n: '06',
              title: 'Honest about what it isn\'t',
              body: 'Raven is not a case management system, a SIEM, or a data warehouse. It\'s the graph layer — the place where you build and interrogate the entity picture before you write the report.',
            },
          ].map(card => (
            <div key={card.n} style={{ padding: '24px 22px', background: BG2, border: `1px solid ${BORDER}` }}>
              <div style={{ fontFamily: MONO, fontSize: 10, color: TEXT3, marginBottom: 14 }}>{card.n}</div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: TEXT1, margin: '0 0 10px', letterSpacing: '-.01em' }}>{card.title}</h3>
              <p style={{ margin: 0, fontSize: 13.5, color: TEXT2, lineHeight: 1.65 }}>{card.body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Team ── */}
      <Section>
        <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.12em', textTransform: 'uppercase', color: TEXT3, marginBottom: 32 }}>
          The team
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 32 }}>
          <TeamMember
            initials="AK"
            name="Amir Khalil"
            role="CEO & Co-founder"
            bio="Former fraud intelligence lead at a UK tier-1 bank. Built the first version of Raven to replace an Excel workflow that was costing his team two days per investigation."
          />
          <TeamMember
            initials="SR"
            name="Saoirse Regan"
            role="CTO & Co-founder"
            bio="Previously staff engineer at a defence contractor, where she led the graph data platform for national-level threat intelligence. Holds a PhD in network analysis from UCL."
          />
          <TeamMember
            initials="DM"
            name="Daniel Morrow"
            role="Head of Product"
            bio="Ex-policing, former digital intelligence officer with the National Crime Agency. Brings the analyst's perspective to every product decision."
          />
          <TeamMember
            initials="PL"
            name="Priya Lakkundi"
            role="Head of Partnerships"
            bio="10 years in govtech and intelligence software sales. Leads our law enforcement licensing programme and data provider integrations."
          />
        </div>

        <div style={{ marginTop: 48, paddingTop: 32, borderTop: `1px solid ${BORDER}` }}>
          <p style={{ fontSize: 14, color: TEXT3, maxWidth: '50ch', lineHeight: 1.7, margin: '0 0 20px' }}>
            We're a team of 12, based in London. We're hiring engineers, analysts, and partnerships people who want to work on tools that matter.
          </p>
          <button
            onClick={() => navigate('/careers')}
            style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.08em', textTransform: 'uppercase', color: TEXT1, background: 'none', border: `1px solid ${TEXT1}`, cursor: 'pointer', padding: '9px 20px' }}
          >
            See open roles →
          </button>
        </div>
      </Section>

      {/* ── Story / timeline ── */}
      <Section dark>
        <h2 style={{ fontWeight: 500, fontSize: 'clamp(22px,2.4vw,32px)', letterSpacing: '-.015em', color: '#f2f2f4', margin: '0 0 40px' }}>
          How we got here
        </h2>
        <div style={{ maxWidth: 680 }}>
          <TimelineEntry
            date="Q1 2023"
            event="The spreadsheet problem"
            detail="Amir's team at the bank spent 40 hours building a network diagram for a £3.2M APP fraud case — in Excel. He started prototyping a graph tool over a weekend."
          />
          <TimelineEntry
            date="Q3 2023"
            event="First external users"
            detail="Ten fraud analysts at three financial institutions joined a private beta. Average investigation time dropped from 3 days to 8 hours."
          />
          <TimelineEntry
            date="Q1 2024"
            event="Seed funding"
            detail="Raised £2.1M seed from Northgate Ventures and three angel investors with backgrounds in policing and intelligence. Hired the first four team members."
          />
          <TimelineEntry
            date="Q3 2024"
            event="Law enforcement programme launched"
            detail="First accredited access agreements signed with two UK police forces and a national agency. STIX 2.1 export shipped to support tool-to-tool sharing."
          />
          <TimelineEntry
            date="Q1 2025"
            event="Public launch"
            detail="Raven opened to all users with a free tier. 800 analysts signed up in the first two weeks. Pro tier launched to meet demand for OSINT enrichment at scale."
          />
          <TimelineEntry
            date="Q4 2025"
            event="Series A"
            detail="Raised £9.4M Series A led by Meridian Capital. Expanded to a team of 12. Opened the London engineering hub."
          />
          <div style={{ paddingTop: 12 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: '#6f6f78' }}>Now</div>
            <div style={{ fontSize: 15, fontWeight: 500, color: '#f2f2f4', marginTop: 6 }}>
              In active development. Focused on law enforcement and financial crime teams.
            </div>
          </div>
        </div>
      </Section>

      {/* ── CTA ── */}
      <section style={{ background: BG_INK, borderTop: '1px solid #1c1c22' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(64px,8vw,112px) clamp(20px,4vw,48px)', display: 'grid', gridTemplateColumns: '1fr auto', alignItems: 'center', gap: 40 }}>
          <div>
            <h2 style={{ fontWeight: 500, fontSize: 'clamp(26px,3.5vw,44px)', letterSpacing: '-.018em', color: '#f2f2f4', margin: '0 0 14px' }}>
              Ready to see it in action?
            </h2>
            <p style={{ fontSize: 16, color: '#9a9aa0', margin: 0, maxWidth: '44ch', lineHeight: 1.6 }}>
              Start a free investigation now — no card, no setup, no expiry. Or talk to us about what enterprise or law enforcement access looks like for your team.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexShrink: 0 }}>
            <button
              onClick={() => { window.location.href = '/app' }}
              style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', padding: '13px 24px', background: '#fff', color: BG_INK, border: 'none', cursor: 'pointer', transition: 'opacity .15s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '.85' }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1' }}
            >
              Start free →
            </button>
            <button
              onClick={() => navigate('/contact?type=enterprise')}
              style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.08em', textTransform: 'uppercase', padding: '13px 24px', background: 'transparent', color: '#fff', border: '1px solid rgba(255,255,255,0.3)', cursor: 'pointer', transition: 'border-color .15s', whiteSpace: 'nowrap' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.7)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)' }}
            >
              Talk to us
            </button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
