import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShieldAlert, 
  Clock, 
  User, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRight, 
  Send, 
  Activity, 
  Cpu, 
  FileText,
  ChevronRight,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { fetchIncidents, fetchIncidentDetail, triggerAIAnalysis, updateIncidentStatus, addAnalystNote } from '../api';
import { Incident } from '../types';

interface InvestigationsViewProps {
  initialIncidentId?: string;
  onNavigateToResponse?: (incidentId: string) => void;
  onShowToast: (message: string, type?: 'success' | 'warning' | 'info') => void;
}

export const InvestigationsView: React.FC<InvestigationsViewProps> = ({
  initialIncidentId,
  onNavigateToResponse,
  onShowToast
}) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(initialIncidentId || null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadIncidents = () => {
    setLoadingList(true);
    fetchIncidents({ status: statusFilter })
      .then(res => {
        setIncidents(res);
        if (!selectedId && res.length > 0) {
          setSelectedId(res[0].id);
        } else if (selectedId && !res.find(i => i.id === selectedId) && res.length > 0) {
          setSelectedId(res[0].id);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoadingList(false));
  };

  useEffect(() => {
    loadIncidents();
  }, [statusFilter]);

  useEffect(() => {
    if (initialIncidentId) {
      setSelectedId(initialIncidentId);
    }
  }, [initialIncidentId]);

  useEffect(() => {
    if (!selectedId) {
      setSelectedIncident(null);
      return;
    }
    setLoadingDetail(true);
    fetchIncidentDetail(selectedId)
      .then(res => setSelectedIncident(res))
      .catch(err => console.error(err))
      .finally(() => setLoadingDetail(false));
  }, [selectedId]);

  const handleRunAIAnalysis = async () => {
    if (!selectedIncident) return;
    setAnalyzingAI(true);
    try {
      const report = await triggerAIAnalysis(selectedIncident.id);
      setSelectedIncident(prev => prev ? { ...prev, analysis: report } : null);
      onShowToast(`ARC Intelligence completed assessment for ${selectedIncident.id}`, 'success');
      loadIncidents();
    } catch (err) {
      onShowToast('Failed to generate AI analysis', 'warning');
    } finally {
      setAnalyzingAI(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!selectedIncident) return;
    try {
      await updateIncidentStatus(selectedIncident.id, newStatus);
      setSelectedIncident(prev => prev ? { ...prev, status: newStatus as any } : null);
      onShowToast(`Incident status updated to '${newStatus}'`, 'info');
      loadIncidents();
    } catch (err) {
      onShowToast('Failed to update status', 'warning');
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedIncident) return;
    try {
      const res = await addAnalystNote(selectedIncident.id, newNoteText);
      setSelectedIncident(prev => prev ? { ...prev, analyst_notes: res.notes } : null);
      setNewNoteText('');
      onShowToast('Analyst note saved to audit record', 'info');
    } catch (err) {
      onShowToast('Failed to save note', 'warning');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#EAF2FF] tracking-tight">Security Incident Investigation</h2>
          <p className="text-xs text-[#91A6C4] mt-0.5">
            Deep forensic triage, telemetry correlation, attack timeline analysis, and containment controls
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#0B1B30] border border-[#203651] rounded-lg px-3 py-1.5 text-xs text-[#EAF2FF] focus:outline-none focus:border-[#3B82F6] cursor-pointer"
          >
            <option value="all">All Incident Statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="contained">Contained</option>
            <option value="resolved">Resolved</option>
            <option value="false_positive">False Positive</option>
          </select>

          <button
            onClick={loadIncidents}
            className="p-1.5 rounded-lg bg-[#0B1B30] hover:bg-[#10243D] border border-[#203651] text-[#91A6C4] hover:text-[#EAF2FF] transition-colors cursor-pointer"
            title="Refresh Incidents"
          >
            <RefreshCw className={`w-4 h-4 ${loadingList ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid: Left Selector List & Right Deep Investigation Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Incident Selector List (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-semibold text-[#91A6C4] uppercase tracking-wider flex items-center justify-between px-1">
            <span>Active Incidents ({incidents.length})</span>
            <span className="text-[10px] text-[#3B82F6]">Select to inspect</span>
          </div>

          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {loadingList ? (
              <div className="p-8 text-center text-xs text-[#91A6C4]">Loading incident queue...</div>
            ) : incidents.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#91A6C4] bg-[#0B1B30] rounded-xl border border-[#203651]">
                No incidents match filter.
              </div>
            ) : (
              incidents.map(inc => {
                const isSelected = selectedId === inc.id;
                return (
                  <div
                    key={inc.id}
                    onClick={() => setSelectedId(inc.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#10243D] border-[#3B82F6] shadow-md shadow-blue-900/20'
                        : 'bg-[#0B1B30] border-[#203651] hover:bg-[#10243D]/60 hover:border-[#3B82F6]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-mono text-[10px] font-bold text-[#3B82F6]">
                        {inc.id}
                      </span>
                      <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        inc.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                        inc.severity === 'high' ? 'bg-rose-500/20 text-rose-400' :
                        inc.severity === 'medium' ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'
                      }`}>
                        {inc.severity}
                      </span>
                    </div>

                    <h4 className="text-xs font-semibold text-[#EAF2FF] line-clamp-2 leading-tight">
                      {inc.title}
                    </h4>

                    <div className="mt-2.5 flex items-center justify-between text-[11px] text-[#91A6C4]">
                      <span className="truncate max-w-[120px]">{inc.primary_asset_name || inc.primary_asset_id}</span>
                      <span className="capitalize px-1.5 py-0.2 rounded bg-[#08172A] text-[#EAF2FF] text-[10px]">
                        {inc.status.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Deep Investigation Workspace (8 cols) */}
        <div className="lg:col-span-8">
          {loadingDetail ? (
            <div className="p-20 text-center text-[#91A6C4] bg-[#0B1B30] rounded-2xl border border-[#203651]">
              <div className="w-8 h-8 border-2 border-[#3B82F6] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <span className="text-xs">Loading incident investigation data...</span>
            </div>
          ) : selectedIncident ? (
            <div className="space-y-6">
              {/* Incident Header Card */}
              <div className="p-5 rounded-2xl bg-[#0B1B30] border border-[#203651] shadow-xl space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-[#10243D] text-[#3B82F6] border border-[#203651]">
                      {selectedIncident.id}
                    </span>
                    <span className={`text-xs font-bold uppercase px-2.5 py-1 rounded-lg ${
                      selectedIncident.severity === 'high' ? 'bg-rose-500/20 text-[#FB7185] border border-rose-500/30' :
                      selectedIncident.severity === 'medium' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {selectedIncident.severity} Severity
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#08172A] text-[#EAF2FF] border border-[#203651] capitalize">
                      Status: {selectedIncident.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Action: Jump to response center */}
                    <button
                      onClick={() => onNavigateToResponse && onNavigateToResponse(selectedIncident.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-900/30 transition-all cursor-pointer"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Respond in Response Center</span>
                    </button>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#EAF2FF]">{selectedIncident.title}</h3>
                  <p className="text-xs text-[#91A6C4] mt-1 leading-relaxed">
                    {selectedIncident.description}
                  </p>
                </div>

                {/* Meta details bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-[#203651] text-xs">
                  <div>
                    <span className="text-[#627D98] block text-[10px] uppercase font-semibold">Affected Node</span>
                    <span className="text-[#EAF2FF] font-medium">{selectedIncident.primary_asset_name}</span>
                  </div>
                  <div>
                    <span className="text-[#627D98] block text-[10px] uppercase font-semibold">Risk Score</span>
                    <span className="font-mono font-bold text-rose-400">{selectedIncident.risk_score} / 100</span>
                  </div>
                  <div>
                    <span className="text-[#627D98] block text-[10px] uppercase font-semibold">Assigned Analyst</span>
                    <span className="text-[#EAF2FF] font-medium">{selectedIncident.assigned_analyst}</span>
                  </div>
                  <div>
                    <span className="text-[#627D98] block text-[10px] uppercase font-semibold">Detected UTC</span>
                    <span className="font-mono text-[#91A6C4] text-[11px]">{new Date(selectedIncident.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>

              {/* Investigation Action Controls */}
              <div className="p-4 rounded-xl bg-[#0B1B30] border border-[#203651] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#91A6C4] font-medium">Quick Triage:</span>
                  <button
                    onClick={() => handleStatusChange('investigating')}
                    className="px-2.5 py-1 rounded bg-[#10243D] hover:bg-[#132b49] text-xs font-medium text-[#EAF2FF] border border-[#203651] transition-colors cursor-pointer"
                  >
                    Mark Investigating
                  </button>
                  <button
                    onClick={() => handleStatusChange('resolved')}
                    className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-xs font-medium text-[#34D399] border border-emerald-500/30 transition-colors cursor-pointer"
                  >
                    Mark Resolved
                  </button>
                  <button
                    onClick={() => handleStatusChange('false_positive')}
                    className="px-2.5 py-1 rounded bg-[#10243D] hover:bg-rose-500/10 text-xs font-medium text-[#91A6C4] hover:text-[#FB7185] border border-[#203651] transition-colors cursor-pointer"
                  >
                    False Positive
                  </button>
                </div>

                {/* AI Analysis Trigger Button */}
                <button
                  onClick={handleRunAIAnalysis}
                  disabled={analyzingAI}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#A78BFA]/20 hover:bg-[#A78BFA]/30 border border-[#A78BFA]/40 text-[#A78BFA] text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${analyzingAI ? 'animate-spin' : ''}`} />
                  <span>{analyzingAI ? 'Evaluating Telemetry...' : 'Run ARC AI Analysis'}</span>
                </button>
              </div>

              {/* Evidence Panel & Potential Impact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Evidence Panel */}
                <div className="p-4 rounded-xl bg-[#0B1B30] border border-[#203651] space-y-3">
                  <h4 className="text-xs font-semibold text-[#EAF2FF] uppercase tracking-wider flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#3B82F6]" />
                    <span>Telemetry Evidence</span>
                  </h4>
                  <div className="space-y-2 text-xs">
                    {selectedIncident.evidence && Object.keys(selectedIncident.evidence).length > 0 ? (
                      Object.entries(selectedIncident.evidence).map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between p-2 rounded bg-[#10243D]/60 border border-[#203651]">
                          <span className="text-[#91A6C4] capitalize">{k.replace(/_/g, ' ')}:</span>
                          <span className="font-mono text-[#EAF2FF] font-semibold">
                            {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-[#91A6C4] italic">Telemetry evidence cataloged in telemetry engine.</div>
                    )}
                  </div>
                </div>

                {/* Potential Operational Impact */}
                <div className="p-4 rounded-xl bg-[#0B1B30] border border-[#203651] space-y-3">
                  <h4 className="text-xs font-semibold text-[#FB7185] uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-[#FB7185]" />
                    <span>Potential Critical Impact</span>
                  </h4>
                  <div className="text-xs text-[#91A6C4] space-y-2 leading-relaxed">
                    <p>
                      <strong className="text-[#EAF2FF]">Observed Fact: </strong>
                      High volume egress bursts exceed configured baseline operational envelope.
                    </p>
                    <p>
                      <strong className="text-[#EAF2FF]">Potential Risk: </strong>
                      If adversary exfiltrates internal telemetry schemas or credentials, lateral pivoting could jeopardize downstream sub-controllers in interconnected sectors.
                    </p>
                  </div>
                </div>
              </div>

              {/* Attack Timeline */}
              <div className="p-5 rounded-2xl bg-[#0B1B30] border border-[#203651] space-y-4">
                <h4 className="text-xs font-semibold text-[#EAF2FF] uppercase tracking-wider flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#34D399]" />
                  <span>Chronological Attack & Telemetry Timeline</span>
                </h4>

                <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#203651]">
                  {selectedIncident.timeline.map((item, idx) => (
                    <div key={idx} className="relative group">
                      <span className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full border-2 border-[#0B1B30] ${
                        item.status === 'alert' ? 'bg-[#FB7185] ring-2 ring-rose-500/30' :
                        item.status === 'in_progress' ? 'bg-amber-400 ring-2 ring-amber-500/30' :
                        'bg-[#34D399] ring-2 ring-emerald-500/30'
                      }`} />
                      <div className="text-xs font-semibold text-[#EAF2FF] flex items-center gap-2">
                        <span>{item.title}</span>
                        <span className="text-[10px] font-mono text-[#91A6C4] font-normal">
                          {new Date(item.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-[11px] text-[#91A6C4] mt-0.5 leading-relaxed">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Structured AI Analysis Report (if available) */}
              {selectedIncident.analysis && (
                <div className="p-5 rounded-2xl bg-[#0B1B30] border border-[#A78BFA]/50 ai-card-glow space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-[#203651]">
                    <div className="flex items-center gap-2 text-[#A78BFA]">
                      <Sparkles className="w-5 h-5" />
                      <h4 className="text-sm font-bold text-[#EAF2FF]">ARC Intelligence Threat Report</h4>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-[#A78BFA]">
                      {selectedIncident.analysis.mode}
                    </span>
                  </div>

                  <div className="space-y-3 text-xs">
                    <div>
                      <span className="text-[10px] text-[#91A6C4] uppercase font-bold">Assessment Summary:</span>
                      <p className="text-[#EAF2FF] mt-0.5 leading-relaxed">{selectedIncident.analysis.incident_summary}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-[#10243D] border border-[#203651] space-y-1">
                      <span className="text-[10px] text-[#A78BFA] uppercase font-bold">Attack Technique Identified:</span>
                      <div className="font-mono text-[#EAF2FF]">{selectedIncident.analysis.attack_technique}</div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-[#10243D] border border-[#203651]">
                        <span className="text-[10px] text-[#34D399] uppercase font-bold block mb-1">Recommended Investigation:</span>
                        <ul className="space-y-1 text-[#91A6C4]">
                          {selectedIncident.analysis.recommended_investigation_steps.map((st, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-[#3B82F6] font-bold">•</span>
                              <span>{st}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 rounded-lg bg-[#10243D] border border-[#203651]">
                        <span className="text-[10px] text-amber-400 uppercase font-bold block mb-1">Recommended Containment:</span>
                        <ul className="space-y-1 text-[#91A6C4]">
                          {selectedIncident.analysis.recommended_containment_options.map((ct, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-amber-400 font-bold">•</span>
                              <span>{ct}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="text-[11px] text-[#627D98] pt-2 border-t border-[#203651] flex items-center justify-between">
                      <span>Confidence: <strong className="text-[#34D399]">{selectedIncident.analysis.confidence_level}</strong></span>
                      <span className="italic">{selectedIncident.analysis.limitations}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Analyst Notes Section */}
              <div className="p-5 rounded-2xl bg-[#0B1B30] border border-[#203651] space-y-4">
                <h4 className="text-xs font-semibold text-[#EAF2FF] uppercase tracking-wider flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#3B82F6]" />
                  <span>Analyst Notes & Audit Comments ({selectedIncident.analyst_notes.length})</span>
                </h4>

                <div className="space-y-2.5 max-h-48 overflow-y-auto">
                  {selectedIncident.analyst_notes.map((n, i) => (
                    <div key={i} className="p-3 rounded-xl bg-[#10243D]/60 border border-[#203651] text-xs">
                      <div className="flex items-center justify-between text-[11px] mb-1">
                        <span className="font-semibold text-[#EAF2FF]">{n.author}</span>
                        <span className="text-[#627D98] font-mono">{new Date(n.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <p className="text-[#91A6C4] leading-relaxed">{n.text}</p>
                    </div>
                  ))}
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="flex items-center gap-2 pt-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Add an analyst note to this incident log..."
                    className="flex-1 bg-[#10243D] border border-[#203651] rounded-lg px-3 py-2 text-xs text-[#EAF2FF] placeholder-[#627D98] focus:outline-none focus:border-[#3B82F6]"
                  />
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post</span>
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="p-16 text-center text-[#91A6C4] bg-[#0B1B30] rounded-2xl border border-[#203651]">
              Select an incident from the queue on the left to begin investigation.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
