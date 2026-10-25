import React, { useState, useEffect } from 'react';
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { 
  BarChart3, 
  Filter, 
  RefreshCw, 
  TrendingUp, 
  ShieldAlert, 
  CheckCircle2, 
  Activity 
} from 'lucide-react';
import { fetchAnalytics } from '../api';
import { AnalyticsData } from '../types';

export const AnalyticsView: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [sectorFilter, setSectorFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  const loadData = () => {
    setLoading(true);
    fetchAnalytics({ sector: sectorFilter, severity: severityFilter })
      .then(res => setData(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [sectorFilter, severityFilter]);

  const SEVERITY_COLORS: Record<string, string> = {
    critical: '#FB7185',
    high: '#F43F5E',
    medium: '#FBBF24',
    low: '#34D399',
  };

  const STATUS_COLORS: Record<string, string> = {
    open: '#FB7185',
    investigating: '#FBBF24',
    contained: '#A78BFA',
    resolved: '#34D399',
    false_positive: '#91A6C4'
  };

  const formatSeverityPie = (dict: Record<string, number>) => {
    return Object.entries(dict).map(([name, value]) => ({
      name: name.toUpperCase(),
      value,
      color: SEVERITY_COLORS[name.toLowerCase()] || '#3B82F6'
    }));
  };

  const formatStatusPie = (dict: Record<string, number>) => {
    return Object.entries(dict).map(([name, value]) => ({
      name: name.replace('_', ' ').toUpperCase(),
      value,
      color: STATUS_COLORS[name.toLowerCase()] || '#3B82F6'
    }));
  };

  const formatCategories = (dict: Record<string, number>) => {
    return Object.entries(dict).map(([category, count]) => ({
      category,
      count
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#EAF2FF] tracking-tight">Security Analytics & Telemetry Metrics</h2>
          <p className="text-xs text-[#91A6C4] mt-0.5">
            Aggregated infrastructure threat telemetry, detection distribution, and risk scoring trends
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-[#91A6C4]">
            <Filter className="w-3.5 h-3.5" />
            <span>Sector:</span>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="bg-[#0B1B30] border border-[#203651] rounded-lg px-2.5 py-1.5 text-xs text-[#EAF2FF] focus:outline-none focus:border-[#3B82F6] cursor-pointer"
            >
              <option value="all">All Sectors</option>
              <option value="Energy">Energy</option>
              <option value="Water & Waste">Water & Waste</option>
              <option value="IT & Cloud">IT & Cloud</option>
              <option value="Communications">Communications</option>
              <option value="Transportation">Transportation</option>
            </select>
          </div>

          <button
            onClick={loadData}
            className="p-1.5 rounded-lg bg-[#0B1B30] hover:bg-[#10243D] border border-[#203651] text-[#91A6C4] hover:text-[#EAF2FF] transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading || !data ? (
        <div className="p-24 text-center text-[#91A6C4] bg-[#0B1B30] rounded-2xl border border-[#203651]">
          <div className="w-8 h-8 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs">Computing real-time analytics aggregation...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top Row: Threat Events Over Time */}
          <div className="p-5 rounded-2xl bg-[#0B1B30] border border-[#203651] shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#203651]">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#3B82F6]" />
                <h3 className="text-sm font-bold text-[#EAF2FF]">Telemetry Ingestion & Anomalous Bursts Over Time</h3>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-[#3B82F6]">
                  <span className="w-2 h-2 rounded-full bg-[#3B82F6]" /> Baseline Packets/min
                </span>
                <span className="flex items-center gap-1.5 text-[#FB7185]">
                  <span className="w-2 h-2 rounded-full bg-[#FB7185]" /> Anomalous Bursts
                </span>
              </div>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.events_over_time} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorBaseline" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorAnomaly" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="5%" stopColor="#FB7185" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#FB7185" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#203651" />
                  <XAxis dataKey="time" stroke="#91A6C4" fontSize={11} />
                  <YAxis stroke="#91A6C4" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#08172A', borderColor: '#203651', borderRadius: '8px', fontSize: '12px' }}
                    itemStyle={{ color: '#EAF2FF' }}
                  />
                  <Area type="monotone" dataKey="baseline_traffic" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorBaseline)" name="Baseline Telemetry" />
                  <Area type="monotone" dataKey="anomalous_events" stroke="#FB7185" strokeWidth={2} fillOpacity={1} fill="url(#colorAnomaly)" name="Flagged Anomalies" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Middle Row: Detection Categories & Asset Risk Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Detection Categories Bar Chart */}
            <div className="p-5 rounded-2xl bg-[#0B1B30] border border-[#203651] shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-[#EAF2FF] pb-2 border-b border-[#203651]">
                Detection Rules Trigger Distribution
              </h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={formatCategories(data.detection_categories)} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#203651" horizontal={false} />
                    <XAxis type="number" stroke="#91A6C4" fontSize={10} />
                    <YAxis dataKey="category" type="category" stroke="#91A6C4" fontSize={10} width={120} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#08172A', borderColor: '#203651', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: '#EAF2FF' }}
                    />
                    <Bar dataKey="count" fill="#3B82F6" radius={[0, 4, 4, 0]} name="Trigger Count" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Asset Risk Distribution */}
            <div className="p-5 rounded-2xl bg-[#0B1B30] border border-[#203651] shadow-xl space-y-4">
              <h3 className="text-sm font-bold text-[#EAF2FF] pb-2 border-b border-[#203651]">
                Critical Infrastructure Risk Scores (0-100)
              </h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.asset_risk_distribution} margin={{ top: 5, right: 20, left: -10, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#203651" />
                    <XAxis dataKey="name" stroke="#91A6C4" fontSize={10} angle={-25} textAnchor="end" interval={0} />
                    <YAxis stroke="#91A6C4" fontSize={10} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#08172A', borderColor: '#203651', borderRadius: '8px', fontSize: '12px' }}
                      itemStyle={{ color: '#EAF2FF' }}
                    />
                    <Bar 
                      dataKey="risk_score" 
                      fill="#FBBF24" 
                      radius={[4, 4, 0, 0]}
                      name="Evaluated Cyber Risk"
                    >
                      {data.asset_risk_distribution.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.risk_score > 60 ? '#FB7185' : entry.risk_score > 30 ? '#FBBF24' : '#34D399'} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom Row: Incidents by Severity & Incident Status Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Severity Pie */}
            <div className="p-5 rounded-2xl bg-[#0B1B30] border border-[#203651] shadow-xl space-y-3 flex flex-col justify-between">
              <h3 className="text-xs font-bold text-[#EAF2FF] uppercase tracking-wider pb-2 border-b border-[#203651]">
                Incidents by Severity
              </h3>
              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={formatSeverityPie(data.incidents_by_severity)}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {formatSeverityPie(data.incidents_by_severity).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#08172A', borderColor: '#203651', borderRadius: '8px', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] text-[#91A6C4]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FB7185]" /> Critical/High</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FBBF24]" /> Medium</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#34D399]" /> Low</span>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="p-5 rounded-2xl bg-[#0B1B30] border border-[#203651] shadow-xl space-y-3 flex flex-col justify-between">
              <h3 className="text-xs font-bold text-[#EAF2FF] uppercase tracking-wider pb-2 border-b border-[#203651]">
                Incident Status Breakdown
              </h3>
              <div className="h-44 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={formatStatusPie(data.incident_status_breakdown)}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {formatStatusPie(data.incident_status_breakdown).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#08172A', borderColor: '#203651', borderRadius: '8px', fontSize: '11px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] text-[#91A6C4]">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FB7185]" /> Open</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#FBBF24]" /> Investigating</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#34D399]" /> Contained</span>
              </div>
            </div>

            {/* Response Workflow Outcomes */}
            <div className="p-5 rounded-2xl bg-[#0B1B30] border border-[#203651] shadow-xl space-y-4 flex flex-col justify-between">
              <h3 className="text-xs font-bold text-[#EAF2FF] uppercase tracking-wider pb-2 border-b border-[#203651]">
                Containment Outcomes
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#10243D] border border-[#203651]">
                  <span className="text-[#91A6C4]">Completed Directives</span>
                  <span className="font-mono font-bold text-[#34D399]">{data.response_outcomes.completed || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#10243D] border border-[#203651]">
                  <span className="text-[#91A6C4]">Approved (Pending Run)</span>
                  <span className="font-mono font-bold text-[#A78BFA]">{data.response_outcomes.approved || 0}</span>
                </div>
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-[#10243D] border border-[#203651]">
                  <span className="text-[#91A6C4]">Awaiting Analyst</span>
                  <span className="font-mono font-bold text-[#FBBF24]">{data.response_outcomes.proposed || 0}</span>
                </div>
              </div>
              <div className="text-[10px] text-center text-[#627D98] pt-1">
                Derived directly from backend session state
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
