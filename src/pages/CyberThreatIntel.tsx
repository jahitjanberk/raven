import React from 'react'
import { IndustryPage, IndustryConfig } from '../components/IndustryPage'

const config: IndustryConfig = {
  index: '04',
  name: 'Cyber & Threat Intel',
  tagline: 'Threat Intelligence & Incident Response',
  headline: 'From indicator to infrastructure map. In one session.',
  subheadline: 'Threat intelligence and incident response teams use Raven to map attacker infrastructure, correlate indicators of compromise across campaigns, and produce STIX 2.1 bundles ready for TAXII and community sharing.',
  coverPhoto: 'photo-1526374965328-7f61d4dc18c5',
  coverPhotoAlt: 'Cyber operations environment with code and infrastructure data on screens',
  stats: [
    { value: '8 sources',   label: 'Automated OSINT enrichments per observable' },
    { value: 'STIX 2.1',    label: 'TAXII-compatible bundles from the canvas' },
    { value: 'IOC → infra', label: 'Full campaign infrastructure map in < 1 hour' },
  ],
  challengeIntro: 'A single indicator of compromise tells you that something happened. The infrastructure behind a campaign — the shared hosting clusters, registrar patterns, certificate chains, and tool reuse — tells you who is operating and how to find the rest of it. Getting from indicator to infrastructure picture requires graph analysis, not a list or a timeline.',
  challenges: [
    {
      title: 'IOC fatigue',
      body: 'Individual indicators arrive continuously — IP addresses, domains, hashes, URLs. Without a tool to correlate them across campaigns and map shared infrastructure, they remain unactionable data points. The pattern that reveals the actor is invisible in a flat list.',
    },
    {
      title: 'Attribution confidence',
      body: 'Building assessable attribution requires grading the intelligence behind every link in the chain — not just reporting the chain. Tools that show connections without grading produce pictures that look more certain than the underlying intelligence supports.',
    },
    {
      title: 'Community sharing overhead',
      body: 'Producing well-formed STIX 2.1 bundles for TAXII feeds, ISACs, and trust group sharing requires structured tooling. Manual STIX assembly is slow, error-prone, and produces outputs that downstream consumers have to validate before they can use.',
    },
  ],
  capabilities: [
    {
      tag: 'Infrastructure mapping',
      title: 'From IP to campaign map in one graph.',
      body: 'Starting from any observable — IP address, domain, URL, file hash, email address — automatically enrich through Shodan, crt.sh, IPinfo, URLscan, and VirusTotal. Each enrichment result is added as a structured entity in the graph, letting you trace hosting infrastructure, certificate chains, and registrar patterns across a campaign without manual pivot work.',
      photo: 'photo-1573804633927-bfcbcd909acd',
      photoAlt: 'Cyber threat intelligence analyst mapping attacker infrastructure on a dark display',
    },
    {
      tag: 'Intel grading',
      title: 'Confidence on every link.',
      body: 'NATO STANAG 2511 grading is built into the Raven data model — every entity and relationship carries a source evaluation and assessed reliability rating. When you export the picture for community sharing or briefing, the confidence level travels with every link. The picture is honest about what is known, what is assessed, and what is speculative.',
      photo: 'photo-1551288049-bebda4e38f71',
      photoAlt: 'Threat intelligence dashboard with graded indicators and confidence levels',
    },
    {
      tag: 'STIX 2.1 export',
      title: 'TAXII-ready bundles from the canvas.',
      body: 'Export any subgraph or the full investigation as a properly-formed STIX 2.1 bundle, ready for delivery to TAXII servers, ISAC platforms, or partner SOC teams. Threat actor personas, infrastructure objects, indicators, and relationships are mapped to STIX vocabulary automatically — no manual XML assembly required.',
      photo: 'photo-1558618666-fcd25c85cd64',
      photoAlt: 'Security operations centre with multiple analysts reviewing threat data',
    },
  ],
  useCases: [
    {
      title: 'Campaign infrastructure mapping',
      body: 'Starting from known IOCs, trace shared hosting, registrar patterns, and certificate chains to map the full infrastructure behind a campaign — and identify other domains not yet in threat feeds.',
    },
    {
      title: 'IOC correlation across incidents',
      body: 'Identify shared infrastructure across apparently independent incidents — surfacing the common actor behind multiple events that individual incident records treat as separate.',
    },
    {
      title: 'Threat actor persona tracking',
      body: 'Build and maintain actor profiles with attributed infrastructure, TTPs, and observed campaigns — updated as new intelligence arrives and linked to historical activity.',
    },
    {
      title: 'STIX 2.1 bundle production',
      body: 'Export well-formed STIX 2.1 bundles for TAXII feeds, ISAC submissions, and SOC partner sharing — with source grading intact and relationships accurately represented.',
    },
    {
      title: 'Incident response support',
      body: 'During an active incident, rapidly map attacker infrastructure — command-and-control, staging servers, exfiltration endpoints — to support containment decisions and hunting queries.',
    },
    {
      title: 'Dark web entity mapping',
      body: 'Track persona activity across forums and marketplaces, linking online identities to infrastructure, operational patterns, and known campaigns over time.',
    },
  ],
  related: [
    { name: 'Law Enforcement',       path: '/industries/law-enforcement' },
    { name: 'Intelligence Agencies', path: '/industries/intelligence-agencies' },
    { name: 'Financial Crime',       path: '/industries/financial-crime' },
    { name: 'Financial Intel Units', path: '/industries/financial-intel-units' },
  ],
}

export function CyberThreatIntelPage() {
  return <IndustryPage config={config} />
}
