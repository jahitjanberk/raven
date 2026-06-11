import httpx

from app.enrichments.base import BaseTransform, safe_error


class IPInfoIP(BaseTransform):
    name = "IPinfo.io Lookup"
    slug = "ipinfo_ip"
    description = (
        "Free IP intelligence via IPinfo.io. "
        "Returns ASN, organization, city, country, and PTR hostname nodes. "
        "No API key required for the free tier (50 k lookups/month)."
    )
    accepts = ["ip"]
    returns = ["org", "domain"]
    requires_key = False
    tier = "free"
    category = "Infrastructure"

    async def run(self, value: str, api_key: str | None) -> dict:
        url = f"https://ipinfo.io/{value}/json"
        headers: dict[str, str] = {}
        if api_key:
            headers["Authorization"] = f"Bearer {api_key}"

        try:
            async with httpx.AsyncClient(timeout=15) as client:
                resp = await client.get(url, headers=headers)
                resp.raise_for_status()
                data: dict = resp.json()
        except Exception as exc:
            return {"nodes": [], "edges": [], "error": safe_error(exc)}

        nodes: list[dict] = []
        source_url = f"https://ipinfo.io/{value}"

        # org field looks like "AS14061 DigitalOcean, LLC"
        org_raw = data.get("org", "")
        parts = org_raw.split(" ", 1)
        asn = parts[0] if parts[0].startswith("AS") else None
        org_name = parts[1] if len(parts) > 1 and asn else org_raw

        city = data.get("city", "")
        region = data.get("region", "")
        country = data.get("country", "")
        location_str = "  ·  ".join(filter(None, [city, region, country]))

        if org_name:
            nodes.append(
                {
                    "type": "org",
                    "value": org_name,
                    "source_url": source_url,
                    "note": "  ·  ".join(
                        filter(
                            None,
                            [
                                f"Hosting organization for {value}",
                                location_str or None,
                                f"ASN: {asn}" if asn else None,
                            ],
                        )
                    ),
                }
            )

        # PTR hostname
        hostname = data.get("hostname")
        if hostname and hostname != value:
            nodes.append(
                {
                    "type": "domain",
                    "value": hostname,
                    "source_url": source_url,
                    "note": f"PTR record for {value} (IPinfo.io)",
                }
            )

        return {"nodes": nodes, "edges": []}
