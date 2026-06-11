import os
import secrets
import uuid
from datetime import datetime, timedelta

import bcrypt
from fastapi import APIRouter, Depends, HTTPException
from jose import jwt
from sqlalchemy.orm import Session

from app.deps import ALGORITHM, SECRET_KEY, get_current_user, get_db
from app.email import (
    send_invite_email,
    send_password_reset_email,
    send_request_access_email,
    send_welcome_email,
)
from app.models import AuditEvent, Invite, OrgMember, Organisation, PasswordResetToken, User
from app.schemas import (
    ActivateBody,
    ForgotPasswordBody,
    InviteBody,
    InviteInfoResponse,
    LoginRequest,
    MeResponse,
    RegisterRequest,
    RequestAccessBody,
    ResetPasswordBody,
    TokenResponse,
)

router = APIRouter(prefix="/auth", tags=["auth"])

TOKEN_EXPIRE_HOURS = 24
INVITE_EXPIRE_DAYS = 7
RESET_EXPIRE_HOURS = 2

_APP_URL = os.getenv("APP_URL", "http://localhost:5173")


def _create_token(user_id: str) -> str:
    expire = datetime.utcnow() + timedelta(hours=TOKEN_EXPIRE_HOURS)
    return jwt.encode({"sub": user_id, "exp": expire}, SECRET_KEY, algorithm=ALGORITHM)


def hash_password(plain: str) -> str:
    return bcrypt.hashpw(plain.encode(), bcrypt.gensalt()).decode()


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode(), hashed.encode())


# ── Login ─────────────────────────────────────────────────────────────────────

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.query(User).filter(User.email == req.email).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    db.add(AuditEvent(user_id=user.id, event_type="login", detail=req.email))
    db.commit()
    return TokenResponse(
        access_token=_create_token(user.id),
        user_id=user.id,
        name=user.name,
        initials=user.initials,
    )


# ── Bootstrap register (only when zero users exist) ───────────────────────────

@router.post("/register", response_model=TokenResponse, status_code=201)
def register(req: RegisterRequest, db: Session = Depends(get_db)) -> TokenResponse:
    if db.query(User).count() > 0:
        raise HTTPException(
            status_code=403,
            detail="Registration is invite-only. Use an invite link or request access.",
        )
    if db.query(User).filter(User.email == req.email).first():
        raise HTTPException(status_code=409, detail="Email already registered")

    name = req.name or req.email.split("@")[0].replace(".", " ").title()
    initials = req.initials or "".join(w[0].upper() for w in name.split()[:2])
    user = User(
        id=str(uuid.uuid4()),
        email=req.email,
        hashed_password=hash_password(req.password),
        name=name,
        initials=initials,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenResponse(
        access_token=_create_token(user.id),
        user_id=user.id,
        name=user.name,
        initials=user.initials,
    )


# ── Request access (public — self-serve invite) ───────────────────────────────

@router.post("/request-access", status_code=202)
def request_access(req: RequestAccessBody, db: Session = Depends(get_db)) -> dict:
    org = db.query(Organisation).first()
    if not org:
        return {"message": "Request received. We will be in touch soon."}

    token = secrets.token_urlsafe(32)
    invite = Invite(
        token=token,
        email=req.email,
        org_id=org.id,
        invited_by_id=None,
        role="member",
        expires_at=datetime.utcnow() + timedelta(days=INVITE_EXPIRE_DAYS),
    )
    db.add(invite)
    db.commit()

    send_request_access_email(req.email, f"{_APP_URL}/activate?token={token}")
    return {"message": "Request received. Check your email for an access link."}


# ── Admin invite ──────────────────────────────────────────────────────────────

@router.post("/invite", status_code=201)
def send_invite(
    req: InviteBody,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> dict:
    membership = (
        db.query(OrgMember)
        .filter(
            OrgMember.user_id == user.id,
            OrgMember.role.in_(["owner", "admin"]),
        )
        .first()
    )
    if not membership:
        raise HTTPException(status_code=403, detail="Must be an org admin to send invites")

    existing = db.query(User).filter(User.email == req.email).first()
    if existing:
        already_member = db.query(OrgMember).filter(
            OrgMember.user_id == existing.id,
            OrgMember.org_id == membership.org_id,
        ).first()
        if already_member:
            raise HTTPException(status_code=409, detail="User is already a member of this organisation")

    org = db.query(Organisation).filter(Organisation.id == membership.org_id).first()

    token = secrets.token_urlsafe(32)
    invite = Invite(
        token=token,
        email=req.email,
        org_id=membership.org_id,
        invited_by_id=user.id,
        role=req.role,
        expires_at=datetime.utcnow() + timedelta(days=INVITE_EXPIRE_DAYS),
    )
    db.add(invite)
    db.commit()

    org_name = org.name if org else "Raven"
    send_invite_email(req.email, user.name, org_name, f"{_APP_URL}/activate?token={token}")
    return {"message": f"Invite sent to {req.email}"}


# ── Invite info (used by activation page) ────────────────────────────────────

@router.get("/invite-info", response_model=InviteInfoResponse)
def invite_info(token: str, db: Session = Depends(get_db)) -> InviteInfoResponse:
    invite = db.query(Invite).filter(Invite.token == token).first()
    if not invite or invite.used_at or invite.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired invite link")
    org = db.query(Organisation).filter(Organisation.id == invite.org_id).first()
    return InviteInfoResponse(
        email=invite.email,
        org_name=org.name if org else "Raven",
    )


# ── Activate account via invite token ────────────────────────────────────────

@router.post("/activate", response_model=TokenResponse, status_code=201)
def activate(req: ActivateBody, db: Session = Depends(get_db)) -> TokenResponse:
    invite = db.query(Invite).filter(Invite.token == req.token).first()
    if not invite:
        raise HTTPException(status_code=400, detail="Invalid invite link")
    if invite.used_at:
        raise HTTPException(status_code=400, detail="This invite link has already been used")
    if invite.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="This invite link has expired")

    if db.query(User).filter(User.email == invite.email).first():
        raise HTTPException(status_code=409, detail="An account with this email already exists")

    name = req.name or invite.email.split("@")[0].replace(".", " ").title()
    initials = req.initials or "".join(w[0].upper() for w in name.split()[:2])

    user = User(
        id=str(uuid.uuid4()),
        email=invite.email,
        hashed_password=hash_password(req.password),
        name=name,
        initials=initials,
    )
    db.add(user)
    db.flush()

    db.add(OrgMember(
        id=str(uuid.uuid4()),
        org_id=invite.org_id,
        user_id=user.id,
        role=invite.role,
    ))

    invite.used_at = datetime.utcnow()
    db.commit()
    db.refresh(user)

    org = db.query(Organisation).filter(Organisation.id == invite.org_id).first()
    org_name = org.name if org else "Raven"
    send_welcome_email(user.email, user.name, org_name)

    return TokenResponse(
        access_token=_create_token(user.id),
        user_id=user.id,
        name=user.name,
        initials=user.initials,
    )


# ── Forgot password ───────────────────────────────────────────────────────────

@router.post("/forgot-password", status_code=202)
def forgot_password(req: ForgotPasswordBody, db: Session = Depends(get_db)) -> dict:
    user = db.query(User).filter(User.email == req.email).first()
    if user:
        token = secrets.token_urlsafe(32)
        db.add(PasswordResetToken(
            token=token,
            user_id=user.id,
            expires_at=datetime.utcnow() + timedelta(hours=RESET_EXPIRE_HOURS),
        ))
        db.commit()

        send_password_reset_email(req.email, f"{_APP_URL}/reset-password?token={token}")

    # Always the same response to avoid email enumeration
    return {"message": "If that email is registered, a reset link has been sent."}


# ── Reset password ────────────────────────────────────────────────────────────

@router.post("/reset-password")
def reset_password(req: ResetPasswordBody, db: Session = Depends(get_db)) -> dict:
    reset = db.query(PasswordResetToken).filter(PasswordResetToken.token == req.token).first()
    if not reset or reset.used or reset.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")

    user = db.query(User).filter(User.id == reset.user_id).first()
    if not user:
        raise HTTPException(status_code=400, detail="User not found")

    user.hashed_password = hash_password(req.new_password)
    reset.used = True
    db.commit()

    return {"message": "Password updated. You can now sign in."}


# ── Validate current session ──────────────────────────────────────────────────

@router.get("/me", response_model=MeResponse)
def get_me(user: User = Depends(get_current_user)) -> MeResponse:
    return MeResponse(user_id=user.id, email=user.email, name=user.name, initials=user.initials)
