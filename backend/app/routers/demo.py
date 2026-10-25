import json
from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Asset, SecurityEvent, Incident, ResponseAction, AuditEntry
from ..detection import detection_engine
from ..ai_engine import ai_engine
from ..seed_data import seed_database

router = APIRouter(prefix="/api/demo", tags=["demo"])

@router.post("/simulate-event")
def simulate_suspicious_activity(db: Session = Depends(get_db)):
    """
    Step 1 & 2 of the Live Demonstration Scenario:
    Simulates high-volume anomalous outbound egress from the Data Center (AST-003) to an unauthorized external IP.
    The detection engine triggers, raising a security alert and creating an active incident.
    """
    now = datetime.utcnow()
    now_iso = now.isoformat()

    # Target Asset: AST-003 Data Center
    asset = db.query(Asset).filter(Asset.id == "AST-003").first()
    if not asset:
        return {"error": "Target asset AST-003 not found"}

    # Telemetry features exceeding baseline
    features = {
        "bytes_transferred_kb": 48600.0, # ~48.6 MB egress spike
        "connection_freq": 165.0, # 165 req/min
        "failed_auth": 1,
        "dest_port_variance": 4.8
    }

    # Evaluate with detection engine
    is_threat, rule_name, anomaly_score, detection_details = detection_engine.evaluate_telemetry(features, asset.type)

    # Calculate transparent risk score
    risk_score, risk_breakdown = detection_engine.calculate_risk_score(
        severity="high",
        detection_confidence=anomaly_score,
        asset_criticality=asset.criticality,
        related_events_count=2
    )

    # 1. Update Asset Status to threat_detected
    asset.status = "threat_detected"
    asset.risk_score = risk_score
    asset.last_seen = now_iso

    # 2. Create Security Event
    event_id = f"EVT-{int(now.timestamp()*1000)%100000:05d}"
    incident_id = f"INC-2026-{int(now.timestamp()*10)%10000:04d}"

    event = SecurityEvent(
        id=event_id,
        timestamp=now_iso,
        asset_id=asset.id,
        event_type="Unusual High-Volume Outbound Exfiltration Anomaly",
        severity="high",
        source=f"{asset.ip_address}:49201",
        destination="198.51.100.42:8443", # External unverified endpoint
        features_json=json.dumps(features),
        detection_status="flagged",
        rule_triggered=rule_name,
        incident_id=incident_id
    )
    db.add(event)

    # 3. Generate Structured AI Intelligence via ARC Intelligence Engine
    connected_objs = db.query(Asset).filter(Asset.id.in_(asset.connected_assets)).all()
    connected_names = [co.name for co in connected_objs]

    ai_analysis = ai_engine.generate_incident_analysis(
        incident={"title": event.event_type, "severity": "high"},
        asset={
            "name": asset.name,
            "sector": asset.sector,
            "criticality": asset.criticality,
            "type": asset.type,
            "ip_address": asset.ip_address
        },
        telemetry={
            "features": features,
            "destination": event.destination,
            "source": event.source
        },
        connected_assets=connected_names
    )

    # 4. Create Incident
    incident = Incident(
        id=incident_id,
        title=f"Critical Egress Anomaly Detected: {asset.name}",
        description=(
            f"Automated detection flagged an abnormal outbound connection spike ({features['bytes_transferred_kb']:,.1f} KB at {features['connection_freq']} req/min) "
            f"from {asset.name} ({asset.ip_address}) to untrusted destination {event.destination}."
        ),
        severity="high",
        status="open",
        primary_asset_id=asset.id,
        risk_score=risk_score,
        assigned_analyst="Alex Mercer (Lead SOC Analyst)",
        created_at=now_iso,
        updated_at=now_iso,
        analysis_json=json.dumps(ai_analysis),
        analyst_notes_json=json.dumps([
            {
                "author": "Detection Engine",
                "text": f"Anomaly score {anomaly_score:.2f} triggered rule '{rule_name}'. Initial risk score evaluated at {risk_score}/100.",
                "timestamp": now_iso
            }
        ]),
        timeline_json=json.dumps([
            {
                "step": 1,
                "title": "Abnormal Outbound Connection Observed",
                "timestamp": now_iso,
                "status": "alert",
                "description": f"Telemetry burst from {asset.name} exceeded baseline threshold."
            },
            {
                "step": 2,
                "title": "Detection Engine Flags Statistical Anomaly",
                "timestamp": now_iso,
                "status": "completed",
                "description": f"Triggered {rule_name}. Isolation Forest anomaly score: {anomaly_score:.2f}."
            },
            {
                "step": 3,
                "title": "Incident Created & Prioritized",
                "timestamp": now_iso,
                "status": "alert",
                "description": f"Incident {incident_id} opened. Assigned to Lead SOC Analyst."
            }
        ]),
        evidence_json=json.dumps({
            "source": event.source,
            "destination": event.destination,
            "bytes_transferred_kb": features["bytes_transferred_kb"],
            "connection_freq": features["connection_freq"],
            "baseline_threshold_kb": 10000.0,
            "anomaly_score": anomaly_score,
            "risk_factors": risk_breakdown
        })
    )
    db.add(incident)

    # 5. Automatically propose a containment response action
    response_action = ResponseAction(
        id=f"RSP-{int(now.timestamp()*1000)%100000:05d}",
        incident_id=incident_id,
        action_type="isolate_asset",
        title=f"Simulate Network Perimeter Isolation on {asset.name} (Port 8443)",
        rationale="Halts potential unauthorized data exfiltration over encrypted tunnel while preserving internal SCADA telemetry.",
        expected_effect="Blocks external egress to 198.51.100.42 without severing local power grid and water treatment monitoring links.",
        operational_impact="Moderate — External cloud synchronization will pause. Internal critical infrastructure operations remain active.",
        approval_status="proposed",
        execution_status="pending",
        simulated_execution_details="",
        created_at=now_iso,
        requires_approval=True
    )
    db.add(response_action)

    # 6. Audit Trail Entry
    audit_entry = AuditEntry(
        id=f"AUD-{int(now.timestamp()*1000)%100000:05d}",
        timestamp=now_iso,
        actor="Simulation Controller (Demo)",
        action="incident_created",
        entity_type="incident",
        entity_id=incident_id,
        details=f"Simulated attack initiated on {asset.name}. Threat detected, incident {incident_id} opened.",
        outcome="warning"
    )
    db.add(audit_entry)

    db.commit()

    return {
        "success": True,
        "message": "Suspicious outbound activity successfully simulated",
        "event_id": event_id,
        "incident_id": incident_id,
        "asset_id": asset.id,
        "asset_name": asset.name,
        "rule_triggered": rule_name,
        "anomaly_score": anomaly_score,
        "risk_score": risk_score
    }

@router.post("/reset")
def reset_demo(db: Session = Depends(get_db)):
    """
    Step 7: Restores the application to pristine initial demonstration state.
    """
    seed_database(db, force_reset=True)
    return {"success": True, "message": "Demo environment reset to pristine baseline"}
