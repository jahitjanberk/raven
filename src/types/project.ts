export type Classification = 'OFFICIAL' | 'OFFICIAL-SENSITIVE' | 'CUSTOM'

export type InvestigationType =
  | 'Fraud / Financial crime'
  | 'Cyber / Infrastructure'
  | 'OSINT / Research'
  | 'Counter-terrorism'
  | 'Organised crime'
  | 'Other'

export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN'
export type ProjectStatus = 'active' | 'paused' | 'closed'

export interface EntityCount {
  ip: number
  domain: number
  email: number
  person: number
  org: number
  phone: number
  wallet: number
  url: number
}

export interface Project {
  id: string
  name: string
  caseRef?: string
  classification: Classification
  investigationType: InvestigationType
  status: ProjectStatus
  riskLevel: RiskLevel
  nodeCount: number
  edgeCount: number
  entityCounts: Partial<EntityCount>
  analystInitials: string
  analystName: string
  createdAt: string
  updatedAt: string
  lastAction?: string
}
