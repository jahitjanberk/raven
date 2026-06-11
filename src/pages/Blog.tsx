import React, { useState } from 'react'
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

const TAGS = ['All', 'Investigations', 'Financial Crime', 'OSINT', 'Product', 'Intelligence Tradecraft']

const ARTICLES = [
  {
    slug: 'link-analysis-organised-fraud',
    category: 'Financial Crime',
    title: 'Link analysis in organised insurance fraud: from isolated claim to ring map',
    summary: 'Staged accident rings, ghost broking operations, and phantom injury claims all share a common structure — a coordinator, a network of claimants, and shared infrastructure. This piece covers how experienced SIU analysts approach network mapping from first report to prosecution package.',
    author: 'Raven Intelligence Team',
    date: '5 June 2026',
    readTime: '9 min read',
    photo: 'photo-1554224155-8d04cb21cd6c',
    featured: true,
  },
  {
    slug: 'stix-21-in-practice',
    category: 'Intelligence Tradecraft',
    title: 'STIX 2.1 in practice: why intelligence grading matters more than data completeness',
    summary: 'STIX 2.1 is the structured language for threat intelligence sharing. But the format is only as good as the grading attached to each object. This piece examines how Admiralty system grading — when applied consistently — makes STIX bundles actionable rather than informational.',
    author: 'Raven Intelligence Team',
    date: '28 May 2026',
    readTime: '7 min read',
    photo: 'photo-1526374965328-7f61d4dc18c5',
    featured: false,
  },
  {
    slug: 'osint-financial-crime',
    category: 'OSINT',
    title: 'Open source intelligence for financial crime investigators: what sources hold up in court',
    summary: 'OSINT from company registries, WHOIS, certificate transparency, and public blockchain explorers is increasingly used in financial crime investigations. This piece covers which source categories are accepted as evidence in UK criminal proceedings and how to document provenance properly.',
    author: 'Raven Intelligence Team',
    date: '19 May 2026',
    readTime: '12 min read',
    photo: 'photo-1460925895917-afdab827c52f',
    featured: false,
  },
  {
    slug: 'entity-resolution-investigation',
    category: 'Investigations',
    title: 'Entity resolution for investigators: the difference between a match and a link',
    summary: 'Identifying that two records refer to the same person is not the same as establishing a link between two people. This piece covers entity resolution — deduplication, confidence thresholds, and alias matching — as a distinct discipline from link analysis, and why conflating them produces unreliable graphs.',
    author: 'Raven Intelligence Team',
    date: '12 May 2026',
    readTime: '8 min read',
    photo: 'photo-1504711434969-e33886168f5c',
    featured: false,
  },
  {
    slug: 'graph-analysis-money-laundering',
    category: 'Financial Crime',
    title: 'Graph analysis for money laundering: identifying layering structures across complex corporate networks',
    summary: 'Money laundering through corporate structures involves deliberate obfuscation — nominee directors, offshore holding companies, and interleaved transaction flows. Graph analysis reveals the structures that transaction monitoring misses.',
    author: 'Raven Intelligence Team',
    date: '5 May 2026',
    readTime: '10 min read',
    photo: 'photo-1551434678-e076c223a692',
    featured: false,
  },
  {
    slug: 'nato-stanag-grading',
    category: 'Intelligence Tradecraft',
    title: 'NATO STANAG 2511 grading in a civilian intelligence context',
    summary: 'The NATO STANAG 2511 source and information grading system was designed for military intelligence sharing. This piece examines its application to civilian financial intelligence — where it works, where adaptation is needed, and how it compares to the Admiralty (1-6 / A-F) system.',
    author: 'Raven Intelligence Team',
    date: '28 April 2026',
    readTime: '6 min read',
    photo: 'photo-1451187580459-43490279c0fa',
    featured: false,
  },
]

function ArticleCard({ article, featured }: { article: typeof ARTICLES[0], featured?: boolean }) {
  const [hovered, setHovered] = useState(false)
  const navigate = useNavigate()
  if (featured) {
    return (
      <div
        onClick={() => navigate(`/blog/${article.slug}`)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ cursor: 'pointer', borderBottom: `1px solid ${BORDER}` }}
      >
        <div className="mobile-single-col" style={{ display: 'grid', gridTemplateColumns: '1fr 480px', gap: 0 }}>
          <div style={{ padding: 'clamp(32px,4vw,56px)', borderRight: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 20, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: MONO, fontSize: 9, letterSpacing: '.12em', textTransform: 'uppercase', color: '#fff', background: TEXT1, padding: '3px 8px' }}>Featured</span>
              <span style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '.08em', textTransform: 'uppercase', color: TEXT3 }}>{article.category}</span>
            </div>
            <h2 style={{ margin: '0 0 16px', fontWeight: 500, fontSize: 'clamp(22px,2.2vw,30px)', letterSpacing: '-.016em', lineHeight: 1.25, color: hovered ? '#2563eb' : TEXT1, transition: 'color .12s' }}>{article.title}</h2>
            <p style={{ margin: '0 0 24px', fontSize: 14.5, lineHeight: 1.75, color: TEXT2 }}>{article.summary}</p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <span style={{ fontFamily: MONO, fontSize: 10.5, color: TEXT3 }}>{article.date}</span>
              <span style={{ fontFamily: MONO, fontSize: 10.5, color: TEXT3 }}>{article.readTime}</span>
            </div>
          </div>
          <div style={{ overflow: 'hidden' }}>
            <div style={{ width: '100%', aspectRatio: '560/420', background: 'repeating-linear-gradient(135deg,#e9e9eb,#e9e9eb 14px,#f3f3f5 14px,#f3f3f5 28px)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: hovered ? 'scale(1.03)' : 'scale(1)', transition: 'transform .3s ease' }}>
              <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9a9aa0' }}>photo · article</span>
            </div>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div
      onClick={() => navigate(`/blog/${article.slug}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ overflow: 'hidden', marginBottom: 20 }}>
        <div style={{ width: '100%', aspectRatio: '600/340', background: 'repeating-linear-gradient(135deg,#e9e9eb,#e9e9eb 14px,#f3f3f5 14px,#f3f3f5 28px)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: hovered ? 'scale(1.04)' : 'scale(1)', transition: 'transform .3s ease' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, letterSpacing: '.1em', textTransform: 'uppercase', color: '#9a9aa0' }}>photo · article</span>
        </div>
      </div>
      <div style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: '.08em', textTransform: 'uppercase', color: TEXT3, marginBottom: 10 }}>{article.category}</div>
      <h3 style={{ margin: '0 0 10px', fontWeight: 500, fontSize: 17, letterSpacing: '-.01em', lineHeight: 1.35, color: hovered ? '#2563eb' : TEXT1, transition: 'color .12s' }}>{article.title}</h3>
      <p style={{ margin: '0 0 16px', fontSize: 13.5, lineHeight: 1.7, color: TEXT2, flexGrow: 1 }}>{article.summary}</p>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: MONO, fontSize: 10, color: TEXT3 }}>{article.date}</span>
        <span style={{ fontFamily: MONO, fontSize: 10, color: TEXT3 }}>{article.readTime}</span>
      </div>
    </div>
  )
}

export function BlogPage() {
  const [activeTag, setActiveTag] = useState('All')
  const navigate = useNavigate()

  const filtered = activeTag === 'All' ? ARTICLES : ARTICLES.filter(a => a.category === activeTag)
  const featured = filtered.find(a => a.featured) || filtered[0]
  const grid = filtered.filter(a => a !== featured)

  return (
    <div style={{ background: '#fff', color: TEXT1, fontFamily: SANS, WebkitFontSmoothing: 'antialiased', minHeight: '100vh' }}>
      <SiteHeader />

      {/* Hero */}
      <section style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(64px,9vw,112px) clamp(20px,4vw,48px) clamp(32px,4vw,48px)' }}>
          <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.16em', textTransform: 'uppercase', color: TEXT3, marginBottom: 20 }}>Intelligence Insights</div>
          <h1 style={{ margin: '0 0 20px', fontWeight: 500, fontSize: 'clamp(32px,4.5vw,56px)', letterSpacing: '-.022em', lineHeight: 1.06, maxWidth: 700 }}>
            Writing for investigators and intelligence analysts.
          </h1>
          <p style={{ margin: 0, fontSize: 'clamp(15px,1.4vw,18px)', lineHeight: 1.65, color: TEXT2, maxWidth: 520 }}>
            Investigations technique, financial crime tradecraft, OSINT practice, and product thinking — written by the Raven team.
          </p>
        </div>

        {/* Tag filter */}
        <div style={{ borderTop: `1px solid ${BORDER}`, overflowX: 'auto' }}>
          <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 clamp(20px,4vw,48px)', display: 'flex', gap: 0 }}>
            {TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveTag(tag)}
                style={{
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: '.1em',
                  textTransform: 'uppercase',
                  background: 'none',
                  color: activeTag === tag ? TEXT1 : TEXT3,
                  border: 'none',
                  borderBottom: activeTag === tag ? `2px solid ${TEXT1}` : '2px solid transparent',
                  cursor: 'pointer',
                  padding: '16px 18px',
                  whiteSpace: 'nowrap',
                  transition: 'color .1s',
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured article */}
      {featured && (
        <section>
          <ArticleCard article={featured} featured />
        </section>
      )}

      {/* Article grid */}
      {grid.length > 0 && (
        <section style={{ borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(48px,6vw,80px) clamp(20px,4vw,48px)' }}>
            <div className="mobile-single-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 'clamp(24px,3vw,40px) clamp(20px,3vw,36px)' }}>
              {grid.map(a => <ArticleCard key={a.slug} article={a} />)}
            </div>
          </div>
        </section>
      )}

      {/* Newsletter */}
      <section style={{ background: BG2, borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: 'clamp(48px,6vw,72px) clamp(20px,4vw,48px)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 32 }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.14em', textTransform: 'uppercase', color: TEXT3, marginBottom: 12 }}>Newsletter</div>
            <div style={{ fontSize: 'clamp(20px,2vw,26px)', fontWeight: 500, letterSpacing: '-.014em', lineHeight: 1.2, color: TEXT1, marginBottom: 8 }}>New pieces in your inbox, monthly.</div>
            <div style={{ fontSize: 13.5, color: TEXT2 }}>No marketing. Just the writing — when it's ready.</div>
          </div>
          <div style={{ display: 'flex', gap: 0 }}>
            <input
              type="email"
              placeholder="your@email.com"
              style={{ fontFamily: MONO, fontSize: 12, padding: '11px 16px', border: `1px solid ${BORDER}`, borderRight: 'none', outline: 'none', width: 220, color: TEXT1, background: '#fff' }}
            />
            <button style={{ fontFamily: MONO, fontSize: 10, letterSpacing: '.1em', textTransform: 'uppercase', background: TEXT1, color: '#fff', border: 'none', cursor: 'pointer', padding: '11px 20px', whiteSpace: 'nowrap' }}>
              Subscribe
            </button>
          </div>
        </div>
      </section>
      <SiteFooter />
    </div>
  )
}
