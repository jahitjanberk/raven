import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type WatchInterval = 6 | 12 | 24 | 48 | 72 | 168

export const INTERVAL_LABELS: Record<WatchInterval, string> = {
  6:   'Every 6 hours',
  12:  'Every 12 hours',
  24:  'Every 24 hours',
  48:  'Every 2 days',
  72:  'Every 3 days',
  168: 'Weekly',
}

export interface WatchAlert {
  id: string
  watchId: string
  detectedAt: string
  summary: string
  newNodeCount: number
  read: boolean
}

export interface WatchEntry {
  id: string
  nodeId: string
  nodeValue: string
  nodeType: string
  transformSlug: string
  transformName: string
  intervalHours: WatchInterval
  lastRunAt: string | null
  nextRunAt: string | null
  lastResultHash: string | null
  enabled: boolean
  requiresKey: boolean
  addedAt: string
}

interface WatchStore {
  entries: WatchEntry[]
  alerts: WatchAlert[]
  // API keys are session-only — never persisted to localStorage
  apiKeys: Record<string, string>

  addWatch: (
    entry: Omit<WatchEntry, 'id' | 'addedAt' | 'lastRunAt' | 'nextRunAt' | 'lastResultHash'>,
    apiKey?: string,
  ) => void
  removeWatch: (id: string) => void
  removeNodeWatches: (nodeId: string) => void
  toggleWatch: (id: string) => void
  updateRunResult: (id: string, hash: string | null, ran: boolean) => void
  addAlert: (alert: Omit<WatchAlert, 'id' | 'detectedAt'>) => void
  markAllRead: () => void
  setApiKey: (watchId: string, key: string) => void
  isWatching: (nodeId: string, transformSlug: string) => boolean
  unreadCount: () => number
}

export const useWatchStore = create<WatchStore>()(
  persist(
    (set, get) => ({
      entries: [],
      alerts:  [],
      apiKeys: {},

      addWatch: (entryData, apiKey) => {
        // Prevent duplicates on same node + transform
        const already = get().entries.find(
          e => e.nodeId === entryData.nodeId && e.transformSlug === entryData.transformSlug,
        )
        if (already) return

        const now = new Date().toISOString()
        const id  = `watch-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
        const nextRunAt = new Date(
          Date.now() + entryData.intervalHours * 60 * 60 * 1000,
        ).toISOString()

        const entry: WatchEntry = {
          ...entryData,
          id,
          addedAt: now,
          lastRunAt: null,
          nextRunAt,
          lastResultHash: null,
        }

        set(s => ({ entries: [...s.entries, entry] }))

        if (apiKey) {
          set(s => ({ apiKeys: { ...s.apiKeys, [id]: apiKey } }))
        }
      },

      removeWatch: (id) => {
        set(s => ({
          entries: s.entries.filter(e => e.id !== id),
          alerts:  s.alerts.filter(a => a.watchId !== id),
          apiKeys: Object.fromEntries(Object.entries(s.apiKeys).filter(([k]) => k !== id)),
        }))
      },

      removeNodeWatches: (nodeId) => {
        const toRemove = get().entries.filter(e => e.nodeId === nodeId).map(e => e.id)
        const toRemoveSet = new Set(toRemove)
        set(s => ({
          entries: s.entries.filter(e => !toRemoveSet.has(e.id)),
          alerts:  s.alerts.filter(a => !toRemoveSet.has(a.watchId)),
        }))
      },

      toggleWatch: (id) => {
        set(s => ({
          entries: s.entries.map(e =>
            e.id === id ? { ...e, enabled: !e.enabled } : e,
          ),
        }))
      },

      updateRunResult: (id, hash, ran) => {
        const now = new Date().toISOString()
        set(s => ({
          entries: s.entries.map(e => {
            if (e.id !== id) return e
            const nextRunAt = new Date(
              Date.now() + e.intervalHours * 60 * 60 * 1000,
            ).toISOString()
            return {
              ...e,
              lastRunAt: ran ? now : e.lastRunAt,
              nextRunAt,
              lastResultHash: hash ?? e.lastResultHash,
            }
          }),
        }))
      },

      addAlert: (alertData) => {
        const alert: WatchAlert = {
          ...alertData,
          id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          detectedAt: new Date().toISOString(),
        }
        set(s => ({ alerts: [alert, ...s.alerts].slice(0, 200) }))
      },

      markAllRead: () => {
        set(s => ({ alerts: s.alerts.map(a => ({ ...a, read: true })) }))
      },

      setApiKey: (watchId, key) => {
        set(s => ({ apiKeys: { ...s.apiKeys, [watchId]: key } }))
      },

      isWatching: (nodeId, transformSlug) =>
        get().entries.some(e => e.nodeId === nodeId && e.transformSlug === transformSlug),

      unreadCount: () => get().alerts.filter(a => !a.read).length,
    }),
    {
      name: 'raven-watchlist',
      // Never persist apiKeys — they are session-only
      partialize: (s) => ({ entries: s.entries, alerts: s.alerts }),
    },
  ),
)
