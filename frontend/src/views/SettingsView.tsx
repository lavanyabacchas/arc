import React, { useState, useEffect } from 'react';
import { 
  Settings as SettingsIcon, 
  Sliders, 
  Sparkles, 
  RotateCcw, 
  Save, 
  CheckCircle, 
  AlertTriangle,
  Cpu,
  Layers,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { fetchSettings, updateSettings } from '../api';

interface SettingsViewProps {
  onResetDemo: () => void;
  isResetting: boolean;
  onShowToast: (message: string, type?: 'success' | 'warning' | 'info') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  onResetDemo,
  isResetting,
  onShowToast
}) => {
  const [settingsData, setSettingsData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [thresholds, setThresholds] = useState({
    outbound_bytes_kb: 10000,
    outbound_freq_per_min: 80,
    failed_auth_limit: 5
  });

  const loadSettings = () => {
    setLoading(true);
    fetchSettings()
      .then(res => {
        setSettingsData(res);
        if (res.thresholds) {
          setThresholds({
            outbound_bytes_kb: res.thresholds.outbound_bytes_kb || 10000,
            outbound_freq_per_min: res.thresholds.outbound_freq_per_min || 80,
            failed_auth_limit: res.thresholds.failed_auth_limit || 5
          });
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSaveThresholds = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSettings(thresholds);
      onShowToast('Detection thresholds reconfigured successfully', 'success');
      loadSettings();
    } catch (err) {
      onShowToast('Failed to save settings', 'warning');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-[#EAF2FF] tracking-tight">System & Detection Engine Settings</h2>
        <p className="text-xs text-[#91A6C4] mt-0.5">
          Configure heuristic thresholds, machine learning sensitivity, and simulation parameters
        </p>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-[#91A6C4] bg-[#0B1B30] rounded-xl border border-[#203651]">
          Loading system configuration...
        </div>
      ) : (
        <div className="space-y-6">
          {/* AI Engine Status Card */}
          <div className="p-5 rounded-2xl bg-[#0B1B30] border border-[#A78BFA]/30 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#203651]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#A78BFA]/20 text-[#A78BFA]">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#EAF2FF]">ARC Intelligence Engine Mode</h3>
                  <p className="text-[11px] text-[#91A6C4]">Current LLM and rule-based inference configuration</p>
                </div>
              </div>
              <span className={`text-[10px] font-mono px-2.5 py-1 rounded-full border ${
                settingsData?.is_llm_configured ? 'bg-purple-500/20 text-[#A78BFA] border-purple-500/30' : 'bg-blue-500/15 text-[#3B82F6] border-blue-500/30'
              }`}>
                {settingsData?.is_llm_configured ? 'Cloud LLM Active' : 'Deterministic Mode'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#10243D] border border-[#203651] space-y-2">
              <div className="text-xs text-[#EAF2FF] font-medium">
                Active Provider: <span className="text-[#A78BFA] font-mono">{settingsData?.ai_engine_status}</span>
              </div>
              <p className="text-[11px] text-[#91A6C4] leading-relaxed">
                When an external LLM API key (GEMINI_API_KEY) is provided in the backend environment, ARC connects to cloud models. Otherwise, ARC's built-in high-precision deterministic cybersecurity engine analyzes synthetic telemetry and maps attack techniques locally without external dependencies.
              </p>
            </div>
          </div>

          {/* Heuristic Detection Thresholds Form */}
          <form onSubmit={handleSaveThresholds} className="p-5 rounded-2xl bg-[#0B1B30] border border-[#203651] shadow-xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-[#203651]">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-[#3B82F6]/20 text-[#3B82F6]">
                  <Sliders className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#EAF2FF]">Detection Engine Thresholds</h3>
                  <p className="text-[11px] text-[#91A6C4]">Define behavioral limits for automated anomaly generation</p>
                </div>
              </div>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-semibold shadow-md shadow-blue-900/30 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving...' : 'Apply Changes'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-[#10243D] border border-[#203651] space-y-2">
                <label className="text-xs font-semibold text-[#EAF2FF] block">
                  Outbound Spike Threshold
                </label>
                <span className="text-[10px] text-[#91A6C4] block">KB transferred before flagging</span>
                <input
                  type="number"
                  value={thresholds.outbound_bytes_kb}
                  onChange={(e) => setThresholds({ ...thresholds, outbound_bytes_kb: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#08172A] border border-[#203651] rounded-lg px-3 py-2 text-xs font-mono text-[#EAF2FF] focus:outline-none focus:border-[#3B82F6]"
                />
                <span className="text-[10px] text-[#34D399] font-mono">Current: {thresholds.outbound_bytes_kb.toLocaleString()} KB</span>
              </div>

              <div className="p-4 rounded-xl bg-[#10243D] border border-[#203651] space-y-2">
                <label className="text-xs font-semibold text-[#EAF2FF] block">
                  Max Connection Frequency
                </label>
                <span className="text-[10px] text-[#91A6C4] block">Bursts / minute ceiling</span>
                <input
                  type="number"
                  value={thresholds.outbound_freq_per_min}
                  onChange={(e) => setThresholds({ ...thresholds, outbound_freq_per_min: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-[#08172A] border border-[#203651] rounded-lg px-3 py-2 text-xs font-mono text-[#EAF2FF] focus:outline-none focus:border-[#3B82F6]"
                />
                <span className="text-[10px] text-[#34D399] font-mono">Current: {thresholds.outbound_freq_per_min} req/min</span>
              </div>

              <div className="p-4 rounded-xl bg-[#10243D] border border-[#203651] space-y-2">
                <label className="text-xs font-semibold text-[#EAF2FF] block">
                  Failed Auth Limit
                </label>
                <span className="text-[10px] text-[#91A6C4] block">Max failures per 60s window</span>
                <input
                  type="number"
                  value={thresholds.failed_auth_limit}
                  onChange={(e) => setThresholds({ ...thresholds, failed_auth_limit: parseInt(e.target.value) || 0 })}
                  className="w-full bg-[#08172A] border border-[#203651] rounded-lg px-3 py-2 text-xs font-mono text-[#EAF2FF] focus:outline-none focus:border-[#3B82F6]"
                />
                <span className="text-[10px] text-[#34D399] font-mono">Current: {thresholds.failed_auth_limit} failures</span>
              </div>
            </div>
          </form>

          {/* Reset Demo Card */}
          <div className="p-5 rounded-2xl bg-[#0B1B30] border border-[#203651] shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-[#EAF2FF]">Restore Demonstration Baseline</h3>
              <p className="text-xs text-[#91A6C4] mt-0.5">
                Clears all simulated attacks, resets incidents, and returns the infrastructure topology to pristine baseline state.
              </p>
            </div>

            <button
              onClick={onResetDemo}
              disabled={isResetting}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10243D] hover:bg-[#132b49] border border-[#203651] text-[#EAF2FF] text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              <RotateCcw className={`w-4 h-4 ${isResetting ? 'animate-spin text-[#3B82F6]' : ''}`} />
              <span>{isResetting ? 'Resetting Baseline...' : 'Reset Demo Dataset'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
