from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models import OrgMember, User

router = APIRouter(prefix="/org", tags=["org"])


def _membership(user: User, db: Session) -> OrgMember:
    m = db.query(OrgMember).filter(OrgMember.user_id == user.id).first()
    if not m:
        raise HTTPException(status_code=404, detail="You are not a member of any organisation")
    return m


def _require_admin(user: User, db: Session) -> OrgMember:
    m = _membership(user, db)
    if m.role not in ("owner", "admin"):
        raise HTTPException(status_code=403, detail="Admin access required")
    return m


class MemberOut(BaseModel):
    user_id: str
    email: str
    name: str
    initials: str
    role: str

    model_config = {"from_attributes": True}


class UpdateRoleBody(BaseModel):
    role: str


@router.get("/members", response_model=list[MemberOut])
def list_members(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[MemberOut]:
    m = _membership(user, db)
    rows = (
        db.query(OrgMember, User)
        .join(User, User.id == OrgMember.user_id)
        .filter(OrgMember.org_id == m.org_id)
        .all()
    )
    return [
        MemberOut(
            user_id=u.id, email=u.email, name=u.name,
            initials=u.initials, role=om.role,
        )
        for om, u in rows
    ]


@router.patch("/members/{target_user_id}")
def update_member_role(
    target_user_id: str,
    body: UpdateRoleBody,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    admin_m = _require_admin(user, db)
    if body.role not in ("owner", "admin", "member"):
        raise HTTPException(status_code=422, detail="Invalid role")

    target = (
        db.query(OrgMember)
        .filter(OrgMember.user_id == target_user_id, OrgMember.org_id == admin_m.org_id)
        .first()
    )
    if not target:
        raise HTTPException(status_code=404, detail="Member not found")
    if target.user_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot change your own role")
    if target.role == "owner":
        raise HTTPException(status_code=403, detail="Cannot change the owner's role")

    target.role = body.role
    db.commit()
    return {"ok": True}


@router.delete("/members/{target_user_id}")
def remove_member(
    target_user_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> dict:
    admin_m = _require_admin(user, db)

    target = (
        db.query(OrgMember)
        .filter(OrgMember.user_id == target_user_id, OrgMember.org_id == admin_m.org_id)
        .first()
    )
    if not target:
        raise HTTPException(status_code=404, detail="Member not found")
    if target.user_id == user.id:
        raise HTTPException(status_code=400, detail="Cannot remove yourself")
    if target.role == "owner":
        raise HTTPException(status_code=403, detail="Cannot remove the organisation owner")

    db.delete(target)
    db.commit()
    return {"ok": True}
