import React from 'react'
import { IndustryPage, IndustryConfig } from '../components/IndustryPage'

const config: IndustryConfig = {
  index: '03',
  name: 'Counter-Fraud',
  tagline: 'HMRC, DWP & Local Authorities',
  headline: 'Detect identity fraud rings. Coordinate the response.',
  subheadline: 'Counter-fraud units across government use Raven to map the organised rings behind high-volume public sector fraud — and to build the structured case files that support civil recovery and prosecution.',
  coverPhoto: 'photo-1450101499163-c8848c66ca85',
  coverPhotoAlt: 'Government investigator reviewing case documents at a formal desk',
  stats: [
    { value: 'Cross-dept', label: 'Structured intelligence sharing across agencies' },
    { value: 'Identity net', label: 'Multi-claim linkage mapped in a single graph' },
    { value: '< 1 hour',   label: 'From suspicious claim to coordinated entity picture' },
  ],
  challengeIntro: 'Organised benefit and identity fraud is engineered to look like isolated incidents. Each claim, each identity, each address is designed to appear independent. The ring becomes visible only when you can graph the shared identifiers that connect them — and coordinate the response across the departments that each hold a fragment of the picture.',
  challenges: [
    {
      title: 'The isolated alert view',
      body: 'Fraud detection flags individual claims or applications. The coordinated ring behind them is visible only when you can graph the relationships between linked identities, shared addresses, bank accounts, and phone numbers across the full dataset — across departments and across time.',
    },
    {
      title: 'Cross-department coordination',
      body: 'HMRC, DWP, and local authorities each hold fragments of the same fraud network — but siloed case management systems mean the complete picture never forms without significant manual effort. By the time the ring is identified, funds have moved.',
    },
    {
      title: 'Civil recovery case preparation',
      body: 'A well-evidenced entity picture is essential for civil recovery proceedings — but building one from unstructured investigation records, interview notes, and alert exports takes weeks. The picture needs to be structured from the start, not assembled at the end.',
    },
  ],
  capabilities: [
    {
      tag: 'Identity network mapping',
      title: 'See the ring, not just the claim.',
      body: 'Map suspected fraud networks by linking identity elements — names, dates of birth, National Insurance numbers, bank accounts, addresses — across multiple claims. Shared identifiers surface the coordinated ring that looks like independent submissions at the application level. Each link in the graph carries its graded intelligence source.',
      photo: 'photo-1504384308090-c894fdcc538d',
      photoAlt: 'Counter-fraud analyst mapping identity networks across multiple screens',
    },
    {
      tag: 'Cross-department sharing',
      title: 'Share the picture without sharing the systems.',
      body: 'Raven\'s STIX 2.1 export lets counter-fraud teams share structured entity pictures with partner departments and referral agencies — without requiring shared access to underlying case management systems. Intelligence grades and classification markings travel with the data. The receiving team gets a picture they can act on, not a PDF they have to re-enter.',
      photo: 'photo-1516321318423-f06f85e504b3',
      photoAlt: 'Inter-agency team collaborating on shared investigation data',
    },
    {
      tag: 'Case file export',
      title: 'From graph to case file in one step.',
      body: 'Export the entity picture and audit trail as a structured case file for disclosure to prosecution authorities, civil recovery teams, or referral to the NCA\'s National Fraud Intelligence Bureau. Every enrichment, every link, every evidence reference is included — with the audit trail showing who made each assessment and when.',
      photo: 'photo-1565688534245-05d6b5be184a',
      photoAlt: 'Legal case file preparation with structured evidence documentation',
    },
  ],
  useCases: [
    {
      title: 'Benefit claim linkage',
      body: 'Identify shared identifiers across benefit claims submitted in isolation — surfacing the coordinated ring behind high-volume, low-value fraud that individual claim reviews miss.',
    },
    {
      title: 'Identity fraud network mapping',
      body: 'Map the infrastructure behind identity fraud — linked bank accounts, addresses, phone numbers, and documents used across multiple fraudulent identities and claim streams.',
    },
    {
      title: 'Cross-department investigation',
      body: 'Share entity pictures and intelligence grades between HMRC, DWP, local authority fraud teams, and the police — working on linked cases across departmental boundaries.',
    },
    {
      title: 'Civil recovery preparation',
      body: 'Build the structured entity picture and audit trail needed for civil recovery proceedings against organised fraud rings — with provenance, grading, and a complete chronological record.',
    },
    {
      title: 'Repeat offender tracking',
      body: 'Identify known fraud network members reappearing under new identities by tracing shared infrastructure — phone numbers, bank accounts, addresses — across historical cases.',
    },
    {
      title: 'Referral packaging',
      body: 'Prepare structured STIX 2.1 referral bundles for the NCA, police, or CPS — with grading and evidence references intact, in a format the receiving agency can ingest directly.',
    },
  ],
  related: [
    { name: 'Law Enforcement',       path: '/industries/law-enforcement' },
    { name: 'Financial Crime',       path: '/industries/financial-crime' },
    { name: 'Financial Intel Units', path: '/industries/financial-intel-units' },
    { name: 'Intelligence Agencies', path: '/industries/intelligence-agencies' },
  ],
}

export function CounterFraudPage() {
  return <IndustryPage config={config} />
}
