import React from 'react'
import { IndustryPage, IndustryConfig } from '../components/IndustryPage'

const config: IndustryConfig = {
  index: '06',
  name: 'Intelligence Agencies',
  tagline: 'National & Regional Intelligence',
  headline: 'Adversary networks. Graded. Classified. On your terms.',
  subheadline: 'Analysts at national and regional intelligence agencies use Raven to build adversary network maps with classification markings and NATO grading encoded in the data — not applied to a document at the end.',
  coverPhoto: 'photo-1451187580459-43490279c0fa',
  coverPhotoAlt: 'Global intelligence operations view with satellite data and network visualisation',
  stats: [
    { value: 'STANAG 2511', label: 'Grading on every entity and relationship' },
    { value: 'TLP support',  label: 'Controlled sharing markers built in' },
    { value: 'On-premise',  label: 'Air-gappable deployment for sensitive environments' },
  ],
  challengeIntro: 'Intelligence analysis at the national level demands tooling that treats classification and grading as first-class data properties — not labels applied before printing. Every entity, every relationship, every assessed connection must carry its provenance, its assessed reliability, and its handling caveat from the moment it enters the picture. Most link analysis tools were not designed for this operating environment.',
  challenges: [
    {
      title: 'Classification as an afterthought',
      body: 'Most link analysis tools treat classification as a label you apply to a document or export at the end of the process. In a controlled environment, classification must be a property of every data element from the moment it is created — so that sharing, dissemination, and disclosure decisions are made on graded, marked data, not on aggregations that may conflate different handling levels.',
    },
    {
      title: 'Grading consistency across analysts',
      body: 'NATO STANAG 2511 source evaluation requires consistency — different analysts assessing the same source should apply the same grade. Without tooling that enforces this at the point of entry, the picture that leaves the unit carries aggregated confidence levels that are unreliable and difficult to justify to consumers.',
    },
    {
      title: 'Controlled dissemination',
      body: 'Sharing entity pictures with partner agencies — domestic or liaison — must be managed: the right subset of the graph, the right TLP level, a complete record of what was shared with whom and when. Ad hoc export and email distribution does not provide this.',
    },
  ],
  capabilities: [
    {
      tag: 'Classification encoding',
      title: 'Classification in the data, not the document.',
      body: 'In Raven, classification markings are encoded at entity and relationship level — OFFICIAL, OFFICIAL-SENSITIVE, and above. The marking travels with the data: to exports, to STIX 2.1 packages, to the audit trail. There is no post-production step where a mis-mark can propagate undetected through a package sent to a liaison partner.',
      photo: 'photo-1568992687947-868a62a9f521',
      photoAlt: 'Secure intelligence operations environment with classified data screens',
    },
    {
      tag: 'NATO STANAG 2511',
      title: 'Grading on every entity and relationship.',
      body: 'Source evaluation (A–F) and information reliability (1–6) are required fields in the Raven data model — not optional annotations. Every link in the entity picture carries its assessed reliability. The aggregate picture reflects the weakest link in any assessment chain, and grading is visible to every analyst working on the same case.',
      photo: 'photo-1551288049-bebda4e38f71',
      photoAlt: 'Intelligence analyst reviewing graded entity relationships with NATO classification standards',
    },
    {
      tag: 'Controlled sharing',
      title: 'Share what you intend, to whom you intend.',
      body: 'Export subgraphs as STIX 2.1 bundles with TLP markings for controlled dissemination to partner agencies or liaison services. The audit trail shows exactly which entities were shared, when, and to whom — meeting the requirements of controlled information release frameworks and supporting post-sharing review.',
      photo: 'photo-1504711434969-e33886168f5c',
      photoAlt: 'Controlled intelligence sharing environment with secure data transfer protocols',
    },
  ],
  useCases: [
    {
      title: 'Adversary network mapping',
      body: 'Build structured maps of adversary organisations, linking individuals, infrastructure, financing, and resources — with full STANAG 2511 grading on every assessed relationship in the picture.',
    },
    {
      title: 'Persona and infrastructure tracking',
      body: 'Track adversary personas across digital infrastructure — linking online identities, hosting patterns, and operational behaviour to known threat actors over time.',
    },
    {
      title: 'Cross-agency sharing',
      body: 'Share classified entity pictures with domestic partner agencies or liaison services — with TLP markings, controlled release via STIX 2.1, and a full audit trail of what was shared.',
    },
    {
      title: 'Assessment production',
      body: 'Build the structured intelligence picture that underpins finished assessments — with provenance, grading, and source evaluation embedded in the entity data, not added in a text footnote.',
    },
    {
      title: 'Strategic intelligence mapping',
      body: 'Map long-run adversary capabilities and relationships over time — building the persistent picture that informs strategic assessments, collection priorities, and requirement generation.',
    },
    {
      title: 'OSINT integration',
      body: 'Enrich classified entity pictures with publicly available intelligence — crt.sh, Shodan, IPinfo — with source grading applied at ingestion so OSINT and closed-source data are clearly distinguished.',
    },
  ],
  related: [
    { name: 'Law Enforcement',    path: '/industries/law-enforcement' },
    { name: 'Financial Intel Units', path: '/industries/financial-intel-units' },
    { name: 'Cyber & Threat Intel', path: '/industries/cyber-threat-intel' },
    { name: 'Counter-Fraud',      path: '/industries/counter-fraud' },
  ],
}

export function IntelligenceAgenciesPage() {
  return <IndustryPage config={config} />
}
