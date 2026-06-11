import { BASE_URL, authHeaders } from './client'

export async function downloadReportPdf(projectId: string, slug: string): Promise<void> {
  const resp = await fetch(`${BASE_URL}/api/graphs/${projectId}/pdf`, {
    headers: authHeaders(),
  })
  if (!resp.ok) {
    const body = await resp.json().catch(() => ({})) as { detail?: string }
    throw new Error(body.detail ?? `PDF export failed (${resp.status})`)
  }
  const blob = await resp.blob()
  const url = URL.createObjectURL(blob)
  const a = Object.assign(document.createElement('a'), {
    href: url,
    download: `raven-report-${slug}.pdf`,
  })
  a.click()
  URL.revokeObjectURL(url)
}
