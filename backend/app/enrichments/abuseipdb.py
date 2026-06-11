import httpx

from app.enrichments.base import BaseTransform, safe_error


class AbuseIPDBLookup(BaseTransform):
    name = "AbuseIPDB Check"
    slug = "abuseipdb"
    description = (
        "Check an IP address against the AbuseIPDB database for reported malicious activity. "
        "Returns abuse confidence score, ISP, and usage type."
    )
    accepts = ["ip"]
    returns = ["org", "domain"]
    requires_key = True
    tier = "pro"
    category = "Threat Intelligence"

    async def run(self, value: str, api_key: str | None) -> dict:
        if not api_key:
            return {"nodes": [], "edges": [], "error": "AbuseIPDB API key required"}

        source_url = f"https://www.abuseipdb.com/check/{value}"

        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.get(
                    "https://api.abuseipdb.com/api/v2/check",
                    params={"ipAddress": value, "maxAgeInDays": 90, "verbose": True},
                    headers={"Key": api_key, "Accept": "application/json"},
                )
        except Exception as exc:
            return {"nodes": [], "edges": [], "error": safe_error(exc)}

        if resp.status_code == 401:
            return {"nodes": [], "edges": [], "error": "Invalid AbuseIPDB API key"}
        if not resp.is_success:
            return {"nodes": [], "edges": [], "error": f"AbuseIPDB: {resp.status_code}"}

        data = resp.json().get("data", {})
        nodes: list[dict] = []

        confidence = data.get("abuseConfidenceScore", 0)
        isp = data.get("isp", "")
        usage_type = data.get("usageType", "")
        domain = data.get("domain", "")
        country = data.get("countryCode", "")
        total_reports = data.get("totalReports", 0)
        is_tor = data.get("isTor", False)

        note_parts = [
            f"Abuse confidence: {confidence}%",
            f"Reports: {total_reports}",
            f"ISP: {isp}" if isp else None,
            f"Usage: {usage_type}" if usage_type else None,
            f"Country: {country}" if country else None,
            "Tor exit node" if is_tor else None,
        ]
        note = " · ".join(p for p in note_parts if p)

        nodes.append({"type": "ip", "value": value, "source_url": source_url, "note": note})

        if domain:
            nodes.append({"type": "domain", "value": domain, "source_url": source_url, "note": f"Reverse DNS for {value}"})

        if isp:
            nodes.append({"type": "org", "value": isp, "source_url": source_url, "note": f"ISP hosting {value}"})

        return {"nodes": nodes, "edges": []}
