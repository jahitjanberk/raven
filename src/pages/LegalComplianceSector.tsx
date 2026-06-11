import React from 'react'
import { IndustryPage, IndustryConfig } from '../components/IndustryPage'

const config: IndustryConfig = {
  index: '08',
  name: 'Legal & Compliance',
  tagline: 'Financial Crime Law Firms & In-House Teams',
  headline: 'Entity diagrams that work in the boardroom and the courtroom.',
  subheadline: 'Financial crime law firms and in-house legal and compliance teams use Raven to build court-ready entity relationship diagrams, organise evidence across complex multi-defendant cases, and share structured findings with law enforcement partners.',
  coverPhoto: 'photo-1589829545856-d10d557cf95f',
  coverPhotoAlt: 'Legal professional reviewing complex multi-defendant case documentation',
  stats: [
    { value: 'Court-ready',  label: 'Classified PNG export with case markings for disclosure' },
    { value: 'Multi-case',   label: 'Entity networks spanning unlimited defendants and jurisdictions' },
    { value: 'STIX 2.1',    label: 'Structured handoff format for law enforcement partners' },
  ],
  challengeIntro: 'Complex financial crime cases involve dozens of defendants, hundreds of entities, and thousands of evidential references — spread across transaction records, corporate registries, digital evidence, and witness accounts. Building a picture that a court, a client, or a law enforcement partner can understand requires more than a spreadsheet and a diagram tool.',
  challenges: [
    {
      title: 'Case complexity at scale',
      body: 'Multi-defendant financial crime cases routinely involve 50+ individuals, dozens of companies, and cross-jurisdictional asset chains. Managing that complexity in a flat case management system or a presentation tool produces diagrams that are accurate at the moment of creation and wrong by the time they reach the courtroom.',
    },
    {
      title: 'Court exhibit requirements',
      body: 'A court exhibit must carry case reference, classification marking, and provenance. A diagram produced in PowerPoint or Visio carries none of those. The classification and evidentiary status of the picture need to travel with the picture — not be added as a caption.',
    },
    {
      title: 'Law enforcement handoff quality',
      body: 'Referring a complex financial crime case to a law enforcement agency means producing a package they can act on — not a PDF they have to re-enter. The gap between what a law firm produces and what a police force needs is where referrals stall.',
    },
  ],
  capabilities: [
    {
      tag: 'Multi-defendant entity mapping',
      title: 'The complete picture, from first charge to sentencing.',
      body: 'Build entity relationship diagrams connecting defendants, companies, accounts, assets, and jurisdictions across the full case. Add and update entities as the case develops — Raven\'s graph persists and grows with the investigation rather than being rebuilt from scratch at each stage.',
      photo: 'photo-1504711434969-e33886168f5c',
      photoAlt: 'Legal team reviewing complex multi-defendant entity relationship documentation',
    },
    {
      tag: 'Evidence organisation',
      title: 'Every link tied to its evidential source.',
      body: 'Each relationship in Raven carries an intelligence grade, a source reference, and analyst notes. When the same link appears in multiple evidence sources — a bank statement, a company registry, and a witness account — all three references can be attached. The picture that reaches the court reflects exactly what the evidence supports.',
      photo: 'photo-1551288049-bebda4e38f71',
      photoAlt: 'Structured evidence analysis dashboard with graded intelligence references',
    },
    {
      tag: 'Classified export',
      title: 'Court-ready output, first time.',
      body: 'Export entity diagrams as classification-marked PNG files — with case reference, classification level, and date stamp encoded in the image. For law enforcement handoff, export the same graph as a STIX 2.1 bundle with grading intact. Every export is logged in the audit trail with timestamp, user, and data version.',
      photo: 'photo-1507679799987-c73779587ccf',
      photoAlt: 'Legal professional preparing classified case exhibit for court submission',
    },
  ],
  useCases: [
    {
      title: 'Multi-defendant entity mapping',
      body: 'Build and maintain the entity relationship picture across complex multi-defendant cases — updated as new evidence arrives, with full version history and audit trail.',
    },
    {
      title: 'Court exhibit production',
      body: 'Export classified entity diagrams with case reference and marking for use as court exhibits — produced directly from the live investigation graph, not rebuilt in a presentation tool.',
    },
    {
      title: 'Asset tracing',
      body: 'Map asset chains through individuals, corporate structures, and jurisdictions — building the financial picture for confiscation orders, freezing applications, and proceeds of crime proceedings.',
    },
    {
      title: 'Law enforcement referral packaging',
      body: 'Produce STIX 2.1 referral packages for NCA, police, or overseas law enforcement partners — in a format they can ingest directly without re-entry.',
    },
    {
      title: 'Regulatory reporting',
      body: 'Build structured entity pictures for regulatory submissions, deferred prosecution agreement annexes, and suspicious activity disclosures — with full audit trail and provenance.',
    },
    {
      title: 'Cross-matter entity intelligence',
      body: 'Identify shared entities across matters — the same company director, the same bank account, the same digital infrastructure — that reveal connected activity across apparently separate cases.',
    },
  ],
  related: [
    { name: 'Law Enforcement',       path: '/industries/law-enforcement' },
    { name: 'Financial Crime',       path: '/industries/financial-crime' },
    { name: 'Financial Intel Units', path: '/industries/financial-intel-units' },
    { name: 'Insurance',             path: '/industries/insurance' },
  ],
}

export function LegalComplianceSectorPage() {
  return <IndustryPage config={config} />
}
