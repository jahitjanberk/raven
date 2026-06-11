import asyncio
import time

import httpx
from fastapi import APIRouter

router = APIRouter(prefix="/status", tags=["status"])

PROBES = [
    {"name": "crt.sh",          "slug": "crtsh",      "url": "https://crt.sh",             "category": "Intelligence Source"},
    {"name": "IPinfo.io",       "slug": "ipinfo",     "url": "https://ipinfo.io",          "category": "Intelligence Source"},
    {"name": "HaveIBeenPwned",  "slug": "hibp",       "url": "https://haveibeenpwned.com", "category": "Intelligence Source"},
    {"name": "URLScan.io",      "slug": "urlscan",    "url": "https://urlscan.io",         "category": "Intelligence Source"},
    {"name": "Shodan",          "slug": "shodan",     "url": "https://www.shodan.io",      "category": "Intelligence Source"},
    {"name": "VirusTotal",      "slug": "virustotal", "url": "https://www.virustotal.com", "category": "Intelligence Source"},
    {"name": "AbuseIPDB",       "slug": "abuseipdb",  "url": "https://www.abuseipdb.com",  "category": "Intelligence Source"},
    {"name": "URLhaus",         "slug": "urlhaus",    "url": "https://urlhaus-api.abuse.ch","category": "Intelligence Source"},
]

_cache: dict = {}
_CACHE_TTL = 60.0


async def _probe(client: httpx.AsyncClient, service: dict) -> dict:
    start = time.monotonic()
    try:
        resp = await client.head(service["url"], timeout=5.0, follow_redirects=True)
        latency_ms = round((time.monotonic() - start) * 1000)
        status = "operational" if resp.status_code < 500 else "degraded"
    except httpx.TimeoutException:
        latency_ms = 5000
        status = "degraded"
    except Exception:
        latency_ms = round((time.monotonic() - start) * 1000)
        status = "down"
    return {**service, "status": status, "latency_ms": latency_ms}


@router.get("")
async def get_status() -> dict:
    now = time.time()
    if _cache.get("expires_at", 0) > now:
        return _cache["data"]

    async with httpx.AsyncClient() as client:
        results = list(await asyncio.gather(*[_probe(client, s) for s in PROBES]))

    statuses = {r["status"] for r in results}
    if "down" in statuses:
        overall = "outage"
    elif "degraded" in statuses:
        overall = "degraded"
    else:
        overall = "operational"

    data = {
        "overall": overall,
        "api": "operational",
        "services": results,
        "checked_at": now,
    }
    _cache["expires_at"] = now + _CACHE_TTL
    _cache["data"] = data
    return data
