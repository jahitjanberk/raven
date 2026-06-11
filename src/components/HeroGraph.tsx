import React from 'react'

const R    = 24
const MONO = "'IBM Plex Mono',ui-monospace,monospace"

interface N { id: string; type: string; label: string; x: number; y: number; risk: string; color: string; selected?: boolean }
interface E { from: string; to: string; label?: string; grade?: string; gc?: string }

const NODES: N[] = [
  { id: 'victim',  type: 'person',      label: 'M. Thornton',      x: 108, y: 185, risk: 'NONE',   color: '#A371F7' },
  { id: 'report',  type: 'fraudreport', label: 'NFIB-2026-0441',   x: 290, y:  75, risk: 'NONE',   color: '#7C3AED' },
  { id: 'email',   type: 'email',       label: 'j.cole82@…',       x: 112, y: 348, risk: 'MEDIUM', color: '#D29922' },
  { id: 'ip',      type: 'ip',          label: '185.220.101.4',    x: 492, y: 102, risk: 'HIGH',   color: '#388BFD' },
  { id: 'domain',  type: 'domain',      label: 'secure-lloyds.cc', x: 638, y: 218, risk: 'HIGH',   color: '#3FB87A' },
  { id: 'suspect', type: 'person',      label: 'J. Coleman',       x: 357, y: 268, risk: 'HIGH',   color: '#A371F7', selected: true },
  { id: 'bank',    type: 'bank',        label: 'Acc ****7842',     x: 528, y: 370, risk: 'HIGH',   color: '#34D399' },
  { id: 'wallet',  type: 'wallet',      label: '1A1zP1eP…',       x: 675, y: 448, risk: 'HIGH',   color: '#E3B341' },
  { id: 'mule',    type: 'person',      label: 'K. Osei',          x: 244, y: 418, risk: 'MEDIUM', color: '#A371F7' },
  { id: 'phone',   type: 'phone',       label: '+44 7912 xxxxxx',  x:  80, y: 460, risk: 'NONE',   color: '#8B949E' },
]

const EDGES: E[] = [
  { from: 'victim',  to: 'report',  label: 'filed' },
  { from: 'victim',  to: 'email',   label: 'used' },
  { from: 'email',   to: 'suspect', label: 'registered to',  grade: 'B2', gc: '#56C2E6' },
  { from: 'suspect', to: 'ip',      label: 'accessed from',  grade: 'A1', gc: '#3FB87A' },
  { from: 'ip',      to: 'domain',  label: 'resolves',       grade: 'A2', gc: '#3FB87A' },
  { from: 'suspect', to: 'bank',    label: 'controls',       grade: 'A1', gc: '#3FB87A' },
  { from: 'suspect', to: 'phone',   label: 'linked' },
  { from: 'bank',    to: 'wallet',  label: '£47.2k sent',    grade: 'B1', gc: '#56C2E6' },
  { from: 'mule',    to: 'bank',    label: 'account holder', grade: 'A2', gc: '#3FB87A' },
  { from: 'report',  to: 'suspect', label: 'implicates' },
]

const RISK_RING: Record<string, string> = {
  HIGH: '#E05252', MEDIUM: '#C98A2E', LOW: '#3A9E6F', NONE: 'transparent',
}

// Simplified icon paths matching the app's SVG icons (viewBox 0 0 24 24)
const ICONS: Record<string, React.ReactNode> = {
  person:      <><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></>,
  fraudreport: <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M9 9h6M9 13h6M9 17h4" /></>,
  email:       <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></>,
  ip:          <><rect x="2" y="6" width="20" height="12" rx="2" /><path d="M12 12h.01M8 12h.01M16 12h.01" /></>,
  domain:      <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" /></>,
  bank:        <><line x1="3" y1="22" x2="21" y2="22" /><line x1="6" y1="18" x2="6" y2="11" /><line x1="10" y1="18" x2="10" y2="11" /><line x1="14" y1="18" x2="14" y2="11" /><line x1="18" y1="18" x2="18" y2="11" /><polygon points="12 2 20 7 4 7" /></>,
  wallet:      <><rect x="2" y="5" width="20" height="14" rx="2" /><path d="M2 10h20" /><circle cx="16" cy="15" r="1" /></>,
  phone:       <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 9.8 19.79 19.79 0 0 1 1.05 1.17 2 2 0 0 1 3 .01h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 7.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 14.92z" />,
}

function getNode(id: string) { return NODES.find(n => n.id === id)! }

function edgePts(a: N, b: N) {
  const dx = b.x - a.x, dy = b.y - a.y
  const len = Math.sqrt(dx * dx + dy * dy) || 1
  const ux = dx / len, uy = dy / len
  const x1 = a.x + ux * (R + 2),  y1 = a.y + uy * (R + 2)
  const x2 = b.x - ux * (R + 11), y2 = b.y - uy * (R + 11)
  return { x1, y1, x2, y2, mx: (x1 + x2) / 2, my: (y1 + y2) / 2, gx: x1 + (x2 - x1) * 0.62, gy: y1 + (y2 - y1) * 0.62 }
}

export function HeroGraph() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute', right: 0, top: 0, bottom: 0,
        width: '62%',
        maskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 15%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,1) 55%)',
        WebkitMaskImage: 'linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 15%, rgba(0,0,0,0.85) 35%, rgba(0,0,0,1) 55%)',
        pointerEvents: 'none',
        display: 'flex', alignItems: 'center',
      }}
    >
      <svg
        viewBox="0 0 760 540"
        preserveAspectRatio="xMidYMid meet"
        style={{ width: '100%', height: '100%' }}
      >
        <defs>
          <style>{`
            @keyframes hgPulse1 { 0%,100%{opacity:.55} 50%{opacity:.08} }
            @keyframes hgPulse2 { 0%,100%{opacity:.25} 50%{opacity:.04} }
            .hg-ring-a { animation: hgPulse1 2.8s ease-in-out infinite; }
            .hg-ring-b { animation: hgPulse2 2.8s ease-in-out 1.4s infinite; }
          `}</style>

          {/* Default arrowhead */}
          <marker id="hga" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0,0 L0,8 L8,4 z" fill="rgba(255,255,255,0.2)" />
          </marker>
          {/* Highlighted arrowhead (suspect edges) */}
          <marker id="hga-hi" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
            <path d="M0,0 L0,8 L8,4 z" fill="rgba(163,113,247,0.65)" />
          </marker>
        </defs>

        {/* ── Edges ── */}
        {EDGES.map((e, i) => {
          const a = getNode(e.from), b = getNode(e.to)
          const { x1, y1, x2, y2, mx, my, gx, gy } = edgePts(a, b)
          const hi = e.from === 'suspect' || e.to === 'suspect'
          return (
            <g key={i}>
              <line
                x1={x1} y1={y1} x2={x2} y2={y2}
                stroke={hi ? 'rgba(163,113,247,0.4)' : 'rgba(255,255,255,0.13)'}
                strokeWidth={hi ? 1.5 : 1}
                markerEnd={hi ? 'url(#hga-hi)' : 'url(#hga)'}
              />
              {e.label && (
                <text x={mx} y={my - 6} textAnchor="middle" fontFamily={MONO} fontSize={8} fill="rgba(255,255,255,0.27)">
                  {e.label}
                </text>
              )}
              {e.grade && e.gc && (
                <g>
                  <rect x={gx - 11} y={gy - 8} width={22} height={14} rx={2}
                    fill="#0c0c14" stroke={e.gc} strokeWidth={0.9} opacity={0.95} />
                  <text x={gx} y={gy + 3.2} textAnchor="middle"
                    fontFamily={MONO} fontSize={8} fontWeight="700" fill={e.gc}>
                    {e.grade}
                  </text>
                </g>
              )}
            </g>
          )
        })}

        {/* ── Nodes ── */}
        {NODES.map(n => {
          const rColor = RISK_RING[n.risk]
          const sel = !!n.selected
          // Icon: scale 24px icon to 16px, centered at node (translate by -8, -8)
          const iconScale = 0.666
          const iconOffset = 8
          return (
            <g key={n.id}>
              {/* Pulsing selection rings */}
              {sel && <>
                <circle cx={n.x} cy={n.y} r={R + 14} fill="none" stroke={n.color} strokeWidth={1.2} className="hg-ring-a" />
                <circle cx={n.x} cy={n.y} r={R + 24} fill="none" stroke={n.color} strokeWidth={0.6} className="hg-ring-b" />
              </>}

              {/* Risk ring */}
              {n.risk !== 'NONE' && (
                <circle cx={n.x} cy={n.y} r={R + 7} fill="none"
                  stroke={rColor} strokeWidth={1.2} opacity={0.52}
                  strokeDasharray={n.risk === 'MEDIUM' ? '4 3' : undefined}
                />
              )}

              {/* Entity color halo */}
              <circle cx={n.x} cy={n.y} r={R + 3} fill="none"
                stroke={n.color} strokeWidth={0.7} opacity={0.22} />

              {/* Node body */}
              <circle cx={n.x} cy={n.y} r={R}
                fill={sel ? n.color + '20' : '#111118'}
                stroke={n.color}
                strokeWidth={sel ? 2.2 : 1.5}
                opacity={sel ? 1 : 0.9}
              />

              {/* Icon */}
              <g
                transform={`translate(${n.x - iconOffset},${n.y - iconOffset}) scale(${iconScale})`}
                fill="none"
                stroke={sel ? n.color : 'rgba(255,255,255,0.72)'}
                strokeWidth={sel ? 2 : 1.75}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {ICONS[n.type] ?? null}
              </g>

              {/* Value label */}
              <text x={n.x} y={n.y + R + 13} textAnchor="middle"
                fontFamily={MONO} fontSize={8.5} fill="rgba(255,255,255,0.48)">
                {n.label}
              </text>

              {/* Type chip */}
              <text x={n.x} y={n.y + R + 22} textAnchor="middle"
                fontFamily={MONO} fontSize={7} fill={n.color} opacity={0.65}>
                {n.type.toUpperCase()}
              </text>
            </g>
          )
        })}

        {/* ── Mini entity panel card ── */}
        <g transform="translate(560, 12)">
          <rect width={192} height={102} rx={4}
            fill="#0e0e16" stroke="rgba(163,113,247,0.4)" strokeWidth={1} />
          <rect x={0} y={0} width={192} height={22} rx={4}
            fill="rgba(163,113,247,0.12)" />
          <rect x={0} y={18} width={192} height={4} fill="rgba(163,113,247,0.12)" />

          {/* Header */}
          <text x={10} y={14} fontFamily={MONO} fontSize={8.5} fontWeight="700" fill="#A371F7">PERSON · SUSPECT</text>
          <rect x={170} y={6} width={14} height={10} rx={2} fill="#E05252" opacity={0.9} />
          <text x={177} y={13.5} textAnchor="middle" fontFamily={MONO} fontSize={7} fontWeight="700" fill="#fff">HI</text>

          {/* Fields */}
          {[
            { label: 'Name',       val: 'J. Coleman',       y: 38 },
            { label: 'Risk',       val: 'HIGH',              y: 52 },
            { label: 'Confidence', val: 'Confirmed',         y: 66 },
            { label: 'Intel grade',val: 'A1',                y: 80 },
            { label: 'Added',      val: '09 Jun 2026',       y: 94 },
          ].map(f => (
            <g key={f.label}>
              <text x={10}  y={f.y} fontFamily={MONO} fontSize={7.5} fill="rgba(255,255,255,0.38)">{f.label}</text>
              <text x={182} y={f.y} textAnchor="end" fontFamily={MONO} fontSize={7.5}
                fill={f.val === 'HIGH' ? '#E05252' : f.val === 'A1' ? '#3FB87A' : 'rgba(255,255,255,0.75)'}>
                {f.val}
              </text>
            </g>
          ))}
        </g>

        {/* ── Classification banner ── */}
        <g transform="translate(30, 12)">
          <rect width={180} height={18} rx={3} fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)" strokeWidth={0.8} />
          <text x={90} y={12.5} textAnchor="middle" fontFamily={MONO} fontSize={7.5} letterSpacing="0.1em" fill="rgba(255,255,255,0.45)">
            OFFICIAL-SENSITIVE
          </text>
        </g>

        {/* ── Case ref tag ── */}
        <g transform="translate(30, 38)">
          <text fontFamily={MONO} fontSize={8} fill="rgba(255,255,255,0.3)">
            Operation Glasshouse · NFIB-2026-0441
          </text>
        </g>

        {/* ── Node count badge ── */}
        <g transform="translate(30, 515)">
          <text fontFamily={MONO} fontSize={7.5} fill="rgba(255,255,255,0.28)">10 entities · 10 links · 6 graded</text>
        </g>
      </svg>
    </div>
  )
}
