import asyncio

import httpx

from app.enrichments.base import BaseTransform, safe_error

_POLL_INTERVAL = 3   # seconds between result polls
_POLL_ATTEMPTS = 12  # give up after ~36 s


class URLScanURL(BaseTransform):
    name = "URLScan.io Submission"
    slug = "urlscan_url"
    description = (
        "Submits a URL or domain to URLScan.io for sandboxed analysis. "
        "Returns contacted IPs, linked domains, and page metadata."
    )
    accepts = ["url", "domain"]
    returns = ["ip", "domain"]
    requires_key = True
    tier = "free"
    category = "Threat Intelligence"

    async def run(self, value: str, api_key: str | None) -> dict:
        if not api_key:
            return {"nodes": [], "edges": [], "error": "URLScan.io API key required"}

        scan_url = value if value.startswith("http") else f"https://{value}"
        submit_headers = {
            "API-Key": api_key,
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient(timeout=30, follow_redirects=True) as client:
                # Submit
                sub_resp = await client.post(
                    "https://urlscan.io/api/v1/scan/",
                    json={"url": scan_url, "visibility": "private"},
                    headers=submit_headers,
                )
                sub_resp.raise_for_status()
                sub_data = sub_resp.json()

                uuid = sub_data.get("uuid")
                result_url: str = sub_data.get("result", "")
                if not uuid:
                    return {"nodes": [], "edges": [], "error": "No scan UUID in URLScan response"}

                # Poll for result
                result_data: dict | None = None
                for _ in range(_POLL_ATTEMPTS):
                    await asyncio.sleep(_POLL_INTERVAL)
                    poll = await client.get(f"https://urlscan.io/api/v1/result/{uuid}/")
                    if poll.status_code == 200:
                        result_data = poll.json()
                        break

                if result_data is None:
                    return {"nodes": [], "edges": [], "error": "URLScan result timed out"}

        except Exception as exc:
            return {"nodes": [], "edges": [], "error": safe_error(exc)}

        nodes: list[dict] = []
        seen: set[str] = set()
        # Seed with the queried value so we don't re-add it
        seen.add(value.lower().lstrip("https://").lstrip("http://").split("/")[0])

        lists = result_data.get("lists", {})

        # IPs
        for ip in (lists.get("ips") or [])[:8]:
            if ip and ip not in seen:
                seen.add(ip)
                nodes.append(
                    {
                        "type": "ip",
                        "value": ip,
                        "source_url": result_url,
                        "note": f"IP contacted during URLScan of {value}",
                    }
                )

        # Domains
        for domain in (lists.get("domains") or [])[:8]:
            if domain and domain not in seen:
                seen.add(domain)
                nodes.append(
                    {
                        "type": "domain",
                        "value": domain,
                        "source_url": result_url,
                        "note": f"Domain contacted during URLScan of {value}",
                    }
                )

        return {"nodes": nodes, "edges": []}
