import asyncio
from typing import Any

import whois  # python-whois

from app.enrichments.base import BaseTransform, safe_error


class WhoisDomain(BaseTransform):
    name = "WHOIS / RDAP Lookup"
    slug = "whois_domain"
    description = (
        "WHOIS registration lookup for domain names. "
        "Returns registrar, creation date, expiry, and name server nodes."
    )
    accepts = ["domain"]
    returns = ["org", "domain"]
    requires_key = False
    tier = "free"
    category = "Infrastructure"

    async def run(self, value: str, api_key: str | None) -> dict:
        loop = asyncio.get_event_loop()
        try:
            w: Any = await loop.run_in_executor(None, whois.whois, value)
        except Exception as exc:
            return {"nodes": [], "edges": [], "error": safe_error(exc)}

        nodes: list[dict] = []
        source_url = f"https://www.whois.com/whois/{value}"

        # Registrar → org node
        registrar = getattr(w, "registrar", None)
        if registrar and isinstance(registrar, str) and registrar.strip():
            nodes.append(
                {
                    "type": "org",
                    "value": registrar.strip(),
                    "source_url": source_url,
                    "note": f"Registrar for {value}",
                }
            )

        # Creation / expiry info goes into a note on the registrar node if present
        created = getattr(w, "creation_date", None)
        expiry = getattr(w, "expiration_date", None)
        created_str = str(created[0] if isinstance(created, list) else created)[:10] if created else None
        expiry_str = str(expiry[0] if isinstance(expiry, list) else expiry)[:10] if expiry else None
        if nodes and (created_str or expiry_str):
            parts = []
            if created_str:
                parts.append(f"Created: {created_str}")
            if expiry_str:
                parts.append(f"Expires: {expiry_str}")
            nodes[0]["note"] += "  ·  " + "  ·  ".join(parts)

        # Name servers → domain nodes
        raw_ns = getattr(w, "name_servers", None) or []
        if isinstance(raw_ns, str):
            raw_ns = [raw_ns]
        seen_ns: set[str] = set()
        for ns in raw_ns:
            ns_clean = str(ns).lower().rstrip(".")
            if ns_clean and ns_clean not in seen_ns:
                seen_ns.add(ns_clean)
                nodes.append(
                    {
                        "type": "domain",
                        "value": ns_clean,
                        "source_url": source_url,
                        "note": f"Name server for {value}",
                    }
                )

        return {"nodes": nodes, "edges": []}
