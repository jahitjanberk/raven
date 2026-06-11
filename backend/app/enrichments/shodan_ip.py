import asyncio

import shodan  # shodan

from app.enrichments.base import BaseTransform, safe_error


class ShodanIP(BaseTransform):
    name = "Shodan IP Lookup"
    slug = "shodan_ip"
    description = (
        "Queries Shodan for open ports, hostnames, organization and ASN data "
        "associated with an IP address. Requires a free Shodan API key."
    )
    accepts = ["ip"]
    returns = ["org", "domain"]
    requires_key = True
    tier = "free"
    category = "Infrastructure"

    async def run(self, value: str, api_key: str | None) -> dict:
        if not api_key:
            return {"nodes": [], "edges": [], "error": "Shodan API key required"}

        loop = asyncio.get_event_loop()

        def _query() -> dict:
            api = shodan.Shodan(api_key)
            return api.host(value)  # type: ignore[return-value]

        try:
            result = await loop.run_in_executor(None, _query)
        except shodan.APIError as exc:
            return {"nodes": [], "edges": [], "error": safe_error(exc)}
        except Exception as exc:
            return {"nodes": [], "edges": [], "error": safe_error(exc)}

        nodes: list[dict] = []
        source_url = f"https://www.shodan.io/host/{value}"

        # Organization
        org = result.get("org")
        asn = result.get("asn", "N/A")
        country = result.get("country_name", "Unknown")
        ports = sorted(
            {item.get("port") for item in result.get("data", []) if item.get("port")}
        )
        ports_str = "  ".join(str(p) for p in ports[:10])

        if org:
            nodes.append(
                {
                    "type": "org",
                    "value": org,
                    "source_url": source_url,
                    "note": (
                        f"Hosting organization for {value}"
                        f"  ·  ASN: {asn}"
                        f"  ·  {country}"
                        f"  ·  Open ports: {ports_str or 'none detected'}"
                    ),
                }
            )

        # Hostnames → domain nodes
        for hostname in (result.get("hostnames") or [])[:8]:
            if hostname:
                nodes.append(
                    {
                        "type": "domain",
                        "value": hostname,
                        "source_url": source_url,
                        "note": f"Hostname resolved from {value} (Shodan)",
                    }
                )

        return {"nodes": nodes, "edges": []}
