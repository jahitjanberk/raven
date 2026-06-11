// STIX 2.1 bundle export (OASIS STIX 2.1 / STANAG-compatible)
import type { GraphNode, GraphEdge } from '../types/graph'
import type { SourceReliability, InfoAccuracy } from '../types/graph'

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeId(type: string): string {
  return `${type}--${crypto.randomUUID()}`
}

// Escape single quotes inside STIX pattern string literals
function pv(v: string): string {
  return v.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function confidenceScore(c: string): number {
  const map: Record<string, number> = {
    confirmed: 95, probable: 75, possible: 50, doubtful: 25, ungraded: 50,
  }
  return map[c] ?? 50
}

function indicatorTypes(node: GraphNode): string[] {
  if (node.riskFlag === 'HIGH' || node.actionFlag === 'suspect') return ['malicious-activity']
  if (node.riskFlag === 'MEDIUM') return ['suspicious-activity']
  if (node.riskFlag === 'LOW') return ['suspicious-activity']
  return ['unknown']
}

function reliabilityToSTIX(r: SourceReliability): string {
  const map: Record<SourceReliability, string> = {
    A: 'A - Completely reliable',
    B: 'B - Usually reliable',
    C: 'C - Fairly reliable',
    D: 'D - Not usually reliable',
    ungraded: 'F - Cannot be judged',
  }
  return map[r]
}

function hashPattern(value: string): string {
  // Strip optional prefix like "sha256:", "md5:", "sha1:"
  const stripped = value.replace(/^[a-z0-9-]+:/i, '').trim()
  const len = stripped.length
  if (len === 32)  return `[file:hashes.MD5 = '${pv(stripped)}']`
  if (len === 40)  return `[file:hashes.'SHA-1' = '${pv(stripped)}']`
  if (len === 64)  return `[file:hashes.'SHA-256' = '${pv(stripped)}']`
  if (len === 128) return `[file:hashes.'SHA-512' = '${pv(stripped)}']`
  return `[file:hashes.MD5 = '${pv(stripped)}']`
}

function edgeLabelToRelType(label: string | undefined): string {
  if (!label) return 'related-to'
  const normalised = label.toLowerCase().trim()
  const map: Record<string, string> = {
    'resolves to': 'resolves-to',
    'resolves':    'resolves-to',
    'hosted by':   'hosted-on',
    'hosted on':   'hosted-on',
    'hosts':       'hosts',
    'registered':  'owns',
    'owns':        'owns',
    'used by':     'uses',
    'uses':        'uses',
    'communicates with': 'communicates-with',
    'communicates': 'communicates-with',
    'linked to':   'related-to',
    'related to':  'related-to',
    'attributed to': 'attributed-to',
    'targets':     'targets',
    'indicates':   'indicates',
    'mitigates':   'mitigates',
    'located at':  'located-at',
    'delivers':    'delivers',
    'downloads':   'downloads',
    'drops':       'drops',
    'exploits':    'exploits',
  }
  return map[normalised] ?? 'related-to'
}

// ── Per-type SDO builders ─────────────────────────────────────────────────────

function nodeToSDO(node: GraphNode, createdBy: string, now: string): Record<string, unknown> | null {
  const base = {
    spec_version: '2.1',
    created: node.addedAt,
    modified: now,
    created_by_ref: createdBy,
    confidence: confidenceScore(node.confidence),
    ...(node.note ? { description: node.note } : {}),
    ...(node.sourceUrl ? { external_references: [{ source_name: 'source', url: node.sourceUrl }] } : {}),
  }

  const labels: string[] = []
  if (node.riskFlag !== 'NONE') labels.push(`risk:${node.riskFlag.toLowerCase()}`)
  if (node.actionFlag !== 'unknown') labels.push(node.actionFlag)

  switch (node.type) {
    case 'ip': {
      const isIPv6 = node.value.includes(':') && !node.value.startsWith('http')
      return {
        ...base,
        type: 'indicator',
        id: makeId('indicator'),
        name: node.value,
        pattern: isIPv6
          ? `[ipv6-addr:value = '${pv(node.value)}']`
          : `[ipv4-addr:value = '${pv(node.value)}']`,
        pattern_type: 'stix',
        valid_from: node.addedAt,
        indicator_types: indicatorTypes(node),
        ...(labels.length ? { labels } : {}),
      }
    }

    case 'domain':
      return {
        ...base,
        type: 'indicator',
        id: makeId('indicator'),
        name: node.value,
        pattern: `[domain-name:value = '${pv(node.value)}']`,
        pattern_type: 'stix',
        valid_from: node.addedAt,
        indicator_types: indicatorTypes(node),
        ...(labels.length ? { labels } : {}),
      }

    case 'email':
      return {
        ...base,
        type: 'indicator',
        id: makeId('indicator'),
        name: node.value,
        pattern: `[email-addr:value = '${pv(node.value)}']`,
        pattern_type: 'stix',
        valid_from: node.addedAt,
        indicator_types: indicatorTypes(node),
        ...(labels.length ? { labels } : {}),
      }

    case 'url':
      return {
        ...base,
        type: 'indicator',
        id: makeId('indicator'),
        name: node.value,
        pattern: `[url:value = '${pv(node.value)}']`,
        pattern_type: 'stix',
        valid_from: node.addedAt,
        indicator_types: indicatorTypes(node),
        ...(labels.length ? { labels } : {}),
      }

    case 'hash':
      return {
        ...base,
        type: 'indicator',
        id: makeId('indicator'),
        name: node.value,
        pattern: hashPattern(node.value),
        pattern_type: 'stix',
        valid_from: node.addedAt,
        indicator_types: indicatorTypes(node),
        ...(labels.length ? { labels } : {}),
      }

    case 'phone':
      return {
        ...base,
        type: 'indicator',
        id: makeId('indicator'),
        name: node.value,
        pattern: `[x-phone:value = '${pv(node.value)}']`,
        pattern_type: 'stix',
        valid_from: node.addedAt,
        indicator_types: indicatorTypes(node),
        ...(labels.length ? { labels } : {}),
      }

    case 'wallet':
      return {
        ...base,
        type: 'indicator',
        id: makeId('indicator'),
        name: node.value,
        pattern: `[x-cryptocurrency-wallet:value = '${pv(node.value)}']`,
        pattern_type: 'stix',
        valid_from: node.addedAt,
        indicator_types: ['malicious-activity'],
        ...(labels.length ? { labels } : {}),
      }

    case 'person':
    case 'social':
      return {
        ...base,
        type: 'identity',
        id: makeId('identity'),
        name: node.value,
        identity_class: 'individual',
        ...(node.metadata?.role ? { roles: [node.metadata.role] } : {}),
        ...(labels.length ? { labels } : {}),
      }

    case 'org':
    case 'company':
    case 'bank':
      return {
        ...base,
        type: 'identity',
        id: makeId('identity'),
        name: node.value,
        identity_class: 'organization',
        ...(node.metadata?.sector ? { sectors: [node.metadata.sector] } : {}),
        ...(labels.length ? { labels } : {}),
      }

    case 'cert':
      return {
        ...base,
        type: 'infrastructure',
        id: makeId('infrastructure'),
        name: node.value,
        infrastructure_types: ['certificates'],
        ...(labels.length ? { labels } : {}),
      }

    case 'location': {
      const lat = node.metadata?.lat ? parseFloat(node.metadata.lat) : undefined
      const lon = node.metadata?.lon ? parseFloat(node.metadata.lon) : undefined
      return {
        ...base,
        type: 'location',
        id: makeId('location'),
        name: node.value,
        ...(lat !== undefined && lon !== undefined && !isNaN(lat) && !isNaN(lon)
          ? { latitude: lat, longitude: lon }
          : {}),
        ...(node.metadata?.country ? { country: node.metadata.country } : {}),
        ...(node.metadata?.city ? { city: node.metadata.city } : {}),
        ...(labels.length ? { labels } : {}),
      }
    }

    case 'takedown':
      return {
        ...base,
        type: 'course-of-action',
        id: makeId('course-of-action'),
        name: node.value,
        ...(labels.length ? { labels } : {}),
      }

    case 'transaction':
    case 'fraudreport':
      return {
        ...base,
        type: 'note',
        id: makeId('note'),
        content: node.value,
        object_refs: [],
        ...(labels.length ? { labels } : {}),
      }

    default:
      return {
        ...base,
        type: 'indicator',
        id: makeId('indicator'),
        name: node.value,
        pattern: `[x-entity:value = '${pv(node.value)}']`,
        pattern_type: 'stix',
        valid_from: node.addedAt,
        indicator_types: indicatorTypes(node),
        ...(labels.length ? { labels } : {}),
      }
  }
}

// ── Bundle builder ────────────────────────────────────────────────────────────

export interface STIXBundleOptions {
  projectName: string
  caseRef: string
  classification: string
  analystName: string
  evidenceCaptures?: import('../api/evidence').EvidenceCapture[]
}

export function buildSTIXBundle(
  nodes: GraphNode[],
  edges: GraphEdge[],
  opts: STIXBundleOptions,
): Record<string, unknown> {
  const now = new Date().toISOString()

  // Creator identity — Raven platform / analyst
  const creatorId = makeId('identity')
  const creator = {
    type: 'identity',
    spec_version: '2.1',
    id: creatorId,
    created: now,
    modified: now,
    name: opts.analystName || 'Raven Intelligence Platform',
    identity_class: 'system',
    description: `Investigation: ${opts.projectName} (${opts.caseRef})`,
  }

  // Convert nodes → SDOs; track id mapping for relationship wiring
  const nodeIdToSTIXId = new Map<string, string>()
  const sdos: Record<string, unknown>[] = [creator]

  for (const node of nodes) {
    const sdo = nodeToSDO(node, creatorId, now)
    if (!sdo) continue
    nodeIdToSTIXId.set(node.id, sdo.id as string)
    sdos.push(sdo)
  }

  // Convert edges → SROs
  const sros: Record<string, unknown>[] = []
  for (const edge of edges) {
    const srcSTIX = nodeIdToSTIXId.get(edge.source)
    const tgtSTIX = nodeIdToSTIXId.get(edge.target)
    if (!srcSTIX || !tgtSTIX) continue

    const sro: Record<string, unknown> = {
      type: 'relationship',
      spec_version: '2.1',
      id: makeId('relationship'),
      created: edge.addedAt,
      modified: now,
      created_by_ref: creatorId,
      relationship_type: edgeLabelToRelType(edge.label),
      source_ref: srcSTIX,
      target_ref: tgtSTIX,
    }

    // Embed intel grade as a custom extension
    if (edge.grade.sourceReliability !== 'ungraded' || edge.grade.infoAccuracy !== 'ungraded') {
      sro['x_raven_intel_grade'] = {
        source_reliability: edge.grade.sourceReliability !== 'ungraded'
          ? reliabilityToSTIX(edge.grade.sourceReliability) : undefined,
        information_accuracy: edge.grade.infoAccuracy !== 'ungraded'
          ? edge.grade.infoAccuracy : undefined,
        grade_code: edge.grade.sourceReliability !== 'ungraded' && edge.grade.infoAccuracy !== 'ungraded'
          ? `${edge.grade.sourceReliability}${edge.grade.infoAccuracy}` : undefined,
      }
    }

    if (edge.label) sro['description'] = edge.label
    sros.push(sro)
  }

  // Evidence manifest custom object (if captures provided)
  const evidenceManifest = opts.evidenceCaptures?.length
    ? {
        type: 'x-raven-evidence-manifest',
        spec_version: '2.1',
        id: makeId('x-raven-evidence-manifest'),
        created: now,
        modified: now,
        created_by_ref: creatorId,
        total_captures: opts.evidenceCaptures.length,
        evidence_captures: opts.evidenceCaptures.map(ev => ({
          id: ev.id,
          node_id: ev.node_id,
          entity_value: ev.entity_value,
          transform_slug: ev.transform_slug,
          transform_name: ev.transform_name,
          sha256: ev.sha256,
          captured_at: ev.captured_at,
        })),
      }
    : null

  // Top-level report SDO wrapping everything
  const allObjectIds = [
    ...sdos.map(o => o.id as string),
    ...sros.map(o => o.id as string),
    ...(evidenceManifest ? [evidenceManifest.id] : []),
  ]
  const report = {
    type: 'report',
    spec_version: '2.1',
    id: makeId('report'),
    created: now,
    modified: now,
    created_by_ref: creatorId,
    name: opts.projectName,
    description: `Case reference: ${opts.caseRef} · Classification: ${opts.classification}`,
    report_types: ['threat-actor-activity'],
    published: now,
    object_refs: allObjectIds,
    labels: [opts.classification.toLowerCase().replace(/[^a-z0-9]/g, '-')],
  }

  return {
    type: 'bundle',
    id: makeId('bundle'),
    spec_version: '2.1',
    objects: [...sdos, ...sros, ...(evidenceManifest ? [evidenceManifest] : []), report],
  }
}

export function downloadSTIX(bundle: Record<string, unknown>, filename: string): void {
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = Object.assign(document.createElement('a'), {
    href: url,
    download: filename,
  })
  a.click()
  URL.revokeObjectURL(url)
}
