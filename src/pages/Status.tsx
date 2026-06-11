import React, { useEffect, useState, useCallback } from 'react'
import { SiteHeader } from '../components/SiteHeader'
import { SiteFooter } from '../components/SiteFooter'

const MONO = "'IBM Plex Mono',ui-monospace,monospace"
const SANS = "'Helvetica Neue',Helvetica,Arial,sans-serif"
const BORDER = '#ececee'
const TEXT1 = '#0a0a0b'
const TEXT2 = '#3a3a3f'
const TEXT3 = '#9a9aa0'

type ServiceStatus = 'operational' | 'degraded' | 'down'
type Overall = 'operational' | 'degraded' | 'outage'

interface Service {
  name: string
  slug: string
  category: string
  status: ServiceStatus
  latency_ms: number
}

interface StatusData {
  overall: Overall
  api: string
  services: Service[]
  checked_at: number
}

const STATUS_COLOR: Record<ServiceStatus | 'operational', string> = {
  operational: '#16a34a',
  degraded:    '#d97706',
  down:        '#dc2626',
}

const OVERALL_CONFIG: Record<Overall, { bg: string; text: string; label: string; sub: string }> = {
  operational: {
    bg:    '#0a0a0b',
    text:  '#fff',
    label: 'All systems operational',
    sub:   'Every intelligence source and API endpoint is responding normally.',
  },
  degraded: {
    bg:    '#92400e',
    text:  '#fff',
    label: 'Partial degradation',
    sub:   'Some services are responding slowly or returning errors. We are investigating.',
  },
  outage: {
    bg:    '#7f1d1d',
    text:  '#fff',
    label: 'Service disruption',
    sub:   'One or more critical services are currently unavailable. We are working to restore them.',
  },
}

function Dot({ status }: { status: ServiceStatus }) {
  const color = STATUS_COLOR[status]
  return (
    <span style={{
      display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
      background: color, flexShrink: 0,
      boxShadow: status === 'operational' ? `0 0 0 3px ${color}22` : undefined,
    }} />
  )
}

function LatencyBar({ ms, max = 800 }: { ms: number; max?: number }) {
  const pct = Math.min(100, (ms / max) * 100)
  const color = ms < 300 ? '#16a34a' : ms < 600 ? '#d97706' : '#dc2626'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 60, height: 3, background: '#f0f0f2', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{ width: `${pct}%`, height: '100%', background: color, transition: 'width 0.4s ease' }} />
      </div>
      <span style={{ fontFamily: MONO, fontSize: 10.5, color: TEXT3, minWidth: 36 }}>
        {ms}ms
      </span>
    </div>
  )
}

function StatusBadge({ status }: { status: ServiceStatus }) {
  const label = status === 'operational' ? 'Operational' : status === 'degraded' ? 'Degraded' : 'Down'
  const color = STATUS_COLOR[status]
  return (
    <span style={{
      fontFamily: MONO, fontSize: 9.5, letterSpacing: '.08em', textTransform: 'uppercase',
      color, padding: '3px 7px',
      border: `1px solid ${color}44`,
      background: `${color}0d`,
    }}>
      {label}
    </span>
  )
}

export function StatusPage() {
  const [data, setData]       = useState<StatusData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [nextIn, setNextIn]   = useState(60)

  const fetch_ = useCallback(async () => {
    try {
      const resp = await fetch(`${import.meta.env.VITE_API_URL ?? 'http://localhost:8000'}/api/status`)
      if (!resp.ok) throw new Error('API error')
      const json = await resp.json() as StatusData
      setData(json)
      setError('')
      setNextIn(60)
    } catch {
      setError('Could not reach the Raven API.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch_()
    const poll = setInterval(fetch_, 60_000)
    const tick = setInterval(() => setNextIn(n => Math.max(0, n - 1)), 1_000)
    return () => { clearInterval(poll); clearInterval(tick) }
  }, [fetch_])

  const overall = data?.overall ?? 'operational'
  const cfg = OVERALL_CONFIG[overall]
  const checkedAt = data ? new Date(data.checked_at * 1000) : null

  const apiService: Service = {
    name: 'Raven API', slug: 'api', category: 'Platform',
    status: 'operational', latency_ms: 0,
  }
  const allServices = data ? [apiService, ...data.services] : []

  return (
    <div style={{ background: '#fff', color: TEXT1, fontFamily: SANS, WebkitFontSmoothing: 'antialiased', minHeight: '100vh' }}>
      <SiteHeader />

      {/* ── Overall banner ── */}
      <div style={{ background: loading ? '#f8f8fa' : cfg.bg, transition: 'background 0.4s ease' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(48px,7vw,80px) clamp(20px,5vw,48px) clamp(40px,6vw,64px)' }}>
          {loading ? (
            <div style={{ fontFamily: MONO, fontSize: 12, color: TEXT3, letterSpacing: '.06em' }}>Checking systems…</div>
          ) : error ? (
            <div>
              <div style={{ fontSize: 'clamp(22px,3vw,36px)', fontWeight: 500, letterSpacing: '-.02em', color: TEXT1, marginBottom: 10 }}>
                Could not load status
              </div>
              <p style={{ fontSize: 14, color: TEXT2, margin: 0 }}>{error}</p>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 14 }}>
                <div style={{
                  width: 14, height: 14, borderRadius: '50%',
                  background: overall === 'operational' ? '#4ade80' : overall === 'degraded' ? '#fbbf24' : '#f87171',
                  boxShadow: `0 0 0 4px ${overall === 'operational' ? '#4ade8040' : overall === 'degraded' ? '#fbbf2440' : '#f8717140'}`,
                }} />
                <h1 style={{ margin: 0, fontSize: 'clamp(22px,3vw,36px)', fontWeight: 500, letterSpacing: '-.02em', color: cfg.text }}>
                  {cfg.label}
                </h1>
              </div>
              <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: `${cfg.text}bb`, maxWidth: '56ch' }}>
                {cfg.sub}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Services ── */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 'clamp(36px,5vw,56px) clamp(20px,5vw,48px) 80px' }}>

        {/* Meta bar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 12 }}>
          <h2 style={{ margin: 0, fontWeight: 500, fontSize: 17, letterSpacing: '-.01em' }}>
            System components
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {checkedAt && (
              <span style={{ fontFamily: MONO, fontSize: 10.5, color: TEXT3 }}>
                Checked {checkedAt.toLocaleTimeString()} · refreshing in {nextIn}s
              </span>
            )}
            <button
              onClick={() => { setLoading(true); fetch_() }}
              style={{
                fontFamily: MONO, fontSize: 10.5, letterSpacing: '.06em', textTransform: 'uppercase',
                color: TEXT3, background: 'none', border: `1px solid ${BORDER}`,
                padding: '4px 10px', cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.color = TEXT1; e.currentTarget.style.borderColor = TEXT1 }}
              onMouseLeave={e => { e.currentTarget.style.color = TEXT3; e.currentTarget.style.borderColor = BORDER }}
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Service rows */}
        <div style={{ border: `1px solid ${BORDER}` }}>
          {allServices.map((svc, i) => (
            <div
              key={svc.slug}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                alignItems: 'center',
                gap: 16,
                padding: '16px 20px',
                borderBottom: i < allServices.length - 1 ? `1px solid ${BORDER}` : 'none',
                background: i % 2 === 0 ? '#fff' : '#fafafa',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                <Dot status={svc.status} />
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: TEXT1 }}>{svc.name}</div>
                  <div style={{ fontFamily: MONO, fontSize: 10, color: TEXT3, letterSpacing: '.04em', textTransform: 'uppercase', marginTop: 1 }}>
                    {svc.category}
                  </div>
                </div>
              </div>
              <div className="hide-mobile">
                {svc.slug !== 'api' ? <LatencyBar ms={svc.latency_ms} /> : (
                  <span style={{ fontFamily: MONO, fontSize: 10.5, color: TEXT3 }}>—</span>
                )}
              </div>
              <StatusBadge status={svc.status} />
            </div>
          ))}
          {loading && allServices.length === 0 && (
            <div style={{ padding: '32px 20px', textAlign: 'center', fontFamily: MONO, fontSize: 11, color: TEXT3, letterSpacing: '.06em' }}>
              Probing services…
            </div>
          )}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 24, marginTop: 20, flexWrap: 'wrap' }}>
          {(['operational', 'degraded', 'down'] as const).map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Dot status={s} />
              <span style={{ fontFamily: MONO, fontSize: 10.5, color: TEXT3, textTransform: 'capitalize' }}>{s}</span>
            </div>
          ))}
        </div>

        {/* Disclosure */}
        <div style={{ marginTop: 56, paddingTop: 32, borderTop: `1px solid ${BORDER}` }}>
          <div style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: '.1em', textTransform: 'uppercase', color: TEXT3, marginBottom: 16 }}>
            Uptime SLA
          </div>
          <p style={{ fontSize: 14, color: TEXT2, lineHeight: 1.7, maxWidth: '58ch', margin: 0 }}>
            Raven commits to 99.9% monthly uptime for the API and core platform under Team and Enterprise plans.
            Intelligence source availability depends on third-party providers and is not covered by the Raven SLA.
            Historical incident records and postmortems are available to Enterprise customers on request.
          </p>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}
