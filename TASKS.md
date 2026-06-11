# Raven — Build / Fix / Adjust Task List

Derived from the full project + business critique (June 2026). Ordered by priority.
P0 = credibility blockers, do before any launch. P1 = differentiation. P2 = expansion bets.

---

## P0 — Credibility blockers

### Data integrity & persistence
- [ ] **Wire graph persistence to the backend.** `graphStore` / `projectStore` currently persist to localStorage only (zustand `persist`). The API clients in `src/api/graphs.ts` / `src/api/projects.ts` exist but are never called from the stores. Backend becomes source of truth; localStorage demoted to offline cache with sync-on-reconnect.
- [ ] **Auto-save with visible save-state indicator** (saved / saving / offline) in the graph chrome. Investigators must never wonder whether work is safe.
- [ ] **Quarantine the mock enrichment generator.** `src/lib/enrich.ts` (679 lines) fabricates deterministic fake intelligence (fake IPs, breach records, Companies House data). Either delete it, or gate behind a dev-only "Demo mode" with unmistakable UI: watermarked nodes, persistent banner, excluded from production builds via env flag. Fabricated data reaching a real case file is company-ending.
- [ ] **Migrate SQLite → Postgres** before any multi-user/team claim.
- [ ] **Remove committed databases from git** (`backend/raven.db`, leftover `backend/strata.db`), add to `.gitignore`, rotate any secrets that may live in them.

### Reporting & evidence
- [ ] **Real PDF report generation** to replace `window.print()` in `ReportModal.tsx`. Deterministic server- or client-side PDF with: case header block, classification banner on every page, exhibit numbering, entity/link appendix with grading legend, page numbers, generation timestamp, and a SHA-256 content hash printed on the document.
- [ ] **Server-side audit trail.** Transform history currently exists only client-side. Log every material event (entity add/edit/delete, transform run, export, login) to an append-only backend table. Immutable: no delete endpoint.

### Security honesty
- [ ] **Rewrite the Security page to be truthful.** Remove fabricated claims (ISO 27001, CREST, Cyber Essentials Plus, SOC-style certs, named pen-test cadence). Replace with an honest "current controls + certification roadmap" page. One procurement officer asking for the ISO certificate ends the deal.
- [ ] **Audit all marketing pages for capability claims the app doesn't have** (team workspaces, real-time sync, audit trails, customer-managed keys, fictional Series A press quotes, company number). Soften or move to a labelled roadmap.
- [ ] **Harden auth gating.** App shell currently trusts presence of `raven-auth` in localStorage; validate the JWT against the backend on load, handle expiry/refresh.

---

## P1 — Differentiation (the wedge vs Maltego / i2)

### Evidence & chain of custody
- [ ] **Evidence capture on enrichment**: when a transform runs, snapshot the source response (and screenshot for URL/domain entities), SHA-256 it, timestamp it, store immutably, link it to the node. This is Hunchly's entire business and converts "interesting tool" into "tool I can cite in a report."
- [ ] **Integrity manifest on export**: STIX bundles and PDFs include hashes of all attached evidence.

### Interop / switching costs
- [ ] **Maltego `.mtgx` importer.**
- [ ] **i2 Analyst's Notebook ANX importer.**
- [ ] **GraphML / CSV edge-list import** improvements (CSV modal exists — extend to relationships).

### Workflow acceleration
- [ ] **Chained / bulk transforms** ("machines"): run a transform across all entities of a type, and define simple chains (domain → WHOIS → crt.sh → Shodan on discovered IPs). Queue with progress UI.
- [ ] **Wire watchlists to the backend**: scheduled re-runs of transforms on watched entities, diff detection, email alerts via existing Resend integration. Recurring value = retention.
- [ ] **Transform API-key management server-side** (per-org keys, not pasted per-run in `EntityPanel`).

### Deployment story
- [ ] **Self-hosted tier**: turn the existing dev Dockerfile into a documented docker-compose deployment (app + Postgres). This is the only credible answer for law enforcement / IC later, and a pricing tier today.

---

## P2 — Expansion bets

- [ ] **Entity extraction from documents (LLM-assisted).** Paste a report/article/SAR narrative → extract people, orgs, accounts, addresses → propose nodes+links with source references for analyst approval. Biggest single workflow accelerant; nobody in the affordable tier does it well; the demo sells itself.
- [ ] **Real-time collaboration** (shared workspaces, presence, activity feed) — currently only fiction in the marketing changelog. Build or stop advertising it.
- [ ] **Browser extension** for one-click capture of pages/profiles into the active investigation.
- [ ] **Public API + webhooks** for case-management integrations.
- [ ] **Breach/darkweb data partnerships** (licensed sources only, with grading attached).

---

## Business / go-to-market adjustments

- [ ] **Re-sequence target market.** Beachhead = private investigators, OSINT consultancies, corporate fraud/intel teams (self-serve, credit card, underserved since Maltego went upmarket). Then insurance SIU + law-firm investigation teams. Law enforcement / IC last, entered via practitioner champions + the self-hosted tier — not via cold procurement.
- [ ] **Reposition messaging** around the gap: "i2 is the courtroom standard, Maltego is the enterprise standard — Raven is for the investigator who can't get either." De-emphasise national-agency language on the homepage until the security story is real.
- [ ] **Pricing**: keep £49/£149 for the PI/OSINT wedge; add a self-hosted/team tier priced against Maltego Pro (~€1k/seat) rather than against SaaS norms. Revisit the 20-node free-tier cap (too tight to experience the product's value).
- [ ] **Certification roadmap in real life**: Cyber Essentials → Cyber Essentials Plus → ISO 27001, in that order; publish progress honestly on the Security page.
- [ ] **Keep grading-in-the-data-model front and centre** in all positioning — Admiralty/STANAG grading native to the graph is the most defensible product idea in the codebase.

---

## Quick wins / hygiene (do alongside anything)

- [ ] Fix mixed support emails (`support@raven.io` in Docs vs `@raven.app` elsewhere) — pick one domain.
- [ ] Social links in `SiteFooter` point to `#` — populate or remove.
- [ ] Blog article cards navigate to `/blog/:slug` routes that don't exist — add article pages or make cards non-clickable.
- [ ] Newsletter subscribe input (Blog) and Request Access form POST nowhere — wire to backend or store submissions.
- [ ] `LinkAnalysisPanel` betweenness centrality is O(V·E) per render trigger — memoise/worker for large graphs (canvas already virtualises; analysis should too).
