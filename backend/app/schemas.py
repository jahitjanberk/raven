from datetime import datetime
from pydantic import BaseModel, field_validator


# ── Auth ──────────────────────────────────────────────────────────────────────

class LoginRequest(BaseModel):
    email: str
    password: str

    @field_validator("email")
    @classmethod
    def normalise_email(cls, v: str) -> str:
        return v.strip().lower()


class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str = ""
    initials: str = ""

    @field_validator("email")
    @classmethod
    def normalise_email(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("password")
    @classmethod
    def password_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    name: str
    initials: str


class RequestAccessBody(BaseModel):
    email: str
    name: str = ""
    organisation: str = ""

    @field_validator("email")
    @classmethod
    def normalise_email(cls, v: str) -> str:
        return v.strip().lower()


class InviteBody(BaseModel):
    email: str
    role: str = "member"

    @field_validator("email")
    @classmethod
    def normalise_email(cls, v: str) -> str:
        return v.strip().lower()

    @field_validator("role")
    @classmethod
    def valid_role(cls, v: str) -> str:
        if v not in ("owner", "admin", "member"):
            raise ValueError("role must be owner, admin, or member")
        return v


class ActivateBody(BaseModel):
    token: str
    password: str
    name: str = ""
    initials: str = ""

    @field_validator("password")
    @classmethod
    def password_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class ForgotPasswordBody(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def normalise_email(cls, v: str) -> str:
        return v.strip().lower()


class ResetPasswordBody(BaseModel):
    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def password_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters")
        return v


class InviteInfoResponse(BaseModel):
    email: str
    org_name: str


class MeResponse(BaseModel):
    user_id: str
    email: str
    name: str
    initials: str


# ── Projects ─────────────────────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    name: str
    case_ref: str | None = None
    classification: str = "OFFICIAL"
    investigation_type: str = "Fraud / Financial crime"
    status: str = "active"
    risk_level: str = "UNKNOWN"
    analyst_initials: str = ""
    analyst_name: str = ""


class ProjectUpdate(BaseModel):
    name: str | None = None
    case_ref: str | None = None
    classification: str | None = None
    investigation_type: str | None = None
    status: str | None = None
    risk_level: str | None = None
    node_count: int | None = None
    edge_count: int | None = None
    entity_counts: dict | None = None
    analyst_initials: str | None = None
    analyst_name: str | None = None
    last_action: str | None = None


class ProjectResponse(BaseModel):
    id: str
    name: str
    case_ref: str | None
    classification: str
    investigation_type: str
    status: str
    risk_level: str
    node_count: int
    edge_count: int
    entity_counts: dict
    analyst_initials: str
    analyst_name: str
    last_action: str | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


# ── Graphs ────────────────────────────────────────────────────────────────────

class GraphSave(BaseModel):
    nodes: list
    edges: list
    case_notes: str = ""


class GraphResponse(BaseModel):
    project_id: str
    nodes: list
    edges: list
    case_notes: str
    saved_at: datetime

    model_config = {"from_attributes": True}


# ── Audit ─────────────────────────────────────────────────────────────────────

class EvidenceCaptureResponse(BaseModel):
    id: str
    project_id: str
    node_id: str
    transform_slug: str
    transform_name: str
    entity_value: str
    entity_type: str
    result_json: str
    sha256: str
    source_url: str | None
    screenshot_b64: str | None
    captured_at: datetime

    model_config = {"from_attributes": True}


class AuditEventCreate(BaseModel):
    project_id: str | None = None
    event_type: str
    entity_type: str | None = None
    entity_value: str | None = None
    node_id: str | None = None
    detail: str | None = None


class AuditEventResponse(BaseModel):
    id: str
    project_id: str | None
    user_id: str
    event_type: str
    entity_type: str | None
    entity_value: str | None
    node_id: str | None
    detail: str | None
    timestamp: datetime

    model_config = {"from_attributes": True}
