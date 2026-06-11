import type { EntityType, RiskFlag, ActionFlag } from '../types/graph'

export interface TemplateNode {
  localId: string
  type: EntityType
  value: string          // may contain [PLACEHOLDER] syntax
  note?: string
  riskFlag: RiskFlag
  actionFlag: ActionFlag
  posOffset: { x: number; y: number }  // relative to canvas centre
}

export interface TemplateEdge {
  from: string
  to: string
  label?: string
}

export interface CaseTemplate {
  id: string
  name: string
  tagline: string
  category: 'fraud' | 'phishing' | 'infrastructure' | 'romance' | 'bec'
  categoryLabel: string
  categoryColor: string
  icon: string  // UIIcon name
  classification: string
  nodes: TemplateNode[]
  edges: TemplateEdge[]
  suggestedTransforms: string[]
  caseRefPrefix: string
}

export const CASE_TEMPLATES: CaseTemplate[] = [
  // ── APP Fraud ──────────────────────────────────────────────────────────────
  {
    id: 'app-fraud',
    name: 'APP Fraud',
    tagline: 'Authorised Push Payment fraud — victim, mule account, and receiving bank chain.',
    category: 'fraud',
    categoryLabel: 'Financial Crime',
    categoryColor: '#F85149',
    icon: 'bank',
    classification: 'OFFICIAL-SENSITIVE',
    caseRefPrefix: 'APP',
    suggestedTransforms: ['companies_house', 'abuseipdb'],
    nodes: [
      {
        localId: 'victim',
        type: 'person',
        value: '[VICTIM NAME]',
        note: 'Victim of authorised push payment fraud.',
        riskFlag: 'NONE',
        actionFlag: 'victim',
        posOffset: { x: -320, y: 0 },
      },
      {
        localId: 'suspect',
        type: 'person',
        value: '[SUSPECT NAME]',
        note: 'Suspected orchestrator or money mule.',
        riskFlag: 'HIGH',
        actionFlag: 'suspect',
        posOffset: { x: 320, y: -120 },
      },
      {
        localId: 'mule-account',
        type: 'bank',
        value: '[MULE ACCOUNT IBAN/SORT-ACCOUNT]',
        note: 'First-hop mule account receiving fraudulent payment.',
        riskFlag: 'HIGH',
        actionFlag: 'suspect',
        posOffset: { x: 0, y: -120 },
      },
      {
        localId: 'destination',
        type: 'bank',
        value: '[DESTINATION ACCOUNT]',
        note: 'Onward destination account — may be layering hop.',
        riskFlag: 'HIGH',
        actionFlag: 'suspect',
        posOffset: { x: 0, y: 120 },
      },
      {
        localId: 'fraud-report',
        type: 'fraudreport',
        value: '[FRAUD REPORT REF]',
        note: 'Fraud report / case reference from reporting institution.',
        riskFlag: 'NONE',
        actionFlag: 'unknown',
        posOffset: { x: -320, y: 200 },
      },
    ],
    edges: [
      { from: 'victim', to: 'mule-account',  label: 'sent funds to' },
      { from: 'mule-account', to: 'destination', label: 'forwarded to' },
      { from: 'suspect', to: 'mule-account',  label: 'controls' },
      { from: 'victim', to: 'fraud-report',   label: 'reported' },
    ],
  },

  // ── Phishing Investigation ──────────────────────────────────────────────────
  {
    id: 'phishing',
    name: 'Phishing Investigation',
    tagline: 'Phishing kit — URL, hosting infrastructure, harvesting domain, and victim.',
    category: 'phishing',
    categoryLabel: 'Phishing',
    categoryColor: '#D29922',
    icon: 'url',
    classification: 'OFFICIAL-SENSITIVE',
    caseRefPrefix: 'PHISH',
    suggestedTransforms: ['urlhaus', 'virustotal', 'crtsh_domain'],
    nodes: [
      {
        localId: 'phish-url',
        type: 'url',
        value: '[PHISHING URL]',
        note: 'Primary phishing URL reported or discovered.',
        riskFlag: 'HIGH',
        actionFlag: 'suspect',
        posOffset: { x: 0, y: -200 },
      },
      {
        localId: 'hosting-domain',
        type: 'domain',
        value: '[HOSTING DOMAIN]',
        note: 'Domain hosting the phishing kit.',
        riskFlag: 'HIGH',
        actionFlag: 'suspect',
        posOffset: { x: 0, y: 0 },
      },
      {
        localId: 'hosting-ip',
        type: 'ip',
        value: '[HOSTING IP]',
        note: 'IP address of phishing host.',
        riskFlag: 'MEDIUM',
        actionFlag: 'suspect',
        posOffset: { x: 240, y: 0 },
      },
      {
        localId: 'kit-hash',
        type: 'hash',
        value: '[KIT FILE HASH]',
        note: 'SHA256 or MD5 of the phishing kit archive.',
        riskFlag: 'HIGH',
        actionFlag: 'suspect',
        posOffset: { x: 0, y: 200 },
      },
      {
        localId: 'victim-email',
        type: 'email',
        value: '[VICTIM EMAIL]',
        note: 'Victim who interacted with or was targeted by the phishing site.',
        riskFlag: 'NONE',
        actionFlag: 'victim',
        posOffset: { x: -280, y: 0 },
      },
    ],
    edges: [
      { from: 'phish-url',       to: 'hosting-domain', label: 'hosted on' },
      { from: 'hosting-domain',  to: 'hosting-ip',      label: 'resolves to' },
      { from: 'phish-url',       to: 'kit-hash',        label: 'delivers' },
      { from: 'victim-email',    to: 'phish-url',        label: 'targeted by' },
    ],
  },

  // ── Romance Fraud / Pig Butchering ─────────────────────────────────────────
  {
    id: 'romance-fraud',
    name: 'Romance Fraud',
    tagline: 'Pig butchering / romance fraud — fake profile, victim, and crypto flow.',
    category: 'romance',
    categoryLabel: 'Romance / Crypto Fraud',
    categoryColor: '#F472B6',
    icon: 'social',
    classification: 'OFFICIAL-SENSITIVE',
    caseRefPrefix: 'ROM',
    suggestedTransforms: ['virustotal'],
    nodes: [
      {
        localId: 'profile',
        type: 'social',
        value: '[FRAUDSTER SOCIAL PROFILE URL]',
        note: 'Fake social media or dating profile used to build trust.',
        riskFlag: 'HIGH',
        actionFlag: 'suspect',
        posOffset: { x: 0, y: -200 },
      },
      {
        localId: 'fraudster-phone',
        type: 'phone',
        value: '[FRAUDSTER PHONE / WHATSAPP]',
        note: 'Contact number used by the fraudster.',
        riskFlag: 'HIGH',
        actionFlag: 'suspect',
        posOffset: { x: 240, y: -120 },
      },
      {
        localId: 'victim',
        type: 'person',
        value: '[VICTIM NAME]',
        note: 'Victim recruited via romantic contact.',
        riskFlag: 'NONE',
        actionFlag: 'victim',
        posOffset: { x: -280, y: 0 },
      },
      {
        localId: 'fake-platform',
        type: 'url',
        value: '[FAKE INVESTMENT PLATFORM URL]',
        note: 'Fraudulent trading or investment platform used for pig butchering.',
        riskFlag: 'HIGH',
        actionFlag: 'suspect',
        posOffset: { x: 240, y: 120 },
      },
      {
        localId: 'wallet',
        type: 'wallet',
        value: '[CRYPTO WALLET ADDRESS]',
        note: 'Destination wallet receiving victim funds.',
        riskFlag: 'HIGH',
        actionFlag: 'suspect',
        posOffset: { x: 0, y: 200 },
      },
    ],
    edges: [
      { from: 'profile',          to: 'victim',           label: 'targeted' },
      { from: 'profile',          to: 'fraudster-phone',  label: 'contacted via' },
      { from: 'profile',          to: 'fake-platform',    label: 'promoted' },
      { from: 'victim',           to: 'wallet',           label: 'sent funds to' },
    ],
  },

  // ── Infrastructure Reconnaissance ──────────────────────────────────────────
  {
    id: 'infra-recon',
    name: 'Infrastructure Recon',
    tagline: 'Map a threat actor\'s hosting, domains, and certificates from a seed indicator.',
    category: 'infrastructure',
    categoryLabel: 'Infrastructure',
    categoryColor: '#56C2E6',
    icon: 'domain',
    classification: 'OFFICIAL',
    caseRefPrefix: 'INFRA',
    suggestedTransforms: ['crtsh_domain', 'virustotal', 'urlhaus'],
    nodes: [
      {
        localId: 'seed-domain',
        type: 'domain',
        value: '[SEED DOMAIN]',
        note: 'Starting domain — run crt.sh and DNS transforms from here.',
        riskFlag: 'MEDIUM',
        actionFlag: 'suspect',
        posOffset: { x: 0, y: 0 },
      },
      {
        localId: 'seed-ip',
        type: 'ip',
        value: '[SEED IP]',
        note: 'Known IP associated with threat actor infrastructure.',
        riskFlag: 'MEDIUM',
        actionFlag: 'suspect',
        posOffset: { x: 300, y: 0 },
      },
      {
        localId: 'registrant-org',
        type: 'org',
        value: '[REGISTRANT ORG / PRIVACY SHIELD]',
        note: 'Domain registrant — may be a privacy shield or shell entity.',
        riskFlag: 'LOW',
        actionFlag: 'unknown',
        posOffset: { x: 0, y: -200 },
      },
    ],
    edges: [
      { from: 'seed-domain',    to: 'seed-ip',          label: 'resolves to' },
      { from: 'registrant-org', to: 'seed-domain',       label: 'registered' },
    ],
  },

  // ── Business Email Compromise ──────────────────────────────────────────────
  {
    id: 'bec',
    name: 'Business Email Compromise',
    tagline: 'BEC attack — compromised inbox, spoofed sender, target org, and receiving account.',
    category: 'bec',
    categoryLabel: 'BEC / Impersonation',
    categoryColor: '#818CF8',
    icon: 'email',
    classification: 'OFFICIAL-SENSITIVE',
    caseRefPrefix: 'BEC',
    suggestedTransforms: ['crtsh_domain', 'virustotal'],
    nodes: [
      {
        localId: 'compromised-email',
        type: 'email',
        value: '[COMPROMISED ACCOUNT EMAIL]',
        note: 'Legitimate account compromised by threat actor.',
        riskFlag: 'HIGH',
        actionFlag: 'victim',
        posOffset: { x: -280, y: -120 },
      },
      {
        localId: 'attacker-email',
        type: 'email',
        value: '[ATTACKER / SPOOFED EMAIL]',
        note: 'Email address used to spoof or impersonate the compromised account.',
        riskFlag: 'HIGH',
        actionFlag: 'suspect',
        posOffset: { x: 280, y: -120 },
      },
      {
        localId: 'target-org',
        type: 'org',
        value: '[TARGET ORGANISATION]',
        note: 'Organisation targeted by the BEC attack (finance department).',
        riskFlag: 'NONE',
        actionFlag: 'victim',
        posOffset: { x: 0, y: -200 },
      },
      {
        localId: 'redirect-domain',
        type: 'domain',
        value: '[LOOKALIKE / REDIRECT DOMAIN]',
        note: 'Typosquatted or lookalike domain used in the attack.',
        riskFlag: 'HIGH',
        actionFlag: 'suspect',
        posOffset: { x: 280, y: 100 },
      },
      {
        localId: 'receiving-account',
        type: 'bank',
        value: '[RECEIVING BANK ACCOUNT]',
        note: 'Account to which victim was directed to transfer funds.',
        riskFlag: 'HIGH',
        actionFlag: 'suspect',
        posOffset: { x: 0, y: 160 },
      },
    ],
    edges: [
      { from: 'attacker-email',     to: 'compromised-email',   label: 'spoofed' },
      { from: 'attacker-email',     to: 'target-org',          label: 'impersonated' },
      { from: 'redirect-domain',    to: 'attacker-email',      label: 'hosts' },
      { from: 'target-org',         to: 'receiving-account',   label: 'redirected to' },
    ],
  },
]
