import React, { useState, useMemo } from 'react'
import { RavenLogo } from '../components/RavenLogo'
import type { Project, RiskLevel } from '../types/project'
import type { Classification, InvestigationType } from '../types/project'
import { useProjectStore } from '../store/projectStore'
import { ProjectCard } from '../components/ProjectCard'
import { NewProjectModal } from '../components/ui/NewProjectModal'
import { EditProjectModal } from '../components/ui/EditProjectModal'
import { Button } from '../components/ui/Button'
import { UIIcon } from '../icons/UIIcon'
import { useTheme } from '../context/ThemeContext'
import { useSettingsStore } from '../store/settingsStore'

type SortKey = 'updatedAt' | 'createdAt' | 'name' | 'nodeCount'
type ViewMode = 'grid' | 'list'

export function ProjectsPage({
  onOpenProject,
  onOpenSettings,
  onLogout,
}: {
  onOpenProject?: (p: Project) => void
  onOpenSettings?: () => void
  onLogout?: () => void
}) {
  const { theme, toggleTheme } = useTheme()
  const { analystName, analystInitials, defaultClassification, defaultInvestigationType } = useSettingsStore()
  const { projects, createProject, updateProject, deleteProject } = useProjectStore()

  const [search, setSearch]           = useState('')
  const [sortBy, setSortBy]           = useState<SortKey>('updatedAt')
  const [filterRisk, setFilterRisk]   = useState<RiskLevel | 'ALL'>('ALL')
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'active' | 'paused'>('ALL')
  const [viewMode, setViewMode]       = useState<ViewMode>('grid')
  const [showModal, setShowModal]     = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

  const archivedCount = useMemo(() => projects.filter(p => p.status === 'closed').length, [projects])

  const filtered = useMemo(() => {
    return projects
      .filter((p) => {
        if (p.status === 'closed' && !showArchived) return false
        if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
            !(p.caseRef?.toLowerCase().includes(search.toLowerCase()))) return false
        if (filterRisk !== 'ALL' && p.riskLevel !== filterRisk) return false
        if (filterStatus !== 'ALL' && p.status !== filterStatus) return false
        return true
      })
      .sort((a, b) => {
        if (sortBy === 'name')      return a.name.localeCompare(b.name)
        if (sortBy === 'nodeCount') return b.nodeCount - a.nodeCount
        if (sortBy === 'updatedAt') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        if (sortBy === 'createdAt') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        return 0
      })
  }, [projects, search, sortBy, filterRisk, filterStatus, showArchived])

  const handleCreate = (data: { name: string; caseRef: string; classification: Classification; investigationType: InvestigationType }) => {
    const newProject: Project = {
      id: `p${Date.now()}`,
      name: data.name,
      caseRef: data.caseRef || undefined,
      classification: data.classification,
      investigationType: data.investigationType,
      status: 'active',
      riskLevel: 'UNKNOWN',
      nodeCount: 0,
      edgeCount: 0,
      entityCounts: {},
      analystInitials,
      analystName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    createProject(newProject)
  }

  const handleArchive = (project: Project) => {
    const next = project.status === 'closed' ? 'active' : 'closed'
    updateProject(project.id, { status: next })
    if (next === 'closed' && !showArchived) {
      // Don't need to do anything — it'll just disappear from the list
    }
  }

  const handleDelete = (project: Project) => {
    deleteProject(project.id)
  }

  const nonClosedCount = projects.filter(p => p.status !== 'closed').length
  const activeCount    = projects.filter(p => p.status === 'active').length

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column' }}>

      {/* Nav bar */}
      <header style={{
        height: 52, flexShrink: 0,
        display: 'flex', alignItems: 'center', padding: '0 24px',
        background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <RavenLogo height={26} />
        <div style={{ flex: 1 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{analystName}</span>
          <div style={{
            width: 30, height: 30, borderRadius: '50%',
            background: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 600, color: 'var(--bg-base)',
          }}>{analystInitials}</div>
          <button
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            style={{ color: 'var(--text-tertiary)', display: 'flex', padding: 4, cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)' }}
          >
            <UIIcon name={theme === 'light' ? 'moon' : 'sun'} size={16} />
          </button>
          <button
            title="Settings"
            onClick={onOpenSettings}
            style={{ color: 'var(--text-tertiary)', display: 'flex', padding: 4, cursor: 'pointer' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)' }}
          >
            <UIIcon name="settings" size={16} />
          </button>
          {onLogout && (
            <button
              title="Sign out"
              onClick={onLogout}
              style={{ color: 'var(--text-tertiary)', display: 'flex', padding: 4, cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--red)' }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-tertiary)' }}
            >
              <UIIcon name="logout" size={16} />
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main style={{ flex: 1, padding: '32px 24px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>

        {/* Page header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 28, animation: 'fadeUp 0.2s ease both' }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)', marginBottom: 5 }}>
              Investigations
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
              {activeCount} active · {nonClosedCount} total
              {archivedCount > 0 && ` · ${archivedCount} archived`}
            </p>
          </div>
          <Button variant="primary" icon="plus" onClick={() => setShowModal(true)}>
            New graph
          </Button>
        </div>

        {/* Toolbar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, flexWrap: 'wrap', animation: 'fadeUp 0.2s ease 0.04s both' }}>

          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--r-md)', padding: '7px 12px',
            flex: '1 1 220px', maxWidth: 320,
          }}>
            <UIIcon name="search" size={14} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or case ref…"
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 12.5 }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ color: 'var(--text-tertiary)', display: 'flex' }}>
                <UIIcon name="close" size={12} />
              </button>
            )}
          </div>

          {/* Risk filter */}
          <div style={{ display: 'flex', gap: 4 }}>
            {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((r) => (
              <button key={r} onClick={() => setFilterRisk(r)} style={{
                padding: '6px 10px', borderRadius: 'var(--r-sm)', cursor: 'pointer',
                border: `1px solid ${filterRisk === r ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
                background: filterRisk === r ? 'var(--accent-soft)' : 'var(--bg-surface)',
                color: filterRisk === r ? 'var(--accent)' : 'var(--text-tertiary)',
                fontSize: 11, fontWeight: 500, transition: 'all 0.12s',
              }}>
                {r}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div style={{ display: 'flex', gap: 4 }}>
            {(['ALL', 'active', 'paused'] as const).map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{
                padding: '6px 10px', borderRadius: 'var(--r-sm)', cursor: 'pointer',
                border: `1px solid ${filterStatus === s ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
                background: filterStatus === s ? 'var(--accent-soft)' : 'var(--bg-surface)',
                color: filterStatus === s ? 'var(--accent)' : 'var(--text-tertiary)',
                fontSize: 11, fontWeight: 500, textTransform: 'capitalize', transition: 'all 0.12s',
              }}>
                {s}
              </button>
            ))}
          </div>

          {/* Show archived toggle */}
          {archivedCount > 0 && (
            <button
              onClick={() => setShowArchived((v) => !v)}
              style={{
                padding: '6px 10px', borderRadius: 'var(--r-sm)', cursor: 'pointer',
                border: `1px solid ${showArchived ? 'var(--border-mid)' : 'var(--border-subtle)'}`,
                background: showArchived ? 'var(--bg-overlay)' : 'var(--bg-surface)',
                color: showArchived ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                fontSize: 11, fontWeight: 500, transition: 'all 0.12s',
                display: 'flex', alignItems: 'center', gap: 5,
              }}
            >
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 16, height: 16, borderRadius: 4,
                background: showArchived ? 'var(--accent)' : 'transparent',
                border: `1px solid ${showArchived ? 'var(--accent)' : 'var(--border-mid)'}`,
                transition: 'all 0.12s',
              }}>
                {showArchived && (
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path d="M1.5 4l2 2 3-3" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              Archived ({archivedCount})
            </button>
          )}

          <div style={{ flex: 1 }} />

          {/* Sort */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <UIIcon name="sort" size={13} style={{ color: 'var(--text-tertiary)' }} />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-sm)', color: 'var(--text-secondary)', fontSize: 12, padding: '5px 8px', cursor: 'pointer', outline: 'none' }}
            >
              <option value="updatedAt">Last updated</option>
              <option value="createdAt">Date created</option>
              <option value="name">Name</option>
              <option value="nodeCount">Node count</option>
            </select>
          </div>

          {/* View toggle */}
          <div style={{ display: 'flex', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-sm)', overflow: 'hidden' }}>
            {(['grid', 'list'] as const).map((m) => (
              <button key={m} onClick={() => setViewMode(m)} title={m === 'grid' ? 'Grid view' : 'List view'} style={{
                width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                background: viewMode === m ? 'var(--bg-overlay)' : 'var(--bg-surface)',
                color: viewMode === m ? 'var(--accent)' : 'var(--text-tertiary)',
                borderLeft: m === 'list' ? '1px solid var(--border-subtle)' : 'none',
                transition: 'all 0.12s',
              }}>
                <UIIcon name={m === 'grid' ? 'grid' : 'list'} size={14} />
              </button>
            ))}
          </div>
        </div>

        {/* Results count when searching */}
        {search && filtered.length > 0 && (
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 16 }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{search}"
          </p>
        )}

        {/* True first-use: no projects at all */}
        {projects.length === 0 ? (
          <div style={{ animation: 'fadeUp 0.25s ease both' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 20px 48px', textAlign: 'center' }}>
              <svg width="160" height="120" viewBox="0 0 160 120" fill="none" aria-hidden="true" style={{ marginBottom: 28 }}>
                <line x1="80" y1="60" x2="32" y2="24"  stroke="var(--border-mid)" strokeWidth="1.2" />
                <line x1="80" y1="60" x2="128" y2="24" stroke="var(--border-mid)" strokeWidth="1.2" />
                <line x1="80" y1="60" x2="128" y2="90" stroke="var(--border-mid)" strokeWidth="1.2" />
                <line x1="80" y1="60" x2="32" y2="90"  stroke="var(--border-mid)" strokeWidth="1.2" />
                <line x1="32" y1="24" x2="128" y2="24" stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="4 3" />
                <polygon points="126,24 120,21 120,27" fill="var(--border-mid)" />
                <circle cx="80" cy="60" r="18" fill="rgba(163,113,247,0.10)" stroke="#A371F7" strokeWidth="1.8" />
                <text x="80" y="64" textAnchor="middle" fontSize="8.5" fill="#A371F7" fontFamily="monospace" fontWeight="600">PERSON</text>
                <circle cx="32"  cy="24" r="13" fill="rgba(56,139,253,0.10)"  stroke="#388BFD" strokeWidth="1.5" />
                <text x="32"  y="28" textAnchor="middle" fontSize="7.5" fill="#388BFD" fontFamily="monospace" fontWeight="600">IP</text>
                <circle cx="128" cy="24" r="13" fill="rgba(63,184,122,0.10)"  stroke="#3FB87A" strokeWidth="1.5" />
                <text x="128" y="28" textAnchor="middle" fontSize="7.5" fill="#3FB87A" fontFamily="monospace" fontWeight="600">DOMAIN</text>
                <circle cx="128" cy="90" r="13" fill="rgba(210,153,34,0.10)"  stroke="#D29922" strokeWidth="1.5" />
                <text x="128" y="94" textAnchor="middle" fontSize="7.5" fill="#D29922" fontFamily="monospace" fontWeight="600">EMAIL</text>
                <circle cx="32"  cy="90" r="13" fill="rgba(248,81,73,0.10)"   stroke="#F85149" strokeWidth="1.5" />
                <text x="32"  y="94" textAnchor="middle" fontSize="7.5" fill="#F85149" fontFamily="monospace" fontWeight="600">ORG</text>
                <circle cx="80" cy="60" r="26" fill="none" stroke="#A371F7" strokeWidth="1" opacity="0.2" strokeDasharray="5 3" />
              </svg>
              <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10, letterSpacing: '-0.02em' }}>Welcome to Raven</h2>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', maxWidth: 440, lineHeight: 1.7, marginBottom: 28 }}>
                Your intelligence graph workspace. Map entity networks, enrich indicators with OSINT data, and build shareable investigation reports.
              </p>
              <Button variant="primary" icon="plus" onClick={() => setShowModal(true)}>Create first investigation</Button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, maxWidth: 720, margin: '0 auto', padding: '0 0 64px' }}>
              {[
                { icon: 'node',           title: 'Graph canvas',     desc: 'Drag, connect and explore entity relationships on a live graph with pan and zoom.',         color: 'var(--accent)'  },
                { icon: 'search',         title: 'OSINT enrichment', desc: 'Enrich IPs, domains, emails and wallets with automated threat intelligence lookups.',        color: 'var(--green)'   },
                { icon: 'downloadFilled', title: 'Export & classify', desc: 'Export graph snapshots as PNG with classification markings and risk flags applied.',         color: 'var(--purple)'  },
              ].map(({ icon, title, desc, color }) => (
                <div key={title} style={{ padding: '20px 18px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--r-lg)' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 'var(--r-md)', background: color + '14', border: `1px solid ${color}28`, display: 'flex', alignItems: 'center', justifyContent: 'center', color, marginBottom: 12 }}>
                    <UIIcon name={icon} size={16} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>{title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>

        ) : filtered.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '72px 20px', gap: 10, animation: 'fadeIn 0.15s ease' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-surface)', border: '1px dashed var(--border-mid)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-tertiary)' }}>
              <UIIcon name="search" size={18} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)' }}>No matching investigations</p>
            <p style={{ fontSize: 12.5, color: 'var(--text-tertiary)' }}>Try adjusting your search or filters</p>
            <button
              onClick={() => { setSearch(''); setFilterRisk('ALL'); setFilterStatus('ALL') }}
              style={{ marginTop: 6, padding: '6px 14px', borderRadius: 'var(--r-md)', background: 'var(--bg-surface)', border: '1px solid var(--border-soft)', fontSize: 12, color: 'var(--text-secondary)', cursor: 'pointer' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-overlay)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-surface)' }}
            >
              Clear all filters
            </button>
          </div>

        ) : (
          <div style={{
            display: viewMode === 'grid' ? 'grid' : 'flex',
            gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
            flexDirection: 'column',
            gap: 12,
          }}>
            {filtered.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                onOpen={(p) => onOpenProject?.(p)}
                onEdit={(p) => setEditingProject(p)}
                onDelete={handleDelete}
                onArchive={handleArchive}
              />
            ))}
          </div>
        )}
      </main>

      {showModal && (
        <NewProjectModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
          defaultClassification={defaultClassification}
          defaultInvestigationType={defaultInvestigationType}
        />
      )}

      {editingProject && (
        <EditProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
          onSave={(patch) => updateProject(editingProject.id, patch)}
        />
      )}
    </div>
  )
}
