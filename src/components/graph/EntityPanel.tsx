import React, { useState, useEffect, useRef } from 'react'
import { useGraphStore } from '../../store/graphStore'
import type { TransformHistoryEntry } from '../../store/graphStore'
import { ENTITY_CONFIG, RISK_COLORS, CONFIDENCE_CONFIG } from '../../types/graph'
import type { RiskFlag, ActionFlag, Confidence } from '../../types/graph'
import { UIIcon } from '../../icons/UIIcon'
import {
  fetchTransforms,
  runTransform,
  applyTransformResult,
  UpgradeRequiredError,
} from '../../api/transforms'
import type { Transform, ResultNode } from '../../api/transforms'
import { fetchNodeEvidence } from '../../api/evidence'
import type { EvidenceCapture } from '../../api/evidence'
import { AttachmentsSection } from './AttachmentsSection'
import { useWatchStore, type WatchInterval, INTERVAL_LABELS } from '../../store/watchStore'

const RISK_OPTIONS: { value: RiskFlag; label: string; color: string }[] = [
  { value: 'HIGH',   label: 'High',   color: 'var(--red)'   },
  { value: 'MEDIUM', label: 'Medium', color: 'var(--amber)' },
  { value: 'LOW',    label: 'Low',    color: 'var(--green)' },
  { value: 'NONE',   label: 'None',   color: 'var(--text-tertiary)' },
]

const ACTION_OPTIONS: { value: ActionFlag; label: string }[] = [
  { value: 'suspect',   label: 'Suspect'   },
  { value: 'victim',    label: 'Victim'    },
  { value: 'witness',   label: 'Witness'   },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'unknown',   label: 'Unknown'   },
]

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })
}

const METADATA_LABELS: Record<string, string> = {
  sortCode:     'Sort code',
  accountNo:    'Account no.',
  bankName:     'Bank',
  fingerprint:  'SHA-256',
  issuer:       'Issuer',
  cn:           'Common name',
  platform:     'Platform',
  jurisdiction: 'Jurisdiction',
  regNo:        'Reg. number',
  amount:       'Amount',
  currency:     'Currency',
  date:         'Date',
  channel:      'Channel',
  reference:    'Reference',
  provider:     'Provider',
  abuseEmail:   'Abuse email',
  urgency:      'Urgency',
  status:       'Status',
  address:      'Address',
  postcode:     'Postcode',
  city:         'City',
  country:      'Country',
  coords:       'Coordinates',
  reportType:   'Source',
  reportedDate: 'Reported',
  caseStatus:   'Case status',
  force:        'Force',
}

function generateAbuseReport(node: { value: string; metadata?: Record<string, string>; addedBy: string }): string {
  const meta = node.metadata ?? {}
  const today = new Date().toISOString().split('T')[0]
  const urgency = meta.urgency ?? 'High'
  const provider = meta.provider ?? '[Hosting Provider]'
  const abuseEmail = meta.abuseEmail ?? '[abuse@provider.com]'
  return `To: ${abuseEmail}
Subject: Abuse Report — Fraudulent resource: ${node.value}

Dear ${provider} Abuse Team,

I am writing to report a resource hosted on your infrastructure that has been
identified as being actively used to facilitate financial fraud and/or phishing.

TARGET: ${node.value}
URGENCY: ${urgency}
DATE: ${today}
ANALYST: ${node.addedBy}

DESCRIPTION
-----------
The above resource was identified during an active fraud investigation. It is
being used to facilitate criminal activity causing financial harm to victims.
We request immediate suspension and preservation of logs for law enforcement.

ACTION REQUESTED
----------------
1. Suspend or remove the resource listed above immediately
2. Preserve all associated server logs, access logs, and account records
3. Confirm receipt and action taken via reply to this email

This report is submitted in support of an active investigation. Supporting
evidence and a formal law enforcement request can be provided upon request.

Yours sincerely,
${node.addedBy}
Analyst Reference: ${node.value}`
}

// ─── Transform run result state ───────────────────────────────────────────────

interface RunState {
  running: boolean
  addedCount: number | null
  addedNodes: ResultNode[]
  error: string | null
}

const initialRunState = (): RunState => ({
  running: false,
  addedCount: null,
  addedNodes: [],
  error: null,
})

// ─── Category badge colours (consistent across sessions) ─────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  'Infrastructure':     'var(--accent)',
  'Threat Intelligence':'var(--red)',
  'Financial':          'var(--green)',
  'Identity':           'var(--purple)',
  'General':            'var(--text-tertiary)',
}

function categoryColor(cat: string): string {
  return CATEGORY_COLORS[cat] ?? 'var(--accent)'
}

// ─────────────────────────────────────────────────────────────────────────────

interface EntityPanelProps {
  onViewMap?: () => void
}

export function EntityPanel({ onViewMap }: EntityPanelProps) {
  const {
    nodes, selectedNodeId, focusedNodeId, activeProjectId,
    setSelectedNode, setFocusedNode, updateNodeRisk, updateNodeAction, updateNodeNote,
    updateNodeConfidence,
    addNode, addEdge, transformHistory, recordTransformRun,
  } = useGraphStore()

  const [activeTab, setActiveTab]     = useState<'properties' | 'transforms' | 'evidence'>('properties')
  const [editingNote, setEditingNote] = useState(false)
  const [noteValue, setNoteValue]     = useState('')
  const [reportCopied, setReportCopied] = useState(false)

  // ── Transform Hub state ────────────────────────────────────────────────────
  const [transforms, setTransforms]         = useState<Transform[]>([])
  const [transformsLoading, setTransformsLoading] = useState(false)
  const [transformsError, setTransformsError]     = useState<string | null>(null)
  const [runStates, setRunStates] = useState<Record<string, RunState>>({})
  const [apiKeys, setApiKeys]     = useState<Record<string, string>>({})

  // ── Evidence state ─────────────────────────────────────────────────────────
  const [evidence, setEvidence]               = useState<EvidenceCapture[]>([])
  const [evidenceLoading, setEvidenceLoading] = useState(false)
  const evidenceFetchedRef = useRef<string | null>(null)

  // ── Watch state ────────────────────────────────────────────────────────────
  const { addWatch, removeWatch, isWatching } = useWatchStore()
  const [watchOpen, setWatchOpen] = useState<string | null>(null) // slug of open watch picker
  const [watchInterval, setWatchInterval] = useState<WatchInterval>(24)
  const WATCH_INTERVALS: WatchInterval[] = [6, 12, 24, 48, 168]

  const fetchedRef = useRef(false)

  // Fetch transforms once on mount
  useEffect(() => {
    if (fetchedRef.current) return
    fetchedRef.current = true
    setTransformsLoading(true)
    fetchTransforms()
      .then(setTransforms)
      .catch((e: unknown) => {
        setTransformsError(
          e instanceof Error ? e.message : 'Backend unavailable',
        )
      })
      .finally(() => setTransformsLoading(false))
  }, [])

  // Reset UI when selection changes
  useEffect(() => {
    setActiveTab('properties')
    setEditingNote(false)
    setRunStates({})
    setEvidence([])
    evidenceFetchedRef.current = null
  }, [selectedNodeId])

  const node = nodes.find((n) => n.id === selectedNodeId)

  // Fetch evidence when evidence tab is opened (lazy, once per node)
  useEffect(() => {
    if (activeTab !== 'evidence' || !node || !activeProjectId) return
    const key = `${activeProjectId}:${node.id}`
    if (evidenceFetchedRef.current === key) return
    evidenceFetchedRef.current = key
    setEvidenceLoading(true)
    fetchNodeEvidence(activeProjectId, node.id)
      .then(setEvidence)
      .finally(() => setEvidenceLoading(false))
  }, [activeTab, node, activeProjectId])

  if (!node) return null

  const cfg = ENTITY_CONFIG[node.type]

  const nodeTransforms = transforms.filter(t => t.accepts.includes(node.type))

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleSaveNote = () => {
    updateNodeNote(node.id, noteValue)
    setEditingNote(false)
  }

  const handleRunTransform = async (t: Transform) => {
    setRunStates(prev => ({ ...prev, [t.slug]: { ...initialRunState(), running: true } }))
    try {
      const result = await runTransform(
        t.slug, node.value, apiKeys[t.slug] || undefined,
        activeProjectId ?? undefined, node.id, node.type,
      )
      // Invalidate cached evidence so the tab refreshes on next open
      evidenceFetchedRef.current = null
      if (result.error) throw new Error(result.error)

      const addedCount = applyTransformResult(
        result,
        node.id,
        t.name,
        addNode,
        addEdge,
        nodes,
      )
      recordTransformRun(node.id, { slug: t.slug, name: t.name, ranAt: new Date().toISOString(), addedCount })
      setRunStates(prev => ({
        ...prev,
        [t.slug]: { running: false, addedCount, addedNodes: result.nodes, error: null },
      }))
    } catch (e: unknown) {
      const error = e instanceof UpgradeRequiredError
        ? '⬆ Pro plan required — upgrade at raven.app/pricing'
        : e instanceof Error ? e.message : 'Transform failed'
      setRunStates(prev => ({
        ...prev,
        [t.slug]: { running: false, addedCount: null, addedNodes: [], error },
      }))
    }
  }

  const handleRetryFetch = () => {
    setTransformsError(null)
    setTransformsLoading(true)
    fetchTransforms()
      .then(setTransforms)
      .catch((e: unknown) => setTransformsError(e instanceof Error ? e.message : 'Backend unavailable'))
      .finally(() => setTransformsLoading(false))
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <aside
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: 'absolute', top: 0, right: 0, bottom: 0,
        width: 292, zIndex: 20,
        display: 'flex', flexDirection: 'column',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(22px)',
        WebkitBackdropFilter: 'blur(22px)',
        borderLeft: '1px solid var(--glass-border)',
        boxShadow: 'var(--glass-shadow)',
        animation: 'slideInRight var(--dur-slow) var(--ease-out-expo) both',
      }}
    >

      {/* ── Header ── */}
      <div style={{ padding: '14px 16px 12px', borderBottom: '1px solid var(--glass-border)', flexShrink: 0, background: 'var(--glass-inner)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: cfg.color, flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {cfg.label}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <button
              onClick={() => setFocusedNode(focusedNodeId === node.id ? null : node.id)}
              title={focusedNodeId === node.id ? 'Exit focus (Esc)' : 'Focus node (F)'}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                padding: '2px 6px', borderRadius: 'var(--r-xs)', cursor: 'pointer',
                border: `1px solid ${focusedNodeId === node.id ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
                background: focusedNodeId === node.id ? 'var(--accent-soft)' : 'transparent',
                color: focusedNodeId === node.id ? 'var(--accent)' : 'var(--text-tertiary)',
                fontSize: 10, fontWeight: 600, letterSpacing: '0.04em', transition: 'all 0.12s',
              }}
              onMouseEnter={(e) => { if (focusedNodeId !== node.id) { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent-border)' } }}
              onMouseLeave={(e) => { if (focusedNodeId !== node.id) { e.currentTarget.style.color = 'var(--text-tertiary)'; e.currentTarget.style.borderColor = 'var(--border-subtle)' } }}
            >
              <UIIcon name="crosshair" size={11} />
              {focusedNodeId === node.id ? 'Focused' : 'Focus'}
            </button>
            <button
              onClick={() => setSelectedNode(null)}
              style={{ color: 'var(--text-tertiary)', display: 'flex', padding: 2, borderRadius: 'var(--r-xs)', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)' }}
            >
              <UIIcon name="close" size={13} />
            </button>
          </div>
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12.5, color: 'var(--text-primary)', wordBreak: 'break-all', lineHeight: 1.5, marginBottom: 10 }}>
          {node.value}
        </div>

        {/* Risk selector */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 6 }}>
          {RISK_OPTIONS.map((r) => (
            <button key={r.value} onClick={() => updateNodeRisk(node.id, r.value)} style={{
              flex: 1, padding: '4px 0', borderRadius: 'var(--r-xs)',
              border: `1px solid ${node.riskFlag === r.value ? r.color + '66' : 'var(--border-subtle)'}`,
              background: node.riskFlag === r.value ? r.color + '18' : 'var(--bg-raised)',
              color: node.riskFlag === r.value ? r.color : 'var(--text-tertiary)',
              fontSize: 10, fontWeight: 600, cursor: 'pointer', transition: 'all 0.1s',
            }}>
              {r.label}
            </button>
          ))}
        </div>

        {/* Confidence selector */}
        <div style={{ display: 'flex', gap: 3 }}>
          {(Object.entries(CONFIDENCE_CONFIG) as [Confidence, typeof CONFIDENCE_CONFIG[Confidence]][]).map(([key, conf]) => {
            const active = (node.confidence ?? 'ungraded') === key
            return (
              <button
                key={key}
                onClick={() => updateNodeConfidence(node.id, key)}
                title={conf.label}
                style={{
                  flex: 1, padding: '3px 0', borderRadius: 'var(--r-xs)',
                  border: `1px solid ${active ? conf.color + '66' : 'var(--border-subtle)'}`,
                  background: active ? conf.color + '18' : 'var(--bg-raised)',
                  color: active ? conf.color : 'var(--text-muted)',
                  fontSize: 9, fontWeight: 700, cursor: 'pointer', transition: 'all 0.1s',
                  letterSpacing: '0.04em',
                }}
              >
                {conf.short}
              </button>
            )
          })}
        </div>
        <div style={{ fontSize: 9, color: 'var(--text-muted)', marginTop: 3, letterSpacing: '0.03em' }}>
          {CONFIDENCE_CONFIG[node.confidence ?? 'ungraded'].label} confidence
        </div>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', flexShrink: 0, background: 'var(--glass-inner)' }}>
        {(['properties', 'transforms', 'evidence'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            flex: 1, padding: '9px 0', fontSize: 11.5, fontWeight: 500,
            color: activeTab === tab ? 'var(--accent)' : 'var(--text-tertiary)',
            borderBottom: `2px solid ${activeTab === tab ? 'var(--accent)' : 'transparent'}`,
            textTransform: 'capitalize', cursor: 'pointer', transition: 'all 0.12s', background: 'none',
          }}>
            {tab}
            {tab === 'transforms' && nodeTransforms.length > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 15, height: 15, borderRadius: '50%',
                background: activeTab === 'transforms' ? 'var(--accent)' : 'var(--bg-overlay)',
                color: activeTab === 'transforms' ? '#fff' : 'var(--text-tertiary)',
                fontSize: 8.5, fontWeight: 700, marginLeft: 5, verticalAlign: 'middle',
              }}>
                {nodeTransforms.length}
              </span>
            )}
            {tab === 'evidence' && evidence.length > 0 && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 15, height: 15, borderRadius: '50%',
                background: activeTab === 'evidence' ? 'var(--accent)' : 'var(--bg-overlay)',
                color: activeTab === 'evidence' ? '#fff' : 'var(--text-tertiary)',
                fontSize: 8.5, fontWeight: 700, marginLeft: 5, verticalAlign: 'middle',
              }}>
                {evidence.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>

        {/* ── Properties tab ── */}
        {activeTab === 'properties' && (
          <>
            {/* Role */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>
                Role
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {ACTION_OPTIONS.map((a) => (
                  <button key={a.value} onClick={() => updateNodeAction(node.id, a.value)} style={{
                    padding: '3px 9px', borderRadius: 'var(--r-xs)',
                    border: `1px solid ${node.actionFlag === a.value ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
                    background: node.actionFlag === a.value ? 'var(--accent-soft)' : 'var(--bg-raised)',
                    color: node.actionFlag === a.value ? 'var(--accent)' : 'var(--text-tertiary)',
                    fontSize: 11, cursor: 'pointer', transition: 'all 0.1s',
                  }}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Structured metadata */}
            {node.metadata && Object.keys(node.metadata).length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>
                  Details
                </div>
                {Object.entries(node.metadata).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', gap: 8, padding: '4px 0', borderBottom: '1px solid var(--glass-border)', fontSize: 11.5 }}>
                    <span style={{ color: 'var(--text-tertiary)', minWidth: 72, flexShrink: 0 }}>{METADATA_LABELS[key] ?? key}</span>
                    <span style={{ color: 'var(--text-secondary)', wordBreak: 'break-all', fontFamily: 'var(--font-mono)', fontSize: 11 }}>{val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Location — view on map shortcut */}
            {node.type === 'location' && onViewMap && (
              <div style={{ marginBottom: 16 }}>
                <button
                  onClick={onViewMap}
                  style={{
                    width: '100%', padding: '8px 0', borderRadius: 'var(--r-sm)',
                    background: 'var(--accent-soft)', border: '1px solid var(--accent-border)',
                    color: 'var(--accent)', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = '#fff' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent-soft)'; e.currentTarget.style.color = 'var(--accent)' }}
                >
                  <UIIcon name="map" size={13} />
                  View on map
                </button>
              </div>
            )}

            {/* Takedown — abuse report generator */}
            {node.type === 'takedown' && (
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                    Abuse report
                  </div>
                  <button
                    onClick={() => {
                      const report = generateAbuseReport(node)
                      navigator.clipboard.writeText(report).then(() => {
                        setReportCopied(true)
                        setTimeout(() => setReportCopied(false), 2000)
                      })
                    }}
                    style={{
                      fontSize: 10.5, padding: '2px 8px', borderRadius: 'var(--r-xs)', cursor: 'pointer',
                      background: reportCopied ? 'var(--green-soft)' : cfg.color + '18',
                      color: reportCopied ? 'var(--green)' : cfg.color,
                      border: `1px solid ${reportCopied ? 'var(--green-border)' : cfg.color + '44'}`,
                      transition: 'all 0.15s', fontWeight: 600,
                    }}
                  >
                    {reportCopied ? '✓ Copied' : 'Copy report'}
                  </button>
                </div>
                <div style={{
                  padding: '8px 10px', borderRadius: 'var(--r-md)',
                  background: 'var(--bg-base)', border: `1px solid ${cfg.color}22`,
                  fontFamily: 'var(--font-mono)', fontSize: 9.5, color: 'var(--text-tertiary)',
                  whiteSpace: 'pre-wrap', lineHeight: 1.6, maxHeight: 140, overflowY: 'auto',
                }}>
                  {generateAbuseReport(node)}
                </div>
              </div>
            )}

            {/* Provenance */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>
                Provenance
              </div>
              {[
                { label: 'Added',  value: formatDate(node.addedAt) },
                { label: 'By',     value: node.addedBy },
                { label: 'Source', value: node.sourceUrl ?? 'Manual entry' },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', gap: 8, padding: '4px 0', borderBottom: '1px solid var(--glass-border)', fontSize: 11.5 }}>
                  <span style={{ color: 'var(--text-tertiary)', minWidth: 52, flexShrink: 0 }}>{label}</span>
                  <span style={{ color: 'var(--text-secondary)', wordBreak: 'break-all', fontFamily: label === 'Source' ? 'var(--font-mono)' : 'inherit', fontSize: label === 'Source' ? 10.5 : 11.5 }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Analyst note */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 7 }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>
                  Analyst note
                </div>
                <button
                  onClick={() => { setEditingNote(true); setNoteValue(node.note ?? '') }}
                  style={{ fontSize: 10.5, color: 'var(--accent)', cursor: 'pointer' }}
                >
                  {node.note ? 'Edit' : 'Add note'}
                </button>
              </div>
              {editingNote ? (
                <div>
                  <textarea
                    autoFocus value={noteValue}
                    onChange={(e) => setNoteValue(e.target.value)}
                    rows={3}
                    style={{
                      width: '100%', padding: '8px', resize: 'vertical',
                      background: 'var(--bg-base)', border: '1px solid var(--accent-border)',
                      borderRadius: 'var(--r-sm)', color: 'var(--text-primary)',
                      fontSize: 12, outline: 'none', lineHeight: 1.5,
                    }}
                  />
                  <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                    <button onClick={handleSaveNote} style={{ fontSize: 11.5, color: 'var(--accent)', cursor: 'pointer' }}>Save</button>
                    <button onClick={() => setEditingNote(false)} style={{ fontSize: 11.5, color: 'var(--text-tertiary)', cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: 12, color: node.note ? 'var(--text-secondary)' : 'var(--text-tertiary)', fontStyle: node.note ? 'normal' : 'italic', lineHeight: 1.6 }}>
                  {node.note ?? 'No note added'}
                </p>
              )}
            </div>

            {/* Attachments */}
            <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border-subtle)' }}>
              <AttachmentsSection nodeId={node.id} />
            </div>
          </>
        )}

        {/* ── Transforms tab ── */}
        {activeTab === 'transforms' && (
          <div>
            {/* Loading */}
            {transformsLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '16px 0', color: 'var(--text-tertiary)', fontSize: 12 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', border: '2px solid var(--accent)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite', flexShrink: 0 }} />
                Connecting to Transform Hub…
              </div>
            )}

            {/* Backend error */}
            {!transformsLoading && transformsError && (
              <div style={{ paddingTop: 4 }}>
                <div style={{
                  padding: '10px 12px', borderRadius: 'var(--r-md)',
                  background: 'var(--red-soft)', border: '1px solid var(--red-border)',
                  marginBottom: 12,
                }}>
                  <div style={{ fontSize: 11.5, color: 'var(--red)', fontWeight: 600, marginBottom: 4 }}>
                    Backend unavailable
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
                    {transformsError}
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
                    Start the Transform Hub with:
                    <code style={{ display: 'block', marginTop: 4, padding: '4px 8px', background: 'var(--bg-base)', borderRadius: 'var(--r-xs)', fontFamily: 'var(--font-mono)' }}>
                      uvicorn app.main:app --reload
                    </code>
                  </div>
                </div>
                <button
                  onClick={handleRetryFetch}
                  style={{
                    width: '100%', padding: '8px 0', borderRadius: 'var(--r-sm)',
                    background: 'var(--bg-raised)', border: '1px solid var(--border-soft)',
                    color: 'var(--text-secondary)', fontSize: 12, cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)' }}
                >
                  ↺  Retry connection
                </button>
              </div>
            )}

            {/* No transforms for this type */}
            {!transformsLoading && !transformsError && nodeTransforms.length === 0 && (
              <p style={{ fontSize: 12, color: 'var(--text-tertiary)', fontStyle: 'italic', lineHeight: 1.6, paddingTop: 4 }}>
                No transforms available for {cfg.label.toLowerCase()} nodes.
              </p>
            )}

            {/* Transform history */}
            {(() => {
              const nodeHistory: TransformHistoryEntry[] = transformHistory[node.id] ?? []
              if (nodeHistory.length === 0) return null
              return (
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 7 }}>
                    Run history
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    {[...nodeHistory].reverse().map((entry, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', borderRadius: 'var(--r-xs)', background: 'var(--bg-base)', fontSize: 11 }}>
                        <span style={{ color: 'var(--accent)', flexShrink: 0 }}>↺</span>
                        <span style={{ color: 'var(--text-secondary)', flex: 1, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{entry.name}</span>
                        <span style={{ color: entry.addedCount > 0 ? 'var(--green)' : 'var(--text-tertiary)', flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: 10.5 }}>
                          +{entry.addedCount}
                        </span>
                        <span style={{ color: 'var(--text-muted)', flexShrink: 0, fontFamily: 'var(--font-mono)', fontSize: 9.5 }}>
                          {new Date(entry.ranAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })()}

            {/* Transform cards */}
            {!transformsLoading && !transformsError && nodeTransforms.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {nodeTransforms.map((t) => {
                  const rs = runStates[t.slug]
                  const catColor = categoryColor(t.category)

                  return (
                    <div
                      key={t.slug}
                      style={{
                        padding: '11px 12px',
                        borderRadius: 'var(--r-md)',
                        background: 'var(--bg-base)',
                        border: '1px solid var(--border-subtle)',
                      }}
                    >
                      {/* Name row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', flex: 1, minWidth: 0 }}>
                          {t.name}
                        </span>
                        {/* Category badge */}
                        <span style={{
                          fontSize: 9, fontWeight: 700, padding: '1px 6px',
                          borderRadius: 'var(--r-xs)',
                          background: catColor + '18', color: catColor,
                          border: `1px solid ${catColor}33`,
                          textTransform: 'uppercase', letterSpacing: '0.05em',
                          flexShrink: 0,
                        }}>
                          {t.category}
                        </span>
                        {/* Tier badge */}
                        <span style={{
                          fontSize: 9, fontWeight: 700, padding: '1px 5px',
                          borderRadius: 'var(--r-xs)',
                          background: t.tier === 'pro' ? 'var(--amber-soft)' : 'var(--green-soft)',
                          color: t.tier === 'pro' ? 'var(--amber)' : 'var(--green)',
                          border: `1px solid ${t.tier === 'pro' ? 'var(--amber-border)' : 'var(--green-border)'}`,
                          letterSpacing: '0.05em',
                          flexShrink: 0,
                        }}>
                          {t.tier.toUpperCase()}
                        </span>
                      </div>

                      {/* Description */}
                      <p style={{ fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.5, marginBottom: 9 }}>
                        {t.description}
                      </p>

                      {/* API key input (only for key-required transforms) */}
                      {t.requires_key && (
                        <div style={{ marginBottom: 8 }}>
                          <input
                            type="password"
                            value={apiKeys[t.slug] ?? ''}
                            onChange={(e) => setApiKeys(prev => ({ ...prev, [t.slug]: e.target.value }))}
                            placeholder="API key"
                            style={{
                              width: '100%', padding: '6px 9px',
                              background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
                              borderRadius: 'var(--r-sm)', color: 'var(--text-primary)',
                              fontSize: 11.5, fontFamily: 'var(--font-mono)', outline: 'none',
                            }}
                            onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--accent-border)' }}
                            onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-soft)' }}
                          />
                        </div>
                      )}

                      {/* Run button */}
                      <button
                        onClick={() => handleRunTransform(t)}
                        disabled={rs?.running ?? false}
                        style={{
                          width: '100%', padding: '7px 0', borderRadius: 'var(--r-sm)',
                          background: (rs?.running) ? 'var(--bg-overlay)' : 'var(--accent)',
                          color: (rs?.running) ? 'var(--text-tertiary)' : '#fff',
                          fontSize: 11.5, fontWeight: 600, cursor: (rs?.running) ? 'not-allowed' : 'pointer',
                          border: 'none', transition: 'all 0.12s',
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                        }}
                        onMouseEnter={(e) => { if (!rs?.running) e.currentTarget.style.opacity = '0.88' }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1' }}
                      >
                        {rs?.running ? (
                          <>
                            <div style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid var(--text-tertiary)', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
                            Running…
                          </>
                        ) : (
                          <>
                            <UIIcon name="arrowRight" size={12} />
                            {rs?.addedCount !== null ? 'Run again' : 'Run transform'}
                          </>
                        )}
                      </button>

                      {/* Watch button + interval picker */}
                      {(() => {
                        const watching = node && isWatching(node.id, t.slug)
                        return (
                          <div style={{ marginTop: 5 }}>
                            {watching ? (
                              <button
                                onClick={() => removeWatch(
                                  useWatchStore.getState().entries.find(
                                    e => e.nodeId === node?.id && e.transformSlug === t.slug
                                  )?.id ?? ''
                                )}
                                style={{
                                  width: '100%', padding: '5px 0', borderRadius: 'var(--r-sm)',
                                  background: 'rgba(99,102,241,0.08)',
                                  border: '1px solid rgba(99,102,241,0.3)',
                                  color: 'var(--accent)', fontSize: 11, fontWeight: 600,
                                  cursor: 'pointer',
                                }}
                              >
                                👁 Watching — click to stop
                              </button>
                            ) : watchOpen === t.slug ? (
                              <div style={{
                                padding: '8px 10px', borderRadius: 'var(--r-sm)',
                                background: 'var(--bg-surface)', border: '1px solid var(--border-soft)',
                              }}
                                onClick={e => e.stopPropagation()}
                              >
                                <div style={{ fontSize: 10.5, color: 'var(--text-tertiary)', marginBottom: 6 }}>
                                  Recheck interval
                                </div>
                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>
                                  {WATCH_INTERVALS.map(iv => (
                                    <button
                                      key={iv}
                                      onClick={() => setWatchInterval(iv)}
                                      style={{
                                        padding: '3px 7px', borderRadius: 4, fontSize: 10.5,
                                        fontWeight: 600, cursor: 'pointer',
                                        background: watchInterval === iv ? 'var(--accent)' : 'var(--bg-raised)',
                                        color: watchInterval === iv ? '#fff' : 'var(--text-secondary)',
                                        border: watchInterval === iv ? 'none' : '1px solid var(--border-subtle)',
                                      }}
                                    >
                                      {iv < 24 ? `${iv}h` : iv === 168 ? '1w' : `${iv / 24}d`}
                                    </button>
                                  ))}
                                </div>
                                <div style={{ display: 'flex', gap: 5 }}>
                                  <button
                                    onClick={() => {
                                      if (!node) return
                                      addWatch({
                                        nodeId: node.id,
                                        nodeValue: node.value,
                                        nodeType: node.type,
                                        transformSlug: t.slug,
                                        transformName: t.name,
                                        intervalHours: watchInterval,
                                        enabled: true,
                                        requiresKey: t.requires_key,
                                      }, t.requires_key ? apiKeys[t.slug] : undefined)
                                      setWatchOpen(null)
                                    }}
                                    style={{
                                      flex: 1, padding: '5px 0', borderRadius: 4,
                                      background: 'var(--accent)', color: 'var(--bg-base)',
                                      border: 'none', fontSize: 11.5, fontWeight: 700, cursor: 'pointer',
                                    }}
                                  >
                                    Start watching
                                  </button>
                                  <button
                                    onClick={() => setWatchOpen(null)}
                                    style={{
                                      padding: '5px 9px', borderRadius: 4, cursor: 'pointer',
                                      background: 'var(--bg-raised)', border: '1px solid var(--border-subtle)',
                                      fontSize: 11, color: 'var(--text-secondary)',
                                    }}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setWatchOpen(t.slug)}
                                style={{
                                  width: '100%', padding: '5px 0', borderRadius: 'var(--r-sm)',
                                  background: 'transparent', border: '1px solid var(--border-subtle)',
                                  color: 'var(--text-tertiary)', fontSize: 11, fontWeight: 500,
                                  cursor: 'pointer',
                                }}
                                onMouseEnter={e => {
                                  (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-raised)'
                                  ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)'
                                }}
                                onMouseLeave={e => {
                                  (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
                                  ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-tertiary)'
                                }}
                              >
                                👁 Watch this transform
                              </button>
                            )}
                          </div>
                        )
                      })()}

                      {/* Error state */}
                      {rs?.error && (
                        <div style={{
                          marginTop: 8, padding: '6px 9px', borderRadius: 'var(--r-sm)',
                          background: 'var(--red-soft)', border: '1px solid var(--red-border)',
                          fontSize: 11, color: 'var(--red)', fontFamily: 'var(--font-mono)',
                        }}>
                          {rs.error}
                        </div>
                      )}

                      {/* Success state */}
                      {!rs?.running && rs?.addedCount !== null && !rs?.error && (
                        <div style={{ marginTop: 8 }}>
                          <div style={{ fontSize: 11, color: 'var(--green)', fontWeight: 600, marginBottom: rs.addedNodes.length > 0 ? 6 : 0 }}>
                            ✓ {rs.addedCount === 0
                              ? 'No new nodes — all already in graph'
                              : `${rs.addedCount} node${rs.addedCount !== 1 ? 's' : ''} added to graph`}
                          </div>
                          {/* Show added node values */}
                          {rs.addedNodes.length > 0 && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                              {rs.addedNodes.slice(0, 6).map((rn, i) => {
                                const nodeCfg = ENTITY_CONFIG[rn.type as keyof typeof ENTITY_CONFIG]
                                return (
                                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ width: 5, height: 5, borderRadius: '50%', background: nodeCfg?.color ?? 'var(--text-tertiary)', flexShrink: 0 }} />
                                    <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {rn.value}
                                    </span>
                                  </div>
                                )
                              })}
                              {rs.addedNodes.length > 6 && (
                                <span style={{ fontSize: 10, color: 'var(--text-tertiary)', paddingLeft: 11 }}>
                                  +{rs.addedNodes.length - 6} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Evidence tab ── */}
        {activeTab === 'evidence' && (
          <div>
            {evidenceLoading ? (
              <div style={{ color: 'var(--text-tertiary)', fontSize: 12, textAlign: 'center', paddingTop: 32 }}>
                Loading evidence…
              </div>
            ) : evidence.length === 0 ? (
              <div style={{ color: 'var(--text-tertiary)', fontSize: 12, textAlign: 'center', paddingTop: 32, lineHeight: 1.7 }}>
                No evidence captured yet.
                <br />
                <span style={{ fontSize: 11 }}>Run a transform to capture evidence.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {evidence.map(ev => (
                  <div key={ev.id} style={{
                    background: 'var(--bg-raised)', borderRadius: 'var(--r-sm)',
                    padding: '10px 12px', border: '1px solid var(--border-subtle)',
                  }}>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
                      {ev.transform_name}
                    </div>
                    <div style={{ fontSize: 10.5, color: 'var(--text-tertiary)', marginBottom: 6 }}>
                      {new Date(ev.captured_at).toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' })}
                    </div>
                    {ev.screenshot_b64 && (
                      <img
                        src={`data:image/png;base64,${ev.screenshot_b64}`}
                        alt="Page screenshot"
                        style={{ width: '100%', borderRadius: 4, marginBottom: 6, border: '1px solid var(--border-subtle)' }}
                      />
                    )}
                    <div style={{
                      fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--text-muted)',
                      wordBreak: 'break-all', background: 'var(--bg-overlay)', padding: '4px 6px',
                      borderRadius: 3, marginBottom: 6,
                    }}>
                      {ev.sha256}
                    </div>
                    <button
                      onClick={() => {
                        const blob = new Blob([ev.result_json], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = Object.assign(document.createElement('a'), {
                          href: url,
                          download: `evidence-${ev.id.slice(0, 8)}.json`,
                        })
                        a.click()
                        URL.revokeObjectURL(url)
                      }}
                      style={{
                        width: '100%', padding: '4px 0', borderRadius: 'var(--r-xs)',
                        fontSize: 10.5, cursor: 'pointer', background: 'transparent',
                        border: '1px solid var(--border-subtle)', color: 'var(--text-tertiary)',
                      }}
                    >
                      Download raw JSON
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}
