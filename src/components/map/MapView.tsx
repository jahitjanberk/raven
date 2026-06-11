import { useEffect, useRef, useState, useMemo } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useGraphStore } from '../../store/graphStore'
import { RISK_COLORS } from '../../types/graph'
import { UIIcon } from '../../icons/UIIcon'

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseCoords(raw?: string): [number, number] | null {
  if (!raw) return null
  const parts = raw.split(',').map(s => parseFloat(s.trim()))
  if (parts.length !== 2 || parts.some(isNaN)) return null
  const [lat, lng] = parts
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null
  return [lat, lng]
}

function buildGeoQuery(metadata?: Record<string, string>, value?: string): string {
  const parts = [metadata?.address, metadata?.city, metadata?.postcode, metadata?.country].filter(Boolean)
  return parts.length > 0 ? parts.join(', ') : (value ?? '')
}

function makeMarkerHtml(selected: boolean, riskFlag: string): string {
  const color = '#65A30D'
  const riskColor = riskFlag !== 'NONE' ? RISK_COLORS[riskFlag as keyof typeof RISK_COLORS] : null
  const s = selected ? 18 : 13
  const ring = riskColor ? `outline: 2.5px solid ${riskColor}; outline-offset: 2px;` : ''
  const glow = selected
    ? `box-shadow: 0 0 0 4px ${color}44, 0 2px 10px rgba(0,0,0,0.5);`
    : 'box-shadow: 0 1px 5px rgba(0,0,0,0.5);'
  const border = `border: 2px solid ${selected ? '#fff' : color + 'AA'};`
  return `<div style="width:${s}px;height:${s}px;background:${color};border-radius:50%;${border}${ring}${glow}"></div>`
}

type GeoState = 'idle' | 'loading' | 'error' | 'done'

// ── Dark theme CSS override (injected once) ───────────────────────────────────
const LEAFLET_DARK_CSS = `
.leaflet-container { background: #0f1117; }
.leaflet-control-zoom a {
  background: var(--bg-surface, #1a1d27) !important;
  border-color: var(--border-soft, #2a2d3a) !important;
  color: var(--text-secondary, #9ca3af) !important;
}
.leaflet-control-zoom a:hover {
  background: var(--bg-raised, #22263a) !important;
  color: var(--text-primary, #f0f1f4) !important;
}
.leaflet-control-attribution {
  background: rgba(10,12,20,0.75) !important;
  color: var(--text-tertiary, #6b7280) !important;
  font-size: 9px !important;
}
.leaflet-control-attribution a { color: var(--text-tertiary, #6b7280) !important; }
.raven-marker-label {
  background: var(--bg-surface, #1a1d27);
  border: 1px solid var(--border-soft, #2a2d3a);
  border-radius: 4px;
  color: var(--text-primary, #f0f1f4);
  font-family: var(--font-mono, monospace);
  font-size: 10px;
  padding: 2px 5px;
  white-space: nowrap;
  box-shadow: 0 2px 8px rgba(0,0,0,0.4);
}
.raven-marker-label::before { display: none !important; }
`

let darkCssInjected = false
function injectDarkCss() {
  if (darkCssInjected) return
  const el = document.createElement('style')
  el.textContent = LEAFLET_DARK_CSS
  document.head.appendChild(el)
  darkCssInjected = true
}

// ─────────────────────────────────────────────────────────────────────────────

export function MapView() {
  const {
    nodes, selectedNodeId,
    setSelectedNode, setFocusedNode,
    updateNodeMetadata,
  } = useGraphStore()

  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<L.Map | null>(null)
  const markersRef   = useRef<Map<string, L.Marker>>(new Map())

  const [panelOpen,  setPanelOpen]  = useState(true)
  const [geoStates,  setGeoStates]  = useState<Map<string, GeoState>>(new Map())

  const locationNodes = useMemo(
    () => nodes.filter(n => n.type === 'location'),
    [nodes]
  )

  const plottedNodes   = useMemo(() => locationNodes.filter(n => parseCoords(n.metadata?.coords)), [locationNodes])
  const unplottedNodes = useMemo(() => locationNodes.filter(n => !parseCoords(n.metadata?.coords)), [locationNodes])

  // ── Map initialisation ────────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    injectDarkCss()

    mapRef.current = L.map(containerRef.current, {
      center: [51.5, -0.12],
      zoom: 6,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors © <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20,
    }).addTo(mapRef.current)

    return () => {
      mapRef.current?.remove()
      mapRef.current = null
      markersRef.current.clear()
    }
  }, [])

  // ── Marker management ─────────────────────────────────────────────────────
  useEffect(() => {
    const map = mapRef.current
    if (!map) return

    const liveIds = new Set(locationNodes.map(n => n.id))

    // Remove stale markers
    for (const [id, marker] of markersRef.current) {
      if (!liveIds.has(id)) {
        marker.remove()
        markersRef.current.delete(id)
      }
    }

    const bounds: [number, number][] = []

    for (const node of locationNodes) {
      const coords = parseCoords(node.metadata?.coords)
      if (!coords) continue

      const selected = selectedNodeId === node.id
      const icon = L.divIcon({
        html: makeMarkerHtml(selected, node.riskFlag),
        className: '',
        iconSize: [selected ? 18 : 13, selected ? 18 : 13],
        iconAnchor: [selected ? 9 : 6.5, selected ? 9 : 6.5],
      })

      const existing = markersRef.current.get(node.id)
      if (existing) {
        existing.setLatLng(coords)
        existing.setIcon(icon)
      } else {
        const label = node.metadata?.address ?? node.value
        const marker = L.marker(coords, { icon })
          .addTo(map)
          .bindTooltip(label, { className: 'raven-marker-label', direction: 'top', offset: [0, -4] })
          .on('click', () => {
            setSelectedNode(node.id)
            setFocusedNode(null)
          })
        markersRef.current.set(node.id, marker)
      }

      bounds.push(coords)
    }

    // Fit bounds on first meaningful render
    if (bounds.length > 0 && markersRef.current.size === bounds.length) {
      try { map.fitBounds(bounds, { padding: [48, 48], maxZoom: 13 }) }
      catch { /* no-op if bounds invalid */ }
    }
  }, [locationNodes, selectedNodeId, setSelectedNode, setFocusedNode])

  // Pan to selected marker
  useEffect(() => {
    if (!selectedNodeId || !mapRef.current) return
    const marker = markersRef.current.get(selectedNodeId)
    if (marker) mapRef.current.panTo(marker.getLatLng(), { animate: true, duration: 0.4 })
  }, [selectedNodeId])

  // ── Nominatim geocoding ───────────────────────────────────────────────────
  const geocodeNode = async (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId)
    if (!node) return

    setGeoStates(m => new Map(m).set(nodeId, 'loading'))
    const q = buildGeoQuery(node.metadata, node.value)

    try {
      const resp = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`,
        { headers: { 'Accept': 'application/json' } }
      )
      if (!resp.ok) throw new Error(resp.statusText)
      const data = await resp.json() as { lat: string; lon: string }[]
      if (data.length === 0) throw new Error('Not found')

      const coords = `${parseFloat(data[0].lat).toFixed(6)},${parseFloat(data[0].lon).toFixed(6)}`
      updateNodeMetadata(nodeId, { coords })
      setGeoStates(m => new Map(m).set(nodeId, 'done'))
    } catch {
      setGeoStates(m => new Map(m).set(nodeId, 'error'))
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  const btnStyle = (active?: boolean): React.CSSProperties => ({
    padding: '3px 9px', borderRadius: 'var(--r-sm)',
    fontSize: 11, fontWeight: 500, cursor: 'pointer',
    border: '1px solid var(--border-soft)',
    background: active ? 'var(--accent)' : 'var(--bg-surface)',
    color: active ? '#fff' : 'var(--text-secondary)',
    display: 'flex', alignItems: 'center', gap: 4,
  })

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', overflow: 'hidden' }}>

      {/* ── Left panel: unplotted nodes ─────────────────────────────────────── */}
      {panelOpen && (
        <div style={{
          width: 230, flexShrink: 0, height: '100%',
          background: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-soft)',
          display: 'flex', flexDirection: 'column',
          zIndex: 10,
        }}>
          {/* Header */}
          <div style={{
            padding: '10px 12px 8px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)' }}>
              Location Nodes
            </span>
            <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
              {plottedNodes.length}/{locationNodes.length} plotted
            </span>
          </div>

          {/* Plotted nodes */}
          {plottedNodes.length > 0 && (
            <div style={{ padding: '6px 8px 0' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '4px 4px 4px' }}>
                On map
              </div>
              {plottedNodes.map(node => (
                <button
                  key={node.id}
                  onClick={() => {
                    setSelectedNode(node.id)
                    setFocusedNode(null)
                    const marker = markersRef.current.get(node.id)
                    if (marker && mapRef.current) mapRef.current.panTo(marker.getLatLng(), { animate: true })
                  }}
                  style={{
                    width: '100%', textAlign: 'left',
                    padding: '5px 6px', borderRadius: 'var(--r-sm)',
                    display: 'flex', alignItems: 'center', gap: 6,
                    background: selectedNodeId === node.id ? 'var(--accent-soft)' : 'transparent',
                    border: '1px solid transparent',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { if (selectedNodeId !== node.id) e.currentTarget.style.background = 'var(--bg-hover)' }}
                  onMouseLeave={e => { if (selectedNodeId !== node.id) e.currentTarget.style.background = 'transparent' }}
                >
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#65A30D', flexShrink: 0 }} />
                  <span style={{ fontSize: 11.5, color: selectedNodeId === node.id ? 'var(--accent)' : 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {node.metadata?.address ?? node.value}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Unplotted nodes */}
          {unplottedNodes.length > 0 && (
            <div style={{ padding: '6px 8px 0', flex: 1, overflow: 'auto' }}>
              <div style={{ fontSize: 9, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', padding: '8px 4px 4px' }}>
                Not geocoded
              </div>
              {unplottedNodes.map(node => {
                const gs = geoStates.get(node.id) ?? 'idle'
                return (
                  <div
                    key={node.id}
                    style={{
                      padding: '5px 6px', borderRadius: 'var(--r-sm)',
                      display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2,
                    }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--border-mid)', flexShrink: 0 }} />
                    <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {node.metadata?.address ?? node.value}
                    </span>
                    <button
                      onClick={() => { if (gs === 'idle' || gs === 'error') geocodeNode(node.id) }}
                      disabled={gs === 'loading' || gs === 'done'}
                      title={gs === 'error' ? 'Retry geocode' : 'Geocode via Nominatim'}
                      style={{
                        ...btnStyle(),
                        padding: '2px 6px',
                        flexShrink: 0,
                        color: gs === 'error' ? 'var(--red)' : gs === 'done' ? 'var(--green)' : 'var(--text-tertiary)',
                        opacity: gs === 'loading' ? 0.6 : 1,
                        cursor: (gs === 'loading' || gs === 'done') ? 'default' : 'pointer',
                      }}
                    >
                      {gs === 'loading' && <span style={{ width: 8, height: 8, borderRadius: '50%', border: '1.5px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} />}
                      {gs === 'done'    && '✓'}
                      {gs === 'error'   && '↺'}
                      {gs === 'idle'    && <UIIcon name="location" size={10} />}
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {/* Empty state */}
          {locationNodes.length === 0 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, textAlign: 'center' }}>
              <UIIcon name="location" size={28} style={{ color: 'var(--text-muted)', marginBottom: 10 }} />
              <p style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 4 }}>No location nodes</p>
              <p style={{ fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>Add a location entity with an address or coordinates to plot it here.</p>
            </div>
          )}
        </div>
      )}

      {/* ── Map container ────────────────────────────────────────────────────── */}
      <div style={{ flex: 1, position: 'relative' }}>

        {/* Panel toggle */}
        <button
          onClick={() => setPanelOpen(v => !v)}
          title={panelOpen ? 'Collapse panel' : 'Expand panel'}
          style={{
            position: 'absolute', top: 10, left: panelOpen ? -1 : 10, zIndex: 20,
            width: 28, height: 28, borderRadius: 'var(--r-sm)',
            background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
            color: 'var(--text-tertiary)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-tertiary)' }}
        >
          <UIIcon name={panelOpen ? 'chevronLeft' : 'chevronRight'} size={13} />
        </button>

        {/* Stats pill */}
        <div style={{
          position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
          borderRadius: 'var(--r-md)', padding: '4px 12px',
          fontSize: 11, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.3)', zIndex: 20, whiteSpace: 'nowrap',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ color: '#65A30D', fontWeight: 600 }}>{plottedNodes.length}</span>
          <span>plotted</span>
          {unplottedNodes.length > 0 && (
            <>
              <span style={{ color: 'var(--border-mid)' }}>·</span>
              <span>{unplottedNodes.length} need geocoding</span>
            </>
          )}
        </div>

        {/* Fit to markers button */}
        {plottedNodes.length > 0 && (
          <button
            onClick={() => {
              const map = mapRef.current
              if (!map) return
              const pts = plottedNodes.map(n => parseCoords(n.metadata?.coords)).filter(Boolean) as [number, number][]
              if (pts.length > 0) map.fitBounds(pts, { padding: [48, 48], maxZoom: 13 })
            }}
            title="Fit all markers"
            style={{
              position: 'absolute', bottom: 90, left: '50%', transform: 'translateX(-50%)',
              background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
              borderRadius: 'var(--r-md)', padding: '5px 12px',
              fontSize: 11.5, color: 'var(--text-secondary)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)', zIndex: 20,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-secondary)' }}
          >
            <UIIcon name="crosshair" size={12} />
            Fit all
          </button>
        )}

        {/* The map */}
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />

        {/* No-locations overlay */}
        {plottedNodes.length === 0 && (
          <div style={{
            position: 'absolute', inset: 0, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none', zIndex: 5,
          }}>
            <div style={{
              background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
              borderRadius: 'var(--r-lg)', padding: '24px 32px',
              textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              animation: 'fadeIn 0.2s ease',
            }}>
              <UIIcon name="location" size={28} style={{ color: 'var(--text-muted)', display: 'block', margin: '0 auto 12px' }} />
              <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>No locations to plot</p>
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
                {unplottedNodes.length > 0
                  ? `${unplottedNodes.length} location node${unplottedNodes.length !== 1 ? 's' : ''} need geocoding — use the panel to add coordinates.`
                  : 'Add location nodes with a "coords" field (lat,lng) or use the geocode button.'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
