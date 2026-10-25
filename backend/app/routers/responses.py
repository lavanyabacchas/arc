from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import ResponseAction, Incident, Asset, AuditEntry
from ..schemas import ResponseActionResponse, ApproveResponseRequest

router = APIRouter(prefix="/api/responses", tags=["responses"])

@router.get("", response_model=List[ResponseActionResponse])
def get_responses(db: Session = Depends(get_db)):
    actions = db.query(ResponseAction).order_by(ResponseAction.created_at.desc()).all()
    res = []
    for a in actions:
        res.append(ResponseActionResponse(
            id=a.id,
            incident_id=a.incident_id,
            action_type=a.action_type,
            title=a.title,
            rationale=a.rationale,
            expected_effect=a.expected_effect,
            operational_impact=a.operational_impact,
            approval_status=a.approval_status,
            execution_status=a.execution_status,
            simulated_execution_details=a.simulated_execution_details,
            created_at=a.created_at,
            executed_at=a.executed_at,
            requires_approval=a.requires_approval
        ))
    return res

@router.post("/{response_id}/approve")
def approve_response(response_id: str, payload: ApproveResponseRequest, db: Session = Depends(get_db)):
    action = db.query(ResponseAction).filter(ResponseAction.id == response_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Response action not found")

    action.approval_status = "approved"

    # Add audit entry
    db.add(AuditEntry(
        id=f"AUD-{int(datetime.utcnow().timestamp()*1000)%100000:05d}",
        timestamp=datetime.utcnow().isoformat(),
        actor=payload.approver or "Alex Mercer (Lead SOC Analyst)",
        action="response_approved",
        entity_type="response",
        entity_id=action.id,
        details=f"Analyst approved action {action.id} ({action.title}) for incident {action.incident_id}.",
        outcome="success"
    ))

    db.commit()
    db.refresh(action)
    return {"message": "Response action approved", "action_id": action.id, "approval_status": action.approval_status}

@router.post("/{response_id}/execute")
def execute_simulated_response(response_id: str, db: Session = Depends(get_db)):
    """
    Executes a purely simulated response action within the local environment.
    No actual infrastructure or external networks are affected.
    """
    action = db.query(ResponseAction).filter(ResponseAction.id == response_id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Response action not found")

    if action.approval_status != "approved":
        raise HTTPException(status_code=400, detail="Action must be approved by an authorized analyst before simulated execution.")

    now_iso = datetime.utcnow().isoformat()
    action.execution_status = "completed"
    action.executed_at = now_iso

    # Find associated incident
    inc = db.query(Incident).filter(Incident.id == action.incident_id).first()
    asset = None
    if inc:
        asset = db.query(Asset).filter(Asset.id == inc.primary_asset_id).first()
        inc.status = "contained"
        inc.updated_at = now_iso

        # Append timeline entry to incident
        tl = inc.timeline
        tl.append({
            "step": len(tl) + 1,
            "title": f"Simulated Response Executed ({action.title})",
            "timestamp": now_iso,
            "status": "completed",
            "description": f"Simulated action applied. Egress halted. Incident status set to 'contained'."
        })
        import json
        inc.timeline_json = json.dumps(tl)

    # Update asset state to isolated/contained
    if asset:
        if action.action_type in ["isolate_asset", "block_ip", "rate_limit"]:
            asset.status = "isolated"
            asset.risk_score = max(asset.risk_score - 40.0, 15.0)

    action.simulated_execution_details = (
        f"[SIMULATED CONTAINMENT] Applied iptables drop-rule on simulated gateway. "
        f"Synthetic egress traffic on port 8443 dropped. "
        f"Simulated asset {asset.name if asset else 'target'} isolated at {now_iso} UTC. "
        f"Notice: Pure simulation - no live hardware modified."
    )

    # Append Audit Entry
    db.add(AuditEntry(
        id=f"AUD-{int(datetime.utcnow().timestamp()*1000)%100000:05d}",
        timestamp=now_iso,
        actor="ARC Response Orchestrator (Simulation)",
        action="simulated_response_executed",
        entity_type="response",
        entity_id=action.id,
        details=f"Executed simulated containment: {action.title}. Target {asset.name if asset else action.incident_id} safely isolated.",
        outcome="success"
    ))

    db.commit()
    db.refresh(action)

    return {
        "message": "Simulated response successfully executed",
        "action_id": action.id,
        "execution_status": action.execution_status,
        "incident_status": inc.status if inc else "unknown",
        "asset_status": asset.status if asset else "unknown",
        "execution_details": action.simulated_execution_details
    }
