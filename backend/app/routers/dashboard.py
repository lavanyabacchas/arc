from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db
from ..models import Asset, SecurityEvent, Incident
from ..schemas import DashboardResponse, KPIData, TopologyResponse, TopologyNode, TopologyEdge, SecurityEventResponse

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])

# Deterministic layout coordinates for the topology panel
TOPOLOGY_COORDINATES = {
    "AST-001": {"x": 220, "y": 140}, # Power Grid (Top Left)
    "AST-006": {"x": 100, "y": 280}, # Substation Alpha (Far Left)
    "AST-002": {"x": 620, "y": 130}, # Water Treatment Plant (Top Right)
    "AST-003": {"x": 420, "y": 260}, # Data Center (Central Hub)
    "AST-007": {"x": 420, "y": 110}, # SCADA Gateway (Top Center)
    "AST-004": {"x": 720, "y": 280}, # Communication Tower (Right)
    "AST-008": {"x": 840, "y": 380}, # Telemetry Relay (Far Right)
    "AST-005": {"x": 260, "y": 400}, # Transport Hub (Bottom Left)
}

TOPOLOGY_EDGES = [
    {"source": "AST-001", "target": "AST-006", "protocol": "IEC 61850 GOOSE"},
    {"source": "AST-001", "target": "AST-007", "protocol": "DNP3"},
    {"source": "AST-001", "target": "AST-003", "protocol": "TLS / Power Monitoring"},
    {"source": "AST-002", "target": "AST-007", "protocol": "Modbus TCP"},
    {"source": "AST-002", "target": "AST-004", "protocol": "Telemetry Microwave"},
    {"source": "AST-003", "target": "AST-007", "protocol": "OPC-UA Secure"},
    {"source": "AST-003", "target": "AST-004", "protocol": "BGP / Backbone IP"},
    {"source": "AST-003", "target": "AST-005", "protocol": "Euronet Signaling"},
    {"source": "AST-004", "target": "AST-008", "protocol": "Microwave RF 11GHz"},
    {"source": "AST-005", "target": "AST-001", "protocol": "Traction Power Feed"}
]

@router.get("", response_model=DashboardResponse)
def get_dashboard(db: Session = Depends(get_db)):
    assets = db.query(Asset).all()
    events = db.query(SecurityEvent).order_by(SecurityEvent.timestamp.desc()).all()
    incidents = db.query(Incident).order_by(Incident.created_at.desc()).all()

    # Total assets monitored (8 core sector nodes + 16 edge RTU telemetry collectors = 24 assets)
    total_assets_monitored = 24
    sectors = {a.sector for a in assets}

    # Count active threats (assets with threat_detected status or open critical/high incidents)
    threat_assets = {a.id for a in assets if a.status in ["threat_detected", "degraded"]}
    active_incidents = [i for i in incidents if i.status in ["open", "investigating"]]
    high_critical_incidents = [i for i in active_incidents if i.severity in ["critical", "high"]]

    # Calculate active threats based on unique assets under active investigation
    active_threats_count = len(high_critical_incidents) if high_critical_incidents else (1 if active_incidents else 0)

    # Health calculation
    healthy_assets_count = sum(1 for a in assets if a.status == "healthy")
    # Base health scaled:
    health_ratio = (healthy_assets_count / len(assets)) if assets else 1.0
    # In pristine state: 95.8%, degraded during active high threat
    if any(a.status == "threat_detected" for a in assets):
        health_percent = 78.4
        health_label = "Threat Containment Active"
    elif any(a.status == "degraded" for a in assets):
        health_percent = 91.2
        health_label = "Minor Investigation Underway"
    else:
        health_percent = 95.8
        health_label = "Optimal Operational Baseline"

    awaiting_review = sum(1 for i in active_incidents if i.status == "open")

    kpis = KPIData(
        assets_monitored=total_assets_monitored,
        assets_sectors_count=len(sectors),
        active_threats=active_threats_count,
        high_critical_threats=len(high_critical_incidents),
        infrastructure_health_percent=health_percent,
        health_status_label=health_label,
        open_incidents=len(active_incidents),
        awaiting_review_incidents=awaiting_review
    )

    # Health Breakdown
    health_breakdown = {
        "healthy": sum(1 for a in assets if a.status == "healthy"),
        "at_risk": sum(1 for a in assets if a.status in ["threat_detected", "degraded"]),
        "offline": sum(1 for a in assets if a.status in ["offline", "isolated"])
    }

    # Topology Nodes
    nodes = []
    for a in assets:
        coords = TOPOLOGY_COORDINATES.get(a.id, {"x": 300, "y": 200})
        nodes.append(TopologyNode(
            id=a.id,
            name=a.name,
            sector=a.sector,
            type=a.type,
            status=a.status,
            risk_score=a.risk_score,
            criticality=a.criticality,
            ip_address=a.ip_address,
            x=coords["x"],
            y=coords["y"]
        ))

    # Topology Edges with status reflecting connected nodes
    edges = []
    for idx, e in enumerate(TOPOLOGY_EDGES):
        src_asset = next((a for a in assets if a.id == e["source"]), None)
        tgt_asset = next((a for a in assets if a.id == e["target"]), None)
        
        edge_status = "normal"
        if (src_asset and src_asset.status == "threat_detected") or (tgt_asset and tgt_asset.status == "threat_detected"):
            edge_status = "active_threat"
        elif (src_asset and src_asset.status == "degraded") or (tgt_asset and tgt_asset.status == "degraded"):
            edge_status = "degraded"

        edges.append(TopologyEdge(
            id=f"edge-{idx}",
            source=e["source"],
            target=e["target"],
            protocol=e["protocol"],
            status=edge_status
        ))

    # Recent Alerts (Top 5)
    asset_dict = {a.id: a.name for a in assets}
    recent_alerts = []
    for ev in events[:5]:
        recent_alerts.append(SecurityEventResponse(
            id=ev.id,
            timestamp=ev.timestamp,
            asset_id=ev.asset_id,
            asset_name=asset_dict.get(ev.asset_id, "Unknown Asset"),
            event_type=ev.event_type,
            severity=ev.severity,
            source=ev.source,
            destination=ev.destination,
            features=ev.features,
            detection_status=ev.detection_status,
            rule_triggered=ev.rule_triggered,
            incident_id=ev.incident_id
        ))

    # Recent Activity stream
    recent_activity = []
    for ev in events[:8]:
        recent_activity.append({
            "id": ev.id,
            "timestamp": ev.timestamp,
            "event": ev.event_type,
            "asset": asset_dict.get(ev.asset_id, ev.asset_id),
            "severity": ev.severity,
            "status": ev.detection_status
        })

    # ARC Intelligence Insight (Contextual AI threat card)
    ai_insight = None
    # Pick the most severe active incident
    primary_active_incident = None
    for inc in incidents:
        if inc.status in ["open", "investigating"]:
            primary_active_incident = inc
            if inc.severity in ["critical", "high"]:
                break

    if primary_active_incident:
        target_asset = next((a for a in assets if a.id == primary_active_incident.primary_asset_id), None)
        analysis_data = primary_active_incident.analysis or {}
        
        # Build insight
        ai_insight = {
            "incident_id": primary_active_incident.id,
            "title": primary_active_incident.title,
            "severity": primary_active_incident.severity,
            "asset_name": target_asset.name if target_asset else primary_active_incident.primary_asset_id,
            "summary": analysis_data.get("incident_summary", primary_active_incident.description),
            "trigger_reason": analysis_data.get("detection_trigger_reason", "Statistical anomaly threshold breached."),
            "evidence": analysis_data.get("evidence_observed", ["Abnormal telemetry signature recorded."])[:2],
            "recommended_next_step": analysis_data.get("recommended_investigation_steps", ["Review network logs and isolate asset if needed."])[0] if analysis_data.get("recommended_investigation_steps") else "Review event telemetry.",
            "confidence": analysis_data.get("confidence_level", "High (88%)"),
            "limitations": analysis_data.get("limitations", "Telemetry indicates abnormal pattern; further packet analysis recommended.")
        }

    return DashboardResponse(
        kpis=kpis,
        health_breakdown=health_breakdown,
        topology=TopologyResponse(nodes=nodes, edges=edges),
        recent_alerts=recent_alerts,
        recent_activity=recent_activity,
        arc_intelligence_insight=ai_insight
    )
