import React, { useState, useEffect } from 'react';
import { 
  ScrollText, 
  Search, 
  Filter, 
  Lock, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  RefreshCw,
  ShieldAlert,
  User,
  SlidersHorizontal
} from 'lucide-react';
import { fetchAuditLogs } from '../api';
import { AuditEntry } from '../types';

export const AuditLogsView: React.FC = () => {
  const [logs, setLogs] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  const loadLogs = () => {
    setLoading(true);
    fetchAuditLogs({
      search,
      action: actionFilter
    })
      .then(res => setLogs(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadLogs();
  }, [search, actionFilter]);

  const actions = [
    'all',
    'system_boot',
    'incident_created',
    'status_changed',
    'ai_analysis_generated',
    'response_proposed',
    'response_approved',
    'simulated_response_executed',
    'note_added',
    'settings_updated'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#EAF2FF] tracking-tight">Compliance & Forensic Audit Trail</h2>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-[#34D399] border border-emerald-500/30 text-[10px] font-mono flex items-center gap-1 font-semibold">
              <Lock className="w-3 h-3" />
              Append-Only Ledger
            </span>
          </div>
          <p className="text-xs text-[#91A6C4] mt-0.5">
            Immutable SOC telemetry records, analyst interventions, AI assessments, and containment directives
          </p>
        </div>

        <button
          onClick={loadLogs}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0B1B30] hover:bg-[#10243D] border border-[#203651] text-xs text-[#91A6C4] hover:text-[#EAF2FF] transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Ledger</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="p-4 rounded-xl bg-[#0B1B30] border border-[#203651] flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search className="w-4 h-4 text-[#91A6C4] absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit details, entity ID, or actor..."
            className="w-full bg-[#10243D] border border-[#203651] rounded-lg pl-9 pr-3 py-2 text-xs text-[#EAF2FF] placeholder-[#627D98] focus:outline-none focus:border-[#3B82F6]"
          />
        </div>

        <div className="flex items-center gap-2 text-xs text-[#91A6C4]">
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filter Action:</span>
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-[#10243D] border border-[#203651] rounded-lg px-2.5 py-1.5 text-xs text-[#EAF2FF] focus:outline-none focus:border-[#3B82F6] cursor-pointer"
          >
            {actions.map(act => (
              <option key={act} value={act}>
                {act === 'all' ? 'All Operations' : act.replace(/_/g, ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl bg-[#0B1B30] border border-[#203651] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#203651] bg-[#10243D]/50 text-[#91A6C4] text-[10px] uppercase font-semibold">
                <th className="py-3 px-4">Audit ID</th>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action Type</th>
                <th className="py-3 px-4">Entity</th>
                <th className="py-3 px-4">Details</th>
                <th className="py-3 px-4">Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#203651]/40">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#91A6C4]">
                    Loading audit trail...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-[#91A6C4]">
                    No audit records match the current filter.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#10243D]/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-semibold text-[#3B82F6]">
                      {log.id}
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#91A6C4] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td className="py-3 px-4 font-medium text-[#EAF2FF] whitespace-nowrap">
                      {log.actor}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#10243D] text-[#A78BFA] border border-[#203651]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[#91A6C4]">
                      {log.entity_type}:{log.entity_id}
                    </td>
                    <td className="py-3 px-4 text-[#EAF2FF] max-w-md leading-relaxed">
                      {log.details}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        log.outcome === 'success' ? 'bg-emerald-500/20 text-[#34D399]' :
                        log.outcome === 'warning' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/10 text-blue-400'
                      }`}>
                        {log.outcome}
                      </span>
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
