import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ChevronRight, 
  RefreshCw,
  SlidersHorizontal,
  ExternalLink
} from 'lucide-react';
import { fetchAlerts } from '../api';
import { SecurityEvent } from '../types';

interface ThreatDetectionViewProps {
  onNavigateToInvestigation: (incidentId?: string) => void;
}

export const ThreatDetectionView: React.FC<ThreatDetectionViewProps> = ({
  onNavigateToInvestigation
}) => {
  const [alerts, setAlerts] = useState<SecurityEvent[]>([]);
  const [summary, setSummary] = useState<{
    total_events_analyzed: number;
    suspicious_events: number;
    events_by_severity: Record<string, number>;
    events_by_category: Record<string, number>;
  }>({
    total_events_analyzed: 0,
    suspicious_events: 0,
    events_by_severity: {},
    events_by_category: {}
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadAlerts = () => {
    setLoading(true);
    fetchAlerts({
      search,
      severity: severityFilter,
      status: statusFilter
    })
      .then(res => {
        setAlerts(res.alerts);
        setSummary(res.summary);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadAlerts();
  }, [search, severityFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#EAF2FF] tracking-tight">Threat Detection & Telemetry Analysis</h2>
          <p className="text-xs text-[#91A6C4] mt-0.5">
            Continuous anomaly monitoring, heuristic threshold evaluations, and security alerts
          </p>
        </div>

        <button
          onClick={loadAlerts}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B1B30] hover:bg-[#10243D] border border-[#203651] text-xs text-[#91A6C4] hover:text-[#EAF2FF] transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Detection Summary Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#0B1B30] border border-[#203651] shadow-lg">
          <span className="text-[11px] font-semibold text-[#91A6C4] uppercase tracking-wider block">
            Total Telemetry Packets
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-[#EAF2FF]">
            {summary.total_events_analyzed.toLocaleString()}
          </div>
          <p className="text-[11px] text-[#34D399] mt-1">Continuous sensor stream</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0B1B30] border border-rose-500/30 shadow-lg">
          <span className="text-[11px] font-semibold text-[#FB7185] uppercase tracking-wider block">
            Suspicious Events
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-[#FB7185]">
            {summary.suspicious_events}
          </div>
          <p className="text-[11px] text-[#91A6C4] mt-1">Deviations flagged by engine</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0B1B30] border border-[#203651] shadow-lg">
          <span className="text-[11px] font-semibold text-[#91A6C4] uppercase tracking-wider block">
            High Severity Threats
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-amber-400">
            {summary.events_by_severity['high'] || 0}
          </div>
          <p className="text-[11px] text-[#91A6C4] mt-1">Requiring immediate response</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0B1B30] border border-[#203651] shadow-lg">
          <span className="text-[11px] font-semibold text-[#91A6C4] uppercase tracking-wider block">
            Active Detection Rules
          </span>
          <div className="mt-2 text-2xl font-bold font-mono text-[#3B82F6]">
            {Object.keys(summary.events_by_category).length || 4}
          </div>
          <p className="text-[11px] text-[#91A6C4] mt-1">Rules + ML Isolation Forest</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-[#0B1B30] border border-[#203651] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md relative">
          <Search className="w-4 h-4 text-[#91A6C4] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search alerts by title or IP..."
            className="w-full bg-[#10243D] border border-[#203651] rounded-lg pl-9 pr-3 py-2 text-xs text-[#EAF2FF] placeholder-[#627D98] focus:outline-none focus:border-[#3B82F6]"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#91A6C4]">
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-[#10243D] border border-[#203651] rounded-lg px-2.5 py-1.5 text-xs text-[#EAF2FF] focus:outline-none focus:border-[#3B82F6] cursor-pointer"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
              <option value="info">Info</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-[#91A6C4]">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#10243D] border border-[#203651] rounded-lg px-2.5 py-1.5 text-xs text-[#EAF2FF] focus:outline-none focus:border-[#3B82F6] cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="flagged">Flagged</option>
              <option value="normal">Normal</option>
              <option value="correlated">Correlated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Alerts Table */}
      <div className="rounded-2xl bg-[#0B1B30] border border-[#203651] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#203651] bg-[#10243D]/50 text-[#91A6C4] text-[10px] uppercase font-semibold">
                <th className="py-3 px-4">Alert ID</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Event Classification</th>
                <th className="py-3 px-4">Affected Asset</th>
                <th className="py-3 px-4">Source / Destination</th>
                <th className="py-3 px-4">Triggered Rule</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#203651]/40">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[#91A6C4]">
                    Loading security events...
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-[#91A6C4]">
                    No security alerts found matching the current filters.
                  </td>
                </tr>
              ) : (
                alerts.map((alert) => (
                  <tr 
                    key={alert.id}
                    onClick={() => onNavigateToInvestigation(alert.incident_id)}
                    className="hover:bg-[#10243D]/60 transition-colors cursor-pointer group"
                  >
                    <td className="py-3 px-4 font-mono font-semibold text-[#3B82F6]">
                      {alert.id}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        alert.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                        alert.severity === 'high' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        alert.severity === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-semibold text-[#EAF2FF] max-w-xs truncate group-hover:text-[#3B82F6] transition-colors">
                      {alert.event_type}
                    </td>
                    <td className="py-3 px-4 text-[#91A6C4]">
                      {alert.asset_name || alert.asset_id}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#91A6C4]">
                      <div>Src: {alert.source}</div>
                      <div>Dst: {alert.destination}</div>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-[#91A6C4] max-w-xs truncate">
                      {alert.rule_triggered}
                    </td>
                    <td className="py-3 px-4 font-mono text-[10px] text-[#91A6C4] whitespace-nowrap">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4">
                      <button className="text-[#3B82F6] hover:text-white flex items-center gap-1 font-semibold text-[11px]">
                        <span>Investigate</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
