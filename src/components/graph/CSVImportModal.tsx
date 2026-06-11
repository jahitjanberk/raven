import React, { useState, useCallback, useRef } from 'react'
import type { EntityType, RiskFlag } from '../../types/graph'
import { ENTITY_CONFIG } from '../../types/graph'
import { useGraphStore } from '../../store/graphStore'
import { UIIcon } from '../../icons/UIIcon'

interface ParsedRow {
  type: string
  value: string
  note?: string
  riskFlag: RiskFlag
  error?: string
}

const VALID_TYPES = new Set(Object.keys(ENTITY_CONFIG))
const VALID_RISKS = new Set(['HIGH', 'MEDIUM', 'LOW', 'NONE'])

function parseCSV(text: string): { rows: ParsedRow[]; headerError?: string } {
  const clean = text.replace(/^﻿/, '').replace(/\r/g, '')
  const lines = clean.split('\n').filter(l => l.trim())
  if (lines.length === 0) return { rows: [], headerError: 'File is empty' }
  if (lines.length < 2) return { rows: [], headerError: 'No data rows found (header only)' }

  const header = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, '').toLowerCase())
  const typeIdx  = header.indexOf('type')
  const valueIdx = header.indexOf('value')
  const noteIdx  = header.indexOf('note')
  const riskIdx  = header.indexOf('riskflag')

  if (typeIdx === -1 || valueIdx === -1) {
    return { rows: [], headerError: 'CSV must have "type" and "value" columns' }
  }

  const rows: ParsedRow[] = []
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(',').map(c => c.trim().replace(/^["']|["']$/g, ''))
    const rawType  = cols[typeIdx]?.toLowerCase() ?? ''
    const rawValue = cols[valueIdx] ?? ''
    const note     = noteIdx !== -1 && cols[noteIdx] ? cols[noteIdx] : undefined
    const rawRisk  = riskIdx !== -1 ? (cols[riskIdx]?.toUpperCase() || '') : ''
    const riskFlag: RiskFlag = VALID_RISKS.has(rawRisk) ? rawRisk as RiskFlag : 'NONE'

    const error = !VALID_TYPES.has(rawType)
      ? `Unknown type "${rawType || '(empty)'}"`
      : !rawValue
      ? 'Missing value'
      : undefined

    rows.push({ type: rawType, value: rawValue, note, riskFlag, error })
  }

  return { rows }
}

interface CSVImportModalProps {
  onClose: () => void
}

export function CSVImportModal({ onClose }: CSVImportModalProps) {
  const { addNode, updateNodeRisk } = useGraphStore()
  const [phase, setPhase] = useState<'upload' | 'preview'>('upload')
  const [rows, setRows] = useState<ParsedRow[]>([])
  const [headerError, setHeaderError] = useState<string | undefined>()
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState<string | undefined>()
  const [imported, setImported] = useState<number | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback((file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      setHeaderError('File must be a .csv')
      return
    }
    setFileName(file.name)
    const reader = new FileReader()
    reader.onload = e => {
      const text = (e.target?.result as string) ?? ''
      const { rows: parsed, headerError: err } = parseCSV(text)
      setHeaderError(err)
      setRows(parsed)
      if (!err) setPhase('preview')
    }
    reader.readAsText(file)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }, [handleFile])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const handleReset = () => {
    setPhase('upload')
    setRows([])
    setHeaderError(undefined)
    setFileName(undefined)
  }

  const validRows = rows.filter(r => !r.error)
  const errorCount = rows.length - validRows.length

  const handleImport = () => {
    for (const row of validRows) {
      const node = addNode(row.type as EntityType, row.value, row.note)
      if (row.riskFlag !== 'NONE') updateNodeRisk(node.id, row.riskFlag)
    }
    setImported(validRows.length)
  }

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 400,
        background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'fadeIn var(--dur-normal) var(--ease-out-quart) both',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div style={{
        background: 'var(--bg-raised)', border: '1px solid var(--border-soft)',
        borderRadius: 'var(--r-lg)', width: 580, maxHeight: '82vh',
        display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.35)',
      }}>

        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', padding: '15px 18px',
          borderBottom: '1px solid var(--border-subtle)', flexShrink: 0, gap: 10,
        }}>
          <UIIcon name="uploadFilled" size={15} style={{ color: 'var(--accent)' }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>
            Import CSV
          </span>
          <button onClick={onClose} style={{ color: 'var(--text-tertiary)', display: 'flex', padding: 4, cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)' }}
          >
            <UIIcon name="close" size={14} />
          </button>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>

          {imported !== null ? (
            /* ── Success ── */
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'var(--green-soft)', border: '1px solid var(--green-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', fontSize: 22, color: 'var(--green)',
              }}>✓</div>
              <p style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
                {imported} node{imported !== 1 ? 's' : ''} added to graph
              </p>
              {errorCount > 0 && (
                <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)', marginBottom: 4 }}>
                  {errorCount} row{errorCount !== 1 ? 's' : ''} skipped due to errors
                </p>
              )}
              <button
                onClick={onClose}
                style={{
                  marginTop: 22, padding: '8px 22px', borderRadius: 'var(--r-md)',
                  background: 'var(--accent)', color: 'var(--bg-base)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
                  border: 'none',
                }}
              >
                Done
              </button>
            </div>

          ) : phase === 'upload' ? (
            /* ── Upload ── */
            <>
              {/* Format hint */}
              <div style={{
                marginBottom: 16, padding: '10px 14px', borderRadius: 'var(--r-md)',
                background: 'var(--bg-base)', border: '1px solid var(--border-subtle)',
                fontSize: 11.5, fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)', lineHeight: 1.8,
              }}>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Columns: </span>
                  type, value[, note][, riskFlag]
                </div>
                <div style={{ marginBottom: 4 }}>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Types: </span>
                  ip · domain · email · person · org · phone · wallet · url
                </div>
                <div>
                  <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Risk: </span>
                  HIGH · MEDIUM · LOW · NONE
                </div>
              </div>

              {/* Drop zone */}
              <div
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileRef.current?.click()}
                style={{
                  border: `2px dashed ${dragging ? 'var(--accent)' : 'var(--border-mid)'}`,
                  borderRadius: 'var(--r-md)',
                  padding: '52px 24px',
                  textAlign: 'center',
                  cursor: 'pointer',
                  background: dragging ? 'var(--accent-soft)' : 'transparent',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ color: dragging ? 'var(--accent)' : 'var(--text-tertiary)', display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                  <UIIcon name="uploadFilled" size={30} />
                </div>
                <p style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 5 }}>
                  Drop a CSV file here
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>
                  or click to browse
                </p>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".csv"
                  style={{ display: 'none' }}
                  onChange={handleInputChange}
                />
              </div>

              {headerError && (
                <p style={{ marginTop: 12, fontSize: 12.5, color: 'var(--red)', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <UIIcon name="close" size={12} />
                  {headerError}
                </p>
              )}
            </>

          ) : (
            /* ── Preview ── */
            <>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12, gap: 8 }}>
                <span style={{ fontSize: 12.5, color: 'var(--text-secondary)', flex: 1 }}>
                  <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--text-tertiary)' }}>{fileName}</span>
                  {' '}—{' '}
                  <span style={{ color: 'var(--green)', fontWeight: 500 }}>{validRows.length} valid</span>
                  {errorCount > 0 && (
                    <span style={{ color: 'var(--red)', fontWeight: 500 }}>, {errorCount} error{errorCount !== 1 ? 's' : ''}</span>
                  )}
                </span>
                <button
                  onClick={handleReset}
                  style={{ fontSize: 11.5, color: 'var(--accent)', cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
                >
                  Replace file
                </button>
              </div>

              {/* Preview table */}
              <div style={{ borderRadius: 'var(--r-md)', border: '1px solid var(--border-subtle)', overflow: 'hidden' }}>
                <div style={{ maxHeight: 340, overflowY: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                    <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                      <tr style={{ background: 'var(--bg-base)' }}>
                        {['Type', 'Value', 'Note', 'Risk', ''].map((h, i) => (
                          <th key={i} style={{
                            padding: '7px 10px', textAlign: 'left',
                            fontSize: 10.5, fontWeight: 600, color: 'var(--text-tertiary)',
                            textTransform: 'uppercase', letterSpacing: '0.06em',
                            borderBottom: '1px solid var(--border-subtle)',
                            width: i === 4 ? 24 : undefined,
                          }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((row, i) => {
                        const cfg = ENTITY_CONFIG[row.type as EntityType]
                        const isErr = !!row.error
                        return (
                          <tr
                            key={i}
                            style={{
                              background: isErr ? 'var(--red-soft)' : i % 2 === 0 ? 'transparent' : 'var(--bg-base)',
                            }}
                          >
                            <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
                              {cfg ? (
                                <span style={{ color: cfg.color, fontSize: 11, fontWeight: 600 }}>{cfg.label}</span>
                              ) : (
                                <span style={{ color: 'var(--red)', fontSize: 11 }}>{row.type || '—'}</span>
                              )}
                            </td>
                            <td style={{
                              padding: '6px 10px', borderBottom: '1px solid var(--border-subtle)',
                              fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-primary)',
                              maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {row.value || <span style={{ color: 'var(--text-tertiary)' }}>—</span>}
                            </td>
                            <td style={{
                              padding: '6px 10px', borderBottom: '1px solid var(--border-subtle)',
                              color: 'var(--text-tertiary)', fontSize: 11,
                              maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            }}>
                              {row.note || <span style={{ color: 'var(--border-mid)' }}>—</span>}
                            </td>
                            <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
                              {!isErr && row.riskFlag !== 'NONE' && (
                                <span style={{
                                  fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)',
                                  color: row.riskFlag === 'HIGH' ? 'var(--red)' : row.riskFlag === 'MEDIUM' ? 'var(--amber)' : 'var(--green)',
                                }}>
                                  {row.riskFlag}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: '6px 10px', borderBottom: '1px solid var(--border-subtle)' }}>
                              {isErr && (
                                <span title={row.error} style={{ color: 'var(--red)', display: 'flex', cursor: 'help' }}>
                                  <UIIcon name="close" size={11} />
                                </span>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {errorCount > 0 && (
                <div style={{ marginTop: 10, padding: '8px 12px', borderRadius: 'var(--r-sm)', background: 'var(--red-soft)', border: '1px solid var(--red-border)' }}>
                  <p style={{ fontSize: 11.5, color: 'var(--red)' }}>
                    {errorCount} row{errorCount !== 1 ? 's' : ''} with errors will be skipped.
                    Hover the × icon to see the reason.
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {phase === 'preview' && imported === null && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
            gap: 8, padding: '13px 18px', borderTop: '1px solid var(--border-subtle)', flexShrink: 0,
          }}>
            <button
              onClick={onClose}
              style={{
                padding: '7px 16px', borderRadius: 'var(--r-md)', fontSize: 13,
                color: 'var(--text-secondary)', cursor: 'pointer',
                background: 'var(--bg-base)', border: '1px solid var(--border-soft)',
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              disabled={validRows.length === 0}
              style={{
                padding: '7px 16px', borderRadius: 'var(--r-md)', fontSize: 13, fontWeight: 500,
                cursor: validRows.length === 0 ? 'not-allowed' : 'pointer',
                background: validRows.length === 0 ? 'var(--bg-overlay)' : 'var(--accent)',
                color: validRows.length === 0 ? 'var(--text-tertiary)' : '#fff',
                border: 'none',
              }}
            >
              Import {validRows.length} node{validRows.length !== 1 ? 's' : ''}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
