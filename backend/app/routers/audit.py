from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import AuditEntry
from ..schemas import AuditEntryResponse

router = APIRouter(prefix="/api/audit-logs", tags=["audit"])

@router.get("", response_model=List[AuditEntryResponse])
def get_audit_logs(
    action: Optional[str] = Query(None, description="Filter by action"),
    actor: Optional[str] = Query(None, description="Filter by actor"),
    entity_type: Optional[str] = Query(None, description="Filter by entity type"),
    search: Optional[str] = Query(None, description="Search details or ID"),
    db: Session = Depends(get_db)
):
    query = db.query(AuditEntry).order_by(AuditEntry.timestamp.desc())

    if action and action.lower() != "all":
        query = query.filter(AuditEntry.action == action)

    if actor and actor.lower() != "all":
        query = query.filter(AuditEntry.actor.ilike(f"%{actor}%"))

    if entity_type and entity_type.lower() != "all":
        query = query.filter(AuditEntry.entity_type == entity_type)

    if search:
        s = f"%{search.lower()}%"
        query = query.filter((AuditEntry.details.ilike(s)) | (AuditEntry.entity_id.ilike(s)) | (AuditEntry.id.ilike(s)))

    entries = query.all()
    res = []
    for e in entries:
        res.append(AuditEntryResponse(
            id=e.id,
            timestamp=e.timestamp,
            actor=e.actor,
            action=e.action,
            entity_type=e.entity_type,
            entity_id=e.entity_id,
            details=e.details,
            outcome=e.outcome
        ))
    return res
