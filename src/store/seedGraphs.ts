import type { GraphNode, GraphEdge, EntityType, RiskFlag, ActionFlag, SourceReliability, InfoAccuracy } from '../types/graph'

type NS = {
  id: string; type: EntityType; value: string
  x: number;  y: number
  risk: RiskFlag; action: ActionFlag
  addedAt?: string; addedBy?: string; note?: string
}

type ES = {
  id: string; source: string; target: string
  label?: string
  rel?: SourceReliability; acc?: InfoAccuracy
}

function n(s: NS): GraphNode {
  return {
    id: s.id, type: s.type, value: s.value,
    riskFlag: s.risk, actionFlag: s.action, confidence: 'ungraded' as const,
    addedAt: s.addedAt ?? '2026-05-14T09:00:00Z',
    addedBy: s.addedBy ?? 'J. Ali',
    position: { x: s.x, y: s.y },
    note: s.note,
  }
}

function e(s: ES): GraphEdge {
  return {
    id: s.id, source: s.source, target: s.target, label: s.label,
    grade: { sourceReliability: s.rel ?? 'B', infoAccuracy: s.acc ?? '2' },
    addedAt: '2026-05-14T09:00:00Z',
  }
}

// ─── p1: Operation Glasshouse ────────────────────────────────────────────────

const p1Nodes: GraphNode[] = [
  n({ id:'p1-d1', type:'domain', value:'malicious-update[.]net',    x:580, y:380, risk:'HIGH',   action:'confirmed', note:'Primary C2 domain. Registered 2026-04-22 via Namecheap. Resolves to 185.220.101.47.' }),
  n({ id:'p1-d2', type:'domain', value:'secure-login-verify[.]com', x:800, y:490, risk:'HIGH',   action:'confirmed' }),
  n({ id:'p1-d3', type:'domain', value:'update-server[.]xyz',       x:710, y:570, risk:'MEDIUM', action:'suspect'   }),
  n({ id:'p1-d4', type:'domain', value:'analytics-cdn[.]net',       x:790, y:275, risk:'MEDIUM', action:'suspect'   }),
  n({ id:'p1-d5', type:'domain', value:'cdn-telemetry[.]io',        x:920, y:390, risk:'LOW',    action:'unknown'   }),
  n({ id:'p1-ip1', type:'ip',    value:'185.220.101.47',            x:430, y:245, risk:'HIGH',   action:'confirmed', note:'Tor exit node. Hosts malicious-update[.]net. Seen in prior fraud campaigns.' }),
  n({ id:'p1-ip2', type:'ip',    value:'45.137.21.90',              x:360, y:445, risk:'HIGH',   action:'suspect'   }),
  n({ id:'p1-ip3', type:'ip',    value:'91.219.236.18',             x:475, y:565, risk:'MEDIUM', action:'suspect'   }),
  n({ id:'p1-e1', type:'email',  value:'admin@malicious-update[.]net', x:525, y:220, risk:'HIGH', action:'confirmed' }),
  n({ id:'p1-e2', type:'email',  value:'j.kovac@protonmail.com',    x:315, y:260, risk:'MEDIUM', action:'suspect',   note:'Used to register malicious-update[.]net. Proton account created 2026-04-20.' }),
  n({ id:'p1-e3', type:'email',  value:'billing@glasshouse-hldg.co', x:370, y:670, risk:'LOW',   action:'unknown'   }),
  n({ id:'p1-p1', type:'person', value:'Viktor Kozlov',             x:245, y:400, risk:'HIGH',   action:'suspect',   note:'Primary suspect. Director of Glasshouse Holdings Ltd. Known to Interpol under alias "V. Koval".' }),
  n({ id:'p1-p2', type:'person', value:'Marcus Renn',               x:270, y:565, risk:'NONE',   action:'victim'    }),
  n({ id:'p1-p3', type:'person', value:'Elena Marsh',               x:675, y:660, risk:'NONE',   action:'victim'    }),
  n({ id:'p1-p4', type:'person', value:'Anastasia Petrov',          x:165, y:270, risk:'MEDIUM', action:'suspect',  note:'Associate of Kozlov. Believed to manage mule accounts.' }),
  n({ id:'p1-o1', type:'org',    value:'Glasshouse Holdings Ltd',   x:280, y:715, risk:'MEDIUM', action:'suspect'   }),
  n({ id:'p1-o2', type:'org',    value:'Bittrex-Pay LLC',           x:875, y:635, risk:'LOW',    action:'unknown'   }),
  n({ id:'p1-w1', type:'wallet', value:'bc1q4f8e2c9d7a3b1f695kx0z', x:975, y:475, risk:'HIGH',  action:'confirmed', note:'BTC wallet. Received ~£87,000 in 6 weeks. Under restraint order.' }),
]

const p1Edges: GraphEdge[] = [
  e({ id:'p1-e01', source:'p1-p1',  target:'p1-d1',  label:'operates',    rel:'B', acc:'2' }),
  e({ id:'p1-e02', source:'p1-p1',  target:'p1-e2',  label:'uses',        rel:'B', acc:'2' }),
  e({ id:'p1-e03', source:'p1-e2',  target:'p1-d1',  label:'registered',  rel:'A', acc:'1' }),
  e({ id:'p1-e04', source:'p1-ip1', target:'p1-d1',  label:'hosts',       rel:'A', acc:'1' }),
  e({ id:'p1-e05', source:'p1-ip2', target:'p1-d1',  label:'C2 beacon',   rel:'B', acc:'2' }),
  e({ id:'p1-e06', source:'p1-ip3', target:'p1-d2',  label:'hosts',       rel:'B', acc:'2' }),
  e({ id:'p1-e07', source:'p1-d1',  target:'p1-d2',  label:'redirects to',rel:'A', acc:'1' }),
  e({ id:'p1-e08', source:'p1-d1',  target:'p1-d3',  label:'C2 panel',    rel:'B', acc:'2' }),
  e({ id:'p1-e09', source:'p1-d1',  target:'p1-d4',  label:'tracks via',  rel:'C', acc:'3' }),
  e({ id:'p1-e10', source:'p1-d1',  target:'p1-d5',  label:'tracks via',  rel:'C', acc:'3' }),
  e({ id:'p1-e11', source:'p1-p2',  target:'p1-d1',  label:'targeted by', rel:'B', acc:'1' }),
  e({ id:'p1-e12', source:'p1-p3',  target:'p1-d2',  label:'targeted by', rel:'B', acc:'1' }),
  e({ id:'p1-e13', source:'p1-p1',  target:'p1-o1',  label:'director',    rel:'A', acc:'1' }),
  e({ id:'p1-e14', source:'p1-o1',  target:'p1-e3',  label:'contact',     rel:'A', acc:'1' }),
  e({ id:'p1-e15', source:'p1-o1',  target:'p1-w1',  label:'controls',    rel:'B', acc:'2' }),
  e({ id:'p1-e16', source:'p1-w1',  target:'p1-o2',  label:'transacted',  rel:'B', acc:'2' }),
  e({ id:'p1-e17', source:'p1-p4',  target:'p1-p1',  label:'associate of',rel:'C', acc:'3' }),
  e({ id:'p1-e18', source:'p1-e1',  target:'p1-d1',  label:'admin of',    rel:'A', acc:'1' }),
  e({ id:'p1-e19', source:'p1-ip2', target:'p1-d3',  label:'serves',      rel:'B', acc:'2' }),
  e({ id:'p1-e20', source:'p1-p2',  target:'p1-o1',  label:'victim of',   rel:'A', acc:'1' }),
]

// ─── p2: APP Fraud ───────────────────────────────────────────────────────────

const p2Nodes: GraphNode[] = [
  n({ id:'p2-p1', type:'person', value:'Yusuf Kariuki',             x:520, y:400, risk:'HIGH',   action:'suspect',  note:'Primary suspect. Orchestrated multiple APP fraud calls posing as bank security.' }),
  n({ id:'p2-p2', type:'person', value:'Sarah Mitchell',            x:250, y:265, risk:'NONE',   action:'victim',   note:'Lost £34,800 in Feb 2026. Transferred funds to GreenWire on instruction of fraudster.' }),
  n({ id:'p2-p3', type:'person', value:'Tom Barlow',                x:250, y:405, risk:'NONE',   action:'victim'   }),
  n({ id:'p2-p4', type:'person', value:'James Otieno',              x:250, y:545, risk:'NONE',   action:'victim'   }),
  n({ id:'p2-o1', type:'org',    value:'GreenWire Transfers Ltd',   x:760, y:385, risk:'HIGH',   action:'suspect',  note:'Shell company. Incorporated 2026-01-11. Single director: Y. Kariuki.' }),
  n({ id:'p2-o2', type:'org',    value:'Barclays PLC',              x:430, y:640, risk:'NONE',   action:'witness'  }),
  n({ id:'p2-ip1', type:'ip',   value:'172.67.150.32',             x:680, y:215, risk:'MEDIUM', action:'suspect'  }),
  n({ id:'p2-ip2', type:'ip',   value:'104.21.47.89',              x:820, y:235, risk:'HIGH',   action:'suspect'  }),
  n({ id:'p2-ip3', type:'ip',   value:'185.234.218.64',            x:875, y:490, risk:'MEDIUM', action:'unknown'  }),
  n({ id:'p2-ip4', type:'ip',   value:'92.118.36.82',              x:760, y:560, risk:'LOW',    action:'unknown'  }),
  n({ id:'p2-e1', type:'email', value:'y.kariuki.fn@gmail.com',    x:480, y:240, risk:'HIGH',   action:'confirmed' }),
  n({ id:'p2-e2', type:'email', value:'support@revolut-refund[.]net', x:650, y:295, risk:'HIGH', action:'suspect' }),
  n({ id:'p2-e3', type:'email', value:'transfers@greenwire-fx[.]com', x:900, y:380, risk:'MEDIUM', action:'suspect' }),
  n({ id:'p2-w1', type:'wallet', value:'bc1qk8m7p2j3n4x5r6s7t8u',  x:900, y:575, risk:'HIGH',   action:'confirmed', note:'Crypto wallet linked to GreenWire. ~£112,000 received.' }),
]

const p2Edges: GraphEdge[] = [
  e({ id:'p2-e01', source:'p2-p1',  target:'p2-e1',  label:'uses',         rel:'A', acc:'1' }),
  e({ id:'p2-e02', source:'p2-p1',  target:'p2-o1',  label:'director',     rel:'A', acc:'1' }),
  e({ id:'p2-e03', source:'p2-p1',  target:'p2-e2',  label:'sends via',    rel:'B', acc:'2' }),
  e({ id:'p2-e04', source:'p2-p2',  target:'p2-o2',  label:'banked at',    rel:'A', acc:'1' }),
  e({ id:'p2-e05', source:'p2-p3',  target:'p2-o2',  label:'banked at',    rel:'A', acc:'1' }),
  e({ id:'p2-e06', source:'p2-p4',  target:'p2-o2',  label:'banked at',    rel:'A', acc:'1' }),
  e({ id:'p2-e07', source:'p2-p2',  target:'p2-e2',  label:'targeted by',  rel:'A', acc:'1' }),
  e({ id:'p2-e08', source:'p2-p3',  target:'p2-e1',  label:'contacted by', rel:'B', acc:'1' }),
  e({ id:'p2-e09', source:'p2-p4',  target:'p2-e1',  label:'contacted by', rel:'B', acc:'1' }),
  e({ id:'p2-e10', source:'p2-o2',  target:'p2-o1',  label:'transfer to',  rel:'A', acc:'1' }),
  e({ id:'p2-e11', source:'p2-o1',  target:'p2-e3',  label:'contact',      rel:'A', acc:'1' }),
  e({ id:'p2-e12', source:'p2-o1',  target:'p2-w1',  label:'controls',     rel:'B', acc:'2' }),
  e({ id:'p2-e13', source:'p2-ip1', target:'p2-e2',  label:'hosts',        rel:'B', acc:'2' }),
  e({ id:'p2-e14', source:'p2-ip2', target:'p2-o1',  label:'associated',   rel:'C', acc:'3' }),
  e({ id:'p2-e15', source:'p2-ip3', target:'p2-e1',  label:'login from',   rel:'B', acc:'2' }),
  e({ id:'p2-e16', source:'p2-ip4', target:'p2-ip1', label:'resolves to',  rel:'C', acc:'3' }),
]

// ─── p3: Cobalt Strike C2 Cluster ────────────────────────────────────────────

const p3Nodes: GraphNode[] = [
  n({ id:'p3-d1', type:'domain', value:'beacon-c2[.]net',          x:560, y:360, risk:'HIGH',   action:'confirmed', note:'Primary Cobalt Strike Team Server. Beacon TTL 60s. JA3 hash confirmed CS default.' }),
  n({ id:'p3-d2', type:'domain', value:'update-task-relay[.]io',   x:760, y:320, risk:'HIGH',   action:'confirmed' }),
  n({ id:'p3-d3', type:'domain', value:'api-telemetry-cdn[.]net',  x:740, y:505, risk:'MEDIUM', action:'suspect'   }),
  n({ id:'p3-d4', type:'domain', value:'hrzn-sync-agent[.]cc',     x:880, y:440, risk:'MEDIUM', action:'suspect'   }),
  n({ id:'p3-d5', type:'domain', value:'infra-link-relay[.]net',   x:955, y:320, risk:'LOW',    action:'unknown'   }),
  n({ id:'p3-d6', type:'domain', value:'agent-persist[.]io',       x:960, y:510, risk:'LOW',    action:'unknown'   }),
  n({ id:'p3-ip1', type:'ip',   value:'192.241.228.246',           x:400, y:225, risk:'HIGH',   action:'confirmed', note:'DigitalOcean VPS. Malleable C2 profile matches "amazon" variant. ASN 14061.' }),
  n({ id:'p3-ip2', type:'ip',   value:'147.182.235.42',            x:420, y:380, risk:'HIGH',   action:'confirmed' }),
  n({ id:'p3-ip3', type:'ip',   value:'104.236.185.170',           x:400, y:535, risk:'HIGH',   action:'confirmed' }),
  n({ id:'p3-ip4', type:'ip',   value:'165.232.173.254',           x:530, y:565, risk:'MEDIUM', action:'suspect'   }),
  n({ id:'p3-ip5', type:'ip',   value:'157.230.126.132',           x:640, y:575, risk:'MEDIUM', action:'suspect'   }),
  n({ id:'p3-ip6', type:'ip',   value:'178.62.102.163',            x:330, y:475, risk:'MEDIUM', action:'suspect'   }),
  n({ id:'p3-ip7', type:'ip',   value:'188.166.208.181',           x:305, y:315, risk:'LOW',    action:'unknown'   }),
  n({ id:'p3-ip8', type:'ip',   value:'46.101.134.225',            x:490, y:200, risk:'LOW',    action:'unknown'   }),
  n({ id:'p3-o1', type:'org',   value:'DigitalOcean Inc',          x:230, y:600, risk:'NONE',   action:'witness'   }),
  n({ id:'p3-o2', type:'org',   value:'Sharktech LLC',             x:435, y:665, risk:'NONE',   action:'witness'   }),
]

const p3Edges: GraphEdge[] = [
  e({ id:'p3-e01', source:'p3-ip1', target:'p3-d1', label:'C2 server',  rel:'A', acc:'1' }),
  e({ id:'p3-e02', source:'p3-ip2', target:'p3-d1', label:'beacon',     rel:'A', acc:'1' }),
  e({ id:'p3-e03', source:'p3-ip3', target:'p3-d2', label:'C2 server',  rel:'A', acc:'1' }),
  e({ id:'p3-e04', source:'p3-ip4', target:'p3-d2', label:'beacon',     rel:'B', acc:'2' }),
  e({ id:'p3-e05', source:'p3-ip5', target:'p3-d3', label:'hosts',      rel:'B', acc:'2' }),
  e({ id:'p3-e06', source:'p3-ip6', target:'p3-d4', label:'hosts',      rel:'B', acc:'2' }),
  e({ id:'p3-e07', source:'p3-ip7', target:'p3-d5', label:'hosts',      rel:'C', acc:'3' }),
  e({ id:'p3-e08', source:'p3-ip8', target:'p3-d6', label:'hosts',      rel:'C', acc:'3' }),
  e({ id:'p3-e09', source:'p3-d1',  target:'p3-d2', label:'linked',     rel:'A', acc:'1' }),
  e({ id:'p3-e10', source:'p3-d1',  target:'p3-d3', label:'tracks via', rel:'B', acc:'2' }),
  e({ id:'p3-e11', source:'p3-d2',  target:'p3-d4', label:'redirects',  rel:'B', acc:'2' }),
  e({ id:'p3-e12', source:'p3-d3',  target:'p3-d5', label:'mirrors',    rel:'C', acc:'3' }),
  e({ id:'p3-e13', source:'p3-d4',  target:'p3-d6', label:'C2 panel',   rel:'B', acc:'2' }),
  e({ id:'p3-e14', source:'p3-o1',  target:'p3-ip1', label:'ASN',       rel:'A', acc:'1' }),
  e({ id:'p3-e15', source:'p3-o1',  target:'p3-ip2', label:'ASN',       rel:'A', acc:'1' }),
  e({ id:'p3-e16', source:'p3-o1',  target:'p3-ip3', label:'ASN',       rel:'A', acc:'1' }),
  e({ id:'p3-e17', source:'p3-o1',  target:'p3-ip4', label:'ASN',       rel:'A', acc:'1' }),
  e({ id:'p3-e18', source:'p3-o2',  target:'p3-ip5', label:'ASN',       rel:'A', acc:'1' }),
  e({ id:'p3-e19', source:'p3-o2',  target:'p3-ip6', label:'ASN',       rel:'A', acc:'1' }),
  e({ id:'p3-e20', source:'p3-o2',  target:'p3-ip7', label:'ASN',       rel:'A', acc:'1' }),
  e({ id:'p3-e21', source:'p3-o2',  target:'p3-ip8', label:'ASN',       rel:'A', acc:'1' }),
]

// ─── p4: Romance Fraud Network ───────────────────────────────────────────────

const p4Nodes: GraphNode[] = [
  n({ id:'p4-p1', type:'person', value:'David Okonkwo',                  x:530, y:380, risk:'HIGH',   action:'suspect',  note:'Primary suspect. Posed as "Dr. Michael Hart" (US Army) and "James Collins" (offshore engineer).' }),
  n({ id:'p4-p2', type:'person', value:'Rose Abberley',                  x:265, y:245, risk:'NONE',   action:'victim',   note:'72 years old. Lost £41,200 over 8 months. Still in contact with suspect as of May 2026.' }),
  n({ id:'p4-p3', type:'person', value:'Femi Hassan',                    x:250, y:385, risk:'NONE',   action:'victim'   }),
  n({ id:'p4-p4', type:'person', value:'Lydia Stern',                    x:265, y:525, risk:'NONE',   action:'victim'   }),
  n({ id:'p4-p5', type:'person', value:'Emma Cairns',                    x:250, y:665, risk:'NONE',   action:'victim'   }),
  n({ id:'p4-e1', type:'email',  value:'d.okonkwo1990@gmail.com',        x:530, y:220, risk:'HIGH',   action:'confirmed' }),
  n({ id:'p4-e2', type:'email',  value:'romantic.soul.2026@hushmail.com', x:705, y:285, risk:'MEDIUM', action:'suspect',  note:'Hush alias used to contact victims. Account opened 2026-01-03.' }),
  n({ id:'p4-e3', type:'email',  value:'funds.transfer.ng@gmail.com',    x:725, y:495, risk:'HIGH',   action:'confirmed', note:'Used exclusively to receive wire transfers from victims.' }),
  n({ id:'p4-ph1', type:'phone', value:'+2348091234567',                 x:620, y:555, risk:'MEDIUM', action:'suspect',  note:'Nigerian MTN MSISDN. Subscriber name not yet obtained.' }),
  n({ id:'p4-ph2', type:'phone', value:'+447700900234',                  x:430, y:545, risk:'LOW',    action:'unknown',  note:'UK VoIP number (Vonage). Forwarded to Nigerian number.' }),
  n({ id:'p4-o1', type:'org',    value:'Western Union Business Solutions', x:880, y:445, risk:'NONE', action:'witness'   }),
]

const p4Edges: GraphEdge[] = [
  e({ id:'p4-e01', source:'p4-p1',  target:'p4-e1',  label:'primary email', rel:'A', acc:'1' }),
  e({ id:'p4-e02', source:'p4-p1',  target:'p4-e2',  label:'alias email',   rel:'B', acc:'2' }),
  e({ id:'p4-e03', source:'p4-p1',  target:'p4-e3',  label:'receives funds',rel:'A', acc:'1' }),
  e({ id:'p4-e04', source:'p4-p1',  target:'p4-ph1', label:'uses',          rel:'B', acc:'2' }),
  e({ id:'p4-e05', source:'p4-p1',  target:'p4-ph2', label:'VoIP alias',    rel:'C', acc:'3' }),
  e({ id:'p4-e06', source:'p4-p2',  target:'p4-e2',  label:'contacted by',  rel:'A', acc:'1' }),
  e({ id:'p4-e07', source:'p4-p3',  target:'p4-e2',  label:'contacted by',  rel:'A', acc:'1' }),
  e({ id:'p4-e08', source:'p4-p4',  target:'p4-ph2', label:'contacted by',  rel:'A', acc:'1' }),
  e({ id:'p4-e09', source:'p4-p5',  target:'p4-ph1', label:'contacted by',  rel:'A', acc:'1' }),
  e({ id:'p4-e10', source:'p4-p2',  target:'p4-o1',  label:'wired funds via',rel:'A', acc:'1' }),
  e({ id:'p4-e11', source:'p4-p3',  target:'p4-o1',  label:'wired funds via',rel:'A', acc:'1' }),
  e({ id:'p4-e12', source:'p4-p4',  target:'p4-o1',  label:'wired funds via',rel:'A', acc:'1' }),
  e({ id:'p4-e13', source:'p4-o1',  target:'p4-e3',  label:'payment to',    rel:'A', acc:'1' }),
  e({ id:'p4-e14', source:'p4-p5',  target:'p4-e1',  label:'contacted by',  rel:'B', acc:'2' }),
]

// ─── p5: Phishing Kit — HMRC Spoof ───────────────────────────────────────────

const p5Nodes: GraphNode[] = [
  n({ id:'p5-d1', type:'domain', value:'hmrc-refund-portal[.]net',      x:520, y:355, risk:'HIGH',   action:'confirmed', note:'Primary phishing kit. Perfect HMRC Gov.uk clone. Active since 2026-05-29. Takedown referred.' }),
  n({ id:'p5-d2', type:'domain', value:'gov-uk-refund[.]com',           x:720, y:275, risk:'HIGH',   action:'confirmed' }),
  n({ id:'p5-d3', type:'domain', value:'ukgov-taxreturn[.]net',         x:720, y:480, risk:'HIGH',   action:'confirmed' }),
  n({ id:'p5-d4', type:'domain', value:'hmrc-claimrefund[.]org',        x:880, y:335, risk:'MEDIUM', action:'suspect'   }),
  n({ id:'p5-d5', type:'domain', value:'refund-hmrc[.]co',              x:880, y:500, risk:'MEDIUM', action:'suspect'   }),
  n({ id:'p5-d6', type:'domain', value:'tax-return-uk[.]net',           x:1000, y:415, risk:'LOW',   action:'unknown'   }),
  n({ id:'p5-ip1', type:'ip',   value:'94.130.162.46',                  x:325, y:235, risk:'HIGH',   action:'confirmed', note:'Hetzner VPS. Hosts primary and secondary phishing domains. First seen 2026-05-28.' }),
  n({ id:'p5-ip2', type:'ip',   value:'78.141.219.34',                  x:315, y:380, risk:'HIGH',   action:'confirmed' }),
  n({ id:'p5-ip3', type:'ip',   value:'185.220.101.12',                 x:325, y:525, risk:'MEDIUM', action:'suspect'   }),
  n({ id:'p5-ip4', type:'ip',   value:'45.77.62.109',                   x:305, y:665, risk:'LOW',    action:'unknown'   }),
  n({ id:'p5-e1', type:'email', value:'refunds@hmrc-refund-portal[.]net', x:600, y:520, risk:'HIGH', action:'confirmed' }),
  n({ id:'p5-e2', type:'email', value:'noreply@tax-return-uk[.]net',    x:1055, y:300, risk:'MEDIUM', action:'suspect'  }),
  n({ id:'p5-e3', type:'email', value:'notifications@ukgov-taxreturn[.]net', x:760, y:645, risk:'MEDIUM', action:'suspect' }),
  n({ id:'p5-u1', type:'url',   value:'hmrc-refund-portal[.]net/submit', x:640, y:210, risk:'HIGH',  action:'confirmed', note:'Credential harvesting endpoint. Captures NI number, UTR, and bank details.' }),
]

const p5Edges: GraphEdge[] = [
  e({ id:'p5-e01', source:'p5-ip1', target:'p5-d1', label:'hosts',        rel:'A', acc:'1' }),
  e({ id:'p5-e02', source:'p5-ip1', target:'p5-d2', label:'hosts',        rel:'A', acc:'1' }),
  e({ id:'p5-e03', source:'p5-ip2', target:'p5-d3', label:'hosts',        rel:'A', acc:'1' }),
  e({ id:'p5-e04', source:'p5-ip3', target:'p5-d4', label:'hosts',        rel:'B', acc:'2' }),
  e({ id:'p5-e05', source:'p5-ip4', target:'p5-d5', label:'hosts',        rel:'C', acc:'3' }),
  e({ id:'p5-e06', source:'p5-ip4', target:'p5-d6', label:'hosts',        rel:'C', acc:'3' }),
  e({ id:'p5-e07', source:'p5-d1',  target:'p5-d2', label:'redirects',    rel:'A', acc:'1' }),
  e({ id:'p5-e08', source:'p5-d1',  target:'p5-d3', label:'mirrors',      rel:'A', acc:'1' }),
  e({ id:'p5-e09', source:'p5-d2',  target:'p5-d4', label:'linked kit',   rel:'B', acc:'2' }),
  e({ id:'p5-e10', source:'p5-d3',  target:'p5-d5', label:'linked kit',   rel:'B', acc:'2' }),
  e({ id:'p5-e11', source:'p5-d4',  target:'p5-d6', label:'redirects',    rel:'C', acc:'3' }),
  e({ id:'p5-e12', source:'p5-d1',  target:'p5-e1', label:'sends phishing',rel:'A', acc:'1' }),
  e({ id:'p5-e13', source:'p5-d3',  target:'p5-e3', label:'sends phishing',rel:'B', acc:'2' }),
  e({ id:'p5-e14', source:'p5-d6',  target:'p5-e2', label:'sends phishing',rel:'C', acc:'3' }),
  e({ id:'p5-e15', source:'p5-e1',  target:'p5-u1', label:'links to',     rel:'A', acc:'1' }),
  e({ id:'p5-e16', source:'p5-d1',  target:'p5-u1', label:'contains',     rel:'A', acc:'1' }),
  e({ id:'p5-e17', source:'p5-ip1', target:'p5-ip2', label:'same registrant', rel:'B', acc:'2' }),
]

// ─── Export ──────────────────────────────────────────────────────────────────

export interface SeedGraph {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export const SEED_GRAPHS: Record<string, SeedGraph> = {
  p1: { nodes: p1Nodes, edges: p1Edges },
  p2: { nodes: p2Nodes, edges: p2Edges },
  p3: { nodes: p3Nodes, edges: p3Edges },
  p4: { nodes: p4Nodes, edges: p4Edges },
  p5: { nodes: p5Nodes, edges: p5Edges },
}
