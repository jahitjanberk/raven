from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models import EvidenceCapture, Project, User
from app.schemas import EvidenceCaptureResponse

router = APIRouter(prefix="/evidence", tags=["evidence"])


def _own_project_or_404(project_id: str, user: User, db: Session) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return project


@router.get("/{project_id}", response_model=list[EvidenceCaptureResponse])
def list_project_evidence(
    project_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[EvidenceCapture]:
    _own_project_or_404(project_id, user, db)
    return (
        db.query(EvidenceCapture)
        .filter(EvidenceCapture.project_id == project_id)
        .order_by(EvidenceCapture.captured_at)
        .all()
    )


@router.get("/{project_id}/{node_id}", response_model=list[EvidenceCaptureResponse])
def list_node_evidence(
    project_id: str,
    node_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[EvidenceCapture]:
    _own_project_or_404(project_id, user, db)
    return (
        db.query(EvidenceCapture)
        .filter(
            EvidenceCapture.project_id == project_id,
            EvidenceCapture.node_id == node_id,
        )
        .order_by(EvidenceCapture.captured_at)
        .all()
    )
