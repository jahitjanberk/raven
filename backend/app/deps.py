import os

from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.models import OrgMember, Organisation, User

SECRET_KEY = os.getenv("RAVEN_SECRET_KEY", "dev-secret-change-in-production-please")
ALGORITHM = "HS256"

# Tier hierarchy — higher index = more access
_TIER_RANK = {"solo": 0, "team": 1, "enterprise": 2}

_bearer = HTTPBearer()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str | None = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def get_org_tier(user: User, db: Session) -> str:
    """Return the tier of the org this user belongs to, defaulting to 'solo'."""
    membership = db.query(OrgMember).filter(OrgMember.user_id == user.id).first()
    if not membership:
        return "solo"
    org = db.query(Organisation).filter(Organisation.id == membership.org_id).first()
    return org.tier if org else "solo"


def tier_allows(org_tier: str, required_tier: str) -> bool:
    """Return True if org_tier meets or exceeds required_tier."""
    return _TIER_RANK.get(org_tier, 0) >= _TIER_RANK.get(required_tier, 0)
