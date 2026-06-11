import re
from urllib.parse import quote

import httpx

from app.enrichments.base import BaseTransform, safe_error

_DOMAIN_RE = re.compile(r'^[a-zA-Z0-9\-\.%]+$')


class CrtshDomain(BaseTransform):
    name = "crt.sh Certificate Transparency"
    slug = "crtsh_domain"
    description = (
        "Queries crt.sh for SSL/TLS certificate transparency logs. "
        "Returns domain names discovered in certificate SANs and common names."
    )
    accepts = ["domain"]
    returns = ["domain", "cert"]
    requires_key = False
    tier = "free"
    category = "Infrastructure"

    async def run(self, value: str, api_key: str | None) -> dict:
        if not _DOMAIN_RE.match(value):
            return {"nodes": [], "edges": [], "error": "Invalid domain name"}
        encoded = quote(value, safe="")
        url = f"https://crt.sh/?q={encoded}&output=json"
        try:
            async with httpx.AsyncClient(timeout=20, follow_redirects=True) as client:
                resp = await client.get(url, headers={"Accept": "application/json"})
                resp.raise_for_status()
                data: list[dict] = resp.json()
        except Exception as exc:
            return {"nodes": [], "edges": [], "error": safe_error(exc)}

        seen: set[str] = set()
        # Seed with the query domain so we don't re-add it
        seen.add(value.lower())

        nodes: list[dict] = []
        source_url = f"https://crt.sh/?q={encoded}"

        for entry in data:
            raw_names = entry.get("name_value", "")
            for name in raw_names.split("\n"):
                # Strip wildcard prefix
                clean = name.strip().lstrip("*.").lower()
                if (
                    clean
                    and clean not in seen
                    and not clean.startswith("(")
                    and "." in clean
                ):
                    seen.add(clean)
                    nodes.append(
                        {
                            "type": "domain",
                            "value": clean,
                            "source_url": source_url,
                            "note": (
                                f"Discovered in certificate for {value} via crt.sh"
                                f"  ·  Issuer: {entry.get('issuer_name', 'Unknown')}"
                            ),
                        }
                    )
                    if len(nodes) >= 25:
                        break
            if len(nodes) >= 25:
                break

        return {"nodes": nodes, "edges": []}
