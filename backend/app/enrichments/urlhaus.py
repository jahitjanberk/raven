import httpx

from app.enrichments.base import BaseTransform, safe_error


class URLhausLookup(BaseTransform):
    name = "URLhaus Check"
    slug = "urlhaus"
    description = (
        "Query Abuse.ch URLhaus for malicious URLs associated with a domain or URL. "
        "No API key required."
    )
    accepts = ["url", "domain"]
    returns = ["url", "domain", "ip"]
    requires_key = False
    tier = "free"
    category = "Threat Intelligence"

    async def run(self, value: str, api_key: str | None) -> dict:
        nodes: list[dict] = []
        api_url = "https://urlhaus-api.abuse.ch/v1/"

        payload: dict
        if value.startswith("http://") or value.startswith("https://"):
            payload = {"url": value}
            endpoint = api_url
        else:
            payload = {"host": value}
            endpoint = api_url + "host/"

        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.post(endpoint, data=payload)
        except Exception as exc:
            return {"nodes": [], "edges": [], "error": safe_error(exc)}

        if not resp.is_success:
            return {"nodes": [], "edges": [], "error": f"URLhaus: {resp.status_code}"}

        data = resp.json()
        query_status = data.get("query_status", "")

        if query_status in ("no_results", "not_found"):
            return {"nodes": [], "edges": [], "error": "Not found in URLhaus database"}

        # Host lookup result
        urls_list = data.get("urls", [])
        for entry in urls_list[:8]:
            url_val = entry.get("url", "")
            url_status = entry.get("url_status", "")
            threat = entry.get("threat", "")
            if url_val:
                note = f"URLhaus · {threat} · Status: {url_status}"
                nodes.append({"type": "url", "value": url_val, "source_url": f"https://urlhaus.abuse.ch/browse.php?search={value}", "note": note})

        # URL lookup result
        if not urls_list and data.get("url"):
            url_val = data.get("url", value)
            threat = data.get("threat", "")
            url_status = data.get("url_status", "")
            note = f"URLhaus · {threat} · Status: {url_status}"
            nodes.append({"type": "url", "value": url_val, "source_url": f"https://urlhaus.abuse.ch/url/{data.get('id', '')}/", "note": note})

        # Associated payloads / tags
        payloads = data.get("payloads", []) or []
        for p in payloads[:3]:
            sha = p.get("sha256_hash", "")
            if sha:
                nodes.append({"type": "hash", "value": sha, "source_url": None, "note": f"Payload from {value}"})

        if not nodes:
            return {"nodes": [], "edges": [], "error": "URLhaus returned no actionable indicators"}

        return {"nodes": nodes, "edges": []}
