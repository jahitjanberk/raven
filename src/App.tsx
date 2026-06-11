import React, { useState, useEffect, useRef } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import './styles/globals.css'
import { LandingPage } from './pages/Landing'
import { LoginPage } from './pages/Login'
import { ProjectsPage } from './pages/Projects'
import { GraphPage } from './pages/Graph'
import { SettingsPage } from './pages/Settings'
import { PricingPage } from './pages/Pricing'
import { DocsPage } from './pages/Docs'
import { ContactPage } from './pages/Contact'
import { AboutPage } from './pages/About'
import { PlatformPage } from './pages/Platform'
import { IndustriesPage } from './pages/Industries'
import { SecurityPage } from './pages/Security'
import { LawEnforcementPage }     from './pages/LawEnforcement'
import { FinancialCrimePage }      from './pages/FinancialCrime'
import { CounterFraudPage }        from './pages/CounterFraud'
import { CyberThreatIntelPage }    from './pages/CyberThreatIntel'
import { FinancialIntelUnitsPage } from './pages/FinancialIntelUnits'
import { IntelligenceAgenciesPage } from './pages/IntelligenceAgencies'
import { InsuranceSectorPage }       from './pages/InsuranceSector'
import { LegalComplianceSectorPage } from './pages/LegalComplianceSector'
import { PrivacyPage }    from './pages/Privacy'
import { TermsPage }      from './pages/Terms'
import { CookiesPage }    from './pages/Cookies'
import { CareersPage }    from './pages/Careers'
import { BlogPage }       from './pages/Blog'
import { ChangelogPage }  from './pages/Changelog'
import { PartnersPage }   from './pages/Partners'
import { RequestAccessPage } from './pages/RequestAccess'
import { ActivatePage } from './pages/Activate'
import { ResetPasswordPage } from './pages/ResetPassword'
import { StatusPage } from './pages/Status'
import { useProjectStore } from './store/projectStore'
import { useGraphStore } from './store/graphStore'
import { SEED_GRAPHS } from './store/seedGraphs'
import { loadGraphApi } from './api/graphs'
import { apiFetch } from './api/client'
import type { Project } from './types/project'

// ── Auth-gated app shell ──────────────────────────────────────────────────────

function AppShell() {
  const navigate = useNavigate()
  const [authed, setAuthed]               = useState(false)
  const [authChecked, setAuthChecked]     = useState(false)
  const [activeProject, setActiveProject] = useState<Project | null>(null)
  const [showSettings, setShowSettings]   = useState(false)
  const validating                        = useRef(false)

  // Validate JWT against backend on every shell mount — never trust localStorage alone
  useEffect(() => {
    if (validating.current) return
    validating.current = true
    const token = localStorage.getItem('raven-token')
    if (!token) {
      setAuthChecked(true)
      return
    }
    apiFetch('/api/auth/me')
      .then(resp => {
        if (resp.ok) {
          setAuthed(true)
        } else {
          localStorage.removeItem('raven-token')
          localStorage.removeItem('raven-auth')
        }
      })
      .catch(() => {
        // Backend unreachable — fall back to localStorage presence so offline use still works
        if (localStorage.getItem('raven-auth')) setAuthed(true)
      })
      .finally(() => setAuthChecked(true))
  }, [])

  const openProject = async (project: Project) => {
    useGraphStore.getState().setActiveProjectId(project.id)
    setActiveProject(project)

    try {
      const remote = await loadGraphApi(project.id)
      if (remote) {
        useGraphStore.getState().loadGraph(remote.nodes, remote.edges, remote.caseNotes)
        // Keep localStorage cache in sync
        useProjectStore.getState().saveGraph(project.id, remote.nodes, remote.edges, remote.caseNotes)
        return
      }
    } catch {
      // Fall through to localStorage cache
    }

    const cached = useProjectStore.getState().getGraph(project.id)
    if (cached) {
      useGraphStore.getState().loadGraph(cached.nodes, cached.edges, cached.caseNotes)
      return
    }

    const seed = SEED_GRAPHS[project.id]
    seed
      ? useGraphStore.getState().loadGraph(seed.nodes, seed.edges)
      : useGraphStore.getState().clearGraph()
  }

  // Load projects from backend, then restore last open project
  useEffect(() => {
    if (!authed || activeProject) return
    const restore = async () => {
      await useProjectStore.getState().loadProjects()
      try {
        const savedId = localStorage.getItem('raven-active-project')
        if (!savedId) return
        const project = useProjectStore.getState().projects.find(p => p.id === savedId)
        if (project) openProject(project)
      } catch { /* ignore */ }
    }
    restore()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authed])

  const handleLogout = () => {
    try {
      localStorage.removeItem('raven-auth')
      localStorage.removeItem('raven-active-project')
    } catch { /* ignore */ }
    useGraphStore.getState().setActiveProjectId(null)
    setAuthed(false)
    setActiveProject(null)
    setShowSettings(false)
    navigate('/')
  }

  if (!authChecked) return null

  if (!authed) {
    return (
      <LoginPage
        onSuccess={() => setAuthed(true)}
        onBack={() => navigate('/')}
      />
    )
  }

  return (
    <>
      {activeProject ? (
        <GraphPage
          projectId={activeProject.id}
          projectName={activeProject.name}
          caseRef={activeProject.caseRef}
          classification={activeProject.classification}
          riskLevel={activeProject.riskLevel}
          status={activeProject.status}
          onBack={() => {
            useGraphStore.getState().setActiveProjectId(null)
            setActiveProject(null)
          }}
          onOpenSettings={() => setShowSettings(true)}
        />
      ) : (
        <ProjectsPage
          onOpenProject={openProject}
          onOpenSettings={() => setShowSettings(true)}
          onLogout={handleLogout}
        />
      )}
      {showSettings && (
        <SettingsPage
          onClose={() => setShowSettings(false)}
          onLogout={handleLogout}
        />
      )}
    </>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Routes>
      <Route path="/"        element={<LandingPage onSignIn={() => { window.location.href = '/app' }} />} />
      <Route path="/app"     element={<AppShell />} />
      <Route path="/platform"   element={<PlatformPage />} />
      <Route path="/industries" element={<IndustriesPage />} />
      <Route path="/industries/law-enforcement"      element={<LawEnforcementPage />} />
      <Route path="/industries/financial-crime"      element={<FinancialCrimePage />} />
      <Route path="/industries/counter-fraud"        element={<CounterFraudPage />} />
      <Route path="/industries/cyber-threat-intel"   element={<CyberThreatIntelPage />} />
      <Route path="/industries/financial-intel-units" element={<FinancialIntelUnitsPage />} />
      <Route path="/industries/intelligence-agencies" element={<IntelligenceAgenciesPage />} />
      <Route path="/industries/insurance"            element={<InsuranceSectorPage />} />
      <Route path="/industries/legal-compliance"     element={<LegalComplianceSectorPage />} />
      <Route path="/security"   element={<SecurityPage />} />
      <Route path="/privacy"    element={<PrivacyPage />} />
      <Route path="/terms"      element={<TermsPage />} />
      <Route path="/cookies"    element={<CookiesPage />} />
      <Route path="/careers"    element={<CareersPage />} />
      <Route path="/blog"       element={<BlogPage />} />
      <Route path="/changelog"  element={<ChangelogPage />} />
      <Route path="/partners"   element={<PartnersPage />} />
      <Route path="/request-access" element={<RequestAccessPage />} />
      <Route path="/pricing"    element={<PricingPage />} />
      <Route path="/docs/*"     element={<DocsPage />} />
      <Route path="/contact"    element={<ContactPage />} />
      <Route path="/about"      element={<AboutPage />} />
      <Route path="/activate"        element={<ActivatePage onSuccess={() => { window.location.href = '/app' }} />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/status"          element={<StatusPage />} />
      <Route path="*"        element={<LandingPage onSignIn={() => { window.location.href = '/app' }} />} />
    </Routes>
  )
}
