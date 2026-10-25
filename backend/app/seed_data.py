import json
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from .models import Asset, SecurityEvent, Incident, ResponseAction, AuditEntry, Setting
from .ai_engine import ai_engine

def seed_database(db: Session, force_reset: bool = False):
    """
    Populates or resets the SQLite database with rich, deterministic critical infrastructure data.
    """
    if force_reset:
        db.query(AuditEntry).delete()
        db.query(ResponseAction).delete()
        db.query(Incident).delete()
        db.query(SecurityEvent).delete()
        db.query(Asset).delete()
        db.query(Setting).delete()
        db.commit()
    elif db.query(Asset).count() > 0:
        return # Already seeded

    now = datetime.utcnow()
    t_minus_1h = (now - timedelta(hours=1)).isoformat()
    t_minus_30m = (now - timedelta(minutes=30)).isoformat()
    t_minus_10m = (now - timedelta(minutes=10)).isoformat()

    # 1. Critical Infrastructure Assets
    assets_data = [
        Asset(
            id="AST-001",
            name="Power Grid",
            sector="Energy",
            type="SCADA Distribution Substation",
            status="healthy",
            criticality="critical",
            risk_score=14.0,
            ip_address="10.10.10.15",
            location="Sector 4 - Regional Grid",
            last_seen=now.isoformat(),
            connected_assets_json=json.dumps(["AST-006", "AST-007", "AST-003"]),
            metadata_json=json.dumps({
                "substation_code": "PG-S4",
                "voltage_level": "138kV",
                "firmware_version": "v4.2.1-sec",
                "active_relays": 12,
                "protocol": "DNP3 / IEC 60870-5-104"
            })
        ),
        Asset(
            id="AST-002",
            name="Water Treatment Plant",
            sector="Water & Waste",
            type="Filtration Control PLC Cluster",
            status="healthy",
            criticality="critical",
            risk_score=11.5,
            ip_address="10.10.20.4",
            location="Plant B - Filtration Unit",
            last_seen=now.isoformat(),
            connected_assets_json=json.dumps(["AST-007", "AST-004"]),
            metadata_json=json.dumps({
                "facility_id": "WTP-02",
                "pumping_rate_m3h": 4500,
                "chemical_dosers": 6,
                "controller_model": "Allen-Bradley GuardLogix",
                "protocol": "Modbus TCP"
            })
        ),
        Asset(
            id="AST-003",
            name="Data Center",
            sector="IT & Cloud",
            type="Central Core Gateway & Compute Cluster",
            status="healthy",
            criticality="critical",
            risk_score=18.0,
            ip_address="10.10.30.50",
            location="Core Facility West",
            last_seen=now.isoformat(),
            connected_assets_json=json.dumps(["AST-001", "AST-004", "AST-007", "AST-005"]),
            metadata_json=json.dumps({
                "rack_tier": "Tier III+",
                "server_count": 64,
                "egress_bandwidth_gbps": 10,
                "os": "Hardened Linux SOC-Kernel 6.6",
                "protocol": "TLS 1.3 / HTTPS / SSH"
            })
        ),
        Asset(
            id="AST-004",
            name="Communication Tower",
            sector="Communications",
            type="Microwave Relay Station 7",
            status="healthy",
            criticality="high",
            risk_score=15.0,
            ip_address="10.10.40.12",
            location="North Ridge Point",
            last_seen=now.isoformat(),
            connected_assets_json=json.dumps(["AST-002", "AST-003", "AST-008"]),
            metadata_json=json.dumps({
                "frequency_band": "11 GHz",
                "antenna_height_m": 75,
                "redundant_links": 2,
                "protocol": "BGP / IP-over-Microwave"
            })
        ),
        Asset(
            id="AST-005",
            name="Transport Hub",
            sector="Transportation",
            type="Signaling & Switching Control Unit",
            status="healthy",
            criticality="high",
            risk_score=12.0,
            ip_address="10.10.50.8",
            location="Metro Central Depot",
            last_seen=now.isoformat(),
            connected_assets_json=json.dumps(["AST-003", "AST-001"]),
            metadata_json=json.dumps({
                "track_circuits": 48,
                "interlocking_type": "Solid State Interlocking (SSI)",
                "safety_integrity_level": "SIL-4",
                "protocol": "Euronet SCADA"
            })
        ),
        Asset(
            id="AST-006",
            name="Substation Alpha",
            sector="Energy",
            type="Step-Down Transformer Monitoring Unit",
            status="healthy",
            criticality="medium",
            risk_score=8.0,
            ip_address="10.10.10.28",
            location="Substation District 2",
            last_seen=now.isoformat(),
            connected_assets_json=json.dumps(["AST-001"]),
            metadata_json=json.dumps({
                "step_down_kv": "138kV -> 13.8kV",
                "oil_temp_c": 52.4,
                "protocol": "IEC 61850 GOOSE"
            })
        ),
        Asset(
            id="AST-007",
            name="SCADA Gateway",
            sector="IT & Cloud",
            type="Operational Technology Protocol Converter",
            status="healthy",
            criticality="critical",
            risk_score=16.0,
            ip_address="10.10.30.10",
            location="DMZ Enclave 1",
            last_seen=now.isoformat(),
            connected_assets_json=json.dumps(["AST-001", "AST-002", "AST-003"]),
            metadata_json=json.dumps({
                "firewall_zone": "OT-IT-DMZ",
                "active_sessions": 34,
                "protocol": "OPC-UA / Modbus / MQTT"
            })
        ),
        Asset(
            id="AST-008",
            name="Telemetry Relay",
            sector="Communications",
            type="Wide-Area Sensor Aggregator",
            status="healthy",
            criticality="medium",
            risk_score=9.0,
            ip_address="10.10.40.88",
            location="Remote Enclave East",
            last_seen=now.isoformat(),
            connected_assets_json=json.dumps(["AST-004"]),
            metadata_json=json.dumps({
                "sensors_connected": 128,
                "sampling_hz": 10,
                "protocol": "CoAP / TLS"
            })
        ),
    ]

    for asset in assets_data:
        db.add(asset)

    # 2. Baseline Events
    events_data = [
        SecurityEvent(
            id="EVT-1001",
            timestamp=(now - timedelta(minutes=45)).isoformat(),
            asset_id="AST-004",
            event_type="Repeated failed authentication attempts",
            severity="medium",
            source="10.10.40.12",
            destination="10.10.40.95:22",
            features_json=json.dumps({
                "connection_freq": 32.0,
                "bytes_transferred_kb": 140.0,
                "failed_auth": 6,
                "dest_port_variance": 1.2
            }),
            detection_status="flagged",
            rule_triggered="Rule: Authentication Threshold Exceeded",
            incident_id="INC-2026-001"
        ),
        SecurityEvent(
            id="EVT-1002",
            timestamp=(now - timedelta(minutes=55)).isoformat(),
            asset_id="AST-007",
            event_type="Unexpected service activity",
            severity="low",
            source="10.10.30.10",
            destination="10.10.30.10:8080",
            features_json=json.dumps({
                "connection_freq": 18.0,
                "bytes_transferred_kb": 850.0,
                "failed_auth": 0,
                "dest_port_variance": 0.5
            }),
            detection_status="normal",
            rule_triggered="Baseline Telemetry Monitor"
        ),
        SecurityEvent(
            id="EVT-1003",
            timestamp=(now - timedelta(minutes=20)).isoformat(),
            asset_id="AST-001",
            event_type="Routine SCADA keepalive telemetry",
            severity="info",
            source="10.10.10.15",
            destination="10.10.10.28:20000",
            features_json=json.dumps({
                "connection_freq": 24.0,
                "bytes_transferred_kb": 120.0,
                "failed_auth": 0,
                "dest_port_variance": 0.1
            }),
            detection_status="normal",
            rule_triggered="DNP3 Health Protocol"
        ),
        SecurityEvent(
            id="EVT-1004",
            timestamp=(now - timedelta(minutes=8)).isoformat(),
            asset_id="AST-005",
            event_type="Signaling channel handshake",
            severity="info",
            source="10.10.50.8",
            destination="10.10.30.50:502",
            features_json=json.dumps({
                "connection_freq": 12.0,
                "bytes_transferred_kb": 45.0,
                "failed_auth": 0,
                "dest_port_variance": 0.2
            }),
            detection_status="normal",
            rule_triggered="Transport Interlocking Baseline"
        ),
        SecurityEvent(
            id="EVT-1005",
            timestamp=(now - timedelta(minutes=2)).isoformat(),
            asset_id="AST-002",
            event_type="Water treatment PLC status broadcast",
            severity="info",
            source="10.10.20.4",
            destination="10.10.30.10:502",
            features_json=json.dumps({
                "connection_freq": 20.0,
                "bytes_transferred_kb": 310.0,
                "failed_auth": 0,
                "dest_port_variance": 0.3
            }),
            detection_status="normal",
            rule_triggered="Modbus Operational Check"
        )
    ]

    for evt in events_data:
        db.add(evt)

    # 3. Initial Baseline Incident (Communication Tower investigating)
    initial_analysis = ai_engine.generate_incident_analysis(
        incident={"title": "Repeated Failed Authentication on Relay Station 7", "severity": "medium"},
        asset={"name": "Communication Tower", "sector": "Communications", "criticality": "high", "ip_address": "10.10.40.12"},
        telemetry={"features": {"failed_auth": 6}, "destination": "10.10.40.95:22", "source": "10.10.40.12"},
        connected_assets=["Water Treatment Plant", "Data Center", "Telemetry Relay"]
    )

    t_minus_45m = (now - timedelta(minutes=45)).isoformat()
    initial_incident = Incident(
        id="INC-2026-001",
        title="Repeated Failed Authentication on Relay Station 7",
        description="Detection engine identified 6 consecutive authentication failures targeting SSH administrative interface within 60s.",
        severity="medium",
        status="investigating",
        primary_asset_id="AST-004",
        risk_score=48.0,
        assigned_analyst="Alex Mercer (Lead SOC Analyst)",
        created_at=t_minus_45m,
        updated_at=(now - timedelta(minutes=15)).isoformat(),
        analysis_json=json.dumps(initial_analysis),
        analyst_notes_json=json.dumps([
            {
                "author": "Alex Mercer (Lead SOC Analyst)",
                "text": "Confirmed failed login attempts from subnet 10.10.40.95. Automated maintenance scripts ruled out. Ongoing review.",
                "timestamp": (now - timedelta(minutes=25)).isoformat()
            }
        ]),
        timeline_json=json.dumps([
            {
                "step": 1,
                "title": "Authentication Bursts Detected",
                "timestamp": t_minus_45m,
                "status": "alert",
                "description": "6 failed login attempts recorded within 60-second window on port 22."
            },
            {
                "step": 2,
                "title": "Rule Engine Triggered",
                "timestamp": (now - timedelta(minutes=44)).isoformat(),
                "status": "completed",
                "description": "Rule 'Brute Force Authentication Threshold' matched and raised alert."
            },
            {
                "step": 3,
                "title": "Analyst Triaged",
                "timestamp": (now - timedelta(minutes=30)).isoformat(),
                "status": "in_progress",
                "description": "Analyst Alex Mercer assigned. Asset status remains operational."
            }
        ]),
        evidence_json=json.dumps({
            "source_ip": "10.10.40.95",
            "targeted_port": "22 (SSH)",
            "failed_attempts": 6,
            "time_window_sec": 60,
            "threshold": 5,
            "baseline_norm": "0.2 failures/hr"
        })
    )
    db.add(initial_incident)

    # 4. Proposed Response for Initial Incident
    initial_response = ResponseAction(
        id="RSP-001",
        incident_id="INC-2026-001",
        action_type="block_ip",
        title="Block Rogue Internal Subnet IP (10.10.40.95)",
        rationale="Prevents further dictionary attempts against Relay Station 7 administrative console.",
        expected_effect="Terminates unauthorized connection attempts without disrupting telemetry microwave carrier.",
        operational_impact="Minimal — Only impacts unauthorized internal IP 10.10.40.95. Microwave data link remains online.",
        approval_status="proposed",
        execution_status="pending",
        simulated_execution_details="",
        created_at=(now - timedelta(minutes=20)).isoformat(),
        requires_approval=True
    )
    db.add(initial_response)

    # 5. Audit Entries
    audit_data = [
        AuditEntry(
            id="AUD-001",
            timestamp=(now - timedelta(hours=2)).isoformat(),
            actor="System (Security Engine)",
            action="system_boot",
            entity_type="system",
            entity_id="ARC-CORE",
            details="ARC Critical Infrastructure Security Operations Platform initialized. Baseline telemetry engine active.",
            outcome="success"
        ),
        AuditEntry(
            id="AUD-002",
            timestamp=(now - timedelta(minutes=44)).isoformat(),
            actor="Detection Engine",
            action="incident_created",
            entity_type="incident",
            entity_id="INC-2026-001",
            details="Incident INC-2026-001 generated for Communication Tower AST-004 (Repeated Failed Authentication).",
            outcome="warning"
        ),
        AuditEntry(
            id="AUD-003",
            timestamp=(now - timedelta(minutes=30)).isoformat(),
            actor="Alex Mercer (Lead SOC Analyst)",
            action="status_changed",
            entity_type="incident",
            entity_id="INC-2026-001",
            details="Incident status transitioned from 'open' to 'investigating'.",
            outcome="info"
        ),
        AuditEntry(
            id="AUD-004",
            timestamp=(now - timedelta(minutes=20)).isoformat(),
            actor="ARC Intelligence AI",
            action="response_proposed",
            entity_type="response",
            entity_id="RSP-001",
            details="Proposed response RSP-001: Block Rogue Internal Subnet IP (10.10.40.95). Awaiting analyst approval.",
            outcome="info"
        )
    ]
    for audit in audit_data:
        db.add(audit)

    # 6. Default Settings
    settings_data = [
        Setting(key="outbound_bytes_kb_threshold", value="10000", description="Threshold for high outbound volume anomaly (KB)"),
        Setting(key="outbound_freq_threshold", value="80", description="Threshold for connection rate bursts (freq/min)"),
        Setting(key="failed_auth_limit", value="5", description="Max allowable failed auth attempts within 60s"),
        Setting(key="demo_mode", value="simulation_active", description="Simulated infrastructure environment status")
    ]
    for s in settings_data:
        db.add(s)

    db.commit()
