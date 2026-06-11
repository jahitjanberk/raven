import os
import re

import httpx

RESEND_API_KEY = os.getenv("RESEND_API_KEY", "")
FROM_ADDR = os.getenv("EMAIL_FROM", "Raven <noreply@raven.app>")
APP_URL = os.getenv("APP_URL", "http://localhost:5173")


# ── HTML wrapper ──────────────────────────────────────────────────────────────

def _wrap(content: str) -> str:
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<style>
  body{{margin:0;padding:0;background:#f4f4f6;font-family:-apple-system,'Helvetica Neue',Arial,sans-serif;-webkit-font-smoothing:antialiased}}
  .wrap{{max-width:540px;margin:40px auto;background:#fff;border:1px solid #e8e8eb}}
  .hdr{{padding:22px 32px;border-bottom:1px solid #ececee;display:flex;align-items:center;gap:10px}}
  .logo{{font-family:'Courier New',monospace;font-size:11px;letter-spacing:.22em;font-weight:700;color:#0a0a0b;text-transform:uppercase}}
  .body{{padding:36px 32px 28px}}
  h1{{margin:0 0 16px;font-size:22px;font-weight:500;color:#0a0a0b;letter-spacing:-.02em;line-height:1.2}}
  p{{margin:0 0 16px;font-size:14px;line-height:1.65;color:#3a3a3f}}
  .btn{{display:inline-block;margin:4px 0 20px;padding:13px 28px;background:#0a0a0b;color:#fff!important;text-decoration:none!important;font-family:'Courier New',monospace;font-size:10.5px;letter-spacing:.08em;text-transform:uppercase}}
  .link{{font-family:'Courier New',monospace;font-size:11px;color:#9a9aa0;word-break:break-all}}
  .ftr{{padding:18px 32px;background:#f8f8fa;border-top:1px solid #ececee;font-size:11.5px;color:#9a9aa0;line-height:1.6}}
  .ftr a{{color:#9a9aa0}}
  @media(max-width:600px){{.wrap{{margin:0;border:none}}.body{{padding:28px 20px 20px}}.hdr{{padding:18px 20px}}}}
</style>
</head>
<body>
<div class="wrap">
  <div class="hdr">
    <span style="display:inline-block;width:9px;height:9px;border:1.5px solid #0a0a0b;transform:rotate(45deg)"></span>
    <span class="logo">Raven</span>
  </div>
  <div class="body">{content}</div>
  <div class="ftr">
    Raven Intelligence Platform &middot; <a href="{APP_URL}">raven.app</a><br>
    If you weren&rsquo;t expecting this email, you can safely ignore it.
  </div>
</div>
</body>
</html>"""


# ── Transport ─────────────────────────────────────────────────────────────────

def _send(to: str, subject: str, html: str) -> None:
    if not RESEND_API_KEY:
        plain = re.sub(r'<style[^>]*>.*?</style>', '', html, flags=re.DOTALL)
        plain = re.sub(r'<[^>]+>', '', plain)
        plain = re.sub(r'\n{3,}', '\n\n', plain).strip()
        bar = "=" * 60
        print(f"\n{bar}\nRAVEN EMAIL  (set RESEND_API_KEY to send for real)\nTo:      {to}\nSubject: {subject}\n\n{plain}\n{bar}\n", flush=True)
        return

    try:
        httpx.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {RESEND_API_KEY}",
                "Content-Type": "application/json",
            },
            json={"from": FROM_ADDR, "to": [to], "subject": subject, "html": html},
            timeout=10,
        ).raise_for_status()
    except Exception as exc:
        print(f"[email] Failed to send to {to}: {exc}", flush=True)


# ── Email types ───────────────────────────────────────────────────────────────

def send_welcome_email(to: str, name: str, org_name: str) -> None:
    first = name.split()[0] if name else "there"
    html = _wrap(f"""
<h1>Welcome to Raven, {first}</h1>
<p>Your account is ready. You&rsquo;re now part of <strong>{org_name}</strong> on Raven &mdash; the intelligence-led investigation platform.</p>
<p><a href="{APP_URL}/app" class="btn">Open Raven &rarr;</a></p>
<p>If you have any questions, reply to this email and we&rsquo;ll help you get started.</p>
""")
    _send(to, "Welcome to Raven", html)


def send_invite_email(to: str, invited_by: str, org_name: str, activate_url: str) -> None:
    html = _wrap(f"""
<h1>You&rsquo;ve been invited to join {org_name}</h1>
<p><strong>{invited_by}</strong> has invited you to join <strong>{org_name}</strong> on Raven.</p>
<p><a href="{activate_url}" class="btn">Accept invite &rarr;</a></p>
<p class="link">{activate_url}</p>
<p>This link expires in 7&nbsp;days. If you weren&rsquo;t expecting this, you can ignore it.</p>
""")
    _send(to, f"You've been invited to join {org_name} on Raven", html)


def send_request_access_email(to: str, activate_url: str) -> None:
    html = _wrap(f"""
<h1>Your Raven access link</h1>
<p>You requested access to Raven. Click below to create your account.</p>
<p><a href="{activate_url}" class="btn">Set up your account &rarr;</a></p>
<p class="link">{activate_url}</p>
<p>This link expires in 7&nbsp;days.</p>
""")
    _send(to, "Your Raven access link", html)


def send_password_reset_email(to: str, reset_url: str) -> None:
    html = _wrap(f"""
<h1>Reset your password</h1>
<p>You requested a password reset for your Raven account. Click below to choose a new password.</p>
<p><a href="{reset_url}" class="btn">Set new password &rarr;</a></p>
<p class="link">{reset_url}</p>
<p>This link expires in 2&nbsp;hours. If you didn&rsquo;t request a reset, ignore this email.</p>
""")
    _send(to, "Reset your Raven password", html)
