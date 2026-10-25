import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  ShieldAlert, 
  Cpu, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  RefreshCw,
  Layers,
  Terminal,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { fetchIncidents, fetchIncidentDetail, triggerAIAnalysis } from '../api';
import { Incident, AIAnalysisReport } from '../types';

interface AIAnalysisViewProps {
  onNavigateToResponse: (incidentId: string) => void;
  onShowToast: (message: string, type?: 'success' | 'warning' | 'info') => void;
}

export const AIAnalysisView: React.FC<AIAnalysisViewProps> = ({
  onNavigateToResponse,
  onShowToast
}) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('');
  const [incidentDetail, setIncidentDetail] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  useEffect(() => {
    fetchIncidents()
      .then(res => {
        setIncidents(res);
        if (res.length > 0) {
          setSelectedIncidentId(res[0].id);
        }
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (!selectedIncidentId) return;
    setLoading(true);
    fetchIncidentDetail(selectedIncidentId)
      .then(res => setIncidentDetail(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [selectedIncidentId]);

  const handleReanalyze = async () => {
    if (!incidentDetail) return;
    setAnalyzing(true);
    try {
      const report = await triggerAIAnalysis(incidentDetail.id);
      setIncidentDetail(prev => prev ? { ...prev, analysis: report } : null);
      onShowToast(`ARC Intelligence completed structured assessment for ${incidentDetail.id}`, 'success');
    } catch (err) {
      onShowToast('Analysis generation failed', 'warning');
    } finally {
      setAnalyzing(false);
    }
  };

  const analysis: AIAnalysisReport | undefined = incidentDetail?.analysis;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#A78BFA]/20 border border-[#A78BFA]/40 flex items-center justify-center text-[#A78BFA]">
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-bold text-[#EAF2FF] tracking-tight">ARC Intelligence Engine</h2>
          </div>
          <p className="text-xs text-[#91A6C4] mt-0.5">
            Automated structured threat reasoning, MITRE ATT&CK mapping, and containment recommendations
          </p>
        </div>

        {/* Incident Selector */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-[#91A6C4] whitespace-nowrap">Target Incident:</span>
          <select
            value={selectedIncidentId}
            onChange={(e) => setSelectedIncidentId(e.target.value)}
            className="bg-[#0B1B30] border border-[#203651] rounded-lg px-3 py-1.5 text-xs text-[#EAF2FF] focus:outline-none focus:border-[#A78BFA] cursor-pointer max-w-xs truncate"
          >
            {incidents.map(inc => (
              <option key={inc.id} value={inc.id}>
                {inc.id} — {inc.title.slice(0, 35)}...
              </option>
            ))}
          </select>

          <button
            onClick={handleReanalyze}
            disabled={analyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#A78BFA]/20 hover:bg-[#A78BFA]/30 border border-[#A78BFA]/40 text-[#A78BFA] text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
            <span>{analyzing ? 'Reasoning...' : 'Re-Analyze'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-20 text-center text-[#91A6C4] bg-[#0B1B30] rounded-2xl border border-[#203651]">
          <div className="w-8 h-8 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs">Accessing ARC Intelligence neural telemetry cache...</span>
        </div>
      ) : incidentDetail && analysis ? (
        <div className="space-y-6">
          {/* Intelligence Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#0B1B30] via-[#10243D] to-[#0B1B30] border border-[#A78BFA]/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#A78BFA]">{incidentDetail.id}</span>
                <span className="text-xs text-[#91A6C4]">•</span>
                <span className="text-xs font-semibold text-[#EAF2FF]">{incidentDetail.title}</span>
              </div>
              <p className="text-xs text-[#91A6C4] mt-1">
                Affected: <strong className="text-[#EAF2FF]">{incidentDetail.primary_asset_name}</strong> • Engine Mode: <strong className="text-[#34D399] font-mono">{analysis.mode}</strong>
              </p>
            </div>

            <button
              onClick={() => onNavigateToResponse(incidentDetail.id)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-900/30 transition-all cursor-pointer self-start md:self-auto"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Authorize Containment Action</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* 9 Required Fields in a Rich, Professional SOC Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Core Reasoning */}
            <div className="lg:col-span-2 space-y-6">
              {/* Field 1: Incident Summary */}
              <div className="p-5 rounded-2xl bg-[#0B1B30] border border-[#203651] shadow-lg space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#A78BFA] uppercase tracking-wider">
                  <Activity className="w-4 h-4 text-[#A78BFA]" />
                  <span>1. Incident Threat Summary</span>
                </div>
                <p className="text-xs text-[#EAF2FF] leading-relaxed">
                  {analysis.incident_summary}
                </p>
              </div>

              {/* Field 2 & 3: Evidence Observed & Detection Trigger Reason */}
              <div className="p-5 rounded-2xl bg-[#0B1B30] border border-[#203651] shadow-lg space-y-4">
                <div className="space-y-2">
                  <div className="text-xs font-semibold text-[#34D399] uppercase tracking-wider flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[#34D399]" />
                    <span>2. Evidence Observed</span>
                  </div>
                  <div className="space-y-1.5">
                    {analysis.evidence_observed.map((ev, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-[#10243D]/70 border border-[#203651] text-xs text-[#91A6C4] flex items-start gap-2">
                        <span className="text-[#34D399] font-bold">[{i + 1}]</span>
                        <span className="text-[#EAF2FF]">{ev}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#203651] space-y-1">
                  <span className="text-[10px] text-[#A78BFA] uppercase font-bold">
                    3. Why Detection Triggered
                  </span>
                  <p className="text-xs text-[#91A6C4] leading-relaxed">
                    {analysis.detection_trigger_reason}
                  </p>
                </div>
              </div>

              {/* Field 7: Recommended Investigation Steps */}
              <div className="p-5 rounded-2xl bg-[#0B1B30] border border-[#203651] shadow-lg space-y-3">
                <div className="text-xs font-semibold text-[#3B82F6] uppercase tracking-wider flex items-center gap-2">
                  <Compass className="w-4 h-4 text-[#3B82F6]" />
                  <span>7. Recommended Investigation Steps</span>
                </div>
                <div className="space-y-2">
                  {analysis.recommended_investigation_steps.map((st, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-[#10243D]/50 border border-[#203651] text-xs text-[#91A6C4] flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-blue-500/20 text-[#3B82F6] text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="text-[#EAF2FF]">{st}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Field 8: Recommended Containment Options */}
              <div className="p-5 rounded-2xl bg-[#0B1B30] border border-amber-500/30 shadow-lg space-y-3">
                <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  <span>8. Recommended Containment Options</span>
                </div>
                <div className="space-y-2">
                  {analysis.recommended_containment_options.map((ct, i) => (
                    <div key={i} className="p-2.5 rounded-lg bg-[#10243D]/50 border border-amber-500/20 text-xs text-[#91A6C4] flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        ✓
                      </span>
                      <span className="text-[#EAF2FF]">{ct}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right 1 Col: MITRE ATT&CK, Severity, Affected Assets, Confidence */}
            <div className="space-y-6">
              {/* Field 4: Potential Attack Technique */}
              <div className="p-5 rounded-2xl bg-[#0B1B30] border border-[#203651] shadow-lg space-y-2">
                <span className="text-[10px] text-[#A78BFA] uppercase font-bold tracking-wider block">
                  4. MITRE ATT&CK Classification
                </span>
                <div className="p-3 rounded-xl bg-[#10243D] border border-[#203651]">
                  <div className="font-mono text-xs font-bold text-[#EAF2FF] leading-snug">
                    {analysis.attack_technique}
                  </div>
                  <div className="text-[10px] text-[#34D399] mt-2 flex items-center gap-1">
                    <span>Mapped to Industrial Control Systems (ICS) matrix</span>
                  </div>
                </div>
              </div>

              {/* Field 5: Severity Assessment */}
              <div className="p-5 rounded-2xl bg-[#0B1B30] border border-[#203651] shadow-lg space-y-2">
                <span className="text-[10px] text-[#FB7185] uppercase font-bold tracking-wider block">
                  5. Severity & Risk Assessment
                </span>
                <p className="text-xs text-[#91A6C4] leading-relaxed">
                  {analysis.severity_assessment}
                </p>
              </div>

              {/* Field 6: Potentially Affected Assets */}
              <div className="p-5 rounded-2xl bg-[#0B1B30] border border-[#203651] shadow-lg space-y-3">
                <span className="text-[10px] text-[#91A6C4] uppercase font-bold tracking-wider block">
                  6. Potentially Affected Assets
                </span>
                <div className="space-y-1.5">
                  {analysis.potentially_affected_assets.map((assetName, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-[#10243D] border border-[#203651] text-xs text-[#EAF2FF] flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      <span>{assetName}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Field 9: Confidence Level and Limitations */}
              <div className="p-5 rounded-2xl bg-[#0B1B30] border border-[#203651] shadow-lg space-y-3">
                <span className="text-[10px] text-[#34D399] uppercase font-bold tracking-wider block">
                  9. Confidence & Limitations
                </span>
                <div className="space-y-2 text-xs">
                  <div>
                    <span className="text-[#91A6C4] block text-[11px]">Confidence Metric:</span>
                    <span className="text-[#34D399] font-bold">{analysis.confidence_level}</span>
                  </div>
                  <div>
                    <span className="text-[#91A6C4] block text-[11px]">Telemetry Limitation:</span>
                    <p className="text-[#91A6C4] italic text-[11px] leading-relaxed mt-0.5">
                      {analysis.limitations}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-16 text-center text-[#91A6C4] bg-[#0B1B30] rounded-2xl border border-[#203651]">
          No intelligence analysis report available for this incident. Click "Re-Analyze" above to generate.
        </div>
      )}
    </div>
  );
};
