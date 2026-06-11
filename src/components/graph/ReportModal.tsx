import { useState } from 'react'
import { useGraphStore } from '../../store/graphStore'
import { useSettingsStore } from '../../store/settingsStore'
import { ENTITY_CONFIG, RISK_COLORS } from '../../types/graph'
import { UIIcon } from '../../icons/UIIcon'
import { buildSTIXBundle, downloadSTIX } from '../../lib/stix'
import { downloadReportPdf } from '../../api/reports'
import { logAuditEvent } from '../../api/audit'
import { fetchProjectEvidence } from '../../api/evidence'
import type { EvidenceCapture } from '../../api/evidence'

interface ReportModalProps {
  projectName: string
  caseRef: string
  classification: string
  onClose: () => void
}

function pad(n: number) { return String(n).padStart(2, '0') }

// Escape every character that can break out of an HTML context.
// Applied to every user-controlled string injected into the report HTML.
function h(s: string | undefined | null): string {
  if (!s) return ''
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/`/g, '&#x60;')
}

function fmtDate(iso: string) {
  const d = new Date(iso)
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function buildReportHTML(
  nodes: ReturnType<typeof useGraphStore.getState>['nodes'],
  edges: ReturnType<typeof useGraphStore.getState>['edges'],
  caseNotes: string,
  projectName: string,
  caseRef: string,
  classification: string,
  analystName: string,
): string {
  const now = fmtDate(new Date().toISOString())

  const typeCounts: Record<string, number> = {}
  nodes.forEach(n => { typeCounts[n.type] = (typeCounts[n.type] ?? 0) + 1 })

  const highRisk   = nodes.filter(n => n.riskFlag === 'HIGH')
  const mediumRisk = nodes.filter(n => n.riskFlag === 'MEDIUM')
  const suspects   = nodes.filter(n => n.actionFlag === 'suspect')
  const victims    = nodes.filter(n => n.actionFlag === 'victim')

  const classColor = classification.includes('SECRET') ? '#dc2626'
    : classification.includes('SENSITIVE') ? '#d97706'
    : '#16a34a'

  const rowStyle = 'padding:6px 10px;border-bottom:1px solid #e5e7eb;font-size:12px;'
  const thStyle  = 'padding:6px 10px;background:#f3f4f6;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;border-bottom:1px solid #d1d5db;'

  const entityRows = Object.entries(typeCounts).map(([type, count]) => {
    const cfg = ENTITY_CONFIG[type as keyof typeof ENTITY_CONFIG]
    return `<tr>
      <td style="${rowStyle}"><span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${cfg?.color ?? '#888'};margin-right:6px;"></span>${cfg?.label ?? type}</td>
      <td style="${rowStyle};text-align:right;font-family:monospace;">${count}</td>
    </tr>`
  }).join('')

  const riskRow = (nodes: typeof highRisk, color: string, label: string) =>
    nodes.map(n => `<tr>
      <td style="${rowStyle};color:${color};font-weight:600;">${label}</td>
      <td style="${rowStyle};">${h(ENTITY_CONFIG[n.type]?.label ?? n.type)}</td>
      <td style="${rowStyle};font-family:monospace;">${h(n.value)}</td>
      <td style="${rowStyle};color:#6b7280;font-size:11px;">${n.addedAt ? fmtDate(n.addedAt) : '—'}</td>
      <td style="${rowStyle};color:#6b7280;">${h(n.addedBy)}</td>
    </tr>`).join('')

  const allEntityRows = [...nodes]
    .sort((a, b) => (a.type < b.type ? -1 : a.type > b.type ? 1 : 0))
    .map(n => `<tr>
      <td style="${rowStyle}"><span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${ENTITY_CONFIG[n.type]?.color ?? '#888'};margin-right:5px;"></span>${h(ENTITY_CONFIG[n.type]?.label ?? n.type)}</td>
      <td style="${rowStyle};font-family:monospace;word-break:break-all;">${h(n.value)}</td>
      <td style="${rowStyle};color:${n.riskFlag !== 'NONE' ? RISK_COLORS[n.riskFlag] : '#9ca3af'};">${n.riskFlag !== 'NONE' ? n.riskFlag : '—'}</td>
      <td style="${rowStyle};color:#6b7280;font-size:11px;">${n.note ? h(n.note.slice(0, 60)) + (n.note.length > 60 ? '…' : '') : '—'}</td>
      <td style="${rowStyle};color:#6b7280;font-size:11px;">${n.addedAt ? fmtDate(n.addedAt) : '—'}</td>
    </tr>`).join('')

  const nodeIndex = new Map(nodes.map(n => [n.id, n]))
  const edgeRows = edges.map(e => {
    const src = nodeIndex.get(e.source)
    const tgt = nodeIndex.get(e.target)
    return `<tr>
      <td style="${rowStyle};font-family:monospace;word-break:break-all;">${h(src?.value ?? e.source)}</td>
      <td style="${rowStyle};color:#6b7280;text-align:center;">→</td>
      <td style="${rowStyle};font-family:monospace;word-break:break-all;">${h(tgt?.value ?? e.target)}</td>
      <td style="${rowStyle};color:#6b7280;">${h(e.label ?? '')}</td>
    </tr>`
  }).join('')

  return `<!DOCTYPE html><html lang="en"><head>
<meta charset="UTF-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; script-src 'unsafe-inline';">
<title>Intelligence Report — ${h(projectName)}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Segoe UI', Arial, sans-serif; color: #111827; background: #fff; }
  .page { max-width: 900px; margin: 0 auto; padding: 40px 48px; }
  h1 { font-size: 20px; font-weight: 700; }
  h2 { font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #374151; margin: 28px 0 10px; padding-bottom: 5px; border-bottom: 1.5px solid #e5e7eb; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
  th { ${thStyle} text-align: left; }
  .classification { display: inline-block; padding: 3px 10px; border-radius: 4px; background: ${classColor}1a; border: 1px solid ${classColor}55; color: ${classColor}; font-size: 10px; font-weight: 700; letter-spacing: 0.08em; font-family: monospace; }
  .meta { display: flex; gap: 24px; align-items: center; margin: 12px 0 20px; flex-wrap: wrap; }
  .meta-item { font-size: 12px; color: #6b7280; }
  .meta-item strong { color: #111827; }
  .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 8px; }
  .stat-box { border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px 14px; }
  .stat-num { font-size: 22px; font-weight: 700; color: #111827; font-family: monospace; }
  .stat-label { font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.06em; margin-top: 2px; }
  .notes { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 6px; padding: 14px 16px; font-size: 12.5px; line-height: 1.7; white-space: pre-wrap; color: #374151; }
  .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 10.5px; color: #9ca3af; display: flex; justify-content: space-between; }
  @media print {
    .no-print { display: none !important; }
    body { background: #fff; }
    .page { padding: 20px; }
    @page { margin: 15mm; }
  }
</style>
</head><body>
<div class="page">
  <!-- Print button (hidden in print) -->
  <div class="no-print" style="display:flex;gap:8px;justify-content:flex-end;margin-bottom:24px;">
    <button onclick="window.print()" style="padding:7px 16px;border-radius:6px;background:#1d4ed8;color:#fff;border:none;font-size:13px;font-weight:500;cursor:pointer;">
      ⬇ Print / Save PDF
    </button>
    <button onclick="window.close()" style="padding:7px 14px;border-radius:6px;background:#f3f4f6;color:#374151;border:1px solid #d1d5db;font-size:13px;cursor:pointer;">
      Close
    </button>
  </div>

  <!-- Header -->
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;">
    <div>
      <div style="font-size:10px;font-weight:700;letter-spacing:0.12em;color:#9ca3af;margin-bottom:6px;">INTELLIGENCE REPORT</div>
      <h1>${h(projectName)}</h1>
    </div>
    <span class="classification">${h(classification)}</span>
  </div>

  <div class="meta">
    <div class="meta-item"><strong>Case Reference</strong><br>${h(caseRef)}</div>
    <div class="meta-item"><strong>Analyst</strong><br>${h(analystName)}</div>
    <div class="meta-item"><strong>Generated</strong><br>${now}</div>
    <div class="meta-item"><strong>Nodes / Edges</strong><br>${nodes.length} / ${edges.length}</div>
  </div>

  <!-- Summary stats -->
  <h2>Summary</h2>
  <div class="stat-grid">
    <div class="stat-box"><div class="stat-num">${nodes.length}</div><div class="stat-label">Total Entities</div></div>
    <div class="stat-box"><div class="stat-num" style="color:#dc2626">${highRisk.length}</div><div class="stat-label">High Risk</div></div>
    <div class="stat-box"><div class="stat-num" style="color:#d97706">${mediumRisk.length}</div><div class="stat-label">Medium Risk</div></div>
    <div class="stat-box"><div class="stat-num">${suspects.length + victims.length}</div><div class="stat-label">Flagged Roles</div></div>
  </div>

  <table style="margin-top:12px;max-width:340px;">
    <tr><th>Entity type</th><th style="${thStyle}text-align:right;">Count</th></tr>
    ${entityRows}
  </table>

  <!-- High-risk entities -->
  ${highRisk.length + mediumRisk.length > 0 ? `
  <h2>Flagged Entities</h2>
  <table>
    <tr>
      <th>Risk</th><th>Type</th><th>Value</th><th>Added</th><th>Analyst</th>
    </tr>
    ${riskRow(highRisk, '#dc2626', 'HIGH')}
    ${riskRow(mediumRisk, '#d97706', 'MEDIUM')}
  </table>` : ''}

  <!-- All entities -->
  <h2>Entity Inventory (${nodes.length})</h2>
  <table>
    <tr><th>Type</th><th>Value</th><th>Risk</th><th>Note</th><th>Added</th></tr>
    ${allEntityRows}
  </table>

  <!-- Relationships -->
  ${edges.length > 0 ? `
  <h2>Relationships (${edges.length})</h2>
  <table>
    <tr><th>Source</th><th style="${thStyle}text-align:center;"></th><th>Target</th><th>Label</th></tr>
    ${edgeRows}
  </table>` : ''}

  <!-- Case notes -->
  ${caseNotes.trim() ? `
  <h2>Case Notes</h2>
  <div class="notes">${h(caseNotes)}</div>` : ''}

  <div class="footer">
    <span>Generated by Raven · ${now}</span>
    <span>${h(classification)} — Handle according to policy</span>
  </div>
</div>
</body></html>`
}

export function ReportModal({ projectName, caseRef, classification, onClose }: ReportModalProps) {
  const { nodes, edges, caseNotes, activeProjectId } = useGraphStore()
  const { analystName } = useSettingsStore()
  const [pdfState, setPdfState] = useState<'idle' | 'loading' | 'error'>('idle')
  const [pdfError, setPdfError] = useState('')

  const handleExportSTIX = async () => {
    const slug = projectName.replace(/[^a-z0-9]/gi, '-').toLowerCase()
    let evidenceCaptures: EvidenceCapture[] = []
    if (activeProjectId) {
      try { evidenceCaptures = await fetchProjectEvidence(activeProjectId) } catch { /* ignore */ }
    }
    const bundle = buildSTIXBundle(nodes, edges, { projectName, caseRef, classification, analystName, evidenceCaptures })
    downloadSTIX(bundle, `${slug}.stix2.json`)
    logAuditEvent({ project_id: activeProjectId, event_type: 'export:stix' })
  }

  const handleDownloadPDF = async () => {
    if (!activeProjectId || pdfState === 'loading') return
    setPdfState('loading')
    setPdfError('')
    try {
      const slug = projectName.replace(/[^a-z0-9]/gi, '-').toLowerCase()
      await downloadReportPdf(activeProjectId, slug)
      setPdfState('idle')
    } catch (err) {
      setPdfState('error')
      setPdfError(err instanceof Error ? err.message : 'PDF generation failed')
    }
  }

  const handlePreviewHTML = () => {
    const html = buildReportHTML(nodes, edges, caseNotes, projectName, caseRef, classification, analystName)
    const w = window.open('', '_blank', 'width=960,height=800')
    if (!w) return
    w.document.open()
    w.document.write(html)
    w.document.close()
  }

  const handleExportJSON = () => {
    const data = {
      schema: 'raven-v1',
      exportedAt: new Date().toISOString(),
      project: { name: projectName, caseRef, classification },
      nodes, edges, caseNotes,
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = Object.assign(document.createElement('a'), {
      href: url,
      download: `${projectName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.raven.json`,
    })
    a.click()
    URL.revokeObjectURL(url)
  }

  const typeCounts: Record<string, number> = {}
  nodes.forEach(n => { typeCounts[n.type] = (typeCounts[n.type] ?? 0) + 1 })
  const highCount   = nodes.filter(n => n.riskFlag === 'HIGH').length
  const medCount    = nodes.filter(n => n.riskFlag === 'MEDIUM').length

  const btnBase: React.CSSProperties = {
    padding: '8px 18px', borderRadius: 'var(--r-md)', fontSize: 13,
    fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 500,
      animation: 'fadeIn var(--dur-normal) var(--ease-out-quart) both',
    }} onClick={onClose}>
      <div
        style={{
          background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
          borderRadius: 'var(--r-xl)', padding: '24px 28px', width: 520,
          boxShadow: '0 8px 40px rgba(0,0,0,0.35)',
          animation: 'fadeIn var(--dur-normal) var(--ease-out-quart) both',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 4 }}>
              Export
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Investigation Report</h2>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-tertiary)', cursor: 'pointer', padding: 4, borderRadius: 'var(--r-sm)' }}>
            <UIIcon name="close" size={15} />
          </button>
        </div>

        {/* Stats preview */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
          {[
            { label: 'Entities', value: nodes.length, color: 'var(--text-primary)' },
            { label: 'Edges',    value: edges.length,  color: 'var(--text-primary)' },
            { label: 'High Risk', value: highCount,   color: 'var(--red)' },
            { label: 'Med Risk',  value: medCount,    color: 'var(--amber)' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: 'var(--bg-raised)', borderRadius: 'var(--r-md)', padding: '10px 12px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color, fontFamily: 'var(--font-mono)' }}>{value}</div>
              <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Entity type breakdown */}
        <div style={{ marginBottom: 20, maxHeight: 160, overflowY: 'auto' }}>
          {Object.entries(typeCounts).map(([type, count]) => {
            const cfg = ENTITY_CONFIG[type as keyof typeof ENTITY_CONFIG]
            return (
              <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg?.color ?? '#888', flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 12, color: 'var(--text-secondary)' }}>{cfg?.label ?? type}</span>
                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>{count}</span>
              </div>
            )
          })}
        </div>

        {/* PDF error */}
        {pdfState === 'error' && (
          <div style={{
            background: 'rgba(224,82,82,0.08)', border: '1px solid rgba(224,82,82,0.25)',
            borderRadius: 'var(--r-md)', padding: '8px 12px', marginBottom: 8,
            fontSize: 12, color: 'var(--red)',
          }}>
            {pdfError || 'PDF generation failed — ensure the graph is saved to the backend first.'}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <button
            onClick={handleDownloadPDF}
            disabled={!activeProjectId || pdfState === 'loading'}
            style={{
              ...btnBase,
              background: 'var(--accent)', color: 'var(--bg-base)', border: 'none', flex: 1,
              opacity: !activeProjectId || pdfState === 'loading' ? 0.6 : 1,
              cursor: !activeProjectId || pdfState === 'loading' ? 'default' : 'pointer',
            }}
            onMouseEnter={e => { if (activeProjectId && pdfState !== 'loading') e.currentTarget.style.filter = 'brightness(1.1)' }}
            onMouseLeave={e => { e.currentTarget.style.filter = '' }}
          >
            <UIIcon name="downloadFilled" size={14} />
            {pdfState === 'loading' ? 'Generating PDF…' : 'Download PDF Report'}
          </button>
          <button
            onClick={handlePreviewHTML}
            title="Open HTML preview in new tab"
            style={{ ...btnBase, background: 'var(--bg-raised)', color: 'var(--text-secondary)', border: '1px solid var(--border-soft)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-overlay)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-raised)' }}
          >
            <UIIcon name="report" size={14} />
            Preview
          </button>
          <button
            onClick={handleExportJSON}
            style={{ ...btnBase, background: 'var(--bg-raised)', color: 'var(--text-secondary)', border: '1px solid var(--border-soft)' }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-overlay)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-raised)' }}
          >
            <UIIcon name="downloadFilled" size={14} />
            JSON
          </button>
        </div>

        <button
          onClick={handleExportSTIX}
          disabled={nodes.length === 0}
          style={{
            ...btnBase, width: '100%', justifyContent: 'center',
            background: 'var(--bg-raised)', color: nodes.length === 0 ? 'var(--text-muted)' : 'var(--text-secondary)',
            border: '1px solid var(--border-soft)', opacity: nodes.length === 0 ? 0.5 : 1,
          }}
          onMouseEnter={e => { if (nodes.length > 0) e.currentTarget.style.background = 'var(--bg-overlay)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--bg-raised)' }}
        >
          <UIIcon name="downloadFilled" size={14} />
          Export STIX 2.1 Bundle
          <span style={{
            marginLeft: 6, fontSize: 9.5, fontFamily: 'var(--font-mono)',
            background: 'var(--accent-soft)', color: 'var(--accent)',
            padding: '1px 5px', borderRadius: 3, fontWeight: 600,
          }}>
            .stix2.json
          </span>
        </button>

        <p style={{ fontSize: 10.5, color: 'var(--text-tertiary)', marginTop: 10, textAlign: 'center' }}>
          STIX 2.1 compatible with MISP · OpenCTI · Maltego · TAXII feeds
        </p>
      </div>
    </div>
  )
}
