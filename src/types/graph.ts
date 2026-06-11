export type EntityType =
  | 'ip'
  | 'domain'
  | 'email'
  | 'person'
  | 'org'
  | 'phone'
  | 'wallet'
  | 'url'
  | 'bank'
  | 'cert'
  | 'social'
  | 'company'
  | 'transaction'
  | 'takedown'
  | 'location'
  | 'fraudreport'
  | 'hash'

export type RiskFlag = 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE'
export type ActionFlag = 'suspect' | 'victim' | 'witness' | 'confirmed' | 'unknown'
export type Confidence = 'confirmed' | 'probable' | 'possible' | 'doubtful' | 'ungraded'
export type SourceReliability = 'A' | 'B' | 'C' | 'D' | 'ungraded'
export type InfoAccuracy = '1' | '2' | '3' | '4' | 'ungraded'

export interface NodePosition {
  x: number
  y: number
}

export interface GraphNode {
  id: string
  type: EntityType
  value: string
  label?: string
  note?: string
  metadata?: Record<string, string>
  riskFlag: RiskFlag
  actionFlag: ActionFlag
  confidence: Confidence   // defaults to 'ungraded' for legacy nodes
  sourceUrl?: string
  retrievedAt?: string
  addedAt: string
  addedBy: string
  position: NodePosition
  enriching?: boolean
  enrichmentData?: EnrichmentResult
}

export interface IntelGrade {
  sourceReliability: SourceReliability
  infoAccuracy: InfoAccuracy
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  label?: string
  grade: IntelGrade
  sourceUrl?: string
  addedAt: string
}

export interface GraphState {
  nodes: GraphNode[]
  edges: GraphEdge[]
  selectedNodeId: string | null
  hoveredNodeId: string | null
}

export interface EnrichmentField {
  label: string
  value: string
  flag?: 'danger' | 'warning' | 'ok' | 'info'
  mono?: boolean
}

export interface DiscoveredEntity {
  type: EntityType
  value: string
  relationship: string
}

export interface EnrichmentResult {
  enrichedAt: string
  sources: string[]
  fields: EnrichmentField[]
  discovered: DiscoveredEntity[]
}

export const ENTITY_CONFIG: Record<EntityType, { label: string; color: string; symbol: string }> = {
  ip:      { label: 'IP Address',    color: '#388BFD', symbol: '⬡' },
  domain:  { label: 'Domain',        color: '#3FB87A', symbol: '⬡' },
  email:   { label: 'Email',         color: '#D29922', symbol: '⬡' },
  person:  { label: 'Person',        color: '#A371F7', symbol: '⬡' },
  org:     { label: 'Org',           color: '#F85149', symbol: '⬡' },
  phone:   { label: 'Phone',         color: '#8B949E', symbol: '⬡' },
  wallet:  { label: 'Wallet',        color: '#E3B341', symbol: '⬡' },
  url:     { label: 'URL',           color: '#56C2E6', symbol: '⬡' },
  bank:        { label: 'Bank Account',  color: '#34D399', symbol: '⬡' },
  cert:        { label: 'SSL Cert',      color: '#818CF8', symbol: '⬡' },
  social:      { label: 'Social Profile',color: '#F472B6', symbol: '⬡' },
  company:     { label: 'Company Reg.', color: '#FB923C', symbol: '⬡' },
  transaction: { label: 'Transaction',  color: '#0891B2', symbol: '⬡' },
  takedown:    { label: 'Takedown',     color: '#DC2626', symbol: '⬡' },
  location:    { label: 'Location',     color: '#65A30D', symbol: '⬡' },
  fraudreport: { label: 'Fraud Report', color: '#7C3AED', symbol: '⬡' },
  hash:        { label: 'File Hash',    color: '#94A3B8', symbol: '⬡' },
}

export const RISK_COLORS: Record<RiskFlag, string> = {
  HIGH:   '#E05252',
  MEDIUM: '#C98A2E',
  LOW:    '#3A9E6F',
  NONE:   'transparent',
}

export const CONFIDENCE_CONFIG: Record<Confidence, { label: string; short: string; color: string; dash: string }> = {
  confirmed: { label: 'Confirmed',  short: 'C', color: '#3FB87A', dash: 'none' },
  probable:  { label: 'Probable',   short: 'P', color: '#388BFD', dash: '6 2' },
  possible:  { label: 'Possible',   short: '?', color: '#D29922', dash: '4 3' },
  doubtful:  { label: 'Doubtful',   short: 'D', color: '#F85149', dash: '2 4' },
  ungraded:  { label: 'Ungraded',   short: 'U', color: '#4B5563', dash: '2 2' },
}

// NATO-style 4×4 intelligence grading (STANAG 2511)
export const RELIABILITY_CONFIG: Record<SourceReliability, { label: string; desc: string; color: string }> = {
  A:        { label: 'Completely reliable',    desc: 'No doubt about authenticity or competency; history of complete reliability', color: '#3FB87A' },
  B:        { label: 'Usually reliable',       desc: 'Minor doubt; history of valid information in most cases',                    color: '#56C2E6' },
  C:        { label: 'Fairly reliable',        desc: 'Doubt; provided valid information in the past',                             color: '#D29922' },
  D:        { label: 'Not usually reliable',   desc: 'Significant doubt; history of invalid information in most cases',           color: '#F85149' },
  ungraded: { label: 'Ungraded',              desc: 'Source reliability not assessed',                                            color: '#4B5563' },
}

export const ACCURACY_CONFIG: Record<InfoAccuracy, { label: string; desc: string; color: string }> = {
  '1':      { label: 'Confirmed',      desc: 'Confirmed by other independent sources; logical; consistent with other information',    color: '#3FB87A' },
  '2':      { label: 'Probably true',  desc: 'Not confirmed; logical; consistent with other information on the subject',             color: '#56C2E6' },
  '3':      { label: 'Possibly true',  desc: 'Not confirmed; reasonably logical; agrees with some other information on the subject', color: '#D29922' },
  '4':      { label: 'Doubtful',       desc: 'Not confirmed; possible but illogical; no other information on the subject',           color: '#F85149' },
  ungraded: { label: 'Ungraded',       desc: 'Information accuracy not assessed',                                                    color: '#4B5563' },
}

export function intelGradeColor(grade: IntelGrade): string {
  const relOrder = { A: 0, B: 1, C: 2, D: 3, ungraded: 4 }
  const accOrder = { '1': 0, '2': 1, '3': 2, '4': 3, ungraded: 4 }
  const worst = Math.max(relOrder[grade.sourceReliability], accOrder[grade.infoAccuracy])
  if (worst <= 1) return '#3FB87A'
  if (worst <= 2) return '#D29922'
  if (worst <= 3) return '#F85149'
  return '#4B5563'
}
