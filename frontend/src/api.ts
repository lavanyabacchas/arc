import {
  DashboardData,
  Asset,
  SecurityEvent,
  Incident,
  ResponseAction,
  AuditEntry,
  AnalyticsData,
  AIAnalysisReport
} from './types';

const API_BASE = '/api';

export async function fetchDashboard(): Promise<DashboardData> {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch dashboard data');
  return res.json();
}

export async function fetchAssets(params?: { search?: string; sector?: string; status?: string; sort_by?: string }): Promise<Asset[]> {
  const searchParams = new URLSearchParams();
  if (params?.search) searchParams.set('search', params.search);
  if (params?.sector) searchParams.set('sector', params.sector);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.sort_by) searchParams.set('sort_by', params.sort_by);

  const url = `${API_BASE}/assets?${searchParams.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch assets');
  return res.json();
}

export async function fetchAssetDetail(assetId: string): Promise<{
  asset: Asset;
  connected_assets_details: Array<{ id: string; name: string; status: string; sector: string }>;
  recent_telemetry: SecurityEvent[];
  incidents: Array<{ id: string; title: string; severity: string; status: string; risk_score: number; created_at: string }>;
}> {
  const res = await fetch(`${API_BASE}/assets/${assetId}`);
  if (!res.ok) throw new Error(`Failed to fetch asset ${assetId}`);
  return res.json();
}

export async function fetchAlerts(params?: { severity?: string; status?: string; asset_id?: string; search?: string }): Promise<{
  summary: {
    total_events_analyzed: number;
    suspicious_events: number;
    events_by_severity: Record<string, number>;
    events_by_category: Record<string, number>;
  };
  alerts: SecurityEvent[];
}> {
  const searchParams = new URLSearchParams();
  if (params?.severity) searchParams.set('severity', params.severity);
  if (params?.status) searchParams.set('status', params.status);
  if (params?.asset_id) searchParams.set('asset_id', params.asset_id);
  if (params?.search) searchParams.set('search', params.search);

  const url = `${API_BASE}/alerts?${searchParams.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch alerts');
  return res.json();
}

export async function fetchIncidents(params?: { status?: string; severity?: string }): Promise<Incident[]> {
  const searchParams = new URLSearchParams();
  if (params?.status) searchParams.set('status', params.status);
  if (params?.severity) searchParams.set('severity', params.severity);

  const url = `${API_BASE}/incidents?${searchParams.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch incidents');
  return res.json();
}

export async function fetchIncidentDetail(incidentId: string): Promise<Incident> {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}`);
  if (!res.ok) throw new Error(`Failed to fetch incident ${incidentId}`);
  return res.json();
}

export async function triggerAIAnalysis(incidentId: string): Promise<AIAnalysisReport> {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/analyze`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to trigger AI analysis');
  return res.json();
}

export async function updateIncidentStatus(incidentId: string, status: string): Promise<any> {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  if (!res.ok) throw new Error('Failed to update incident status');
  return res.json();
}

export async function addAnalystNote(incidentId: string, text: string, author?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/incidents/${incidentId}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, author })
  });
  if (!res.ok) throw new Error('Failed to add note');
  return res.json();
}

export async function fetchResponses(): Promise<ResponseAction[]> {
  const res = await fetch(`${API_BASE}/responses`);
  if (!res.ok) throw new Error('Failed to fetch responses');
  return res.json();
}

export async function approveResponse(responseId: string, approver?: string): Promise<any> {
  const res = await fetch(`${API_BASE}/responses/${responseId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ approver })
  });
  if (!res.ok) throw new Error('Failed to approve response');
  return res.json();
}

export async function executeSimulatedResponse(responseId: string): Promise<any> {
  const res = await fetch(`${API_BASE}/responses/${responseId}/execute`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to execute simulated response');
  return res.json();
}

export async function fetchAnalytics(params?: { sector?: string; severity?: string }): Promise<AnalyticsData> {
  const searchParams = new URLSearchParams();
  if (params?.sector) searchParams.set('sector', params.sector);
  if (params?.severity) searchParams.set('severity', params.severity);

  const url = `${API_BASE}/analytics?${searchParams.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch analytics');
  return res.json();
}

export async function fetchAuditLogs(params?: { action?: string; actor?: string; entity_type?: string; search?: string }): Promise<AuditEntry[]> {
  const searchParams = new URLSearchParams();
  if (params?.action) searchParams.set('action', params.action);
  if (params?.actor) searchParams.set('actor', params.actor);
  if (params?.entity_type) searchParams.set('entity_type', params.entity_type);
  if (params?.search) searchParams.set('search', params.search);

  const url = `${API_BASE}/audit-logs?${searchParams.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch audit logs');
  return res.json();
}

export async function simulateThreatEvent(): Promise<{
  success: boolean;
  message: string;
  event_id: string;
  incident_id: string;
  asset_name: string;
  rule_triggered: string;
}> {
  const res = await fetch(`${API_BASE}/demo/simulate-event`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to simulate threat event');
  return res.json();
}

export async function resetDemo(): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/demo/reset`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('Failed to reset demo');
  return res.json();
}

export async function fetchSettings(): Promise<any> {
  const res = await fetch(`${API_BASE}/settings`);
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

export async function updateSettings(thresholds: Record<string, any>): Promise<any> {
  const res = await fetch(`${API_BASE}/settings`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(thresholds)
  });
  if (!res.ok) throw new Error('Failed to update settings');
  return res.json();
}
