import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models import OrgMember, Project, User
from app.schemas import ProjectCreate, ProjectResponse, ProjectUpdate

router = APIRouter(prefix="/projects", tags=["projects"])


def _accessible_or_404(project_id: str, user: User, db: Session) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.owner_id == user.id:
        return project
    if project.org_id:
        member = db.query(OrgMember).filter(
            OrgMember.user_id == user.id,
            OrgMember.org_id == project.org_id,
        ).first()
        if member:
            return project
    raise HTTPException(status_code=403, detail="Forbidden")


def _user_org_id(user: User, db: Session) -> str | None:
    member = db.query(OrgMember).filter(OrgMember.user_id == user.id).first()
    return member.org_id if member else None


@router.get("", response_model=list[ProjectResponse])
def list_projects(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[Project]:
    org_id = _user_org_id(user, db)
    if org_id:
        return (
            db.query(Project)
            .filter(Project.org_id == org_id)
            .order_by(Project.updated_at.desc())
            .all()
        )
    return (
        db.query(Project)
        .filter(Project.owner_id == user.id)
        .order_by(Project.updated_at.desc())
        .all()
    )


@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    body: ProjectCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Project:
    now = datetime.utcnow()
    project = Project(
        id=str(uuid.uuid4()),
        owner_id=user.id,
        org_id=_user_org_id(user, db),
        created_at=now,
        updated_at=now,
        **body.model_dump(),
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: str,
    body: ProjectUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Project:
    project = _accessible_or_404(project_id, user, db)
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(project, field, value)
    project.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(project)
    return project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> None:
    project = _accessible_or_404(project_id, user, db)
    db.delete(project)
    db.commit()
