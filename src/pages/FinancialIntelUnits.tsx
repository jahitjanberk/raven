import React from 'react'
import { IndustryPage, IndustryConfig } from '../components/IndustryPage'

const config: IndustryConfig = {
  index: '05',
  name: 'Financial Intel Units',
  tagline: 'FIUs, MLROs & Financial Intelligence',
  headline: 'From suspicious activity report to shareable entity picture.',
  subheadline: 'FIUs and MLRO teams use Raven to build structured entity networks behind SAR disclosures — and produce machine-readable packages ready for law enforcement referral and international cooperation.',
  coverPhoto: 'photo-1460925895917-afdab827c52f',
  coverPhotoAlt: 'Financial intelligence analyst reviewing data patterns and transaction flows',
  stats: [
    { value: 'NATO graded', label: 'STANAG 2511 grading on every entity and relationship' },
    { value: 'STIX 2.1',   label: 'LE-ready referral bundles, machine-readable' },
    { value: 'Multi-case', label: 'Cross-case pattern analysis across all SAR data' },
  ],
  challengeIntro: 'The Financial Intelligence Unit sits between the financial sector and law enforcement. Its job is to receive unstructured disclosures, build entity pictures that make sense of them, and pass actionable intelligence to investigators in a format they can use immediately. The gap between a SAR narrative and a STIX 2.1 bundle is where most FIU resource is consumed.',
  challenges: [
    {
      title: 'Unstructured SAR data',
      body: 'Suspicious activity reports arrive as text narratives — not structured entity data. Extracting the persons, accounts, addresses, transactions, and relationships from a SAR, and then building a graded entity picture from them, requires significant manual effort for every disclosure received.',
    },
    {
      title: 'Cross-case pattern analysis',
      body: 'Identifying the same network appearing across multiple SARs requires cross-referencing entity details held in separate case files. Without a tool that can surface shared identifiers across cases, the organised ring behind repeat disclosures remains invisible at the individual case level.',
    },
    {
      title: 'Law enforcement handoff quality',
      body: 'The package a police force or national agency needs is not a PDF summary — it is structured entity data with grading, classification, and machine-readable relationships. Producing that from a case management system that was not designed for it is slow and produces outputs of variable quality.',
    },
  ],
  capabilities: [
    {
      tag: 'SAR entity extraction',
      title: 'Build the picture from the SAR narrative.',
      body: 'Work through a SAR disclosure and build the entity picture directly in Raven — persons, accounts, addresses, transactions, and the relationships between them. Automated OSINT enrichment adds digital and infrastructure context where public-source data exists, and source grading is applied at the point of ingestion.',
      photo: 'photo-1460925895917-afdab827c52f',
      photoAlt: 'Financial intelligence analyst building entity graphs from disclosure data',
    },
    {
      tag: 'Multi-case analysis',
      title: 'Surface the network across cases.',
      body: 'Identify shared entities and infrastructure across multiple SAR cases — the same actor appearing under different identities, the same bank account used across multiple schemes, the same IP address linked to different nominates. Pattern analysis across the full disclosure picture, not case by case.',
      photo: 'photo-1551288049-bebda4e38f71',
      photoAlt: 'Cross-case intelligence analysis showing entity relationships across multiple investigations',
    },
    {
      tag: 'LE referral packaging',
      title: 'STIX 2.1 bundles for law enforcement.',
      body: 'Produce properly-structured STIX 2.1 referral packages with NATO STANAG 2511 grading on every entity and relationship. The package a law enforcement partner receives is immediately actionable — structured entity data they can ingest directly into their analysis environment, not a PDF they need to re-enter into their own tools.',
      photo: 'photo-1507679799987-c73779587ccf',
      photoAlt: 'FIU officer preparing structured intelligence referral packages for law enforcement',
    },
  ],
  useCases: [
    {
      title: 'SAR entity extraction',
      body: 'Build structured entity graphs from SAR narratives — turning unstructured text disclosures into graded, classifiable link pictures ready for analysis and referral.',
    },
    {
      title: 'Cross-case pattern analysis',
      body: 'Identify shared actors, accounts, and infrastructure across multiple SAR cases — surfacing the organised network behind repeat disclosures that case-level review misses.',
    },
    {
      title: 'Law enforcement referral packaging',
      body: 'Produce STIX 2.1 bundles with full STANAG 2511 grading for NCA, police, or overseas partner referrals — in a format the receiving agency can act on immediately.',
    },
    {
      title: 'International cooperation',
      body: 'Share structured entity pictures with EGMONT Group partners and overseas FIUs — with TLP classification markings and controlled release via STIX 2.1 over TAXII.',
    },
    {
      title: 'Typology analysis',
      body: 'Analyse entity patterns across cases to identify emerging money laundering and fraud typologies — building the evidence base for sector-wide advisory publications.',
    },
    {
      title: 'Supervisory authority reporting',
      body: 'Produce structured entity pictures and audit trails for regulatory reporting, thematic reviews, and supervisory authority submissions — with full provenance records.',
    },
  ],
  related: [
    { name: 'Law Enforcement', path: '/industries/law-enforcement' },
    { name: 'Financial Crime', path: '/industries/financial-crime' },
    { name: 'Counter-Fraud',   path: '/industries/counter-fraud' },
    { name: 'Intelligence Agencies', path: '/industries/intelligence-agencies' },
  ],
}

export function FinancialIntelUnitsPage() {
  return <IndustryPage config={config} />
}
