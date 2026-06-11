import httpx

from app.enrichments.base import BaseTransform, safe_error


class CompaniesHouseLookup(BaseTransform):
    name = "Companies House Lookup"
    slug = "companies_house"
    description = (
        "Search UK Companies House for company registration details. "
        "Returns officers, registered address, and filing status."
    )
    accepts = ["org", "company"]
    returns = ["person", "org", "location"]
    requires_key = True
    tier = "pro"
    category = "Financial"

    async def run(self, value: str, api_key: str | None) -> dict:
        if not api_key:
            return {"nodes": [], "edges": [], "error": "Companies House API key required"}

        nodes: list[dict] = []
        source_url = f"https://find-and-update.company-information.service.gov.uk/search?q={value}"

        try:
            async with httpx.AsyncClient(timeout=15, auth=(api_key, "")) as client:
                search_resp = await client.get(
                    "https://api.company-information.service.gov.uk/search/companies",
                    params={"q": value, "items_per_page": 1},
                )
        except Exception as exc:
            return {"nodes": [], "edges": [], "error": safe_error(exc)}

        if search_resp.status_code == 401:
            return {"nodes": [], "edges": [], "error": "Invalid Companies House API key"}
        if not search_resp.is_success:
            return {"nodes": [], "edges": [], "error": f"Companies House: {search_resp.status_code}"}

        items = search_resp.json().get("items", [])
        if not items:
            return {"nodes": [], "edges": [], "error": "No company found"}

        company = items[0]
        company_number = company.get("company_number", "")
        company_name = company.get("title", value)
        status = company.get("company_status", "")
        company_type = company.get("company_type", "")

        note = f"Companies House · Status: {status} · Type: {company_type} · No: {company_number}"
        nodes.append({"type": "org", "value": company_name, "source_url": source_url, "note": note})

        # Registered address
        address = company.get("registered_office_address", {})
        addr_parts = [
            address.get("address_line_1", ""),
            address.get("address_line_2", ""),
            address.get("locality", ""),
            address.get("postal_code", ""),
        ]
        addr_str = ", ".join(p for p in addr_parts if p)
        if addr_str:
            nodes.append({"type": "location", "value": addr_str, "source_url": source_url, "note": f"Registered address of {company_name}"})

        if not company_number:
            return {"nodes": nodes, "edges": []}

        # Officers
        try:
            async with httpx.AsyncClient(timeout=15, auth=(api_key, "")) as client:
                officers_resp = await client.get(
                    f"https://api.company-information.service.gov.uk/company/{company_number}/officers",
                )
            if officers_resp.is_success:
                for officer in officers_resp.json().get("items", [])[:5]:
                    name = officer.get("name", "").strip()
                    role = officer.get("officer_role", "")
                    resigned = officer.get("resigned_on")
                    if name and not resigned:
                        nodes.append({
                            "type": "person",
                            "value": name,
                            "source_url": source_url,
                            "note": f"{role.replace('-', ' ').title()} at {company_name}",
                        })
        except Exception:
            pass

        return {"nodes": nodes, "edges": []}
