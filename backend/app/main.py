import os
import uuid
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from sqlalchemy import text

from app.database import Base, engine, SessionLocal
from app.routers import enrichments as enrichments_router
from app.routers import auth as auth_router
from app.routers import projects as projects_router
from app.routers import graphs as graphs_router
from app.routers import status as status_router
from app.routers import audit as audit_router
from app.routers import evidence as evidence_router
from app.routers import contact as contact_router
from app.routers import org as org_router


def _migrate_db() -> None:
    """Add columns to existing tables that predate the schema change."""
    with engine.connect() as conn:
        for stmt in [
            "ALTER TABLE projects ADD COLUMN org_id TEXT REFERENCES organisations(id)",
        ]:
            try:
                conn.execute(text(stmt))
                conn.commit()
            except Exception:
                pass  # column already exists


def _seed_demo() -> None:
    """Ensure a demo org and demo account exist so the app is usable out of the box."""
    from app.models import OrgMember, Organisation, User
    from app.routers.auth import hash_password

    db = SessionLocal()
    try:
        org = db.query(Organisation).filter(Organisation.slug == "demo").first()
        if not org:
            org = Organisation(
                id=str(uuid.uuid4()),
                name="Demo Organisation",
                slug="demo",
                tier="team",
            )
            db.add(org)
            db.flush()

        user = db.query(User).filter(User.email == "demo@raven.app").first()
        if not user:
            user = User(
                id=str(uuid.uuid4()),
                email="demo@raven.app",
                hashed_password=hash_password("demo1234"),
                name="Demo Analyst",
                initials="DA",
            )
            db.add(user)
            db.flush()

        if not db.query(OrgMember).filter(OrgMember.user_id == user.id).first():
            db.add(OrgMember(
                id=str(uuid.uuid4()),
                org_id=org.id,
                user_id=user.id,
                role="owner",
            ))

        db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    _migrate_db()
    _seed_demo()
    yield


limiter = Limiter(key_func=get_remote_address)
app = FastAPI(title="Raven API", version="2.0.0", lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

_RAW_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173")
_ALLOWED_ORIGINS = [o.strip() for o in _RAW_ORIGINS.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(enrichments_router.router, prefix="/api")
app.include_router(auth_router.router,        prefix="/api")
app.include_router(projects_router.router,    prefix="/api")
app.include_router(graphs_router.router,      prefix="/api")
app.include_router(status_router.router,      prefix="/api")
app.include_router(audit_router.router,       prefix="/api")
app.include_router(evidence_router.router,    prefix="/api")
app.include_router(contact_router.router,     prefix="/api")
app.include_router(org_router.router,         prefix="/api")


@app.get("/health")
async def health() -> dict:
    return {"status": "ok", "version": "2.0.0"}
