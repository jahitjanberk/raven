import httpx

from app.enrichments.base import BaseTransform, safe_error


class VirusTotalLookup(BaseTransform):
    name = "VirusTotal Lookup"
    slug = "virustotal"
    description = (
        "Look up IPs, domains, URLs, and file hashes against VirusTotal's "
        "threat-intelligence database. Returns detection verdicts and related indicators."
    )
    accepts = ["ip", "domain", "url", "hash"]
    returns = ["domain", "ip", "url"]
    requires_key = True
    tier = "pro"
    category = "Threat Intelligence"

    async def run(self, value: str, api_key: str | None) -> dict:
        if not api_key:
            return {"nodes": [], "edges": [], "error": "VirusTotal API key required"}

        headers = {"x-apikey": api_key}
        nodes: list[dict] = []

        # Detect input type and choose endpoint
        if len(value) in (32, 40, 64, 128) and all(c in "0123456789abcdefABCDEF" for c in value):
            url = f"https://www.virustotal.com/api/v3/files/{value}"
            source_url = f"https://www.virustotal.com/gui/file/{value}"
        elif value.startswith("http://") or value.startswith("https://"):
            import base64
            url_id = base64.urlsafe_b64encode(value.encode()).decode().rstrip("=")
            url = f"https://www.virustotal.com/api/v3/urls/{url_id}"
            source_url = f"https://www.virustotal.com/gui/url/{url_id}"
        elif "." in value and not value[0].isdigit():
            url = f"https://www.virustotal.com/api/v3/domains/{value}"
            source_url = f"https://www.virustotal.com/gui/domain/{value}"
        else:
            url = f"https://www.virustotal.com/api/v3/ip_addresses/{value}"
            source_url = f"https://www.virustotal.com/gui/ip-address/{value}"

        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.get(url, headers=headers)
        except Exception as exc:
            return {"nodes": [], "edges": [], "error": safe_error(exc)}

        if resp.status_code == 401:
            return {"nodes": [], "edges": [], "error": "Invalid VirusTotal API key"}
        if resp.status_code == 404:
            return {"nodes": [], "edges": [], "error": "Not found in VirusTotal"}
        if not resp.is_success:
            return {"nodes": [], "edges": [], "error": f"VirusTotal: {resp.status_code}"}

        data = resp.json().get("data", {})
        attrs = data.get("attributes", {})

        # Detection stats
        stats = attrs.get("last_analysis_stats", {})
        malicious = stats.get("malicious", 0)
        suspicious = stats.get("suspicious", 0)
        total = sum(stats.values()) if stats else 0

        note = f"VT detections: {malicious} malicious, {suspicious} suspicious / {total} engines"

        nodes.append({
            "type": "domain" if "." in value and not value[0].isdigit() else "ip",
            "value": value,
            "source_url": source_url,
            "note": note,
        })

        # Related domains from resolutions (IP lookups)
        resolutions = attrs.get("last_dns_records", []) or []
        for rec in resolutions[:5]:
            if rec.get("type") in ("A", "AAAA"):
                ip_val = rec.get("value", "").strip()
                if ip_val:
                    nodes.append({"type": "ip", "value": ip_val, "source_url": source_url, "note": f"DNS resolution of {value}"})

        return {"nodes": nodes, "edges": []}
