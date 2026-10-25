from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

# --- Assets ---
class AssetBase(BaseModel):
    id: str
    name: str
    sector: str
    type: str
    status: str
    criticality: str
    risk_score: float
    ip_address: str
    location: str
    last_seen: str
    connected_assets: List[str] = []
    metadata: Dict[str, Any] = {}

class AssetResponse(AssetBase):
    pass

# --- Security Events / Alerts ---
class SecurityEventResponse(BaseModel):
    id: str
    timestamp: str
    asset_id: str
    asset_name: Optional[str] = None
    event_type: str
    severity: str
    source: str
    destination: str
    features: Dict[str, Any] = {}
    detection_status: str
    rule_triggered: str
    incident_id: Optional[str] = None

# --- Incidents ---
class AnalystNote(BaseModel):
    author: str
    text: str
    timestamp: str

class TimelineItem(BaseModel):
    step: int
    title: str
    timestamp: str
    status: str # completed, in_progress, alert, pending
    description: str

class AIAnalysisReport(BaseModel):
    incident_summary: str
    evidence_observed: List[str]
    detection_trigger_reason: str
    attack_technique: str
    severity_assessment: str
    potentially_affected_assets: List[str]
    recommended_investigation_steps: List[str]
    recommended_containment_options: List[str]
    confidence_level: str
    limitations: str
    mode: str = "ARC Rule-Based Telemetry Intelligence"

class IncidentResponse(BaseModel):
    id: str
    title: str
    description: str
    severity: str
    status: str
    primary_asset_id: str
    primary_asset_name: Optional[str] = None
    risk_score: float
    assigned_analyst: str
    created_at: str
    updated_at: str
    analysis: Optional[AIAnalysisReport] = None
    analyst_notes: List[AnalystNote] = []
    timeline: List[TimelineItem] = []
    evidence: Dict[str, Any] = {}

class IncidentStatusUpdate(BaseModel):
    status: str

class AddNoteRequest(BaseModel):
    text: str
    author: Optional[str] = "Alex Mercer (Lead SOC Analyst)"

# --- Responses ---
class ResponseActionResponse(BaseModel):
    id: str
    incident_id: str
    action_type: str
    title: str
    rationale: str
    expected_effect: str
    operational_impact: str
    approval_status: str # proposed, awaiting_approval, approved, rejected
    execution_status: str # pending, simulating, completed, failed
    simulated_execution_details: str
    created_at: str
    executed_at: Optional[str] = None
    requires_approval: bool

class ApproveResponseRequest(BaseModel):
    approver: Optional[str] = "Alex Mercer (Lead SOC Analyst)"

# --- Audit Entries ---
class AuditEntryResponse(BaseModel):
    id: str
    timestamp: str
    actor: str
    action: str
    entity_type: str
    entity_id: str
    details: str
    outcome: str

# --- Dashboard & Analytics ---
class KPIData(BaseModel):
    assets_monitored: int
    assets_sectors_count: int
    active_threats: int
    high_critical_threats: int
    infrastructure_health_percent: float
    health_status_label: str
    open_incidents: int
    awaiting_review_incidents: int

class TopologyNode(BaseModel):
    id: str
    name: str
    sector: str
    type: str
    status: str
    risk_score: float
    criticality: str
    ip_address: str
    x: float
    y: float

class TopologyEdge(BaseModel):
    id: str
    source: str
    target: str
    protocol: str
    status: str # normal, active_threat, degraded

class TopologyResponse(BaseModel):
    nodes: List[TopologyNode]
    edges: List[TopologyEdge]

class DashboardResponse(BaseModel):
    kpis: KPIData
    health_breakdown: Dict[str, int]
    topology: TopologyResponse
    recent_alerts: List[SecurityEventResponse]
    recent_activity: List[Dict[str, Any]]
    arc_intelligence_insight: Optional[Dict[str, Any]] = None

class AnalyticsResponse(BaseModel):
    events_over_time: List[Dict[str, Any]]
    incidents_by_severity: Dict[str, int]
    detection_categories: Dict[str, int]
    asset_risk_distribution: List[Dict[str, Any]]
    incident_status_breakdown: Dict[str, int]
    response_outcomes: Dict[str, int]
