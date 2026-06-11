import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Project } from '../types/project'
import type { GraphNode, GraphEdge } from '../types/graph'
import {
  fetchProjects,
  createProjectApi,
  updateProjectApi,
  deleteProjectApi,
} from '../api/projects'

export interface PersistedGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
  caseNotes: string
  savedAt: string
}

interface ProjectStore {
  projects: Project[]
  graphs: Record<string, PersistedGraph>

  loadProjects: () => Promise<void>
  createProject: (p: Project) => Promise<Project>
  updateProject: (id: string, patch: Partial<Project>) => Promise<void>
  deleteProject: (id: string) => Promise<void>

  saveGraph: (projectId: string, nodes: GraphNode[], edges: GraphEdge[], caseNotes: string) => void
  getGraph: (projectId: string) => PersistedGraph | null
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      graphs: {},

      loadProjects: async () => {
        try {
          const projects = await fetchProjects()
          set({ projects })
        } catch {
          // Keep cached state on network failure — offline mode
        }
      },

      createProject: async (p) => {
        // Optimistic: add locally immediately so UI responds
        set((s) => ({ projects: [p, ...s.projects] }))
        try {
          const created = await createProjectApi({
            name:              p.name,
            caseRef:           p.caseRef,
            classification:    p.classification,
            investigationType: p.investigationType,
            status:            p.status,
            riskLevel:         p.riskLevel,
            analystInitials:   p.analystInitials,
            analystName:       p.analystName,
            lastAction:        p.lastAction,
          })
          // Replace the optimistic entry with the API-returned project (has real backend id)
          set((s) => ({
            projects: s.projects.map((pr) => (pr.id === p.id ? created : pr)),
          }))
          return created
        } catch {
          // Offline — keep local copy; will sync later
          return p
        }
      },

      updateProject: async (id, patch) => {
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p
          ),
        }))
        try {
          await updateProjectApi(id, patch)
        } catch {
          // Offline — local state is the truth for now
        }
      },

      deleteProject: async (id) => {
        const graphs = { ...get().graphs }
        delete graphs[id]
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id), graphs }))
        try {
          await deleteProjectApi(id)
        } catch {
          // Offline — already removed locally
        }
      },

      saveGraph: (projectId, nodes, edges, caseNotes) => {
        const entityCounts: Record<string, number> = {}
        nodes.forEach((n) => { entityCounts[n.type] = (entityCounts[n.type] ?? 0) + 1 })

        set((s) => ({
          graphs: {
            ...s.graphs,
            [projectId]: { nodes, edges, caseNotes, savedAt: new Date().toISOString() },
          },
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  nodeCount: nodes.length,
                  edgeCount: edges.length,
                  entityCounts,
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        }))
      },

      getGraph: (projectId) => get().graphs[projectId] ?? null,
    }),
    { name: 'raven-projects' }
  )
)
