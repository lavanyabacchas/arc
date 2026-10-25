import React from 'react';
import { 
  Server, 
  ShieldAlert, 
  Activity, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  ShieldCheck,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { DashboardData } from '../types';
import { TopologyMap } from '../components/TopologyMap';

interface DashboardViewProps {
  data: DashboardData;
  onSelectNode: (nodeId: string) => void;
  onNavigate: (view: string, targetId?: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  onSelectNode,
  onNavigate
}) => {
  const { kpis, health_breakdown, topology, recent_alerts, recent_activity, arc_intelligence_insight } = data;

  return (
    <div className="space-y-6">
      {/* 1. KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Assets Monitored */}
        <div className="p-4 rounded-2xl bg-[#0B1B30] border border-[#203651] shadow-lg hover:border-[#3B82F6]/50 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#91A6C4] uppercase tracking-wider">Assets Monitored</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-[#3B82F6]">
              <Server className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-[#EAF2FF] font-mono tracking-tight">
              {kpis.assets_monitored}
            </div>
            <div className="text-[11px] text-[#91A6C4] mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
              <span>Across {kpis.assets_sectors_count} infrastructure sectors</span>
            </div>
          </div>
        </div>

        {/* Active Threats */}
        <div className={`p-4 rounded-2xl bg-[#0B1B30] border transition-all flex flex-col justify-between shadow-lg ${
          kpis.active_threats > 0 ? 'border-rose-500/40 shadow-rose-950/20' : 'border-[#203651]'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#91A6C4] uppercase tracking-wider">Active Threats</span>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              kpis.active_threats > 0 ? 'bg-rose-500/20 text-[#FB7185] animate-pulse' : 'bg-emerald-500/10 text-[#34D399]'
            }`}>
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className={`text-3xl font-extrabold font-mono tracking-tight ${
              kpis.active_threats > 0 ? 'text-[#FB7185]' : 'text-[#34D399]'
            }`}>
              {kpis.active_threats}
            </div>
            <div className="text-[11px] text-[#91A6C4] mt-1 flex items-center gap-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${kpis.high_critical_threats > 0 ? 'bg-rose-500 animate-ping' : 'bg-emerald-500'}`} />
              <span>{kpis.high_critical_threats > 0 ? `${kpis.high_critical_threats} high severity alert` : 'No critical alerts'}</span>
            </div>
          </div>
        </div>

        {/* Infrastructure Health */}
        <div className="p-4 rounded-2xl bg-[#0B1B30] border border-[#203651] shadow-lg hover:border-[#3B82F6]/50 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#91A6C4] uppercase tracking-wider">Infrastructure Health</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-[#34D399]">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-[#EAF2FF] font-mono tracking-tight">
              {kpis.infrastructure_health_percent}%
            </div>
            <div className="text-[11px] text-[#91A6C4] mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#34D399]" />
              <span className="truncate">{kpis.health_status_label}</span>
            </div>
          </div>
        </div>

        {/* Open Incidents */}
        <div className="p-4 rounded-2xl bg-[#0B1B30] border border-[#203651] shadow-lg hover:border-[#3B82F6]/50 transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#91A6C4] uppercase tracking-wider">Open Incidents</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#FBBF24]">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-[#EAF2FF] font-mono tracking-tight">
              {kpis.open_incidents}
            </div>
            <div className="text-[11px] text-[#91A6C4] mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>{kpis.awaiting_review_incidents} awaiting analyst review</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Infrastructure Overview Map */}
      <div>
        <TopologyMap 
          nodes={topology.nodes}
          edges={topology.edges}
          onSelectNode={onSelectNode}
        />
      </div>

      {/* 3. Middle Section: ARC Intelligence Threat Insight + Health Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ARC Intelligence Threat Insight Panel (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-[#0B1B30] border border-[#A78BFA]/40 ai-card-glow shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-[#A78BFA]/20 border border-[#A78BFA]/30 flex items-center justify-center text-[#A78BFA]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#EAF2FF] tracking-wide flex items-center gap-2">
                    <span>ARC Intelligence Insight</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-purple-500/20 text-[#A78BFA] border border-purple-500/30">
                      Automated Assessment
                    </span>
                  </h3>
                </div>
              </div>

              {arc_intelligence_insight && (
                <span className={`text-[11px] font-semibold uppercase px-2 py-0.5 rounded ${
                  arc_intelligence_insight.severity === 'high' ? 'bg-rose-500/20 text-[#FB7185] border border-rose-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {arc_intelligence_insight.severity} Priority
                </span>
              )}
            </div>

            {arc_intelligence_insight ? (
              <div className="space-y-3 pt-1">
                <p className="text-xs text-[#EAF2FF] leading-relaxed">
                  {arc_intelligence_insight.summary}
                </p>

                {/* Evidence points */}
                <div className="p-3 rounded-xl bg-[#10243D]/70 border border-[#203651] space-y-1.5">
                  <div className="text-[10px] text-[#A78BFA] uppercase font-bold tracking-wider">
                    Observed Telemetry Evidence
                  </div>
                  {arc_intelligence_insight.evidence.map((ev, idx) => (
                    <div key={idx} className="text-xs text-[#91A6C4] flex items-start gap-2">
                      <span className="text-[#3B82F6] font-bold">•</span>
                      <span>{ev}</span>
                    </div>
                  ))}
                </div>

                <div className="text-xs text-[#91A6C4]">
                  <span className="text-[#EAF2FF] font-semibold">Recommended Next Step: </span>
                  {arc_intelligence_insight.recommended_next_step}
                </div>

                <div className="flex items-center justify-between text-[11px] text-[#627D98] pt-1">
                  <span>Confidence: <strong className="text-[#34D399]">{arc_intelligence_insight.confidence}</strong></span>
                  <span className="italic truncate max-w-xs">{arc_intelligence_insight.limitations}</span>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center text-xs text-[#91A6C4]">
                All assets functioning within normal parameters. No active threat telemetry flagged.
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#203651] flex items-center justify-between">
            <span className="text-[11px] text-[#91A6C4]">
              Incident: <strong className="text-[#EAF2FF] font-mono">{arc_intelligence_insight?.incident_id || 'None'}</strong>
            </span>
            {arc_intelligence_insight && (
              <button
                onClick={() => onNavigate('investigations', arc_intelligence_insight.incident_id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#A78BFA]/20 hover:bg-[#A78BFA]/30 border border-[#A78BFA]/40 text-[#EAF2FF] text-xs font-semibold transition-all cursor-pointer"
              >
                <span>Investigate Threat</span>
                <ChevronRight className="w-3.5 h-3.5 text-[#A78BFA]" />
              </button>
            )}
          </div>
        </div>

        {/* Infrastructure Health Segment Breakdown (1 col) */}
        <div className="p-5 rounded-2xl bg-[#0B1B30] border border-[#203651] shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#203651]">
              <h3 className="text-sm font-semibold text-[#EAF2FF]">Infrastructure Health Breakdown</h3>
              <span className="text-xs text-[#91A6C4] font-mono">8 Core Nodes</span>
            </div>

            {/* Health Bars */}
            <div className="mt-5 space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[#34D399] font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#34D399]" />
                    Healthy Systems
                  </span>
                  <span className="font-mono text-[#EAF2FF] font-bold">{health_breakdown.healthy} / 8</span>
                </div>
                <div className="w-full bg-[#10243D] h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#34D399] rounded-full transition-all duration-500"
                    style={{ width: `${(health_breakdown.healthy / 8) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-[#FBBF24] font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#FBBF24]" />
                    At-Risk / Degraded
                  </span>
                  <span className="font-mono text-[#EAF2FF] font-bold">{health_breakdown.at_risk} / 8</span>
                </div>
                <div className="w-full bg-[#10243D] h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#FBBF24] rounded-full transition-all duration-500"
                    style={{ width: `${(health_breakdown.at_risk / 8) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-gray-400 font-medium flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gray-400" />
                    Isolated / Offline
                  </span>
                  <span className="font-mono text-[#EAF2FF] font-bold">{health_breakdown.offline} / 8</span>
                </div>
                <div className="w-full bg-[#10243D] h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gray-500 rounded-full transition-all duration-500"
                    style={{ width: `${(health_breakdown.offline / 8) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-[#203651] text-center">
            <button
              onClick={() => onNavigate('infrastructure')}
              className="text-xs text-[#3B82F6] hover:underline font-medium cursor-pointer inline-flex items-center gap-1"
            >
              <span>Explore complete asset inventory</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Bottom Section: Recent Alerts Panel + Recent System Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts Panel */}
        <div className="p-5 rounded-2xl bg-[#0B1B30] border border-[#203651] shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-[#203651] mb-3">
            <div>
              <h3 className="text-sm font-semibold text-[#EAF2FF]">Recent Security Alerts</h3>
              <p className="text-[11px] text-[#91A6C4]">Latest 5 flagged security events across infrastructure</p>
            </div>
            <button
              onClick={() => onNavigate('threats')}
              className="text-xs text-[#3B82F6] hover:underline flex items-center gap-1 cursor-pointer font-medium"
            >
              <span>View All Alerts</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {recent_alerts.map((alert) => (
              <div 
                key={alert.id}
                onClick={() => alert.incident_id ? onNavigate('investigations', alert.incident_id) : onNavigate('threats')}
                className="p-3 rounded-xl bg-[#10243D]/60 hover:bg-[#10243D] border border-[#203651] hover:border-[#3B82F6]/50 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      alert.severity === 'critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      alert.severity === 'high' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                      alert.severity === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs font-semibold text-[#EAF2FF]">{alert.event_type}</span>
                  </div>
                  <div className="text-[11px] text-[#91A6C4] flex items-center gap-2">
                    <span>Asset: <strong className="text-[#EAF2FF]">{alert.asset_name}</strong></span>
                    <span>•</span>
                    <span className="font-mono text-[10px]">Dst: {alert.destination}</span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-[#91A6C4] font-mono">
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </div>
                  <span className="text-[10px] text-[#3B82F6] inline-flex items-center gap-0.5 mt-1">
                    <span>Investigate</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity Stream */}
        <div className="p-5 rounded-2xl bg-[#0B1B30] border border-[#203651] shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-[#203651] mb-3">
            <div>
              <h3 className="text-sm font-semibold text-[#EAF2FF]">Telemetry Event Log</h3>
              <p className="text-[11px] text-[#91A6C4]">Live audit stream of incoming telemetry checks</p>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#10243D] text-[#34D399]">
              Live Feed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#203651] text-[#91A6C4] text-[10px] uppercase font-semibold">
                  <th className="py-2 px-2">Time</th>
                  <th className="py-2 px-2">Event</th>
                  <th className="py-2 px-2">Asset</th>
                  <th className="py-2 px-2">Severity</th>
                  <th className="py-2 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#203651]/40">
                {recent_activity.map((act) => (
                  <tr key={act.id} className="hover:bg-[#10243D]/50 transition-colors">
                    <td className="py-2.5 px-2 font-mono text-[10px] text-[#91A6C4] whitespace-nowrap">
                      {new Date(act.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-2.5 px-2 text-[#EAF2FF] font-medium truncate max-w-[140px]">
                      {act.event}
                    </td>
                    <td className="py-2.5 px-2 text-[#91A6C4] truncate max-w-[100px]">
                      {act.asset}
                    </td>
                    <td className="py-2.5 px-2">
                      <span className={`text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                        act.severity === 'high' ? 'bg-rose-500/20 text-rose-400' :
                        act.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {act.severity}
                      </span>
                    </td>
                    <td className="py-2.5 px-2">
                      <span className={`text-[10px] capitalize ${
                        act.status === 'flagged' ? 'text-[#FB7185] font-semibold' : 'text-[#34D399]'
                      }`}>
                        {act.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
