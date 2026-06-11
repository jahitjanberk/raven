import { BASE_URL, authHeaders } from './client'

export interface EvidenceCapture {
  id: string
  project_id: string
  node_id: string
  transform_slug: string
  transform_name: string
  entity_value: string
  entity_type: string
  result_json: string
  sha256: string
  source_url: string | null
  screenshot_b64: string | null
  captured_at: string
}

export async function fetchNodeEvidence(projectId: string, nodeId: string): Promise<EvidenceCapture[]> {
  const resp = await fetch(`${BASE_URL}/api/evidence/${projectId}/${nodeId}`, {
    headers: authHeaders(),
  })
  if (!resp.ok) return []
  return resp.json() as Promise<EvidenceCapture[]>
}

export async function fetchProjectEvidence(projectId: string): Promise<EvidenceCapture[]> {
  const resp = await fetch(`${BASE_URL}/api/evidence/${projectId}`, {
    headers: authHeaders(),
  })
  if (!resp.ok) return []
  return resp.json() as Promise<EvidenceCapture[]>
}
