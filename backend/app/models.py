import json
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Text, Boolean, DateTime
from .database import Base

class Asset(Base):
    __tablename__ = "assets"

    id = Column(String(50), primary_key=True, index=True) # e.g. AST-001
    name = Column(String(100), nullable=False) # e.g. Power Grid
    sector = Column(String(100), nullable=False) # e.g. Energy
    type = Column(String(100), nullable=False) # e.g. SCADA Distribution Substation
    status = Column(String(50), default="healthy") # healthy, degraded, threat_detected, offline, isolated
    criticality = Column(String(20), default="high") # critical, high, medium, low
    risk_score = Column(Float, default=10.0) # 0 to 100
    ip_address = Column(String(50), default="10.10.0.1")
    location = Column(String(150), default="Sector Alpha")
    last_seen = Column(String(50), default=lambda: datetime.utcnow().isoformat())
    connected_assets_json = Column(Text, default="[]") # JSON list of asset IDs
    metadata_json = Column(Text, default="{}") # Additional telemetry/specs

    @property
    def connected_assets(self):
        try:
            return json.loads(self.connected_assets_json or "[]")
        except Exception:
            return []

    @property
    def metadata_dict(self):
        try:
            return json.loads(self.metadata_json or "{}")
        except Exception:
            return {}

class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(String(50), primary_key=True, index=True) # EVT-001
    timestamp = Column(String(50), default=lambda: datetime.utcnow().isoformat())
    asset_id = Column(String(50), index=True, nullable=False)
    event_type = Column(String(100), nullable=False) # e.g. Unusual outbound traffic
    severity = Column(String(20), default="medium") # critical, high, medium, low, info
    source = Column(String(100), default="10.10.30.50")
    destination = Column(String(100), default="198.51.100.42:8443")
    features_json = Column(Text, default="{}") # e.g. {"bytes_out": 45000000, "connection_freq": 142}
    detection_status = Column(String(50), default="flagged") # flagged, correlated, normal, false_positive
    rule_triggered = Column(String(150), default="Outbound Rate Anomaly Rule")
    incident_id = Column(String(50), nullable=True, index=True)

    @property
    def features(self):
        try:
            return json.loads(self.features_json or "{}")
        except Exception:
            return {}

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String(50), primary_key=True, index=True) # INC-2026-001
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String(20), default="high") # critical, high, medium, low
    status = Column(String(50), default="open") # open, investigating, contained, resolved, false_positive
    primary_asset_id = Column(String(50), index=True, nullable=False)
    risk_score = Column(Float, default=75.0)
    assigned_analyst = Column(String(100), default="Alex Mercer (Senior SOC Analyst)")
    created_at = Column(String(50), default=lambda: datetime.utcnow().isoformat())
    updated_at = Column(String(50), default=lambda: datetime.utcnow().isoformat())
    
    # Structured AI intelligence analysis report stored as JSON
    analysis_json = Column(Text, default="{}")
    # Analyst notes stored as JSON list of dicts: [{author, text, timestamp}]
    analyst_notes_json = Column(Text, default="[]")
    # Timeline of events stored as JSON list of dicts: [{step, title, timestamp, status, description}]
    timeline_json = Column(Text, default="[]")
    # Evidence data stored as JSON
    evidence_json = Column(Text, default="{}")

    @property
    def analysis(self):
        try:
            return json.loads(self.analysis_json or "{}")
        except Exception:
            return {}

    @property
    def analyst_notes(self):
        try:
            return json.loads(self.analyst_notes_json or "[]")
        except Exception:
            return []

    @property
    def timeline(self):
        try:
            return json.loads(self.timeline_json or "[]")
        except Exception:
            return []

    @property
    def evidence(self):
        try:
            return json.loads(self.evidence_json or "{}")
        except Exception:
            return {}

class ResponseAction(Base):
    __tablename__ = "response_actions"

    id = Column(String(50), primary_key=True, index=True) # RSP-001
    incident_id = Column(String(50), index=True, nullable=False)
    action_type = Column(String(100), nullable=False) # isolate_asset, block_ip, rate_limit, collect_telemetry, disable_test_account
    title = Column(String(200), nullable=False)
    rationale = Column(Text, nullable=False)
    expected_effect = Column(Text, nullable=False)
    operational_impact = Column(Text, nullable=False)
    approval_status = Column(String(50), default="proposed") # proposed, awaiting_approval, approved, rejected
    execution_status = Column(String(50), default="pending") # pending, simulating, completed, failed
    simulated_execution_details = Column(Text, default="")
    created_at = Column(String(50), default=lambda: datetime.utcnow().isoformat())
    executed_at = Column(String(50), nullable=True)
    requires_approval = Column(Boolean, default=True)

class AuditEntry(Base):
    __tablename__ = "audit_entries"

    id = Column(String(50), primary_key=True, index=True) # AUD-001
    timestamp = Column(String(50), default=lambda: datetime.utcnow().isoformat())
    actor = Column(String(100), nullable=False) # e.g. "Alex Mercer", "Detection Engine", "ARC Intelligence AI"
    action = Column(String(100), nullable=False) # incident_created, status_changed, ai_analysis_generated, response_approved, simulated_response_executed, note_added, demo_reset
    entity_type = Column(String(50), nullable=False) # incident, asset, response, system
    entity_id = Column(String(50), nullable=False)
    details = Column(Text, default="")
    outcome = Column(String(50), default="success") # success, warning, info

class Setting(Base):
    __tablename__ = "settings"

    key = Column(String(100), primary_key=True)
    value = Column(Text, nullable=False)
    description = Column(String(255), default="")
