export interface Asset {
  id: string;
  name: string;
  sector: string;
  type: string;
  status: 'healthy' | 'degraded' | 'threat_detected' | 'offline' | 'isolated';
  criticality: 'critical' | 'high' | 'medium' | 'low';
  risk_score: number;
  ip_address: string;
  location: string;
  last_seen: string;
  connected_assets: string[];
  metadata: Record<string, any>;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  asset_id: string;
  asset_name?: string;
  event_type: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  source: string;
  destination: string;
  features: Record<string, any>;
  detection_status: 'flagged' | 'correlated' | 'normal' | 'false_positive';
  rule_triggered: string;
  incident_id?: string;
}

export interface AnalystNote {
  author: string;
  text: string;
  timestamp: string;
}

export interface TimelineItem {
  step: number;
  title: string;
  timestamp: string;
  status: 'completed' | 'in_progress' | 'alert' | 'pending';
  description: string;
}

export interface AIAnalysisReport {
  incident_summary: string;
  evidence_observed: string[];
  detection_trigger_reason: string;
  attack_technique: string;
  severity_assessment: string;
  potentially_affected_assets: string[];
  recommended_investigation_steps: string[];
  recommended_containment_options: string[];
  confidence_level: string;
  limitations: string;
  mode: string;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'investigating' | 'contained' | 'resolved' | 'false_positive';
  primary_asset_id: string;
  primary_asset_name?: string;
  risk_score: number;
  assigned_analyst: string;
  created_at: string;
  updated_at: string;
  analysis?: AIAnalysisReport;
  analyst_notes: AnalystNote[];
  timeline: TimelineItem[];
  evidence: Record<string, any>;
}

export interface ResponseAction {
  id: string;
  incident_id: string;
  action_type: string;
  title: string;
  rationale: string;
  expected_effect: string;
  operational_impact: string;
  approval_status: 'proposed' | 'awaiting_approval' | 'approved' | 'rejected';
  execution_status: 'pending' | 'simulating' | 'completed' | 'failed';
  simulated_execution_details: string;
  created_at: string;
  executed_at?: string;
  requires_approval: boolean;
}

export interface AuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  outcome: 'success' | 'warning' | 'info';
}

export interface KPIData {
  assets_monitored: number;
  assets_sectors_count: number;
  active_threats: number;
  high_critical_threats: number;
  infrastructure_health_percent: number;
  health_status_label: string;
  open_incidents: number;
  awaiting_review_incidents: number;
}

export interface TopologyNode {
  id: string;
  name: string;
  sector: string;
  type: string;
  status: 'healthy' | 'degraded' | 'threat_detected' | 'offline' | 'isolated';
  risk_score: number;
  criticality: string;
  ip_address: string;
  x: number;
  y: number;
}

export interface TopologyEdge {
  id: string;
  source: string;
  target: string;
  protocol: string;
  status: 'normal' | 'active_threat' | 'degraded';
}

export interface DashboardData {
  kpis: KPIData;
  health_breakdown: {
    healthy: number;
    at_risk: number;
    offline: number;
  };
  topology: {
    nodes: TopologyNode[];
    edges: TopologyEdge[];
  };
  recent_alerts: SecurityEvent[];
  recent_activity: Array<{
    id: string;
    timestamp: string;
    event: string;
    asset: string;
    severity: string;
    status: string;
  }>;
  arc_intelligence_insight?: {
    incident_id: string;
    title: string;
    severity: string;
    asset_name: string;
    summary: string;
    trigger_reason: string;
    evidence: string[];
    recommended_next_step: string;
    confidence: string;
    limitations: string;
  };
}

export interface AnalyticsData {
  events_over_time: Array<{
    time: string;
    baseline_traffic: number;
    anomalous_events: number;
    blocked_attempts: number;
  }>;
  incidents_by_severity: Record<string, number>;
  detection_categories: Record<string, number>;
  asset_risk_distribution: Array<{
    name: string;
    risk_score: number;
    sector: string;
    criticality: string;
  }>;
  incident_status_breakdown: Record<string, number>;
  response_outcomes: Record<string, number>;
}
