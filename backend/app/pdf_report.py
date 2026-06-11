"""
PDF report generation using fpdf2.
Classification banner appears on every page header and footer.
"""
from __future__ import annotations

import hashlib
import json
from datetime import datetime
from typing import Any

from fpdf import FPDF


# ── Colour palette (matches Raven UI) ─────────────────────────────────────────

_RISK_RGB: dict[str, tuple[int, int, int]] = {
    "HIGH":   (224,  82,  82),
    "MEDIUM": (201, 138,  46),
    "LOW":    ( 58, 158, 111),
    "NONE":   (156, 163, 175),
}

_ACTION_LABELS = {
    "suspect":   "SUSPECT",
    "victim":    "VICTIM",
    "witness":   "WITNESS",
    "confirmed": "CONFIRMED",
    "unknown":   "—",
}

_ENTITY_LABELS: dict[str, str] = {
    "ip":          "IP Address",
    "domain":      "Domain",
    "email":       "Email",
    "person":      "Person",
    "org":         "Org",
    "phone":       "Phone",
    "wallet":      "Wallet",
    "url":         "URL",
    "bank":        "Bank Account",
    "cert":        "SSL Cert",
    "social":      "Social Profile",
    "company":     "Company Reg.",
    "transaction": "Transaction",
    "takedown":    "Takedown",
    "location":    "Location",
    "fraudreport": "Fraud Report",
    "hash":        "File Hash",
}

_CLASSIFICATION_RGB: dict[str, tuple[int, int, int]] = {
    "SECRET":    (220,  38,  38),
    "SENSITIVE": (217, 119,   6),
}


def _cls_color(classification: str) -> tuple[int, int, int]:
    for key, rgb in _CLASSIFICATION_RGB.items():
        if key in classification.upper():
            return rgb
    return (22, 163, 74)  # green for OFFICIAL / unclassified


def _fmt_dt(iso: str | None) -> str:
    if not iso:
        return "—"
    try:
        dt = datetime.fromisoformat(iso.replace("Z", "+00:00"))
        return dt.strftime("%d/%m/%Y %H:%M")
    except Exception:
        return iso[:16] if iso else "—"


def _safe(v: Any, maxlen: int = 80) -> str:
    if v is None:
        return ""
    s = str(v)
    return s[:maxlen] + ("…" if len(s) > maxlen else "")


def compute_content_hash(nodes: list, edges: list, case_notes: str, saved_at: str) -> str:
    canonical = json.dumps(
        {"nodes": nodes, "edges": edges, "case_notes": case_notes, "saved_at": saved_at},
        sort_keys=True,
        default=str,
    )
    return hashlib.sha256(canonical.encode()).hexdigest()


# ── PDF document class ────────────────────────────────────────────────────────

class RavenReport(FPDF):
    def __init__(self, project_name: str, case_ref: str, classification: str,
                 analyst_name: str, generated_at: str, content_hash: str):
        super().__init__(orientation="P", unit="mm", format="A4")
        self._project_name  = project_name
        self._case_ref      = case_ref
        self._classification = classification
        self._analyst_name  = analyst_name
        self._generated_at  = generated_at
        self._content_hash  = content_hash
        self._cls_rgb       = _cls_color(classification)
        self.set_margins(15, 22, 15)  # l, t, r  (top leaves room for header)
        self.set_auto_page_break(auto=True, margin=22)
        self.set_font("Helvetica", size=10)

    # ── Per-page header / footer ───────────────────────────────────────────────

    def header(self) -> None:
        r, g, b = self._cls_rgb
        self.set_fill_color(r, g, b)
        self.rect(0, 0, 210, 8, style="F")
        self.set_font("Helvetica", "B", 7)
        self.set_text_color(255, 255, 255)
        self.set_xy(0, 1)
        self.cell(210, 6, self._classification, align="C")
        self.set_text_color(0, 0, 0)
        self.ln(3)

    def footer(self) -> None:
        r, g, b = self._cls_rgb
        # Page number line
        self.set_y(-18)
        self.set_font("Helvetica", "", 7.5)
        self.set_text_color(107, 114, 128)
        self.cell(0, 5, f"Page {self.page_no()} of {{nb}}", align="C")
        self.ln(3)
        # Classification banner at bottom
        self.set_fill_color(r, g, b)
        self.set_xy(0, 287)
        self.rect(0, 287, 210, 10, style="F")
        self.set_font("Helvetica", "B", 7)
        self.set_text_color(255, 255, 255)
        self.set_xy(0, 288)
        self.cell(210, 6, self._classification, align="C")
        self.set_text_color(0, 0, 0)

    # ── Section helpers ────────────────────────────────────────────────────────

    def section_heading(self, title: str) -> None:
        self.set_font("Helvetica", "B", 9)
        self.set_text_color(55, 65, 81)
        self.set_draw_color(229, 231, 235)
        self.set_line_width(0.3)
        self.cell(0, 6, title.upper(), ln=True)
        self.line(self.get_x(), self.get_y(), self.get_x() + 180, self.get_y())
        self.ln(2)
        self.set_text_color(0, 0, 0)

    def kv_row(self, label: str, value: str) -> None:
        self.set_font("Helvetica", "B", 9)
        self.set_text_color(107, 114, 128)
        self.cell(42, 6, label)
        self.set_font("Helvetica", "", 9)
        self.set_text_color(17, 24, 39)
        self.multi_cell(0, 6, value)

    def stat_box(self, x: float, y: float, w: float, h: float,
                 number: str, label: str, num_rgb: tuple[int, int, int] = (17, 24, 39)) -> None:
        self.set_draw_color(229, 231, 235)
        self.set_line_width(0.3)
        self.rect(x, y, w, h)
        r, g, b = num_rgb
        self.set_text_color(r, g, b)
        self.set_font("Helvetica", "B", 18)
        self.set_xy(x, y + 3)
        self.cell(w, 8, number, align="C")
        self.set_font("Helvetica", "", 7.5)
        self.set_text_color(156, 163, 175)
        self.set_xy(x, y + 12)
        self.cell(w, 5, label.upper(), align="C")
        self.set_text_color(0, 0, 0)

    def _th(self, widths: list[float], headers: list[str]) -> None:
        self.set_fill_color(243, 244, 246)
        self.set_draw_color(209, 213, 219)
        self.set_line_width(0.2)
        self.set_font("Helvetica", "B", 7.5)
        self.set_text_color(107, 114, 128)
        for w, h in zip(widths, headers):
            self.cell(w, 6, h.upper(), border=1, fill=True)
        self.ln()
        self.set_text_color(0, 0, 0)

    def _td(self, widths: list[float], values: list[str],
             fill: bool = False, row_rgb: tuple[int, int, int] | None = None) -> None:
        self.set_font("Helvetica", "", 8)
        if row_rgb:
            r2, g2, b2 = row_rgb
            self.set_text_color(r2, g2, b2)
        # Detect if any cell will overflow; use multi_cell on the tall one
        self.set_draw_color(229, 231, 235)
        self.set_line_width(0.2)
        if fill:
            self.set_fill_color(249, 250, 251)
        x0 = self.get_x()
        y0 = self.get_y()
        max_h = 5
        for w, v in zip(widths, values):
            lines = self.get_string_width(v) / (w - 2)
            cell_h = max(5, int(lines) * 5 + 2)
            max_h = max(max_h, cell_h)

        for i, (w, v) in enumerate(zip(widths, values)):
            self.set_xy(x0, y0)
            self.multi_cell(w, 5, _safe(v, 60), border=1, fill=fill)
            x0 += w
        self.set_xy(15, y0 + max_h)
        self.set_text_color(0, 0, 0)


# ── Public entry point ────────────────────────────────────────────────────────

def generate_report(
    project_name: str,
    case_ref: str,
    classification: str,
    analyst_name: str,
    nodes: list[dict],
    edges: list[dict],
    case_notes: str,
    saved_at: str,
    evidence: list[dict] | None = None,
) -> bytes:
    generated_at = datetime.utcnow().strftime("%d/%m/%Y %H:%M UTC")
    content_hash = compute_content_hash(nodes, edges, case_notes, saved_at)

    pdf = RavenReport(
        project_name=project_name,
        case_ref=case_ref,
        classification=classification,
        analyst_name=analyst_name,
        generated_at=generated_at,
        content_hash=content_hash,
    )
    pdf.alias_nb_pages()

    # ── Page 1: Cover / case header ────────────────────────────────────────────
    pdf.add_page()

    # Title block
    pdf.set_font("Helvetica", "", 8)
    pdf.set_text_color(156, 163, 175)
    pdf.cell(0, 5, "INTELLIGENCE REPORT", ln=True)
    pdf.set_font("Helvetica", "B", 18)
    pdf.set_text_color(17, 24, 39)
    pdf.multi_cell(0, 9, project_name)
    pdf.ln(4)

    # Metadata rows
    pdf.kv_row("Case Reference:", case_ref or "—")
    pdf.kv_row("Analyst:", analyst_name or "—")
    pdf.kv_row("Generated:", generated_at)
    pdf.kv_row("Classification:", classification)
    pdf.kv_row("Entities / Links:", f"{len(nodes)} / {len(edges)}")
    pdf.ln(2)

    # SHA-256 integrity hash
    pdf.set_font("Helvetica", "B", 7.5)
    pdf.set_text_color(107, 114, 128)
    pdf.cell(0, 5, "CONTENT INTEGRITY HASH (SHA-256)", ln=True)
    pdf.set_font("Courier", "", 8)
    pdf.set_text_color(17, 24, 39)
    pdf.set_fill_color(243, 244, 246)
    pdf.cell(0, 6, content_hash, fill=True, ln=True)
    pdf.set_font("Helvetica", "", 7.5)
    pdf.set_text_color(107, 114, 128)
    pdf.multi_cell(0, 5,
        "Hash computed over serialised nodes, edges, case notes, and save timestamp. "
        "Verify against server-side records to confirm document has not been modified.")
    pdf.ln(6)

    # ── Summary stats ──────────────────────────────────────────────────────────
    pdf.section_heading("Summary")

    high_risk   = [n for n in nodes if n.get("riskFlag") == "HIGH"]
    medium_risk = [n for n in nodes if n.get("riskFlag") == "MEDIUM"]
    suspects    = [n for n in nodes if n.get("actionFlag") == "suspect"]
    victims     = [n for n in nodes if n.get("actionFlag") == "victim"]

    bx = 15.0
    bw = 42.0
    by = float(pdf.get_y())
    pdf.stat_box(bx,        by, bw, 20, str(len(nodes)),            "Total Entities")
    pdf.stat_box(bx + bw,   by, bw, 20, str(len(edges)),            "Relationships")
    pdf.stat_box(bx + bw*2, by, bw, 20, str(len(high_risk)),        "High Risk",    (224, 82, 82))
    pdf.stat_box(bx + bw*3, by, bw, 20, str(len(medium_risk)),      "Medium Risk",  (201, 138, 46))
    pdf.set_y(by + 24)

    # Entity type breakdown
    type_counts: dict[str, int] = {}
    for n in nodes:
        t = n.get("type", "")
        type_counts[t] = type_counts.get(t, 0) + 1

    pdf.set_font("Helvetica", "B", 8)
    pdf.set_text_color(107, 114, 128)
    pdf.cell(60, 5, "ENTITY TYPE", border="B")
    pdf.cell(20, 5, "COUNT", align="R", border="B", ln=True)
    pdf.set_text_color(0, 0, 0)
    for t, cnt in sorted(type_counts.items(), key=lambda x: -x[1]):
        pdf.set_font("Helvetica", "", 8)
        pdf.cell(60, 5, _ENTITY_LABELS.get(t, t))
        pdf.set_font("Courier", "", 8)
        pdf.cell(20, 5, str(cnt), align="R", ln=True)
    pdf.ln(6)

    # ── Flagged entities ───────────────────────────────────────────────────────
    flagged = [n for n in nodes if n.get("riskFlag") in ("HIGH", "MEDIUM")]
    if flagged:
        pdf.section_heading("Flagged Entities")
        pdf._th([20, 28, 70, 25, 37], ["Risk", "Type", "Value", "Added", "Analyst"])
        for n in sorted(flagged, key=lambda x: {"HIGH": 0, "MEDIUM": 1}.get(x.get("riskFlag", ""), 2)):
            risk = n.get("riskFlag", "NONE")
            pdf._td(
                [20, 28, 70, 25, 37],
                [risk, _ENTITY_LABELS.get(n.get("type", ""), n.get("type", "")),
                 n.get("value", ""), _fmt_dt(n.get("addedAt")), n.get("addedBy", "")],
                row_rgb=_RISK_RGB.get(risk),
            )
        pdf.ln(4)

    # ── Entity inventory (with exhibit numbers) ────────────────────────────────
    pdf.section_heading(f"Entity Inventory ({len(nodes)} entities)")
    pdf._th([22, 18, 30, 60, 20, 30], ["Exhibit", "Risk", "Type", "Value", "Confidence", "Added"])
    sorted_nodes = sorted(nodes, key=lambda n: (n.get("type", ""), n.get("value", "")))
    exhibit_map: dict[str, str] = {}
    for i, n in enumerate(sorted_nodes, start=1):
        exh = f"EXH-{i:03d}"
        exhibit_map[n.get("id", "")] = exh
        risk = n.get("riskFlag", "NONE")
        pdf._td(
            [22, 18, 30, 60, 20, 30],
            [exh, "" if risk == "NONE" else risk,
             _ENTITY_LABELS.get(n.get("type", ""), n.get("type", "")),
             n.get("value", ""),
             n.get("confidence", "ungraded"),
             _fmt_dt(n.get("addedAt"))],
            row_rgb=_RISK_RGB.get(risk) if risk != "NONE" else None,
        )
    pdf.ln(6)

    # ── Relationships appendix ─────────────────────────────────────────────────
    if edges:
        pdf.section_heading(f"Relationships ({len(edges)} links)")
        pdf._th([22, 22, 45, 45, 18, 28], ["From", "To", "Source Value", "Target Value", "Grade", "Label"])
        node_idx = {n.get("id", ""): n for n in nodes}
        for e in edges:
            src = node_idx.get(e.get("source", ""), {})
            tgt = node_idx.get(e.get("target", ""), {})
            grade_obj = e.get("grade", {})
            grade_str = f'{grade_obj.get("sourceReliability","?")} / {grade_obj.get("infoAccuracy","?")}'
            from_exh = exhibit_map.get(e.get("source", ""), "—")
            to_exh   = exhibit_map.get(e.get("target", ""), "—")
            pdf._td(
                [22, 22, 45, 45, 18, 28],
                [from_exh, to_exh,
                 src.get("value", "?"), tgt.get("value", "?"),
                 grade_str, e.get("label", "")],
            )
        pdf.ln(6)

    # ── Intelligence grading legend ────────────────────────────────────────────
    pdf.section_heading("Intelligence Grading Legend (NATO STANAG 2511)")

    pdf.set_font("Helvetica", "B", 8)
    pdf.set_text_color(55, 65, 81)
    pdf.cell(0, 5, "Source Reliability", ln=True)
    reliability = [
        ("A", "Completely reliable",      "No doubt about authenticity; history of complete reliability"),
        ("B", "Usually reliable",          "Minor doubt; history of valid information in most cases"),
        ("C", "Fairly reliable",           "Doubt; provided valid information in the past"),
        ("D", "Not usually reliable",      "Significant doubt; history of invalid information in most cases"),
        ("U", "Ungraded",                  "Source reliability has not been assessed"),
    ]
    pdf._th([12, 48, 120], ["Grade", "Label", "Description"])
    for grade, label, desc in reliability:
        pdf._td([12, 48, 120], [grade, label, desc])
    pdf.ln(4)

    pdf.set_font("Helvetica", "B", 8)
    pdf.set_text_color(55, 65, 81)
    pdf.cell(0, 5, "Information Accuracy", ln=True)
    accuracy = [
        ("1", "Confirmed",     "Confirmed by other independent sources; logical; consistent"),
        ("2", "Probably true", "Not confirmed; logical; consistent with other information"),
        ("3", "Possibly true", "Not confirmed; reasonably logical; agrees with some other info"),
        ("4", "Doubtful",      "Not confirmed; possible but illogical; no other information"),
        ("U", "Ungraded",      "Information accuracy has not been assessed"),
    ]
    pdf._th([12, 48, 120], ["Grade", "Label", "Description"])
    for grade, label, desc in accuracy:
        pdf._td([12, 48, 120], [grade, label, desc])
    pdf.ln(6)

    # ── Case notes ─────────────────────────────────────────────────────────────
    if case_notes and case_notes.strip():
        pdf.section_heading("Case Notes")
        pdf.set_font("Helvetica", "", 9)
        pdf.set_fill_color(249, 250, 251)
        pdf.set_draw_color(229, 231, 235)
        pdf.multi_cell(0, 5.5, case_notes.strip(), border=1, fill=True)
        pdf.ln(4)

    # ── Evidence manifest ──────────────────────────────────────────────────────
    if evidence:
        pdf.section_heading(
            f"Evidence Manifest ({len(evidence)} capture{'s' if len(evidence) != 1 else ''})"
        )
        pdf._th([50, 40, 32, 58], ["Entity", "Transform", "Captured", "SHA-256 (truncated)"])
        for ev in evidence:
            sha = ev.get("sha256", "")
            pdf._td(
                [50, 40, 32, 58],
                [
                    _safe(ev.get("entity_value", ""), 40),
                    _safe(ev.get("transform_name", ""), 30),
                    _fmt_dt(ev.get("captured_at")),
                    sha[:24] + "…" if len(sha) > 24 else sha,
                ],
            )
        pdf.ln(4)
        pdf.set_font("Helvetica", "", 7.5)
        pdf.set_text_color(107, 114, 128)
        pdf.multi_cell(0, 5,
            "Each row is a SHA-256 hash of the raw transform response at time of capture. "
            "Full hashes and raw JSON are available in the Raven platform.")
        pdf.ln(4)

    # ── Final footer block ─────────────────────────────────────────────────────
    pdf.ln(4)
    pdf.set_draw_color(229, 231, 235)
    pdf.set_line_width(0.3)
    pdf.line(15, pdf.get_y(), 195, pdf.get_y())
    pdf.ln(3)
    pdf.set_font("Helvetica", "", 7.5)
    pdf.set_text_color(156, 163, 175)
    pdf.cell(90, 5, f"Generated by Raven · {generated_at}", ln=False)
    pdf.cell(90, 5, f"{classification} — Handle according to policy", align="R", ln=True)

    return bytes(pdf.output())
