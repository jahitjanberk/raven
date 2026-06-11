import React from 'react'
import { IndustryPage, IndustryConfig } from '../components/IndustryPage'

const config: IndustryConfig = {
  index: '07',
  name: 'Insurance',
  tagline: 'Insurance Fraud & SIU Teams',
  headline: 'Map organised fraud rings. Build the case for recovery.',
  subheadline: 'Special investigation units and fraud teams at insurers use Raven to map organised fraud rings, identify shared infrastructure across staged claims, and produce structured case files for prosecution and civil recovery.',
  coverPhoto: 'photo-1507679799987-c73779587ccf',
  coverPhotoAlt: 'Insurance fraud investigator reviewing cross-claim data and entity networks',
  stats: [
    { value: '4× faster', label: 'Fraud ring mapping vs. manual spreadsheet workflows' },
    { value: 'Court-ready', label: 'Structured case files with full audit trail and provenance' },
    { value: 'STIX 2.1',   label: 'Cross-insurer and law enforcement intelligence sharing' },
  ],
  challengeIntro: 'Insurance fraud costs UK insurers over £1 billion per year. Organised rings — staged road accidents, ghost broking, application fraud, and phantom injury claims — are engineered to look like isolated incidents. The connection between them is visible only when you can graph the shared identifiers across your full claims database — and most claims management systems were not built for that.',
  challenges: [
    {
      title: 'Claims look isolated at intake',
      body: 'Each claim arrives as an independent record. The shared phone number, the common address, the same device fingerprint used across twelve submissions — none of that is visible at the claim level. Identifying the ring requires entity correlation across your whole book, not just the flagged claim in front of you.',
    },
    {
      title: 'Building prosecution-ready case files',
      body: 'A well-evidenced case file for prosecution or civil recovery needs structured entity data, a clear timeline, and an audit trail showing who concluded what on what basis. Reconstructing that from claims system exports and adjuster notes — after the fact — takes weeks and produces outputs of variable quality.',
    },
    {
      title: 'Cross-insurer intelligence',
      body: 'The same organised ring almost always operates across multiple insurers simultaneously. But there is no standard format for sharing entity intelligence between competing carriers — and most fraud teams have no way to send or receive structured data that their peers can act on directly.',
    },
  ],
  capabilities: [
    {
      tag: 'Fraud ring mapping',
      title: 'From isolated claim to complete network in one session.',
      body: 'Build entity graphs connecting claimants, witnesses, third parties, vehicles, addresses, phone numbers, and solicitors across multiple claims. Shared identifiers surface automatically as you add entities — turning isolated flagged claims into a visible network map that shows the structure of the ring and the roles within it.',
      photo: 'photo-1551288049-bebda4e38f71',
      photoAlt: 'Data analysis dashboard showing cross-claim entity relationships',
    },
    {
      tag: 'Cross-claim entity correlation',
      title: 'Surface the shared infrastructure across your entire book.',
      body: 'Automated OSINT enrichment adds digital context to every entity — phone number carriers, domain registrations, email reputation, and business registry data. Raven\'s enrichment is privacy-preserving: only the entity value is sent to the provider, never your claims data or investigation notes.',
      photo: 'photo-1554224155-8d04cb21cd6c',
      photoAlt: 'Financial investigation analysis showing cross-entity correlations',
    },
    {
      tag: 'Case file production',
      title: 'From graph to structured case file in one step.',
      body: 'Export the entity picture and full audit trail as a structured case file for prosecution authorities, civil recovery solicitors, or law enforcement referral. Every link, every enrichment, every analyst note is captured — with provenance showing who concluded what and when. Export as STIX 2.1 for cross-insurer sharing or classified PNG for legal briefings.',
      photo: 'photo-1589829545856-d10d557cf95f',
      photoAlt: 'Legal case file preparation with structured fraud evidence documentation',
    },
  ],
  useCases: [
    {
      title: 'Staged accident ring mapping',
      body: 'Map the network of claimants, witnesses, vehicles, and solicitors involved in staged road accident rings — identifying the coordinator, the phantom passengers, and the repeat infrastructure.',
    },
    {
      title: 'Application fraud detection',
      body: 'Identify shared addresses, phone numbers, and email domains across policy applications — surfacing the organised ring behind high-volume low-value application fraud that individual policy checks miss.',
    },
    {
      title: 'Ghost broking investigation',
      body: 'Trace the network behind ghost broking operations — linking the intermediaries, the genuine insured, and the fraudulent policy infrastructure across multiple carriers.',
    },
    {
      title: 'Cross-insurer intelligence sharing',
      body: 'Share structured entity pictures with other insurers or the Insurance Fraud Bureau via STIX 2.1 — maintaining intelligence grades and provenance throughout the sharing chain.',
    },
    {
      title: 'Law enforcement referral',
      body: 'Produce STIX 2.1 referral packages for police and Action Fraud that meet the format requirements for machine-readable intelligence — reducing re-entry time at the receiving agency.',
    },
    {
      title: 'Civil recovery case preparation',
      body: 'Build the structured entity picture and audit trail needed for civil recovery proceedings — with every enrichment, every link, and every analyst assessment documented from day one.',
    },
  ],
  related: [
    { name: 'Law Enforcement',    path: '/industries/law-enforcement' },
    { name: 'Financial Crime',    path: '/industries/financial-crime' },
    { name: 'Counter-Fraud',      path: '/industries/counter-fraud' },
    { name: 'Legal & Compliance', path: '/industries/legal-compliance' },
  ],
}

export function InsuranceSectorPage() {
  return <IndustryPage config={config} />
}
