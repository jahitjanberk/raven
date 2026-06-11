from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.deps import get_current_user, get_db
from app.models import AuditEvent, EvidenceCapture, Graph, Project, User
from app.pdf_report import generate_report
from app.schemas import GraphResponse, GraphSave

router = APIRouter(prefix="/graphs", tags=["graphs"])


def _own_project_or_404(project_id: str, user: User, db: Session) -> Project:
    project = db.query(Project).filter(Project.id == project_id).first()
    if project is None:
        raise HTTPException(status_code=404, detail="Project not found")
    if project.owner_id != user.id:
        raise HTTPException(status_code=403, detail="Forbidden")
    return project


@router.get("/{project_id}", response_model=GraphResponse)
def load_graph(
    project_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Graph:
    project = _own_project_or_404(project_id, user, db)
    if project.graph is None:
        raise HTTPException(status_code=404, detail="No graph saved for this project")
    return project.graph


@router.post("/{project_id}/save", response_model=GraphResponse)
def save_graph(
    project_id: str,
    body: GraphSave,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Graph:
    project = _own_project_or_404(project_id, user, db)

    # Recount entity types from the node list
    entity_counts: dict[str, int] = {}
    for node in body.nodes:
        t = node.get("type", "")
        if t:
            entity_counts[t] = entity_counts.get(t, 0) + 1

    project.node_count = len(body.nodes)
    project.edge_count = len(body.edges)
    project.entity_counts = entity_counts
    project.updated_at = datetime.utcnow()

    graph = project.graph
    if graph is None:
        graph = Graph(project_id=project_id)
        db.add(graph)

    graph.nodes = body.nodes
    graph.edges = body.edges
    graph.case_notes = body.case_notes
    graph.saved_at = datetime.utcnow()

    db.commit()
    db.refresh(graph)
    return graph


@router.get("/{project_id}/pdf")
def export_pdf(
    project_id: str,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> Response:
    project = _own_project_or_404(project_id, user, db)
    if project.graph is None:
        raise HTTPException(status_code=404, detail="No graph saved yet — save the graph before exporting")

    graph = project.graph
    saved_at = graph.saved_at.isoformat() if graph.saved_at else ""

    evidence_rows = (
        db.query(EvidenceCapture)
        .filter(EvidenceCapture.project_id == project_id)
        .order_by(EvidenceCapture.captured_at)
        .all()
    )
    evidence = [
        {
            "entity_value": e.entity_value,
            "transform_name": e.transform_name,
            "captured_at": e.captured_at.isoformat() if e.captured_at else None,
            "sha256": e.sha256,
        }
        for e in evidence_rows
    ]

    pdf_bytes = generate_report(
        project_name=project.name,
        case_ref=project.case_ref or "",
        classification=project.classification,
        analyst_name=project.analyst_name or user.name,
        nodes=graph.nodes,
        edges=graph.edges,
        case_notes=graph.case_notes,
        saved_at=saved_at,
        evidence=evidence,
    )

    # Log the export event
    db.add(AuditEvent(
        project_id=project_id,
        user_id=user.id,
        event_type="export:pdf",
        detail=f"{len(graph.nodes)} nodes, {len(graph.edges)} edges",
    ))
    db.commit()

    slug = project.name.replace(" ", "-").lower()
    filename = f"raven-report-{slug}.pdf"
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
