import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Classification, InvestigationType } from '../types/project'

interface SettingsState {
  analystName: string
  analystInitials: string
  defaultClassification: Classification
  defaultInvestigationType: InvestigationType
  showGrid: boolean

  setAnalystName: (v: string) => void
  setAnalystInitials: (v: string) => void
  setDefaultClassification: (v: Classification) => void
  setDefaultInvestigationType: (v: InvestigationType) => void
  setShowGrid: (v: boolean) => void
  reset: () => void
}

const DEFAULTS = {
  analystName: 'J. Ali',
  analystInitials: 'JA',
  defaultClassification: 'OFFICIAL' as Classification,
  defaultInvestigationType: 'Fraud / Financial crime' as InvestigationType,
  showGrid: true,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setAnalystName: (v) => set({ analystName: v }),
      setAnalystInitials: (v) => set({ analystInitials: v.slice(0, 3).toUpperCase() }),
      setDefaultClassification: (v) => set({ defaultClassification: v }),
      setDefaultInvestigationType: (v) => set({ defaultInvestigationType: v }),
      setShowGrid: (v) => set({ showGrid: v }),
      reset: () => set(DEFAULTS),
    }),
    { name: 'raven-settings' }
  )
)
