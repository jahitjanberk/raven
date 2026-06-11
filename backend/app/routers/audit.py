"""
Append-only audit trail.

POST /api/audit        — log an event (authenticated)
GET  /api/audit/{pid}  — fetch events for a project (authenticated, owner only)

No DELETE or UPDATE endpoints exist by design.
"""
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models import AuditEvent, User
from app.schemas import AuditEventCreate, AuditEventResponse

router = APIRouter(prefix="/audit", tags=["audit"])


@router.post("", response_model=AuditEventResponse, status_code=201)
def log_event(
    body: AuditEventCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> AuditEvent:
    event = AuditEvent(
        project_id=body.project_id,
        user_id=user.id,
        event_type=body.event_type,
        entity_type=body.entity_type,
        entity_value=body.entity_value,
        node_id=body.node_id,
        detail=body.detail,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.get("/{project_id}", response_model=list[AuditEventResponse])
def get_events(
    project_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[AuditEvent]:
    return (
        db.query(AuditEvent)
        .filter(
            AuditEvent.project_id == project_id,
            AuditEvent.user_id == user.id,
        )
        .order_by(AuditEvent.timestamp.desc())
        .limit(500)
        .all()
    )
