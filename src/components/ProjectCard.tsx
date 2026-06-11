import React, { useState, useEffect, useRef } from 'react'
import type { Project } from '../types/project'
import { RiskBadge, ClassificationBadge, StatusDot } from './ui/Badge'
import { UIIcon } from '../icons/UIIcon'

interface ProjectCardProps {
  project: Project
  index: number
  onOpen: (project: Project) => void
  onEdit: (project: Project) => void
  onDelete: (project: Project) => void
  onArchive: (project: Project) => void
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(mins / 60)
  const days  = Math.floor(hours / 24)
  if (mins < 60)  return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

const ENTITY_COLORS: Record<string, string> = {
  ip: '#388BFD', domain: '#3FB87A', email: '#D29922',
  person: '#A371F7', org: '#F85149', phone: '#8B949E',
  wallet: '#E3B341', url: '#56C2E6',
}

const ENTITY_LABELS: Record<string, string> = {
  ip: 'IP', domain: 'DOM', email: 'EMAIL', person: 'PER',
  org: 'ORG', phone: 'TEL', wallet: 'WALLET', url: 'URL',
}

function MenuItem({
  icon, label, color, onClick, danger,
}: { icon: string; label: string; color?: string; onClick: () => void; danger?: boolean }) {
  const [hov, setHov] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 8,
        padding: '7px 10px', border: 'none', borderRadius: 'var(--r-sm)',
        background: hov ? (danger ? 'rgba(248,81,73,0.1)' : 'var(--bg-hover)') : 'transparent',
        color: hov && danger ? 'var(--red)' : (color ?? 'var(--text-secondary)'),
        fontSize: 12.5, cursor: 'pointer', textAlign: 'left',
        transition: 'all 0.1s',
      }}
    >
      <UIIcon name={icon} size={13} />
      {label}
    </button>
  )
}

export function ProjectCard({ project, index, onOpen, onEdit, onDelete, onArchive }: ProjectCardProps) {
  const [hovered, setHovered] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
        setConfirmDelete(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const topEntities = Object.entries(project.entityCounts)
    .filter(([, count]) => (count ?? 0) > 0)
    .sort(([, a], [, b]) => (b ?? 0) - (a ?? 0))
    .slice(0, 4)

  const isArchived = project.status === 'closed'

  return (
    <article
      onClick={() => { if (!menuOpen) onOpen(project) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        background: hovered ? 'var(--bg-raised)' : 'var(--bg-surface)',
        border: `1px solid ${hovered ? 'var(--border-mid)' : 'var(--border-subtle)'}`,
        borderRadius: 'var(--r-lg)',
        padding: '16px 18px',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        boxShadow: hovered ? '0 4px 12px rgba(0,0,0,0.5)' : 'none',
        animation: `fadeUp 0.2s ease both`,
        animationDelay: `${index * 0.04}s`,
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        opacity: isArchived ? 0.65 : 1,
      }}
    >
      {/* Top accent line on hover */}
      {hovered && !isArchived && (
        <span style={{
          position: 'absolute', top: 0, left: 16, right: 16, height: 1,
          background: 'linear-gradient(90deg, transparent, var(--accent), transparent)',
          borderRadius: 1,
        }} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
          <StatusDot status={project.status} />
          <h3 style={{
            fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            letterSpacing: '-0.01em',
          }}>
            {project.name}
          </h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <ClassificationBadge level={project.classification} />
          <RiskBadge level={project.riskLevel} />

          {/* Action menu button */}
          <div ref={menuRef} style={{ position: 'relative' }}>
            <button
              title="More actions"
              onClick={(e) => {
                e.stopPropagation()
                setMenuOpen((v) => !v)
                setConfirmDelete(false)
              }}
              style={{
                width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: 'var(--r-xs)',
                background: menuOpen ? 'var(--bg-overlay)' : 'transparent',
                border: menuOpen ? '1px solid var(--border-mid)' : '1px solid transparent',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
                opacity: hovered || menuOpen ? 1 : 0,
                transition: 'all 0.12s',
                fontSize: 14, fontWeight: 700, letterSpacing: '0.05em',
                lineHeight: 1,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-overlay)' }}
              onMouseLeave={(e) => {
                if (!menuOpen) {
                  e.currentTarget.style.color = 'var(--text-tertiary)'
                  e.currentTarget.style.background = 'transparent'
                }
              }}
            >
              ···
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  position: 'absolute', top: 28, right: 0, zIndex: 50,
                  width: 168,
                  background: 'var(--bg-raised)',
                  border: '1px solid var(--border-mid)',
                  borderRadius: 'var(--r-md)',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
                  padding: '4px',
                  animation: 'fadeIn 0.1s ease',
                }}
              >
                <MenuItem
                  icon="settings"
                  label="Edit details"
                  onClick={() => { setMenuOpen(false); onEdit(project) }}
                />
                <MenuItem
                  icon={isArchived ? 'arrowRight' : 'close'}
                  label={isArchived ? 'Reopen' : 'Archive'}
                  onClick={() => { setMenuOpen(false); onArchive(project) }}
                />
                <div style={{ height: 1, background: 'var(--border-subtle)', margin: '4px 0' }} />

                {/* Delete with confirmation */}
                {!confirmDelete ? (
                  <MenuItem
                    icon="close"
                    label="Delete"
                    danger
                    onClick={() => setConfirmDelete(true)}
                  />
                ) : (
                  <div style={{ padding: '4px 6px' }}>
                    <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginBottom: 6, fontWeight: 500 }}>
                      Delete permanently?
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        onClick={() => { setMenuOpen(false); setConfirmDelete(false); onDelete(project) }}
                        style={{
                          flex: 1, padding: '5px', borderRadius: 'var(--r-xs)',
                          background: 'var(--red)', border: 'none',
                          color: '#fff', fontSize: 11.5, fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => setConfirmDelete(false)}
                        style={{
                          flex: 1, padding: '5px', borderRadius: 'var(--r-xs)',
                          background: 'var(--bg-overlay)', border: '1px solid var(--border-soft)',
                          color: 'var(--text-secondary)', fontSize: 11.5, cursor: 'pointer',
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Case ref + type */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {project.caseRef && (
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-tertiary)' }}>
            {project.caseRef}
          </span>
        )}
        {project.caseRef && <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--border-mid)', flexShrink: 0 }} />}
        <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)' }}>{project.investigationType}</span>
        {isArchived && (
          <span style={{
            padding: '1px 6px', borderRadius: 'var(--r-xs)',
            background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)',
            fontSize: 9.5, fontWeight: 600, color: 'var(--text-tertiary)', letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}>
            Archived
          </span>
        )}
      </div>

      {/* Entity pills */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
        {topEntities.map(([type, count]) => (
          <span key={type} style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            padding: '2px 7px', borderRadius: 'var(--r-xs)',
            background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)',
            fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono)',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: ENTITY_COLORS[type] ?? 'var(--text-secondary)', flexShrink: 0 }} />
            {ENTITY_LABELS[type]} {count}
          </span>
        ))}
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {project.nodeCount}n · {project.edgeCount}e
        </span>
      </div>

      {/* Last action */}
      {project.lastAction && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          padding: '7px 10px', background: 'var(--bg-base)',
          border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-sm)',
        }}>
          <UIIcon name="clock" size={12} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
          <span style={{ fontSize: 11.5, color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {project.lastAction}
          </span>
          <span style={{ marginLeft: 'auto', fontSize: 10.5, color: 'var(--text-muted)', flexShrink: 0, fontFamily: 'var(--font-mono)' }}>
            {formatRelativeTime(project.updatedAt)}
          </span>
        </div>
      )}

      {/* Hover arrow (not for archived) */}
      {!isArchived && (
        <div style={{
          position: 'absolute', bottom: 14, right: 16,
          color: 'var(--accent)',
          opacity: hovered && !menuOpen ? 1 : 0,
          transition: 'opacity 0.15s, transform 0.15s',
          transform: hovered ? 'translateX(0)' : 'translateX(-4px)',
        }}>
          <UIIcon name="arrowRight" size={15} />
        </div>
      )}
    </article>
  )
}
