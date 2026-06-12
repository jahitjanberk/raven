import hashlib
import json
import logging

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, field_validator
from slowapi import Limiter
from slowapi.util import get_remote_address
from sqlalchemy.orm import Session

from app.deps import get_db
from app.enrichments.registry import registry
from app.models import EvidenceCapture

limiter = Limiter(key_func=get_remote_address)

router = APIRouter()
logger = logging.getLogger(__name__)

_MAX_VALUE_LEN = 2048
_bearer_optional = HTTPBearer(auto_error=False)


class RunRequest(BaseModel):
    slug: str
    value: str
    api_key: str | None = None
    project_id: str | None = None
    node_id: str | None = None
    entity_type: str | None = None

    @field_validator("value")
    @classmethod
    def value_not_empty(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("value must not be empty")
        if len(v) > _MAX_VALUE_LEN:
            raise ValueError(f"value exceeds maximum length of {_MAX_VALUE_LEN}")
        return v

    @field_validator("slug")
    @classmethod
    def slug_safe(cls, v: str) -> str:
        if not v.replace("_", "").isalnum():
            raise ValueError("slug contains invalid characters")
        return v


async def _try_screenshot(value: str, entity_type: str) -> str | None:
    if entity_type not in {"url", "domain"}:
        return None
    url = value if value.startswith(("http://", "https://")) else f"https://{value}"
    try:
        import base64
        from playwright.async_api import async_playwright  # type: ignore[import]
        async with async_playwright() as p:
            browser = await p.chromium.launch(args=["--no-sandbox", "--disable-dev-shm-usage"])
            page = await browser.new_page(viewport={"width": 1280, "height": 800})
            await page.goto(url, wait_until="domcontentloaded", timeout=10000)
            data = await page.screenshot(full_page=False)
            await browser.close()
            return base64.b64encode(data).decode()
    except ImportError:
        return None
    except Exception:
        return None


@router.get("/transforms")
async def list_transforms() -> list[dict]:
    """Return metadata for every registered transform."""
    return [t.to_dict() for t in registry.get_all()]


@router.post("/transforms/run")
@limiter.limit("30/minute")
async def run_transform(
    request: Request,
    req: RunRequest,
    db: Session = Depends(get_db),
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer_optional),
) -> dict:
    """Execute a transform and return discovered nodes and edges."""
    try:
        result = await registry.run(req.slug, req.value, req.api_key)
    except ValueError as exc:
        raise HTTPException(status_code=404, detail=str(exc))
    except Exception as exc:
        logger.exception("Transform %s failed for value %r: %s", req.slug, req.value[:80], exc)
        raise HTTPException(status_code=500, detail="Transform failed — check server logs")

    # Save immutable evidence snapshot when project/node context is provided
    if req.project_id and req.node_id and not result.get("error"):
        try:
            transform_obj = registry.get(req.slug)
            transform_name = transform_obj.name if transform_obj else req.slug

            canonical = json.dumps(result, sort_keys=True, default=str)
            sha256 = hashlib.sha256(canonical.encode()).hexdigest()

            first_source_url: str | None = None
            if isinstance(result.get("nodes"), list) and result["nodes"]:
                first_source_url = result["nodes"][0].get("source_url")

            screenshot = await _try_screenshot(req.value, req.entity_type or "")

            db.add(EvidenceCapture(
                project_id=req.project_id,
                node_id=req.node_id,
                transform_slug=req.slug,
                transform_name=transform_name,
                entity_value=req.value,
                entity_type=req.entity_type or "",
                result_json=canonical,
                sha256=sha256,
                source_url=first_source_url,
                screenshot_b64=screenshot,
            ))
            db.commit()
        except Exception:
            logger.exception(
                "Evidence save failed for project %s node %s", req.project_id, req.node_id
            )

    return result
