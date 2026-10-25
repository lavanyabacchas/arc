import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ArrowRight, 
  RotateCw, 
  Play, 
  Check, 
  Terminal,
  ShieldAlert,
  Info
} from 'lucide-react';
import { fetchResponses, approveResponse, executeSimulatedResponse } from '../api';
import { ResponseAction } from '../types';

interface ResponseCenterViewProps {
  onShowToast: (message: string, type?: 'success' | 'warning' | 'info') => void;
  onRefreshAll?: () => void;
}

export const ResponseCenterView: React.FC<ResponseCenterViewProps> = ({
  onShowToast,
  onRefreshAll
}) => {
  const [responses, setResponses] = useState<ResponseAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [confirmModalAction, setConfirmModalAction] = useState<ResponseAction | null>(null);

  const loadResponses = () => {
    setLoading(true);
    fetchResponses()
      .then(res => setResponses(res))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadResponses();
  }, []);

  const handleApprove = async (actionId: string) => {
    setProcessingId(actionId);
    try {
      await approveResponse(actionId, 'Alex Mercer (Lead SOC Analyst)');
      onShowToast(`Response action ${actionId} approved`, 'success');
      loadResponses();
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      onShowToast('Approval failed', 'warning');
    } finally {
      setProcessingId(null);
    }
  };

  const handleExecute = async (action: ResponseAction) => {
    setConfirmModalAction(null);
    setProcessingId(action.id);
    try {
      const res = await executeSimulatedResponse(action.id);
      onShowToast(`Simulated response executed: ${action.title}`, 'success');
      loadResponses();
      if (onRefreshAll) onRefreshAll();
    } catch (err) {
      onShowToast('Execution failed', 'warning');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Simulation Safety Banner */}
      <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-300 uppercase tracking-wider block">
              SIMULATED RESPONSE — NO REAL INFRASTRUCTURE AFFECTED
            </span>
            <p className="text-[11px] text-[#91A6C4] mt-0.5">
              All containment directives operate exclusively within the sandbox runtime environment. No live power grids, municipal water systems, or real networks are touched.
            </p>
          </div>
        </div>

        <button
          onClick={loadResponses}
          className="p-1.5 rounded-lg bg-[#10243D] text-[#91A6C4] hover:text-[#EAF2FF] border border-[#203651] transition-colors cursor-pointer"
        >
          <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Header & Workflow Pipeline Indicator */}
      <div className="p-5 rounded-2xl bg-[#0B1B30] border border-[#203651] shadow-xl space-y-4">
        <div>
          <h2 className="text-xl font-bold text-[#EAF2FF] tracking-tight">Incident Response & Containment Center</h2>
          <p className="text-xs text-[#91A6C4] mt-0.5">
            Human-in-the-loop authorization workflow for critical infrastructure incident containment
          </p>
        </div>

        {/* Workflow Stages */}
        <div className="pt-2">
          <div className="text-[10px] uppercase font-bold text-[#627D98] tracking-wider mb-2">
            Authorization Pipeline
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-lg bg-[#10243D] border border-[#203651] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
              <span className="font-semibold text-[#EAF2FF]">1. Proposed</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#10243D] border border-[#203651] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span className="font-semibold text-[#EAF2FF]">2. Analyst Review</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#10243D] border border-[#203651] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-400" />
              <span className="font-semibold text-[#EAF2FF]">3. Approved</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#10243D] border border-[#203651] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#34D399]" />
              <span className="font-semibold text-[#EAF2FF]">4. Simulated Execution</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Actions List */}
      <div className="space-y-4">
        <div className="text-xs font-semibold text-[#91A6C4] uppercase tracking-wider flex items-center justify-between px-1">
          <span>Containment Directives ({responses.length})</span>
          <span className="text-[11px] text-[#34D399]">Safe Simulation Runtime</span>
        </div>

        {loading ? (
          <div className="p-16 text-center text-xs text-[#91A6C4] bg-[#0B1B30] rounded-xl border border-[#203651]">
            Loading response registry...
          </div>
        ) : responses.length === 0 ? (
          <div className="p-12 text-center text-xs text-[#91A6C4] bg-[#0B1B30] rounded-xl border border-[#203651]">
            No proposed response actions currently active.
          </div>
        ) : (
          responses.map((action) => {
            const isApproved = action.approval_status === 'approved';
            const isCompleted = action.execution_status === 'completed';

            return (
              <div 
                key={action.id}
                className={`p-5 rounded-2xl bg-[#0B1B30] border transition-all shadow-xl space-y-4 ${
                  isCompleted ? 'border-emerald-500/30' :
                  isApproved ? 'border-purple-500/40' : 'border-[#203651]'
                }`}
              >
                {/* Action Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#3B82F6] px-2 py-0.5 rounded bg-[#10243D] border border-[#203651]">
                      {action.id}
                    </span>
                    <span className="text-xs text-[#91A6C4] font-mono">
                      Ref: {action.incident_id}
                    </span>
                    <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      isCompleted ? 'bg-emerald-500/20 text-[#34D399] border border-emerald-500/30' :
                      isApproved ? 'bg-purple-500/20 text-[#A78BFA] border border-purple-500/30' :
                      'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {isCompleted ? 'Simulation Completed' : isApproved ? 'Approved for Simulation' : 'Awaiting Human Approval'}
                    </span>
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center gap-2">
                    {!isApproved && !isCompleted && (
                      <button
                        onClick={() => handleApprove(action.id)}
                        disabled={processingId === action.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-900/30 transition-all cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>{processingId === action.id ? 'Approving...' : 'Approve Response'}</span>
                      </button>
                    )}

                    {isApproved && !isCompleted && (
                      <button
                        onClick={() => setConfirmModalAction(action)}
                        disabled={processingId === action.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-900/30 transition-all cursor-pointer disabled:opacity-50 animate-pulse"
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>Execute Simulated Response</span>
                      </button>
                    )}

                    {isCompleted && (
                      <span className="flex items-center gap-1.5 text-xs text-[#34D399] font-medium bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                        <CheckCircle className="w-4 h-4" />
                        <span>Simulated Containment Active</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Title & Details */}
                <div>
                  <h3 className="text-base font-bold text-[#EAF2FF]">{action.title}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-[#10243D]/60 border border-[#203651] space-y-1">
                    <span className="text-[10px] text-[#91A6C4] uppercase font-bold">1. Technical Rationale</span>
                    <p className="text-[#EAF2FF] leading-relaxed">{action.rationale}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#10243D]/60 border border-[#203651] space-y-1">
                    <span className="text-[10px] text-[#34D399] uppercase font-bold">2. Expected Effect</span>
                    <p className="text-[#EAF2FF] leading-relaxed">{action.expected_effect}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#10243D]/60 border border-[#203651] space-y-1">
                    <span className="text-[10px] text-amber-400 uppercase font-bold">3. Operational Impact</span>
                    <p className="text-[#EAF2FF] leading-relaxed">{action.operational_impact}</p>
                  </div>
                </div>

                {/* Execution Details Terminal Box (if completed) */}
                {isCompleted && action.simulated_execution_details && (
                  <div className="p-3 rounded-xl bg-[#08172A] border border-[#203651] font-mono text-xs text-[#34D399] flex items-start gap-2">
                    <Terminal className="w-4 h-4 text-[#3B82F6] flex-shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] text-[#91A6C4] uppercase block">Simulation Console Execution Log:</span>
                      <p className="mt-0.5">{action.simulated_execution_details}</p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Modal for Simulated Response Execution */}
      {confirmModalAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-[#0B1B30] border border-amber-500/40 rounded-2xl shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#EAF2FF]">Confirm Simulated Containment Execution</h3>
                <p className="text-xs text-[#91A6C4]">Incident {confirmModalAction.incident_id}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#10243D] border border-[#203651] space-y-2 text-xs">
              <div className="font-semibold text-[#EAF2FF]">{confirmModalAction.title}</div>
              <p className="text-[#91A6C4]">{confirmModalAction.expected_effect}</p>
              <div className="text-[11px] text-amber-400 pt-1 border-t border-[#203651]">
                Operational Impact: {confirmModalAction.operational_impact}
              </div>
            </div>

            <p className="text-xs text-[#91A6C4] italic">
              Notice: Executing will isolate the simulated asset in the demo runtime environment, update the incident to 'contained', and log an append-only audit event. No live physical infrastructure is affected.
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setConfirmModalAction(null)}
                className="px-4 py-2 rounded-lg bg-[#10243D] hover:bg-[#132b49] text-[#91A6C4] text-xs font-semibold border border-[#203651] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleExecute(confirmModalAction)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-lg shadow-emerald-900/30 cursor-pointer"
              >
                Confirm & Execute Simulation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
