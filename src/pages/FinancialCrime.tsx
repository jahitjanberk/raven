import React from 'react'
import { IndustryPage, IndustryConfig } from '../components/IndustryPage'

const config: IndustryConfig = {
  index: '02',
  name: 'Financial Crime',
  tagline: 'Banks, PSPs & Payment Firms',
  headline: 'Trace the APP fraud chain. Map the mule network.',
  subheadline: 'Fraud and financial crime teams use Raven to move from a single suspicious alert to a complete entity picture — fast enough to freeze funds before they move.',
  coverPhoto: 'photo-1554224155-8d04cb21cd6c',
  coverPhotoAlt: 'Financial trading screens showing market data and network analysis',
  stats: [
    { value: '6+ sources', label: 'Automated OSINT enrichments applied per entity' },
    { value: 'STIX 2.1',   label: 'Machine-readable SAR-ready referral bundles' },
    { value: '< 2 hours',  label: 'From alert to complete entity picture' },
  ],
  challengeIntro: 'Financial crime alerts arrive individually. The fraud network behind them is interconnected. Identifying the shared phone numbers, device fingerprints, and infrastructure that link mule accounts — and tracing the beneficiary chain — requires graph analysis. Alert management tools are not built for this. Spreadsheets are not fast enough.',
  challenges: [
    {
      title: 'Alert volume versus investigation depth',
      body: 'The alert queue is long and each one demands a decision. But the data available at alert time is a flat row — customer name, account, transaction. The fraud network that explains the alert is visible only when you graph the relationships between entities across your customer base and beyond it.',
    },
    {
      title: 'Mule network visibility',
      body: 'Mule accounts are designed to look independent. Identifying the coordinators and beneficiaries behind them requires tracing shared phone numbers, addresses, device identifiers, and email domains across thousands of accounts. No spreadsheet surfaces that picture.',
    },
    {
      title: 'SAR quality and timeliness',
      body: 'The Suspicious Activity Report is the output that matters legally. Building a well-evidenced SAR from fragmented data — with structured entity references, clear timelines, and a graded entity picture — takes time that financial crime teams rarely have at the point of decision.',
    },
  ],
  capabilities: [
    {
      tag: 'APP fraud chain tracing',
      title: 'From payment to beneficiary in one graph.',
      body: 'Build the entity picture behind an authorised push payment fraud in a single session. Map the sending customer, the mule account chain, the receiving accounts, and the shared infrastructure connecting them — with every relationship graded by the intelligence that supports it and a full audit trail from the first node.',
      photo: 'photo-1611974789855-9c2a0a7236a3',
      photoAlt: 'Financial analyst mapping transaction flows and entity networks on screens',
    },
    {
      tag: 'Automated OSINT enrichment',
      title: 'Enrich every entity, automatically.',
      body: 'Drop a phone number, email address, domain, or IP into Raven and run six automated OSINT enrichments in parallel — HaveIBeenPwned, IPinfo, crt.sh, URLscan, Shodan, and VirusTotal. Each result is added as a structured entity in the graph with a graded relationship — not a raw data dump you have to interpret separately.',
      photo: 'photo-1551288049-bebda4e38f71',
      photoAlt: 'Data enrichment dashboard showing automated intelligence gathering',
    },
    {
      tag: 'SAR preparation',
      title: 'Build the SAR alongside the investigation.',
      body: 'Case notes and entity narratives are written in-tool, alongside the graph — so the Suspicious Activity Report is assembled as the investigation unfolds, not reconstructed from memory afterward. Export the structured entity data, timeline, and audit trail directly to the disclosure workflow.',
      photo: 'photo-1507679799987-c73779587ccf',
      photoAlt: 'Financial crime investigator preparing structured case documentation',
    },
  ],
  useCases: [
    {
      title: 'APP fraud chain tracing',
      body: 'Map the full payment chain from victim to beneficiary, identifying mule accounts and shared infrastructure at each hop — fast enough to support a freezing decision.',
    },
    {
      title: 'Mule account network mapping',
      body: 'Identify mule coordinators by tracing shared device fingerprints, phone numbers, and addresses across accounts flagged in isolation by transaction monitoring.',
    },
    {
      title: 'Repeat offender infrastructure',
      body: 'Surface the shared email domains, phone prefixes, and IP ranges used across multiple fraud attempts by the same organised ring — connecting cases that alert-level analysis leaves unlinked.',
    },
    {
      title: 'SAR preparation',
      body: 'Build structured entity pictures that become the evidential backbone of a well-grounded Suspicious Activity Report — with grading, provenance, and a full audit trail.',
    },
    {
      title: 'Cross-institution intelligence sharing',
      body: 'Share entity pictures with other financial institutions or law enforcement partners via STIX 2.1 — maintaining intelligence grades and provenance throughout.',
    },
    {
      title: 'Account takeover investigation',
      body: 'Trace the chain from compromised credentials through to fraudulent transactions, mapping attacker infrastructure alongside the customer entity and downstream mule accounts.',
    },
  ],
  related: [
    { name: 'Law Enforcement',       path: '/industries/law-enforcement' },
    { name: 'Financial Intel Units', path: '/industries/financial-intel-units' },
    { name: 'Counter-Fraud',         path: '/industries/counter-fraud' },
    { name: 'Cyber & Threat Intel',  path: '/industries/cyber-threat-intel' },
  ],
}

export function FinancialCrimePage() {
  return <IndustryPage config={config} />
}
