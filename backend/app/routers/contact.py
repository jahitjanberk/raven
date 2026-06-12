from fastapi import APIRouter
from pydantic import BaseModel

from app.email import _send, _wrap

router = APIRouter(prefix="/contact", tags=["contact"])

CONTACT_EMAIL = "contact@raven.app"


class ContactRequest(BaseModel):
    enquiry_type: str
    name: str
    org: str
    email: str
    role: str = ""
    team_size: str = ""
    jurisdiction: str = ""
    badge_ref: str = ""
    message: str


@router.post("")
async def submit_contact(body: ContactRequest) -> dict:
    label = {
        "enterprise": "Enterprise licensing",
        "law-enforcement": "Law enforcement",
        "partnership": "Partnership",
        "general": "General enquiry",
    }.get(body.enquiry_type, body.enquiry_type)

    rows = [
        ("Enquiry type", label),
        ("Name", body.name),
        ("Organisation", body.org),
        ("Email", body.email),
    ]
    if body.role:
        rows.append(("Role", body.role))
    if body.team_size:
        rows.append(("Team size", body.team_size))
    if body.jurisdiction:
        rows.append(("Jurisdiction", body.jurisdiction))
    if body.badge_ref:
        rows.append(("Badge / warrant ref", body.badge_ref))

    table_rows = "".join(
        f"<tr><td style='padding:8px 12px;font-size:12px;color:#9a9aa0;font-family:monospace;white-space:nowrap;border-bottom:1px solid #ececee'>{k}</td>"
        f"<td style='padding:8px 12px;font-size:13px;color:#0a0a0b;border-bottom:1px solid #ececee'>{v}</td></tr>"
        for k, v in rows
    )

    html = _wrap(f"""
<h1>New contact enquiry — {label}</h1>
<table style="width:100%;border-collapse:collapse;margin-bottom:24px;border:1px solid #ececee">
  {table_rows}
</table>
<p style="font-size:12px;color:#9a9aa0;font-family:monospace;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">Message</p>
<div style="padding:16px;background:#f8f8fa;border:1px solid #ececee;font-size:14px;color:#3a3a3f;line-height:1.65;white-space:pre-wrap">{body.message}</div>
<p style="margin-top:24px;font-size:13px;color:#9a9aa0">Reply directly to <a href="mailto:{body.email}" style="color:#0a0a0b">{body.email}</a> to respond.</p>
""")

    _send(CONTACT_EMAIL, f"[Raven Contact] {label} — {body.name}", html)
    return {"ok": True}
