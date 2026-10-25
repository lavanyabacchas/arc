import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from ..database import get_db
from ..models import Incident, Asset, SecurityEvent, AuditEntry
from ..schemas import IncidentResponse, IncidentStatusUpdate, AddNoteRequest, AIAnalysisReport
from ..ai_engine import ai_engine

router = APIRouter(prefix="/api/incidents", tags=["incidents"])

@router.get("", response_model=List[IncidentResponse])
def get_incidents(
    status: Optional[str] = Query(None, description="Filter by status: open, investigating, contained, resolved, false_positive"),
    severity: Optional[str] = Query(None, description="Filter by severity: critical, high, medium, low"),
    db: Session = Depends(get_db)
):
    query = db.query(Incident).order_by(Incident.created_at.desc())

    if status and status.lower() != "all":
        query = query.filter(Incident.status == status.lower())

    if severity and severity.lower() != "all":
        query = query.filter(Incident.severity == severity.lower())

    incidents = query.all()
    assets = {a.id: a.name for a in db.query(Asset).all()}

    res = []
    for inc in incidents:
        res.append(IncidentResponse(
            id=inc.id,
            title=inc.title,
            description=inc.description,
            severity=inc.severity,
            status=inc.status,
            primary_asset_id=inc.primary_asset_id,
            primary_asset_name=assets.get(inc.primary_asset_id, inc.primary_asset_id),
            risk_score=inc.risk_score,
            assigned_analyst=inc.assigned_analyst,
            created_at=inc.created_at,
            updated_at=inc.updated_at,
            analysis=inc.analysis if inc.analysis else None,
            analyst_notes=inc.analyst_notes,
            timeline=inc.timeline,
            evidence=inc.evidence
        ))
    return res

@router.get("/{incident_id}", response_model=IncidentResponse)
def get_incident_detail(incident_id: str, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    asset = db.query(Asset).filter(Asset.id == inc.primary_asset_id).first()
    asset_name = asset.name if asset else inc.primary_asset_id

    return IncidentResponse(
        id=inc.id,
        title=inc.title,
        description=inc.description,
        severity=inc.severity,
        status=inc.status,
        primary_asset_id=inc.primary_asset_id,
        primary_asset_name=asset_name,
        risk_score=inc.risk_score,
        assigned_analyst=inc.assigned_analyst,
        created_at=inc.created_at,
        updated_at=inc.updated_at,
        analysis=inc.analysis if inc.analysis else None,
        analyst_notes=inc.analyst_notes,
        timeline=inc.timeline,
        evidence=inc.evidence
    )

@router.post("/{incident_id}/analyze")
def trigger_ai_analysis(incident_id: str, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    asset = db.query(Asset).filter(Asset.id == inc.primary_asset_id).first()
    
    # Retrieve relevant telemetry
    event = db.query(SecurityEvent).filter(SecurityEvent.incident_id == incident_id).first()
    telemetry = {
        "features": event.features if event else {},
        "destination": event.destination if event else "198.51.100.42:8443",
        "source": event.source if event else (asset.ip_address if asset else "10.10.30.50")
    }

    connected_names = []
    if asset:
        connected_objs = db.query(Asset).filter(Asset.id.in_(asset.connected_assets)).all()
        connected_names = [co.name for co in connected_objs]

    # Generate fresh AI analysis
    report = ai_engine.generate_incident_analysis(
        incident={"title": inc.title, "severity": inc.severity},
        asset={
            "name": asset.name if asset else "Critical Infrastructure Node",
            "sector": asset.sector if asset else "Energy",
            "criticality": asset.criticality if asset else "critical",
            "type": asset.type if asset else "SCADA Controller",
            "ip_address": asset.ip_address if asset else "10.10.0.1"
        },
        telemetry=telemetry,
        connected_assets=connected_names
    )

    inc.analysis_json = json.dumps(report)
    inc.updated_at = datetime.utcnow().isoformat()

    # Append timeline step if not already present
    tl = inc.timeline
    tl.append({
        "step": len(tl) + 1,
        "title": "ARC Intelligence Assessment Produced",
        "timestamp": datetime.utcnow().isoformat(),
        "status": "completed",
        "description": f"Structured analysis generated with confidence: {report.get('confidence_level', 'High')}."
    })
    inc.timeline_json = json.dumps(tl)

    # Append Audit Log
    db.add(AuditEntry(
        id=f"AUD-{int(datetime.utcnow().timestamp()*1000)%100000:05d}",
        timestamp=datetime.utcnow().isoformat(),
        actor="Alex Mercer (Lead SOC Analyst)",
        action="ai_analysis_generated",
        entity_type="incident",
        entity_id=inc.id,
        details=f"Triggered ARC Intelligence report for incident {inc.id} ({inc.title}).",
        outcome="success"
    ))

    db.commit()
    db.refresh(inc)

    return report

@router.patch("/{incident_id}/status")
def update_incident_status(incident_id: str, payload: IncidentStatusUpdate, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    old_status = inc.status
    new_status = payload.status.lower()
    inc.status = new_status
    inc.updated_at = datetime.utcnow().isoformat()

    # Also update asset status if resolving or containing
    asset = db.query(Asset).filter(Asset.id == inc.primary_asset_id).first()
    if asset:
        if new_status in ["resolved", "false_positive"]:
            # Check if other active threats remain for this asset
            other_active = db.query(Incident).filter(
                Incident.primary_asset_id == asset.id,
                Incident.id != inc.id,
                Incident.status.in_(["open", "investigating"])
            ).count()
            if other_active == 0:
                asset.status = "healthy"
                asset.risk_score = max(asset.risk_score - 35.0, 10.0)
        elif new_status == "contained":
            asset.status = "isolated"
        elif new_status == "investigating":
            if asset.status == "healthy":
                asset.status = "degraded"

    # Append timeline step
    tl = inc.timeline
    tl.append({
        "step": len(tl) + 1,
        "title": f"Incident Status Changed to {new_status.title()}",
        "timestamp": datetime.utcnow().isoformat(),
        "status": "completed" if new_status in ["resolved", "contained"] else "in_progress",
        "description": f"Analyst updated status from '{old_status}' to '{new_status}'."
    })
    inc.timeline_json = json.dumps(tl)

    # Add audit entry
    db.add(AuditEntry(
        id=f"AUD-{int(datetime.utcnow().timestamp()*1000)%100000:05d}",
        timestamp=datetime.utcnow().isoformat(),
        actor="Alex Mercer (Lead SOC Analyst)",
        action="status_changed",
        entity_type="incident",
        entity_id=inc.id,
        details=f"Status changed from '{old_status}' to '{new_status}' for incident {inc.id}.",
        outcome="info" if new_status != "false_positive" else "warning"
    ))

    db.commit()
    db.refresh(inc)

    return {"message": "Status updated successfully", "incident_id": inc.id, "new_status": inc.status}

@router.post("/{incident_id}/notes")
def add_analyst_note(incident_id: str, payload: AddNoteRequest, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(status_code=404, detail="Incident not found")

    notes = inc.analyst_notes
    new_note = {
        "author": payload.author or "Alex Mercer (Lead SOC Analyst)",
        "text": payload.text,
        "timestamp": datetime.utcnow().isoformat()
    }
    notes.append(new_note)
    inc.analyst_notes_json = json.dumps(notes)
    inc.updated_at = datetime.utcnow().isoformat()

    # Audit entry
    db.add(AuditEntry(
        id=f"AUD-{int(datetime.utcnow().timestamp()*1000)%100000:05d}",
        timestamp=datetime.utcnow().isoformat(),
        actor=new_note["author"],
        action="note_added",
        entity_type="incident",
        entity_id=inc.id,
        details=f"Analyst added note: \"{payload.text[:80]}...\"",
        outcome="info"
    ))

    db.commit()
    return {"message": "Note added", "notes": notes}
