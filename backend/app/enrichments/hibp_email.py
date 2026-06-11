import httpx

from app.enrichments.base import BaseTransform, safe_error


class HIBPEmail(BaseTransform):
    name = "HaveIBeenPwned Breach Check"
    slug = "hibp_email"
    description = (
        "Checks whether an email address appears in known public data breaches "
        "using the HaveIBeenPwned v3 API. Returns each breach as an org node."
    )
    accepts = ["email"]
    returns = ["org"]
    requires_key = True
    tier = "free"
    category = "Threat Intelligence"

    async def run(self, value: str, api_key: str | None) -> dict:
        if not api_key:
            return {"nodes": [], "edges": [], "error": "HIBP API key required"}

        url = f"https://haveibeenpwned.com/api/v3/breachedaccount/{value}"
        headers = {
            "hibp-api-key": api_key,
            "User-Agent": "Raven-Transform-Hub/1.0",
        }
        try:
            async with httpx.AsyncClient(timeout=20) as client:
                resp = await client.get(url, headers=headers)
                if resp.status_code == 404:
                    # 404 means "no breaches found" — not an error
                    return {"nodes": [], "edges": []}
                resp.raise_for_status()
                data: list[dict] = resp.json()
        except Exception as exc:
            return {"nodes": [], "edges": [], "error": safe_error(exc)}

        nodes: list[dict] = []
        source_url = f"https://haveibeenpwned.com/account/{value}"

        for breach in data:
            breach_name = breach.get("Name")
            if not breach_name:
                continue
            breach_date = breach.get("BreachDate", "Unknown date")
            pwn_count = breach.get("PwnCount")
            count_str = f"{pwn_count:,}" if pwn_count else "?"
            nodes.append(
                {
                    "type": "org",
                    "value": breach_name,
                    "source_url": source_url,
                    "note": (
                        f"Data breach containing {value}"
                        f"  ·  Date: {breach_date}"
                        f"  ·  Accounts exposed: {count_str}"
                    ),
                }
            )

        return {"nodes": nodes, "edges": []}
