import React from 'react'
import { IndustryPage, IndustryConfig } from '../components/IndustryPage'

const config: IndustryConfig = {
  index: '01',
  name: 'Law Enforcement',
  tagline: 'Police, NCA & National Agencies',
  headline: 'Build the network map that holds up in court.',
  subheadline: 'From the first indicator to an evidential-quality entity picture — Raven gives police forces, the NCA, and national agencies a link analysis tool built for serious and organised crime investigation.',
  coverPhoto: 'photo-1550751827-4bd374c3f58b',
  coverPhotoAlt: 'Law enforcement operations centre with multiple screens in low light',
  stats: [
    { value: 'STANAG 2511', label: 'Intel grading standard — built into the data model' },
    { value: 'Court-ready', label: 'Classification-encoded export with full audit trail' },
    { value: '< 30 min', label: 'From first indicator to shared entity picture' },
  ],
  challengeIntro: 'Law enforcement investigations into serious and organised crime generate enormous volumes of intelligence — digital, financial, and human source. The challenge is not collecting it. The challenge is turning it into a structured, graded, classifiable picture that can be shared across forces, survives the disclosure process, and holds up in court.',
  challenges: [
    {
      title: 'Intelligence silos',
      body: 'Each system — PNC, force systems, email, analytical products — holds a fragment of the picture. Building the whole requires manual extraction and re-entry into spreadsheets and presentations that do not travel, cannot be shared cleanly, and carry no grading.',
    },
    {
      title: 'Court disclosure exposure',
      body: 'Unstructured working practices create disclosure risk. If the investigation record is not audit-trailed from day one — who added what entity, when, on what intelligence — the defence will find the gaps. Post-hoc reconstruction is slow and unreliable.',
    },
    {
      title: 'Cross-force intelligence sharing',
      body: 'Sharing entity pictures between forces, or upward to the NCA, happens by email attachment in ad hoc formats — no grading, no controlled release, no record of what was shared with whom. STIX 2.1 over TAXII is the standard. Almost no tool produces it cleanly.',
    },
  ],
  capabilities: [
    {
      tag: 'Graph-based link analysis',
      title: 'Map networks, not just names.',
      body: 'Raven\'s canvas lets investigators build entity relationship graphs connecting people, accounts, addresses, phones, digital identifiers, and organisations. Each relationship carries its own intelligence grade and classification marking — encoded in the data from the moment the link is drawn, not applied to a document at the end.',
      photo: 'photo-1504711434969-e33886168f5c',
      photoAlt: 'Analyst reviewing documents and building an entity network',
    },
    {
      tag: 'STANAG 2511 intel grading',
      title: 'Every link carries its assessed reliability.',
      body: 'Source evaluation and information reliability grading (NATO STANAG 2511 4×4 scale) are built into the Raven data model — not optional annotations. Every entity and relationship carries an assessed grade, so the picture downstream consumers receive is unambiguous about what is established versus what is assessed.',
      photo: 'photo-1551288049-bebda4e38f71',
      photoAlt: 'Data analytics dashboard showing network connections and analysis',
    },
    {
      tag: 'Evidential export',
      title: 'Court-ready from the first node.',
      body: 'Export entity pictures as classification-marked PNG for briefing packs and prosecution files, or as STIX 2.1 bundles for machine-readable handoff to partner agencies. Full audit trails — who added what, when, at what grade — are generated automatically, meeting disclosure obligations from the start of the investigation.',
      photo: 'photo-1589829545856-d10d557cf95f',
      photoAlt: 'Legal documents and case files being reviewed in a formal setting',
    },
  ],
  useCases: [
    {
      title: 'Serious and organised crime mapping',
      body: 'Build entity relationship graphs of SOC networks from intelligence fragments — tracing relationships between nominal entities, addresses, vehicles, phones, and communications data.',
    },
    {
      title: 'Digital infrastructure tracing',
      body: 'Starting from an IP address, domain, or email address, automatically enrich through Shodan, crt.sh, IPinfo, and VirusTotal to map attacker or offender infrastructure across campaigns.',
    },
    {
      title: 'Cross-force operation coordination',
      body: 'Share classified entity pictures with partner forces or the NCA via STIX 2.1 — with grading and classification markings intact, and a full audit trail of what was shared and when.',
    },
    {
      title: 'Disclosure preparation',
      body: 'Generate audit trails of the complete investigation record from day one — every entity, every link, every enrichment, and who made the assessment — meeting disclosure obligations under the CPIA.',
    },
    {
      title: 'Proceeds of crime tracing',
      body: 'Follow asset chains through individuals, businesses, and jurisdictions — building the financial entity picture needed for Proceeds of Crime Act applications and asset recovery.',
    },
    {
      title: 'Counter-terrorism entity mapping',
      body: 'Map network and infrastructure relationships for CT investigations — persons, financing, communications infrastructure, and travel — with OFFICIAL-SENSITIVE classification built in.',
    },
  ],
  related: [
    { name: 'Financial Crime',       path: '/industries/financial-crime' },
    { name: 'Financial Intel Units', path: '/industries/financial-intel-units' },
    { name: 'Intelligence Agencies', path: '/industries/intelligence-agencies' },
    { name: 'Cyber & Threat Intel',  path: '/industries/cyber-threat-intel' },
    { name: 'Counter-Fraud',         path: '/industries/counter-fraud' },
  ],
}

export function LawEnforcementPage() {
  return <IndustryPage config={config} />
}
