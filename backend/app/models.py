import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def _new_id() -> str:
    return str(uuid.uuid4())


class Organisation(Base):
    __tablename__ = "organisations"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_new_id)
    name: Mapped[str] = mapped_column(String, nullable=False)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    tier: Mapped[str] = mapped_column(String, default="solo")  # solo, team, enterprise
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    members: Mapped[list["OrgMember"]] = relationship(
        back_populates="organisation", cascade="all, delete-orphan"
    )
    projects: Mapped[list["Project"]] = relationship(back_populates="organisation")


class OrgMember(Base):
    __tablename__ = "org_members"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_new_id)
    org_id: Mapped[str] = mapped_column(String, ForeignKey("organisations.id"), nullable=False)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    role: Mapped[str] = mapped_column(String, default="member")  # owner, admin, member
    joined_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    organisation: Mapped["Organisation"] = relationship(back_populates="members")
    user: Mapped["User"] = relationship(back_populates="memberships")


class Invite(Base):
    __tablename__ = "invites"

    token: Mapped[str] = mapped_column(String, primary_key=True)
    email: Mapped[str] = mapped_column(String, nullable=False, index=True)
    org_id: Mapped[str] = mapped_column(String, ForeignKey("organisations.id"), nullable=False)
    invited_by_id: Mapped[str | None] = mapped_column(String, ForeignKey("users.id"), nullable=True)
    role: Mapped[str] = mapped_column(String, default="member")
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    used_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    token: Mapped[str] = mapped_column(String, primary_key=True)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    used: Mapped[bool] = mapped_column(Boolean, default=False)


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_new_id)
    email: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)
    name: Mapped[str] = mapped_column(String, default="")
    initials: Mapped[str] = mapped_column(String, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    projects: Mapped[list["Project"]] = relationship(
        back_populates="owner", cascade="all, delete-orphan"
    )
    memberships: Mapped[list["OrgMember"]] = relationship(back_populates="user")


class Project(Base):
    __tablename__ = "projects"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_new_id)
    owner_id: Mapped[str] = mapped_column(String, ForeignKey("users.id"), nullable=False)
    org_id: Mapped[str | None] = mapped_column(
        String, ForeignKey("organisations.id"), nullable=True, index=True
    )
    name: Mapped[str] = mapped_column(String, nullable=False)
    case_ref: Mapped[str | None] = mapped_column(String, nullable=True)
    classification: Mapped[str] = mapped_column(String, default="OFFICIAL")
    investigation_type: Mapped[str] = mapped_column(String, default="Fraud / Financial crime")
    status: Mapped[str] = mapped_column(String, default="active")
    risk_level: Mapped[str] = mapped_column(String, default="UNKNOWN")
    node_count: Mapped[int] = mapped_column(Integer, default=0)
    edge_count: Mapped[int] = mapped_column(Integer, default=0)
    entity_counts: Mapped[dict] = mapped_column(JSON, default=dict)
    analyst_initials: Mapped[str] = mapped_column(String, default="")
    analyst_name: Mapped[str] = mapped_column(String, default="")
    last_action: Mapped[str | None] = mapped_column(String, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    owner: Mapped["User"] = relationship(back_populates="projects")
    organisation: Mapped["Organisation | None"] = relationship(back_populates="projects")
    graph: Mapped["Graph | None"] = relationship(
        back_populates="project", cascade="all, delete-orphan", uselist=False
    )


class Graph(Base):
    __tablename__ = "graphs"

    project_id: Mapped[str] = mapped_column(
        String, ForeignKey("projects.id"), primary_key=True
    )
    nodes: Mapped[list] = mapped_column(JSON, default=list)
    edges: Mapped[list] = mapped_column(JSON, default=list)
    case_notes: Mapped[str] = mapped_column(Text, default="")
    saved_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    project: Mapped["Project"] = relationship(back_populates="graph")


class EvidenceCapture(Base):
    """Immutable evidence snapshot linked to a transform run. No update or delete endpoint exists."""

    __tablename__ = "evidence_captures"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_new_id)
    project_id: Mapped[str] = mapped_column(
        String, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, index=True
    )
    node_id: Mapped[str] = mapped_column(String, nullable=False, index=True)
    transform_slug: Mapped[str] = mapped_column(String, nullable=False)
    transform_name: Mapped[str] = mapped_column(String, nullable=False)
    entity_value: Mapped[str] = mapped_column(String, nullable=False)
    entity_type: Mapped[str] = mapped_column(String, nullable=False)
    result_json: Mapped[str] = mapped_column(Text, nullable=False)
    sha256: Mapped[str] = mapped_column(String(64), nullable=False)
    source_url: Mapped[str | None] = mapped_column(String, nullable=True)
    screenshot_b64: Mapped[str | None] = mapped_column(Text, nullable=True)
    captured_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)


class AuditEvent(Base):
    """Append-only audit log. No update or delete endpoint exists."""

    __tablename__ = "audit_events"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=_new_id)
    project_id: Mapped[str | None] = mapped_column(
        String, ForeignKey("projects.id", ondelete="SET NULL"), nullable=True, index=True
    )
    user_id: Mapped[str] = mapped_column(
        String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    event_type: Mapped[str] = mapped_column(String, nullable=False, index=True)
    entity_type: Mapped[str | None] = mapped_column(String, nullable=True)
    entity_value: Mapped[str | None] = mapped_column(String, nullable=True)
    node_id: Mapped[str | None] = mapped_column(String, nullable=True)
    detail: Mapped[str | None] = mapped_column(Text, nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
